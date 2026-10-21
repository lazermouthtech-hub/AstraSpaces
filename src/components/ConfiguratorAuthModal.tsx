import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  Phone,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building,
  LogOut,
  FolderHeart,
} from 'lucide-react';
import { CustomizationState, HomeModelId } from '../types';
import { BASE_MODELS } from '../data/models';
import { useAppConfig } from '../context/AppConfigContext';
import { formatCurrency } from '../utils/currency';
import { UserAccount } from '../utils/authManager';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

interface ConfiguratorAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: CustomizationState;
  totalPrice: number;
  onSuccess?: (user: UserAccount) => void;
}

export const ConfiguratorAuthModal: React.FC<ConfiguratorAuthModalProps> = ({
  isOpen,
  onClose,
  state,
  totalPrice,
  onSuccess,
}) => {
  const { config } = useAppConfig();
  const {
    currentUser,
    signInWithGoogle,
    loginWithEmail,
    registerWithEmail,
    logout,
    saveCurrentProject,
  } = useAuth();

  const [tab, setTab] = useState<'register' | 'login'>('register');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [saveDesign, setSaveDesign] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [savedUserName, setSavedUserName] = useState('');

  if (!isOpen) return null;

  const currentModel =
    config.models?.find((m: any) => m.id === state.modelId) ||
    BASE_MODELS.find((m) => m.id === state.modelId) ||
    BASE_MODELS[0];

  const projectPayload = {
    modelId: state.modelId,
    modelName: currentModel.name,
    totalPrice,
    currency: config.currency,
    state,
  };

  const triggerSuccessAnimation = (name: string, customMsg?: string) => {
    setSavedUserName(name);
    setSuccessMessage(customMsg || `Your custom build has been synced and saved to your Firebase account.`);
    setIsSuccess(true);
    confetti({
      particleCount: 75,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#ea580c', '#f97316', '#22c55e', '#3b82f6'],
    });

    setTimeout(() => {
      onClose();
      setIsSuccess(false);
    }, 1800);
  };

  // 1. Google Sign-In with Firebase
  const handleGoogleSignIn = async () => {
    setError(null);
    setIsGoogleSubmitting(true);
    try {
      const res = await signInWithGoogle(saveDesign ? projectPayload : undefined);
      setIsGoogleSubmitting(false);
      if (!res.success || !res.user) {
        setError(res.error || 'Google authentication was cancelled.');
        return;
      }
      if (onSuccess) onSuccess(res.user);
      triggerSuccessAnimation(res.user.fullName, 'Signed in with Google! Your 3D modular design is saved.');
    } catch (err: any) {
      setIsGoogleSubmitting(false);
      setError(err?.message || 'Failed to authenticate with Google.');
    }
  };

  // 2. Email & Password Registration via Firebase
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    const res = await registerWithEmail(
      fullName,
      email,
      password,
      phone,
      saveDesign ? projectPayload : undefined
    );
    setIsSubmitting(false);

    if (!res.success || !res.user) {
      if ((res as any).code === 'auth/email-already-in-use') {
        setTab('login');
        setError('This email is already registered. Please sign in below to continue with your project.');
      } else {
        setError(res.error || 'Failed to register. Please check your credentials.');
      }
      return;
    }

    if (onSuccess) onSuccess(res.user);
    triggerSuccessAnimation(res.user.fullName);
  };

  // 3. Email & Password Login via Firebase
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setIsSubmitting(true);
    const res = await loginWithEmail(
      email,
      password,
      saveDesign ? projectPayload : undefined
    );
    setIsSubmitting(false);

    if (!res.success || !res.user) {
      setError(res.error || 'Failed to sign in. Please verify your credentials.');
      return;
    }

    if (onSuccess) onSuccess(res.user);
    triggerSuccessAnimation(res.user.fullName, 'Welcome back! Design linked to your account.');
  };

  const handleDemoFill = () => {
    setEmail('customer@10apples.com');
    setPassword('welcome123');
    setError(null);
  };

  const handleManualSave = async () => {
    if (!currentUser) return;
    setIsSubmitting(true);
    await saveCurrentProject(projectPayload);
    setIsSubmitting(false);
    triggerSuccessAnimation(currentUser.fullName, 'Current project design updated in your library!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-lg w-full overflow-hidden relative flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Header Bar */}
        <div className="bg-linear-to-r from-stone-900 via-gray-900 to-stone-900 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            title="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-orange-600/90 text-white border border-orange-400/40 shadow-xs">
              <Clock className="w-3 h-3 animate-pulse" />
              <span>Firebase Auth & Project Auto-Save</span>
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {currentUser ? 'Your Project & Account' : 'Save & Continue Your Project'}
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-md">
                {currentUser
                  ? `Signed in as ${currentUser.fullName}. Your custom configurations are backed up to Firebase.`
                  : "You've been designing for 4 minutes! Register or sign in via Firebase to save your floor plan, finishes, and live pricing breakdown."}
              </p>
            </div>
          </div>
        </div>

        {/* Success State Overlay */}
        {isSuccess ? (
          <div className="p-8 sm:p-10 flex flex-col items-center justify-center text-center space-y-4 my-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>
            <h3 className="text-2xl font-black text-gray-900">
              Welcome, {savedUserName}!
            </h3>
            <p className="text-sm text-gray-600 max-w-sm">
              {successMessage}
            </p>
            <div className="text-xs font-mono font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-200">
              Auto-saved total: {formatCurrency(totalPrice, config.currency)}
            </div>
          </div>
        ) : currentUser ? (
          /* User Profile & Saved Projects Mode (When Already Authenticated) */
          <div className="overflow-y-auto p-5 sm:p-6 space-y-5">
            <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white font-black text-lg flex items-center justify-center shadow-sm">
                  {currentUser.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-black text-gray-900">{currentUser.fullName}</div>
                  <div className="text-xs text-gray-500">{currentUser.email}</div>
                  {currentUser.phone && (
                    <div className="text-[11px] text-gray-400">{currentUser.phone}</div>
                  )}
                </div>
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                Verified
              </span>
            </div>

            {/* Current Active Design */}
            <div className="border border-gray-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Active Configurator Model
                </span>
                <span className="font-mono text-sm font-black text-gray-900">
                  {formatCurrency(totalPrice, config.currency)}
                </span>
              </div>
              <div className="text-sm font-extrabold text-gray-900">{currentModel.name}</div>
              <div className="text-xs text-gray-600">
                {currentModel.sqft} sq ft • {state.bedroomLayout?.replace(/-/g, ' ') || 'Modular Suite'} • {state.wallCladding}
              </div>

              <button
                type="button"
                onClick={handleManualSave}
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <FolderHeart className="w-4 h-4" />
                <span>{isSubmitting ? 'Saving to Firebase...' : 'Save Current Build Configuration'}</span>
              </button>
            </div>

            {/* Saved Projects in Firebase */}
            {currentUser.savedProjects && currentUser.savedProjects.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Saved Builds in Your Account ({currentUser.savedProjects.length})
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {currentUser.savedProjects.map((proj) => (
                    <div
                      key={proj.id}
                      className="p-3 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-between text-xs transition-colors"
                    >
                      <div>
                        <div className="font-bold text-gray-900">{proj.name}</div>
                        <div className="text-[10px] text-gray-500 font-mono">
                          {new Date(proj.savedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="font-mono font-bold text-gray-900">
                        {formatCurrency(proj.totalPrice, proj.currency || config.currency)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer controls */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold cursor-pointer"
              >
                Continue Designing
              </button>
            </div>
          </div>
        ) : (
          /* Authentication Form Mode (Not Logged In) */
          <div className="overflow-y-auto p-5 sm:p-6 space-y-4">
            {/* Project Summary Chip */}
            <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0 border border-orange-200 font-bold">
                  <Building className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-extrabold text-gray-900 truncate">
                    {currentModel.name}
                  </div>
                  <div className="text-[11px] text-gray-500 truncate">
                    {currentModel.sqft} sq ft • {state.bedroomLayout?.replace(/-/g, ' ') || 'Modular Suite'}
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[10px] uppercase font-bold text-gray-400">Current Estimate</div>
                <div className="text-sm sm:text-base font-black text-gray-950 font-mono">
                  {formatCurrency(totalPrice, config.currency)}
                </div>
              </div>
            </div>

            {/* Google Firebase One-Click Authentication Button */}
            <div>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleSubmitting}
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
                <span>
                  {isGoogleSubmitting ? 'Authenticating with Google...' : 'Continue with Google'}
                </span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-gray-200 w-full" />
              <span className="bg-white px-3 text-[10px] uppercase font-bold text-gray-400 shrink-0">
                or with email
              </span>
            </div>

            {/* Tab Selection */}
            <div className="grid grid-cols-2 p-1 bg-gray-100 rounded-xl border border-gray-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setTab('register');
                  setError(null);
                }}
                className={`py-2 px-3 rounded-lg transition-all cursor-pointer ${
                  tab === 'register'
                    ? 'bg-white text-gray-950 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Create Account (New)
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('login');
                  setError(null);
                }}
                className={`py-2 px-3 rounded-lg transition-all cursor-pointer ${
                  tab === 'login'
                    ? 'bg-white text-gray-950 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Sign In (Existing)
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
                {error}
              </div>
            )}

            {/* Forms */}
            {tab === 'register' ? (
              <form onSubmit={handleRegister} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Full Name <span className="text-orange-600">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. David Mensah"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Email Address <span className="text-orange-600">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@domain.com"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Phone Number (Optional)
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Create Password <span className="text-orange-600">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>

                <label className="flex items-center gap-2.5 cursor-pointer pt-0.5">
                  <input
                    type="checkbox"
                    checked={saveDesign}
                    onChange={(e) => setSaveDesign(e.target.checked)}
                    className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-gray-300 cursor-pointer"
                  />
                  <span className="text-xs text-gray-600 select-none">
                    Save current design to Firebase & enable instant project retrieval
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Registering with Firebase...</span>
                  ) : (
                    <>
                      <span>Register & Continue Project</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                      Email Address <span className="text-orange-600">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleDemoFill}
                      className="text-[10px] text-orange-600 hover:text-orange-700 font-bold cursor-pointer"
                    >
                      Autofill Demo Account
                    </button>
                  </div>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@domain.com"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Password <span className="text-orange-600">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2.5 cursor-pointer pt-0.5">
                  <input
                    type="checkbox"
                    checked={saveDesign}
                    onChange={(e) => setSaveDesign(e.target.checked)}
                    className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-gray-300 cursor-pointer"
                  />
                  <span className="text-xs text-gray-600 select-none">
                    Link current configuration to my account
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-gray-900 hover:bg-black text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Authenticating with Firebase...</span>
                  ) : (
                    <>
                      <span>Sign In & Continue Project</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Bottom Controls */}
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Secured by Firebase</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-[11px] font-semibold text-gray-400 hover:text-gray-700 underline underline-offset-2 cursor-pointer"
              >
                Remind me in 2 minutes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
