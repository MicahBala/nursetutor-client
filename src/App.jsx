import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext'; 

// Import your new route guards!
import { RequireAuth, RequireAdmin } from './components/ProtectedRoute';

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
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
          <Routes>
            {/* PUBLIC ROUTES - Anyone can visit these without logging in */}
            <Route path="/" element={<Landing />} />
            
            {/* PROTECTED ROUTES - Must be logged in to view */}
            <Route path="/subscription" element={
              <RequireAuth><Subscription /></RequireAuth>
            } />
            
            <Route path="/dashboard" element={
              <RequireAuth><Dashboard /></RequireAuth>
            } />
            
            <Route path="/study/:topicId" element={
              <RequireAuth><ModuleStudy /></RequireAuth>
            } />
            
            <Route path="/quiz-setup" element={
              <RequireAuth><QuizSetup /></RequireAuth>
            } />
            
            <Route path="/quiz-active" element={
              <RequireAuth><ActiveQuiz /></RequireAuth>
            } />
            
            <Route path="/quiz-results" element={
              <RequireAuth><QuizResults /></RequireAuth>
            } />

            <Route path="/exam-results/:examId" element={
              <RequireAuth><ExamResults /></RequireAuth>
            } />

            <Route path="/exam/:examId" element={
              <RequireAuth><MockExam /></RequireAuth>
            } />

            {/* STRICT ADMIN ROUTE - Only your specific email can view this */}
            <Route path="/admin" element={
              <RequireAdmin><AdminDashboard /></RequireAdmin>
            } />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;