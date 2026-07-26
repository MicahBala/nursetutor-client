import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext'; 

// Import all your pages
import Landing from './pages/Landing';
import Subscription from './pages/Subscription';
import Dashboard from './pages/Dashboard';
import ModuleStudy from './pages/ModuleStudy'; // <-- MAKE SURE THIS IS IMPORTED
import QuizSetup from './pages/QuizSetup';
// (If you haven't created ActiveQuiz or QuizResults yet, you can comment them out for now)
import ActiveQuiz from './pages/ActiveQuiz';
import QuizResults from './pages/QuizResults';

function App() {
  return (
    <Router>
      {/* Wrap everything inside the AuthProvider */}
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* THIS IS THE ROUTE WE WERE MISSING */}
            {/* The ":topicId" is a dynamic variable that catches "foundation-101" */}
            <Route path="/study/:topicId" element={<ModuleStudy />} />
            
            <Route path="/quiz-setup" element={<QuizSetup />} />
            
            <Route path="/quiz-active" element={<ActiveQuiz />} />
            <Route path="/quiz-results" element={<QuizResults />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;