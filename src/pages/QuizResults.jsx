import { useLocation, useNavigate } from 'react-router-dom';
import { Target, Award, AlertTriangle, ArrowLeft } from 'lucide-react';

export default function QuizResults() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const questions = location.state?.questions || [];
  const userAnswers = location.state?.userAnswers || {};

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h2 className="text-2xl font-bold mb-4">No results found</h2>
        <button onClick={() => navigate('/dashboard')} className="text-blue-600 hover:underline">
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Calculate Overall Score
  let correctCount = 0;
  questions.forEach((q, index) => {
    if (userAnswers[index] === q.correctAnswer) {
      correctCount++;
    }
  });
  const overallPercentage = Math.round((correctCount / questions.length) * 100);

  // Calculate Topic-Level Analytics
  const topicStats = {};
  questions.forEach((q, index) => {
    if (!topicStats[q.topicTitle]) {
      topicStats[q.topicTitle] = { total: 0, correct: 0 };
    }
    topicStats[q.topicTitle].total += 1;
    if (userAnswers[index] === q.correctAnswer) {
      topicStats[q.topicTitle].correct += 1;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer font-medium"
          >
            <ArrowLeft size={20} /> Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Exam Results</h1>
        </div>

        {/* Overall Score Card */}
        <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 shadow-inner bg-gray-50">
            {overallPercentage >= 70 ? (
              <Award size={40} className="text-green-500" />
            ) : (
              <AlertTriangle size={40} className="text-amber-500" />
            )}
          </div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">Overall Score</h2>
          <div className="text-6xl font-black text-gray-900 mb-2">
            {overallPercentage}%
          </div>
          <p className="text-lg text-gray-600">
            You scored {correctCount} out of {questions.length} correctly.
          </p>
        </div>

        {/* Topic-Level Breakdown */}
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Target size={24} className="text-blue-600" /> Topic Performance
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {Object.entries(topicStats).map(([topicTitle, stats], idx) => {
            const percentage = Math.round((stats.correct / stats.total) * 100);
            
            // Determine colors based on performance
            let colorClass = "bg-gray-200";
            let textClass = "text-gray-700";
            if (percentage >= 75) {
              colorClass = "bg-green-500";
              textClass = "text-green-700";
            } else if (percentage >= 50) {
              colorClass = "bg-amber-400";
              textClass = "text-amber-700";
            } else {
              colorClass = "bg-red-500";
              textClass = "text-red-700";
            }

            return (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-bold text-gray-800 line-clamp-1 pr-4">{topicTitle}</h4>
                  <span className={`font-bold ${textClass}`}>{percentage}%</span>
                </div>
                
                {/* Mini Progress Bar */}
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className={`${colorClass} h-2 rounded-full`} style={{ width: `${percentage}%` }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-2 font-medium">
                  {stats.correct} of {stats.total} correct
                </p>
              </div>
            );
          })}
        </div>

        {/* Review Answers Button */}
        <div className="flex justify-center border-t border-gray-200 pt-8">
          <button 
            onClick={() => alert("Feature coming soon: Detailed answer review!")}
            className="bg-gray-900 text-white hover:bg-gray-800 px-8 py-4 rounded-xl font-bold text-lg shadow-md transition-colors"
          >
            Review Incorrect Answers
          </button>
        </div>

      </div>
    </div>
  );
}