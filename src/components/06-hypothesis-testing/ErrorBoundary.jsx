import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-8">
          <div className="max-w-2xl w-full bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-red-500/50">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Something went wrong</h2>
            <p className="text-gray-300 mb-4">
              We encountered an error while loading this component. This might be due to:
            </p>
            <ul className="list-disc list-inside text-gray-400 space-y-2 mb-6">
              <li>A navigation issue - you may be on the wrong page</li>
              <li>Missing dependencies or props</li>
              <li>Browser compatibility issues</li>
            </ul>
            <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
              <p className="text-sm font-mono text-red-300">
                {this.state.error?.toString()}
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;