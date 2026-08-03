import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Shield, CreditCard, Lock, Unlock, Search, Tag, TrendingUp, Calendar, Award, CheckCircle2, Play } from 'lucide-react';

export default function Dashboard() {
  const { currentUser, dbUser, logout } = useAuth(); 
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  
  const [topics, setTopics] = useState([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(true);

  // State to hold study module progress
  const [userProgress, setUserProgress] = useState([]);

  // Tab and Progress states
  const [activeTab, setActiveTab] = useState('library'); // 'library' | 'progress'
  const [examHistory, setExamHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // 1. Fetch all topics (with Auth Token & Array Guard)
  useEffect(() => {
    const fetchTopics = async () => {
      if (!currentUser) return;
      
      try {
        const token = await currentUser.getIdToken();
        const response = await fetch('http://localhost:5000/api/topics', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();

        if (response.ok && Array.isArray(data)) {
          setTopics(data);
        } else {
          console.error("Failed to load topics array:", data);
          setTopics([]); // Fallback to empty array to prevent filter crashes
        }
      } catch (error) {
        console.error("Error fetching topics:", error);
        setTopics([]);
      } finally {
        setIsLoadingTopics(false);
      }
    };

    fetchTopics();
  }, [currentUser]);

  // 2. Fetch topic study progress (with Auth Token & Array Guard)
  useEffect(() => {
    const fetchProgress = async () => {
      const currentUserId = currentUser?.uid || dbUser?.firebaseUid;
      if (!currentUserId || !currentUser) return;

      try {
        const token = await currentUser.getIdToken();
        const res = await fetch(`http://localhost:5000/api/progress/${currentUserId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setUserProgress(data);
          } else {
            setUserProgress([]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch user progress:", error);
        setUserProgress([]);
      }
    };
    
    fetchProgress();
  }, [currentUser, dbUser]);

  // 3. Fetch exam history when user switches to 'progress' tab (with Auth Token & Array Guard)
  useEffect(() => {
    if (activeTab === 'progress' && currentUser) {
      const fetchHistory = async () => {
        setIsLoadingHistory(true);
        try {
          const token = await currentUser.getIdToken();
          const res = await fetch(`http://localhost:5000/api/results/${currentUser.uid}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await res.json();
          if (res.ok && Array.isArray(data)) {
            setExamHistory(data.sort((a, b) => new Date(b.completedAt || b.createdAt) - new Date(a.completedAt || a.createdAt)));
          } else {
             setExamHistory([]);
          }
        } catch (error) {
          console.error("Failed to fetch exam history", error);
          setExamHistory([]);
        } finally {
          setIsLoadingHistory(false);
        }
      };
      fetchHistory();
    }
  }, [activeTab, currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  if (!dbUser) return <div className="p-8 text-center mt-20">Loading your profile...</div>;

  // Helper function to check if user owns a topic AND it hasn't expired
  const isTopicUnlocked = (topic) => {
    // 1. Is it a universally free topic?
    if (topic.isFree) return true;
    
    const now = new Date();

    // 2. Check the new Admin-provisioned unlockedTopics array (Marketing/Free Access)
    const hasAdminAccess = dbUser?.unlockedTopics?.some(t => {
      // Allow matching against either custom topicId or standard MongoDB _id
      const matchesTopic = t.topicId === topic.topicId || t.topicId === topic._id;
      return matchesTopic && new Date(t.expiresAt) > now;
    });

    if (hasAdminAccess) return true;

    // 3. Check the standard automated courseSubscriptions array (Paid Access)
    const subscriptions = dbUser?.courseSubscriptions?.filter(sub => sub.courseId === topic.topicId) || [];
    if (subscriptions.length > 0) {
      const latestSub = subscriptions[subscriptions.length - 1];
      if (now < new Date(latestSub.expiresAt)) return true;
    }

    return false; 
  };

  const filteredTopics = topics.filter(topic => {
    const query = searchQuery.toLowerCase();
    const titleMatch = (topic.topicName || "").toLowerCase().includes(query);
    const tagMatch = topic.tags?.some(tag => tag.toLowerCase().includes(query));
    return titleMatch || tagMatch;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {currentUser?.displayName?.split(' ')[0]}!</h1>
            <p className="text-gray-500 mt-1">Which topic are we conquering today?</p>
          </div>
          
          <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
            <img src={currentUser?.photoURL} alt="Profile" className="w-10 h-10 rounded-full" />
            <button onClick={handleLogout} className="text-sm font-semibold text-red-600 hover:text-red-700">
              Log Out
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div 
            onClick={() => navigate('/quiz-setup')}
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 cursor-pointer hover:shadow-md hover:border-blue-200 transition-all"
          >
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Mock Exam Credits</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-gray-900">{dbUser.mockExamCredits}</p>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">Take Exam ➔</span>
              </div>
            </div>
          </div>

          {/* Overall Progress Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-50 text-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp size={16} />
                </div>
                <p className="text-sm text-gray-500 font-medium">Course Progress</p>
              </div>
              <p className="text-sm font-bold text-gray-900">
                {userProgress.length} / {topics.filter(t => isTopicUnlocked(t)).length}
              </p>
            </div>
            
            <div className="w-full bg-gray-100 rounded-full h-2.5 mt-2">
              <div 
                className="bg-green-500 h-2.5 rounded-full transition-all duration-1000 ease-out" 
                style={{ 
                  width: `${topics.filter(t => isTopicUnlocked(t)).length > 0 
                    ? Math.round((userProgress.length / topics.filter(t => isTopicUnlocked(t)).length) * 100) 
                    : 0}%` 
                }}
              ></div>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-right">
              {topics.filter(t => isTopicUnlocked(t)).length > 0 
                ? Math.round((userProgress.length / topics.filter(t => isTopicUnlocked(t)).length) * 100) 
                : 0}% Completed
            </p>
          </div>

          <div onClick={() => navigate('/subscription')} className="bg-blue-600 hover:bg-blue-700 cursor-pointer p-6 rounded-2xl shadow-md text-white flex items-center justify-between transition-colors">
            <div>
              <p className="text-blue-100 font-medium text-sm mb-1">Exam approaching?</p>
              <p className="text-lg font-bold">Get Exam Pass</p>
            </div>
            <CreditCard size={28} className="opacity-80 flex-shrink-0" />
          </div>
        </div>

        {/* Tabbed Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-200/60 p-1 rounded-xl flex gap-1 items-center">
            <button
              onClick={() => setActiveTab('library')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                activeTab === 'library'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/80 cursor-pointer'
              }`} 
            >
              <BookOpen size={18}/>
              Topic Library
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                activeTab === 'progress'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/80 cursor-pointer'
              }`}
            >
              <TrendingUp size={18} />
              My Progress
            </button>
          </div>
        </div>

        {activeTab === 'library' ? (
          <>
            <div className="mb-8 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-11 pr-4 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Search for a topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {isLoadingTopics ? (
              <div className="text-center py-12 text-gray-500">Loading topics from database...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTopics.length > 0 ? (
                  filteredTopics.map((topic) => {
                    const unlocked = isTopicUnlocked(topic); 
                    const progressRecord = userProgress.find(p => p.topicId === topic.topicId);
                    const isCompleted = !!progressRecord;
                    
                    return (
                      <div key={topic.topicId} className={`bg-white rounded-2xl border ${isCompleted ? 'border-green-300' : 'border-gray-200'} shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow`}>
                        <div className="p-6 flex-1">
                          
                          <div className="flex justify-between items-start mb-4">
                            <div className={`p-2 rounded-lg ${isCompleted ? 'bg-green-100 text-green-600' : unlocked ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                              {unlocked ? <Unlock size={20} /> : <Lock size={20} />}
                            </div>
                            
                            <div className="flex gap-2 items-center">
                              {isCompleted && (
                                <span className="flex items-center gap-1 bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full tracking-wide">
                                  <CheckCircle2 size={14} />
                                  {progressRecord.highestScore}/{progressRecord.totalQuestions}
                                </span>
                              )}
                              {!isCompleted && topic.isFree && (
                                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide">Free</span>
                              )}
                              {!isCompleted && !topic.isFree && unlocked && (
                                <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide">Unlocked</span>
                              )}
                            </div>
                          </div>
                          
                          <h3 className="font-bold text-lg text-gray-900 mb-2">{topic.topicName}</h3>
                          <p className="text-gray-500 text-sm mb-4 font-medium uppercase tracking-wider">{topic.courseName}</p>
                          
                          <div className="flex flex-wrap gap-2 mt-auto">
                            {topic.tags?.map((tag, idx) => (
                              <span key={idx} className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-md">
                                <Tag size={12} />
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className={`p-4 border-t mt-auto ${isCompleted ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100'}`}>
                          {unlocked ? (
                            <button 
                              onClick={() => navigate(`/study/${topic.topicId}`)}
                              className={`w-full font-semibold py-2 rounded-lg transition-colors cursor-pointer ${
                                isCompleted ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
                              }`}
                            >
                              {isCompleted ? 'Review Module' : 'Start Studying'}
                            </button>
                          ) : (
                            <button 
                              onClick={() => navigate('/subscription', { 
                                state: { 
                                  topicId: topic.topicId, 
                                  title: topic.topicName,
                                  price: topic.price,
                                  type: 'topic'
                                } 
                              })}
                              className="w-full bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 font-semibold py-2 rounded-lg transition-colors cursor-pointer"
                            >
                              Unlock for ₦{topic.price}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-200 border-dashed">
                    <p className="text-lg font-medium text-gray-900 mb-1">No topics found</p>
                    <p>We couldn't find any topics matching "{searchQuery}"</p>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Your Exam History</h2>
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                {examHistory.length} Exams Logged
              </span>
            </div>
            
            {isLoadingHistory ? (
              <div className="text-center py-12 text-gray-500">Loading your history...</div>
            ) : examHistory.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {examHistory.map((exam) => {
                  const isCompleted = exam.status === 'completed';
                  const targetRoute = isCompleted ? `/exam-results/${exam._id}` : `/exam/${exam._id}`;
                  const scorePercentage = exam.totalQuestions ? Math.round((exam.overallScore / exam.totalQuestions) * 100) : 0;
                  const dateDisplay = exam.completedAt 
                    ? new Date(exam.completedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) 
                    : exam.createdAt 
                      ? new Date(exam.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                      : 'Unknown Date';

                  return (
                    <div 
                      key={exam._id} 
                      onClick={() => navigate(targetRoute)}
                      className="bg-white flex flex-col p-6 rounded-2xl border border-gray-200 shadow-sm cursor-pointer hover:shadow-md hover:border-blue-400 hover:bg-blue-50/30 transition-all h-full group"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                          <Calendar size={16} />
                          {dateDisplay}
                        </div>
                        
                        {isCompleted ? (
                          <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1 ${
                            scorePercentage >= 50 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            <Award size={14} />
                            {scorePercentage}% Score
                          </div>
                        ) : (
                          <div className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1 bg-amber-100 text-amber-700">
                            <Play size={14} fill="currentColor" />
                            In Progress
                          </div>
                        )}
                      </div>
                      
                      <h3 className="font-bold text-gray-900 mb-1">{exam.examTitle || "Mock Exam"}</h3>
                      {isCompleted ? (
                        <p className="text-gray-500 text-sm mb-4">
                          {exam.overallScore} out of {exam.totalQuestions} answered correctly
                        </p>
                      ) : (
                        <p className="text-amber-600 text-sm mb-4 font-medium">
                          You paused this exam. Click to resume.
                        </p>
                      )}
                      
                      <div className="mt-auto pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-400 uppercase font-bold mb-2 tracking-wider">Topics Covered</p>
                        <div className="flex flex-wrap gap-2">
                          {exam.topicBreakdown?.map((t, i) => (
                            <span key={i} className="bg-gray-50 text-gray-600 border border-gray-200 text-xs px-2.5 py-1 rounded-md font-medium">
                              {t.topicName}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Clickable Action Footer */}
                      <div className="mt-5 pt-4 border-t border-gray-100 text-sm font-bold text-blue-600 flex items-center justify-between group-hover:text-blue-700">
                        <span>{isCompleted ? 'Review Questions' : 'Resume Exam Now'}</span>
                        <span className="transform group-hover:translate-x-1 transition-transform">➔</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-200 border-dashed">
                <p className="text-lg font-medium text-gray-900 mb-1">No history yet</p>
                <p>You haven't taken any mock exams. Go set one up to see your progress here!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}