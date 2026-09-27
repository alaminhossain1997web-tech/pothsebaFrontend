import React from 'react';

const PrimaryButton = ({ 
  children, 
  type = 'submit', 
  onClick, 
  className = '', 
  style = {}, 
  ...props 
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`w-full py-3 rounded-lg font-bold text-white transition-transform transform active:scale-95 shadow-md hover:opacity-90 cursor-pointer ${className}`}
      style={{ backgroundColor: '#F27A00', ...style }}
      {...props}
    >
      {children}
    </button>
  );
};

export default PrimaryButton;