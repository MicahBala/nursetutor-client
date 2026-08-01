import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, CheckCircle2, XCircle, Award, RotateCcw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ModuleStudy() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { dbUser, currentUser } = useAuth(); 
  
  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [userProgress, setUserProgress] = useState([]);

  // Quiz states
  const [answeredQuestions, setAnsweredQuestions] = useState({});
  const [score, setScore] = useState(null);
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchTopicData = async () => {
      try {
        setIsLoading(true);
        const allTopicsRes = await fetch('http://localhost:5000/api/topics');
        const allTopicsData = await allTopicsRes.json();
        setTopics(allTopicsData);

        const currentUserId = currentUser?.uid || dbUser?.firebaseUid || dbUser?._id || dbUser?.id;
        let fetchedProgress = [];
        
        if (currentUserId) {
          const progressRes = await fetch(`http://localhost:5000/api/progress/${currentUserId}`);
          if (progressRes.ok) {
            fetchedProgress = await progressRes.json();
            setUserProgress(fetchedProgress);
          }
        }

        setIsGenerating(true);
        const studyRes = await fetch(`http://localhost:5000/api/topics/${topicId}`);
        const studyData = await studyRes.json();
        
        if (studyRes.ok) {
          setTopics(prevTopics => 
            prevTopics.map(t => t.topicId === topicId ? studyData : t)
          );

          // ==========================================
          // REVIEW MODE LOGIC: Auto-fill previous answers
          // ==========================================
          const currentTopicProgress = fetchedProgress.find(p => p.topicId === topicId);
          
          if (currentTopicProgress && currentTopicProgress.lastAttemptAnswers?.length > 0) {
            const restoredAnswers = {};
            let attemptScore = 0;
            
            // Map the saved answers back to the UI state
            studyData.questions.forEach((q, index) => {
              const questionKey = q._id || index;
              const prevAnswer = currentTopicProgress.lastAttemptAnswers[index];
              
              if (prevAnswer && prevAnswer.selectedOption !== "No answer provided") {
                restoredAnswers[questionKey] = prevAnswer.selectedOption;
                if (prevAnswer.isCorrect) attemptScore += 1;
              }
            });
            
            setAnsweredQuestions(restoredAnswers);
            setScore(attemptScore);
            setIsQuizSubmitted(true);
          } else {
            // Fresh quiz state
            setAnsweredQuestions({});
            setScore(null);
            setIsQuizSubmitted(false);
          }

        } else {
          console.error("Backend returned an error:", studyData);
          alert("Failed to generate AI content. Check your backend terminal for details!");
        }
      } catch (error) {
        console.error("Error fetching study material:", error);
      } finally {
        setIsLoading(false);
        setIsGenerating(false);
      }
    };
    
    fetchTopicData();
  }, [topicId, currentUser, dbUser]);

  // NEW: Function to clear answers and retake the quiz
  const handleRetakeQuiz = () => {
    setAnsweredQuestions({});
    setScore(null);
    setIsQuizSubmitted(false);
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading content...</div>;
  }

  const subscribedTopics = topics.filter(topic => {
    if (topic.isFree) return true;
    const subscription = dbUser?.courseSubscriptions?.find(sub => sub.courseId === topic.topicId);
    if (!subscription) return false;
    const purchaseDate = new Date(subscription.purchasedAt);
    const differenceInDays = (new Date().getTime() - purchaseDate.getTime()) / (1000 * 3600 * 24);
    return differenceInDays <= 30; 
  });

  const activeTopic = topics.find(t => t.topicId === topicId);

  if (!activeTopic) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h2 className="text-2xl font-bold mb-4">Topic not found</h2>
        <button onClick={() => navigate('/dashboard')} className="text-blue-600 hover:underline font-medium">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const handleOptionClick = (questionId, selectedOption) => {
    if (!answeredQuestions[questionId] && !isQuizSubmitted) {
      setAnsweredQuestions(prev => ({
        ...prev,
        [questionId]: selectedOption
      }));
    }
  };

  const handleQuizSubmit = async () => {
    setIsSaving(true);
    let calculatedScore = 0;
    
    const detailedAnswers = activeTopic.questions.map((q, index) => {
        const questionKey = q._id || index;
        const studentAnswer = answeredQuestions[questionKey];
        
        const getCorrectOptionText = () => {
            if (q.correctAnswer === 'A') return q.optionA;
            if (q.correctAnswer === 'B') return q.optionB;
            if (q.correctAnswer === 'C') return q.optionC;
            if (q.correctAnswer === 'D') return q.optionD;
            return q.correctAnswer;
        };
        
        const correctOptionText = getCorrectOptionText();
        const isCorrect = studentAnswer === correctOptionText;
        
        if (isCorrect) calculatedScore += 1;

        return {
            questionText: q.questionText,
            selectedOption: studentAnswer || "No answer provided",
            correctAnswer: correctOptionText,
            isCorrect: isCorrect,
            rationale: q.rationale
        };
    });

    setScore(calculatedScore);
    setIsQuizSubmitted(true);

    try {
        const currentUserId = currentUser?.uid || dbUser?.firebaseUid || dbUser?._id || dbUser?.id;

        if (!currentUserId) {
            console.error("No logged-in user found. Cannot save progress.");
            setIsSaving(false);
            return;
        }

        const response = await fetch('http://localhost:5000/api/progress/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: currentUserId,
                topicId: activeTopic.topicId,
                score: calculatedScore,
                totalQuestions: activeTopic.questions.length,
                lastAttemptAnswers: detailedAnswers
            }),
        });

        if (!response.ok) {
            console.error("❌ Failed to save study progress to the database.");
        } else {
            console.log("✅ Progress saved successfully!");
            // Re-fetch progress to update the UI instantly
            const progressRes = await fetch(`http://localhost:5000/api/progress/${currentUserId}`);
            if (progressRes.ok) setUserProgress(await progressRes.json());
        }
    } catch (error) {
        console.error("❌ Network error while saving progress:", error);
    } finally {
        setIsSaving(false);
    }
  };

  const allQuestionsAnswered = activeTopic.questions && Object.keys(answeredQuestions).length === activeTopic.questions.length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer font-medium"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </button>
          </div>
          <h1 className="font-bold text-lg text-gray-900 truncate max-w-xs md:max-w-md">{activeTopic.topicName}</h1>
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto w-full flex flex-col md:flex-row">
        <aside className="w-full md:w-80 bg-white md:border-r border-b border-gray-200 md:min-h-[calc(100vh-64px)] flex-none">
          <div className="p-4 border-b border-gray-100 hidden md:block">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Your Active Topics</h2>
          </div>
          <nav className="p-2 flex md:flex-col overflow-x-auto hide-scrollbar gap-2">
            {subscribedTopics.map((topic) => {
              const isCompleted = userProgress.some(p => p.topicId === topic.topicId);

              return (
                <Link
                  key={topic.topicId}
                  to={`/study/${topic.topicId}`}
                  className={`flex-shrink-0 w-64 md:w-full text-left p-3 md:p-4 rounded-xl transition-all flex items-start justify-between gap-3 cursor-pointer ${
                    activeTopic.topicId === topic.topicId 
                      ? 'bg-blue-50 border border-blue-100 shadow-sm' 
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 ${activeTopic.topicId === topic.topicId ? 'text-blue-600' : 'text-gray-400'}`}>
                      <BookOpen size={18} />
                    </div>
                    <div>
                      <p className={`font-semibold text-sm leading-snug ${activeTopic.topicId === topic.topicId ? 'text-blue-900' : 'text-gray-700'}`}>
                        {topic.topicName}
                      </p>
                    </div>
                  </div>
                  {isCompleted && (
                    <CheckCircle2 size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
                  )}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 p-4 md:p-10 max-w-3xl pb-24">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Generating Study Guide...</h3>
              <p className="text-gray-500">Compiling NMCN guidelines and clinical scenarios.</p>
              <p className="text-xs text-gray-400 mt-2">This usually takes about 5 to 8 seconds.</p>
            </div>
          ) : (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 leading-tight">
                {activeTopic.topicName}
              </h2>

              <div className="prose prose-blue prose-lg max-w-none mb-16">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-3xl font-extrabold text-gray-900 mt-8 mb-4" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 border-b border-gray-200 pb-2" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3" {...props} />,
                    p: ({node, ...props}) => <p className="text-gray-700 text-lg leading-relaxed mb-6" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc list-outside pl-6 space-y-3 mb-6 text-gray-700 text-lg leading-relaxed" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal list-outside pl-6 space-y-3 mb-6 text-gray-700 text-lg leading-relaxed" {...props} />,
                    li: ({node, ...props}) => <li className="pl-1" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-bold text-gray-900" {...props} />,
                  }}
                >
                  {activeTopic.articleContent || "No content generated yet."}
                </ReactMarkdown>
              </div>

              {activeTopic.questions && activeTopic.questions.length > 0 && (
                <div className="border-t border-gray-200 pt-12">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900">Check Your Understanding</h3>
                    {isQuizSubmitted && (
                       <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide flex items-center gap-1">
                         <CheckCircle2 size={14} /> Review Mode
                       </span>
                    )}
                  </div>
                  
                  <div className="space-y-10">
                    {activeTopic.questions.map((q, index) => {
                      const questionKey = q._id || index;
                      const selectedAnswer = answeredQuestions[questionKey];
                      const isAnswered = !!selectedAnswer;

                      const optionsList = [q.optionA, q.optionB, q.optionC, q.optionD];
                      
                      const getCorrectOptionText = () => {
                          if (q.correctAnswer === 'A') return q.optionA;
                          if (q.correctAnswer === 'B') return q.optionB;
                          if (q.correctAnswer === 'C') return q.optionC;
                          if (q.correctAnswer === 'D') return q.optionD;
                          return q.correctAnswer; 
                      };
                      
                      const correctOptionText = getCorrectOptionText();

                      return (
                        <div key={questionKey} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                          <p className="text-lg font-bold text-gray-900 mb-6">
                            <span className="text-blue-600 mr-2">{index + 1}.</span> 
                            {q.questionText}
                          </p>
                          
                          <div className="space-y-3">
                            {optionsList.map((option, optIdx) => {
                              const isThisOptionSelected = selectedAnswer === option;
                              const isThisOptionCorrect = option === correctOptionText;
                              
                              let optionStyle = "border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer";
                              
                              if (isQuizSubmitted || isAnswered) {
                                if (isThisOptionCorrect) {
                                  optionStyle = "border-green-500 bg-green-50 text-green-900 font-medium";
                                } else if (isThisOptionSelected) {
                                  optionStyle = "border-red-500 bg-red-50 text-red-900 font-medium";
                                } else {
                                  optionStyle = "border-gray-100 text-gray-400 cursor-default";
                                }
                              }

                              return (
                                <div 
                                  key={optIdx}
                                  onClick={() => handleOptionClick(questionKey, option)}
                                  className={`p-4 border-2 rounded-xl transition-all flex items-center justify-between ${optionStyle}`}
                                >
                                  <span>{option}</span>
                                  {(isQuizSubmitted || isAnswered) && isThisOptionCorrect && <CheckCircle2 className="text-green-500 flex-shrink-0 ml-2" size={20} />}
                                  {(isQuizSubmitted || isAnswered) && isThisOptionSelected && !isThisOptionCorrect && <XCircle className="text-red-500 flex-shrink-0 ml-2" size={20} />}
                                </div>
                              );
                            })}
                          </div>

                          {(isQuizSubmitted || isAnswered) && (
                            <div className={`mt-6 p-5 rounded-xl border animate-in slide-in-from-top-2 duration-300 ${
                              selectedAnswer === correctOptionText ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'
                            }`}>
                              <p className="font-bold mb-1 text-sm uppercase tracking-wider text-gray-700">Rationale</p>
                              <p className="text-gray-800 leading-relaxed">{q.rationale}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Submit Button & Results Section */}
                  <div className="mt-12 pt-8 border-t border-gray-200">
                    {!isQuizSubmitted ? (
                      <button
                        onClick={handleQuizSubmit}
                        disabled={!allQuestionsAnswered || isSaving}
                        className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                          allQuestionsAnswered
                            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {isSaving ? 'Saving Progress...' : 'Submit Quiz & Save Progress'}
                      </button>
                    ) : (
                      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 text-center animate-in zoom-in duration-300">
                        <Award className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Module Completed!</h3>
                        <p className="text-gray-600 text-lg mb-8">
                          On this attempt, you scored <span className="font-bold text-blue-700">{score} out of {activeTopic.questions.length}</span> correct.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                          <button
                            onClick={() => navigate('/dashboard')}
                            className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
                          >
                            Return to Dashboard
                          </button>
                          
                          {/* NEW: Retake Quiz Button */}
                          <button
                            onClick={handleRetakeQuiz}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors"
                          >
                            <RotateCcw size={18} />
                            Retake Quiz
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}