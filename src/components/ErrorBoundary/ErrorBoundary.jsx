import { Component } from 'react';
import PropTypes from 'prop-types';
import useStore from '../../store/useStore';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // You can also log the error to your error tracking service here
    // Example: logErrorToService(error, errorInfo);
    
    // Update the global error state
    if (this.props.setError) {
      this.props.setError({
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-4">
                Something went wrong
              </h2>
              <p className="text-gray-700 mb-6">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
              
              {process.env.NODE_ENV === 'development' && (
                <details className="mb-6 text-left">
                  <summary className="text-sm font-medium text-gray-700 cursor-pointer mb-2">
                    Error details
                  </summary>
                  <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs text-gray-800">
                    {this.state.error?.stack}
                  </pre>
                </details>
              )}
              
              <div className="flex justify-center space-x-4">
                <button
                  onClick={this.handleReset}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Try again
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Reload page
                </button>
              </div>
              
              {this.props.contactSupport && (
                <div className="mt-6 text-sm text-gray-600">
                  <p>If the problem persists, please contact support.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  onReset: PropTypes.func,
  setError: PropTypes.func,
  contactSupport: PropTypes.bool,
  fallback: PropTypes.element,
};

export default ErrorBoundary;

// Higher-order component for easier usage with hooks
const withErrorBoundary = (WrappedComponent) => {
  return function WithErrorBoundary(props) {
    const setError = useStore((state) => state.setError);
    
    return (
      <ErrorBoundary setError={setError}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
};

export { withErrorBoundary };
