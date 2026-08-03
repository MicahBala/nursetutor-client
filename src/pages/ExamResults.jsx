import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  CheckCircle2, XCircle, AlertCircle, BarChart3, 
  BookOpen, ArrowLeft, BrainCircuit, Target, Clock
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ExamResults() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [exam, setExam] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' or 'review'

  useEffect(() => {
    const fetchResults = async () => {
      if (!currentUser) return; // Wait for authentication

      try {
        // Get the Firebase token
        const token = await currentUser.getIdToken();
        
        // Fetch results using dynamic URL and auth header
        const res = await fetch(`${API_URL}/api/mock-exams/${examId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await res.json();
        setExam(data);
      } catch (error) {
        console.error("Failed to load results", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchResults();
  }, [examId, currentUser]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 font-medium">Loading your results...</div>;
  }

  if (!exam) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">Exam not found.</div>;
  }

  // Calculate stats
  const correctCount = exam.overallScore;
  const unansweredCount = exam.userAnswers.filter(a => a.selectedOption === null).length;
  const incorrectCount = exam.totalQuestions - correctCount - unansweredCount;
  const scorePercentage = Math.round((correctCount / exam.totalQuestions) * 100);

  // Time spent
  const timeSpentSeconds = 3600 - exam.timeRemaining;
  const timeSpentFormatted = `${Math.floor(timeSpentSeconds / 60)}m ${timeSpentSeconds % 60}s`;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium transition-colors"
          >
            <ArrowLeft size={20} /> Back to Dashboard
          </button>
          <div className="bg-blue-100 text-blue-800 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide">
            Exam Completed
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{exam.examTitle}</h1>
          <p className="text-gray-500 flex items-center gap-2">
            <Clock size={16} /> Completed in {timeSpentFormatted}
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 border-b border-gray-200 mb-8">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`pb-4 px-4 font-bold text-lg flex items-center gap-2 transition-colors relative ${activeTab === 'overview' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <BarChart3 size={20} /> Performance Overview
            {activeTab === 'overview' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full"></div>}
          </button>
          <button 
            onClick={() => setActiveTab('review')}
            className={`pb-4 px-4 font-bold text-lg flex items-center gap-2 transition-colors relative ${activeTab === 'review' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <BookOpen size={20} /> Review Answers
            {activeTab === 'review' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full"></div>}
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center row-span-2 md:col-span-2">
                <div className="relative w-40 h-40 flex items-center justify-center mb-4">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path className="text-gray-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className={`${scorePercentage >= 70 ? 'text-green-500' : scorePercentage >= 50 ? 'text-amber-500' : 'text-red-500'}`} strokeDasharray={`${scorePercentage}, 100`} strokeWidth="3" stroke="currentColor" fill="none" strokeLinecap="round" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black text-gray-900">{scorePercentage}%</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Overall Score</h3>
                <p className="text-gray-500 text-sm mt-1">
                  {scorePercentage >= 50 ? 'Great job! Review your weak areas below.' : 'Keep studying! Check the AI rationales to improve.'}
                </p>
              </div>

              <div className="bg-green-50 p-6 rounded-2xl border border-green-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0"><CheckCircle2 size={24} /></div>
                <div><p className="text-sm font-medium text-green-800">Correct</p><p className="text-2xl font-bold text-green-700">{correctCount}</p></div>
              </div>
              
              <div className="bg-red-50 p-6 rounded-2xl border border-red-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center shrink-0"><XCircle size={24} /></div>
                <div><p className="text-sm font-medium text-red-800">Incorrect</p><p className="text-2xl font-bold text-red-700">{incorrectCount}</p></div>
              </div>

              <div className="bg-gray-100 p-6 rounded-2xl border border-gray-200 flex items-center gap-4 md:col-span-2">
                <div className="w-12 h-12 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center shrink-0"><AlertCircle size={24} /></div>
                <div><p className="text-sm font-medium text-gray-600">Unanswered</p><p className="text-2xl font-bold text-gray-800">{unansweredCount}</p></div>
              </div>
            </div>

            {/* Topic Breakdown */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Target size={24} className="text-blue-600" /> Topic Breakdown
              </h3>
              
              <div className="space-y-6">
                {exam.topicBreakdown.map((topic, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-bold text-gray-700">{topic.topicName}</span>
                      <span className="font-medium text-gray-500">{topic.correctAnswers} / {topic.totalQuestions} correct ({topic.scorePercentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-1000 ${topic.scorePercentage >= 70 ? 'bg-green-500' : topic.scorePercentage >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} 
                        style={{ width: `${topic.scorePercentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DETAILED REVIEW */}
        {activeTab === 'review' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {exam.userAnswers.map((question, idx) => {
              
              const isCorrect = question.isCorrect;
              const isUnanswered = question.selectedOption === null;

              return (
                <div key={idx} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  
                  {/* Question Header */}
                  <div className={`px-6 py-4 border-b flex justify-between items-center ${isCorrect ? 'bg-green-50 border-green-100' : isUnanswered ? 'bg-gray-50 border-gray-200' : 'bg-red-50 border-red-100'}`}>
                    <div className="flex items-center gap-3">
                        {isCorrect ? <CheckCircle2 className="text-green-600" size={24} /> : isUnanswered ? <AlertCircle className="text-gray-400" size={24} /> : <XCircle className="text-red-600" size={24} />}
                        <span className="font-bold text-gray-900">Question {idx + 1}</span>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">
                        {question.topicName}
                    </span>
                  </div>

                  <div className="p-6 md:p-8">
                    <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-6 leading-relaxed">
                      {question.questionText}
                    </h3>

                    <div className="space-y-3 mb-8">
                      {['A', 'B', 'C', 'D'].map((letter) => {
                        const optionText = question[`option${letter}`];
                        const isThisTheCorrectAnswer = question.correctAnswer === letter;
                        const didUserSelectThis = question.selectedOption === letter;

                        // Determine styles
                        let boxStyle = "border-gray-200 bg-white text-gray-700";
                        let iconStyle = "bg-gray-100 text-gray-500";
                        
                        if (isThisTheCorrectAnswer) {
                          boxStyle = "border-green-500 bg-green-50 text-green-900 ring-1 ring-green-500";
                          iconStyle = "bg-green-500 text-white";
                        } else if (didUserSelectThis && !isThisTheCorrectAnswer) {
                          boxStyle = "border-red-300 bg-red-50 text-red-900 opacity-80";
                          iconStyle = "bg-red-500 text-white";
                        }

                        return (
                        <div key={letter} className={`p-4 rounded-xl border-2 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 transition-all ${boxStyle}`}>
                            
                            {/* Letter & Answer Text Container */}
                            <div className="flex gap-3 sm:gap-4 flex-1 items-start sm:items-center">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 mt-0.5 sm:mt-0 ${iconStyle}`}>
                                {letter}
                            </div>
                            <span className="font-medium leading-relaxed flex-1 text-left">{optionText}</span>
                            </div>
                            
                            {/* Badges for clarity */}
                            <div className="flex flex-wrap gap-2 shrink-0 sm:ml-auto pl-11 sm:pl-0 mt-1 sm:mt-0">
                            {didUserSelectThis && <span className="text-xs font-bold px-2 py-1 bg-white rounded shadow-sm text-gray-600 border border-gray-200">Your Answer</span>}
                            {isThisTheCorrectAnswer && <span className="text-xs font-bold px-2 py-1 bg-green-200 text-green-800 rounded shadow-sm">Correct Answer</span>}
                            </div>
                        </div>
                        );
                      })}
                    </div>

                    {/* The Secret Sauce: AI Rationale */}
                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                        <BrainCircuit size={100} className="text-indigo-600" />
                      </div>
                      
                      <h4 className="flex items-center gap-2 font-bold text-indigo-900 mb-2">
                        <BrainCircuit size={20} className="text-indigo-600" />
                        AI Clinical Rationale
                      </h4>
                      <p className="text-indigo-800 leading-relaxed relative z-10">
                        {question.rationale}
                      </p>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}