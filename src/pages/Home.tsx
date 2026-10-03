import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppConfig, getActivePublicModelId } from '../context/AppConfigContext';
import { BASE_MODELS } from '../data/models';
import { formatCurrency, TWO_CURRENCIES, normalizeCurrency } from '../utils/currency';
import { syncOrdersCurrency } from '../utils/orderManager';
import { ThreeViewer } from '../components/3d/ThreeViewer';
import { SpecSheetModal } from '../components/SpecSheetModal';
import { CustomizationState, HomeModelId, LightingMode, ViewPerspective } from '../types';
import {
  ArrowRight,
  Box,
  Layers,
  Sparkles,
  Shield,
  Zap,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronRight,
  FileText,
  Sliders,
  Maximize2,
  Lock,
  Sun,
  Sunset,
  Moon,
  Compass,
  LayoutDashboard,
  Hammer,
  Truck,
  RotateCcw,
  Check,
  Building,
  Info
} from 'lucide-react';

const INITIAL_PREVIEW_STATE: CustomizationState = {
  modelId: 'expandable-20ft',
  wallCladding: 'fluoro-white',
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

export default function Home() {
  const navigate = useNavigate();
  const { config, updateConfig, setCurrency } = useAppConfig();

  // 3D Interactive Hero Preview State (Defaulted strictly to an available public model)
  const [previewState, setPreviewState] = useState<CustomizationState>(() => ({
    ...INITIAL_PREVIEW_STATE,
    modelId: (getActivePublicModelId(config.models, config.defaultModelId) as HomeModelId),
  }));
  const [lightingMode, setLightingMode] = useState<LightingMode>('daylight');
  const [cutawayMode, setCutawayMode] = useState<boolean>(false);
  const [roofLiftPercent, setRoofLiftPercent] = useState<number>(0);
  const [roofRemoved, setRoofRemoved] = useState<boolean>(false);
  const [currentPerspective, setCurrentPerspective] = useState<ViewPerspective>('exterior-iso');

  // Spec Sheet Modal from Homepage
  const [specModalModelId, setSpecModalModelId] = useState<HomeModelId | null>(null);

  // Turnkey Estimator Widget State on Homepage
  const [estimatorModelId, setEstimatorModelId] = useState<HomeModelId>(() => 
    (getActivePublicModelId(config.models, config.defaultModelId) as HomeModelId)
  );
  const [estimatorWall, setEstimatorWall] = useState<string>('fluoro-white');
  const [estimatorBath, setEstimatorBath] = useState<boolean>(true);
  const [estimatorKitchen, setEstimatorKitchen] = useState<boolean>(true);
  const [estimatorHvac, setEstimatorHvac] = useState<boolean>(true);
  const [estimatorDeck, setEstimatorDeck] = useState<boolean>(false);

  // Model series filter on homepage
  const [homeModelFilter, setHomeModelFilter] = useState<'all' | 'expandable' | 'apple-cabin' | 'space-capsule' | 'folding'>('all');

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Public available models
  const publicModels = useMemo(() => {
    const list = config.models && config.models.length > 0 ? config.models : BASE_MODELS;
    return list.filter((m: any) => m.isAvailable !== false && m.isActive !== false);
  }, [config.models]);

  // Ensure 3D hero showcase preview always reflects a publicly available model
  useEffect(() => {
    if (publicModels.length > 0) {
      const isPublic = publicModels.some((m: any) => m.id === previewState.modelId);
      if (!isPublic) {
        const targetId = getActivePublicModelId(config.models, config.defaultModelId) as HomeModelId;
        setPreviewState((prev) => ({ ...prev, modelId: targetId }));
      }
    }
  }, [publicModels, previewState.modelId, config.models, config.defaultModelId]);

  // Ensure turnkey estimator always reflects a publicly available model
  useEffect(() => {
    if (publicModels.length > 0) {
      const isEstimatorPublic = publicModels.some((m: any) => m.id === estimatorModelId);
      if (!isEstimatorPublic) {
        const targetId = getActivePublicModelId(config.models, config.defaultModelId) as HomeModelId;
        setEstimatorModelId(targetId);
      }
    }
  }, [publicModels, estimatorModelId, config.models, config.defaultModelId]);

  // Filtered models for homepage
  const filteredHomeModels = useMemo(() => {
    return publicModels.filter((m: any) => {
      if (homeModelFilter === 'all') return true;
      if (homeModelFilter === 'expandable') return m.series === 'expandable' || m.id.includes('expandable');
      if (homeModelFilter === 'apple-cabin') return m.series === 'apple-cabin' || m.id === 'studio' || m.id === 'one-bedroom' || m.id === 'two-bedroom' || m.id.includes('apple');
      if (homeModelFilter === 'space-capsule') return m.series === 'space-capsule' || m.id.includes('space-capsule');
      if (homeModelFilter === 'folding') return m.series === 'folding' || m.id.includes('folding') || m.id.includes('assembly');
      return true;
    });
  }, [publicModels, homeModelFilter]);

  // Active current model in preview
  const currentPreviewModel = useMemo(() => {
    return (
      publicModels.find((m: any) => m.id === previewState.modelId) ||
      config.models?.find((m: any) => m.id === previewState.modelId) ||
      publicModels[0] ||
      config.models?.[0]
    );
  }, [publicModels, config.models, previewState.modelId]);

  // Turnkey Estimator Calculation
  const estimatorTotal = useMemo(() => {
    const selectedModel =
      publicModels.find((m: any) => m.id === estimatorModelId) ||
      config.models?.find((m: any) => m.id === estimatorModelId) ||
      publicModels[0] ||
      config.models?.[0];
    const base = selectedModel ? selectedModel.basePrice : 54900;
    const wall = config.wallOptions?.find((w: any) => w.id === estimatorWall);
    const wallPrice = wall ? wall.price : 0;
    
    // Addon costs
    const bathPod = config.addons?.find((a: any) => a.id === 'hasLuxuryBathPod')?.price || 7800;
    const kitchenPod = config.addons?.find((a: any) => a.id === 'hasKitchenetteModule')?.price || 6200;
    const hvac = config.addons?.find((a: any) => a.id === 'hasHvacMiniSplit')?.price || 2400;
    const deck = config.addons?.find((a: any) => a.id === 'hasExteriorPergolaDeck')?.price || 3800;

    let total = base + wallPrice;
    if (estimatorBath) total += bathPod;
    if (estimatorKitchen) total += kitchenPod;
    if (estimatorHvac) total += hvac;
    if (estimatorDeck) total += deck;

    // Apply dashboard markup if set
    if (config.markup) {
      total = Math.round(total * (1 + config.markup / 100));
    }

    return total;
  }, [config, estimatorModelId, estimatorWall, estimatorBath, estimatorKitchen, estimatorHvac, estimatorDeck]);

  const faqs = [
    {
      q: 'What site foundations are required for the modular units?',
      a: 'Boxabl modular units are built on a rigid structural steel chassis that can be supported by concrete pier blocks, continuous perimeter stem walls, full concrete slabs, or helical ground screws. Because the chassis is self-supporting, foundation prep is typically 60% faster than traditional wood framing.'
    },
    {
      q: 'How does the factory delivery and site crane placement work?',
      a: 'Units arrive 99% factory-finished on flatbed transport trailers. A standard 40-to-80 ton mobile crane hoists the unit directly onto your prepared foundation in 15–30 minutes. The structural lifting lugs are engineered into the steel corners for rapid unhooking.'
    },
    {
      q: 'How do the plumbing, electrical, and HVAC connections hook up?',
      a: 'Every module features an exterior recessed utility nexus plate. Factory cam-lock quick connectors allow rapid connection to 3-inch or 4-inch sanitary sewer/septic lines, 3/4-inch municipal or well water, and pre-wired 100A or 200A electrical service panels within hours of placement.'
    },
    {
      q: 'Can I export a detailed line drawing and work order to give directly to my builder?',
      a: 'Yes! The 3D Configurator includes a comprehensive Spec Sheet and Work Order generator with high-resolution orthogonal line drawings, millimeter dimensions, electrical schedules, and bill of materials. You can download and print this PDF immediately to begin site prep and permitting.'
    },
    {
      q: 'What is the manufacturing lead time and can models be expanded or connected?',
      a: 'Current factory queue lead times range between 3 to 8 weeks depending on the selected footprint (Studio, 1-Bedroom, or 2-Bedroom). Units are designed with interlocking chassis joinery, allowing future multi-module coupling or stacking.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-900 font-sans selection:bg-orange-500 selection:text-white">
      {/* 1. TOP GLOBAL NAVIGATION BAR */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-4">
          {/* Logo & Identity */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-white text-base tracking-tighter shadow-xs transition-transform group-hover:scale-105"
              style={{ backgroundColor: config.branding?.primaryColor || '#000000' }}
            >
              {config.branding?.brandName ? config.branding.brandName.charAt(0).toUpperCase() : 'B'}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-gray-950">
                {config.branding?.brandName || 'Boxabl'}
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                Modular
              </span>
            </div>
          </Link>

          {/* Center Navigation Links - Clean, focused, and professional */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-gray-500">
            <a href="#models" className="hover:text-gray-950 transition-colors">
              Models
            </a>
            <a href="#engineering" className="hover:text-gray-950 transition-colors">
              Engineering
            </a>
            <a href="#estimator" className="hover:text-gray-950 transition-colors">
              Pricing
            </a>
          </nav>

          {/* Right Action Cluster: Aligned with matching heights and clean dividers */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Currency Switcher */}
            <div className="inline-flex h-9 p-0.5 bg-gray-100 rounded-lg border border-gray-200/80 items-center">
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
                    className={`h-full px-2 sm:px-2.5 text-[11px] font-extrabold rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                      isActive
                        ? curr.code === 'GHS'
                          ? 'bg-orange-600 text-white shadow-xs'
                          : 'bg-black text-white shadow-xs'
                        : 'text-gray-500 hover:text-gray-950'
                    }`}
                    title={`Switch currency across entire website: ${curr.name} (${curr.symbol})`}
                  >
                    <span className="font-mono text-[10px]">{curr.symbol}</span>
                    <span>{curr.code}</span>
                  </button>
                );
              })}
            </div>

            {/* Subtle Divider */}
            <div className="hidden sm:block h-5 w-px bg-gray-200" />

            {/* Admin Link */}
            <Link
              to="/dashboard"
              className="h-9 px-2.5 text-gray-500 hover:text-gray-950 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold"
              title="Admin Orders & Factory Pipeline"
            >
              <LayoutDashboard className="w-4 h-4 text-orange-600" />
              <span className="hidden lg:inline">Admin</span>
            </Link>

            {/* Launch Configurator Primary CTA */}
            <Link
              to="/configurator"
              className="h-9 sm:h-10 px-3.5 sm:px-5 rounded-lg text-xs font-extrabold text-white bg-black hover:bg-neutral-800 transition-all shadow-xs hover:shadow active:scale-95 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider whitespace-nowrap"
            >
              <Box className="w-3.5 h-3.5 text-orange-400" />
              <span>3D Configurator</span>
              <ArrowRight className="w-3.5 h-3.5 hidden sm:inline" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-gray-200 bg-white">
        {/* Subtle Architectural Grid Background */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#000 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Architectural Value Proposition */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/80 text-orange-800 text-xs font-extrabold tracking-wide uppercase">
                <span className="w-2 h-2 rounded-full bg-orange-600 animate-pulse" />
                <span>Next-Gen Prefab Modular Architecture</span>
              </div>

              <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black text-gray-950 tracking-tight leading-[1.08]">
                Precision Modular Homes.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600">
                  Engineered in 3D.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-xl">
                Experience factory-finished prefabricated architecture built on high-tensile galvanized steel chassis.
                Customize wall cladding, panoramic glazing, interior bath and kitchen pods in real-time 3D, and generate instant manufacturing work orders.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Link
                  to="/configurator"
                  className="inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-full text-base font-extrabold text-white bg-black hover:bg-neutral-800 transition-all shadow-xl hover:shadow-orange-500/10 active:scale-95 cursor-pointer uppercase tracking-wider text-center"
                >
                  <Box className="w-5 h-5 text-orange-400" />
                  <span>Enter 3D Configurator</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <a
                  href="#models"
                  className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full text-sm font-bold text-gray-800 bg-gray-100 hover:bg-gray-200 transition-colors border border-gray-200"
                >
                  <span>Explore Model Lineup</span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </a>
              </div>

              {/* Key Architectural Metric Badges */}
              <div className="grid grid-cols-3 gap-3 pt-6 border-t border-gray-100">
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200/80">
                  <div className="text-xl sm:text-2xl font-black text-gray-950 font-mono">154-620</div>
                  <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mt-0.5">
                    Sq Ft Footprints
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200/80">
                  <div className="text-xl sm:text-2xl font-black text-gray-950 font-mono">3-6 Wks</div>
                  <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mt-0.5">
                    Factory Delivery
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200/80">
                  <div className="text-xl sm:text-2xl font-black text-orange-600 font-mono">100%</div>
                  <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mt-0.5">
                    Plug &amp; Play Utilities
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive 3D Showcase Card */}
            <div id="preview" className="lg:col-span-6">
              <div className="bg-white rounded-3xl border border-gray-200/90 shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ring-1 ring-black/5 hover:shadow-orange-500/10">
                {/* Showcase Top Bar: Model Selector Pills & Public Status */}
                <div className="p-3 sm:p-4 bg-gray-950 text-white flex items-center justify-between gap-2 border-b border-gray-800">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-black uppercase tracking-wider text-gray-100 flex items-center gap-1.5">
                      <span>3D Live Model</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold text-emerald-400 normal-case hidden sm:inline-flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-400" />
                        Publicly Available
                      </span>
                    </span>
                  </div>

                  {/* Model Switcher Pills (Strictly Public Models) */}
                  <div className="flex items-center gap-1.5 overflow-x-auto max-w-[240px] sm:max-w-[340px] p-1 bg-gray-900 rounded-full border border-gray-800 scrollbar-none">
                    {publicModels.slice(0, 6).map((model: any) => {
                      const isSelected = model.id === previewState.modelId;
                      return (
                        <button
                          key={model.id}
                          type="button"
                          onClick={() => setPreviewState((prev) => ({ ...prev, modelId: model.id }))}
                          className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-orange-600 text-white shadow-xs'
                              : 'text-gray-400 hover:text-white hover:bg-gray-800/80'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>{model.name.replace('Double-Wing ', '').slice(0, 18)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3D Canvas Container */}
                <div className="relative h-[400px] sm:h-[460px] bg-slate-950 overflow-hidden group">
                  <ThreeViewer
                    state={previewState}
                    lightingMode={lightingMode}
                    onLightingModeChange={setLightingMode}
                    onSelectCategory={() => {}}
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

                  {/* Subtle Studio Vignette Overlay */}
                  <div className="pointer-events-none absolute inset-0 bg-radial from-transparent via-transparent to-black/25 z-10" />

                  {/* Overlaid Lighting & Mode Quick Controls */}
                  <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-black/70 backdrop-blur-md p-1 rounded-xl border border-white/10 text-white shadow-lg">
                    <button
                      type="button"
                      onClick={() => setLightingMode('daylight')}
                      className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                        lightingMode === 'daylight' ? 'bg-orange-600 text-white' : 'text-gray-300 hover:text-white'
                      }`}
                      title="Daylight illumination"
                    >
                      <Sun className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline text-[10px]">Day</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLightingMode('sunset')}
                      className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                        lightingMode === 'sunset' ? 'bg-orange-600 text-white' : 'text-gray-300 hover:text-white'
                      }`}
                      title="Sunset golden hour"
                    >
                      <Sunset className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline text-[10px]">Sunset</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLightingMode('night')}
                      className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                        lightingMode === 'night' ? 'bg-orange-600 text-white' : 'text-gray-300 hover:text-white'
                      }`}
                      title="Architectural night lighting"
                    >
                      <Moon className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline text-[10px]">Night</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCutawayMode(!cutawayMode)}
                      className={`ml-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer ${
                        cutawayMode ? 'bg-amber-500 text-black shadow-xs' : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                      title="Toggle interior cutaway"
                    >
                      <Layers className="w-3 h-3" />
                      <span>{cutawayMode ? 'Interior' : 'Exterior'}</span>
                    </button>
                  </div>

                  {/* Overlaid Interactive Hint */}
                  <div className="absolute bottom-4 left-4 z-20 pointer-events-none bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-[11px] text-gray-200 flex items-center gap-2 shadow-sm">
                    <Compass className="w-3.5 h-3.5 text-orange-400" />
                    <span>Click &amp; drag to orbit 360° · Scroll to zoom</span>
                  </div>
                </div>

                {/* Showcase Bottom Bar: Model specs & direct Launch CTA */}
                <div className="p-4 sm:p-5 bg-white border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-gray-950 text-base">
                        {currentPreviewModel?.name}
                      </h3>
                      <span className="text-xs font-mono font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
                        {currentPreviewModel?.sqft} sq ft
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">
                      {currentPreviewModel?.dimensions?.metricStr || '6,400mm × 5,900mm × 2,500mm'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold text-gray-400">
                        Base Starting At
                      </div>
                      <div className="text-lg font-black text-gray-950 font-mono">
                        {formatCurrency(currentPreviewModel?.basePrice || 22800, config.currency)}
                      </div>
                    </div>

                    <Link
                      to={`/configurator?model=${previewState.modelId}`}
                      className="px-4 py-2.5 rounded-xl text-xs font-extrabold text-white bg-orange-600 hover:bg-orange-700 transition-all shadow-md active:scale-95 flex items-center gap-1.5 whitespace-nowrap cursor-pointer uppercase tracking-wider"
                    >
                      <span>Customize in 3D</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ARCHITECTURAL MODEL LINEUP SECTION */}
      <section id="models" className="py-20 bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-200 text-gray-800 text-xs font-bold uppercase tracking-wider">
              <span>Modular Catalog · 4 Distinct Modular Series</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-950 tracking-tight">
              Engineered Modular Architectural Lineup
            </h2>
            <p className="text-base text-gray-600">
              Explore precision expandable houses, iconic rounded apple cabins, futuristic space capsules, and fast-folding containers built on Q235 galvanized steel.
            </p>

            {/* Model Series Filter Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
              {[
                { id: 'all', label: 'All Houses' },
                { id: 'expandable', label: 'Expandable Houses' },
                { id: 'apple-cabin', label: 'Apple Cabins' },
                { id: 'space-capsule', label: 'Space Capsules' },
                { id: 'folding', label: 'Folding Containers' },
              ].map((filter) => {
                const isSelected = homeModelFilter === filter.id;
                return (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setHomeModelFilter(filter.id as any)}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-black text-white shadow-sm ring-2 ring-black/10'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Model Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredHomeModels.map((model: any) => {
              return (
                <div
                  key={model.id}
                  className="bg-white rounded-3xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                >
                  <div className="p-6 sm:p-7 space-y-5">
                    {/* Model Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono uppercase font-black tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">
                          {model.leadTime || '3-4 Weeks'} Lead
                        </span>
                        <h3 className="text-xl font-black text-gray-950 tracking-tight mt-2">
                          {model.name}
                        </h3>
                        <p className="text-xs font-semibold text-gray-500 mt-0.5">
                          {model.tagline}
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-black text-gray-950 font-mono">
                          {model.sqft}
                        </div>
                        <div className="text-[10px] uppercase font-bold text-gray-400">
                          Square Feet
                        </div>
                      </div>
                    </div>

                    {/* Dimensions & Specifications */}
                    <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 font-medium">Dimensions:</span>
                        <span className="font-mono font-bold text-gray-900">
                          {model.dimensions?.lengthFt}′ × {model.dimensions?.widthFt}′ × {model.dimensions?.heightFt}′
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 font-medium">Metric Footprint:</span>
                        <span className="font-mono text-gray-700 text-[11px]">
                          {model.dimensions?.metricStr}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 font-medium">Bedrooms / Baths:</span>
                        <span className="font-bold text-gray-900">
                          {model.bedrooms} Bed · {model.bathrooms} Bath
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {model.description}
                    </p>

                    {/* Included Features Bullet Points */}
                    <div className="space-y-2 pt-2 border-t border-gray-100">
                      <div className="text-[10px] uppercase font-extrabold tracking-wider text-gray-400">
                        Included Standard Engineering:
                      </div>
                      {model.includedFeatures?.slice(0, 4).map((feat: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-gray-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card Footer: Price & Direct Actions */}
                  <div className="p-6 bg-gray-50/80 border-t border-gray-100 flex flex-col gap-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-semibold text-gray-500">Base Investment:</span>
                      <span className="text-2xl font-black text-gray-950 font-mono">
                        {formatCurrency(model.basePrice, config.currency)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setSpecModalModelId(model.id)}
                        className="w-full py-2.5 px-3 rounded-xl border border-gray-300 bg-white text-xs font-bold text-gray-700 hover:bg-gray-100 hover:text-gray-950 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-gray-400" />
                        <span>Specs &amp; PDF</span>
                      </button>

                      <Link
                        to={`/configurator?model=${model.id}`}
                        className="w-full py-2.5 px-3 rounded-xl bg-black text-white text-xs font-extrabold hover:bg-neutral-800 transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                      >
                        <span>Configure 3D</span>
                        <ChevronRight className="w-3.5 h-3.5 text-orange-400" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. CONFIGURATOR CAPABILITIES & CUSTOMIZATION WALKTHROUGH */}
      <section id="features" className="py-20 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-800 text-xs font-extrabold tracking-wide uppercase">
                <Sliders className="w-3.5 h-3.5 text-orange-600" />
                <span>Infinite Modular Configurations</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-gray-950 tracking-tight">
                Inspect, Personalize, and Calculate in Real Time
              </h2>

              <p className="text-base text-gray-600 leading-relaxed">
                Our proprietary 3D browser configurator gives homeowners, architects, and developers immediate control over every finish, fixture, and mechanical system with zero guesswork.
              </p>

              {/* Feature Points */}
              <div className="space-y-4">
                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-gray-900">
                      Exterior Wall Cladding &amp; Curtain Glazing
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Switch between Fluorocarbon White, Obsidian Matte, Anodized Titanium, and Nordic Slate with double Low-E acoustic glass.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Box className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-gray-900">
                      Factory Finished Bath &amp; Galley Kitchen Pods
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Toggle pre-plumbed sanitary pods, rainfall showers, quartz countertops, induction cooktops, and integrated bed suites.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-gray-900">
                      Instant Millimeter Work Orders &amp; PDF Blueprints
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Export engineering line drawings, orthogonal dimensions, and line-item cost buildup documents ready for municipal permits.
                    </p>
                  </div>
                </div>
              </div>

              {/* Direct Jump to Configurator */}
              <div className="pt-2">
                <Link
                  to="/configurator"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-extrabold text-white bg-black hover:bg-neutral-800 transition-all shadow-md active:scale-95 cursor-pointer uppercase tracking-wider"
                >
                  <span>Open Configurator Experience</span>
                  <ArrowRight className="w-4 h-4 text-orange-400" />
                </Link>
              </div>
            </div>

            {/* Right Visual Bento Grid */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 bg-[#0f172a] text-white rounded-3xl border border-slate-800 flex flex-col justify-between h-64">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-orange-400 font-bold">
                    360° Real-time Orbit
                  </span>
                  <Compass className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <h4 className="text-xl font-black tracking-tight">
                    Cinematic Orbit Controls
                  </h4>
                  <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                    Rotate, zoom, and inspect from exterior isometric, front elevation, or top-down floorplan perspectives.
                  </p>
                </div>
                <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Hardware-accelerated WebGL</span>
                </div>
              </div>

              <div className="p-6 bg-orange-600 text-white rounded-3xl flex flex-col justify-between h-64">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-orange-200 font-bold">
                    Dynamic Lighting
                  </span>
                  <Sun className="w-5 h-5 text-orange-200" />
                </div>
                <div>
                  <h4 className="text-xl font-black tracking-tight">
                    Day, Sunset &amp; Night
                  </h4>
                  <p className="text-xs text-orange-100 mt-2 leading-relaxed">
                    Test exterior warmth and interior recessed LED channels under realistic sunlight, dusk, and night scenarios.
                  </p>
                </div>
                <div className="text-[11px] font-mono text-white/90">
                  <span>Realistic Lux calculations</span>
                </div>
              </div>

              <div className="p-6 bg-gray-100 text-gray-950 rounded-3xl border border-gray-200 flex flex-col justify-between h-64">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 font-bold">
                    Cutaway Visualization
                  </span>
                  <Layers className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <h4 className="text-xl font-black tracking-tight">
                    Exploded Roof Mode
                  </h4>
                  <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                    Lift the roof structure with one click to inspect bedroom partitions, shower glass, and cabinetry layout.
                  </p>
                </div>
                <div className="text-[11px] font-mono text-gray-500">
                  <span>Smooth animated displacement</span>
                </div>
              </div>

              <div className="p-6 bg-black text-white rounded-3xl flex flex-col justify-between h-64">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-orange-400 font-bold">
                    Live Cost Buildup
                  </span>
                  <Zap className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h4 className="text-xl font-black tracking-tight">
                    Transparent Pricing
                  </h4>
                  <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                    Instant subtotal updates in USD and GHS as you toggle upgrades, freight, and turnkey installation modules.
                  </p>
                </div>
                <div className="text-[11px] font-mono text-orange-300">
                  <span>Zero hidden manufacturing fees</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. ENGINEERING & MANUFACTURING SUPERIORITY */}
      <section id="engineering" className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-800 text-orange-400 text-xs font-bold uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" />
              <span>Structural Integrity &amp; Durability</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Built to Outperform Conventional Construction
            </h2>
            <p className="text-base text-gray-400">
              Manufactured indoors in aerospace-grade factory environments under strict quality control tolerances down to 1.5mm.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-gray-800/80 rounded-3xl border border-gray-700/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-orange-600/20 text-orange-400 flex items-center justify-center font-bold">
                01
              </div>
              <h3 className="font-extrabold text-base text-white">
                Galvanized Steel Chassis
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Q235 hot-dipped galvanized chassis resists rot, termites, fire, and structural warping. Rated for Seismic Zone 4 and 150mph winds.
              </p>
            </div>

            <div className="p-6 bg-gray-800/80 rounded-3xl border border-gray-700/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-orange-600/20 text-orange-400 flex items-center justify-center font-bold">
                02
              </div>
              <h3 className="font-extrabold text-base text-white">
                R-30 Thermal Envelope
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Continuous high-density eco-friendly Rockwool insulation combined with broken-bridge framing completely eliminates thermal bridging.
              </p>
            </div>

            <div className="p-6 bg-gray-800/80 rounded-3xl border border-gray-700/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-orange-600/20 text-orange-400 flex items-center justify-center font-bold">
                03
              </div>
              <h3 className="font-extrabold text-base text-white">
                Plug-and-Play Nexus
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Pre-installed 100A or 200A load center with quick-latch PEX manifolds and sanitary cleanouts ready to connect in under 2 hours.
              </p>
            </div>

            <div className="p-6 bg-gray-800/80 rounded-3xl border border-gray-700/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-orange-600/20 text-orange-400 flex items-center justify-center font-bold">
                04
              </div>
              <h3 className="font-extrabold text-base text-white">
                Rapid Crane Placement
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Integrated top crane rigging eyes allow flatbed-to-foundation transfer in 20 minutes, cutting site disruption by over 90%.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. HOW IT WORKS / JOURNEY */}
      <section id="how-it-works" className="py-20 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-bold uppercase tracking-wider">
              <span>Streamlined 4-Step Process</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-950 tracking-tight">
              From Browser 3D to Turn-Key Living
            </h2>
            <p className="text-base text-gray-600">
              We replaced months of architectural back-and-forth with an automated, transparent digital pipeline.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="p-6 rounded-3xl bg-gray-50 border border-gray-200 space-y-3 relative">
              <div className="text-3xl font-black text-orange-600 font-mono">01</div>
              <h3 className="font-extrabold text-gray-950 text-base">Select Your Footprint</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Choose between the 154 sqft Studio, 380 sqft 1-Bedroom, or 620 sqft 2-Bedroom based on your site and space requirements.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-gray-50 border border-gray-200 space-y-3 relative">
              <div className="text-3xl font-black text-orange-600 font-mono">02</div>
              <h3 className="font-extrabold text-gray-950 text-base">Customize in 3D</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Select exterior cladding, glazing tints, SPC flooring, luxury bath pods, induction kitchenette, and climate packs.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-gray-50 border border-gray-200 space-y-3 relative">
              <div className="text-3xl font-black text-orange-600 font-mono">03</div>
              <h3 className="font-extrabold text-gray-950 text-base">Download Work Order PDF</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Generate the technical blueprint with line drawings, precise millimeter dimensions, and cost schedule for your builder.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-gray-50 border border-gray-200 space-y-3 relative">
              <div className="text-3xl font-black text-orange-600 font-mono">04</div>
              <h3 className="font-extrabold text-gray-950 text-base">Factory Delivery &amp; Setup</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Your modular unit is built, shipped on a flatbed trailer, craned onto your foundation, and ready for occupancy in days.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. INTERACTIVE TURNKEY COST ESTIMATOR */}
      <section id="estimator" className="py-20 bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
            <div className="p-6 sm:p-8 bg-gray-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-orange-400 font-bold">
                  Interactive Turnkey Estimator
                </span>
                <h3 className="text-2xl font-black tracking-tight mt-1 text-white">
                  Quick Estimate Before Launching 3D
                </h3>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-gray-400">Estimated Total</div>
                <div className="text-2xl sm:text-3xl font-black text-orange-400 font-mono">
                  {formatCurrency(estimatorTotal, config.currency)}
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              {/* Step 1: Select Model */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  1. Choose Architectural Footprint
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {config.models?.map((model: any) => {
                    const isSelected = model.id === estimatorModelId;
                    return (
                      <button
                        key={model.id}
                        type="button"
                        onClick={() => setEstimatorModelId(model.id)}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-orange-600 bg-orange-50/50 ring-2 ring-orange-500/20'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="text-xs font-extrabold text-gray-900">{model.name}</div>
                        <div className="text-[11px] text-gray-500 mt-0.5">{model.sqft} sq ft</div>
                        <div className="text-xs font-mono font-bold text-gray-950 mt-2">
                          {formatCurrency(model.basePrice, config.currency)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Cladding Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  2. Exterior Wall Cladding
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {config.wallOptions?.slice(0, 4).map((wall: any) => {
                    const isSelected = wall.id === estimatorWall;
                    return (
                      <button
                        key={wall.id}
                        type="button"
                        onClick={() => setEstimatorWall(wall.id)}
                        className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2 cursor-pointer ${
                          isSelected
                            ? 'border-black bg-gray-50 ring-1 ring-black'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-gray-300 shrink-0"
                          style={{ backgroundColor: wall.color }}
                        />
                        <div className="truncate">
                          <div className="text-xs font-bold text-gray-900 truncate">{wall.name}</div>
                          <div className="text-[10px] font-mono text-gray-500">
                            {wall.price > 0 ? `+${formatCurrency(wall.price, config.currency)}` : 'Included'}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Turnkey Modules */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  3. Select Factory Interior &amp; Climate Modules
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center justify-between p-3.5 rounded-2xl border border-gray-200 hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={estimatorBath}
                        onChange={(e) => setEstimatorBath(e.target.checked)}
                        className="w-4 h-4 accent-orange-600 rounded"
                      />
                      <div>
                        <div className="text-xs font-bold text-gray-900">Luxury Pre-Plumbed Bath Pod</div>
                        <div className="text-[11px] text-gray-500">Rainfall shower, smart vanity &amp; toilet</div>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-gray-700">
                      +{formatCurrency(7800, config.currency)}
                    </span>
                  </label>

                  <label className="flex items-center justify-between p-3.5 rounded-2xl border border-gray-200 hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={estimatorKitchen}
                        onChange={(e) => setEstimatorKitchen(e.target.checked)}
                        className="w-4 h-4 accent-orange-600 rounded"
                      />
                      <div>
                        <div className="text-xs font-bold text-gray-900">Modular Galley Kitchenette</div>
                        <div className="text-[11px] text-gray-500">Quartz sink, cooktop &amp; soft-close cabinetry</div>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-gray-700">
                      +{formatCurrency(6200, config.currency)}
                    </span>
                  </label>

                  <label className="flex items-center justify-between p-3.5 rounded-2xl border border-gray-200 hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={estimatorHvac}
                        onChange={(e) => setEstimatorHvac(e.target.checked)}
                        className="w-4 h-4 accent-orange-600 rounded"
                      />
                      <div>
                        <div className="text-xs font-bold text-gray-900">Inverter Mini-Split HVAC Pack</div>
                        <div className="text-[11px] text-gray-500">Dual heating &amp; cooling 12,000 BTU</div>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-gray-700">
                      +{formatCurrency(2400, config.currency)}
                    </span>
                  </label>

                  <label className="flex items-center justify-between p-3.5 rounded-2xl border border-gray-200 hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={estimatorDeck}
                        onChange={(e) => setEstimatorDeck(e.target.checked)}
                        className="w-4 h-4 accent-orange-600 rounded"
                      />
                      <div>
                        <div className="text-xs font-bold text-gray-900">Exterior Aluminum Pergola &amp; Deck</div>
                        <div className="text-[11px] text-gray-500">Composite decking with overhead louvers</div>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-gray-700">
                      +{formatCurrency(3800, config.currency)}
                    </span>
                  </label>
                </div>
              </div>

              {/* Bottom Launch Button */}
              <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-gray-500 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-gray-400" />
                  <span>Ready to fine-tune in full 3D with millimeter camera control?</span>
                </div>

                <Link
                  to={`/configurator?model=${estimatorModelId}`}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-full text-xs sm:text-sm font-extrabold text-white bg-black hover:bg-neutral-800 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer"
                >
                  <Box className="w-4 h-4 text-orange-400" />
                  <span>Transfer Choices into 3D Configurator</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FREQUENTLY ASKED QUESTIONS */}
      <section id="faq" className="py-20 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-bold uppercase tracking-wider">
              <span>Got Questions?</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-950 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-base text-gray-600">
              Everything you need to know about engineering, permits, and ordering your modular home.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="border border-gray-200 rounded-2xl overflow-hidden bg-white transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <span className="font-extrabold text-sm sm:text-base text-gray-900">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${
                        isOpen ? 'rotate-180 text-orange-600' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. BOTTOM CONVERSION CALL TO ACTION BANNER */}
      <section className="py-20 bg-neutral-950 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-orange-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Start Building Today</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Ready to Step Inside Your Future Modular Home?
          </h2>

          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto">
            Open the 3D Configurator right now. Inspect every room, customize materials, simulate lighting, and generate factory-ready blueprints with zero obligation.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/configurator"
              className="w-full sm:w-auto px-8 py-4 rounded-full text-base font-extrabold text-white bg-orange-600 hover:bg-orange-700 transition-all shadow-xl hover:shadow-orange-600/20 active:scale-95 flex items-center justify-center gap-2.5 uppercase tracking-wider cursor-pointer"
            >
              <Box className="w-5 h-5" />
              <span>Launch 3D Configurator</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <a
              href={`mailto:${config.branding?.supportEmail || 'support@boxabl.com'}`}
              className="w-full sm:w-auto px-6 py-4 rounded-full text-sm font-bold text-gray-300 bg-white/5 hover:bg-white/10 transition-colors border border-white/10 text-center"
            >
              Contact Engineering Team
            </a>
          </div>
        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="bg-white border-t border-gray-200 py-12 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-sm"
              style={{ backgroundColor: config.branding?.primaryColor || '#000000' }}
            >
              {config.branding?.brandName ? config.branding.brandName.charAt(0).toUpperCase() : 'B'}
            </div>
            <div>
              <span className="font-bold text-gray-900 text-sm">
                {config.branding?.brandName || 'Boxabl'}
              </span>
              <span className="text-[11px] text-gray-400 ml-2">
                © {new Date().getFullYear()} Modular Homes Inc. All rights reserved.
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 font-semibold">
            <Link to="/configurator" className="hover:text-gray-900 transition-colors">
              3D Configurator
            </Link>
            <a href="#models" className="hover:text-gray-900 transition-colors">
              Models
            </a>
            <a href="#engineering" className="hover:text-gray-900 transition-colors">
              Engineering Specs
            </a>
            <Link to="/dashboard" className="text-orange-600 hover:text-orange-700 transition-colors">
              Admin Portal
            </Link>
          </div>
        </div>
      </footer>

      {/* Spec Sheet Modal if triggered from model cards */}
      {specModalModelId && (
        <SpecSheetModal
          state={{ ...INITIAL_PREVIEW_STATE, modelId: specModalModelId }}
          onClose={() => setSpecModalModelId(null)}
          totalPrice={
            config.models?.find((m: any) => m.id === specModalModelId)?.basePrice || 54900
          }
        />
      )}
    </div>
  );
}
