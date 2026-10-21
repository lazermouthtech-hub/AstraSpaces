import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppConfig, getActivePublicModelId } from '../context/AppConfigContext';
import { useAuth } from '../context/AuthContext';
import { BASE_MODELS } from '../data/models';
import {
  formatCurrency,
  TWO_CURRENCIES,
  normalizeCurrency,
  getCurrencySymbol,
  getExchangeRate,
} from '../utils/currency';
import { syncOrdersCurrency } from '../utils/orderManager';
import { SpecSheetModal } from '../components/SpecSheetModal';
import { ArchitecturalTrees } from '../components/ArchitecturalTrees';
import { CustomizationState, HomeModelId } from '../types';
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
  ChevronLeft,
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

const DEFAULT_SPEC_STATE: CustomizationState = {
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
  hasLuxuryBedSuite: false,
  hasLivingSofa: false,
  hasHvacMiniSplit: false,
  hasExteriorPergolaDeck: false,
  hasBioDigester: false,
  hasSmartDoorLock: false,
  hasElectricBlinds: false,
  hasWardrobe: false,
  hasTvConsole: false,
};

const HERO_SLIDER_IMAGES = [
  {
    url: 'https://res.cloudinary.com/ddaxljfgp/image/upload/v1791198071/10apples_expandable_model_b7lmst.png',
    alt: '10Apples Expandable Modular House Model - Front Architectural Elevation',
    title: 'Front Elevation',
  },
  {
    url: 'https://res.cloudinary.com/ddaxljfgp/image/upload/v1791199226/10apples_expandable_model_1_bn56hd.png',
    alt: '10Apples Expandable Modular House Model - Expanded Perspective View',
    title: 'Double-Wing Expanded View',
  },
  {
    url: 'https://res.cloudinary.com/ddaxljfgp/image/upload/v1791199659/10apples_expandable_model_2_ln3jfa.png',
    alt: '10Apples Expandable Modular House Model - Expanded Architectural Perspective',
    title: 'Expanded Perspective 2',
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { config, updateConfig, setCurrency } = useAppConfig();
  const { currentUser } = useAuth();

  // Hero Image Slider State
  const [heroSlideIndex, setHeroSlideIndex] = useState<number>(0);
  const [isHeroSliderHovered, setIsHeroSliderHovered] = useState<boolean>(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Auto-advance sliding images every 4.5s (pauses on hover)
  useEffect(() => {
    if (isHeroSliderHovered) return;
    const interval = setInterval(() => {
      setHeroSlideIndex((prev) => (prev + 1) % HERO_SLIDER_IMAGES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isHeroSliderHovered]);

  const handlePrevSlide = () => {
    setHeroSlideIndex((prev) => (prev - 1 + HERO_SLIDER_IMAGES.length) % HERO_SLIDER_IMAGES.length);
  };

  const handleNextSlide = () => {
    setHeroSlideIndex((prev) => (prev + 1) % HERO_SLIDER_IMAGES.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNextSlide();
      } else {
        handlePrevSlide();
      }
    }
    setTouchStartX(null);
  };

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
          <Link to="/" className="flex items-center group shrink-0" title="10Apples">
            <img
              src="https://res.cloudinary.com/ddaxljfgp/image/upload/v1791201844/10apples_logo_main_eqm9wf.png"
              alt="10Apples Logo"
              className="h-9 sm:h-10 w-auto object-contain transition-transform group-hover:scale-105"
            />
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
              {(() => {
                const activeCode = normalizeCurrency(config.currency);
                const items = [
                  { code: 'USD', symbol: '$' },
                  ...(activeCode !== 'USD'
                    ? [{ code: activeCode, symbol: getCurrencySymbol(activeCode) }]
                    : [{ code: 'GHS', symbol: 'GH₵' }]),
                ];
                const uniqueItems = Array.from(new Map(items.map((i) => [i.code, i])).values());

                return uniqueItems.map((curr) => {
                  const isActive = activeCode === curr.code;
                  const rate =
                    curr.code === 'USD'
                      ? 1.0
                      : getExchangeRate(curr.code, config.exchangeRates);

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
                          ? curr.code === 'USD'
                            ? 'bg-black text-white shadow-xs'
                            : 'bg-orange-600 text-white shadow-xs'
                          : 'text-gray-500 hover:text-gray-950'
                      }`}
                      title={
                        curr.code === 'USD'
                          ? 'Master Default: USD ($) · Baseline Rate: 1.0000'
                          : `Switch to ${curr.code} (${curr.symbol}) · Prevailing Rate: 1 USD = ${rate} ${curr.code}`
                      }
                    >
                      <span className="font-mono text-[10px]">{curr.symbol}</span>
                      <span>{curr.code}</span>
                    </button>
                  );
                });
              })()}
            </div>

            {/* Subtle Divider */}
            <div className="hidden sm:block h-5 w-px bg-gray-200" />

            {/* Customer Account / Firebase Login */}
            {currentUser ? (
              <Link
                to="/user-dashboard"
                className="h-9 px-3 bg-orange-50 hover:bg-orange-100 text-orange-950 border border-orange-200 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold"
                title={`Signed in as ${currentUser.fullName}. Open User Dashboard.`}
              >
                <div className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px] font-black">
                  {currentUser.fullName.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline max-w-[100px] truncate">{currentUser.fullName}</span>
                <span className="text-[10px] bg-orange-200/80 text-orange-800 px-1 py-0.2 rounded font-mono font-bold">
                  {currentUser.savedProjects?.length || 0}
                </span>
              </Link>
            ) : (
              <Link
                to="/user-dashboard"
                className="h-9 px-3 text-gray-700 hover:text-gray-950 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold"
                title="Open User Dashboard"
              >
                <span>Dashboard</span>
              </Link>
            )}

            {/* Admin Link */}
            <Link
              to="/dashboard"
              className="h-9 px-2.5 text-gray-500 hover:text-gray-950 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold"
              title="Admin Orders & Factory Pipeline"
            >
              <LayoutDashboard className="w-4 h-4 text-orange-600" />
              <span className="hidden lg:inline">Admin</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-6 pb-16 sm:pt-10 sm:pb-24 border-b border-gray-200 bg-white">
        {/* Subtle Architectural Grid Background */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#000 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Flat Architectural Vector Trees Background Layer */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <ArchitecturalTrees slideIndex={heroSlideIndex} />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* 1. TEXTS & CTAS: POSITIONED ABOVE THE HOUSE */}
          {/* Architectural Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200/80 text-orange-800 text-xs font-extrabold tracking-wide uppercase mx-auto mb-4">
            <span className="w-2 h-2 rounded-full bg-orange-600 animate-pulse" />
            <span>10Apples Modular Architecture · Expandable Series</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-950 tracking-tight leading-[1.08] max-w-4xl mx-auto">
            A Home That Fits Your Life.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600">
              And Your Future.
            </span>
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto mt-4">
            Whether you want to live, host, rent or invest, 10Apples makes it easier to create a beautiful modern space without the complexity of traditional construction.
          </p>

          {/* Value Steps */}
          <p className="text-sm sm:text-base font-bold text-gray-900 tracking-wide mt-3 max-w-2xl mx-auto">
            Choose your home. Customize it. Get your price. Explore flexible ways to own it.
          </p>

          {/* Primary CTA Cluster */}
          <div className="flex items-center justify-center mt-7 mb-8 sm:mb-10">
            {/* Primary CTA button saying Starting at GHC22,800 */}
            <Link
              to="/configurator?model=expandable-20ft"
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full text-base font-black text-white bg-orange-600 hover:bg-orange-700 transition-all shadow-xl hover:shadow-orange-500/25 active:scale-95 cursor-pointer uppercase tracking-wider text-center group"
            >
              <span>Starting at GHC22,800</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* 2. THE HOUSE: SLIDING HERO IMAGES (NO BORDER OR BOX) */}
          <div
            className="relative w-full max-w-4xl mx-auto mb-8 sm:mb-10 select-none group"
            onMouseEnter={() => setIsHeroSliderHovered(true)}
            onMouseLeave={() => setIsHeroSliderHovered(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Sliding Viewport */}
            <div className="relative w-full h-[280px] sm:h-[420px] md:h-[480px] flex items-center justify-center overflow-hidden">
              {HERO_SLIDER_IMAGES.map((img, idx) => {
                const isActive = idx === heroSlideIndex;
                return (
                  <div
                    key={img.url}
                    className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ease-in-out ${
                      isActive
                        ? 'opacity-100 scale-100 translate-x-0 pointer-events-auto'
                        : idx < heroSlideIndex
                        ? 'opacity-0 scale-95 -translate-x-12 pointer-events-none'
                        : 'opacity-0 scale-95 translate-x-12 pointer-events-none'
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={img.alt}
                      className="w-full h-full max-h-[460px] sm:max-h-[500px] object-contain drop-shadow-xl"
                      draggable={false}
                    />
                  </div>
                );
              })}

              {/* Prev / Next Slide Navigation Buttons */}
              <button
                type="button"
                onClick={handlePrevSlide}
                aria-label="Previous slide"
                className="absolute left-1 sm:left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/80 hover:bg-white text-gray-800 hover:text-black shadow-md hover:shadow-lg backdrop-blur-xs flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-105 cursor-pointer z-20"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              <button
                type="button"
                onClick={handleNextSlide}
                aria-label="Next slide"
                className="absolute right-1 sm:right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/80 hover:bg-white text-gray-800 hover:text-black shadow-md hover:shadow-lg backdrop-blur-xs flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-105 cursor-pointer z-20"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Slider Dots / Indicators */}
            <div className="flex items-center justify-center gap-2 mt-3">
              {HERO_SLIDER_IMAGES.map((img, idx) => {
                const isActive = idx === heroSlideIndex;
                return (
                  <button
                    key={img.url}
                    type="button"
                    onClick={() => setHeroSlideIndex(idx)}
                    aria-label={`Go to slide ${idx + 1}: ${img.title}`}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      isActive
                        ? 'w-7 bg-orange-600'
                        : 'w-2 bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Key Architectural Metric Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto mt-10">
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200/80">
              <div className="text-xl sm:text-2xl font-black text-gray-950 font-mono">409 sq ft</div>
              <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mt-0.5">
                Expanded Footprint
              </div>
            </div>
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200/80">
              <div className="text-xl sm:text-2xl font-black text-gray-950 font-mono">3-6 Wks</div>
              <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mt-0.5">
                Factory Delivery
              </div>
            </div>
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200/80">
              <div className="text-xl sm:text-2xl font-black text-orange-600 font-mono">100%</div>
              <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mt-0.5">
                Plug &amp; Play Utilities
              </div>
            </div>
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200/80">
              <div className="text-xl sm:text-2xl font-black text-gray-950 font-mono">Q235</div>
              <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mt-0.5">
                Galvanized Steel
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {publicModels.map((model: any) => {
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
            <Link to="/" className="inline-block" title="10Apples">
              <img
                src="https://res.cloudinary.com/ddaxljfgp/image/upload/v1791201844/10apples_logo_main_eqm9wf.png"
                alt="10Apples Logo"
                className="h-7 sm:h-8 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity"
              />
            </Link>
            <span className="text-[11px] text-gray-400 border-l border-gray-200 pl-3">
              © {new Date().getFullYear()} 10Apples Modular Architecture. All rights reserved.
            </span>
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
          state={{ ...DEFAULT_SPEC_STATE, modelId: specModalModelId }}
          onClose={() => setSpecModalModelId(null)}
          totalPrice={
            config.models?.find((m: any) => m.id === specModalModelId)?.basePrice || 54900
          }
        />
      )}
    </div>
  );
}
