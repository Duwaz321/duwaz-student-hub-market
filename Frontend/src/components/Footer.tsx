import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#1A0F0A] text-white">
      {/* Main footer */}
      <div className="container mx-auto px-4 lg:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="md:col-span-2">
            <span className="font-serif text-3xl text-white/90 tracking-tight">Duwaz.</span>
            <p className="mt-3 text-sm text-white/55 leading-relaxed max-w-xs">
              The student marketplace built for campus communities across South Africa.
              Buy, sell, and grow — all in one place.
            </p>
            <div className="mt-5 flex gap-3">
              <a
                href="mailto:info@duwaz.co.za"
                className="flex items-center gap-1.5 text-xs text-white/50 hover:text-duwaz-light-brown transition-colors"
              >
                <Mail className="h-3.5 w-3.5" />duwaz2026@gmail.com
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-4">Explore</h4>
            <ul className="space-y-2.5">
              {[
                { to: '/', label: 'Home' },
                { to: '/marketplace', label: 'Marketplace' },
                { to: '/create-shop', label: 'Open a Shop' },
                { to: '/about', label: 'About Us' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-white/55 hover:text-duwaz-light-brown transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-4">Legal</h4>
            <ul className="space-y-2.5">
              <li><Link to="/privacy" className="text-sm text-white/55 hover:text-duwaz-light-brown transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-sm text-white/55 hover:text-duwaz-light-brown transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/refunds" className="text-sm text-white/55 hover:text-duwaz-light-brown transition-colors">Refunds & Returns</Link></li>
              <li><Link to="/seller-terms" className="text-sm text-white/55 hover:text-duwaz-light-brown transition-colors">Seller Terms</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/8">
        <div className="container mx-auto px-4 lg:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/35">
            &copy; {year} Duwaz Marketplace. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5">
            <Link to="/privacy" className="text-xs text-white/35 hover:text-white/60 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-xs text-white/35 hover:text-white/60 transition-colors">Terms & Conditions</Link>
            <Link to="/refunds" className="text-xs text-white/35 hover:text-white/60 transition-colors">Refunds & Returns</Link>
            <Link to="/seller-terms" className="text-xs text-white/35 hover:text-white/60 transition-colors">Seller Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
