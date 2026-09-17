import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

const ErrorPage = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center bg-background">
    <div className="mb-6 w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
      <AlertTriangle className="h-8 w-8 text-red-600" />
    </div>
    <h1 className="font-semibold text-2xl text-foreground mb-2">Something went wrong</h1>
    <p className="text-sm text-muted-foreground max-w-xs mb-8 leading-relaxed">
      We encountered an unexpected error. Please try again or contact support if the problem persists.
    </p>
    <div className="flex flex-col sm:flex-row gap-3">
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-duwaz-brown text-white text-sm font-semibold hover:bg-duwaz-brown/90 transition-all shadow-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>
      <button
        onClick={() => window.location.reload()}
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-border text-foreground text-sm font-semibold hover:border-duwaz-brown/40 transition-all"
      >
        Try Again
      </button>
    </div>
  </div>
);

export default ErrorPage;
