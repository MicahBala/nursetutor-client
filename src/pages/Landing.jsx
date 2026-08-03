import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/Button';
import { BookOpen, Shield, Smartphone, Info, Users, CheckCircle2, Clock } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const { currentUser, loginWithGoogle } = useAuth();

  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleGoogleLogin = async () => {
    try {
      const result = await loginWithGoogle();
      const user = result.user;

      console.log("Login Successful!");
      console.log("Name:", user.displayName);
      console.log("Email:", user.email);
      console.log("Firebase UID:", user.uid);

      navigate('/dashboard');
    } catch (error) {
      console.error("Error during Google login:", error.message);
      alert("Failed to log in. Please try again.");
    }
  };

  // Helper function to smooth scroll to the plans section
  const scrollToPlans = () => {
    const plansSection = document.getElementById('pricing-plans');
    if (plansSection) {
      plansSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
          <h1 className="font-manrope text-4xl md:text-6xl font-bold text-on-surface tracking-tight mb-6 leading-tight">
            NurseTutorNG: <br className="hidden md:block"/> Master Difficult Concepts in 5 Minutes.
          </h1>
          <p className="font-inter text-on-surface-variant max-w-3xl mx-auto mb-10 text-lg md:text-xl leading-relaxed">
            A fresh approach to nursing education. We strip away the noise to help you understand critical clinical concepts with precision and speed.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-10">
            <Button variant="gradient" onClick={handleGoogleLogin} className="text-lg px-10 py-4">
              Continue with Google
            </Button>
            <Button variant="secondary" onClick={scrollToPlans} className="text-lg px-8 py-4 bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/20 hover:text-on-surface shadow-sm">
              View Plans
            </Button>
          </div>
          <p className="text-sm font-medium text-on-surface-variant uppercase tracking-wider flex justify-center items-center gap-2">
            <Users size={18} className="text-primary" /> Trusted by lots of Student Nurses
          </p>
        </section>

        {/* Features Section */}
        <section className="bg-surface-container-low py-16 md:py-24 border-t border-b border-surface-container border-opacity-50 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-surface-container-lowest p-8 rounded-2xl ring-1 ring-outline-variant/10 shadow-[0_4px_24px_rgba(25,28,29,0.02)] hover:shadow-[0_12px_32px_rgba(25,28,29,0.06)] transition-all">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
                  <BookOpen size={24} />
                </div>
                <h3 className="font-inter text-xl font-bold text-on-surface mb-3">Summaries</h3>
                <p className="text-on-surface-variant text-base leading-relaxed">Concise, high-yield clinical notes.</p>
              </div>
              
              <div className="bg-surface-container-lowest p-8 rounded-2xl ring-1 ring-outline-variant/10 shadow-[0_4px_24px_rgba(25,28,29,0.02)] hover:shadow-[0_12px_32px_rgba(25,28,29,0.06)] transition-all">
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary mb-6">
                  <Info size={24} />
                </div>
                <h3 className="font-inter text-xl font-bold text-on-surface mb-3">Rationales</h3>
                <p className="text-on-surface-variant text-base leading-relaxed">Detailed "why" behind every answer.</p>
              </div>

              <div className="bg-surface-container-lowest p-8 rounded-2xl ring-1 ring-outline-variant/10 shadow-[0_4px_24px_rgba(25,28,29,0.02)] hover:shadow-[0_12px_32px_rgba(25,28,29,0.06)] transition-all">
                <div className="w-12 h-12 bg-tertiary/10 rounded-xl flex items-center justify-center text-tertiary mb-6">
                  <Shield size={24} />
                </div>
                <h3 className="font-inter text-xl font-bold text-on-surface mb-3">Comprehension</h3>
                <p className="text-on-surface-variant text-base leading-relaxed">Test your grasp of core principles.</p>
              </div>

              <div className="bg-surface-container-lowest p-8 rounded-2xl ring-1 ring-outline-variant/10 shadow-[0_4px_24px_rgba(25,28,29,0.02)] hover:shadow-[0_12px_32px_rgba(25,28,29,0.06)] transition-all">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
                  <Smartphone size={24} />
                </div>
                <h3 className="font-inter text-xl font-bold text-on-surface mb-3">Flexibility</h3>
                <p className="text-on-surface-variant text-base leading-relaxed">Study on any device, anywhere.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-32">
          <div className="flex flex-col lg:flex-row gap-16 lg:items-center">
            <div className="flex-1">
              <h2 className="font-manrope text-3xl md:text-5xl font-bold text-on-surface mb-6 leading-tight tracking-tight">
                Break down complex concepts into digestible insights.
              </h2>
              <p className="font-inter text-on-surface-variant text-lg leading-relaxed mb-8">
                We focus on ensuring you truly understand the "why" and "how" of nursing practice. Test your comprehension of fundamental concepts to build confidence for your semester and professional exams.
              </p>
              <div className="bg-tertiary/5 border-l-[6px] border-tertiary p-6 md:p-8 rounded-r-xl">
                <p className="italic text-on-surface-variant text-lg font-medium leading-relaxed">
                  "Understanding the physiological mechanism of a disease process is far more powerful than memorizing a list of its symptoms."
                </p>
              </div>
            </div>
            
            <div className="flex-1 lg:pl-12 flex justify-center">
              <div className="bg-primary/95 text-on-primary rounded-[2rem] p-12 text-center max-w-sm w-full shadow-[0_20px_40px_rgba(0,32,69,0.15)] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                <div className="relative z-10">
                  <div className="text-sm font-bold uppercase tracking-widest mb-4 text-on-primary/80">Mastery Level</div>
                  <div className="font-manrope text-7xl font-bold mb-4 tracking-tighter">94%</div>
                  <div className="text-xl font-medium text-on-primary/90">Retention Rate</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* NEW: Simple Plans & Pricing Section */}
        <section id="pricing-plans" className="bg-surface-container-low py-16 md:py-24 border-t border-surface-container">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="font-manrope text-3xl md:text-4xl font-bold text-on-surface mb-4">Simple, Straightforward Pricing</h2>
              <p className="text-on-surface-variant text-lg max-w-2xl mx-auto">
                Pay only for what you need. Unlock specific topics or test your readiness with our mock exams.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              
              {/* Single Topic Plan */}
              <div className="bg-white rounded-3xl p-8 border border-outline-variant/20 shadow-md flex flex-col">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Topic Unlock</h3>
                  <p className="text-gray-500">Perfect for targeted semester preparation.</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-gray-900">₦500</span>
                  <span className="text-gray-500 font-medium"> / topic</span>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-start gap-3">
                    <Clock className="text-blue-600 shrink-0 mt-0.5" size={20} />
                    <span className="text-gray-700">Full access to the module for <strong>30 Days</strong></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="text-blue-600 shrink-0 mt-0.5" size={20} />
                    <span className="text-gray-700">AI-generated clinical rationales</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="text-blue-600 shrink-0 mt-0.5" size={20} />
                    <span className="text-gray-700">Comprehension quizzes to test retention</span>
                  </li>
                </ul>
                <Button variant="outline" onClick={handleGoogleLogin} className="w-full py-4 border-2 font-bold hover:bg-blue-50 text-blue-700">
                  Login to Unlock
                </Button>
              </div>

              {/* Mock Exam Plan */}
              <div className="bg-gradient-to-b from-blue-600 to-blue-800 rounded-3xl p-8 border border-blue-500 shadow-xl flex flex-col text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                  Popular
                </div>
                <div className="mb-6 relative z-10">
                  <h3 className="text-2xl font-bold text-white mb-2">Exam Credits</h3>
                  <p className="text-blue-100">Test your overall clinical readiness.</p>
                </div>
                <div className="mb-6 relative z-10">
                  <span className="text-4xl font-extrabold text-white">₦1,500</span>
                  <span className="text-blue-200 font-medium"> / bundle</span>
                </div>
                <ul className="space-y-4 mb-8 flex-1 relative z-10">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="text-amber-400 shrink-0 mt-0.5" size={20} />
                    <span className="text-white"><strong>3 Attempts</strong> at full mock exams</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="text-amber-400 shrink-0 mt-0.5" size={20} />
                    <span className="text-white">Detailed performance breakdown by topic</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="text-amber-400 shrink-0 mt-0.5" size={20} />
                    <span className="text-white">Review mode for incorrect answers</span>
                  </li>
                </ul>
                <Button variant="primary" onClick={handleGoogleLogin} className="w-full py-4 bg-white text-blue-700 hover:bg-gray-50 font-bold relative z-10">
                  Get Exam Credits
                </Button>
              </div>

            </div>
          </div>
        </section>

      </main>

      {/* Footer replacing the old text */}
      <footer className="bg-surface py-8 border-t border-outline-variant/20 text-center">
        <p className="text-on-surface-variant text-sm font-medium">
          NurseTutorNG | Enabling lasting comprehension and clinical confidence.
        </p>
      </footer>
    </div>
  );
};

export default Landing;