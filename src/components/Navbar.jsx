import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from './Button';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Pull currentUser, logout, and loginWithGoogle from context
  const { currentUser, logout, loginWithGoogle } = useAuth(); 

  const isLandingPage = location.pathname === '/';

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  // Centralized Login Handler
  const handleLogin = async () => {
    try {
      await loginWithGoogle();
      setIsMobileMenuOpen(false); // Close menu if on mobile
      navigate('/dashboard');
    } catch (error) {
      console.error("Error during Google login:", error.message);
      alert("Failed to log in. Please try again.");
    }
  };

  // Handle the logout process
  const handleLogout = async () => {
    try {
      await logout();
      setIsMobileMenuOpen(false); // Close mobile menu if open
      navigate('/'); // Redirect to landing page
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <nav className="bg-surface-container sticky top-0 z-50 border-b border-surface-container-high relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center gap-2 cursor-pointer" onClick={() => setIsMobileMenuOpen(false)}>
              <span className="font-manrope font-bold text-xl text-primary">NurseMaster</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            {/* If on landing page OR not logged in, show Sign In */}
            {isLandingPage || !currentUser ? (
              <Button variant="primary" onClick={handleLogin} className="px-6 py-2 text-sm font-bold">
                Sign In with Google
              </Button>
            ) : (
              <>
                <Link to="/dashboard" className="text-on-surface-variant hover:text-on-surface font-inter text-sm font-medium cursor-pointer">Home</Link>
                <Link to="/quiz-setup" className="text-on-surface-variant hover:text-on-surface font-inter text-sm font-medium cursor-pointer">Exams</Link>
                <Link to="/subscription" className="text-on-surface-variant hover:text-on-surface font-inter text-sm font-medium cursor-pointer">Profile</Link>
                
                {/* Desktop Logout Button */}
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 font-inter text-sm font-medium ml-4 transition-colors cursor-pointer"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center">
            {isLandingPage || !currentUser ? (
              <Button variant="primary" onClick={handleLogin} className="px-5 py-2 text-sm font-bold">
                Sign In
              </Button>
            ) : (
              <button
                onClick={toggleMenu}
                className="text-on-surface-variant hover:text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-md p-1 transition-colors cursor-pointer"
                aria-label="Toggle Navigation"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {!isLandingPage && currentUser && isMobileMenuOpen && (
        <div className="md:hidden absolute top-[64px] left-0 w-full bg-surface-container-lowest border-b border-surface-container-high shadow-lg z-50 animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-4 space-y-2 flex flex-col">
            <Link 
              to="/dashboard" 
              className="text-on-surface-variant hover:text-primary hover:bg-surface-container-low px-4 py-3 rounded-xl font-inter text-base font-semibold transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/quiz-setup" 
              className="text-on-surface-variant hover:text-primary hover:bg-surface-container-low px-4 py-3 rounded-xl font-inter text-base font-semibold transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Exams
            </Link>
            <Link 
              to="/subscription" 
              className="text-on-surface-variant hover:text-primary hover:bg-surface-container-low px-4 py-3 rounded-xl font-inter text-base font-semibold transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Profile
            </Link>
            
            {/* Mobile Logout Button */}
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-left text-red-600 hover:bg-red-50 px-4 py-3 rounded-xl font-inter text-base font-semibold transition-colors w-full cursor-pointer mt-2 border-t border-surface-container-high pt-4"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;