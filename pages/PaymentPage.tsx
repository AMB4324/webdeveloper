
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../services/firebaseService';
import { Project, ProjectStatus, PaymentStatus } from '../types';
import { 
  CreditCard, 
  ShieldCheck, 
  ChevronLeft,
  Check,
  Lock,
  Loader2,
  AlertCircle,
  Phone,
  Building2,
  Wallet,
  Copy,
  Info,
  User as UserIcon,
  Hash
} from 'lucide-react';

export const PaymentPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = React.useState<Project | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isCompleted, setIsCompleted] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Form State
  const [selectedMethod, setSelectedMethod] = React.useState<'jazzcash' | 'easypaisa' | 'bank'>('jazzcash');
  const [senderName, setSenderName] = React.useState('');
  const [transactionId, setTransactionId] = React.useState('');

  const PAYMENT_NUMBER = "03004652452";

  React.useEffect(() => {
    const fetchProject = async () => {
      if (projectId) {
        try {
          const p = await db.getProjectById(projectId);
          if (p) {
            setProject(p);
          } else {
            setError("Project not found.");
          }
        } catch (err: any) {
          console.error("Failed to load project for payment", err);
          setError(err.message || "Failed to load project.");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchProject();
  }, [projectId]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const handleSubmitPayment = async () => {
    if (!senderName || !transactionId) {
      alert('Please provide sender name and transaction ID');
      return;
    }

    setIsProcessing(true);
    setError(null);
    try {
      if (projectId) {
        await db.updateProject(projectId, {
          paymentStatus: PaymentStatus.PENDING_VERIFICATION,
          paymentMethod: selectedMethod,
          senderName,
          transactionId
        });
        setIsCompleted(true);
      }
    } catch (err: any) {
      console.error("Payment submission failed", err);
      setError("Failed to submit payment details. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return (
    <div className="h-64 flex flex-col items-center justify-center space-y-4">
      <Loader2 className="animate-spin text-indigo-600 w-10 h-10" />
      <p className="text-slate-500 font-medium">Loading project details...</p>
    </div>
  );

  if (error || !project) return (
    <div className="max-w-md mx-auto mt-20 text-center p-8 bg-white rounded-3xl border border-slate-200 shadow-xl">
      <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Error</h2>
      <p className="text-slate-500 mb-8">{error || "Project not found"}</p>
      <button 
        onClick={() => navigate('/dashboard')}
        className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition"
      >
        Return to Dashboard
      </button>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto">
      <button onClick={() => navigate('/dashboard')} className="flex items-center text-slate-500 hover:text-slate-900 mb-8 transition font-medium">
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to Dashboard
      </button>

      {isCompleted ? (
        <div className="bg-white p-12 rounded-[3rem] border border-slate-200 text-center shadow-2xl animate-in zoom-in duration-300">
          <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <Check className="w-12 h-12" />
          </div>
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Details Submitted!</h2>
          <p className="text-slate-500 mb-10 text-lg max-w-md mx-auto">
            We've received your transaction details for <strong>"{project.title}"</strong>. Our team will verify the payment and start development shortly.
          </p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
          >
            Go to Dashboard
          </button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Payment Selection & Form */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center">
                <Wallet className="w-6 h-6 mr-3 text-indigo-600" />
                Select Payment Method
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                {[
                  { id: 'jazzcash', label: 'JazzCash', icon: <Phone className="w-5 h-5" />, color: 'amber' },
                  { id: 'easypaisa', label: 'EasyPaisa', icon: <Wallet className="w-5 h-5" />, color: 'emerald' },
                  { id: 'bank', label: 'Bank Transfer', icon: <Building2 className="w-5 h-5" />, color: 'indigo' }
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id as any)}
                    className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all ${
                      selectedMethod === method.id 
                      ? `bg-${method.color}-50 border-${method.color}-500 shadow-inner` 
                      : 'bg-slate-50 border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className={`mb-3 p-3 rounded-full ${selectedMethod === method.id ? `bg-${method.color}-500 text-white` : 'bg-white text-slate-400 border border-slate-100'}`}>
                      {method.icon}
                    </div>
                    <span className={`font-bold text-sm ${selectedMethod === method.id ? `text-${method.color}-700` : 'text-slate-500'}`}>
                      {method.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Instructions Panel */}
              <div className="bg-slate-900 rounded-3xl p-8 mb-10 text-white relative overflow-hidden group">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>
                
                {selectedMethod === 'bank' ? (
                  <div className="relative z-10">
                    <h4 className="font-bold text-xl mb-4 flex items-center">
                      <Building2 className="w-5 h-5 mr-2 text-indigo-400" />
                      Bank Account Details
                    </h4>
                    <div className="space-y-4">
                      <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className="text-[10px] text-white/50 uppercase font-bold tracking-widest mb-1">Bank Name</div>
                        <div className="font-bold">HBL (Habib Bank Limited)</div>
                      </div>
                      <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex justify-between items-center">
                        <div>
                          <div className="text-[10px] text-white/50 uppercase font-bold tracking-widest mb-1">Account Number</div>
                          <div className="font-mono font-bold">1234-5678-9012-3456</div>
                        </div>
                        <button onClick={() => handleCopy('1234567890123456')} className="p-2 hover:bg-white/10 rounded-lg transition"><Copy className="w-4 h-4" /></button>
                      </div>
                      <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className="text-[10px] text-white/50 uppercase font-bold tracking-widest mb-1">Account Title</div>
                        <div className="font-bold">DEVFLOW AGENCY SOLUTIONS</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative z-10">
                    <h4 className="font-bold text-xl mb-2 flex items-center">
                      <ShieldCheck className="w-5 h-5 mr-2 text-emerald-400" />
                      {selectedMethod === 'jazzcash' ? 'JazzCash' : 'EasyPaisa'} Transfer
                    </h4>
                    <p className="text-slate-400 text-sm mb-6">Send the exact budget amount to the mobile wallet number below.</p>
                    
                    <div className="bg-white/10 rounded-2xl p-6 flex items-center justify-between border border-white/20">
                      <div>
                        <div className="text-[10px] text-white/50 uppercase font-bold tracking-widest mb-1">Mobile Number</div>
                        <div className="text-3xl font-black tracking-wider">{PAYMENT_NUMBER}</div>
                      </div>
                      <button 
                        onClick={() => handleCopy(PAYMENT_NUMBER)}
                        className="bg-white text-slate-900 px-6 py-3 rounded-xl font-bold flex items-center hover:bg-slate-100 transition shadow-lg"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Transaction Form */}
              <div className="space-y-6">
                <h4 className="font-bold text-slate-900 flex items-center border-b border-slate-100 pb-4">
                  <Info className="w-5 h-5 mr-2 text-indigo-600" />
                  Transaction Details
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Sender's Full Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                      <input 
                        type="text" 
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 font-medium" 
                        placeholder="e.g. Muhammad Ali" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Transaction ID / Ref #</label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                      <input 
                        type="text" 
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 font-medium" 
                        placeholder="TID-12345678" 
                      />
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleSubmitPayment}
                  disabled={isProcessing || !senderName || !transactionId}
                  className="w-full bg-indigo-600 text-white py-5 rounded-[1.5rem] font-bold text-lg hover:bg-indigo-700 transition flex items-center justify-center space-x-2 mt-4 disabled:opacity-50 shadow-xl shadow-indigo-100"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Confirm & Notify Admin</span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar Summary */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm sticky top-24">
              <h3 className="font-bold text-slate-900 mb-6">Payment Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1 pr-4">
                    <div className="font-bold text-slate-900 truncate">{project.title}</div>
                    <div className="text-xs text-slate-500">Initial Deposit & Setup</div>
                  </div>
                  <div className="font-bold">${project.budget.toLocaleString()}</div>
                </div>
                <div className="flex justify-between text-sm">
                  <div className="text-slate-500">Service Fee</div>
                  <div className="text-slate-900">$0.00</div>
                </div>
                <div className="border-t border-slate-100 pt-6 mt-6 flex justify-between items-center">
                  <div className="font-bold text-slate-900">Amount Due</div>
                  <div className="font-black text-indigo-600 text-3xl">${project.budget.toLocaleString()}</div>
                </div>
              </div>

              <div className="mt-10 p-4 bg-emerald-50 rounded-2xl flex items-start space-x-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-800 leading-relaxed">
                  <strong>Secure Verification:</strong> Once submitted, your payment is usually verified within 2-4 business hours.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
