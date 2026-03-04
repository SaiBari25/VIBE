import React from 'react';
import './ElectricBorder.css';

const ElectricBorder = ({ children, borderRadius = 32, className = "" }) => {
  return (
    <div className={`rgb-container ${className}`} style={{ borderRadius: `${borderRadius}px` }}>
      <div className="rgb-content" style={{ borderRadius: `${borderRadius - 2}px` }}>
        {children}
      </div>
    </div>
  );
};

export default ElectricBorder;