import React from 'react';

/**
 * Loading skeleton for MathJax content
 * @param {Object} props
 * @param {string} props.className - Additional CSS classes
 */
export const MathJaxSkeleton = ({ className = "" }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="h-6 bg-gray-700 rounded w-3/4"></div>
    </div>
  );
};

export default MathJaxSkeleton;