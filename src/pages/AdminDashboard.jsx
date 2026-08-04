import { useState, useEffect } from 'react';
import { 
  Database, Zap, PlusCircle, Loader2, ShieldAlert, 
  FolderPlus, LayoutDashboard, Users, Unlock, FileText 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // <-- Imported useAuth!
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth(); // <-- Grab the current user
  
  const [activeView, setActiveView] = useState('overview');
  const [topics, setTopics] = useState([]);

  // Fetch topics on load (passed down so sub-components can trigger refreshes)
  const fetchTopics = async () => {
    if (!currentUser) return;
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch(`${API_URL}/api/topics`, {
        headers: {
          'Authorization': `Bearer ${token}` // <-- Present token
        }
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setTopics(data);
      } else {
        setTopics([]);
      }
    } catch (error) {
      console.error("Failed to fetch topics", error);
      setTopics([]);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, [currentUser]);

  const menuItems = [
    { id: 'overview', label: 'System Overview', icon: LayoutDashboard },
    { id: 'topics', label: 'Topic Manager', icon: FolderPlus },
    { id: 'content', label: 'AI Content Builder', icon: Database },
    { id: 'users', label: 'User Management', icon: Users },
  ];

  // Render the correct workspace
  const renderWorkspace = () => {
    switch (activeView) {
      case 'topics':
        return <TopicManager fetchTopics={fetchTopics} />;
      case 'content':
        return <ContentManager topics={topics} />;
      case 'users':
        return <UserManager topics={topics} />;
      case 'overview':
      default:
        return (
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-2">Welcome to the Command Center</h2>
            <p className="text-gray-400">Select a tool from the sidebar to manage the platform.</p>
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="bg-gray-900 p-6 rounded-xl border border-gray-700">
                <p className="text-gray-400 text-sm font-medium">Total Topics</p>
                <p className="text-3xl font-bold text-white mt-2">{topics.length}</p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col hidden md:flex shrink-0">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <ShieldAlert size={28} className="text-red-500" />
            <h1 className="text-xl font-bold text-white tracking-tight">Admin Console</h1>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium transition-colors ${
                  isActive 
                    ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' 
                    : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-purple-400' : 'text-gray-500'} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-700">
           <button 
             onClick={() => navigate('/dashboard')} 
             className="w-full text-gray-400 hover:text-white transition-colors bg-gray-900 border border-gray-700 px-4 py-2 rounded-lg text-sm font-medium"
           >
            Exit to App
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          {renderWorkspace()}
        </div>
      </main>
    </div>
  );
}


// ==========================================
// SUB-COMPONENTS (Organized by feature)
// ==========================================

function TopicManager({ fetchTopics }) {
  const { currentUser } = useAuth(); // <-- Added useAuth
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicTags, setNewTopicTags] = useState('');
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleAddTopic = async () => {
    if (!newTopicTitle || !currentUser) return;
    setIsAddingTopic(true);
    setMessage({ text: '', type: '' });

    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(`${API_URL}/api/admin/topics`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // <-- Present token
        },
        body: JSON.stringify({ title: newTopicTitle, tags: newTopicTags })
      });
      const data = await response.json();

      if (response.ok) {
        setMessage({ text: data.message, type: 'success' });
        setNewTopicTitle('');
        setNewTopicTags('');
        fetchTopics(); 
        setTimeout(() => setMessage({ text: '', type: '' }), 4000);
      } else throw new Error(data.error);
    } catch (error) {
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setIsAddingTopic(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 shadow-xl">
      <div className="flex items-center gap-2 mb-6">
        <FolderPlus className="text-purple-400" size={24} />
        <h2 className="text-xl font-bold text-white">Create New Topic</h2>
      </div>
      <div className="space-y-4 max-w-md">
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
        {message.text && (
          <div className={`p-3 rounded-lg text-sm font-medium animate-in fade-in ${message.type === 'success' ? 'bg-green-900/50 text-green-400 border border-green-800' : 'bg-red-900/50 text-red-400 border border-red-800'}`}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}

function ContentManager({ topics }) {
  const { currentUser } = useAuth(); // <-- Added useAuth
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [questionCount, setQuestionCount] = useState(20);
  
  const [isGenQuestions, setIsGenQuestions] = useState(false);
  const [isGenMaterials, setIsGenMaterials] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Auto-select first topic on load
  useEffect(() => {
    if (topics.length > 0 && !selectedTopicId) setSelectedTopicId(topics[0].topicId);
  }, [topics, selectedTopicId]);

  const handleGenerate = async (type) => {
    if (!selectedTopicId || !currentUser) return;
    
    const isQuestions = type === 'questions';
    isQuestions ? setIsGenQuestions(true) : setIsGenMaterials(true);
    setMessage({ text: '', type: '' });
    
    const selectedTopic = topics.find(t => t.topicId === selectedTopicId);
    const endpoint = isQuestions ? '/api/admin/generate-questions' : '/api/admin/generate-content';
    const payload = {
      topicId: selectedTopic.topicId,
      topicName: selectedTopic.topicName || selectedTopic.title,
      ...(isQuestions && { count: questionCount })
    };

    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // <-- Present token
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (response.ok) {
        setMessage({ text: data.message, type: 'success' });
        setTimeout(() => setMessage({ text: '', type: '' }), 5000);
      } else throw new Error(data.error);
    } catch (error) {
      setMessage({ text: error.message, type: 'error' });
    } finally {
      isQuestions ? setIsGenQuestions(false) : setIsGenMaterials(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-6">
          <Database className="text-blue-400" size={24} />
          <h2 className="text-xl font-bold text-white">AI Content Generator</h2>
        </div>

        <div className="space-y-6 max-w-md">
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

          <div className="pt-4 border-t border-gray-700">
            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4">1. Generate Study Materials</h3>
            <button
              onClick={() => handleGenerate('materials')}
              disabled={isGenMaterials || topics.length === 0}
              className="w-full bg-blue-900/50 hover:bg-blue-800 border border-blue-700 text-blue-100 font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {isGenMaterials ? <Loader2 size={20} className="animate-spin" /> : <FileText size={20} />}
              Generate Article & Quiz
            </button>
          </div>

          <div className="pt-4 border-t border-gray-700">
             <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4">2. Fill Exam Bank</h3>
             <div className="flex gap-3 mb-4">
               <div className="flex-1">
                 <label className="block text-xs font-medium text-gray-500 mb-1">Batch Size</label>
                 <input 
                   type="number" 
                   value={questionCount}
                   onChange={(e) => setQuestionCount(Number(e.target.value))}
                   max="50" min="1"
                   className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                 />
               </div>
               <button
                 onClick={() => handleGenerate('questions')}
                 disabled={isGenQuestions || topics.length === 0}
                 className="flex-[2] mt-5 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
               >
                 {isGenQuestions ? <Loader2 size={20} className="animate-spin" /> : <Zap size={20} />}
                 Generate Q's
               </button>
             </div>
          </div>

          {message.text && (
            <div className={`p-3 rounded-lg text-sm font-medium animate-in fade-in ${message.type === 'success' ? 'bg-green-900/50 text-green-400 border border-green-800' : 'bg-red-900/50 text-red-400 border border-red-800'}`}>
              {message.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function UserManager({ topics }) {
  const { currentUser } = useAuth(); // <-- Added useAuth
  const [email, setEmail] = useState('');
  
  // Credit State
  const [credits, setCredits] = useState(10);
  const [isToppingUp, setIsToppingUp] = useState(false);
  
  // Unlock State
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [days, setDays] = useState(30);
  const [isUnlocking, setIsUnlocking] = useState(false);
  
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (topics.length > 0 && !selectedTopicId) setSelectedTopicId(topics[0].topicId);
  }, [topics, selectedTopicId]);

  const handleTopUp = async () => {
    if (!email || !currentUser) return;
    setIsToppingUp(true);
    setMessage({ text: '', type: '' });

    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(`${API_URL}/api/admin/top-up`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // <-- Present token
        },
        body: JSON.stringify({ email, creditsToAdd: credits })
      });
      const data = await response.json();
      if (response.ok) {
        setMessage({ text: data.message, type: 'success' });
        setCredits(10);
        setTimeout(() => setMessage({ text: '', type: '' }), 4000);
      } else throw new Error(data.error);
    } catch (error) {
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setIsToppingUp(false);
    }
  };

  const handleUnlock = async () => {
    if (!email || !selectedTopicId || !currentUser) return;
    setIsUnlocking(true);
    setMessage({ text: '', type: '' });

    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(`${API_URL}/api/admin/unlock-topic`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // <-- Present token
        },
        body: JSON.stringify({ email, topicId: selectedTopicId, days })
      });
      const data = await response.json();
      if (response.ok) {
        setMessage({ text: data.message, type: 'success' });
        setTimeout(() => setMessage({ text: '', type: '' }), 4000);
      } else throw new Error(data.error);
    } catch (error) {
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setIsUnlocking(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Universal Email Input */}
      <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 shadow-xl">
        <label className="block text-sm font-bold text-gray-300 mb-2">Target User Email</label>
        <input 
          type="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="student@example.com"
          className="w-full max-w-md bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
        />
        {message.text && (
          <div className={`max-w-md mt-4 p-3 rounded-lg text-sm font-medium animate-in fade-in ${message.type === 'success' ? 'bg-green-900/50 text-green-400 border border-green-800' : 'bg-red-900/50 text-red-400 border border-red-800'}`}>
            {message.text}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Credit Manager */}
        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-6">
            <PlusCircle className="text-green-400" size={24} />
            <h2 className="text-lg font-bold text-white">Add Exam Credits</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Credits Amount</label>
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
          </div>
        </div>

        {/* Topic Unlocker */}
        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-6">
            <Unlock className="text-amber-400" size={24} />
            <h2 className="text-lg font-bold text-white">Manual Topic Unlock</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Select Topic</label>
              <select 
                value={selectedTopicId}
                onChange={(e) => setSelectedTopicId(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500"
              >
                {topics.map(t => (
                  <option key={t.topicId} value={t.topicId}>{t.topicName || t.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Access Duration (Days)</label>
              <input 
                type="number" 
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                min="1"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <button
              onClick={handleUnlock}
              disabled={isUnlocking || !email}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {isUnlocking ? <Loader2 size={20} className="animate-spin" /> : 'Grant Access'}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}