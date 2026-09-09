import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/services/api';

// ── Field component defined OUTSIDE RegisterPage to prevent remounting on every render ──
interface FieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Field: React.FC<FieldProps> = ({ label, name, type = 'text', placeholder, required = false, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-foreground/80 mb-1.5">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    <input
      name={name}
      type={type}
      placeholder={placeholder}
      required={required}
      value={value}
      onChange={onChange}
      className="w-full h-11 px-4 rounded-xl border border-border bg-background dark:bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-duwaz-brown/25 focus:border-duwaz-brown transition-all"
    />
  </div>
);

const RegisterPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    studentName: '', studentNumber: '', email: '',
    password: '', confirmPassword: '', locationAddress: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const pwdMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;
  const pwdStrong = formData.password.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast({ title: 'Passwords do not match', variant: 'destructive' }); return;
    }
    if (formData.password.length < 6) {
      toast({ title: 'Password must be at least 6 characters', variant: 'destructive' }); return;
    }
    setIsLoading(true);
    try {
      const response = await authApi.register({
        studentName: formData.studentName,
        studentNumber: formData.studentNumber,
        email: formData.email,
        password: formData.password,
        locationAddress: formData.locationAddress || undefined,
      });
      register(response.token, {
        userId: response.userId,
        studentName: response.studentName,
        email: response.email,
        role: ((response as any).role ?? 'CUSTOMER') as any,
      });
      toast({ title: 'Account created!', description: `Welcome to Duwaz, ${response.studentName}!` });
      navigate('/');
    } catch (err: any) {
      toast({ title: 'Registration failed', description: err.message || 'Could not create account', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-duwaz-cream/30">
      {/* Decorative left panel */}
      <div className="hidden lg:flex lg:w-5/12 bg-[#3A1A08] relative overflow-hidden flex-col items-center justify-center p-12">
        <div className="absolute inset-0 opacity-20"
          style={{backgroundImage:'radial-gradient(circle at 30% 70%, #C8936A 0%, transparent 50%), radial-gradient(circle at 70% 30%, #8B4C1C 0%, transparent 60%)'}}
        />
        <div className="relative text-center space-y-6">
          <span className="font-serif text-5xl text-white">Duwaz.</span>
          <p className="text-white/60 text-base leading-relaxed max-w-xs">
            Join thousands of students buying and selling on campus.
          </p>
          <div className="space-y-3 text-left">
            {['Buy from student sellers', 'Open your own shop', 'Campus delivery', 'Earn rewards'].map(t => (
              <div key={t} className="flex items-center gap-2.5 text-white/70 text-sm">
                <CheckCircle2 className="h-4 w-4 text-duwaz-light-brown flex-shrink-0" />
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 overflow-y-auto">
        <Link to="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-duwaz-brown transition-colors mb-8 self-start">
          <ArrowLeft className="h-4 w-4" />Back to Marketplace
        </Link>

        <div className="w-full max-w-md">
          <div className="mb-7">
            <h1 className="font-serif text-3xl text-foreground mb-1">Create Account</h1>
            <p className="text-sm text-muted-foreground">Join the Duwaz student community</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Full Name" name="studentName" placeholder="Sipho Mabaso" required value={formData.studentName} onChange={handleChange} />
            <Field label="Student Number" name="studentNumber" placeholder="ST12345678" required value={formData.studentNumber} onChange={handleChange} />
            <Field label="Email" name="email" type="email" placeholder="you@university.ac.za" required value={formData.email} onChange={handleChange} />

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1.5">Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  name="password" type={showPwd ? 'text' : 'password'} required
                  placeholder="Min. 6 characters"
                  value={formData.password} onChange={handleChange}
                  className="w-full h-11 px-4 pr-11 rounded-xl border border-border bg-background dark:bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-duwaz-brown/25 focus:border-duwaz-brown transition-all"
                />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {formData.password && (
                <p className={`text-xs mt-1 ${pwdStrong ? 'text-green-600' : 'text-red-500'}`}>
                  {pwdStrong ? '✓ Strong enough' : '✗ At least 6 characters required'}
                </p>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1.5">Confirm Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  name="confirmPassword" type={showConfirm ? 'text' : 'password'} required
                  placeholder="Repeat your password"
                  value={formData.confirmPassword} onChange={handleChange}
                  className="w-full h-11 px-4 pr-11 rounded-xl border border-border bg-background dark:bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-duwaz-brown/25 focus:border-duwaz-brown transition-all"
                />
                <button type="button" onClick={() => setShowConfirm(v => !v)}
                  aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {formData.confirmPassword && (
                <p className={`text-xs mt-1 ${pwdMatch ? 'text-green-600' : 'text-red-500'}`}>
                  {pwdMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                </p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1.5">Location Address <span className="text-muted-foreground font-normal">(optional)</span></label>
              <input
                name="locationAddress" type="text"
                placeholder="e.g. Room 204, Res Block B, DUT Campus"
                value={formData.locationAddress} onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl border border-border bg-background dark:bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-duwaz-brown/25 focus:border-duwaz-brown transition-all"
              />
              <p className="text-xs text-muted-foreground mt-1">Used as your default delivery address. You can update this later.</p>
            </div>

            <button
              type="submit" disabled={isLoading}
              className="w-full h-11 rounded-xl bg-duwaz-brown text-white font-semibold text-sm shadow-sm hover:bg-duwaz-brown/90 active:scale-[0.99] transition-all duration-200 disabled:opacity-60 mt-2"
            >
              {isLoading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="mt-5 text-sm text-center text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-duwaz-brown font-medium hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
