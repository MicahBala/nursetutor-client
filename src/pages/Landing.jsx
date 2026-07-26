import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/Button';
import { BookOpen, Shield, Smartphone, Info, Users } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const { currentUser, loginWithGoogle } = useAuth(); // <-- Pull from Context

  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }


  const handleGoogleLogin = async () => {
    try {
      const result = await loginWithGoogle(); // <-- Call context function
      const user = result.user;

      console.log("Login Successful!");
      console.log("Name:", user.displayName);
      console.log("Email:", user.email);
      console.log("Firebase UID:", user.uid);

      // Redirect the user to the dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error("Error during Google login:", error.message);
      alert("Failed to log in. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
          <h1 className="font-manrope text-4xl md:text-6xl font-bold text-on-surface tracking-tight mb-6 leading-tight">
            NurseMaster: <br className="hidden md:block"/> Master Difficult Topics in 5 Minutes.
          </h1>
          <p className="font-inter text-on-surface-variant max-w-3xl mx-auto mb-10 text-lg md:text-xl leading-relaxed">
            A whole, new approach to nursing education. We strip away the noise to help you master critical concepts with precision and speed.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-10">
            <Button variant="gradient" onClick={handleGoogleLogin} className="text-lg px-10 py-4">
              Continue with Google
            </Button>
            <Button variant="secondary" onClick={() => navigate('/subscription')} className="text-lg px-8 py-4 bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/20 hover:text-on-surface shadow-sm">
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
                <h3 className="font-inter text-xl font-bold text-on-surface mb-3">Mock Exams</h3>
                <p className="text-on-surface-variant text-base leading-relaxed">Simulate the real NMCN environment.</p>
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
                Expert "Exam Secrets" included in every module.
              </h2>
              <p className="font-inter text-on-surface-variant text-lg leading-relaxed mb-8">
                Our editors highlight the critical "Must-Know" tips that appear most frequently in past exam papers, saving you hours of aimless reading.
              </p>
              <div className="bg-tertiary/5 border-l-[6px] border-tertiary p-6 md:p-8 rounded-r-xl">
                <p className="italic text-on-surface-variant text-lg font-medium leading-relaxed">
                  "Always prioritize the silent patient with a blocked airway over the screaming patient with a fractured arm."
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
      </main>

      <Footer />
    </div>
  );
};

export default Landing;