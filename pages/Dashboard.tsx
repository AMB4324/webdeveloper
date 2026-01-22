
import React from 'react';
import { Link } from 'react-router-dom';
import { User, Project, ProjectStatus, PaymentStatus } from '../types';
import { db } from '../services/firebaseService';
import { auth } from '../services/firebaseConfig';
import { sendEmailVerification } from 'firebase/auth';
import { 
  CheckCircle2, 
  ChevronRight, 
  Plus,
  CreditCard,
  Loader2,
  Gift,
  Zap,
  MailWarning,
  Send,
  Check
} from 'lucide-react';

export const Dashboard: React.FC<{ user: User }> = ({ user }) => {
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [verificationLoading, setVerificationLoading] = React.useState(false);
  const [verificationSent, setVerificationSent] = React.useState(false);

  React.useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await db.getUserProjects(user.id);
        setProjects(data);
      } catch (err) {
        console.error("Failed to fetch user projects", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [user.id]);

  const handleResendVerification = async () => {
    if (!auth.currentUser) return;
    setVerificationLoading(true);
    try {
      await sendEmailVerification(auth.currentUser);
      setVerificationSent(true);
      setTimeout(() => setVerificationSent(false), 5000);
    } catch (err) {
      console.error("Verification send error:", err);
      alert("Too many attempts. Please try again later.");
    } finally {
      setVerificationLoading(false);
    }
  };

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.PENDING: return 'text-amber-600 bg-amber-50';
      case ProjectStatus.IN_PROGRESS: return 'text-indigo-600 bg-indigo-50';
      case ProjectStatus.COMPLETED: return 'text-emerald-600 bg-emerald-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Verification Banner */}
      {!user.emailVerified && (
        <div className="bg-amber-50 border border-amber-200 rounded-[2rem] p-6 flex flex-col md:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-4">
          <div className="flex items-center space-x-4">
            <div className="bg-amber-100 p-3 rounded-2xl text-amber-600">
              <MailWarning className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-amber-900">Email Verification Required</h4>
              <p className="text-amber-700 text-sm">Please verify your email to unlock full account privileges and receive project notifications.</p>
            </div>
          </div>
          <button 
            onClick={handleResendVerification}
            disabled={verificationLoading || verificationSent}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition flex items-center space-x-2 ${
              verificationSent ? 'bg-emerald-500 text-white' : 'bg-amber-600 text-white hover:bg-amber-700'
            }`}
          >
            {verificationLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 
             verificationSent ? <><Check className="w-4 h-4" /> <span>Link Sent</span></> : 
             <><Send className="w-4 h-4" /> <span>Send Verification</span></>}
          </button>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Project Dashboard</h1>
          <p className="text-slate-500">Welcome back, {user.name.split(' ')[0]}!</p>
        </div>
        <Link 
          to="/request" 
          className="flex items-center justify-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
        >
          <Plus className="w-5 h-5" />
          <span>New Project</span>
        </Link>
      </header>

      {projects.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[3rem] p-16 text-center">
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Gift className="w-10 h-10 text-indigo-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Your Free Trial is Waiting!</h3>
          <p className="text-slate-500 mb-8 max-w-sm mx-auto leading-relaxed">
            New accounts get their first project request completely free. Start your web development journey today.
          </p>
          <Link 
            to="/request" 
            className="inline-flex items-center bg-indigo-600 text-white px-8 py-3 rounded-full font-bold hover:bg-indigo-700 transition"
          >
            Claim Your Free Project <ChevronRight className="ml-1 w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="bg-white rounded-[2.5rem] border border-slate-200 p-8 hover:shadow-xl hover:border-indigo-100 transition group relative overflow-hidden">
              {project.isFreeTrial && (
                <div className="absolute top-0 right-0">
                  <div className="bg-emerald-400 text-emerald-950 text-[10px] font-bold px-8 py-1 rotate-45 translate-x-4 translate-y-2 text-center uppercase tracking-widest">
                    Free
                  </div>
                </div>
              )}
              
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(project.status as ProjectStatus)}`}>
                      {project.status.replace('_', ' ')}
                    </span>
                    <span className="text-slate-400 text-xs font-medium">{new Date(project.createdAt).toLocaleDateString()}</span>
                    {project.isFreeTrial && (
                      <span className="flex items-center text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        <Zap className="w-3 h-3 mr-1" />
                        Free Trial
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 group-hover:text-indigo-600 transition mb-2">{project.title}</h3>
                  <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">{project.description}</p>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Value</div>
                    <div className="text-xl font-extrabold text-slate-900">
                      {project.isFreeTrial ? (
                        <span className="text-emerald-500">$0.00</span>
                      ) : (
                        `$${project.budget.toLocaleString()}`
                      )}
                    </div>
                  </div>
                  <div className="h-12 w-px bg-slate-100 hidden sm:block"></div>
                  {project.paymentStatus === PaymentStatus.UNPAID ? (
                    <Link 
                      to={`/payment/${project.id}`}
                      className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Proceed to Pay</span>
                    </Link>
                  ) : (
                    <div className="flex items-center space-x-2 text-emerald-600 font-bold px-4 py-3 bg-emerald-50 rounded-xl">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>{project.isFreeTrial ? 'Free Trial Activated' : 'Paid & Secured'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Stepper */}
              <div className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-between max-w-2xl">
                {[
                  { label: 'Review', active: true },
                  { label: 'Scoping', active: project.status !== ProjectStatus.PENDING },
                  { label: 'Development', active: project.status === ProjectStatus.IN_PROGRESS || project.status === ProjectStatus.COMPLETED },
                  { label: 'Live', active: project.status === ProjectStatus.COMPLETED },
                ].map((step, idx) => (
                  <div key={idx} className="flex flex-col items-center flex-1">
                    <div className={`w-3 h-3 rounded-full mb-3 ${step.active ? 'bg-indigo-600 ring-4 ring-indigo-50' : 'bg-slate-200'}`}></div>
                    <span className={`text-[10px] uppercase font-bold tracking-widest ${step.active ? 'text-indigo-600' : 'text-slate-400'}`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
