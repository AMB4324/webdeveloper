
import React from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { auth } from '../services/firebaseConfig';
import { applyActionCode } from 'firebase/auth';
import { ShieldCheck, AlertCircle, Loader2, ArrowRight, Code2, MailCheck } from 'lucide-react';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const oobCode = searchParams.get('oobCode');
  
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  React.useEffect(() => {
    if (!oobCode) {
      setError("No verification code found. Please use the link sent to your email.");
      setIsLoading(false);
      return;
    }

    const verify = async () => {
      try {
        await applyActionCode(auth, oobCode);
        setSuccess(true);
      } catch (err: any) {
        console.error("Verification error:", err);
        setError("This verification link is invalid or has expired. Please request a new one from your dashboard.");
      } finally {
        setIsLoading(false);
      }
    };

    verify();
  }, [oobCode]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
          <MailCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-indigo-600" />
        </div>
        <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Verifying Identity...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-100 relative overflow-hidden">
        {/* Decorative Backgrounds */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-50 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-emerald-50 rounded-full blur-3xl opacity-60"></div>

        <div className="text-center mb-10 relative z-10">
          <Link to="/" className="inline-flex items-center space-x-2 mb-8 group">
            <div className="bg-indigo-600 p-2 rounded-xl group-hover:rotate-12 transition duration-300 shadow-lg shadow-indigo-100">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tighter">DevFlow</span>
          </Link>
          
          <h2 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">Email Verification</h2>
        </div>

        {error ? (
          <div className="animate-in fade-in slide-in-from-top-4 relative z-10">
            <div className="mb-8 p-8 bg-red-50 text-red-800 rounded-[2rem] text-center border border-red-100">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h4 className="font-black text-xl mb-2">Verification Failed</h4>
              <p className="text-sm opacity-80 leading-relaxed">{error}</p>
            </div>
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold hover:bg-slate-800 transition flex items-center justify-center space-x-3 shadow-xl"
            >
              <span>Go to Dashboard</span>
            </button>
          </div>
        ) : (
          <div className="animate-in zoom-in duration-500 relative z-10">
            <div className="mb-10 p-8 bg-emerald-50 text-emerald-800 rounded-[2rem] text-center border border-emerald-100 shadow-inner">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <ShieldCheck className="w-10 h-10 text-emerald-600" />
              </div>
              <h4 className="font-black text-2xl mb-2">Email Verified</h4>
              <p className="text-sm opacity-80 leading-relaxed">Your account is now fully secured and active. You can now access all DevFlow features.</p>
            </div>
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold hover:bg-slate-800 transition flex items-center justify-center space-x-3 shadow-xl shadow-slate-200"
            >
              <span>Continue to Dashboard</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
      
      <p className="mt-8 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
        Secured by DevFlow Identity Services
      </p>
    </div>
  );
};
