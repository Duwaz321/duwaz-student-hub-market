import React, { ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to console for debugging
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ errorInfo });

    // Could send to Sentry/logging service here
    if (window.__SENTRY__) {
      window.__SENTRY__.captureException(error, { contexts: { react: errorInfo } });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-duwaz-cream/40 to-background flex items-center justify-center px-4">
          <div className="max-w-md w-full">
            <div className="bg-white dark:bg-card rounded-3xl shadow-lg border border-border/50 p-8 text-center space-y-6">
              {/* Icon */}
              <div className="w-16 h-16 mx-auto rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>

              {/* Title & Message */}
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Something went wrong
                </h1>
                <p className="text-sm text-muted-foreground">
                  We encountered an unexpected error. Please try again or contact support if the problem persists.
                </p>
              </div>

              {/* Error details in dev mode */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-3 text-left border border-red-200 dark:border-red-800 max-h-32 overflow-y-auto">
                  <p className="text-xs font-mono text-red-600 dark:text-red-400 break-words">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <Button
                  onClick={this.handleReset}
                  className="w-full bg-duwaz-brown hover:bg-duwaz-brown/90 text-white rounded-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full rounded-full"
                >
                  <Link to="/">
                    <Home className="h-4 w-4 mr-2" />
                    Go Home
                  </Link>
                </Button>
              </div>

              {/* Support text */}
              <p className="text-xs text-muted-foreground">
                Error ID: {Math.random().toString(36).substr(2, 9)}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
