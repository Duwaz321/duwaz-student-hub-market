import { Link } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';

const UnauthorizedPage = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center bg-background">
    <div className="mb-6 w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
      <Lock className="h-8 w-8 text-amber-600" />
    </div>
    <h1 className="font-semibold text-2xl text-foreground mb-2">Access Denied</h1>
    <p className="text-sm text-muted-foreground max-w-xs mb-8 leading-relaxed">
      You don't have permission to access this page. Please sign in with the correct account.
    </p>
    <div className="flex flex-col sm:flex-row gap-3">
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-duwaz-brown text-white text-sm font-semibold hover:bg-duwaz-brown/90 transition-all shadow-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>
      <Link
        to="/login"
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-border text-foreground text-sm font-semibold hover:border-duwaz-brown/40 transition-all"
      >
        Sign In
      </Link>
    </div>
  </div>
);

export default UnauthorizedPage;
