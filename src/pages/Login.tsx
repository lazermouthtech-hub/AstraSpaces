import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Mail, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [activeTab, setActiveTab] = useState<'customer' | 'admin'>('customer');
  const [customerMode, setCustomerMode] = useState<'login' | 'register'>('login');
  
  // Admin state
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Customer state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [customerPassword, setCustomerPassword] = useState('');
  const [customerError, setCustomerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { signInWithGoogle, loginWithEmail, registerWithEmail, currentUser } = useAuth();

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'KingPere2022$') {
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/dashboard');
    } else {
      setError('Invalid admin password');
    }
  };

  const handleCustomerGoogle = async () => {
    setCustomerError(null);
    setIsSubmitting(true);
    const res = await signInWithGoogle();
    setIsSubmitting(false);
    if (!res.success) {
      setCustomerError(res.error || 'Google login cancelled.');
      return;
    }
    const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || '/user-dashboard';
    navigate(redirectUrl);
  };

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustomerError(null);

    if (!email.trim()) {
      setCustomerError('Please enter an email.');
      return;
    }

    setIsSubmitting(true);
    if (customerMode === 'register') {
      if (!fullName.trim()) {
        setCustomerError('Please enter your full name.');
        setIsSubmitting(false);
        return;
      }
      const res = await registerWithEmail(fullName, email, customerPassword);
      setIsSubmitting(false);
      if (!res.success) {
        if ((res as any).code === 'auth/email-already-in-use') {
          setCustomerMode('login');
          setCustomerError('This email is already registered. Switched to Sign In mode — enter your password or use Google.');
        } else {
          setCustomerError(res.error || 'Registration failed.');
        }
        return;
      }
    } else {
      const res = await loginWithEmail(email, customerPassword);
      setIsSubmitting(false);
      if (!res.success) {
        setCustomerError(res.error || 'Sign in failed. Check credentials.');
        return;
      }
    }

    const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || '/user-dashboard';
    navigate(redirectUrl);
  };

  return (
    <div className="min-h-screen bg-[#F4F4F7] flex items-center justify-center p-4">
      <div className="bg-white p-7 sm:p-8 rounded-3xl border border-gray-200 shadow-xl max-w-md w-full animate-in fade-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-orange-600 text-white rounded-2xl flex items-center justify-center mb-3 shadow-sm">
            {activeTab === 'customer' ? <User className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            {activeTab === 'customer' ? 'Customer Account' : 'Admin Access'}
          </h1>
          <p className="text-xs text-gray-500 mt-1 text-center">
            {activeTab === 'customer'
              ? 'Sign in or register with Firebase to save & manage your modular builds.'
              : 'Enter admin authentication key to manage inventory & orders.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-gray-100 rounded-xl mb-5 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('customer')}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'customer' ? 'bg-white text-gray-950 shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Customer (Firebase)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('admin')}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'admin' ? 'bg-white text-gray-950 shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Staff / Admin
          </button>
        </div>

        {activeTab === 'customer' ? (
          <div className="space-y-4">
            {/* Google Sign In */}
            <button
              type="button"
              onClick={handleCustomerGoogle}
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-400 text-gray-800 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google (Firebase)</span>
            </button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-gray-200 w-full" />
              <span className="bg-white px-3 text-[10px] uppercase font-bold text-gray-400 shrink-0">
                or email
              </span>
            </div>

            <div className="flex justify-center gap-4 text-xs font-bold mb-2">
              <button
                type="button"
                onClick={() => setCustomerMode('login')}
                className={`pb-1 border-b-2 cursor-pointer ${
                  customerMode === 'login' ? 'border-orange-600 text-orange-600' : 'border-transparent text-gray-400'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setCustomerMode('register')}
                className={`pb-1 border-b-2 cursor-pointer ${
                  customerMode === 'register' ? 'border-orange-600 text-orange-600' : 'border-transparent text-gray-400'
                }`}
              >
                Create Account
              </button>
            </div>

            {customerError && (
              <p className="text-xs font-semibold text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
                {customerError}
              </p>
            )}

            <form onSubmit={handleCustomerSubmit} className="space-y-3">
              {customerMode === 'register' && (
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={customerPassword}
                  onChange={(e) => setCustomerPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-orange-600 text-white font-bold py-3 px-4 rounded-xl shadow-xs hover:bg-orange-700 transition-colors cursor-pointer text-xs sm:text-sm uppercase tracking-wider"
              >
                {isSubmitting
                  ? 'Connecting to Firebase...'
                  : customerMode === 'register'
                  ? 'Create Firebase Account'
                  : 'Sign In to Configurator'}
              </button>
            </form>
          </div>
        ) : (
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setPassword('KingPere2022$')}
                  className="text-[10px] text-orange-600 hover:text-orange-700 font-bold cursor-pointer"
                >
                  Autofill Demo Key
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                placeholder="••••••••"
                autoFocus
              />
              {error && (
                <p className="text-xs font-semibold text-red-500 mt-2">{error}</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-black text-white font-bold py-3 px-4 rounded-xl shadow-xs hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Authenticate Admin
            </button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-500">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="hover:text-gray-900 cursor-pointer"
          >
            ← Return to Homepage
          </button>
          <button
            type="button"
            onClick={() => navigate('/configurator')}
            className="hover:text-orange-600 cursor-pointer"
          >
            3D Configurator →
          </button>
        </div>
      </div>
    </div>
  );
}
