
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { db, PortfolioSettings } from '../services/firebaseService';
import { fetchNetlifySites, NetlifySite } from '../services/netlifyService';
import { Project, ProjectStatus, PaymentStatus, User } from '../types';
import { 
  Users, 
  Layers, 
  Search,
  Clock,
  Loader2,
  ShieldAlert,
  Eye,
  X,
  Save,
  Mail,
  Calendar,
  Settings,
  Globe,
  Layout,
  ExternalLink,
  EyeOff,
  Key,
  AlertTriangle,
  FileCode,
  ShieldCheck,
  CreditCard,
  User as UserIcon,
  Hash,
  CheckCircle,
  XCircle,
  DollarSign,
  Bell,
  Code,
  // Added Sparkles icon to resolve the "Cannot find name 'Sparkles'" error
  Sparkles
} from 'lucide-react';

export const AdminPanel: React.FC<{ user: User }> = ({ user }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState<'requests' | 'portfolio'>('requests');
  
  // State
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<{message: string, type: 'firestore' | 'netlify' | 'generic'} | null>(null);
  const [selectedProject, setSelectedProject] = React.useState<Project | null>(null);
  const [isUpdating, setIsUpdating] = React.useState(false);
  
  // Portfolio State
  const [portfolioSettings, setPortfolioSettings] = React.useState<PortfolioSettings>({ netlifyToken: '', hiddenSiteIds: [] });
  const [netlifySites, setNetlifySites] = React.useState<NetlifySite[]>([]);
  const [isSyncing, setIsSyncing] = React.useState(false);

  React.useEffect(() => {
    if (user.role !== 'admin') {
      navigate('/');
    } else {
      loadInitialData();
    }
  }, [user, navigate]);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [projData, settings] = await Promise.all([
        db.getProjects(),
        db.getPortfolioSettings()
      ]);
      setProjects(projData);
      setPortfolioSettings(settings);
      
      if (settings.netlifyToken) {
        syncNetlify(settings.netlifyToken);
      }
    } catch (err: any) {
      console.error("Admin load error:", err);
      if (err.code === 'permission-denied' || err.message?.includes('permissions')) {
        setError({ message: "Missing or insufficient Firestore permissions. You need to update your Firestore Security Rules in the Firebase Console.", type: 'firestore' });
      } else {
        setError({ message: err.message || "An unexpected error occurred while loading data.", type: 'generic' });
      }
    } finally {
      setLoading(false);
    }
  };

  const syncNetlify = async (token: string) => {
    setIsSyncing(true);
    setError(null);
    try {
      const sites = await fetchNetlifySites(token);
      setNetlifySites(sites);
    } catch (err: any) {
      console.error("Netlify sync error:", err);
      setError({ message: `Netlify API Error: ${err.message}`, type: 'netlify' });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdateProjectStatus = async (id: string, status: ProjectStatus) => {
    setIsUpdating(true);
    try {
      await db.updateProject(id, { status });
      await loadInitialData();
      setSelectedProject(null);
    } catch (err) {
      console.error("Failed to update status", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleVerifyPayment = async (id: string, approved: boolean) => {
    setIsUpdating(true);
    try {
      const paymentStatus = approved ? PaymentStatus.PAID : PaymentStatus.UNPAID;
      await db.updateProject(id, { paymentStatus });
      await loadInitialData();
      setSelectedProject(null);
    } catch (err) {
      console.error("Failed to verify payment", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveToken = async (token: string) => {
    const newSettings = { ...portfolioSettings, netlifyToken: token };
    setPortfolioSettings(newSettings);
    try {
      await db.savePortfolioSettings(newSettings);
      if (token) {
        syncNetlify(token);
      } else {
        setNetlifySites([]);
      }
    } catch (err: any) {
      setError({ message: `Failed to save settings: ${err.message}`, type: 'generic' });
    }
  };

  const toggleSiteVisibility = async (siteId: string) => {
    const isHidden = portfolioSettings.hiddenSiteIds.includes(siteId);
    const newHiddenIds = isHidden 
      ? portfolioSettings.hiddenSiteIds.filter(id => id !== siteId)
      : [...portfolioSettings.hiddenSiteIds, siteId];
    
    const newSettings = { ...portfolioSettings, hiddenSiteIds: newHiddenIds };
    setPortfolioSettings(newSettings);
    try {
      await db.savePortfolioSettings(newSettings);
    } catch (err: any) {
      setError({ message: `Failed to update site visibility: ${err.message}`, type: 'generic' });
    }
  };

  const pendingPayments = projects.filter(p => p.paymentStatus === PaymentStatus.PENDING_VERIFICATION);

  if (loading) return (
    <div className="h-96 flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      <p className="text-slate-500 font-medium">Initializing Admin Environment...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Enhanced Alert Banner for Permissions */}
      {error && (
        <div className="bg-white border border-red-100 rounded-[2.5rem] shadow-2xl shadow-red-50 overflow-hidden mb-12">
          <div className="bg-red-50 p-8 flex items-start space-x-6 border-b border-red-100">
            <div className="bg-red-500 p-3 rounded-2xl shadow-lg shrink-0">
              <ShieldAlert className="w-8 h-8 text-white" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-red-900 tracking-tight">Access Denied: Permissions Missing</h2>
              <p className="text-red-700 font-medium text-sm leading-relaxed">{error.message}</p>
            </div>
          </div>
          
          {error.type === 'firestore' && (
            <div className="p-8 bg-slate-900 text-slate-300">
              <div className="flex items-center space-x-2 text-indigo-400 mb-4">
                <Code className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-widest">Recommended Rules Configuration</span>
              </div>
              <pre className="bg-slate-950 p-6 rounded-2xl text-[10px] font-mono leading-relaxed overflow-x-auto text-emerald-400 border border-white/5">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /projects/{projectId} {
      allow read, write: if request.auth != null;
    }
    match /settings/portfolio {
      allow read: if true; 
      allow write: if request.auth != null && request.auth.token.email.endsWith('@devflow.io');
    }
  }
}`}
              </pre>
              <p className="mt-4 text-[10px] text-slate-500 font-medium">Copy and paste these rules into your Firebase Console &gt; Firestore &gt; Rules tab.</p>
            </div>
          )}
        </div>
      )}

      {/* Action Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="bg-indigo-600 p-3 rounded-2xl shadow-xl shadow-indigo-100">
            <ShieldAlert className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Admin Console</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Agency Management Hub</p>
          </div>
        </div>

        <nav className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm self-start md:self-center">
          <button 
            onClick={() => setActiveTab('requests')}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition flex items-center uppercase tracking-widest ${activeTab === 'requests' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:text-slate-900'}`}
          >
            <Layers className="w-4 h-4 mr-2" />
            Pipeline
          </button>
          <button 
            onClick={() => setActiveTab('portfolio')}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition flex items-center uppercase tracking-widest ${activeTab === 'portfolio' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:text-slate-900'}`}
          >
            <Globe className="w-4 h-4 mr-2" />
            Portfolio
          </button>
        </nav>
      </header>

      {/* Pending Payment Notification Card */}
      {pendingPayments.length > 0 && activeTab === 'requests' && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-100 flex items-center justify-between animate-in slide-in-from-top-4">
          <div className="flex items-center space-x-6">
            <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md">
              <Bell className="w-8 h-8 text-white animate-bounce" />
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tight">Payment Verification Required</h3>
              <p className="text-blue-100 font-medium">There are {pendingPayments.length} transactions waiting for your approval.</p>
            </div>
          </div>
          <button 
            onClick={() => setSelectedProject(pendingPayments[0])}
            className="bg-white text-blue-700 px-8 py-3 rounded-xl font-bold hover:bg-blue-50 transition shadow-lg"
          >
            Verify First
          </button>
        </div>
      )}

      {activeTab === 'requests' ? (
        <div className="bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
            <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Order Pipeline</h3>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search clients or projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-6 py-3 text-sm bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 w-80 transition"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                <tr>
                  <th className="px-10 py-5">Project Details</th>
                  <th className="px-10 py-5">Current Status</th>
                  <th className="px-10 py-5">Payment Status</th>
                  <th className="px-10 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {projects.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.userEmail.toLowerCase().includes(searchTerm.toLowerCase())).map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition group">
                    <td className="px-10 py-6">
                      <div className="font-bold text-slate-900 text-base">{p.title}</div>
                      <div className="flex items-center text-xs text-slate-400 font-medium mt-1">
                        <UserIcon className="w-3 h-3 mr-1.5 text-indigo-400" />
                        {p.userName || p.userEmail.split('@')[0]}
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        p.status === ProjectStatus.PENDING ? 'bg-amber-100 text-amber-700' : 
                        p.status === ProjectStatus.COMPLETED ? 'bg-emerald-100 text-emerald-700' :
                        'bg-indigo-100 text-indigo-700'
                      }`}>
                        {p.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-10 py-6">
                      {p.isFreeTrial ? (
                         <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest px-3 py-1 bg-indigo-50 rounded-full border border-indigo-100">Free Trial</span>
                      ) : (
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          p.paymentStatus === PaymentStatus.PAID ? 'bg-emerald-100 text-emerald-700' : 
                          p.paymentStatus === PaymentStatus.PENDING_VERIFICATION ? 'bg-blue-100 text-blue-700 animate-pulse' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {p.paymentStatus.replace('_', ' ')}
                        </span>
                      )}
                    </td>
                    <td className="px-10 py-6 text-right">
                      <button 
                        onClick={() => setSelectedProject(p)} 
                        className="bg-slate-900 text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-indigo-600 transition flex items-center ml-auto"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-6 flex items-center">
                <Key className="w-5 h-5 mr-2 text-indigo-600" />
                Cloud Connectivity
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Netlify Access Token</label>
                  <input 
                    type="password"
                    defaultValue={portfolioSettings.netlifyToken}
                    onBlur={(e) => handleSaveToken(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none font-medium"
                    placeholder="nfp_..."
                  />
                </div>
                <button 
                  onClick={() => syncNetlify(portfolioSettings.netlifyToken)}
                  disabled={isSyncing || !portfolioSettings.netlifyToken}
                  className="w-full bg-indigo-600 text-white py-4.5 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {isSyncing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Clock className="w-5 h-5" />}
                  <span>Re-Sync Sites</span>
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
              <div className="p-8 border-b border-slate-50 bg-slate-50/30">
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Cloud Deployments</h3>
              </div>
              <div className="divide-y divide-slate-50">
                {netlifySites.map(site => (
                  <div key={site.id} className="p-8 flex items-center justify-between hover:bg-slate-50/50 transition">
                    <div className="flex items-center space-x-6">
                      <div className="w-24 h-14 bg-slate-100 rounded-xl overflow-hidden border border-slate-100 shadow-inner">
                        <img src={site.screenshot_url} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{site.name}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{site.url}</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => toggleSiteVisibility(site.id)}
                      className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition ${
                        portfolioSettings.hiddenSiteIds.includes(site.id) ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                      }`}
                    >
                      {portfolioSettings.hiddenSiteIds.includes(site.id) ? 'Hidden' : 'Visible'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedProject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 max-h-[90vh]">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center space-x-4">
                <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-100">
                  <FileCode className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Project Inspector</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Global Order Reference: {selectedProject.id.toUpperCase()}</p>
                </div>
              </div>
              <button onClick={() => setSelectedProject(null)} className="p-3 hover:bg-slate-100 rounded-full transition"><X className="w-6 h-6 text-slate-400" /></button>
            </div>
            
            <div className="p-10 space-y-10 overflow-y-auto">
              {/* Prominent Client Section */}
              <div className="bg-indigo-50/50 p-6 rounded-[2.5rem] border border-indigo-100 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center space-x-6">
                  <div className="w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center shadow-sm border border-indigo-100">
                    <UserIcon className="w-8 h-8 text-indigo-600" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Primary Requester</div>
                    <h3 className="text-2xl font-black text-slate-900 leading-none mb-1">
                      {selectedProject.userName || selectedProject.userEmail.split('@')[0]}
                    </h3>
                    <div className="flex items-center text-sm font-bold text-indigo-600/70">
                      <Mail className="w-4 h-4 mr-2" />
                      {selectedProject.userEmail}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center md:items-end">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Account Standing</div>
                  <span className="px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-200">
                    Verified Client
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-8">
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Project Specification</h4>
                    <h3 className="text-2xl font-black text-slate-900 mb-3">{selectedProject.title}</h3>
                    <div className="flex items-center text-xs font-bold text-slate-400">
                      <Calendar className="w-4 h-4 mr-2" />
                      Requested on {new Date(selectedProject.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Requirements Brief</label>
                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap font-medium italic">
                      "{selectedProject.description}"
                    </p>
                  </div>

                  <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Lifecycle Management</label>
                   <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: ProjectStatus.PENDING, label: 'Review' },
                      { id: ProjectStatus.SCOPING, label: 'Scoping' },
                      { id: ProjectStatus.IN_PROGRESS, label: 'Dev' },
                      { id: ProjectStatus.COMPLETED, label: 'Live' }
                    ].map(st => (
                      <button
                        key={st.id}
                        onClick={() => handleUpdateProjectStatus(selectedProject.id, st.id as ProjectStatus)}
                        className={`py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition border ${
                          selectedProject.status === st.id ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                   </div>
                 </div>
                </div>

                <div className="space-y-8">
                  <div className="bg-slate-900 rounded-[3rem] p-8 text-white relative overflow-hidden shadow-2xl border border-white/5">
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                      <DollarSign className="w-20 h-20" />
                    </div>
                    
                    <div className="mb-10">
                      <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Project Valuation</div>
                      <div className="text-5xl font-black">${selectedProject.budget.toLocaleString()}</div>
                    </div>

                    {selectedProject.paymentStatus === PaymentStatus.PENDING_VERIFICATION && (
                      <div className="space-y-6 animate-in slide-in-from-bottom-4">
                        <div className="flex items-center space-x-3 text-blue-400 border-t border-white/10 pt-6">
                          <CreditCard className="w-5 h-5" />
                          <span className="text-xs font-black uppercase tracking-widest">Transaction Audit Pending</span>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4">
                          <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                            <div className="text-[10px] opacity-40 font-black uppercase tracking-widest mb-1">Gateway & Payer</div>
                            <div className="text-sm font-bold capitalize">{selectedProject.paymentMethod} — {selectedProject.senderName}</div>
                          </div>
                          <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                            <div className="text-[10px] opacity-40 font-black uppercase tracking-widest mb-1">External Transaction Hash</div>
                            <div className="text-sm font-mono font-bold break-all select-all tracking-wider text-indigo-200">{selectedProject.transactionId}</div>
                          </div>
                        </div>

                        <div className="flex gap-4 pt-2">
                          <button 
                            onClick={() => handleVerifyPayment(selectedProject.id, true)}
                            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-4.5 rounded-2xl font-bold text-xs uppercase tracking-widest transition shadow-lg shadow-emerald-900/40"
                          >
                            Approve Funds
                          </button>
                          <button 
                            onClick={() => handleVerifyPayment(selectedProject.id, false)}
                            className="flex-1 bg-white/10 hover:bg-red-500 text-white py-4.5 rounded-2xl font-bold text-xs uppercase tracking-widest transition"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {selectedProject.paymentStatus === PaymentStatus.PAID && (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[2.5rem] p-8 flex flex-col items-center text-center shadow-inner">
                        <ShieldCheck className="w-12 h-12 text-emerald-400 mb-4" />
                        <h4 className="text-xl font-black mb-2">Payment Cleared</h4>
                        <div className="text-emerald-400/80 font-black uppercase tracking-widest text-[10px]">Funds secured in Agency Escrow</div>
                      </div>
                    )}

                    {selectedProject.paymentStatus === PaymentStatus.UNPAID && !selectedProject.isFreeTrial && (
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-[2.5rem] p-8 flex flex-col items-center text-center">
                        <Clock className="w-12 h-12 text-amber-400 mb-4" />
                        <h4 className="text-xl font-black mb-2">Awaiting Deposit</h4>
                        <div className="text-amber-400/80 font-black uppercase tracking-widest text-[10px]">Client has not initiated payment</div>
                      </div>
                    )}

                    {selectedProject.isFreeTrial && (
                      <div className="bg-indigo-500/20 border border-indigo-500/30 rounded-[2.5rem] p-8 flex flex-col items-center text-center">
                        <Sparkles className="w-12 h-12 text-indigo-400 mb-4" />
                        <h4 className="text-xl font-black mb-2">Free Trial Slot</h4>
                        <div className="text-indigo-400/80 font-black uppercase tracking-widest text-[10px]">No payment required for this order</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-8 border-t border-slate-50 bg-slate-50/50 text-center">
              <button onClick={() => setSelectedProject(null)} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition tracking-[0.2em]">
                Exit Order Inspection Mode
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
