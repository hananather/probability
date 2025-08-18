'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 * and displays a fallback UI instead of crashing the whole app
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Update state with error details
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));
    
    // You can also log the error to an error reporting service here
    // Example: errorReportingService.logError(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  render() {
    if (this.state.hasError) {
      // Determine if this is a visualization-specific error
      const isVisualizationError = this.props.fallbackType === 'visualization';
      
      if (isVisualizationError) {
        // Minimal fallback for visualization errors
        return (
          <div className="flex items-center justify-center h-full bg-neutral-900/50 rounded-lg p-4">
            <div className="text-center">
              <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-sm text-neutral-400">
                Unable to load visualization
              </p>
              <Button
                size="sm"
                variant="ghost"
                onClick={this.handleReset}
                className="mt-2 text-xs"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Retry
              </Button>
            </div>
          </div>
        );
      }
      
      // Full error boundary UI for page-level errors
      return (
        <div 
          className="min-h-screen bg-neutral-900 flex items-center justify-center p-4"
          role="alert"
          aria-live="assertive"
        >
          <div className="max-w-md w-full bg-neutral-800 rounded-xl p-6 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <AlertTriangle className="w-8 h-8 text-red-500" aria-hidden="true" />
              </div>
              
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-white mb-2">
                  Something went wrong
                </h2>
                
                <p className="text-sm text-neutral-300 mb-4">
                  We encountered an unexpected error. The issue has been logged and we'll look into it.
                </p>
                
                {/* Show error details in development */}
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="mb-4">
                    <summary className="text-xs text-neutral-400 cursor-pointer hover:text-neutral-300">
                      Error details (development only)
                    </summary>
                    <pre className="mt-2 text-xs text-red-400 bg-neutral-900 p-2 rounded overflow-auto max-h-40">
                      {this.state.error.toString()}
                      {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
                
                <div className="flex gap-2">
                  <Button
                    onClick={this.handleReset}
                    size="sm"
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                  
                  <Button
                    onClick={() => window.location.href = '/'}
                    size="sm"
                    variant="outline"
                  >
                    Go Home
                  </Button>
                </div>
                
                {this.state.errorCount > 2 && (
                  <p className="mt-3 text-xs text-yellow-500">
                    This error has occurred multiple times. Try refreshing the page.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component to wrap components with error boundary
export function withErrorBoundary(Component, fallbackType) {
  return function WithErrorBoundaryComponent(props) {
    return (
      <ErrorBoundary fallbackType={fallbackType}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

export default ErrorBoundary;