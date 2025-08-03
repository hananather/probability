"use client";

import React from 'react';

class MathErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error for debugging
    console.error('Mathematical calculation error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI for mathematical errors
      return (
        <div className="bg-red-900/20 p-4 rounded-lg border border-red-600/30">
          <h4 className="font-semibold text-red-400 mb-2">
            ⚠️ Mathematical Error
          </h4>
          <p className="text-neutral-300 text-sm mb-2">
            {this.props.fallbackMessage || 'A mathematical calculation encountered an error. This might be due to invalid input values or edge cases like division by zero.'}
          </p>
          <details className="text-xs text-neutral-400">
            <summary className="cursor-pointer hover:text-neutral-300">Technical Details</summary>
            <pre className="mt-2 p-2 bg-neutral-800 rounded text-xs overflow-auto">
              {this.state.error?.message || 'Unknown error'}
            </pre>
          </details>
          {this.props.showRetry && (
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="mt-3 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default MathErrorBoundary;

// Helper component for inline mathematical expressions
export const SafeMathExpression = ({ 
  calculation, 
  fallbackValue = 'N/A', 
  formatResult = (value) => value 
}) => {
  try {
    const result = calculation();
    return formatResult(result);
  } catch (error) {
    console.warn('Safe math expression error:', error);
    return fallbackValue;
  }
};

// Helper function to safely perform divisions
export const safeDivide = (numerator, denominator, fallbackValue = 0) => {
  if (denominator === 0 || !isFinite(denominator) || !isFinite(numerator)) {
    return fallbackValue;
  }
  return numerator / denominator;
};

// Helper function to safely calculate percentages
export const safePercentage = (part, total, decimals = 1, fallbackValue = 0) => {
  if (total === 0 || !isFinite(total) || !isFinite(part)) {
    return fallbackValue;
  }
  return Number((part / total * 100).toFixed(decimals));
};