
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthState, User } from './types';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { RequestProject } from './pages/RequestProject';
import { AdminPanel } from './pages/AdminPanel';
import { PaymentPage } from './pages/PaymentPage';
import { AuthActionPage } from './pages/AuthActionPage';
import { auth } from './services/firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const App: React.FC = () => {
  const [authState, setAuthState] = React.useState<AuthState>({
    user: null,
    isAuthenticated: false
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const user: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          avatar: firebaseUser.photoURL || undefined,
          role: firebaseUser.email?.endsWith('@devflow.io') ? 'admin' : 'client',
          emailVerified: firebaseUser.emailVerified
        };
        setAuthState({ user, isAuthenticated: true });
      } else {
        setAuthState({ user: null, isAuthenticated: false });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <HashRouter>
      <Layout user={authState.user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route 
            path="/login" 
            element={!authState.isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />} 
          />
          {/* Unified route for all Firebase Auth actions */}
          <Route 
            path="/auth-action" 
            element={<AuthActionPage />} 
          />
          {/* Legacy routes redirected to unified page for compatibility */}
          <Route path="/reset-password" element={<Navigate to="/auth-action" replace />} />
          <Route path="/verify-email" element={<Navigate to="/auth-action" replace />} />
          
          <Route 
            path="/dashboard" 
            element={authState.isAuthenticated ? <Dashboard user={authState.user!} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/request" 
            element={authState.isAuthenticated ? <RequestProject user={authState.user!} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/admin" 
            element={authState.isAuthenticated && authState.user?.role === 'admin' ? <AdminPanel user={authState.user!} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/payment/:projectId" 
            element={authState.isAuthenticated ? <PaymentPage /> : <Navigate to="/login" />} 
          />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
