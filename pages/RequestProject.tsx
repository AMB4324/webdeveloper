
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ProjectStatus, PaymentStatus } from '../types';
import { db } from '../services/firebaseService';
import { estimateProjectBudget } from '../services/geminiService';
import { 
  Send, 
  Loader2, 
  CheckCircle2, 
  Info,
  Monitor,
  DollarSign,
  Gift,
  Sparkles,
  Zap,
  Mail,
  Wand2,
  Key
} from 'lucide-react';

// Removed local declaration of aistudio on Window as it conflicts with the environment's global type definitions.

export const RequestProject: React.FC<{ user: User }> = ({ user }) => {
  const [description, setDescription] = React.useState('');
  const [title, setTitle] = React.useState('');
  const [contactEmail, setContactEmail] = React.useState(user.email);
  const [budget, setBudget] = React.useState<number>(50);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isEstimating, setIsEstimating] = React.useState(false);
  const [projectCount, setProjectCount] = React.useState<number | null>(null);
  const [loadingHistory, setLoadingHistory] = React.useState(true);
  const [aiUsed, setAiUsed] = React.useState(false);
  const [hasAiKey, setHasAiKey] = React.useState(true);
  
  const navigate = useNavigate();

  React.useEffect(() => {
    const checkStatus = async () => {
      try {
        const [projects, keySelected] = await Promise.all([
          db.getUserProjects(user.id),
          // Use type assertion for aistudio to access environment-provided global safely
          (window as any).aistudio?.hasSelectedApiKey() ?? Promise.resolve(true)
        ]);
        setProjectCount(projects.length);
        setHasAiKey(keySelected);
      } catch (err) {
        console.error("Error checking history", err);
      } finally {
        setLoadingHistory(false);
      }
    };
    checkStatus();
  }, [user.id]);

  const handleConnectAi = async () => {
    if ((window as any).aistudio) {
      await (window as any).aistudio.openSelectKey();
      setHasAiKey(true); // Assume success per instructions
    }
  };

  const isEligibleForFreeTrial = projectCount === 0;

  const handleEstimate = async () => {
    if (description.length < 20) return;
    
    if (!hasAiKey && (window as any).aistudio) {
      await handleConnectAi();
    }

    setIsEstimating(true);
    try {
      const suggested = await estimateProjectBudget(description);
      setBudget(suggested);
      setAiUsed(true);
    } catch (err) {
      console.error("AI Estimation failed", err);
    } finally {
      setIsEstimating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || description.length < 20) return;
    
    setIsSubmitting(true);
    try {
      const finalBudget = isEligibleForFreeTrial ? 0 : budget;
      const finalPaymentStatus = isEligibleForFreeTrial ? PaymentStatus.PAID : PaymentStatus.UNPAID;

      await db.createProject({
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        contactEmail: contactEmail,
        title,
        description,
        budget: finalBudget,
        status: ProjectStatus.PENDING,
        paymentStatus: finalPaymentStatus,
        techStack: [],
        isFreeTrial: isEligibleForFreeTrial
      });
      navigate('/dashboard');
    } catch (err) {
      console.error("Submission failed", err);
      setIsSubmitting(false);
    }
  };

  if (loadingHistory) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">New Project Request</h1>
        <p className="text-slate-500">Tell us about your vision, and our AI will help suggest a budget.</p>
      </div>

      {isEligibleForFreeTrial && (
        <div className="mb-8 p-6 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-[2rem] text-white shadow-xl shadow-indigo-100 flex flex-col md:flex-row items-center justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition duration-500">
            <Sparkles className="w-24 h-24" />
          </div>
          <div className="flex items-center space-x-6 relative z-10">
            <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md">
              <Gift className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Welcome Gift Activated!</h3>
              <p className="text-indigo-100 text-sm">As a new client, your first project request is <span className="font-bold text-white underline underline-offset-4 decoration-emerald-400">100% FREE</span>.</p>
            </div>
          </div>
          <div className="mt-4 md:mt-0 px-6 py-2 bg-emerald-400 text-slate-900 font-bold rounded-full text-xs uppercase tracking-widest animate-pulse relative z-10">
            Free Trial Available
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-tight">Project Title</label>
                <input 
                  type="text" 
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  placeholder="e.g., E-commerce Redesign"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-tight">Contact Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                  <input 
                    type="email" 
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    placeholder="contact@yourcompany.com"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-2">Where we should send project updates.</p>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-slate-700 uppercase tracking-tight">Project Description</label>
                <div className="flex items-center space-x-4">
                  {/* Using type assertion for aistudio check */}
                  {!hasAiKey && (window as any).aistudio && (
                    <button 
                      type="button"
                      onClick={handleConnectAi}
                      className="text-[10px] flex items-center space-x-1 font-bold text-amber-600 hover:text-amber-800 transition animate-pulse"
                    >
                      <Key className="w-3 h-3" />
                      <span>Connect AI</span>
                    </button>
                  )}
                  <button 
                    type="button"
                    onClick={handleEstimate}
                    disabled={isEstimating || description.length < 20}
                    className="text-[10px] flex items-center space-x-1 font-bold text-indigo-600 hover:text-indigo-800 disabled:opacity-40 transition"
                  >
                    <Wand2 className="w-3 h-3" />
                    <span>AI Estimation</span>
                  </button>
                </div>
              </div>
              <textarea 
                required
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
                placeholder="Describe your goals, target audience, and key features..."
              />
              <p className="text-xs text-slate-400 mt-2">Provide at least 20 characters for a detailed review.</p>
            </div>

            {!isEligibleForFreeTrial ? (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-bold text-slate-700 uppercase tracking-tight">Budget (USD)</label>
                  {aiUsed && <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold">AI Suggested</span>}
                </div>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                  <input 
                    type="number" 
                    required
                    min="10"
                    max="100"
                    step="1"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 transition font-bold"
                  />
                  <div className="absolute right-3 top-3.5">
                    {isEstimating && <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />}
                  </div>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">$10 Min</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">$100 Max</span>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-between">
                <div className="flex items-center space-x-3 text-emerald-700">
                  <Zap className="w-5 h-5" />
                  <span className="font-bold text-sm">Budget: $0.00 (Free Trial Applied)</span>
                </div>
                <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Welcome Promo</div>
              </div>
            )}
            
            <button 
              type="submit"
              disabled={isSubmitting || description.length < 20}
              className={`w-full flex items-center justify-center space-x-2 py-4 rounded-xl font-bold transition disabled:opacity-50 ${isEligibleForFreeTrial ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>{isEligibleForFreeTrial ? 'Claim Free Project' : 'Submit Project Request'}</span>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h4 className="font-bold text-slate-900 mb-4 flex items-center">
              <Sparkles className="w-4 h-4 mr-2 text-indigo-600" />
              AI Assistant
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Our Gemini-powered analysis helps you price your project accurately based on complexity. Simply type your description and click "AI Estimation".
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-4 flex items-center">
              <Info className="w-4 h-4 mr-2 text-indigo-600" />
              Guidelines
            </h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500 mt-0.5" />
                Be as specific as possible about features.
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500 mt-0.5" />
                Mention your preferred deadline.
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500 mt-0.5" />
                Include any third-party integrations needed.
              </li>
            </ul>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl text-white">
            <Monitor className="w-8 h-8 text-indigo-400 mb-4" />
            <h4 className="font-bold mb-2">Need a consultation?</h4>
            <p className="text-slate-400 text-sm mb-4">
              Schedule a 15-min call with our engineering lead if you prefer to discuss live.
            </p>
            <button className="text-indigo-400 font-bold text-sm hover:underline">
              Book a call &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
