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
import { Header } from '../components/Header';
import { ThreeViewer } from '../components/3d/ThreeViewer';
import { ConfiguratorPanel } from '../components/ConfiguratorPanel';
import { CostBuildupPanel } from '../components/CostBuildupPanel';
import { SpecSheetModal } from '../components/SpecSheetModal';
import { ReserveModal } from '../components/ReserveModal';
import { Sliders, DollarSign, Box } from 'lucide-react';

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
  hasKitchenetteModule: true,
  hasLuxuryBathPod: true,
  hasLuxuryBedSuite: true,
  hasHvacMiniSplit: true,
  hasExteriorPergolaDeck: false,
  hasBioDigester: false,
  hasSmartDoorLock: true,
  hasElectricBlinds: false,
  hasWardrobe: false,
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
    };
  });

  // Sync to query param change when URL searchParams changes externally
  useEffect(() => {
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

    const activeAddons = config.addons.filter((addon: any) => state[addon.id]);

    const isExpandableHouse =
      state.modelId === 'expandable-20ft' ||
      state.modelId === 'expandable-30ft' ||
      state.modelId === 'expandable-40ft' ||
      state.modelId.includes('expandable') ||
      currentModel?.series === 'expandable';
    const floorPlanOpt = isExpandableHouse && state.floorPlan
      ? FLOOR_PLAN_OPTIONS.find((f) => f.id === state.floorPlan)
      : null;
    const floorPlanPrice = floorPlanOpt?.price || 0;

    const upgradesTotal =
      wallOpt.price +
      (intWallOpt?.price || 0) +
      floorPlanPrice +
      glassOpt.price +
      lightOpt.price +
      elecOpt.price +
      floorOpt.price +
      roofOpt.price +
      cabOpt.price +
      activeAddons.reduce((acc: number, a: any) => acc + a.price, 0);

    const baseCost = currentModel.basePrice + upgradesTotal;
    const markupFactor = 1 + (config.markup / 100);
    return baseCost * markupFactor;
  }, [state, config]);

  const handleSelectModel = (id: HomeModelId) => {
    setState((prev) => ({ ...prev, modelId: id }));
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
    } else if (['Cabinetry', 'Interior Modules'].includes(categoryId)) {
      setCurrentPerspective('interior-walkthrough');
      setCutawayMode(true);
    } else if (categoryId === 'Glazing & Windows') {
      setCurrentPerspective('front-elevation');
      setCutawayMode(false);
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
      />

      {/* Main Workspace Layout - Bento Grid */}
      <main className="flex-1 p-2 sm:p-3 lg:p-4 grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-3 lg:gap-4 overflow-hidden relative">
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
          />
        </div>

        {/* Center: High-Performance Interactive 3D Architectural Viewer */}
        <div
          className={`lg:col-span-5 xl:col-span-6 bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden h-full relative ${
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
            onRoofRemovedToggle={() => setRoofRemoved(!roofRemoved)}
            cutawayMode={cutawayMode}
            onCutawayModeToggle={() => setCutawayMode(!cutawayMode)}
            currentPerspective={currentPerspective}
            onPerspectiveChange={setCurrentPerspective}
            config={config}
          />
        </div>

        {/* Right Column: Persistent Dynamic Cost Buildup Panel */}
        <div
          className={`lg:col-span-3 xl:col-span-3 bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden h-full ${
            mobileTab === 'cost' ? 'flex flex-col z-20' : 'hidden lg:flex flex-col'
          }`}
        >
          <CostBuildupPanel
            state={state}
            onStateChange={setState}
            onOpenReserve={() => setShowReserve(true)}
            onOpenSpecSheet={() => setShowSpecSheet(true)}
          />
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
        />
      )}
    </div>
  );
}
