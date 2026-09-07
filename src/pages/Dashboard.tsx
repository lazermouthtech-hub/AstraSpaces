import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppConfig } from '../context/AppConfigContext';
import {
  LogOut,
  Home,
  Palette,
  DollarSign,
  Save,
  Plus,
  Trash2,
  Box,
  Eye,
  Edit3,
  Layers,
  Grid,
  Zap,
  SunMedium,
  Sparkles,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { BASE_MODELS } from '../data/models';
import {
  WALL_CLADDING_OPTIONS,
  GLAZING_OPTIONS,
  LIGHTING_OPTIONS,
  ELECTRICAL_OPTIONS,
  FLOORING_OPTIONS,
  ROOF_OPTIONS,
  CABINETRY_OPTIONS,
  MODULAR_ADDONS,
} from '../data/options';

type DashboardTab =
  | 'models'
  | 'walls'
  | 'glazing'
  | 'lighting'
  | 'flooring'
  | 'cabinetry'
  | 'roof'
  | 'addons'
  | 'pricing'
  | 'branding'
  | 'viewer';

export default function Dashboard() {
  const navigate = useNavigate();
  const { config, updateConfig } = useAppConfig();

  const [activeTab, setActiveTab] = useState<DashboardTab>('walls');
  const [savedToast, setSavedToast] = useState(false);

  // Local state initialized from global config with robust fallbacks
  const [models, setModels] = useState(config.models?.length ? config.models : BASE_MODELS);
  const [wallColors, setWallColors] = useState(config.wallOptions?.length ? config.wallOptions : WALL_CLADDING_OPTIONS);
  const [glazingOptions, setGlazingOptions] = useState(config.glazingOptions?.length ? config.glazingOptions : GLAZING_OPTIONS);
  const [lightingOptions, setLightingOptions] = useState(config.lightingOptions?.length ? config.lightingOptions : LIGHTING_OPTIONS);
  const [electricalOptions, setElectricalOptions] = useState(config.electricalOptions?.length ? config.electricalOptions : ELECTRICAL_OPTIONS);
  const [flooringOptions, setFlooringOptions] = useState(config.flooringOptions?.length ? config.flooringOptions : FLOORING_OPTIONS);
  const [cabinetryOptions, setCabinetryOptions] = useState(config.cabinetryOptions?.length ? config.cabinetryOptions : CABINETRY_OPTIONS);
  const [roofOptions, setRoofOptions] = useState(config.roofOptions?.length ? config.roofOptions : ROOF_OPTIONS);
  const [addons, setAddons] = useState(config.addons?.length ? config.addons : MODULAR_ADDONS);
  const [baseCurrency, setBaseCurrency] = useState(config.currency || 'USD');
  const [markup, setMarkup] = useState(config.markup || 0);
  const [branding, setBranding] = useState(config.branding || {
    brandName: 'Boxabl',
    headerText: 'Build Your Home',
    tagline: '20ft Cabin Series',
    ctaText: 'Reserve Now',
    reservationFee: 250,
    primaryColor: '#000000',
    supportEmail: 'support@boxabl.com',
  });
  const [viewerControls, setViewerControls] = useState(config.viewerControls || {
    defaultLighting: 'day',
    defaultCutaway: false,
  });
  const [logistics, setLogistics] = useState(config.logistics || {
    freightCost: 4500,
    sitePrepCost: 5500,
    taxRate: 0,
  });

  useEffect(() => {
    const auth = localStorage.getItem('isAuthenticated');
    if (auth !== 'true') {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  const handleSave = () => {
    updateConfig({
      ...config,
      models,
      wallOptions: wallColors,
      glazingOptions,
      lightingOptions,
      electricalOptions,
      flooringOptions,
      cabinetryOptions,
      roofOptions,
      addons,
      currency: baseCurrency,
      markup,
      branding,
      viewerControls,
      logistics,
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  const handleResetToFactory = () => {
    if (window.confirm('Reset all configurator features and settings back to factory defaults?')) {
      setModels(BASE_MODELS);
      setWallColors(WALL_CLADDING_OPTIONS);
      setGlazingOptions(GLAZING_OPTIONS);
      setLightingOptions(LIGHTING_OPTIONS);
      setElectricalOptions(ELECTRICAL_OPTIONS);
      setFlooringOptions(FLOORING_OPTIONS);
      setCabinetryOptions(CABINETRY_OPTIONS);
      setRoofOptions(ROOF_OPTIONS);
      setAddons(MODULAR_ADDONS);
      setBaseCurrency('USD');
      setMarkup(0);
      updateConfig({
        models: BASE_MODELS,
        wallOptions: WALL_CLADDING_OPTIONS,
        glazingOptions: GLAZING_OPTIONS,
        lightingOptions: LIGHTING_OPTIONS,
        electricalOptions: ELECTRICAL_OPTIONS,
        flooringOptions: FLOORING_OPTIONS,
        roofOptions: ROOF_OPTIONS,
        cabinetryOptions: CABINETRY_OPTIONS,
        addons: MODULAR_ADDONS,
        currency: 'USD',
        markup: 0,
        branding: {
          brandName: 'Boxabl',
          headerText: 'Build Your Home',
          tagline: '20ft Cabin Series',
          ctaText: 'Reserve Now',
          reservationFee: 250,
          primaryColor: '#000000',
          supportEmail: 'support@boxabl.com',
        },
        viewerControls: {
          defaultLighting: 'day',
          defaultCutaway: false,
        },
        logistics: {
          freightCost: 4500,
          sitePrepCost: 5500,
          taxRate: 0,
        },
      });
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 3000);
    }
  };

  // Add Item Handlers
  const addWallOption = () => {
    const newId = `wall-custom-${Date.now()}`;
    setWallColors([
      ...wallColors,
      {
        id: newId,
        name: 'New Custom Wall Cladding',
        description: 'Custom engineered architectural wall cladding panel with thermal break.',
        price: 1500,
        category: 'Wall Panels',
        color: '#334155',
        badge: 'Custom Swatch',
        specDetail: 'Fluorocarbon coated composite with 50mm thermal break core',
        roughness: 0.35,
        metalness: 0.15,
        clearcoat: 0,
      },
    ]);
  };

  const addGlazingOption = () => {
    const newId = `glazing-custom-${Date.now()}`;
    setGlazingOptions([
      ...glazingOptions,
      {
        id: newId,
        name: 'New Panoramic Glass Spec',
        description: 'Double-layer tempered hollow Low-E glazing with broken bridge frame.',
        price: 1800,
        category: 'Glazing & Windows',
        color: '#93c5fd',
        badge: 'Custom Glass',
        specDetail: 'U-value 1.4 W/m²K, 40dB acoustic cutoff',
      },
    ]);
  };

  const addLightingOption = () => {
    const newId = `lighting-custom-${Date.now()}`;
    setLightingOptions([
      ...lightingOptions,
      {
        id: newId,
        name: 'New Architectural Lighting Suite',
        description: 'Continuous indirect cove lighting and dimmable accent downlights.',
        price: 1200,
        category: 'Lighting System',
        color: '#fef08a',
        badge: 'Architectural Glow',
        specDetail: 'CRI 95+, 24V COB linear LED strips',
      },
    ]);
  };

  const addElectricalOption = () => {
    const newId = `electrical-custom-${Date.now()}`;
    setElectricalOptions([
      ...electricalOptions,
      {
        id: newId,
        name: 'New Electrical Power Tier',
        description: 'Pre-wired distribution panel with high-capacity branch circuits.',
        price: 1600,
        category: 'Electrical & Power',
        badge: 'Included',
        specDetail: 'Square D load center, copper wiring with surge protection',
      },
    ]);
  };

  const addFlooringOption = () => {
    const newId = `floor-custom-${Date.now()}`;
    setFlooringOptions([
      ...flooringOptions,
      {
        id: newId,
        name: 'New Architectural Flooring',
        description: 'Rigid core SPC planks with authentic textured woodgrain and acoustic underlay.',
        price: 950,
        category: 'Flooring',
        color: '#c4b5a0',
        badge: 'Custom Swatch',
        specDetail: '6.5mm total thickness, 20mil wear layer, zero VOC emission',
      },
    ]);
  };

  const addCabinetryOption = () => {
    const newId = `cabinet-custom-${Date.now()}`;
    setCabinetryOptions([
      ...cabinetryOptions,
      {
        id: newId,
        name: 'New Cabinetry Finish',
        description: 'Euro-style soft-close cabinetry with anti-fingerprint durable coating.',
        price: 550,
        category: 'Cabinetry',
        color: '#3b82f6',
        badge: 'Custom Finish',
      },
    ]);
  };

  const addRoofOption = () => {
    const newId = `roof-custom-${Date.now()}`;
    setRoofOptions([
      ...roofOptions,
      {
        id: newId,
        name: 'New Roof & Energy Upgrade',
        description: 'Engineered rooftop assembly with weather membrane and energy harvesting.',
        price: 4200,
        category: 'Roof & Energy',
        badge: 'Clean Energy',
        specDetail: 'Galvanized roof trusses, multi-layer thermal insulation, 120kg/m² load',
      },
    ]);
  };

  const addAddonOption = () => {
    const newId = `addon-${Date.now()}`;
    setAddons([
      ...addons,
      {
        id: newId,
        name: 'New Modular Upgrade Pod',
        description: 'Factory-tested modular unit installed on assembly line prior to delivery.',
        price: 3200,
        category: 'Interior Modules',
        specDetail: 'Pre-plumbed and pre-wired plug & play connection',
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-[#F4F4F7] flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <div className="w-full md:w-72 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-600 animate-pulse" />
              <span className="font-extrabold text-gray-900 tracking-tight text-base">Boxabl Admin OS</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5 font-medium">Modular Home Configuration Suite</p>
          </div>
          <Link
            to="/"
            className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
            title="Return to Configurator"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>

        <div className="p-3 space-y-4 flex-1 overflow-y-auto">
          {/* Group 1: Core Dimensions */}
          <div>
            <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-gray-400">
              Core Architecture
            </div>
            <button
              onClick={() => setActiveTab('models')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'models' ? 'bg-orange-50 text-orange-700 font-bold' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Home className="w-4 h-4 text-gray-400" />
                <span>Properties & Sizes</span>
              </div>
              <span className="text-[10px] font-mono bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                {models.length}
              </span>
            </button>
          </div>

          {/* Group 2: Configurator Panel Features ("This Side") */}
          <div>
            <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-orange-600 flex items-center justify-between">
              <span>Configurator Features</span>
              <span className="text-[9px] bg-orange-100 text-orange-700 px-1 rounded font-bold">This Side</span>
            </div>
            <div className="space-y-0.5 mt-1">
              <button
                onClick={() => setActiveTab('walls')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'walls' ? 'bg-orange-50 text-orange-700 font-bold' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-gray-400" />
                  <span>Wall Panels & Cladding</span>
                </div>
                <span className="text-[10px] font-mono bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                  {wallColors.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('glazing')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'glazing' ? 'bg-orange-50 text-orange-700 font-bold' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Grid className="w-4 h-4 text-gray-400" />
                  <span>Glazing & Windows</span>
                </div>
                <span className="text-[10px] font-mono bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                  {glazingOptions.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('lighting')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'lighting' ? 'bg-orange-50 text-orange-700 font-bold' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Zap className="w-4 h-4 text-gray-400" />
                  <span>Lighting & Electrical</span>
                </div>
                <span className="text-[10px] font-mono bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                  {lightingOptions.length + electricalOptions.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('flooring')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'flooring' ? 'bg-orange-50 text-orange-700 font-bold' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Palette className="w-4 h-4 text-gray-400" />
                  <span>Flooring & Finishes</span>
                </div>
                <span className="text-[10px] font-mono bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                  {flooringOptions.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('cabinetry')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'cabinetry' ? 'bg-orange-50 text-orange-700 font-bold' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Box className="w-4 h-4 text-gray-400" />
                  <span>Kitchen Cabinetry</span>
                </div>
                <span className="text-[10px] font-mono bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                  {cabinetryOptions.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('roof')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'roof' ? 'bg-orange-50 text-orange-700 font-bold' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <SunMedium className="w-4 h-4 text-gray-400" />
                  <span>Roof & Solar Energy</span>
                </div>
                <span className="text-[10px] font-mono bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                  {roofOptions.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('addons')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'addons' ? 'bg-orange-50 text-orange-700 font-bold' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-gray-400" />
                  <span>Modular Pods & Add-ons</span>
                </div>
                <span className="text-[10px] font-mono bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                  {addons.length}
                </span>
              </button>
            </div>
          </div>

          {/* Group 3: System & Logistics */}
          <div>
            <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-gray-400">
              Pricing & Environment
            </div>
            <div className="space-y-0.5 mt-1">
              <button
                onClick={() => setActiveTab('pricing')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'pricing' ? 'bg-orange-50 text-orange-700 font-bold' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <DollarSign className="w-4 h-4 text-gray-400" />
                <span>Pricing, Currency & Tax</span>
              </button>
              <button
                onClick={() => setActiveTab('branding')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'branding' ? 'bg-orange-50 text-orange-700 font-bold' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Edit3 className="w-4 h-4 text-gray-400" />
                <span>Branding & Copy</span>
              </button>
              <button
                onClick={() => setActiveTab('viewer')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'viewer' ? 'bg-orange-50 text-orange-700 font-bold' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Eye className="w-4 h-4 text-gray-400" />
                <span>3D Viewer Settings</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-gray-100 space-y-2">
          <button
            onClick={handleResetToFactory}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Factory Specs</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto flex flex-col">
        <header className="bg-white border-b border-gray-200 px-6 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="md:hidden p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 capitalize">
                {activeTab === 'models' && 'Properties & Cabin Sizes'}
                {activeTab === 'walls' && 'Wall Panels & Cladding Finishes'}
                {activeTab === 'glazing' && 'Glazing & Panoramic Windows'}
                {activeTab === 'lighting' && 'Lighting & Electrical Infrastructure'}
                {activeTab === 'flooring' && 'Architectural Flooring & Finishes'}
                {activeTab === 'cabinetry' && 'Kitchen Cabinetry Options'}
                {activeTab === 'roof' && 'Roof & Clean Energy Systems'}
                {activeTab === 'addons' && 'Modular Pods & Upgrades'}
                {activeTab === 'pricing' && 'Pricing, Currency & Logistics'}
                {activeTab === 'branding' && 'Branding, Copy & Theme'}
                {activeTab === 'viewer' && '3D Viewer Defaults & Controls'}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Configure features shown in the 3D studio, cost buildup, and spec sheets.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Configurator</span>
            </Link>
            <button
              onClick={handleSave}
              className="bg-black text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-gray-800 transition-colors shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4 text-orange-400" />
              <span>Save Changes</span>
            </button>
          </div>
        </header>

        {/* Toast Notification */}
        {savedToast && (
          <div className="bg-emerald-600 text-white px-6 py-2.5 flex items-center justify-between text-xs font-bold transition-all">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>All changes saved successfully! Updates are immediately active across the configurator.</span>
            </div>
            <Link to="/" className="underline hover:text-emerald-100">
              View in 3D Configurator →
            </Link>
          </div>
        )}

        <main className="p-6 sm:p-8 flex-1">
          <div className="max-w-4xl space-y-6">

            {/* 1. MODELS / SIZES */}
            {activeTab === 'models' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 text-sm">Base Models & Footprints</h3>
                  <span className="text-xs text-gray-500 font-mono">Currency: {baseCurrency}</span>
                </div>
                {models.map((model: any, idx: number) => (
                  <div key={model.id} className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-gray-900 text-sm">{model.name}</h4>
                        <span className="text-xs text-gray-400 font-mono">({model.sqft} sq ft)</span>
                      </div>
                      <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded-md text-gray-600 font-semibold">{model.id}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Display Title</label>
                        <input
                          type="text"
                          value={model.name}
                          onChange={(e) => {
                            const updated = [...models];
                            updated[idx].name = e.target.value;
                            setModels(updated);
                          }}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Base Price ({baseCurrency})</label>
                        <input
                          type="number"
                          value={model.basePrice}
                          onChange={(e) => {
                            const updated = [...models];
                            updated[idx].basePrice = Number(e.target.value);
                            setModels(updated);
                          }}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-semibold focus:outline-none focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Square Footage</label>
                        <input
                          type="number"
                          value={model.sqft}
                          onChange={(e) => {
                            const updated = [...models];
                            updated[idx].sqft = Number(e.target.value);
                            setModels(updated);
                          }}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-semibold focus:outline-none focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Dimensions Length × Width (ft)</label>
                        <div className="flex gap-2 items-center">
                          <input
                            type="number"
                            value={model.dimensions.lengthFt}
                            onChange={(e) => {
                              const updated = [...models];
                              updated[idx].dimensions.lengthFt = Number(e.target.value);
                              setModels(updated);
                            }}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono"
                          />
                          <span className="text-gray-400 font-bold">×</span>
                          <input
                            type="number"
                            value={model.dimensions.widthFt}
                            onChange={(e) => {
                              const updated = [...models];
                              updated[idx].dimensions.widthFt = Number(e.target.value);
                              setModels(updated);
                            }}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 2. WALL PANELS & CLADDING */}
            {activeTab === 'walls' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Exterior Wall Panels & Cladding</h3>
                    <p className="text-xs text-gray-500">Exterior facade options available in the configurator panel.</p>
                  </div>
                  <button
                    onClick={addWallOption}
                    className="text-xs font-bold bg-orange-50 text-orange-700 hover:bg-orange-100 px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-orange-200/60"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Wall Option
                  </button>
                </div>

                {wallColors.map((color: any, idx: number) => (
                  <div key={color.id} className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="relative group">
                          <div
                            className="w-12 h-12 rounded-2xl border border-gray-300 shrink-0 shadow-2xs cursor-pointer flex items-center justify-center overflow-hidden"
                            style={{ backgroundColor: color.color }}
                          >
                            <input
                              type="color"
                              value={color.color.length === 7 ? color.color : '#000000'}
                              onChange={(e) => {
                                const updated = [...wallColors];
                                updated[idx].color = e.target.value;
                                setWallColors(updated);
                              }}
                              className="opacity-0 w-full h-full cursor-pointer absolute inset-0"
                              title="Pick Swatch Color"
                            />
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-mono font-bold text-gray-900">{color.id}</div>
                          <div className="text-[10px] text-gray-400 font-mono">Hex: {color.color}</div>
                        </div>
                      </div>

                      {wallColors.length > 1 && (
                        <button
                          onClick={() => setWallColors(wallColors.filter((w: any) => w.id !== color.id))}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove option"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Option Name</label>
                        <input
                          type="text"
                          value={color.name}
                          onChange={(e) => {
                            const updated = [...wallColors];
                            updated[idx].name = e.target.value;
                            setWallColors(updated);
                          }}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Upgrade Price ({baseCurrency})</label>
                        <input
                          type="number"
                          value={color.price}
                          onChange={(e) => {
                            const updated = [...wallColors];
                            updated[idx].price = Number(e.target.value);
                            setWallColors(updated);
                          }}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Badge Tag</label>
                        <input
                          type="text"
                          value={color.badge || ''}
                          placeholder="e.g. Standard, Popular"
                          onChange={(e) => {
                            const updated = [...wallColors];
                            updated[idx].badge = e.target.value;
                            setWallColors(updated);
                          }}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Customer Description</label>
                        <input
                          type="text"
                          value={color.description || ''}
                          onChange={(e) => {
                            const updated = [...wallColors];
                            updated[idx].description = e.target.value;
                            setWallColors(updated);
                          }}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Technical Spec Detail</label>
                        <input
                          type="text"
                          value={color.specDetail || ''}
                          onChange={(e) => {
                            const updated = [...wallColors];
                            updated[idx].specDetail = e.target.value;
                            setWallColors(updated);
                          }}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono"
                        />
                      </div>
                    </div>

                    {/* 3D PBR Material Settings */}
                    <div className="grid grid-cols-3 gap-3 border-t border-gray-100 pt-3">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Roughness (0-1)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="1"
                          value={color.roughness ?? 0.35}
                          onChange={(e) => {
                            const updated = [...wallColors];
                            updated[idx].roughness = Number(e.target.value);
                            setWallColors(updated);
                          }}
                          className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Metalness (0-1)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="1"
                          value={color.metalness ?? 0.15}
                          onChange={(e) => {
                            const updated = [...wallColors];
                            updated[idx].metalness = Number(e.target.value);
                            setWallColors(updated);
                          }}
                          className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Clearcoat (0-1)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="1"
                          value={color.clearcoat ?? 0}
                          onChange={(e) => {
                            const updated = [...wallColors];
                            updated[idx].clearcoat = Number(e.target.value);
                            setWallColors(updated);
                          }}
                          className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 3. GLAZING & WINDOWS */}
            {activeTab === 'glazing' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Glazing & Panoramic Glass</h3>
                    <p className="text-xs text-gray-500">Configure window styles, thermal ratings, and glass tint options.</p>
                  </div>
                  <button
                    onClick={addGlazingOption}
                    className="text-xs font-bold bg-orange-50 text-orange-700 hover:bg-orange-100 px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-orange-200/60"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Glazing Option
                  </button>
                </div>

                {glazingOptions.map((opt: any, idx: number) => (
                  <div key={opt.id} className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl border border-gray-300 shrink-0 shadow-2xs relative overflow-hidden"
                          style={{ backgroundColor: opt.color || '#93c5fd' }}
                        >
                          <input
                            type="color"
                            value={opt.color && opt.color.length === 7 ? opt.color : '#93c5fd'}
                            onChange={(e) => {
                              const updated = [...glazingOptions];
                              updated[idx].color = e.target.value;
                              setGlazingOptions(updated);
                            }}
                            className="opacity-0 w-full h-full cursor-pointer absolute inset-0"
                            title="Pick Tint Color"
                          />
                        </div>
                        <div>
                          <div className="text-xs font-mono font-bold text-gray-900">{opt.id}</div>
                          <div className="text-[10px] text-gray-400 font-mono">Tint: {opt.color || '#93c5fd'}</div>
                        </div>
                      </div>

                      {glazingOptions.length > 1 && (
                        <button
                          onClick={() => setGlazingOptions(glazingOptions.filter((g: any) => g.id !== opt.id))}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Glass Spec Name</label>
                        <input
                          type="text"
                          value={opt.name}
                          onChange={(e) => {
                            const updated = [...glazingOptions];
                            updated[idx].name = e.target.value;
                            setGlazingOptions(updated);
                          }}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Upgrade Price ({baseCurrency})</label>
                        <input
                          type="number"
                          value={opt.price}
                          onChange={(e) => {
                            const updated = [...glazingOptions];
                            updated[idx].price = Number(e.target.value);
                            setGlazingOptions(updated);
                          }}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Badge Tag</label>
                        <input
                          type="text"
                          value={opt.badge || ''}
                          placeholder="e.g. Standard, Max Daylight"
                          onChange={(e) => {
                            const updated = [...glazingOptions];
                            updated[idx].badge = e.target.value;
                            setGlazingOptions(updated);
                          }}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Customer Description</label>
                        <input
                          type="text"
                          value={opt.description}
                          onChange={(e) => {
                            const updated = [...glazingOptions];
                            updated[idx].description = e.target.value;
                            setGlazingOptions(updated);
                          }}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Technical Spec Detail</label>
                        <input
                          type="text"
                          value={opt.specDetail || ''}
                          onChange={(e) => {
                            const updated = [...glazingOptions];
                            updated[idx].specDetail = e.target.value;
                            setGlazingOptions(updated);
                          }}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 4. LIGHTING & ELECTRICAL */}
            {activeTab === 'lighting' && (
              <div className="space-y-8">
                {/* Section A: Lighting Packages */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">Architectural Lighting Packages</h3>
                      <p className="text-xs text-gray-500">Interior recessed spots, cove lighting, and smart scene controls.</p>
                    </div>
                    <button
                      onClick={addLightingOption}
                      className="text-xs font-bold bg-orange-50 text-orange-700 hover:bg-orange-100 px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-orange-200/60"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Lighting Package
                    </button>
                  </div>

                  {lightingOptions.map((opt: any, idx: number) => (
                    <div key={opt.id} className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs flex flex-col gap-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl border border-gray-300 shrink-0 shadow-2xs relative overflow-hidden flex items-center justify-center"
                            style={{ backgroundColor: opt.color || '#fef08a' }}
                          >
                            <input
                              type="color"
                              value={opt.color && opt.color.length === 7 ? opt.color : '#fef08a'}
                              onChange={(e) => {
                                const updated = [...lightingOptions];
                                updated[idx].color = e.target.value;
                                setLightingOptions(updated);
                              }}
                              className="opacity-0 w-full h-full cursor-pointer absolute inset-0"
                              title="Pick Glow Color"
                            />
                          </div>
                          <div>
                            <div className="text-xs font-mono font-bold text-gray-900">{opt.id}</div>
                            <div className="text-[10px] text-gray-400 font-mono">Kelvin/Glow: {opt.color || '#fef08a'}</div>
                          </div>
                        </div>

                        {lightingOptions.length > 1 && (
                          <button
                            onClick={() => setLightingOptions(lightingOptions.filter((l: any) => l.id !== opt.id))}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Package Title</label>
                          <input
                            type="text"
                            value={opt.name}
                            onChange={(e) => {
                              const updated = [...lightingOptions];
                              updated[idx].name = e.target.value;
                              setLightingOptions(updated);
                            }}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Upgrade Price ({baseCurrency})</label>
                          <input
                            type="number"
                            value={opt.price}
                            onChange={(e) => {
                              const updated = [...lightingOptions];
                              updated[idx].price = Number(e.target.value);
                              setLightingOptions(updated);
                            }}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Badge Tag</label>
                          <input
                            type="text"
                            value={opt.badge || ''}
                            onChange={(e) => {
                              const updated = [...lightingOptions];
                              updated[idx].badge = e.target.value;
                              setLightingOptions(updated);
                            }}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Customer Description</label>
                          <input
                            type="text"
                            value={opt.description}
                            onChange={(e) => {
                              const updated = [...lightingOptions];
                              updated[idx].description = e.target.value;
                              setLightingOptions(updated);
                            }}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tech Spec</label>
                          <input
                            type="text"
                            value={opt.specDetail || ''}
                            onChange={(e) => {
                              const updated = [...lightingOptions];
                              updated[idx].specDetail = e.target.value;
                              setLightingOptions(updated);
                            }}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Section B: Electrical Service Tiers */}
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">Electrical Service & Power Infrastructure</h3>
                      <p className="text-xs text-gray-500">Service amperage (100A, 200A smart panel) and off-grid generator/inverter prep.</p>
                    </div>
                    <button
                      onClick={addElectricalOption}
                      className="text-xs font-bold bg-orange-50 text-orange-700 hover:bg-orange-100 px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-orange-200/60"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Electrical Tier
                    </button>
                  </div>

                  {electricalOptions.map((opt: any, idx: number) => (
                    <div key={opt.id} className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs flex flex-col gap-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-xs font-mono font-bold text-gray-900">{opt.id}</div>
                          <div className="text-[10px] text-gray-400">Panel Class: {opt.badge || 'Standard'}</div>
                        </div>

                        {electricalOptions.length > 1 && (
                          <button
                            onClick={() => setElectricalOptions(electricalOptions.filter((e: any) => e.id !== opt.id))}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tier Name</label>
                          <input
                            type="text"
                            value={opt.name}
                            onChange={(e) => {
                              const updated = [...electricalOptions];
                              updated[idx].name = e.target.value;
                              setElectricalOptions(updated);
                            }}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Upgrade Price ({baseCurrency})</label>
                          <input
                            type="number"
                            value={opt.price}
                            onChange={(e) => {
                              const updated = [...electricalOptions];
                              updated[idx].price = Number(e.target.value);
                              setElectricalOptions(updated);
                            }}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Badge Tag</label>
                          <input
                            type="text"
                            value={opt.badge || ''}
                            onChange={(e) => {
                              const updated = [...electricalOptions];
                              updated[idx].badge = e.target.value;
                              setElectricalOptions(updated);
                            }}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Customer Description</label>
                          <input
                            type="text"
                            value={opt.description}
                            onChange={(e) => {
                              const updated = [...electricalOptions];
                              updated[idx].description = e.target.value;
                              setElectricalOptions(updated);
                            }}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tech Spec</label>
                          <input
                            type="text"
                            value={opt.specDetail || ''}
                            onChange={(e) => {
                              const updated = [...electricalOptions];
                              updated[idx].specDetail = e.target.value;
                              setElectricalOptions(updated);
                            }}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. FLOORING */}
            {activeTab === 'flooring' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Interior Flooring & Architectural Finishes</h3>
                    <p className="text-xs text-gray-500">Rigid core SPC planks, tiles, polished concrete, and custom swatches.</p>
                  </div>
                  <button
                    onClick={addFlooringOption}
                    className="text-xs font-bold bg-orange-50 text-orange-700 hover:bg-orange-100 px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-orange-200/60"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Flooring Option
                  </button>
                </div>

                {flooringOptions.map((opt: any, idx: number) => (
                  <div key={opt.id} className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl border border-gray-300 shrink-0 shadow-2xs relative overflow-hidden"
                          style={{ backgroundColor: opt.color || '#e2d5c3' }}
                        >
                          <input
                            type="color"
                            value={opt.color && opt.color.length === 7 ? opt.color : '#e2d5c3'}
                            onChange={(e) => {
                              const updated = [...flooringOptions];
                              updated[idx].color = e.target.value;
                              setFlooringOptions(updated);
                            }}
                            className="opacity-0 w-full h-full cursor-pointer absolute inset-0"
                            title="Pick Flooring Color"
                          />
                        </div>
                        <div>
                          <div className="text-xs font-mono font-bold text-gray-900">{opt.id}</div>
                          <div className="text-[10px] text-gray-400 font-mono">Tone: {opt.color || '#e2d5c3'}</div>
                        </div>
                      </div>

                      {flooringOptions.length > 1 && (
                        <button
                          onClick={() => setFlooringOptions(flooringOptions.filter((f: any) => f.id !== opt.id))}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Flooring Name</label>
                        <input
                          type="text"
                          value={opt.name}
                          onChange={(e) => {
                            const updated = [...flooringOptions];
                            updated[idx].name = e.target.value;
                            setFlooringOptions(updated);
                          }}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Upgrade Price ({baseCurrency})</label>
                        <input
                          type="number"
                          value={opt.price}
                          onChange={(e) => {
                            const updated = [...flooringOptions];
                            updated[idx].price = Number(e.target.value);
                            setFlooringOptions(updated);
                          }}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Badge Tag</label>
                        <input
                          type="text"
                          value={opt.badge || ''}
                          onChange={(e) => {
                            const updated = [...flooringOptions];
                            updated[idx].badge = e.target.value;
                            setFlooringOptions(updated);
                          }}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Customer Description</label>
                        <input
                          type="text"
                          value={opt.description}
                          onChange={(e) => {
                            const updated = [...flooringOptions];
                            updated[idx].description = e.target.value;
                            setFlooringOptions(updated);
                          }}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Technical Spec Detail</label>
                        <input
                          type="text"
                          value={opt.specDetail || ''}
                          onChange={(e) => {
                            const updated = [...flooringOptions];
                            updated[idx].specDetail = e.target.value;
                            setFlooringOptions(updated);
                          }}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 6. CABINETRY */}
            {activeTab === 'cabinetry' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Kitchen Cabinetry Finishes</h3>
                    <p className="text-xs text-gray-500">Soft-close cabinetry finishes for the kitchenette pod.</p>
                  </div>
                  <button
                    onClick={addCabinetryOption}
                    className="text-xs font-bold bg-orange-50 text-orange-700 hover:bg-orange-100 px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-orange-200/60"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Cabinetry Finish
                  </button>
                </div>

                {cabinetryOptions.map((opt: any, idx: number) => (
                  <div key={opt.id} className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl border border-gray-300 shrink-0 shadow-2xs relative overflow-hidden"
                          style={{ backgroundColor: opt.color || '#1e293b' }}
                        >
                          <input
                            type="color"
                            value={opt.color && opt.color.length === 7 ? opt.color : '#1e293b'}
                            onChange={(e) => {
                              const updated = [...cabinetryOptions];
                              updated[idx].color = e.target.value;
                              setCabinetryOptions(updated);
                            }}
                            className="opacity-0 w-full h-full cursor-pointer absolute inset-0"
                            title="Pick Cabinet Color"
                          />
                        </div>
                        <div>
                          <div className="text-xs font-mono font-bold text-gray-900">{opt.id}</div>
                          <div className="text-[10px] text-gray-400 font-mono">Color: {opt.color || '#1e293b'}</div>
                        </div>
                      </div>

                      {cabinetryOptions.length > 1 && (
                        <button
                          onClick={() => setCabinetryOptions(cabinetryOptions.filter((c: any) => c.id !== opt.id))}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Finish Title</label>
                        <input
                          type="text"
                          value={opt.name}
                          onChange={(e) => {
                            const updated = [...cabinetryOptions];
                            updated[idx].name = e.target.value;
                            setCabinetryOptions(updated);
                          }}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Upgrade Price ({baseCurrency})</label>
                        <input
                          type="number"
                          value={opt.price}
                          onChange={(e) => {
                            const updated = [...cabinetryOptions];
                            updated[idx].price = Number(e.target.value);
                            setCabinetryOptions(updated);
                          }}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Badge Tag</label>
                        <input
                          type="text"
                          value={opt.badge || ''}
                          onChange={(e) => {
                            const updated = [...cabinetryOptions];
                            updated[idx].badge = e.target.value;
                            setCabinetryOptions(updated);
                          }}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Customer Description</label>
                      <input
                        type="text"
                        value={opt.description}
                        onChange={(e) => {
                          const updated = [...cabinetryOptions];
                          updated[idx].description = e.target.value;
                          setCabinetryOptions(updated);
                        }}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 7. ROOF & CLEAN ENERGY */}
            {activeTab === 'roof' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Roof & Clean Energy Systems</h3>
                    <p className="text-xs text-gray-500">Parapet flat roof, solar PV arrays, observation terrace deck, and canopies.</p>
                  </div>
                  <button
                    onClick={addRoofOption}
                    className="text-xs font-bold bg-orange-50 text-orange-700 hover:bg-orange-100 px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-orange-200/60"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Roof Option
                  </button>
                </div>

                {roofOptions.map((opt: any, idx: number) => (
                  <div key={opt.id} className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-xs font-mono font-bold text-gray-900">{opt.id}</div>
                        <div className="text-[10px] text-gray-400">Category: {opt.category || 'Roof & Energy'}</div>
                      </div>

                      {roofOptions.length > 1 && (
                        <button
                          onClick={() => setRoofOptions(roofOptions.filter((r: any) => r.id !== opt.id))}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">System Title</label>
                        <input
                          type="text"
                          value={opt.name}
                          onChange={(e) => {
                            const updated = [...roofOptions];
                            updated[idx].name = e.target.value;
                            setRoofOptions(updated);
                          }}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Upgrade Price ({baseCurrency})</label>
                        <input
                          type="number"
                          value={opt.price}
                          onChange={(e) => {
                            const updated = [...roofOptions];
                            updated[idx].price = Number(e.target.value);
                            setRoofOptions(updated);
                          }}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Badge Tag</label>
                        <input
                          type="text"
                          value={opt.badge || ''}
                          onChange={(e) => {
                            const updated = [...roofOptions];
                            updated[idx].badge = e.target.value;
                            setRoofOptions(updated);
                          }}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Customer Description</label>
                        <input
                          type="text"
                          value={opt.description}
                          onChange={(e) => {
                            const updated = [...roofOptions];
                            updated[idx].description = e.target.value;
                            setRoofOptions(updated);
                          }}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Technical Spec Detail</label>
                        <input
                          type="text"
                          value={opt.specDetail || ''}
                          onChange={(e) => {
                            const updated = [...roofOptions];
                            updated[idx].specDetail = e.target.value;
                            setRoofOptions(updated);
                          }}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 8. MODULAR PODS & ADD-ONS */}
            {activeTab === 'addons' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Modular Pods & Structural Add-Ons</h3>
                    <p className="text-xs text-gray-500">Bathroom pods, kitchenettes, mini-splits, Murphy beds, and smart locks.</p>
                  </div>
                  <button
                    onClick={addAddonOption}
                    className="text-xs font-bold bg-orange-50 text-orange-700 hover:bg-orange-100 px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-orange-200/60"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Modular Upgrade
                  </button>
                </div>

                {addons.map((addon: any, idx: number) => (
                  <div key={addon.id} className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-xs font-mono font-bold text-gray-900">{addon.id}</div>
                        <div className="text-[10px] text-gray-400">Category: {addon.category || 'Interior Modules'}</div>
                      </div>

                      {addons.length > 1 && (
                        <button
                          onClick={() => setAddons(addons.filter((a: any) => a.id !== addon.id))}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Upgrade Name</label>
                        <input
                          type="text"
                          value={addon.name}
                          onChange={(e) => {
                            const updated = [...addons];
                            updated[idx].name = e.target.value;
                            setAddons(updated);
                          }}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Price ({baseCurrency})</label>
                        <input
                          type="number"
                          value={addon.price}
                          onChange={(e) => {
                            const updated = [...addons];
                            updated[idx].price = Number(e.target.value);
                            setAddons(updated);
                          }}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Category Group</label>
                        <input
                          type="text"
                          value={addon.category || 'Interior Modules'}
                          onChange={(e) => {
                            const updated = [...addons];
                            updated[idx].category = e.target.value;
                            setAddons(updated);
                          }}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Customer Description</label>
                        <input
                          type="text"
                          value={addon.description}
                          onChange={(e) => {
                            const updated = [...addons];
                            updated[idx].description = e.target.value;
                            setAddons(updated);
                          }}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tech Spec Detail</label>
                        <input
                          type="text"
                          value={addon.specDetail || ''}
                          onChange={(e) => {
                            const updated = [...addons];
                            updated[idx].specDetail = e.target.value;
                            setAddons(updated);
                          }}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 9. PRICING & LOGISTICS */}
            {activeTab === 'pricing' && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-6">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1 text-sm">Global Currency Settings</h3>
                    <p className="text-xs text-gray-500 mb-4">Controls currency symbols and formatting throughout the configurator and reservation flow.</p>
                    <div className="max-w-xs">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Display Currency</label>
                      <select
                        value={baseCurrency}
                        onChange={(e) => setBaseCurrency(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-orange-500 cursor-pointer"
                      >
                        <option value="USD">USD ($) - US Dollar</option>
                        <option value="EUR">EUR (€) - Euro</option>
                        <option value="GBP">GBP (£) - British Pound</option>
                        <option value="CAD">CAD ($) - Canadian Dollar</option>
                        <option value="AUD">AUD ($) - Australian Dollar</option>
                        <option value="GHS">GHS (GH₵) - Ghana Cedi</option>
                        <option value="NGN">NGN (₦) - Nigerian Naira</option>
                        <option value="ZAR">ZAR (R) - South African Rand</option>
                        <option value="KES">KES (KSh) - Kenyan Shilling</option>
                        <option value="EGP">EGP (E£) - Egyptian Pound</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-1 text-sm">Global Markup Modifier</h3>
                    <p className="text-xs text-gray-500 mb-4">Applies a universal percentage markup or discount to all base prices and upgrades.</p>
                    <div className="max-w-xs">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Markup Percentage (%)</label>
                      <input
                        type="number"
                        value={markup}
                        onChange={(e) => setMarkup(Number(e.target.value))}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-semibold focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-6">
                  <h3 className="font-bold text-gray-900 mb-1 text-sm">Logistics, Delivery & Tax Rates</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Flat Freight Estimate ({baseCurrency})</label>
                      <input
                        type="number"
                        value={logistics.freightCost}
                        onChange={(e) => setLogistics({ ...logistics, freightCost: Number(e.target.value) })}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Site Prep Baseline ({baseCurrency})</label>
                      <input
                        type="number"
                        value={logistics.sitePrepCost}
                        onChange={(e) => setLogistics({ ...logistics, sitePrepCost: Number(e.target.value) })}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Local Tax Rate (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={logistics.taxRate}
                        onChange={(e) => setLogistics({ ...logistics, taxRate: Number(e.target.value) })}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-semibold"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 10. BRANDING & COPY */}
            {activeTab === 'branding' && (
              <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-6">
                <h3 className="font-bold text-gray-900 text-sm">Branding, Copy & Theme Customization</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Brand Name</label>
                    <input
                      type="text"
                      value={branding.brandName || ''}
                      onChange={(e) => setBranding({ ...branding, brandName: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Support Email</label>
                    <input
                      type="text"
                      value={branding.supportEmail || ''}
                      onChange={(e) => setBranding({ ...branding, supportEmail: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Header Main Title</label>
                    <input
                      type="text"
                      value={branding.headerText || ''}
                      onChange={(e) => setBranding({ ...branding, headerText: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tagline</label>
                    <input
                      type="text"
                      value={branding.tagline || ''}
                      onChange={(e) => setBranding({ ...branding, tagline: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">CTA Button Text</label>
                    <input
                      type="text"
                      value={branding.ctaText || ''}
                      onChange={(e) => setBranding({ ...branding, ctaText: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Reservation Deposit Amount ({baseCurrency})</label>
                    <input
                      type="number"
                      value={branding.reservationFee || 250}
                      onChange={(e) => setBranding({ ...branding, reservationFee: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-semibold"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Primary Brand Color (Hex)</label>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl shadow-2xs border border-gray-300 shrink-0 relative overflow-hidden" style={{ backgroundColor: branding.primaryColor }}>
                          <input
                            type="color"
                            value={branding.primaryColor && branding.primaryColor.length === 7 ? branding.primaryColor : '#000000'}
                            onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                            className="opacity-0 w-full h-full cursor-pointer absolute inset-0"
                            title="Pick Primary Color"
                          />
                        </div>
                        <input
                          type="text"
                          value={branding.primaryColor}
                          onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-semibold"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {['#000000', '#ea580c', '#0D3512', '#000066', '#0f172a', '#be123c', '#0369a1', '#7c3aed'].map((color) => (
                          <button
                            key={color}
                            onClick={() => setBranding({ ...branding, primaryColor: color })}
                            className="w-7 h-7 rounded-full border-2 border-white shadow-xs ring-1 ring-gray-200 cursor-pointer hover:scale-110 transition-transform"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 11. 3D VIEWER SETTINGS */}
            {activeTab === 'viewer' && (
              <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-6">
                <h3 className="font-bold text-gray-900 text-sm">Environmental & 3D Viewer Defaults</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Default Lighting Environment</label>
                    <div className="flex gap-2">
                      {['day', 'sunset', 'night'].map((time) => (
                        <button
                          key={time}
                          onClick={() => setViewerControls({ ...viewerControls, defaultLighting: time })}
                          className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-colors cursor-pointer ${
                            viewerControls.defaultLighting === time ? 'bg-orange-600 text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Default Initial Inspection State</label>
                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors">
                      <input
                        type="checkbox"
                        checked={viewerControls.defaultCutaway}
                        onChange={(e) => setViewerControls({ ...viewerControls, defaultCutaway: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 accent-orange-600"
                      />
                      <span className="text-xs font-bold text-gray-900">Enable Roof-Lift / Floorplan Cutaway Mode by Default</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
