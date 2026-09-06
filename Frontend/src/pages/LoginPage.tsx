import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/services/api';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleLogin = async (forceAdmin: boolean) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(formData);
      const role = (response.role ?? 'CUSTOMER') as 'CUSTOMER' | 'ADMIN';

      login(response.token, {
        userId: response.userId,
        studentName: response.studentName,
        email: response.email,
        role,
        locationAddress: (response as any).locationAddress ?? undefined,
      });

      toast({ title: `Welcome back, ${response.studentName}!` });

      if (forceAdmin || role === 'ADMIN') {
        if (role !== 'ADMIN') {
          toast({ title: 'Access denied', description: 'No admin privileges.', variant: 'destructive' });
          return;
        }
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      toast({ title: 'Login failed', description: err.message || 'Invalid credentials', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-duwaz-cream/30">
      {/* Left decorative panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#3A1A08] relative overflow-hidden flex-col items-center justify-center p-12">
        <div className="absolute inset-0 opacity-20"
          style={{backgroundImage:'radial-gradient(circle at 30% 70%, #C8936A 0%, transparent 50%), radial-gradient(circle at 70% 30%, #8B4C1C 0%, transparent 60%)'}}
        />
        <div className="relative text-center">
          <span className="font-serif text-5xl text-white">Duwaz.</span>
          <p className="mt-4 text-white/60 text-lg leading-relaxed max-w-xs">
            Your campus marketplace. Discover, buy and sell — all in one place.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <Link to="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-duwaz-brown transition-colors mb-10 self-start">
          <ArrowLeft className="h-4 w-4" />Back to Marketplace
        </Link>

        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="font-serif text-3xl text-foreground mb-1">Sign In</h1>
            <p className="text-sm text-muted-foreground">Enter your details to access your account</p>
          </div>

          <form onSubmit={e => { e.preventDefault(); handleLogin(adminMode); }} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1.5">Email</label>
              <input
                name="email" type="email" required
                placeholder="you@example.com"
                value={formData.email} onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl border border-border bg-background dark:bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-duwaz-brown/25 focus:border-duwaz-brown transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1.5">Password</label>
              <div className="relative">
                <input
                  name="password" type={showPwd ? 'text' : 'password'} required
                  placeholder="••••••••"
                  value={formData.password} onChange={handleChange}
                  className="w-full h-11 px-4 pr-11 rounded-xl border border-border bg-background dark:bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-duwaz-brown/25 focus:border-duwaz-brown transition-all"
                />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              onClick={() => setAdminMode(false)}
              disabled={isLoading}
              className="w-full h-11 rounded-xl bg-duwaz-brown text-white font-semibold text-sm shadow-sm hover:bg-duwaz-brown/90 active:scale-[0.99] transition-all duration-200 disabled:opacity-60"
            >
              {isLoading && !adminMode ? 'Signing in…' : 'Sign In'}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-duwaz-cream/30 px-3 text-xs text-muted-foreground">or</span>
              </div>
            </div>

            <button
              type="submit"
              onClick={() => setAdminMode(true)}
              disabled={isLoading}
              className="w-full h-11 rounded-xl border border-duwaz-brown/40 text-duwaz-brown font-semibold text-sm hover:bg-duwaz-brown hover:text-white active:scale-[0.99] transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <ShieldCheck className="h-4 w-4" />
              {isLoading && adminMode ? 'Signing in…' : 'Sign In as Admin'}
            </button>
          </form>

          <div className="mt-6 space-y-2 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="text-duwaz-brown font-medium hover:underline">Sign Up</Link>
            </p>
            <p className="text-sm text-muted-foreground">
              Are you a driver?{' '}
              <Link to="/driver/login" className="text-duwaz-brown font-medium hover:underline">Driver Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
