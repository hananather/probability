"use client";

import React from 'react';
import { handleGlobalError } from '@/utils/errorReporting';
import { showErrorNotification } from '@/contexts/NotificationContext';

/**
 * Error boundary specifically for SVG rendering issues
 * Provides graceful fallbacks for SVG dimension errors and rendering problems
 */
class SVGErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Use centralized error handling
    const formattedError = handleGlobalError(error, errorInfo, 'SVGErrorBoundary');
    
    // Show user notification if available
    showErrorNotification(error, {
      title: 'Visualization Error',
      technicalDetails: formattedError.technicalDetails
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-yellow-900/20 p-4 rounded-lg border border-yellow-600/30 min-h-[200px] flex items-center justify-center">
          <div className="text-center">
            <div className="text-yellow-400 mb-2">
              <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h4 className="font-semibold text-yellow-400 mb-2">
              Visualization Temporarily Unavailable
            </h4>
            <p className="text-neutral-300 text-sm mb-3">
              {this.props.fallbackMessage || 'The SVG visualization encountered a rendering issue. This may be due to invalid dimensions or browser compatibility.'}
            </p>
            {this.props.showRetry && (
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm transition-colors"
              >
                Retry Visualization
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component for safe SVG dimension handling
 * Validates dimensions before rendering and provides fallbacks
 */
export const withSafeSVGDimensions = (WrappedComponent) => {
  return function SafeSVGComponent(props) {
    const validateDimensions = (width, height) => {
      const isValidNumber = (val) => 
        typeof val === 'number' && 
        isFinite(val) && 
        !isNaN(val) && 
        val > 0;

      return {
        isValid: isValidNumber(width) && isValidNumber(height),
        safeWidth: isValidNumber(width) ? Math.max(300, Math.min(width, 2000)) : 800,
        safeHeight: isValidNumber(height) ? Math.max(200, Math.min(height, 1200)) : 500
      };
    };

    return (
      <SVGErrorBoundary
        fallbackMessage="SVG visualization failed to load due to dimension validation errors."
        showRetry={true}
      >
        <WrappedComponent {...props} validateDimensions={validateDimensions} />
      </SVGErrorBoundary>
    );
  };
};

/**
 * Safe SVG container component with built-in error handling
 */
export const SafeSVGContainer = ({ 
  children, 
  width = 800, 
  height = 500, 
  className = "",
  fallbackMessage,
  ...props 
}) => {
  const validateDimensions = (w, h) => {
    const isValidNumber = (val) => 
      typeof val === 'number' && 
      isFinite(val) && 
      !isNaN(val) && 
      val > 0;

    return {
      isValid: isValidNumber(w) && isValidNumber(h),
      safeWidth: isValidNumber(w) ? Math.max(300, Math.min(w, 2000)) : 800,
      safeHeight: isValidNumber(h) ? Math.max(200, Math.min(h, 1200)) : 500
    };
  };

  const { safeWidth, safeHeight } = validateDimensions(width, height);

  return (
    <SVGErrorBoundary fallbackMessage={fallbackMessage} showRetry={true}>
      <svg 
        width={safeWidth} 
        height={safeHeight} 
        className={className}
        {...props}
      >
        {children}
      </svg>
    </SVGErrorBoundary>
  );
};

/**
 * Utility function for safe SVG dimension extraction from DOM elements
 */
export const getSafeSVGDimensions = (element, defaults = { width: 800, height: 500 }) => {
  if (!element) {
    return defaults;
  }

  try {
    const boundingRect = element.getBoundingClientRect();
    
    const isValidDimension = (val) => 
      typeof val === 'number' && 
      isFinite(val) && 
      !isNaN(val) && 
      val > 0;

    const width = isValidDimension(boundingRect.width) 
      ? Math.max(300, Math.min(boundingRect.width, 2000))
      : defaults.width;
      
    const height = isValidDimension(boundingRect.height) 
      ? Math.max(200, Math.min(boundingRect.height, 1200))
      : defaults.height;

    return { width, height };
  } catch (error) {
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error getting SVG dimensions:', error);
    }
    return defaults;
  }
};

export default SVGErrorBoundary;