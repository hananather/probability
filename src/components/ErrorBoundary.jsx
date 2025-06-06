"use client";
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-900/20 border border-red-600/50 rounded-lg p-6 m-4">
          <h3 className="text-red-400 font-bold text-lg mb-2">
            ❌ Component Error: {this.props.componentName || 'Unknown Component'}
          </h3>
          <div className="text-red-300 text-sm space-y-2">
            <p className="font-semibold">Error Message:</p>
            <code className="block bg-black/50 p-2 rounded text-xs">
              {this.state.error && this.state.error.toString()}
            </code>
            {this.state.errorInfo && (
              <>
                <p className="font-semibold mt-4">Component Stack:</p>
                <pre className="bg-black/50 p-2 rounded text-xs overflow-auto max-h-40">
                  {this.state.errorInfo.componentStack}
                </pre>
              </>
            )}
          </div>
          <button 
            onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;