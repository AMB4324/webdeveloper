
import React from 'react';
import { Link } from 'react-router-dom';
import { db } from '../services/firebaseService';
import { fetchNetlifySites, NetlifySite } from '../services/netlifyService';
import { 
  Zap, 
  Rocket, 
  ArrowRight,
  Monitor,
  Database,
  Globe,
  ExternalLink,
  Code2,
  Sparkles,
  Loader2,
  ChevronDown,
  LayoutGrid
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [portfolio, setPortfolio] = React.useState<NetlifySite[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showAll, setShowAll] = React.useState(false);

  React.useEffect(() => {
    const loadPortfolio = async () => {
      try {
        const settings = await db.getPortfolioSettings();
        if (settings && settings.netlifyToken) {
          const sites = await fetchNetlifySites(settings.netlifyToken);
          // Filter out hidden sites
          const visibleSites = sites.filter(s => !settings.hiddenSiteIds.includes(s.id));
          setPortfolio(visibleSites);
        }
      } catch (err) {
        // Log as warning instead of error to keep console clean for production users
        console.warn("Portfolio could not be loaded. This is expected if Firestore rules are restricted.");
      } finally {
        setLoading(false);
      }
    };
    loadPortfolio();
  }, []);

  const displayedPortfolio = showAll ? portfolio : portfolio.slice(0, 3);

  const handleShowAll = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowAll(true);
    const element = document.getElementById('work');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 leading-tight mb-6">
            We build the <span className="text-indigo-600">digital future</span> for world-class teams.
          </h1>
          <p className="text-xl text-slate-600 mb-10 max-w-2xl leading-relaxed">
            From concept to deployment, we deliver bespoke web solutions that scale with your vision. 
            High-performance, secure, and user-centric.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Link 
              to="/login" 
              className="bg-indigo-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-indigo-700 transition flex items-center justify-center shadow-lg shadow-indigo-200"
            >
              Start Your Project
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <button 
              onClick={handleShowAll}
              className="bg-white border border-slate-200 text-slate-700 px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-50 transition text-center"
            >
              View Our Work
            </button>
          </div>
        </div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-50 -z-10 animate-pulse"></div>
      </section>

      {/* Dynamic Netlify Portfolio Section */}
      <section id="work" className="scroll-mt-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-600 font-bold text-sm uppercase tracking-widest mb-3">
              <Sparkles className="w-4 h-4" />
              <span>{showAll ? 'Full Portfolio' : 'Featured Work'}</span>
            </div>
            <h2 className="text-4xl font-bold text-slate-900">Our Latest Projects</h2>
          </div>
          {!showAll && portfolio.length > 3 && (
            <button 
              onClick={() => setShowAll(true)}
              className="text-indigo-600 font-bold hover:text-indigo-700 transition flex items-center group"
            >
              See all projects
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition" />
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto" />
            <p className="w-full text-slate-400 mt-4 font-medium">Syncing with Cloud...</p>
          </div>
        ) : portfolio.length > 0 ? (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayedPortfolio.map((site) => (
                <div key={site.id} className="group bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition duration-500 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="aspect-video bg-slate-100 relative overflow-hidden">
                    <img 
                      src={site.screenshot_url || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800'} 
                      alt={site.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition duration-700"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center backdrop-blur-[2px]">
                      <a 
                        href={site.ssl_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-white text-slate-900 px-6 py-3 rounded-full font-bold flex items-center transform translate-y-4 group-hover:translate-y-0 transition duration-500"
                      >
                        Visit Live Site
                        <ExternalLink className="ml-2 w-4 h-4" />
                      </a>
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest px-2 py-1 bg-indigo-50 rounded-md">
                        Production Live
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Updated {new Date(site.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2 truncate">
                      {site.name.replace(/-/g, ' ')}
                    </h3>
                    <p className="text-slate-500 text-sm mb-6 truncate">
                      Deployed at {site.url}
                    </p>
                    <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200"></div>
                        ))}
                      </div>
                      <span className="text-xs font-bold text-slate-400">Production Ready</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {!showAll && portfolio.length > 3 && (
              <div className="text-center pt-8">
                <button 
                  onClick={() => setShowAll(true)}
                  className="inline-flex items-center space-x-3 bg-slate-900 text-white px-10 py-4 rounded-full font-bold hover:bg-slate-800 transition shadow-xl shadow-slate-200"
                >
                  <LayoutGrid className="w-5 h-5" />
                  <span>View All {portfolio.length} Projects</span>
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] p-20 text-center">
            <Rocket className="w-12 h-12 text-slate-300 mx-auto mb-6" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Portfolio Sync Required</h3>
            <p className="text-slate-500 max-w-sm mx-auto">
              Please ensure your Netlify Token is configured in the Admin Panel to display your deployments.
            </p>
          </div>
        )}
      </section>

      {/* Expert Services Grid */}
      <section id="services">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Expertise</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">We use modern stacks to deliver world-class performance and security.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: <Monitor className="text-indigo-600" />, title: "Modern Frontend", desc: "Interactive UI/UX built with React, Tailwind CSS, and Framer Motion." },
            { icon: <Database className="text-emerald-600" />, title: "Scalable Backends", desc: "Robust data architectures powered by Firebase, Supabase, and Node.js." },
            { icon: <Globe className="text-amber-600" />, title: "Cloud Deployment", desc: "Automated CI/CD workflows hosted on Netlify, Vercel, and AWS." },
          ].map((service, idx) => (
            <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 hover:shadow-xl transition group">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-white transition shadow-sm border border-transparent group-hover:border-slate-50">
                {service.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{service.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{service.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
