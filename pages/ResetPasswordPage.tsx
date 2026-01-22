
import React from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { auth } from '../services/firebaseConfig';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { Lock, AlertCircle, CheckCircle, Loader2, ArrowRight, Code2, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const oobCode = searchParams.get('oobCode');
  
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isValidating, setIsValidating] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [email, setEmail] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!oobCode) {
      setError("No security code found. Please request a new password reset link from the login page.");
      setIsValidating(false);
      return;
    }

    const validateCode = async () => {
      try {
        const userEmail = await verifyPasswordResetCode(auth, oobCode);
        setEmail(userEmail);
      } catch (err: any) {
        setError("This reset link is invalid or has already been used. Please try requesting a new link.");
      } finally {
        setIsValidating(false);
      }
    };

    validateCode();
  }, [oobCode]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oobCode) return;
    
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setError("For your security, password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setSuccess(true);
    } catch (err: any) {
      let msg = "Failed to reset password. Please try again.";
      if (err.code === 'auth/weak-password') msg = "The password is too weak.";
      if (err.code === 'auth/expired-action-code') msg = "The reset link has expired.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
          <Code2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-indigo-600" />
        </div>
        <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Securing session...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-100 relative overflow-hidden">
        {/* Visual Decoration */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-50 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-emerald-50 rounded-full blur-3xl opacity-60"></div>

        <div className="text-center mb-10 relative z-10">
          <Link to="/" className="inline-flex items-center space-x-2 mb-8 group">
            <div className="bg-indigo-600 p-2 rounded-xl group-hover:rotate-12 transition duration-300 shadow-lg shadow-indigo-100">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tighter">DevFlow</span>
          </Link>
          
          <h2 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">Secure Reset</h2>
          {email && (
            <div className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold border border-indigo-100">
              Updating account: {email}
            </div>
          )}
        </div>

        {error && (
          <div className="mb-8 p-5 bg-red-50 text-red-600 rounded-2xl flex items-start text-sm border border-red-100 animate-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 mr-3 shrink-0 mt-0.5" />
            <div className="font-medium">{error}</div>
          </div>
        )}

        {success ? (
          <div className="animate-in zoom-in duration-500 relative z-10">
            <div className="mb-10 p-8 bg-emerald-50 text-emerald-800 rounded-[2rem] text-center border border-emerald-100 shadow-inner">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <ShieldCheck className="w-10 h-10 text-emerald-600" />
              </div>
              <h4 className="font-black text-2xl mb-2">Access Restored</h4>
              <p className="text-sm opacity-80 leading-relaxed">Your new credentials are now active. Please use them to access your dashboard.</p>
            </div>
            <button 
              onClick={() => navigate('/login')}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold hover:bg-slate-800 transition flex items-center justify-center space-x-3 shadow-xl shadow-slate-200"
            >
              <span>Continue to Login</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <form className="space-y-6 relative z-10" onSubmit={handleReset}>
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
                    className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition text-slate-900 font-medium" 
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
                    className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition text-slate-900 font-medium" 
                    placeholder="Confirm password"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading || !oobCode}
              className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition flex items-center justify-center space-x-3 disabled:opacity-50 shadow-2xl shadow-indigo-100 mt-4 group"
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <span>Save New Password</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
                </>
              )}
            </button>
            
            <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              End-to-End Encrypted Session
            </p>
          </form>
        )}
      </div>
      
      <div className="mt-8 text-center">
        <Link to="/login" className="text-slate-400 text-sm font-bold hover:text-indigo-600 transition">
          Nevermind, I remember it now
        </Link>
      </div>
    </div>
  );
};
