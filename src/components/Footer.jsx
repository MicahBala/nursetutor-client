import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-surface-container-lowest border-t border-surface-container-high py-12 mt-auto relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-center md:text-left">
           <span className="font-manrope font-bold text-2xl text-primary">NurseTutorNG</span>
           <span className="hidden md:inline text-outline-variant/40">|</span>
           <span className="text-on-surface-variant text-sm font-medium">Elevating the standards of nursing education.</span>
        </div>
        
        <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-on-surface-variant">
          <a href="#" className="hover:text-primary transition-colors hover:underline underline-offset-4">Privacy Policy</a>
          <a href="#" className="hover:text-primary transition-colors hover:underline underline-offset-4">Terms of Service</a>
          <a href="#" className="hover:text-primary transition-colors hover:underline underline-offset-4">Contact Support</a>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pt-8 border-t border-surface-container text-center md:text-left text-sm text-on-surface-variant/80 flex flex-col md:flex-row justify-between items-center gap-4">
        <span>© 2026 NurseTutorNG. All rights reserved.</span>
        <span className="text-xs uppercase tracking-widest font-bold">Trusted by Students Nationwide</span>
      </div>
    </footer>
  );
};

export default Footer;
