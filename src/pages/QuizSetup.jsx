import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield, CheckSquare, Square, PlayCircle } from 'lucide-react';

export default function QuizSetup() {
  const { dbUser } = useAuth();
  const navigate = useNavigate();
  
  const [selectedTopics, setSelectedTopics] = useState([]);
  
  // NEW: State for fetched topics
  const [availableTopics, setAvailableTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // NEW: Fetch topics from the backend
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/topics');
        const data = await response.json();
        setAvailableTopics(data);
      } catch (error) {
        console.error("Error fetching topics:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTopics();
  }, []);

  const toggleTopic = (topicId) => {
    setSelectedTopics(prev => {
      if (prev.includes(topicId)) {
        return prev.filter(id => id !== topicId);
      }
      if (prev.length >= 5) {
        return prev;
      }
      return [...prev, topicId];
    });
  };

  const handleStartExam = () => {
    if (selectedTopics.length === 0) return;
    
    if (dbUser.mockExamCredits < 1) {
      alert("You don't have enough Exam Credits. Please purchase more.");
      navigate('/subscription');
      return;
    }

    navigate('/quiz-active', { state: { selectedTopics } });
  };

  const addCheatCredits = async () => {
    alert("In a real app, this would hit the backend. For now, we will bypass the block!");
    navigate('/quiz-active', { state: { selectedTopics, cheatMode: true } });
  };

  if (!dbUser) return <div className="p-8 text-center mt-20">Loading profile...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Setup Mock Exam</h1>
          <p className="text-gray-600">Select up to 5 topics to generate a randomized exam.</p>
        </div>

        {/* Credits Status */}
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
          
          {dbUser.mockExamCredits === 0 && (
            <button onClick={addCheatCredits} className="text-xs bg-gray-900 text-white px-3 py-2 rounded shadow">
              [DEV] Bypass & Start
            </button>
          )}
        </div>

        {/* Topic Selection */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h2 className="font-bold text-gray-900">Select Topics</h2>
            <span className={`text-sm font-bold px-3 py-1 rounded-full ${selectedTopics.length === 5 ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
              {selectedTopics.length} / 5 Selected
            </span>
          </div>
          
          <div className="p-2">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">Loading topics...</div>
            ) : (
              availableTopics.map(topic => {
                // NOTE: Use topic.topicId instead of topic.id
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
                        {topic.title}
                      </h3>
                      <div className="flex gap-2 mt-1">
                        {topic.tags.map((tag, idx) => (
                          <span key={idx} className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Start Button */}
        <button 
          onClick={dbUser.mockExamCredits > 0 ? handleStartExam : addCheatCredits}
          disabled={selectedTopics.length === 0 || isLoading}
          className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
            selectedTopics.length > 0 
              ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <PlayCircle size={24} />
          {selectedTopics.length === 0 ? 'Select at least 1 topic' : 'Start Mock Exam'}
        </button>

      </div>
    </div>
  );
}