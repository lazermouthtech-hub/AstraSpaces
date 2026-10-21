/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppConfig, getActivePublicModelId } from '../context/AppConfigContext';
import { BASE_MODELS } from '../data/models';
import { FLOOR_PLAN_OPTIONS } from '../data/options';
import {
  CustomizationState,
  HomeModelId,
  LightingMode,
  ViewPerspective,
} from '../types';
import { getItemPriceForModel } from '../utils/pricingCalculator';
import { Header } from '../components/Header';
import { ThreeViewer } from '../components/3d/ThreeViewer';
import { ConfiguratorPanel } from '../components/ConfiguratorPanel';
import { CostBuildupPanel } from '../components/CostBuildupPanel';
import { SpecSheetModal } from '../components/SpecSheetModal';
import { ReserveModal } from '../components/ReserveModal';
import { ConfiguratorAuthModal } from '../components/ConfiguratorAuthModal';
import { useAuth } from '../context/AuthContext';
import {
  getCurrentUser,
  isUserSignedUp,
  AUTH_CHANGE_EVENT,
  UserAccount,
} from '../utils/authManager';
import { getOrders } from '../utils/orderManager';
import { Sliders, DollarSign, Box, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

const INITIAL_STATE: CustomizationState = {
  modelId: 'expandable-20ft',
  wallCladding: 'fluoro-white',
  interiorWall: 'bamboo-charcoal-offwhite',
  floorPlan: '2-bed-1-bath',
  bedroomLayout: '2-bedroom',
  glazing: 'broken-bridge-sliding-door',
  lightingPackage: 'standard-recessed',
  electricalTier: 'standard-100a',
  flooring: 'spc-nordic-oak',
  roofOption: 'standard-parapet',
  cabinetry: 'matte-black',
  hasKitchenetteModule: true,  // Added on starting for 20, 30, 40 footer (user can remove if desired)
  hasLuxuryBathPod: true,      // Added on starting for 20, 30, 40 footer (user can remove if desired)
  hasLuxuryBedSuite: false,    // User adds bed suite by themselves if desired
  hasLivingSofa: false,        // User adds living sofa by themselves if desired
  hasHvacMiniSplit: false,
  hasExteriorPergolaDeck: false,
  hasBioDigester: false,
  hasSmartDoorLock: false,     // Added by user if desired
  hasElectricBlinds: false,
  hasWardrobe: false,
  hasTvConsole: false,
};

export default function Configurator() {
  const { config } = useAppConfig();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [state, setState] = useState<CustomizationState>(() => {
    const urlModel = new URLSearchParams(window.location.search).get('model');
    const allKnown = [...(config.models || []), ...BASE_MODELS];
    const defaultModel = (getActivePublicModelId(allKnown, config.defaultModelId) as HomeModelId) || 'expandable-20ft';
    const initialModel = (urlModel && allKnown.some(m => m.id === urlModel))
      ? (urlModel as HomeModelId)
      : defaultModel;
    return {
      ...INITIAL_STATE,
      modelId: initialModel,
      floorPlan: initialModel === 'expandable-10ft' ? '10ft-1bed' : INITIAL_STATE.floorPlan,
      bedroomLayout: initialModel === 'expandable-10ft' ? '1-bedroom' : INITIAL_STATE.bedroomLayout,
    };
  });

  // Sync to query param change when URL searchParams changes externally
  useEffect(() => {
    const projectId = searchParams.get('projectId');
    if (projectId) {
      const user = getCurrentUser();
      const saved = user?.savedProjects?.find((p) => p.id === projectId);
      if (saved && saved.state) {
        setState(saved.state);
        return;
      }
    }

    const modelParam = searchParams.get('model');
    if (!modelParam) return;
    const allKnown = [...(config.models || []), ...BASE_MODELS];
    if (allKnown.some((m: any) => m.id === modelParam)) {
      setState((prev) => {
        if (prev.modelId !== modelParam) {
          return { ...prev, modelId: modelParam as HomeModelId };
        }
        return prev;
      });
    }
  }, [searchParams, config.models]);

  // Ensure active model is a valid model across all known base models; fallback only if completely unknown
  useEffect(() => {
    const allKnown = [...(config.models || []), ...BASE_MODELS];
    const isKnown = allKnown.some((m: any) => m.id === state.modelId);
    if (!isKnown && allKnown.length > 0) {
      const fallback = (getActivePublicModelId(allKnown, config.defaultModelId) as HomeModelId) || 'expandable-20ft';
      setState((prev) => ({ ...prev, modelId: fallback }));
      setSearchParams((params) => {
        const next = new URLSearchParams(params);
        next.set('model', fallback);
        return next;
      }, { replace: true });
    }
  }, [state.modelId, config.models, config.defaultModelId, setSearchParams]);

  const [lightingMode, setLightingMode] = useState<LightingMode>(config.viewerControls?.defaultLighting === 'night' ? 'night' : 'daylight');
  const [roofLiftPercent, setRoofLiftPercent] = useState<number>(0);
  const [roofRemoved, setRoofRemoved] = useState<boolean>(false);
  const [cutawayMode, setCutawayMode] = useState<boolean>(config.viewerControls?.defaultCutaway || false);
  const [currentPerspective, setCurrentPerspective] =
    useState<ViewPerspective>('exterior-iso');
  const [activeCategory, setActiveCategory] = useState<string>('Base House');

  // Sync to config changes if dashboard changes them
  useEffect(() => {
    if (config.viewerControls) {
       setLightingMode(config.viewerControls.defaultLighting === 'night' ? 'night' : 'daylight');
       setCutawayMode(config.viewerControls.defaultCutaway);
    }
  }, [config.viewerControls]);

  // Modals
  const [showSpecSheet, setShowSpecSheet] = useState<boolean>(false);
  const [showReserve, setShowReserve] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // Customer Account & 4-Minute Usage Popup Timer
  const { currentUser: authContextUser } = useAuth();
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => authContextUser || getCurrentUser());
  const [timerSecondsRemaining, setTimerSecondsRemaining] = useState<number>(240);

  const FOUR_MINUTES_MS = 240 * 1000; // 4 minutes
  const TIMER_STORAGE_KEY = '10apples_configurator_usage_start';
  const POPUP_SHOWN_KEY = '10apples_configurator_popup_shown';

  useEffect(() => {
    if (authContextUser) {
      setCurrentUser(authContextUser);
      setShowAuthModal(false);
    }
  }, [authContextUser]);

  // Listen to auth changes (register, login, logout)
  useEffect(() => {
    const handleAuthChange = (e: Event) => {
      const custom = e as CustomEvent<UserAccount | null>;
      const user = custom.detail !== undefined ? custom.detail : getCurrentUser();
      setCurrentUser(user);
      if (user) {
        setShowAuthModal(false);
      }
    };
    window.addEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
    return () => window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
  }, []);

  // 4-Minute Usage Timer:
  // "When a user has not signed up while using the configurator, there should be a popup,
  // for them to register or login to continue with their project after 4minutes of using the configurator."
  useEffect(() => {
    // If the user is already signed up, do not show the registration/login popup
    if (currentUser || isUserSignedUp()) {
      return;
    }

    let startTimestamp = Number(sessionStorage.getItem(TIMER_STORAGE_KEY));
    if (!startTimestamp || isNaN(startTimestamp)) {
      startTimestamp = Date.now();
      sessionStorage.setItem(TIMER_STORAGE_KEY, startTimestamp.toString());
    }

    const interval = setInterval(() => {
      // Re-check authentication status
      if (isUserSignedUp()) {
        clearInterval(interval);
        return;
      }

      const elapsed = Date.now() - startTimestamp;
      const remaining = Math.max(0, Math.ceil((FOUR_MINUTES_MS - elapsed) / 1000));
      setTimerSecondsRemaining(remaining);

      // Trigger popup when 4 minutes of using the configurator have elapsed
      if (elapsed >= FOUR_MINUTES_MS) {
        const alreadyShown = sessionStorage.getItem(POPUP_SHOWN_KEY);
        if (!alreadyShown) {
          sessionStorage.setItem(POPUP_SHOWN_KEY, 'true');
          setShowAuthModal(true);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentUser]);

  const handleCloseAuthModal = () => {
    setShowAuthModal(false);
    // If user temporarily postpones, snooze for 2 minutes
    const twoMinutesLaterStart = Date.now() - (FOUR_MINUTES_MS - 120 * 1000);
    sessionStorage.setItem(TIMER_STORAGE_KEY, twoMinutesLaterStart.toString());
    sessionStorage.removeItem(POPUP_SHOWN_KEY);
  };

  const handleAuthSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    sessionStorage.setItem(POPUP_SHOWN_KEY, 'true');
    setShowAuthModal(false);
  };

  // Desktop Toggle for Right Column Investment Breakdown Panel
  const [showInvestmentBreakdown, setShowInvestmentBreakdown] = useState<boolean>(true);

  // Configuration Workspace Mode: false = Basic Tools (Default), true = Advanced Tools (Pro)
  const [isAdvancedMode, setIsAdvancedMode] = useState<boolean>(false);

  // Track reservation status
  const [isProjectReservedState, setIsProjectReservedState] = useState<boolean>(false);

  const isProjectReserved = useMemo(() => {
    if (isProjectReservedState) return true;
    const projectId = searchParams.get('projectId');
    const orderId = searchParams.get('orderId');
    if (orderId) return true;

    // Check session storage
    if (sessionStorage.getItem(`reserved_${state.modelId}`) === 'true') return true;
    if (projectId && sessionStorage.getItem(`reserved_${projectId}`) === 'true') return true;

    // Check saved projects
    if (projectId && currentUser?.savedProjects) {
      const saved = currentUser.savedProjects.find((p) => p.id === projectId);
      if (saved?.orderId) return true;
    }

    // Check customer orders
    const allOrders = getOrders();
    const userEmail = currentUser?.email?.toLowerCase();
    if (userEmail) {
      const match = allOrders.some(
        (o) =>
          o.customer.email.toLowerCase() === userEmail &&
          (o.customization.modelId === state.modelId || (projectId && (o as any).projectId === projectId))
      );
      if (match) return true;
    }

    return false;
  }, [isProjectReservedState, searchParams, currentUser, state.modelId]);

  // Mobile Active Tab: 'viewer' | 'customize' | 'cost'
  const [mobileTab, setMobileTab] = useState<'viewer' | 'customize' | 'cost'>('viewer');

  // Calculate live total price
  const totalPrice = useMemo(() => {
    const currentModel =
      config.models?.find((m: any) => m.id === state.modelId) ||
      BASE_MODELS.find((m: any) => m.id === state.modelId) ||
      config.models?.[0] ||
      BASE_MODELS[0];
    const wallOpt =
      config.wallOptions.find((o: any) => o.id === state.wallCladding) ||
      config.wallOptions[0];
    const intWallOpt =
      (config.interiorWallOptions || []).find((o: any) => o.id === state.interiorWall) ||
      (config.interiorWallOptions || [])[0];
    const glassOpt =
      config.glazingOptions.find((o: any) => o.id === state.glazing) ||
      config.glazingOptions[0];
    const lightOpt =
      config.lightingOptions.find((o: any) => o.id === state.lightingPackage) ||
      config.lightingOptions[0];
    const elecOpt =
      config.electricalOptions.find((o: any) => o.id === state.electricalTier) ||
      config.electricalOptions[0];
    const floorOpt =
      config.flooringOptions.find((o: any) => o.id === state.flooring) ||
      config.flooringOptions[0];
    const roofOpt =
      config.roofOptions.find((o: any) => o.id === state.roofOption) || config.roofOptions[0];
    const cabOpt =
      config.cabinetryOptions.find((o: any) => o.id === state.cabinetry) || config.cabinetryOptions[0];

    const activeAddons = (config.addons || []).filter(
      (addon: any) => state[addon.id] && addon.isAvailable !== false && addon.isActive !== false
    );

    const isExpandableHouse =
      state.modelId === 'expandable-20ft' ||
      state.modelId === 'expandable-30ft' ||
      state.modelId === 'expandable-40ft' ||
      state.modelId.includes('expandable') ||
      currentModel?.series === 'expandable';
    const floorPlanOpt = isExpandableHouse && state.floorPlan
      ? FLOOR_PLAN_OPTIONS.find((f) => f.id === state.floorPlan)
      : null;
    const floorPlanPrice = floorPlanOpt ? getItemPriceForModel(floorPlanOpt, state.modelId, config.models) : 0;

    const upgradesTotal =
      getItemPriceForModel(wallOpt, state.modelId, config.models) +
      getItemPriceForModel(intWallOpt, state.modelId, config.models) +
      floorPlanPrice +
      getItemPriceForModel(glassOpt, state.modelId, config.models) +
      getItemPriceForModel(lightOpt, state.modelId, config.models) +
      getItemPriceForModel(elecOpt, state.modelId, config.models) +
      getItemPriceForModel(floorOpt, state.modelId, config.models) +
      getItemPriceForModel(roofOpt, state.modelId, config.models) +
      getItemPriceForModel(cabOpt, state.modelId, config.models) +
      activeAddons.reduce((acc: number, a: any) => acc + getItemPriceForModel(a, state.modelId, config.models), 0);

    const baseCost = currentModel.basePrice + upgradesTotal;
    const markupFactor = 1 + (config.markup / 100);
    return baseCost * markupFactor;
  }, [state, config]);

  const handleSelectModel = (id: HomeModelId) => {
    setState((prev) => {
      if (id === 'expandable-10ft') {
        return {
          ...prev,
          modelId: id,
          floorPlan: '10ft-1bed',
          bedroomLayout: '1-bedroom',
        };
      }
      if (prev.floorPlan === '10ft-1bed') {
        return {
          ...prev,
          modelId: id,
          floorPlan: '2-bed-1-bath',
          bedroomLayout: '2-bedroom',
        };
      }
      return { ...prev, modelId: id };
    });
    setSearchParams((prevParams) => {
      const next = new URLSearchParams(prevParams);
      next.set('model', id);
      return next;
    }, { replace: true });
  };

  const handleCustomizationChange = (
    updater: ((prev: CustomizationState) => CustomizationState) | Partial<CustomizationState>
  ) => {
    setState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      if (next.modelId !== prev.modelId) {
        setTimeout(() => {
          setSearchParams((prevParams) => {
            const params = new URLSearchParams(prevParams);
            params.set('model', next.modelId);
            return params;
          }, { replace: true });
        }, 0);
      }
      return next;
    });
  };

  const handleReset = () => {
    setState(INITIAL_STATE);
    setSearchParams({ model: INITIAL_STATE.modelId }, { replace: true });
    setRoofLiftPercent(0);
    setCutawayMode(false);
    setCurrentPerspective('exterior-iso');
    setLightingMode('daylight');
  };

  const handleSelectCategoryFromPanel = (categoryId: string) => {
    setActiveCategory(categoryId);
    // If the category is an interior feature, automatically switch to appropriate view
    if (categoryId === 'Floor plan' || categoryId === 'Floor Plan') {
      setCurrentPerspective('top-down-floorplan');
      setCutawayMode(true);
      setRoofLiftPercent(0);
      setRoofRemoved(true);
    } else if (categoryId === 'Flooring') {
      setCurrentPerspective('floor-inspection');
      setRoofLiftPercent(75);
      setCutawayMode(false);
      setRoofRemoved(true);
    } else if (['Cabinetry', 'Interior Modules', 'Add-ons', 'Smart Living'].includes(categoryId)) {
      setCurrentPerspective('interior-walkthrough');
      setCutawayMode(true);
    } else if (categoryId === 'Glazing & Windows' || categoryId === 'Doors & Windows') {
      setCurrentPerspective('front-elevation');
      setCutawayMode(false);
    }
  };

  const handleSelectCategoryFromCostPanel = (categoryId: string) => {
    const target = (categoryId === 'Doors & Windows' || categoryId === 'Glazing & Windows')
      ? 'Glazing & Windows'
      : categoryId;
    handleSelectCategoryFromPanel(target);
    if (window.innerWidth < 1024) {
      setMobileTab('customize');
    }
  };

  const handleSelectCategoryFromViewer = (categoryId: string) => {
    setActiveCategory(categoryId);
    // If on mobile, switch to customize tab
    if (window.innerWidth < 1024) {
      setMobileTab('customize');
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#F4F4F7] font-sans select-none">
      {/* Boxabl Top Brand Navigation Bar */}
      <Header
        selectedModelId={state.modelId}
        onSelectModel={handleSelectModel}
        onOpenSpecSheet={() => setShowSpecSheet(true)}
        onReset={handleReset}
        totalPrice={totalPrice}
        showInvestmentBreakdown={showInvestmentBreakdown}
        onToggleInvestmentBreakdown={() => setShowInvestmentBreakdown(!showInvestmentBreakdown)}
        currentUser={currentUser}
        onOpenAuthModal={() => setShowAuthModal(true)}
        timerSecondsRemaining={timerSecondsRemaining}
      />

      {/* Main Workspace Layout - Bento Grid with Configuration Space Mode Bar */}
      <main className="flex-1 p-2 sm:p-3 lg:p-4 flex flex-col gap-2 sm:gap-2.5 overflow-hidden relative">
        {/* Workspace Configuration Bar: Basic Tools (Default) vs Advanced Tools */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-gray-200/90 px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2.5 shadow-2xs shrink-0 z-20">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isAdvancedMode ? 'bg-orange-600 animate-pulse' : 'bg-emerald-500'}`} />
              <span className="text-xs font-black text-gray-950 uppercase tracking-wider whitespace-nowrap">
                {isAdvancedMode ? '⚡ Advanced Studio Mode' : '🎯 Basic Tools Workspace'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md font-bold bg-gray-100 text-gray-700 hidden sm:inline whitespace-nowrap">
                {isAdvancedMode ? 'All Platform Tools Unlocked' : 'Default View (Clean & Streamlined)'}
              </span>
            </div>
            <span className="text-gray-300 hidden lg:inline">·</span>
            <p className="text-xs text-gray-600 truncate hidden lg:block">
              {isAdvancedMode
                ? 'Full access to all 8 architectural suites, 3D cutaways, continuous roof lift slider, 24 SPC swatches, and smart IoT systems.'
                : 'Clean, distraction-free space for rapid configuration. Use "Advanced Tools" anytime for full architectural engineering access.'}
            </p>
          </div>

          {/* Mode Switcher Segmented Control */}
          <div className="flex items-center gap-1.5 ml-auto">
            <div className="inline-flex p-1 bg-gray-100 rounded-xl border border-gray-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setIsAdvancedMode(false)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  !isAdvancedMode
                    ? 'bg-white text-gray-900 shadow-xs ring-1 ring-black/5 font-black'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Default: Clean, uncluttered basic tools"
              >
                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                <span>Basic Tools</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                  Default
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsAdvancedMode(true)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  isAdvancedMode
                    ? 'bg-black text-white shadow-xs font-black'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Unlock all platform tools: 8 catalog perspectives, cutaway slicing, continuous roof elevation, SPC swatches & telemetry"
              >
                <Sliders className="w-3.5 h-3.5 text-orange-400" />
                <span>Advanced Tools</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                  isAdvancedMode ? 'bg-orange-600 text-white' : 'bg-orange-100 text-orange-800'
                }`}>
                  Pro
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Bento Columns Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-3 lg:gap-4 overflow-hidden min-h-0 relative">
          {/* Left Column: Visual Customization Flow */}
          <div
            className={`lg:col-span-4 xl:col-span-3 bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden h-full ${
              mobileTab === 'customize' ? 'flex flex-col z-20' : 'hidden lg:flex flex-col'
            }`}
          >
            <ConfiguratorPanel
              state={state}
              onChange={handleCustomizationChange}
              onSelectModel={handleSelectModel}
              activeCategory={activeCategory}
              onSelectCategory={handleSelectCategoryFromPanel}
              onPerspectiveChange={setCurrentPerspective}
              onCutawayToggle={() => setCutawayMode(!cutawayMode)}
              onRoofLiftChange={setRoofLiftPercent}
              cutawayMode={cutawayMode}
              isAdvancedMode={isAdvancedMode}
              onToggleAdvancedMode={() => setIsAdvancedMode((prev) => !prev)}
            />
          </div>

          {/* Center: High-Performance Interactive 3D Architectural Viewer */}
          <div
            className={`${
              showInvestmentBreakdown
                ? 'lg:col-span-5 xl:col-span-6'
                : 'lg:col-span-8 xl:col-span-9'
            } bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden h-full relative transition-all duration-300 ${
              mobileTab === 'viewer' ? 'block' : 'hidden lg:block'
            }`}
          >
            <ThreeViewer
              state={state}
              onStateChange={handleCustomizationChange}
              lightingMode={lightingMode}
              onLightingModeChange={setLightingMode}
              onSelectCategory={handleSelectCategoryFromViewer}
              roofLiftPercent={roofLiftPercent}
              onRoofLiftChange={setRoofLiftPercent}
              roofRemoved={roofRemoved}
              onRoofRemovedToggle={() => setRoofRemoved((prev) => !prev)}
              cutawayMode={cutawayMode}
              onCutawayModeToggle={() => setCutawayMode(!cutawayMode)}
              currentPerspective={currentPerspective}
              onPerspectiveChange={setCurrentPerspective}
              config={config}
              isAdvancedMode={isAdvancedMode}
              onToggleAdvancedMode={() => setIsAdvancedMode((prev) => !prev)}
            />

            {/* Floating Reveal Button for Investment Breakdown when hidden on Desktop */}
            {!showInvestmentBreakdown && (
              <button
                type="button"
                onClick={() => setShowInvestmentBreakdown(true)}
                className="hidden lg:flex items-center gap-2 absolute top-20 right-4 z-30 px-3.5 py-2.5 rounded-2xl bg-white/95 hover:bg-white text-gray-900 border border-gray-200/90 shadow-md hover:shadow-lg backdrop-blur-md transition-all text-xs font-bold active:scale-95 cursor-pointer group"
                title="Reveal Investment Breakdown"
              >
                <div className="w-2 h-2 rounded-full bg-orange-600 animate-pulse" />
                <span>Investment Breakdown</span>
                <ChevronLeft className="w-4 h-4 text-gray-400 group-hover:text-gray-900 transition-transform group-hover:-translate-x-0.5" />
              </button>
            )}
          </div>

          {/* Right Column: Persistent Dynamic Cost Buildup Panel */}
          <div
            className={`${
              showInvestmentBreakdown
                ? 'lg:col-span-3 xl:col-span-3'
                : 'hidden'
            } bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden h-full transition-all duration-300 ${
              mobileTab === 'cost' ? 'flex flex-col z-20 !flex' : (showInvestmentBreakdown ? 'hidden lg:flex flex-col' : 'hidden')
            }`}
          >
            <CostBuildupPanel
              state={state}
              onStateChange={setState}
              onOpenReserve={() => setShowReserve(true)}
              onOpenSpecSheet={() => setShowSpecSheet(true)}
              onToggleCollapse={() => setShowInvestmentBreakdown(false)}
              isReserved={isProjectReserved}
              onSelectCategory={handleSelectCategoryFromCostPanel}
            />
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden bg-white border-t border-gray-200 flex items-center justify-around p-2 shrink-0 z-30 shadow-xs">
        <button
          onClick={() => setMobileTab('viewer')}
          className={`flex-1 py-2 px-2 rounded-2xl flex flex-col items-center gap-1 text-[11px] font-bold transition-all cursor-pointer ${
            mobileTab === 'viewer'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Box className="w-4 h-4" />
          <span>3D View</span>
        </button>

        <button
          onClick={() => setMobileTab('customize')}
          className={`flex-1 py-2 px-2 rounded-2xl flex flex-col items-center gap-1 text-[11px] font-bold transition-all cursor-pointer ${
            mobileTab === 'customize'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Customize</span>
        </button>

        <button
          onClick={() => setMobileTab('cost')}
          className={`flex-1 py-2 px-2 rounded-2xl flex flex-col items-center gap-1 text-[11px] font-bold transition-all cursor-pointer ${
            mobileTab === 'cost'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Cost Buildup</span>
        </button>
      </div>

      {/* Technical Spec Sheet Modal */}
      {showSpecSheet && (
        <SpecSheetModal
          state={state}
          onClose={() => setShowSpecSheet(false)}
          totalPrice={totalPrice}
        />
      )}

      {/* Reserve Production Slot Modal */}
      {showReserve && (
        <ReserveModal
          state={state}
          totalPrice={totalPrice}
          onClose={() => setShowReserve(false)}
          onSuccess={(orderId) => {
            setIsProjectReservedState(true);
            sessionStorage.setItem(`reserved_${state.modelId}`, 'true');
            const projectId = searchParams.get('projectId');
            if (projectId) {
              sessionStorage.setItem(`reserved_${projectId}`, 'true');
            }
          }}
        />
      )}

      {/* 4-Minute Inactivity / Auto-Save Registration & Login Popup */}
      <ConfiguratorAuthModal
        isOpen={showAuthModal}
        onClose={handleCloseAuthModal}
        state={state}
        totalPrice={totalPrice}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
