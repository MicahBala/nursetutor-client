import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Shield, CreditCard, Lock, Unlock, Search, Tag, TrendingUp, Calendar, Award } from 'lucide-react';

export default function Dashboard() {
  const { currentUser, dbUser, logout } = useAuth(); 
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  
  const [topics, setTopics] = useState([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(true);

  // NEW: Tab and Progress states
  const [activeTab, setActiveTab] = useState('library'); // 'library' | 'progress'
  const [examHistory, setExamHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/topics');
        const data = await response.json();
        setTopics(data);
      } catch (error) {
        console.error("Error fetching topics:", error);
      } finally {
        setIsLoadingTopics(false);
      }
    };
    fetchTopics();
  }, []);

  // NEW: Fetch exam history when user switches to 'progress' tab
  useEffect(() => {
    if (activeTab === 'progress' && examHistory.length === 0 && currentUser) {
      const fetchHistory = async () => {
        setIsLoadingHistory(true);
        try {
          const res = await fetch(`http://localhost:5000/api/results/${currentUser.uid}`);
          const data = await res.json();
          setExamHistory(data);
        } catch (error) {
          console.error("Failed to fetch exam history", error);
        } finally {
          setIsLoadingHistory(false);
        }
      };
      fetchHistory();
    }
  }, [activeTab, currentUser, examHistory.length]);

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
    if (topic.isFree) return true;
    
    // Find the MOST RECENT subscription for this topic 
    // (in case they bought it, let it expire, and bought it again)
    const subscriptions = dbUser.courseSubscriptions?.filter(sub => sub.courseId === topic.topicId) || [];
    
    if (subscriptions.length === 0) return false; // Never bought it

    // Get the latest purchase
    const latestSub = subscriptions[subscriptions.length - 1];

    // Check if the current time is BEFORE the expiration time
    const now = new Date();
    const expiry = new Date(latestSub.expiresAt);

    return now < expiry; // Returns true if it is still active, false if locked!
  };


// Count how many paid topics are currently active using our helper function
  const activeSubscriptionsCount = topics.filter(topic => !topic.isFree && isTopicUnlocked(topic)).length;

  // Filter logic applied to our fetched topics
  const filteredTopics = topics.filter(topic => {
    const query = searchQuery.toLowerCase();
    const titleMatch = topic.title.toLowerCase().includes(query);
    const tagMatch = topic.tags.some(tag => tag.toLowerCase().includes(query));
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
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
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

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
              <BookOpen size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Unlocked Topics</p>
              <p className="text-2xl font-bold text-gray-900">
                {activeSubscriptionsCount}
              </p>
            </div>
          </div>

          <div onClick={() => navigate('/subscription')} className="bg-blue-600 hover:bg-blue-700 cursor-pointer p-6 rounded-2xl shadow-md text-white flex items-center justify-between transition-colors">
            <div>
              <p className="text-blue-100 font-medium text-sm mb-1">Exam approaching?</p>
              <p className="text-lg font-bold">Get Exam Pass</p>
            </div>
            <CreditCard size={28} className="opacity-80" />
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
            {/* Search Bar Section */}
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

        {/* Dynamic Topic Library Section */}
        {isLoadingTopics ? (
          <div className="text-center py-12 text-gray-500">Loading topics from database...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTopics.length > 0 ? (
              filteredTopics.map((topic) => {
                const unlocked = isTopicUnlocked(topic); 
                
                return (
                  <div key={topic.topicId} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                    <div className="p-6 flex-1">
                      
                      <div className="flex justify-between items-start mb-4">
                        <div className={`p-2 rounded-lg ${unlocked ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                          {unlocked ? <Unlock size={20} /> : <Lock size={20} />}
                        </div>
                        {topic.isFree ? (
                          <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide">Free</span>
                        ) : unlocked ? (
                          <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide">Unlocked</span>
                        ) : null}
                      </div>
                      
                      <h3 className="font-bold text-lg text-gray-900 mb-2">{topic.title}</h3>
                      <p className="text-gray-500 text-sm line-clamp-2 mb-4">{topic.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mt-auto">
                        {topic.tags.map((tag, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-md">
                            <Tag size={12} />
                            {tag}
                          </span>
                        ))}
                      </div>

                    </div>
                    
                    <div className="p-4 bg-gray-50 border-t border-gray-100 mt-auto">
                      {unlocked ? (
                        <button 
                          onClick={() => navigate(`/study/${topic.topicId}`)}
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition-colors cursor-pointer"
                        >
                          Start Studying
                        </button>
                      ) : (
                        <button 
                          onClick={() => navigate('/subscription', { 
                            state: { 
                              topicId: topic.topicId, 
                              title: topic.title, 
                              price: topic.price,
                              type: 'topic' // Tells the page we are buying a topic, not exam credits
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
              <h2 className="text-2xl font-bold text-gray-900">Your Past Exams</h2>
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                {examHistory.length} Exams Completed
              </span>
            </div>
            
            {isLoadingHistory ? (
              <div className="text-center py-12 text-gray-500">Loading your history...</div>
            ) : examHistory.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {examHistory.map((exam) => (
                  <div key={exam._id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <Calendar size={16} />
                        {new Date(exam.takenAt).toLocaleDateString(undefined, {
                          year: 'numeric', month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1 ${
                        exam.overallScore >= 70 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        <Award size={14} />
                        {exam.overallScore}% Score
                      </div>
                    </div>
                    
                    <p className="font-semibold text-gray-900 mb-2">
                      {exam.totalCorrect} out of {exam.totalQuestions} correct
                    </p>
                    
                    {/* Tiny breakdown of topics covered */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-400 uppercase font-bold mb-2 tracking-wider">Topics Covered</p>
                      <div className="flex flex-wrap gap-2">
                        {exam.topicBreakdown.map((t, i) => (
                          <span key={i} className="bg-gray-50 text-gray-600 border border-gray-100 text-xs px-2 py-1 rounded-md">
                            {t.topicTitle} <span className="font-semibold">({t.percentage}%)</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
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