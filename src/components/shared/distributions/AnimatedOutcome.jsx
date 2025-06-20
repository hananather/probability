import React, { useEffect, useState } from 'react';
import { animations } from '@/utils/distribution-theme';

/**
 * Reusable animated outcome visualization component
 * Shows the result of a single trial with engaging animations
 * 
 * @param {Object} props
 * @param {String} props.type - Type of outcome animation ('coin', 'dice', 'success', 'event', 'custom')
 * @param {Any} props.outcome - The outcome value to display
 * @param {Boolean} props.isAnimating - Whether to show animation
 * @param {Object} props.theme - Distribution theme
 * @param {Function} props.onAnimationComplete - Callback when animation completes
 * @param {Object} props.customConfig - Custom configuration for the animation
 * @param {String} props.size - Size of the outcome display ('small', 'medium', 'large')
 */
const AnimatedOutcome = ({
  type = 'success',
  outcome,
  isAnimating = false,
  theme,
  onAnimationComplete,
  customConfig = {},
  size = 'medium'
}) => {
  const [showResult, setShowResult] = useState(!isAnimating);
  const [animationPhase, setAnimationPhase] = useState('idle');
  
  useEffect(() => {
    if (isAnimating) {
      setShowResult(false);
      setAnimationPhase('animating');
      
      const timer = setTimeout(() => {
        setShowResult(true);
        setAnimationPhase('complete');
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      }, animations.duration.normal);
      
      return () => clearTimeout(timer);
    } else {
      setShowResult(true);
      setAnimationPhase('idle');
    }
  }, [isAnimating, onAnimationComplete]);
  
  const sizeClasses = {
    small: 'w-16 h-16 text-2xl',
    medium: 'w-24 h-24 text-3xl',
    large: 'w-32 h-32 text-4xl'
  };
  
  const renderOutcome = () => {
    switch (type) {
      case 'coin':
        return (
          <div className={`
            ${sizeClasses[size]}
            rounded-full
            bg-gradient-to-br ${theme.gradient}
            text-white font-bold
            flex items-center justify-center
            shadow-lg ${theme.shadow}
            ${isAnimating ? 'animate-spin' : ''}
            ${showResult ? 'opacity-100' : 'opacity-0'}
            transition-opacity duration-300
          `}
          style={{
            animation: isAnimating ? 'coinFlip 1s ease-in-out' : 'none',
            transformStyle: 'preserve-3d'
          }}>
            {showResult && (
              <span className="animate-fadeIn">
                {outcome ? 'H' : 'T'}
              </span>
            )}
          </div>
        );
        
      case 'dice':
        const dots = outcome || 1;
        return (
          <div className={`
            ${sizeClasses[size]}
            rounded-lg
            bg-white
            border-4 border-${theme.name.toLowerCase()}-500
            shadow-lg
            flex items-center justify-center
            ${isAnimating ? 'animate-bounce' : ''}
            ${showResult ? 'opacity-100' : 'opacity-0'}
            transition-all duration-300
          `}>
            {showResult && (
              <div className="grid grid-cols-3 gap-1 p-2">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className={`
                      w-2 h-2 rounded-full
                      ${i < dots ? `bg-${theme.name.toLowerCase()}-600` : 'bg-transparent'}
                    `}
                  />
                ))}
              </div>
            )}
          </div>
        );
        
      case 'success':
        const isSuccess = outcome === true || outcome === 'success';
        return (
          <div className={`
            ${sizeClasses[size]}
            rounded-full
            ${isSuccess 
              ? 'bg-gradient-to-br from-green-400 to-green-600' 
              : 'bg-gradient-to-br from-gray-400 to-gray-600'}
            text-white
            flex items-center justify-center
            shadow-lg
            ${animationPhase === 'complete' ? 'animate-bounce' : ''}
            ${showResult ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}
            transition-all duration-500
          `}
          style={{
            animation: animationPhase === 'complete' && isSuccess 
              ? 'successPulse 0.5s ease-out' 
              : 'none'
          }}>
            {showResult && (
              <svg className="w-3/5 h-3/5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isSuccess ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                )}
              </svg>
            )}
          </div>
        );
        
      case 'event':
        return (
          <div className={`
            ${sizeClasses[size]}
            rounded-full
            bg-gradient-to-br ${theme.gradient}
            text-white font-bold
            flex items-center justify-center
            shadow-lg ${theme.shadow}
            ${showResult ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}
            transition-all duration-500
          `}
          style={{
            animation: showResult ? 'eventAppear 0.5s ease-out' : 'none'
          }}>
            <span className="text-2xl">
              {outcome || '★'}
            </span>
          </div>
        );
        
      case 'custom':
        return (
          <div className={`
            ${sizeClasses[size]}
            ${customConfig.className || ''}
            ${showResult ? 'opacity-100' : 'opacity-0'}
            transition-opacity duration-300
          `}
          style={{
            animation: isAnimating ? (customConfig.animation || 'none') : 'none',
            ...customConfig.style
          }}>
            {showResult && (customConfig.render ? customConfig.render(outcome) : outcome)}
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="animated-outcome-container flex flex-col items-center gap-4">
      <div className="outcome-display">
        {renderOutcome()}
      </div>
      
      {showResult && customConfig.label && (
        <div className={`
          text-center
          animate-${animations.keyframes.slideIn}
        `}>
          <p className="text-sm text-gray-600">{customConfig.label}</p>
          <p className={`
            text-lg font-semibold
            text-${theme.name.toLowerCase()}-600
          `}>
            {customConfig.value || outcome}
          </p>
        </div>
      )}
    </div>
  );
};

// Add custom animation styles
const styleElement = document.createElement('style');
styleElement.textContent = `
  @keyframes coinFlip {
    0% { transform: rotateY(0deg) scale(1); }
    25% { transform: rotateY(900deg) scale(1.1); }
    50% { transform: rotateY(1800deg) scale(1.2); }
    75% { transform: rotateY(2700deg) scale(1.1); }
    100% { transform: rotateY(3600deg) scale(1); }
  }
  
  @keyframes successPulse {
    0% { transform: scale(0.8); opacity: 0; }
    50% { transform: scale(1.2); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
  }
  
  @keyframes eventAppear {
    0% { 
      transform: scale(0) translateY(20px) rotate(-180deg); 
      opacity: 0; 
    }
    50% { 
      transform: scale(1.2) translateY(-5px) rotate(90deg); 
      opacity: 0.8; 
    }
    100% { 
      transform: scale(1) translateY(0) rotate(0deg); 
      opacity: 1; 
    }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }
`;

if (!document.getElementById('animated-outcome-styles')) {
  styleElement.id = 'animated-outcome-styles';
  document.head.appendChild(styleElement);
}

export default AnimatedOutcome;