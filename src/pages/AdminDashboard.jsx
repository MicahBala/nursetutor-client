import { useState, useEffect } from 'react';
import { Database, Zap, PlusCircle, Loader2, ShieldAlert, FolderPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();
  
  // States for Question Generator
  const [topics, setTopics] = useState([]);
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [questionCount, setQuestionCount] = useState(20);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genMessage, setGenMessage] = useState({ text: '', type: '' });

  // States for Credit Manager
  const [email, setEmail] = useState('');
  const [credits, setCredits] = useState(10);
  const [isToppingUp, setIsToppingUp] = useState(false);
  const [topUpMessage, setTopUpMessage] = useState({ text: '', type: '' });

  // NEW: States for Topic Manager
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicTags, setNewTopicTags] = useState('');
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [topicMessage, setTopicMessage] = useState({ text: '', type: '' });

  // Fetch topics on load (and re-fetch when a new one is added)
  const fetchTopics = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/topics');
      const data = await res.json();
      setTopics(data);
      if (data.length > 0 && !selectedTopicId) {
        setSelectedTopicId(data[0].topicId);
      }
    } catch (error) {
      console.error("Failed to fetch topics", error);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const handleGenerateQuestions = async () => {
    if (!selectedTopicId) return;
    setIsGenerating(true);
    setGenMessage({ text: '', type: '' });
    const selectedTopic = topics.find(t => t.topicId === selectedTopicId);

    try {
      const response = await fetch('http://localhost:5000/api/admin/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId: selectedTopic.topicId,
          topicName: selectedTopic.topicName || selectedTopic.title,
          count: questionCount
        })
      });
      const data = await response.json();
      if (response.ok) {
        setGenMessage({ text: data.message, type: 'success' });
        setTimeout(() => setGenMessage({ text: '', type: '' }), 4000);
      } else throw new Error(data.error);
    } catch (error) {
      setGenMessage({ text: error.message, type: 'error' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTopUp = async () => {
    if (!email) return;
    setIsToppingUp(true);
    setTopUpMessage({ text: '', type: '' });

    try {
      const response = await fetch('http://localhost:5000/api/admin/top-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, creditsToAdd: credits })
      });
      const data = await response.json();

      if (response.ok) {
        setTopUpMessage({ text: data.message, type: 'success' });
        
        // UX FIX: Clear the inputs completely
        setEmail('');
        setCredits(10);
        
        // UX FIX: Auto-hide the success message after 4 seconds
        setTimeout(() => setTopUpMessage({ text: '', type: '' }), 4000);
      } else throw new Error(data.error);
    } catch (error) {
      setTopUpMessage({ text: error.message, type: 'error' });
    } finally {
      setIsToppingUp(false);
    }
  };

  // NEW: Handle adding a topic
  const handleAddTopic = async () => {
    if (!newTopicTitle) return;
    setIsAddingTopic(true);
    setTopicMessage({ text: '', type: '' });

    try {
      const response = await fetch('http://localhost:5000/api/admin/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTopicTitle, tags: newTopicTags })
      });
      const data = await response.json();

      if (response.ok) {
        setTopicMessage({ text: data.message, type: 'success' });
        setNewTopicTitle('');
        setNewTopicTags('');
        fetchTopics(); // Refresh the dropdown instantly!
        
        setTimeout(() => setTopicMessage({ text: '', type: '' }), 4000);
      } else throw new Error(data.error);
    } catch (error) {
      setTopicMessage({ text: error.message, type: 'error' });
    } finally {
      setIsAddingTopic(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex items-center justify-between mb-8 text-white border-b border-gray-800 pb-6">
          <div className="flex items-center gap-3">
            <ShieldAlert size={32} className="text-red-500" />
            <h1 className="text-3xl font-bold">Admin Control Panel</h1>
          </div>
          <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-white transition-colors bg-gray-800 px-4 py-2 rounded-lg">
            Exit to Dashboard
          </button>
        </div>

        {/* 3-Column Grid for widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* 1. TOPIC MANAGER WIDGET */}
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 shadow-xl h-fit">
            <div className="flex items-center gap-2 mb-6">
              <FolderPlus className="text-purple-400" size={24} />
              <h2 className="text-xl font-bold text-white">Create New Topic</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Topic Title</label>
                <input 
                  type="text" 
                  value={newTopicTitle}
                  onChange={(e) => setNewTopicTitle(e.target.value)}
                  placeholder="e.g. Pediatric Emergencies"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Tags (Comma separated)</label>
                <input 
                  type="text" 
                  value={newTopicTags}
                  onChange={(e) => setNewTopicTags(e.target.value)}
                  placeholder="pediatrics, emergency, clinical"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <button
                onClick={handleAddTopic}
                disabled={isAddingTopic || !newTopicTitle}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {isAddingTopic ? <Loader2 size={20} className="animate-spin" /> : 'Create Topic'}
              </button>

              {topicMessage.text && (
                <div className={`p-3 rounded-lg text-sm font-medium animate-in fade-in ${topicMessage.type === 'success' ? 'bg-green-900/50 text-green-400 border border-green-800' : 'bg-red-900/50 text-red-400 border border-red-800'}`}>
                  {topicMessage.text}
                </div>
              )}
            </div>
          </div>

          {/* 2. QUESTION GENERATOR WIDGET */}
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 shadow-xl h-fit">
            <div className="flex items-center gap-2 mb-6">
              <Database className="text-blue-400" size={24} />
              <h2 className="text-xl font-bold text-white">Fill Question Bank</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Target Topic</label>
                <select 
                  value={selectedTopicId}
                  onChange={(e) => setSelectedTopicId(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                >
                  {topics.map(t => (
                    <option key={t.topicId} value={t.topicId}>{t.topicName || t.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Batch Size (Max 50)</label>
                <input 
                  type="number" 
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  max="50"
                  min="1"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                onClick={handleGenerateQuestions}
                disabled={isGenerating || topics.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Zap size={20} />}
                {isGenerating ? 'Generating via Groq...' : 'Generate Questions'}
              </button>

              {genMessage.text && (
                <div className={`p-3 rounded-lg text-sm font-medium animate-in fade-in ${genMessage.type === 'success' ? 'bg-green-900/50 text-green-400 border border-green-800' : 'bg-red-900/50 text-red-400 border border-red-800'}`}>
                  {genMessage.text}
                </div>
              )}
            </div>
          </div>

          {/* 3. CREDIT MANAGER WIDGET */}
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 shadow-xl h-fit">
            <div className="flex items-center gap-2 mb-6">
              <PlusCircle className="text-green-400" size={24} />
              <h2 className="text-xl font-bold text-white">Credit Manager</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">User Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Credits to Add</label>
                <input 
                  type="number" 
                  value={credits}
                  onChange={(e) => setCredits(Number(e.target.value))}
                  min="1"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
                />
              </div>

              <button
                onClick={handleTopUp}
                disabled={isToppingUp || !email}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {isToppingUp ? <Loader2 size={20} className="animate-spin" /> : 'Top Up Account'}
              </button>

              {topUpMessage.text && (
                <div className={`p-3 rounded-lg text-sm font-medium animate-in fade-in ${topUpMessage.type === 'success' ? 'bg-green-900/50 text-green-400 border border-green-800' : 'bg-red-900/50 text-red-400 border border-red-800'}`}>
                  {topUpMessage.text}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}