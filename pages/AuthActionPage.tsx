
import React from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { auth } from '../services/firebaseConfig';
import { 
  confirmPasswordReset, 
  verifyPasswordResetCode, 
  applyActionCode 
} from 'firebase/auth';
import { 
  Lock, 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  ArrowRight, 
  Code2, 
  Eye, 
  EyeOff, 
  ShieldCheck,
  MailCheck,
  Key
} from 'lucide-react';

type AuthMode = 'resetPassword' | 'verifyEmail' | 'recoverEmail' | 'none';

export const AuthActionPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const mode = searchParams.get('mode') as AuthMode || 'none';
  const oobCode = searchParams.get('oobCode');

  // Common State
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  // Reset Password State
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [userEmail, setUserEmail] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!oobCode || mode === 'none') {
      setError("Invalid request. Please check your email for the correct link.");
      setIsLoading(false);
      return;
    }

    const initializeAction = async () => {
      try {
        if (mode === 'resetPassword') {
          const email = await verifyPasswordResetCode(auth, oobCode);
          setUserEmail(email);
          setIsLoading(false);
        } else if (mode === 'verifyEmail') {
          await applyActionCode(auth, oobCode);
          setSuccess(true);
          setIsLoading(false);
        } else {
          setError("Unsupported action mode.");
          setIsLoading(false);
        }
      } catch (err: any) {
        console.error("Auth action error:", err);
        setError("This link has expired or is invalid. Please request a new one.");
        setIsLoading(false);
      }
    };

    initializeAction();
  }, [oobCode, mode]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oobCode) return;
    
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to reset password.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && mode !== 'resetPassword') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
          <Code2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-indigo-600" />
        </div>
        <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Processing Request...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-100 relative overflow-hidden">
        {/* Visual Decorations */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-50 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-emerald-50 rounded-full blur-3xl opacity-60"></div>

        <div className="text-center mb-10 relative z-10">
          <Link to="/" className="inline-flex items-center space-x-2 mb-8 group">
            <div className="bg-indigo-600 p-2 rounded-xl group-hover:rotate-12 transition duration-300 shadow-lg shadow-indigo-100">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tighter">DevFlow</span>
          </Link>
          
          <h2 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
            {mode === 'resetPassword' ? 'Secure Reset' : 'Account Verification'}
          </h2>
          {userEmail && (
            <div className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold border border-indigo-100">
              Account: {userEmail}
            </div>
          )}
        </div>

        {error && (
          <div className="animate-in fade-in slide-in-from-top-4 relative z-10">
            <div className="mb-8 p-8 bg-red-50 text-red-800 rounded-[2rem] text-center border border-red-100">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h4 className="font-black text-xl mb-2">Request Failed</h4>
              <p className="text-sm opacity-80 leading-relaxed">{error}</p>
            </div>
            <button 
              onClick={() => navigate('/login')}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold hover:bg-slate-800 transition shadow-xl"
            >
              Back to Login
            </button>
          </div>
        )}

        {success ? (
          <div className="animate-in zoom-in duration-500 relative z-10">
            <div className="mb-10 p-8 bg-emerald-50 text-emerald-800 rounded-[2rem] text-center border border-emerald-100 shadow-inner">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                {mode === 'resetPassword' ? <ShieldCheck className="w-10 h-10 text-emerald-600" /> : <MailCheck className="w-10 h-10 text-emerald-600" />}
              </div>
              <h4 className="font-black text-2xl mb-2">
                {mode === 'resetPassword' ? 'Password Updated' : 'Email Verified'}
              </h4>
              <p className="text-sm opacity-80 leading-relaxed">
                {mode === 'resetPassword' 
                  ? 'Your new password is now active. Please use it to log in.' 
                  : 'Your email has been verified. You now have full access to DevFlow.'}
              </p>
            </div>
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold hover:bg-slate-800 transition flex items-center justify-center space-x-3 shadow-xl"
            >
              <span>Continue to Dashboard</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        ) : mode === 'resetPassword' && !error && (
          <form className="space-y-6 relative z-10" onSubmit={handlePasswordReset}>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input 
                    type={showPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition text-slate-900 font-medium" 
                    placeholder="Min. 8 characters"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-600 transition"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input 
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition text-slate-900 font-medium" 
                    placeholder="Confirm password"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition flex items-center justify-center space-x-3 shadow-2xl shadow-indigo-100"
            >
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <span>Update Password</span>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
