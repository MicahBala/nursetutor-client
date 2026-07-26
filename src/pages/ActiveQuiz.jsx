import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // <-- NEW: Import useAuth
import { Clock, ChevronLeft, ChevronRight, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function ActiveQuiz() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth(); // <-- NEW: Grab the logged-in user
  
  const selectedTopicIds = location.state?.selectedTopics || [];

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0); 
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // <-- NEW: Loading state for submission

  useEffect(() => {
    if (selectedTopicIds.length === 0) {
      navigate('/quiz-setup');
      return;
    }

    const fetchExamData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/topics');
        const allTopics = await response.json();

        let examQuestions = [];
        
        allTopics.forEach(topic => {
          if (selectedTopicIds.includes(topic.topicId)) {
            if (topic.questions && topic.questions.length > 0) {
              const taggedQuestions = topic.questions.map(q => ({
                ...q,
                topicTitle: topic.title,
                tags: topic.tags
              }));
              examQuestions = [...examQuestions, ...taggedQuestions];
            }
          }
        });

        if (examQuestions.length === 0) {
          setError("We are still adding questions to the topics you selected. Please go back and select different topics for now.");
          setIsLoading(false);
          return;
        }

        examQuestions = examQuestions.sort(() => 0.5 - Math.random());
        setQuestions(examQuestions);
        setTimeLeft(examQuestions.length * 60); 
      } catch (err) {
        console.error("Failed to load exam data:", err);
        setError("Failed to connect to the database. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchExamData();
  }, [selectedTopicIds, navigate]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timerId = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timerId);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSelectOption = (option) => {
    setAnswers(prev => ({ ...prev, [currentIndex]: option }));
  };

  // NEW: The async submission function
  const handleSubmitExam = async () => {
    if (!window.confirm("Are you sure you want to submit your exam?")) return;

    setIsSubmitting(true);

    try {
      // 1. Calculate the scores before sending
      let correctCount = 0;
      const topicStats = {};

      questions.forEach((q, index) => {
        const isCorrect = answers[index] === q.correctAnswer;
        if (isCorrect) correctCount++;

        // Track stats per topic
        if (!topicStats[q.topicTitle]) {
          topicStats[q.topicTitle] = { total: 0, correct: 0 };
        }
        topicStats[q.topicTitle].total += 1;
        if (isCorrect) {
          topicStats[q.topicTitle].correct += 1;
        }
      });

      const overallScore = Math.round((correctCount / questions.length) * 100);
      
      const topicBreakdown = Object.entries(topicStats).map(([title, stats]) => ({
        topicTitle: title,
        correct: stats.correct,
        total: stats.total,
        percentage: Math.round((stats.correct / stats.total) * 100)
      }));

      // 2. Send the payload to the database
      if (currentUser) {
        await fetch('http://localhost:5000/api/results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.uid,
            overallScore,
            totalCorrect: correctCount,
            totalQuestions: questions.length,
            topicBreakdown
          })
        });
      }

      // 3. Navigate to Results page immediately after successful save
      navigate('/quiz-results', { 
        state: { questions, userAnswers: answers } 
      });

    } catch (error) {
      console.error("Error saving exam result:", error);
      alert("There was an issue saving your result to your history, but we will still show your scores now.");
      // Fallback: still show them their results even if the database save failed
      navigate('/quiz-results', { 
        state: { questions, userAnswers: answers } 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ... (Error and Loading UI remain the same)
  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 font-medium text-lg">Fetching your exam from the database...</div>;
  if (error) return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
        <AlertCircle size={48} className="text-amber-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Notice</h2>
        <p className="text-gray-600 mb-6 max-w-md">{error}</p>
        <button onClick={() => navigate('/quiz-setup')} className="bg-gray-900 text-white px-6 py-3 rounded-lg font-bold">Go Back</button>
      </div>
  );

  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Exam Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="font-bold text-gray-700">
            Question {currentIndex + 1} of {questions.length}
          </div>
          <div className={`flex items-center gap-2 font-mono text-lg font-bold px-4 py-1 rounded-full ${timeLeft < 60 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-blue-50 text-blue-700'}`}>
            <Clock size={20} />
            {formatTime(timeLeft)}
          </div>
        </div>
        <div className="w-full bg-gray-200 h-1">
          <div className="bg-blue-600 h-1 transition-all duration-300" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}></div>
        </div>
      </header>

      {/* Main Question Area */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8">
        <div className="bg-white p-6 md:p-10 rounded-2xl border border-gray-200 shadow-sm">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-8 leading-relaxed">
            {currentQuestion.questionText}
          </h2>

          <div className="space-y-4">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = answers[currentIndex] === option;
              
              return (
                <div 
                  key={idx}
                  onClick={() => handleSelectOption(option)}
                  className={`p-4 md:p-5 border-2 rounded-xl cursor-pointer transition-all flex items-center gap-4 ${
                    isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-blue-500' : 'border-gray-300'}`}>
                    {isSelected && <div className="w-3 h-3 bg-blue-500 rounded-full"></div>}
                  </div>
                  <span className={`text-lg ${isSelected ? 'text-blue-900 font-medium' : 'text-gray-700'}`}>
                    {option}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="mt-8 flex justify-between items-center">
          <button 
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0 || isSubmitting}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={20} /> Previous
          </button>

          {currentIndex === questions.length - 1 ? (
            <button 
              onClick={handleSubmitExam}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400 shadow-md transition-all"
            >
              {/* NEW: Show a spinner while submitting */}
              {isSubmitting ? (
                <><Loader2 className="animate-spin" size={20} /> Saving...</>
              ) : (
                <><CheckCircle size={20} /> Submit Exam</>
              )}
            </button>
          ) : (
            <button 
              onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white bg-gray-900 hover:bg-gray-800 shadow-md transition-colors"
            >
              Next <ChevronRight size={20} />
            </button>
          )}
        </div>
      </main>
    </div>
  );
}