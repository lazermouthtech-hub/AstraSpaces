/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useAppConfig } from '../context/AppConfigContext';
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
  modelId: 'studio',
  wallCladding: 'fluoro-white',
  glazing: 'low-e-clear',
  lightingPackage: 'standard-recessed',
  electricalTier: 'standard-100a',
  flooring: 'spc-nordic-oak',
  roofOption: 'standard-parapet',
  cabinetry: 'matte-black',
  hasKitchenetteModule: true,
  hasLuxuryBathPod: true,
  hasHvacMiniSplit: true,
  hasExteriorPergolaDeck: false,
  hasSmartDoorLock: true,
  hasElectricBlinds: false,
};

export default function Configurator() {
  const { config } = useAppConfig();
  
  const [state, setState] = useState<CustomizationState>(INITIAL_STATE);
  const [lightingMode, setLightingMode] = useState<LightingMode>(config.viewerControls?.defaultLighting === 'night' ? 'night' : 'daylight');
  const [roofLiftPercent, setRoofLiftPercent] = useState<number>(0);
  const [cutawayMode, setCutawayMode] = useState<boolean>(config.viewerControls?.defaultCutaway || false);
  const [currentPerspective, setCurrentPerspective] =
    useState<ViewPerspective>('exterior-iso');
  const [activeCategory, setActiveCategory] = useState<string>('Wall Panels');

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
      config.models.find((m: any) => m.id === state.modelId) || config.models[0];
    const wallOpt =
      config.wallOptions.find((o: any) => o.id === state.wallCladding) ||
      config.wallOptions[0];
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

    const upgradesTotal =
      wallOpt.price +
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
  };

  const handleReset = () => {
    setState(INITIAL_STATE);
    setRoofLiftPercent(0);
    setCutawayMode(false);
    setCurrentPerspective('exterior-iso');
    setLightingMode('daylight');
  };

  const handleSelectCategoryFromPanel = (categoryId: string) => {
    setActiveCategory(categoryId);
    // If the category is an interior feature, automatically switch to interior view and cutaway mode
    if (['Cabinetry', 'Interior Modules', 'Flooring'].includes(categoryId)) {
      setCurrentPerspective('interior-walkthrough');
      setCutawayMode(true);
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
            onChange={setState}
            activeCategory={activeCategory}
            onSelectCategory={handleSelectCategoryFromPanel}
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
            lightingMode={lightingMode}
            onLightingModeChange={setLightingMode}
            onSelectCategory={handleSelectCategoryFromViewer}
            roofLiftPercent={roofLiftPercent}
            onRoofLiftChange={setRoofLiftPercent}
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
