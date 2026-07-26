import React from 'react';

const Card = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`bg-surface-container-lowest rounded-xl p-6 transition-colors duration-200 hover:bg-surface-bright ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
