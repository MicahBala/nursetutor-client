import React from 'react';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyles = "inline-flex items-center justify-center font-inter transition-colors duration-200 cursor-pointer";
  
  const variants = {
    primary: "bg-primary text-on-primary hover:bg-primary-container rounded-full px-6 py-3 font-semibold",
    secondary: "bg-secondary-container text-on-secondary-container hover:bg-secondary hover:text-white rounded-full px-6 py-3 font-semibold",
    tertiary: "text-primary hover:text-primary-container px-4 py-2 font-medium bg-transparent",
    gradient: "bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-full px-6 py-3 font-semibold shadow-[0_12px_32px_rgba(25,28,29,0.06)] hover:brightness-110",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
