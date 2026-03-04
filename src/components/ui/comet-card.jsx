import React from "react";

export const CometCard = ({ children, className = "" }) => {
  return (
    <div className={`relative inline-block overflow-hidden rounded-[24px] p-[2px] ${className}`}>
      {/* The Animated Spinning Comet Tail */}
      <div className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,#a855f7_50%,transparent_100%)]" />
      
      {/* The Inner Card Content */}
      <div className="relative h-full w-full rounded-[22px] bg-black">
        {children}
      </div>
    </div>
  );
};