import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext'; 

import Landing from './pages/Landing';
import Subscription from './pages/Subscription';
import Dashboard from './pages/Dashboard';
import ModuleStudy from './pages/ModuleStudy';
import QuizSetup from './pages/QuizSetup';
import ActiveQuiz from './pages/ActiveQuiz';
import QuizResults from './pages/QuizResults';
import MockExam from './pages/MockExam';
import AdminDashboard from './pages/AdminDashboard';
import ExamResults from './pages/ExamResults';

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
            
            <Route path="/study/:topicId" element={<ModuleStudy />} />
            
            <Route path="/quiz-setup" element={<QuizSetup />} />
            <Route path="/quiz-active" element={<ActiveQuiz />} />
            <Route path="/quiz-results" element={<QuizResults />} />

            <Route path="/exam-results/:examId" element={<ExamResults />} />

            <Route path="/exam/:examId" element={<MockExam />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;