import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, ChevronLeft, ChevronRight, Send, Pause, Play } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function MockExam() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [exam, setExam] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(3600);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // NEW: Pause and Idle tracking states
  const [isPaused, setIsPaused] = useState(false);
  const lastActiveTime = useRef(Date.now());

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/mock-exams/${examId}`);
        const data = await res.json();
        
        if (data.status === 'completed') {
          navigate(`/exam-results/${examId}`);
          return;
        }

        setExam(data);
        setTimeRemaining(data.timeRemaining);
      } catch (error) {
        console.error("Failed to load exam:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchExam();
  }, [examId, navigate]);

  // NEW: Activity Tracker (Resets the idle timer when they move mouse or press keys)
  useEffect(() => {
    const updateActivity = () => { lastActiveTime.current = Date.now(); };
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('click', updateActivity);
    
    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('click', updateActivity);
    };
  }, []);

  // UPDATED: The Countdown Timer AND the Idle Checker
  useEffect(() => {
    // If paused, loading, or submitting, stop counting down!
    if (!exam || isLoading || isSubmitting || isPaused) return;

    const timerInterval = setInterval(() => {
      // 1. Check if they have been idle for 5 minutes (300,000 ms)
      if (Date.now() - lastActiveTime.current > 300000) {
        handlePause(true); // Auto-pause!
      }

      // 2. Count down the exam timer
      setTimeRemaining((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerInterval);
          handleSubmitExam(); 
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [exam, isLoading, isSubmitting, isPaused]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const saveProgressSilently = async (newTime, questionId, letter) => {
    try {
      await fetch(`http://localhost:5000/api/mock-exams/${examId}/auto-save`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId,
          selectedOption: letter,
          timeRemaining: newTime
        })
      });
    } catch (error) {
      console.error("Auto-save failed");
    }
  };

  const handleSelectOption = async (letter) => {
    const updatedExam = { ...exam };
    updatedExam.userAnswers[currentIdx].selectedOption = letter;
    setExam(updatedExam);
    saveProgressSilently(timeRemaining, exam.userAnswers[currentIdx].questionId, letter);
  };

  // UPDATED: Pause Logic - Stays on screen and blurs!
  const handlePause = async (isAuto = false) => {
    setIsPaused(true);
    // Force a final save to DB before pausing
    saveProgressSilently(timeRemaining);
  };

  const handleResume = () => {
    lastActiveTime.current = Date.now(); // Reset activity timer so it doesn't instantly repause
    setIsPaused(false);
  };

  const handleSubmitExam = async () => {
    if (!window.confirm("Are you sure you want to submit your exam? You cannot change your answers after this.")) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/mock-exams/${examId}/submit`, { method: 'POST' });
      if (res.ok) navigate(`/exam-results/${examId}`);
    } catch (error) {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !exam) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 font-medium">Loading Exam Room...</div>;
  }

  const currentQuestion = exam.userAnswers[currentIdx];
  const isTimeLow = timeRemaining < 300;

  return (
    // Note: Added relative positioning here for the absolute overlay to work!
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans relative">
      
      {/* NEW: PAUSE OVERLAY */}
      {isPaused && (
        <div className="absolute inset-0 z-50 bg-white/60 backdrop-blur-md flex flex-col items-center justify-center">
          <div className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-200 text-center max-w-md mx-4 animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Pause size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Exam Paused</h2>
            <p className="text-gray-500 mb-8">
              Your timer has been stopped and progress is saved. The contents of the exam are hidden to maintain test integrity.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleResume}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <Play size={20} /> Resume Exam
              </button>
              <button 
                onClick={() => navigate('/dashboard')}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 rounded-xl transition-all"
              >
                Exit to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 px-4 md:px-8 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <h1 className="font-bold text-gray-900 hidden md:block">{exam.examTitle}</h1>
          <button 
            onClick={() => handlePause()}
            className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors border-l border-gray-300 pl-4 flex items-center gap-2"
          >
            <Pause size={16} /> Save & Pause
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-mono font-bold text-lg ${isTimeLow ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-gray-100 text-gray-800'}`}>
            <Clock size={20} />
            {formatTime(timeRemaining)}
          </div>

          <button 
            onClick={handleSubmitExam}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Exam'}
            <Send size={16} />
          </button>
        </div>
      </header>

      <div className={`flex-1 max-w-7xl mx-auto w-full flex flex-col md:flex-row p-4 md:p-6 gap-6 ${isPaused ? 'pointer-events-none select-none' : ''}`}>
        
        {/* Left Column: The Question */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-10 min-h-[500px] flex flex-col">
            
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm font-bold uppercase tracking-wider text-gray-400">
                Question {currentIdx + 1} of {exam.totalQuestions}
              </span>
              <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-md uppercase">
                {currentQuestion.topicName}
              </span>
            </div>

            <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-8 leading-relaxed">
              {currentQuestion.questionText}
            </h2>

            <div className="space-y-4 mb-auto">
              {['A', 'B', 'C', 'D'].map((letter) => {
                const optionKey = `option${letter}`; 
                const optionText = currentQuestion[optionKey];
                
                return (
                  <div 
                    key={letter}
                    onClick={() => handleSelectOption(letter)}
                    className={`p-5 rounded-xl border-2 flex items-center gap-4 cursor-pointer transition-all ${
                      currentQuestion.selectedOption === letter
                        ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-sm' 
                        : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                      currentQuestion.selectedOption === letter ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {letter}
                    </div>
                    <span className="font-medium text-gray-800 leading-relaxed">{optionText}</span>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-100">
              <button 
                onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                disabled={currentIdx === 0}
                className="flex items-center gap-2 font-semibold text-gray-600 hover:text-blue-600 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={20} /> Previous
              </button>
              
              <button 
                onClick={() => setCurrentIdx(prev => Math.min(exam.totalQuestions - 1, prev + 1))}
                disabled={currentIdx === exam.totalQuestions - 1}
                className="flex items-center gap-2 font-semibold text-gray-600 hover:text-blue-600 disabled:opacity-30 transition-colors"
              >
                Next <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Question Navigator Grid */}
        <div className="w-full md:w-80 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
            <h3 className="font-bold text-gray-900 mb-4">Exam Navigator</h3>
            
            <div className="grid grid-cols-5 gap-2">
              {exam.userAnswers.map((q, idx) => {
                const isAnswered = q.selectedOption !== null;
                const isCurrent = idx === currentIdx;
                
                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentIdx(idx)}
                    className={`h-10 rounded-lg text-sm font-bold transition-all flex items-center justify-center ${
                      isCurrent 
                        ? 'bg-gray-900 text-white ring-2 ring-gray-900 ring-offset-2' 
                        : isAnswered 
                          ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                          : 'bg-gray-50 border border-gray-200 text-gray-500 hover:border-gray-400'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}