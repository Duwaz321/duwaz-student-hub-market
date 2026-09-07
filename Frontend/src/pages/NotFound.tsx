import { Link } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';

const NotFound = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center bg-background">
    <div className="mb-6">
      <span className="font-serif text-8xl text-duwaz-brown/15 select-none">404</span>
    </div>
    <h1 className="font-semibold text-2xl text-foreground mb-2">Page not found</h1>
    <p className="text-sm text-muted-foreground max-w-xs mb-8 leading-relaxed">
      Sorry, the page you're looking for doesn't exist or has been moved.
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
        to="/marketplace"
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-border text-foreground text-sm font-semibold hover:border-duwaz-brown/40 transition-all"
      >
        <Search className="h-4 w-4" />
        Browse Marketplace
      </Link>
    </div>
  </div>
);

export default NotFound;
