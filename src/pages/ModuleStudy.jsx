import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function ModuleStudy() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { dbUser } = useAuth();
  
  const [answeredQuestions, setAnsweredQuestions] = useState({});
  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch topics from MongoDB
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/topics');
        const data = await response.json();
        setTopics(data);
      } catch (error) {
        console.error("Error fetching topics:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTopics();
  }, []);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading content...</div>;
  }

  // 1. Figure out which topics the user has access to (for the sidebar)
  const subscribedTopics = topics.filter(topic => {
    if (topic.isFree) return true;
    
    const subscription = dbUser?.courseSubscriptions?.find(sub => sub.courseId === topic.topicId);
    if (!subscription) return false;

    const purchaseDate = new Date(subscription.purchasedAt);
    const differenceInDays = (new Date().getTime() - purchaseDate.getTime()) / (1000 * 3600 * 24);
    
    return differenceInDays <= 30; // Only show in sidebar if active
  });

  // 2. Find the current topic they are viewing
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
    if (!answeredQuestions[questionId]) {
      setAnsweredQuestions(prev => ({
        ...prev,
        [questionId]: selectedOption
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
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
          <h1 className="font-bold text-lg text-gray-900 truncate max-w-xs md:max-w-md">{activeTopic.title}</h1>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 max-w-7xl mx-auto w-full flex flex-col md:flex-row">
        
        {/* Sidebar / Top Navigation */}
        <aside className="w-full md:w-80 bg-white md:border-r border-b border-gray-200 md:min-h-[calc(100vh-64px)] flex-none">
          <div className="p-4 border-b border-gray-100 hidden md:block">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Your Active Topics</h2>
          </div>
          
          <nav className="p-2 flex md:flex-col overflow-x-auto hide-scrollbar gap-2">
            {subscribedTopics.map((topic) => (
              <Link
                key={topic.topicId}
                to={`/study/${topic.topicId}`}
                className={`flex-shrink-0 w-64 md:w-full text-left p-3 md:p-4 rounded-xl transition-all flex items-start gap-3 cursor-pointer ${
                  activeTopic.topicId === topic.topicId 
                    ? 'bg-blue-50 border border-blue-100 shadow-sm' 
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
              >
                <div className={`mt-0.5 ${activeTopic.topicId === topic.topicId ? 'text-blue-600' : 'text-gray-400'}`}>
                  <BookOpen size={18} />
                </div>
                <div>
                  <p className={`font-semibold text-sm leading-snug ${activeTopic.topicId === topic.topicId ? 'text-blue-900' : 'text-gray-700'}`}>
                    {topic.title}
                  </p>
                </div>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Reading Area */}
        <main className="flex-1 p-4 md:p-10 max-w-3xl pb-24">
          <div className="animate-in fade-in duration-300">
            
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 leading-tight">
              {activeTopic.title}
            </h2>

            {/* The Paragraphs */}
            <div className="space-y-8 mb-12">
              {activeTopic.content?.comprehensiveReview?.map((section, idx) => (
                <div key={idx}>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{section.subheading}</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">{section.paragraphText}</p>
                </div>
              ))}
            </div>

            {/* The Exam Catch */}
            {activeTopic.content?.theCatch && (
              <div className="bg-amber-50 border-l-4 border-amber-500 rounded-r-xl p-6 md:p-8 mb-16 shadow-sm">
                <div className="flex items-center gap-3 mb-3 text-amber-800">
                  <AlertTriangle size={24} />
                  <h3 className="font-bold text-lg">Exam Catch</h3>
                </div>
                <p className="text-amber-900 text-lg font-medium italic leading-relaxed">
                  "{activeTopic.content.theCatch}"
                </p>
              </div>
            )}

            {/* Check Your Understanding (Mini-Quiz) */}
            {activeTopic.questions && activeTopic.questions.length > 0 && (
              <div className="border-t border-gray-200 pt-12">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Check Your Understanding</h3>
                
                <div className="space-y-10">
                  {activeTopic.questions.map((q, index) => {
                    // Because MongoDB generated _id for questions, we use q._id
                    const selectedAnswer = answeredQuestions[q._id];
                    const isAnswered = !!selectedAnswer;

                    return (
                      <div key={q._id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <p className="text-lg font-bold text-gray-900 mb-6">
                          <span className="text-blue-600 mr-2">{index + 1}.</span> 
                          {q.questionText}
                        </p>
                        
                        <div className="space-y-3">
                          {q.options.map((option, optIdx) => {
                            const isThisOptionSelected = selectedAnswer === option;
                            const isThisOptionCorrect = option === q.correctAnswer;
                            
                            let optionStyle = "border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer";
                            if (isAnswered) {
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
                                onClick={() => handleOptionClick(q._id, option)}
                                className={`p-4 border-2 rounded-xl transition-all flex items-center justify-between ${optionStyle}`}
                              >
                                <span>{option}</span>
                                {isAnswered && isThisOptionCorrect && <CheckCircle2 className="text-green-500 flex-shrink-0 ml-2" size={20} />}
                                {isAnswered && isThisOptionSelected && !isThisOptionCorrect && <XCircle className="text-red-500 flex-shrink-0 ml-2" size={20} />}
                              </div>
                            );
                          })}
                        </div>

                        {/* Rationale Dropdown */}
                        {isAnswered && (
                          <div className={`mt-6 p-5 rounded-xl border animate-in slide-in-from-top-2 duration-300 ${
                            selectedAnswer === q.correctAnswer ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'
                          }`}>
                            <p className="font-bold mb-1 text-sm uppercase tracking-wider text-gray-700">Rationale</p>
                            <p className="text-gray-800 leading-relaxed">{q.rationale}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}