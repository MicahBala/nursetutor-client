import React from 'react';

const Badge = ({ children, className = '' }) => {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-inter font-medium border border-outline-variant/20 bg-surface-container-lowest text-on-surface-variant ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
