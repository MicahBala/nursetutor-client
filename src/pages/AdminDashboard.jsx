import { useState, useEffect } from 'react';
import { 
  Database, Zap, PlusCircle, Loader2, ShieldAlert, 
  FolderPlus, LayoutDashboard, Users, Unlock, FileText, Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [activeView, setActiveView] = useState('overview');
  const [topics, setTopics] = useState([]);

  // Fetch topics on load
  const fetchTopics = async () => {
    if (!currentUser) return;
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch(`${API_URL}/api/topics`, {
        headers: { 'Authorization': `Bearer ${token}` }
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
    { id: 'users', label: 'User Roster & Access', icon: Users }, // Moved up for prominence
    { id: 'topics', label: 'Topic Manager', icon: FolderPlus },
    { id: 'content', label: 'AI Content Builder', icon: Database },
  ];

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
        <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
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
  const { currentUser } = useAuth();
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
          'Authorization': `Bearer ${token}`
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
  const { currentUser } = useAuth();
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [questionCount, setQuestionCount] = useState(20);
  
  const [isGenQuestions, setIsGenQuestions] = useState(false);
  const [isGenMaterials, setIsGenMaterials] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

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
          'Authorization': `Bearer ${token}`
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
      <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 shadow-xl max-w-md">
        <div className="flex items-center gap-2 mb-6">
          <Database className="text-blue-400" size={24} />
          <h2 className="text-xl font-bold text-white">AI Content Generator</h2>
        </div>

        <div className="space-y-6">
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
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Action States
  const [email, setEmail] = useState('');
  const [credits, setCredits] = useState(10);
  const [isToppingUp, setIsToppingUp] = useState(false);
  
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [days, setDays] = useState(30);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Fetch Users on Load
  useEffect(() => {
    const fetchUsers = async () => {
      if (!currentUser) return;
      try {
        const token = await currentUser.getIdToken();
        const res = await fetch(`${API_URL}/api/admin/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        }
      } catch (error) {
        console.error("Failed to fetch users", error);
      } finally {
        setIsLoadingUsers(false);
      }
    };
    fetchUsers();
    
    // Auto-select first topic for the form
    if (topics.length > 0 && !selectedTopicId) setSelectedTopicId(topics[0].topicId);
  }, [currentUser, topics, selectedTopicId]);

  // Aggregate Stats
  const totalUsers = users.length;
  const totalCredits = users.reduce((sum, u) => sum + (u.mockExamCredits || 0), 0);
  const totalUnlocks = users.reduce((sum, u) => sum + (u.activeTopicsCount || 0), 0);

  // Filter users based on search
  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email, creditsToAdd: credits })
      });
      const data = await response.json();
      if (response.ok) {
        setMessage({ text: data.message, type: 'success' });
        setCredits(10);
        // Optimistically update the UI table
        setUsers(users.map(u => u.email === email ? { ...u, mockExamCredits: u.mockExamCredits + credits } : u));
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
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email, topicId: selectedTopicId, days })
      });
      const data = await response.json();
      if (response.ok) {
        setMessage({ text: data.message, type: 'success' });
        // Optimistically update UI
        setUsers(users.map(u => u.email === email ? { ...u, activeTopicsCount: u.activeTopicsCount + 1 } : u));
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
      
      {/* Top Level Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 shadow-sm">
          <p className="text-gray-400 text-sm font-medium mb-1">Total Users</p>
          <p className="text-3xl font-bold text-white">{totalUsers}</p>
        </div>
        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 shadow-sm">
          <p className="text-gray-400 text-sm font-medium mb-1">Active Topic Unlocks</p>
          <p className="text-3xl font-bold text-blue-400">{totalUnlocks}</p>
        </div>
        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 shadow-sm">
          <p className="text-gray-400 text-sm font-medium mb-1">Total Credits Held</p>
          <p className="text-3xl font-bold text-green-400">{totalCredits}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Col: User Table */}
        <div className="lg:col-span-2 bg-gray-800 rounded-2xl border border-gray-700 shadow-xl overflow-hidden">
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">User Roster</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input 
                type="text" 
                placeholder="Search email..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-900 border border-gray-700 text-sm rounded-lg pl-9 pr-4 py-2 text-white focus:outline-none focus:border-blue-500 w-48"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="bg-gray-900/50 text-xs uppercase font-semibold text-gray-500">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Unlocks</th>
                  <th className="px-6 py-4">Credits</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {isLoadingUsers ? (
                  <tr><td colSpan="4" className="text-center py-8">Loading users...</td></tr>
                ) : filteredUsers.length === 0 ? (
                  <tr><td colSpan="4" className="text-center py-8">No users found.</td></tr>
                ) : (
                  filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-gray-750 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-white font-medium">{user.name}</p>
                        <p className="text-xs">{user.email}</p>
                      </td>
                      <td className="px-6 py-4 text-blue-400 font-bold">{user.activeTopicsCount}</td>
                      <td className="px-6 py-4 text-green-400 font-bold">{user.mockExamCredits}</td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => setEmail(user.email)}
                          className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded transition-colors"
                        >
                          Select
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Quick Actions */}
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-5 shadow-xl">
            <h3 className="font-bold text-white mb-4 border-b border-gray-700 pb-2">Target Actions</h3>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Select user or type email"
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500 mb-4"
            />
            {message.text && (
              <div className={`p-2 rounded text-xs font-medium mb-4 ${message.type === 'success' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                {message.text}
              </div>
            )}

            {/* Grant Credits */}
            <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 mb-4">
              <label className="block text-xs font-medium text-gray-400 mb-1">Add Exam Credits</label>
              <div className="flex gap-2">
                <input 
                  type="number" 
                  value={credits}
                  onChange={(e) => setCredits(Number(e.target.value))}
                  min="1"
                  className="w-16 bg-gray-900 border border-gray-700 rounded-lg px-2 py-2 text-white text-sm focus:outline-none focus:border-green-500"
                />
                <button
                  onClick={handleTopUp}
                  disabled={isToppingUp || !email}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  {isToppingUp ? <Loader2 size={16} className="animate-spin" /> : 'Top Up'}
                </button>
              </div>
            </div>

            {/* Grant Topic Access */}
            <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700">
              <label className="block text-xs font-medium text-gray-400 mb-1">Unlock Topic</label>
              <select 
                value={selectedTopicId}
                onChange={(e) => setSelectedTopicId(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-2 py-2 text-white text-sm focus:outline-none focus:border-amber-500 mb-2 truncate"
              >
                {topics.map(t => (
                  <option key={t.topicId} value={t.topicId}>{t.topicName || t.title}</option>
                ))}
              </select>
              <div className="flex gap-2">
                 <div className="w-16 relative">
                    <input 
                      type="number" 
                      value={days}
                      onChange={(e) => setDays(Number(e.target.value))}
                      min="1"
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-2 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                    />
                    <span className="absolute -top-4 right-1 text-[10px] text-gray-500">Days</span>
                 </div>
                <button
                  onClick={handleUnlock}
                  disabled={isUnlocking || !email}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  {isUnlocking ? <Loader2 size={16} className="animate-spin" /> : 'Unlock'}
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}