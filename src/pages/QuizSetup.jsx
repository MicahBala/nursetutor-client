import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield, CheckSquare, Square, PlayCircle, AlertCircle, ArrowLeft, Clock } from 'lucide-react';

export default function QuizSetup() {
  const { dbUser, currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [availableTopics, setAvailableTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // NEW: State for active exam
  const [activeExam, setActiveExam] = useState(null);
  const currentUserId = currentUser?.uid || dbUser?.firebaseUid || dbUser?._id || dbUser?.id;

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // 1. Check if user has an active exam FIRST
        if (currentUserId) {
          const activeRes = await fetch(`http://localhost:5000/api/mock-exams/active/${currentUserId}`);
          const activeData = await activeRes.json();
          if (activeData.activeExam) {
            setActiveExam(activeData.activeExam);
            setIsLoading(false);
            return; // Stop here, don't load topics!
          }
        }

        // 2. If no active exam, fetch topics
        const response = await fetch('http://localhost:5000/api/topics');
        const data = await response.json();
        setAvailableTopics(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, [currentUserId]);

  const toggleTopic = (topicId) => {
    setErrorMessage('');
    setSelectedTopics(prev => {
      if (prev.includes(topicId)) return prev.filter(id => id !== topicId);
      if (prev.length >= 5) return prev;
      return [...prev, topicId];
    });
  };

  const handleStartExam = async (isResume = false) => {
    // If resuming, just jump straight to the room
    if (isResume && activeExam) {
      navigate(`/exam/${activeExam._id}`);
      return;
    }

    if (selectedTopics.length === 0) return;
    
    if (dbUser.mockExamCredits < 1) {
      setErrorMessage("You don't have enough Exam Credits. Please purchase more.");
      return;
    }

    setIsStarting(true);
    setErrorMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/mock-exams/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUserId,
          selectedTopicIds: selectedTopics,
          examTitle: "NMCN Comprehensive Mock Exam",
          cheatMode: false
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to start exam');
      
      navigate(`/exam/${data.exam._id}`);
    } catch (error) {
      setErrorMessage(error.message);
      setIsStarting(false);
    }
  };

  if (!dbUser) return <div className="p-8 text-center mt-20">Loading profile...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Mock Exam Center</h1>
            <p className="text-gray-600">Configure your professional testing environment.</p>
          </div>
          <button onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-gray-900 font-medium">Cancel</button>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700">
            <AlertCircle size={20} className="flex-shrink-0" />
            <p className="text-sm font-medium">{errorMessage}</p>
          </div>
        )}

        {/* IF USER HAS AN ACTIVE EXAM - SHOW THIS AND HIDE TOPICS */}
        {activeExam ? (
          <div className="bg-white rounded-2xl border-2 border-amber-200 shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Exam in Progress</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              You have an ongoing Mock Exam. You must complete or submit this exam before starting a new one.
            </p>
            <button 
              onClick={() => handleStartExam(true)}
              className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all"
            >
              Resume Ongoing Exam
            </button>
          </div>
        ) : (
          /* OTHERWISE SHOW THE NORMAL TOPIC SETUP */
          <>
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${dbUser.mockExamCredits > 0 ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
                  <Shield size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Available Credits</p>
                  <p className={`text-2xl font-bold ${dbUser.mockExamCredits > 0 ? 'text-gray-900' : 'text-red-600'}`}>
                    {dbUser.mockExamCredits} <span className="text-sm font-normal text-gray-500">attempts remaining</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-8">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h2 className="font-bold text-gray-900">Select Topics</h2>
                <span className={`text-sm font-bold px-3 py-1 rounded-full ${selectedTopics.length === 5 ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                  {selectedTopics.length} / 5 Selected
                </span>
              </div>
              
              <div className="p-2 max-h-96 overflow-y-auto">
                {isLoading ? (
                  <div className="p-8 text-center text-gray-500">Loading topics...</div>
                ) : (
                  availableTopics.map(topic => {
                    const isSelected = selectedTopics.includes(topic.topicId);
                    const isDisabled = !isSelected && selectedTopics.length >= 5;

                    return (
                      <div 
                        key={topic.topicId}
                        onClick={() => !isDisabled && toggleTopic(topic.topicId)}
                        className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50' : isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className={isSelected ? 'text-blue-600' : 'text-gray-300'}>
                          {isSelected ? <CheckSquare size={24} /> : <Square size={24} />}
                        </div>
                        <div>
                          <h3 className={`font-semibold ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>
                            {topic.topicName || topic.title}
                          </h3>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <button 
              onClick={() => handleStartExam(false)}
              disabled={selectedTopics.length === 0 || isLoading || isStarting}
              className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                selectedTopics.length > 0 && !isStarting
                  ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <PlayCircle size={24} />
              {isStarting ? 'Preparing Exam Room...' : selectedTopics.length === 0 ? 'Select at least 1 topic' : 'Start Mock Exam'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}