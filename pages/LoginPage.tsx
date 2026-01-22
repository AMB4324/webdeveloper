import React from 'react';
import { auth, googleProvider } from '../services/firebaseConfig';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { Chrome, Mail, Lock, AlertCircle, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [mode, setMode] = React.useState<'login' | 'signup' | 'forgot'>('login');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else if (mode === 'signup') {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, {
          displayName: email.split('@')[0]
        });
        setSuccess("Account created successfully! Logging you in...");
      } else if (mode === 'forgot') {
        // Send reset email. 
        // Note: To use the custom page, you MUST update the Action URL in Firebase Console.
        await sendPasswordResetEmail(auth, email);
        setSuccess("Success! A secure reset link has been sent to your inbox. Follow the instructions to create a new password.");
        setIsLoading(false);
      }
    } catch (err: any) {
      let msg = err.message || "An authentication error occurred";
      if (err.code === 'auth/user-not-found') msg = "No account found with this email.";
      if (err.code === 'auth/wrong-password') msg = "Incorrect password.";
      setError(msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 mb-20">
      <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-100 relative overflow-hidden">
        <div className="text-center mb-8 relative z-10">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            {mode === 'login' && 'Welcome Back'}
            {mode === 'signup' && 'Join DevFlow'}
            {mode === 'forgot' && 'Reset Access'}
          </h2>
          <p className="text-slate-500 mt-2 text-sm">
            {mode === 'login' && 'Manage your projects and payments'}
            {mode === 'signup' && 'Get started with a free project trial'}
            {mode === 'forgot' && 'Provide your account email to continue'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center text-sm border border-red-100 animate-in slide-in-from-top-1">
            <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-5 bg-emerald-50 text-emerald-700 rounded-2xl flex items-start text-sm border border-emerald-100 animate-in slide-in-from-top-1">
            <CheckCircle className="w-5 h-5 mr-3 shrink-0 mt-0.5 text-emerald-500" />
            <span className="font-medium leading-relaxed">{success}</span>
          </div>
        )}

        {mode !== 'forgot' && (
          <>
            <button 
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-3 border border-slate-200 py-3.5 rounded-2xl hover:bg-slate-50 transition mb-6 group disabled:opacity-50"
            >
              <Chrome className="w-5 h-5 text-slate-600 group-hover:text-indigo-600 transition" />
              <span className="font-bold text-slate-700">Continue with Google</span>
            </button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest"><span className="px-3 bg-white text-slate-300">Secured Direct Access</span></div>
            </div>
          </>
        )}

        <form className="space-y-5 relative z-10" onSubmit={handleEmailAuth}>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition text-slate-900 font-medium" 
                placeholder="you@example.com"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex justify-between items-center mb-1.5 ml-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                {mode === 'login' && (
                  <button 
                    type="button"
                    onClick={() => { setMode('forgot'); setError(null); setSuccess(null); }}
                    className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-widest"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition text-slate-900 font-medium" 
                  placeholder="••••••••"
                />
              </div>
            </div>
          )}

          {mode === 'signup' && (
            <div className="animate-in fade-in slide-in-from-top-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input 
                  type="password" 
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition text-slate-900 font-medium" 
                  placeholder="••••••••"
                />
              </div>
            </div>
          )}

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-900 text-white py-4.5 rounded-2xl font-bold text-lg hover:bg-slate-800 transition flex items-center justify-center space-x-3 shadow-xl shadow-slate-200 disabled:opacity-70"
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <span>
                {mode === 'login' && 'Sign In'}
                {mode === 'signup' && 'Create Account'}
                {mode === 'forgot' && 'Send Reset Link'}
              </span>
            )}
          </button>
        </form>

        <div className="mt-10 text-center text-sm font-medium">
          {mode === 'login' && (
            <p className="text-slate-500">
              New to DevFlow?{' '}
              <button 
                onClick={() => { setMode('signup'); setError(null); setSuccess(null); }}
                className="text-indigo-600 font-bold hover:underline"
              >
                Start Free Trial
              </button>
            </p>
          )}
          {mode === 'signup' && (
            <p className="text-slate-500">
              Existing Client?{' '}
              <button 
                onClick={() => { setMode('login'); setError(null); setSuccess(null); }}
                className="text-indigo-600 font-bold hover:underline"
              >
                Sign In
              </button>
            </p>
          )}
          {mode === 'forgot' && (
            <button 
              onClick={() => { setMode('login'); setError(null); setSuccess(null); }}
              className="flex items-center justify-center w-full text-slate-500 font-bold hover:text-indigo-600 transition"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return to Login
            </button>
          )}
        </div>
      </div>

      {/* SEO Text Section */}
      <div className="mt-12 text-center max-w-lg mx-auto px-4">
        <h2 className="text-lg font-bold text-slate-900 mb-2">About Dev Flow Premium Website Builder</h2>
        <p className="text-slate-500 text-sm leading-relaxed">
          Dev Flow is a premium full-stack website builder and dashboard designed for real-time client management. Our platform helps developers and businesses create, manage, and scale their web presence with ease. Log in to access your custom developer tools and project flow.
        </p>
      </div>
    </div>
  );
};