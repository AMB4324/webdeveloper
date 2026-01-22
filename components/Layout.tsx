
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Settings, 
  LogOut, 
  Code2, 
  Menu, 
  X,
  CreditCard,
  ShieldCheck
} from 'lucide-react';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <Code2 className="w-8 h-8 text-indigo-600" />
                <span className="text-xl font-bold text-slate-900 tracking-tight">DevFlow</span>
              </Link>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  <Link to="/dashboard" className="text-slate-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </Link>
                  <Link to="/request" className="text-slate-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    New Project
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="text-slate-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                      <ShieldCheck className="w-4 h-4 mr-2" />
                      Admin
                    </Link>
                  )}
                  <div className="h-8 w-px bg-slate-200 mx-2"></div>
                  <div className="flex items-center space-x-3">
                    <img 
                      src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} 
                      className="w-8 h-8 rounded-full border border-slate-200" 
                      alt="Avatar"
                    />
                    <button 
                      onClick={handleLogout}
                      className="text-slate-600 hover:text-red-600 p-2"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                </>
              ) : (
                <Link to="/login" className="bg-indigo-600 text-white px-5 py-2 rounded-full hover:bg-indigo-700 transition font-medium">
                  Get Started
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-slate-600 p-2"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {user ? (
                <>
                  <Link to="/dashboard" className="block px-3 py-2 text-slate-600">Dashboard</Link>
                  <Link to="/request" className="block px-3 py-2 text-slate-600">New Project</Link>
                  {user.role === 'admin' && <Link to="/admin" className="block px-3 py-2 text-slate-600">Admin Panel</Link>}
                  <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-red-600">Logout</button>
                </>
              ) : (
                <Link to="/login" className="block px-3 py-2 text-indigo-600 font-bold">Sign In</Link>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-white border-t border-slate-200 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Code2 className="w-6 h-6 text-indigo-600" />
                <span className="text-lg font-bold">DevFlow</span>
              </div>
              <p className="text-slate-500 max-w-sm">
                Transforming ideas into high-performance digital solutions. 
                Premium web development for ambitious companies.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Services</h4>
              <ul className="space-y-2 text-slate-600">
                <li>Custom Web Apps</li>
                <li>E-commerce Solutions</li>
                <li>Cloud Architecture</li>
                <li>UI/UX Design</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <ul className="space-y-2 text-slate-600">
                <li>hello@devflow.io</li>
                <li>San Francisco, CA</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-100 mt-12 pt-8 text-center text-slate-400 text-sm">
            © {new Date().getFullYear()} DevFlow Agency. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
