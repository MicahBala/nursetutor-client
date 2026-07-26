import React from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-surface-container-lowest/80 backdrop-blur-[12px]"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-surface-container-lowest w-full max-w-md mx-auto rounded-xl shadow-[0_32px_48px_rgba(25,28,29,0.06)] overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="font-manrope text-2xl font-semibold text-primary">{title}</h2>
          <button 
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>
        <div className="p-6 pt-0 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
