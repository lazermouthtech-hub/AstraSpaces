import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Home,
  Box,
  Layers,
  FileText,
  Trash2,
  Copy,
  Edit2,
  Plus,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  DollarSign,
  User,
  Mail,
  Phone,
  LogOut,
  Calendar,
  Sparkles,
  Search,
  Filter,
  Check,
  AlertCircle,
  Truck,
  RotateCcw,
  ChevronRight,
  Sun,
  Maximize2,
  Lock,
  Activity,
  Award,
  Download,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAppConfig } from '../context/AppConfigContext';
import { formatCurrency, normalizeCurrency, TWO_CURRENCIES } from '../utils/currency';
import { getOrders, subscribeToOrders, syncOrdersCurrency } from '../utils/orderManager';
import { UserSavedProject, CustomerOrder, HomeModelId, CustomizationState } from '../types';
import { BASE_MODELS } from '../data/models';
import { updateCurrentUserProfile } from '../utils/authManager';
import { CustomerProgressTracker } from '../components/dashboard/CustomerProgressTracker';
import { SpecSheetModal } from '../components/SpecSheetModal';

export default function UserDashboard() {
  const navigate = useNavigate();
  const { config, updateConfig, setCurrency } = useAppConfig();
  const {
    currentUser,
    firebaseUser,
    logout,
    deleteProject,
    renameProject,
    duplicateProject,
    signInWithGoogle,
    loginWithEmail,
    registerWithEmail,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'projects' | 'progress' | 'orders' | 'account'>('projects');
  const [selectedProgressOrderId, setSelectedProgressOrderId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [modelFilter, setModelFilter] = useState<string>('all');
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [activeSpecSheetData, setActiveSpecSheetData] = useState<{ state: CustomizationState; totalPrice: number } | null>(null);

  // Rename modal / inline state
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Profile editing
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFullName, setEditFullName] = useState(currentUser?.fullName || '');
  const [editPhone, setEditPhone] = useState(currentUser?.phone || '');
  const [profileMessage, setProfileMessage] = useState<string | null>(null);

  // Guest / Login Form state (if not logged in)
  const [loginMode, setLoginMode] = useState<'signin' | 'register'>('signin');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Load orders matching customer email or fallback to sample
  useEffect(() => {
    const all = getOrders();
    const userEmail = currentUser?.email?.toLowerCase();
    const matched = userEmail
      ? all.filter((o) => o.customer.email.toLowerCase() === userEmail)
      : [];
    setOrders(matched.length > 0 ? matched : all.slice(0, 2));

    const unsubscribe = subscribeToOrders((latest) => {
      if (userEmail) {
        const m = latest.filter((o) => o.customer.email.toLowerCase() === userEmail);
        setOrders(m.length > 0 ? m : latest.slice(0, 2));
      } else {
        setOrders(latest.slice(0, 2));
      }
    });
    return unsubscribe;
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      setEditFullName(currentUser.fullName);
      setEditPhone(currentUser.phone || '');
    }
  }, [currentUser]);

  const projects = currentUser?.savedProjects || [];

  // Filter projects
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.modelName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      modelFilter === 'all' ||
      (modelFilter === 'expandable' && p.modelId.includes('expandable')) ||
      (modelFilter === 'capsule' && p.modelId.includes('capsule')) ||
      (modelFilter === 'cabin' && p.modelId.includes('apple-cabin')) ||
      (modelFilter === 'folding' && p.modelId.includes('folding'));
    return matchesSearch && matchesFilter;
  });

  const portfolioValue = projects.reduce((acc, p) => acc + (p.totalPrice || 0), 0);

  const handleOpenProjectInConfigurator = (project: UserSavedProject) => {
    navigate(`/configurator?projectId=${project.id}&model=${project.modelId}`);
  };

  const handleStartRename = (project: UserSavedProject) => {
    setRenamingId(project.id);
    setRenameValue(project.name);
  };

  const handleSaveRename = async (projectId: string) => {
    if (!renameValue.trim()) return;
    await renameProject(projectId, renameValue.trim());
    setRenamingId(null);
  };

  const handleDeleteConfirm = async (projectId: string) => {
    await deleteProject(projectId);
    setDeletingId(null);
  };

  const handleDuplicate = async (projectId: string) => {
    await duplicateProject(projectId);
  };

  const handleDownloadOrderBlueprint = (order: CustomerOrder) => {
    const fallbackState: CustomizationState = order.customization?.rawState || {
      modelId: order.customization.modelId,
      wallCladding: 'wood-grain-embossed',
      glazing: 'broken-bridge-sliding-door',
      lightingPackage: 'standard-recessed',
      electricalTier: 'smart-iot-200a',
      flooring: 'wood-nordic-pale-oak',
      roofOption: 'factory-standard-roof',
      cabinetry: 'melamine-flat-panel',
      hasKitchenetteModule: true,
      hasLuxuryBathPod: true,
      hasLuxuryBedSuite: false,
      hasLivingSofa: false,
      hasHvacMiniSplit: false,
      hasExteriorPergolaDeck: false,
      hasBioDigester: false,
      hasSmartDoorLock: false,
      hasElectricBlinds: false,
    };
    setActiveSpecSheetData({
      state: fallbackState,
      totalPrice: order.pricing.totalPrice,
    });
  };

  const handleSaveProfile = () => {
    if (!editFullName.trim()) return;
    const updated = updateCurrentUserProfile({
      fullName: editFullName.trim(),
      phone: editPhone.trim() || undefined,
    });
    setIsEditingProfile(false);
    setProfileMessage('Profile details updated successfully.');
    setTimeout(() => setProfileMessage(null), 3500);
  };

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setAuthError(null);
    const res = await signInWithGoogle();
    setAuthLoading(false);
    if (!res.success) {
      setAuthError(res.error || 'Google sign in failed.');
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    if (loginMode === 'register') {
      if (!authName.trim()) {
        setAuthError('Please enter your full name.');
        setAuthLoading(false);
        return;
      }
      const res = await registerWithEmail(authName, authEmail, authPassword);
      setAuthLoading(false);
      if (!res.success) {
        if ((res as any).code === 'auth/email-already-in-use') {
          setLoginMode('signin');
          setAuthError('Email already registered. Switched to Sign In mode.');
        } else {
          setAuthError(res.error || 'Registration failed.');
        }
      }
    } else {
      const res = await loginWithEmail(authEmail, authPassword);
      setAuthLoading(false);
      if (!res.success) {
        setAuthError(res.error || 'Sign in failed. Check credentials.');
      }
    }
  };

  const handleDemoSignIn = async () => {
    setAuthLoading(true);
    await loginWithEmail('alex.morgan@example.com', 'password123');
    setAuthLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Top Brand Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-3.5 transition-all shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-6">
            <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity" title="Return to Home">
              <img
                src="https://res.cloudinary.com/ddaxljfgp/image/upload/v1791201844/10apples_logo_main_eqm9wf.png"
                alt="10Apples Logo"
                className="h-7 sm:h-8 w-auto object-contain"
              />
            </Link>

            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-gray-400">
              <span>/</span>
              <span className="text-gray-900 font-bold flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-orange-600" />
                User Client Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Currency Selector */}
            <div className="inline-flex p-0.5 bg-gray-100 rounded-lg border border-gray-200 shrink-0">
              {TWO_CURRENCIES.map((curr) => {
                const isActive = normalizeCurrency(config.currency) === curr.code;
                return (
                  <button
                    key={curr.code}
                    type="button"
                    onClick={() => {
                      if (setCurrency) {
                        setCurrency(curr.code);
                      } else {
                        updateConfig({ ...config, currency: curr.code });
                      }
                      syncOrdersCurrency(curr.code);
                    }}
                    className={`px-2 py-1 text-[11px] font-extrabold rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                      isActive
                        ? curr.code === 'GHS'
                          ? 'bg-orange-600 text-white shadow-xs'
                          : 'bg-gray-950 text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-950'
                    }`}
                  >
                    <span>{curr.symbol}</span>
                    <span>{curr.code}</span>
                  </button>
                );
              })}
            </div>

            {/* Launch 3D Configurator Button */}
            <Link
              to="/configurator"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer"
              title="Open 3D House Configurator"
            >
              <Box className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Open 3D Configurator</span>
            </Link>

            {currentUser && (
              <button
                type="button"
                onClick={logout}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-gray-200 text-gray-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                title="Sign out of account"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {!currentUser ? (
          /* =========================================================================
             GUEST / UNREGISTERED USER SIGN-IN PROMPT
             ========================================================================= */
          <div className="max-w-xl mx-auto my-8 bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-br from-orange-50 via-white to-gray-50 p-6 sm:p-8 border-b border-gray-200">
              <div className="w-12 h-12 bg-orange-600 text-white rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                <User className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-black text-gray-950 tracking-tight">
                Access Your User Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1.5 leading-relaxed">
                Manage your saved 3D modular home projects, track production slot reservations,
                and review engineering specifications in real time.
              </p>
            </div>

            <div className="p-6 sm:p-8 space-y-5">
              {/* Google Fast Sign In */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={authLoading}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-gray-300 hover:bg-gray-50 text-xs sm:text-sm font-bold text-gray-800 transition-all shadow-2xs cursor-pointer hover:border-gray-400"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                <span>Continue with Google</span>
              </button>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-gray-200 w-full" />
                <span className="bg-white px-3 text-[11px] uppercase font-bold text-gray-400 absolute tracking-wider">
                  Or with email
                </span>
              </div>

              {authError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Email Form */}
              <form onSubmit={handleEmailAuth} className="space-y-3.5">
                {loginMode === 'register' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="jane@example.com"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {authLoading ? 'Verifying...' : loginMode === 'register' ? 'Create Account' : 'Sign In'}
                </button>
              </form>

              {/* Mode Switch & Demo Login */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-gray-100 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMode(loginMode === 'signin' ? 'register' : 'signin');
                    setAuthError(null);
                  }}
                  className="text-orange-600 font-bold hover:underline cursor-pointer"
                >
                  {loginMode === 'signin'
                    ? "Don't have an account? Sign up"
                    : 'Already registered? Sign in'}
                </button>

                <button
                  type="button"
                  onClick={handleDemoSignIn}
                  disabled={authLoading}
                  className="text-gray-500 hover:text-gray-900 font-medium underline cursor-pointer"
                >
                  Use Demo Account (Alex Morgan)
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* =========================================================================
             AUTHENTICATED USER DASHBOARD
             ========================================================================= */
          <div className="space-y-6">
            {/* Top User Profile Header Banner */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-6 sm:p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-4 sm:gap-5">
                  <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white font-black text-2xl flex items-center justify-center shadow-md shrink-0">
                    {currentUser.fullName.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight">
                        {currentUser.fullName}
                      </h1>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Verified Client
                      </span>
                      {firebaseUser && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-50 text-orange-700 border border-orange-200">
                          <ShieldCheck className="w-3 h-3 text-orange-600" />
                          Firebase Synced
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-1.5 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        {currentUser.email}
                      </span>
                      {currentUser.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          {currentUser.phone}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        Joined {new Date(currentUser.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
                  {orders.length > 0 && (
                    <button
                      type="button"
                      onClick={() => handleDownloadOrderBlueprint(orders[0])}
                      className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs transition-all shadow-xs hover:shadow-md cursor-pointer active:scale-95 border border-emerald-500/30"
                      title="Download official architectural CAD blueprint and engineering specification sheet PDF for your active reserved project"
                    >
                      <Download className="w-4 h-4 text-emerald-200" />
                      <span>Download Blueprint (PDF)</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setActiveTab('progress')}
                    className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-950 hover:bg-gray-900 text-white font-bold text-xs transition-all shadow-xs hover:shadow-md cursor-pointer border border-gray-800"
                    title="Track Build Development Progress"
                  >
                    <Activity className="w-4 h-4 text-orange-400 animate-pulse" />
                    <span>Track Development Progress</span>
                  </button>

                  <Link
                    to="/configurator"
                    className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition-all shadow-xs hover:shadow-md cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create New 3D Project</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => setActiveTab('account')}
                    className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 transition-colors cursor-pointer"
                    title="Account Settings"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-gray-100">
                <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Saved Custom Builds
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-gray-900 mt-0.5">
                    {projects.length}
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab('progress')}
                  className="p-3.5 bg-gray-50 hover:bg-orange-50/60 rounded-2xl border border-gray-100 hover:border-orange-200 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 group-hover:text-orange-600 uppercase tracking-wider">
                    <span>Build Progress</span>
                    <Activity className="w-3.5 h-3.5 text-orange-600" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-orange-600 mt-0.5 flex items-center gap-1.5">
                    <span>{orders.length > 0 ? `${orders[0].progress?.progressPercent ?? 25}%` : 'Queue'}</span>
                    <span className="text-[10px] font-bold text-gray-500 font-sans">
                      {orders.length > 0 ? 'Active' : 'Ready'}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Portfolio Value
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-gray-900 font-mono mt-0.5">
                    {formatCurrency(portfolioValue, config.currency)}
                  </div>
                </div>

                <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Preferred Currency
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-0.5 font-mono">
                    {normalizeCurrency(config.currency)}
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs Bar */}
            <div className="flex items-center gap-2 border-b border-gray-200 pb-px overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('projects')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all cursor-pointer border-b-2 shrink-0 ${
                  activeTab === 'projects'
                    ? 'border-orange-600 text-orange-600 bg-white shadow-2xs'
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>My Saved Projects</span>
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-orange-100 text-orange-800 font-mono">
                  {projects.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('progress')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all cursor-pointer border-b-2 shrink-0 ${
                  activeTab === 'progress'
                    ? 'border-orange-600 text-orange-600 bg-white shadow-2xs'
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Activity className="w-4 h-4 text-orange-600" />
                <span>Build &amp; Development Progress</span>
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-orange-500 text-white font-mono font-bold">
                  {orders.length > 0 ? `${orders[0].progress?.progressPercent ?? 25}%` : 'Live'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all cursor-pointer border-b-2 shrink-0 ${
                  activeTab === 'orders'
                    ? 'border-orange-600 text-orange-600 bg-white shadow-2xs'
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Truck className="w-4 h-4" />
                <span>Reservations &amp; Orders</span>
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-gray-200 text-gray-700 font-mono">
                  {orders.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('account')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all cursor-pointer border-b-2 ${
                  activeTab === 'account'
                    ? 'border-orange-600 text-orange-600 bg-white shadow-2xs'
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Account & Activities</span>
              </button>
            </div>

            {/* TAB 1: SAVED PROJECTS */}
            {activeTab === 'projects' && (
              <div className="space-y-4">
                {/* Search & Filter Controls */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-gray-200 shadow-2xs">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search saved projects by name or model..."
                      className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Filter className="w-3.5 h-3.5 text-gray-400" />
                    <select
                      value={modelFilter}
                      onChange={(e) => setModelFilter(e.target.value)}
                      className="px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer"
                    >
                      <option value="all">All Models</option>
                      <option value="expandable">Expandable Modular</option>
                      <option value="capsule">Space Capsule</option>
                      <option value="cabin">Apple Cabin</option>
                      <option value="folding">Folding Container</option>
                    </select>
                  </div>
                </div>

                {filteredProjects.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-10 text-center space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto">
                      <Box className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900">No projects found</h3>
                      <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
                        {searchQuery || modelFilter !== 'all'
                          ? 'No saved projects match your search criteria. Try resetting filters.'
                          : 'You haven’t saved any custom modular builds yet. Launch the 3D configurator to design your first house!'}
                      </p>
                    </div>
                    <Link
                      to="/configurator"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 text-white font-bold text-xs hover:bg-orange-700 transition-all shadow-xs cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Start Customizing in 3D</span>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredProjects.map((project) => {
                      const modelData = BASE_MODELS.find((m) => m.id === project.modelId);
                      const isRenaming = renamingId === project.id;

                      return (
                        <div
                          key={project.id}
                          className="bg-white rounded-3xl border border-gray-200 hover:border-orange-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                        >
                          <div>
                            {/* Card Header Top */}
                            <div className="p-5 pb-3 border-b border-gray-100 flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                {isRenaming ? (
                                  <div className="flex items-center gap-1.5">
                                    <input
                                      type="text"
                                      value={renameValue}
                                      onChange={(e) => setRenameValue(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveRename(project.id);
                                        if (e.key === 'Escape') setRenamingId(null);
                                      }}
                                      autoFocus
                                      className="px-2 py-1 text-sm font-bold border border-orange-400 rounded-lg w-full focus:outline-none"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleSaveRename(project.id)}
                                      className="p-1.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 cursor-pointer"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1.5 group/title">
                                    <h3
                                      onClick={() => handleOpenProjectInConfigurator(project)}
                                      className="font-black text-gray-950 text-base truncate hover:text-orange-600 cursor-pointer transition-colors"
                                      title={project.name}
                                    >
                                      {project.name}
                                    </h3>
                                    <button
                                      type="button"
                                      onClick={() => handleStartRename(project)}
                                      className="opacity-0 group-hover/title:opacity-100 p-1 text-gray-400 hover:text-gray-700 transition-opacity cursor-pointer"
                                      title="Rename project"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                )}

                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-900 border border-orange-200 px-1.5 py-0.5 rounded">
                                    {project.modelName}
                                  </span>
                                  {modelData?.sqft && (
                                    <span className="text-[11px] text-gray-400 font-medium">
                                      {modelData.sqft} sq ft
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <div className="text-base font-extrabold text-gray-900 font-mono">
                                  {formatCurrency(project.totalPrice, config.currency)}
                                </div>
                                <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                                  {new Date(project.savedAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>

                            {/* Specifications Summary Tags */}
                            <div className="p-5 py-3 space-y-2 bg-gray-50/50">
                              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                Custom Build Specs
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {project.state?.wallCladding && (
                                  <span className="text-[10px] px-2 py-0.5 bg-white border border-gray-200 rounded-md text-gray-700 font-medium truncate max-w-[150px]">
                                    Wall: {project.state.wallCladding.replace(/-/g, ' ')}
                                  </span>
                                )}
                                {project.state?.glazing && (
                                  <span className="text-[10px] px-2 py-0.5 bg-white border border-gray-200 rounded-md text-gray-700 font-medium truncate max-w-[150px]">
                                    Glass: {project.state.glazing.replace(/-/g, ' ')}
                                  </span>
                                )}
                                {project.state?.flooring && (
                                  <span className="text-[10px] px-2 py-0.5 bg-white border border-gray-200 rounded-md text-gray-700 font-medium truncate max-w-[150px]">
                                    Floor: {project.state.flooring.replace(/-/g, ' ')}
                                  </span>
                                )}
                                {project.state?.roofOption && (
                                  <span className="text-[10px] px-2 py-0.5 bg-white border border-gray-200 rounded-md text-gray-700 font-medium truncate max-w-[150px]">
                                    Roof: {project.state.roofOption.replace(/-/g, ' ')}
                                  </span>
                                )}
                                {project.state?.layoutBedrooms && (
                                  <span className="text-[10px] px-2 py-0.5 bg-orange-50 border border-orange-200 rounded-md text-orange-800 font-bold">
                                    {project.state.layoutBedrooms} Bed Layout
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Architectural CAD Blueprint & Specification Sheet Action */}
                          {(() => {
                            const isProjectReserved = Boolean(
                              project.orderId ||
                              orders.some((o) => o.customization.modelId === project.modelId || (project.orderId && o.id === project.orderId))
                            );

                            return (
                              <div className="px-5 py-2.5 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between gap-2 flex-wrap">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <FileText className={`w-3.5 h-3.5 shrink-0 ${isProjectReserved ? 'text-orange-600' : 'text-gray-400'}`} />
                                  <span className="text-xs font-bold text-gray-800 truncate">
                                    Architectural CAD &amp; Specs
                                  </span>
                                </div>
                                {isProjectReserved ? (
                                  <button
                                    type="button"
                                    onClick={() => setActiveSpecSheetData({ state: project.state, totalPrice: project.totalPrice })}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition-all shadow-xs hover:shadow-sm cursor-pointer shrink-0 active:scale-95"
                                    title="Download official architectural specification sheet and CAD blueprint for this active reserved project"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Download Blueprint (PDF)</span>
                                  </button>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-gray-400 font-medium hidden sm:inline">
                                      Reserved Only
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        navigate(`/configurator?projectId=${project.id}&model=${project.modelId}`);
                                      }}
                                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white hover:bg-orange-50 text-gray-700 hover:text-orange-950 border border-gray-200 hover:border-orange-200 font-bold text-xs transition-all cursor-pointer shrink-0"
                                      title="Official Blueprint & Specs PDF unlocks automatically once this project is reserved with a deposit"
                                    >
                                      <Lock className="w-3 h-3 text-amber-600" />
                                      <span>Reserve to Unlock</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })()}

                          {/* Card Footer Actions */}
                          <div className="p-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2 bg-white">
                            <button
                              type="button"
                              onClick={() => handleOpenProjectInConfigurator(project)}
                              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition-all shadow-xs hover:shadow-md cursor-pointer"
                            >
                              <Box className="w-3.5 h-3.5" />
                              <span>Open in 3D</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setActiveTab('progress');
                              }}
                              className="p-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-xl transition-colors cursor-pointer"
                              title="Track Build & Factory Progress"
                            >
                              <Activity className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDuplicate(project.id)}
                              className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                              title="Duplicate project"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            {deletingId === project.id ? (
                              <div className="flex items-center gap-1 bg-red-50 p-1 rounded-xl border border-red-200">
                                <span className="text-[10px] font-bold text-red-700 px-1">Delete?</span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteConfirm(project.id)}
                                  className="px-2 py-1 bg-red-600 text-white text-[10px] font-bold rounded-lg hover:bg-red-700 cursor-pointer"
                                >
                                  Yes
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeletingId(null)}
                                  className="px-1.5 py-1 text-gray-500 hover:text-gray-800 text-[10px] font-bold cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setDeletingId(project.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                                title="Delete project"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: BUILD & DEVELOPMENT PROGRESS TRACKER */}
            {activeTab === 'progress' && (
              <CustomerProgressTracker
                orders={orders}
                selectedOrderId={selectedProgressOrderId}
                onSelectOrder={setSelectedProgressOrderId}
                currency={config.currency}
                onDownloadBlueprint={handleDownloadOrderBlueprint}
              />
            )}

            {/* TAB 3: RESERVATIONS & ORDERS */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-10 text-center space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto">
                      <Truck className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900">No Active Reservations</h3>
                      <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
                        When you reserve a factory production slot from the 3D configurator, your order status,
                        engineering checks, and estimated dispatch dates will appear here.
                      </p>
                    </div>
                    <Link
                      to="/configurator"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 text-white font-bold text-xs hover:bg-orange-700 transition-all shadow-xs cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Reserve Production Slot in 3D</span>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => {
                      const statusMap: Record<string, { label: string; bg: string; text: string }> = {
                        deposit_received: { label: 'Deposit Confirmed', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
                        engineering_review: { label: 'Engineering Review', bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
                        production_scheduled: { label: 'Production Scheduled', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700' },
                        in_assembly: { label: 'In Factory Assembly', bg: 'bg-orange-50 border-orange-200', text: 'text-orange-700' },
                        freight_transit: { label: 'Dispatch & Transit', bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700' },
                        completed: { label: 'Delivered & Installed', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
                      };

                      const currentStatus = statusMap[order.status] || {
                        label: order.status.replace(/_/g, ' '),
                        bg: 'bg-gray-50 border-gray-200',
                        text: 'text-gray-700',
                      };

                      return (
                        <div
                          key={order.id}
                          className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs hover:shadow-md transition-all"
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded border border-gray-200">
                                  {order.id}
                                </span>
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${currentStatus.bg} ${currentStatus.text}`}
                                >
                                  {currentStatus.label}
                                </span>
                              </div>
                              <h3 className="text-lg font-black text-gray-950 mt-1">
                                {order.customization.modelName}
                              </h3>
                              <p className="text-xs text-gray-500">
                                Placed on {new Date(order.createdAt).toLocaleDateString()} • Target Delivery: {order.estimatedDeliveryDate || 'Q2 2026'}
                              </p>
                            </div>

                            <div className="text-left md:text-right">
                              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                Total Build Investment
                              </div>
                              <div className="text-xl font-black text-gray-900 font-mono mt-0.5">
                                {formatCurrency(order.pricing.totalPrice, config.currency)}
                              </div>
                              <div className="text-xs font-semibold text-emerald-600">
                                Deposit Paid: {formatCurrency(order.pricing.depositDue, config.currency)} (Fully Refundable)
                              </div>
                            </div>
                          </div>

                          {/* Order Details & Logistics */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-xs">
                            <div className="space-y-1">
                              <span className="font-bold text-gray-400 uppercase text-[10px]">Delivery Destination</span>
                              <p className="text-gray-800 font-medium">
                                {order.customer.deliveryAddress}, ZIP {order.customer.zipCode}
                              </p>
                              <p className="text-gray-500">Land Status: {order.customer.landStatus === 'own-land' ? 'Land Owned' : 'Permits / In Progress'}</p>
                            </div>

                            <div className="space-y-1">
                              <span className="font-bold text-gray-400 uppercase text-[10px]">Architectural Highlights</span>
                              <p className="text-gray-700 truncate">Cladding: {order.customization.wallCladdingName}</p>
                              <p className="text-gray-700 truncate">Glazing: {order.customization.glazingName}</p>
                              <p className="text-gray-700 truncate">Roof: {order.customization.roofName}</p>
                            </div>

                            <div className="space-y-1.5 md:text-right flex flex-col md:items-end justify-center">
                              <button
                                type="button"
                                onClick={() => handleDownloadOrderBlueprint(order)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs transition-all shadow-xs cursor-pointer active:scale-95"
                                title="Download official architectural CAD blueprint and engineering specification sheet PDF for this active reserved order"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Download Blueprint (PDF)</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedProgressOrderId(order.id);
                                  setActiveTab('progress');
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-2xs"
                              >
                                <Activity className="w-3.5 h-3.5 text-white" />
                                <span>Track Progress ({order.progress?.progressPercent ?? 25}%)</span>
                              </button>
                              <Link
                                to={`/configurator?model=${order.customization.modelId}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-800 font-bold text-xs transition-colors cursor-pointer"
                              >
                                <Box className="w-3.5 h-3.5 text-orange-600" />
                                <span>Inspect Model in 3D</span>
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: ACCOUNT & SETTINGS */}
            {activeTab === 'account' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 space-y-6">
                  <div>
                    <h2 className="text-lg font-black text-gray-950">Profile Details</h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Keep your contact info up to date for production delivery notices and design consultations.
                    </p>
                  </div>

                  {profileMessage && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-700 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{profileMessage}</span>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={editFullName}
                        onChange={(e) => setEditFullName(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        disabled
                        value={currentUser.email}
                        className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                      <span className="text-[10px] text-gray-400 mt-1 block">
                        Verified authentication email tied to your Firebase account.
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number (Optional)</label>
                      <input
                        type="tel"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder="(555) 000-0000"
                        className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>

                {/* Sidebar Info Card */}
                <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 space-y-5">
                  <div>
                    <h3 className="text-sm font-bold text-gray-950 uppercase tracking-wider">
                      Security & Platform
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      10Apples modular platform authentication is powered by Google Firebase.
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between text-xs">
                      <span className="font-semibold text-gray-700">Database Connection</span>
                      <span className="font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Cloud Firestore
                      </span>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between text-xs">
                      <span className="font-semibold text-gray-700">Session ID</span>
                      <span className="font-mono text-[10px] text-gray-500 truncate max-w-[120px]">
                        {currentUser.id}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={logout}
                      className="w-full py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out from All Devices</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Official Technical Spec Sheet / CAD Blueprint Modal */}
      {activeSpecSheetData && (
        <SpecSheetModal
          state={activeSpecSheetData.state}
          totalPrice={activeSpecSheetData.totalPrice}
          onClose={() => setActiveSpecSheetData(null)}
        />
      )}
    </div>
  );
}
