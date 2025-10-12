'use client';

import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  className?: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div 
          className={`flex flex-col items-center justify-center min-h-[200px] p-6 bg-gray-800 border border-gray-700 rounded-lg ${this.props.className || ''}`}
          data-testid="error-boundary"
          role="alert"
        >
          <div className="text-center space-y-4">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            
            <h2 
              className="text-xl font-semibold text-white"
              data-testid="error-title"
            >
              Something went wrong
            </h2>
            
            <p 
              className="text-gray-300 max-w-md"
              data-testid="error-message"
            >
              {this.state.error?.message || 'An unexpected error occurred. Please try again.'}
            </p>

            <div className="space-y-2">
              <Button
                onClick={this.handleReset}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                data-testid="retry-button"
              >
                Try Again
              </Button>
              
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                data-testid="refresh-button"
              >
                Refresh Page
              </Button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="text-gray-400 cursor-pointer hover:text-gray-300">
                  Error Details (Development)
                </summary>
                <pre 
                  className="mt-2 p-3 bg-gray-900 border border-gray-600 rounded text-xs text-red-300 overflow-auto"
                  data-testid="error-details"
                >
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;