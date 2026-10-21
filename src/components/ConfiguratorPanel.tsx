import React, { useState, useMemo, useEffect } from 'react';
import {
  CustomizationState,
  HomeModelId,
  WallCladdingId,
  InteriorWallId,
  GlazingId,
  LightingPackageId,
  ElectricalTierId,
  FlooringId,
  RoofOptionId,
  FloorPlanId,
} from '../types';
import { BASE_MODELS } from '../data/models';
import { INTERIOR_WALL_OPTIONS, FLOOR_PLAN_OPTIONS } from '../data/options';
import { FloorPlanDiagram } from './FloorPlanDiagram';
import { useAppConfig } from '../context/AppConfigContext';
import { formatCurrency } from '../utils/currency';
import { getItemPriceForModel, getItemUnitSpec } from '../utils/pricingCalculator';
import {
  Home,
  Layers,
  Sparkles,
  Zap,
  Grid,
  SunMedium,
  Check,
  Plus,
  HelpCircle,
  Sliders,
  ChevronDown,
  Info,
  Box,
  Compass,
  CheckCircle2,
  Filter,
  Tv,
  Bed,
  Bath,
  Utensils,
  Maximize2,
  Shield,
  Tag,
  Eye,
  LayoutGrid,
  ExternalLink,
} from 'lucide-react';

export function DoorWindowDiagram({ id }: { id: string }) {
  switch (id) {
    case 'casement-window':
      return (
        <svg viewBox="0 0 80 64" className="w-full h-full drop-shadow-xs">
          <rect x="4" y="6" width="72" height="50" rx="3" fill="#1e293b" />
          <rect x="7" y="9" width="31" height="44" rx="1.5" fill="#bae6fd" opacity="0.85" />
          <rect x="42" y="9" width="31" height="44" rx="1.5" fill="#bae6fd" opacity="0.85" />
          {/* Left sash open outward perspective */}
          <polygon points="7,9 33,13 33,49 7,53" fill="#e0f2fe" stroke="#0f172a" strokeWidth="2.5" />
          <line x1="7" y1="9" x2="33" y2="13" stroke="#f59e0b" strokeWidth="2" />
          <line x1="7" y1="53" x2="33" y2="49" stroke="#f59e0b" strokeWidth="2" />
          <line x1="30" y1="28" x2="30" y2="34" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
          <line x1="39.5" y1="6" x2="39.5" y2="56" stroke="#0f172a" strokeWidth="3" />
          {/* Window Sill */}
          <rect x="2" y="55" width="76" height="5" rx="1" fill="#475569" />
        </svg>
      );
    case 'sliding-window':
      return (
        <svg viewBox="0 0 80 64" className="w-full h-full drop-shadow-xs">
          <rect x="4" y="6" width="72" height="50" rx="3" fill="#1e293b" />
          <rect x="8" y="10" width="34" height="42" rx="1.5" fill="#bae6fd" opacity="0.85" />
          <rect x="38" y="10" width="34" height="42" rx="1.5" fill="#93c5fd" opacity="0.9" />
          {/* Overlap stile */}
          <rect x="37" y="8" width="6" height="46" fill="#334155" />
          <line x1="38" y1="28" x2="38" y2="34" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
          {/* Sliding direction arrows */}
          <path d="M18 31 L26 31 M22 28 L18 31 L22 34" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" />
          <path d="M62 31 L54 31 M58 28 L62 31 L58 34" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" />
          {/* Window Sill */}
          <rect x="2" y="55" width="76" height="5" rx="1" fill="#475569" />
        </svg>
      );
    case 'tophanging-window':
      return (
        <svg viewBox="0 0 80 64" className="w-full h-full drop-shadow-xs">
          <rect x="8" y="6" width="64" height="50" rx="3" fill="#1e293b" />
          <rect x="12" y="10" width="56" height="42" fill="#94a3b8" opacity="0.3" />
          {/* Awning kicked outward at bottom */}
          <polygon points="12,10 68,10 73,46 7,46" fill="#bae6fd" stroke="#0f172a" strokeWidth="2.5" />
          <line x1="12" y1="10" x2="68" y2="10" stroke="#f59e0b" strokeWidth="3" />
          {/* Scissor stay bars */}
          <line x1="12" y1="10" x2="7" y2="46" stroke="#64748b" strokeWidth="1.5" strokeDasharray="2 2" />
          <line x1="68" y1="10" x2="73" y2="46" stroke="#64748b" strokeWidth="1.5" strokeDasharray="2 2" />
          <circle cx="40" cy="43" r="3" fill="#ef4444" />
          {/* Window Sill */}
          <rect x="4" y="55" width="72" height="5" rx="1" fill="#475569" />
        </svg>
      );
    case 'overhanging-window':
      return (
        <svg viewBox="0 0 80 64" className="w-full h-full drop-shadow-xs">
          <rect x="8" y="6" width="64" height="50" rx="3" fill="#1e293b" />
          <rect x="12" y="10" width="56" height="42" fill="#94a3b8" opacity="0.3" />
          {/* Hopper tilted inward from top */}
          <polygon points="7,16 73,16 68,52 12,52" fill="#bae6fd" stroke="#0f172a" strokeWidth="2.5" />
          <line x1="12" y1="52" x2="68" y2="52" stroke="#f59e0b" strokeWidth="3" />
          <circle cx="40" cy="19" r="3" fill="#ef4444" />
          {/* Window Sill */}
          <rect x="4" y="55" width="72" height="5" rx="1" fill="#475569" />
        </svg>
      );
    case 'broken-bridge-sliding-door':
      return (
        <svg viewBox="0 0 80 64" className="w-full h-full drop-shadow-xs">
          <rect x="12" y="4" width="56" height="55" rx="2" fill="#1e293b" />
          <rect x="15" y="7" width="25" height="49" fill="#bae6fd" opacity="0.85" />
          <rect x="39" y="7" width="26" height="49" fill="#93c5fd" opacity="0.9" />
          {/* Handle */}
          <rect x="36" y="23" width="3.5" height="18" rx="1.5" fill="#f8fafc" stroke="#334155" strokeWidth="0.8" />
          {/* Overlap */}
          <line x1="39.5" y1="4" x2="39.5" y2="59" stroke="#0f172a" strokeWidth="2.5" />
          {/* Canopy & Threshold */}
          <rect x="10" y="58" width="60" height="4" rx="1" fill="#64748b" />
          <rect x="10" y="2" width="60" height="3" rx="1" fill="#334155" />
        </svg>
      );
    case 'broken-bridge-double-door':
      return (
        <svg viewBox="0 0 80 64" className="w-full h-full drop-shadow-xs">
          <rect x="12" y="4" width="56" height="55" rx="2" fill="#1e293b" />
          <rect x="15" y="7" width="24" height="44" fill="#bae6fd" opacity="0.85" />
          <rect x="41" y="7" width="24" height="44" fill="#bae6fd" opacity="0.85" />
          {/* Center Astragal */}
          <line x1="40" y1="4" x2="40" y2="59" stroke="#0f172a" strokeWidth="2.5" />
          {/* Bottom kick rail */}
          <rect x="15" y="51" width="24" height="5" fill="#334155" />
          <rect x="41" y="51" width="24" height="5" fill="#334155" />
          {/* Dual French Handles */}
          <line x1="35" y1="31" x2="38.5" y2="31" stroke="#f8fafc" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="45" y1="31" x2="41.5" y2="31" stroke="#f8fafc" strokeWidth="2.5" strokeLinecap="round" />
          {/* Hinges */}
          <rect x="11" y="11" width="2" height="4" fill="#94a3b8" />
          <rect x="11" y="45" width="2" height="4" fill="#94a3b8" />
          <rect x="67" y="11" width="2" height="4" fill="#94a3b8" />
          <rect x="67" y="45" width="2" height="4" fill="#94a3b8" />
          {/* Threshold */}
          <rect x="10" y="58" width="60" height="4" rx="1" fill="#64748b" />
        </svg>
      );
    case 'aluminum-alloy-double-door':
      return (
        <svg viewBox="0 0 80 64" className="w-full h-full drop-shadow-xs">
          <rect x="12" y="4" width="56" height="55" rx="2" fill="#18181b" stroke="#3f3f46" strokeWidth="2" />
          <rect x="16" y="8" width="22" height="47" fill="#bae6fd" opacity="0.85" />
          <rect x="42" y="8" width="22" height="47" fill="#bae6fd" opacity="0.85" />
          {/* Divided Lites (Muntin Grid in architectural dark metal) */}
          <line x1="27" y1="8" x2="27" y2="55" stroke="#27272a" strokeWidth="2" />
          <line x1="53" y1="8" x2="53" y2="55" stroke="#27272a" strokeWidth="2" />
          <line x1="16" y1="23" x2="38" y2="23" stroke="#27272a" strokeWidth="2" />
          <line x1="16" y1="39" x2="38" y2="39" stroke="#27272a" strokeWidth="2" />
          <line x1="42" y1="23" x2="64" y2="23" stroke="#27272a" strokeWidth="2" />
          <line x1="42" y1="39" x2="64" y2="39" stroke="#27272a" strokeWidth="2" />
          {/* Center line & Handles */}
          <line x1="40" y1="4" x2="40" y2="59" stroke="#09090b" strokeWidth="2" />
          <circle cx="36" cy="31" r="2" fill="#e4e4e7" />
          <circle cx="44" cy="31" r="2" fill="#e4e4e7" />
          {/* Threshold */}
          <rect x="10" y="58" width="60" height="4" rx="1" fill="#3f3f46" />
        </svg>
      );
    case 'kfc-double-door':
      return (
        <svg viewBox="0 0 80 64" className="w-full h-full drop-shadow-xs">
          <rect x="12" y="4" width="56" height="55" rx="2" fill="#1e293b" />
          <rect x="15" y="7" width="24" height="40" fill="#bae6fd" opacity="0.85" />
          <rect x="41" y="7" width="24" height="40" fill="#bae6fd" opacity="0.85" />
          {/* Commercial Stainless Kickplates */}
          <rect x="15" y="47" width="24" height="9" fill="#94a3b8" />
          <rect x="41" y="47" width="24" height="9" fill="#94a3b8" />
          {/* Overhead Closer Box */}
          <rect x="22" y="5" width="36" height="4" rx="1" fill="#64748b" />
          {/* KFC Long Vertical Push-Pull Bars */}
          <line x1="36" y1="16" x2="36" y2="45" stroke="#f8fafc" strokeWidth="3" strokeLinecap="round" />
          <line x1="44" y1="16" x2="44" y2="45" stroke="#f8fafc" strokeWidth="3" strokeLinecap="round" />
          {/* Center Line */}
          <line x1="40" y1="4" x2="40" y2="59" stroke="#0f172a" strokeWidth="2.5" />
          {/* Threshold */}
          <rect x="10" y="58" width="60" height="4" rx="1" fill="#64748b" />
        </svg>
      );
    case 'broken-bridge-grille-door':
      return (
        <svg viewBox="0 0 80 64" className="w-full h-full drop-shadow-xs">
          <rect x="12" y="4" width="56" height="55" rx="2" fill="#ffffff" stroke="#94a3b8" strokeWidth="2" />
          <rect x="16" y="8" width="48" height="47" fill="#bae6fd" opacity="0.85" />
          {/* Security Vertical Grilles */}
          <line x1="22" y1="8" x2="22" y2="55" stroke="#475569" strokeWidth="2" />
          <line x1="28" y1="8" x2="28" y2="55" stroke="#475569" strokeWidth="2" />
          <line x1="34" y1="8" x2="34" y2="55" stroke="#475569" strokeWidth="2" />
          <line x1="40" y1="8" x2="40" y2="55" stroke="#475569" strokeWidth="2" />
          <line x1="46" y1="8" x2="46" y2="55" stroke="#475569" strokeWidth="2" />
          <line x1="52" y1="8" x2="52" y2="55" stroke="#475569" strokeWidth="2" />
          <line x1="58" y1="8" x2="58" y2="55" stroke="#475569" strokeWidth="2" />
          {/* Horizontal crossbar & lock */}
          <line x1="16" y1="31" x2="64" y2="31" stroke="#334155" strokeWidth="3" />
          <rect x="58" y="29" width="3" height="8" rx="1" fill="#f59e0b" />
          {/* Threshold */}
          <rect x="10" y="58" width="60" height="4" rx="1" fill="#cbd5e1" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 80 64" className="w-full h-full drop-shadow-xs">
          <rect x="12" y="6" width="56" height="50" rx="3" fill="#1e293b" />
          <rect x="15" y="9" width="50" height="44" rx="1.5" fill="#bae6fd" opacity="0.9" />
          <circle cx="40" cy="31" r="12" fill="none" stroke="#0284c7" strokeWidth="2" strokeDasharray="3 3" />
        </svg>
      );
  }
}

interface ConfiguratorPanelProps {
  state: CustomizationState;
  onChange: (
    updater: ((prev: CustomizationState) => CustomizationState) | Partial<CustomizationState>
  ) => void;
  onSelectModel?: (id: HomeModelId) => void;
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
  onPerspectiveChange?: (p: any) => void;
  onCutawayToggle?: (val?: any) => void;
  onRoofLiftChange?: (val: number) => void;
  cutawayMode?: boolean;
  isAdvancedMode?: boolean;
  onToggleAdvancedMode?: () => void;
}

export const ConfiguratorPanel: React.FC<ConfiguratorPanelProps> = ({
  state,
  onChange,
  onSelectModel,
  activeCategory,
  onSelectCategory,
  onPerspectiveChange,
  onCutawayToggle,
  onRoofLiftChange,
  cutawayMode,
  isAdvancedMode = false,
  onToggleAdvancedMode,
}) => {
  const { config } = useAppConfig();
  const markupFactor = 1 + ((config.markup || 0) / 100);

  // Sub-filter states
  const [wallScope, setWallScope] = useState<'exterior' | 'interior'>('exterior');
  const [modelSeriesFilter, setModelSeriesFilter] = useState<'all' | 'expandable' | 'apple-cabin' | 'space-capsule' | 'folding'>('all');
  const [floorPlanFilter, setFloorPlanFilter] = useState<'all' | '1-bed' | '2-bed' | '3-bed' | '4-bed'>('all');
  const [wallSubFilter, setWallSubFilter] = useState<string>('all');
  const [interiorWallSubFilter, setInteriorWallSubFilter] = useState<string>('all');
  const [glazingSubFilter, setGlazingSubFilter] = useState<'all' | 'Windows' | 'Entrance Doors'>('all');
  const [flooringSubFilter, setFlooringSubFilter] = useState<string>('all');
  const [addonSubFilter, setAddonSubFilter] = useState<'all' | 'living' | 'climate' | 'smart'>('all');

  // Automatically align wall scope to interior when cutaway mode is triggered
  useEffect(() => {
    if (cutawayMode && activeCategory === 'Wall Panels') {
      setWallScope('interior');
    }
  }, [cutawayMode, activeCategory]);

  // Publicly available models: strictly exclude models hidden or disabled in the dashboard
  const availableModels = useMemo(() => {
    const list = config.models && config.models.length > 0 ? config.models : BASE_MODELS;
    return list.filter((m: any) => m.isAvailable !== false && m.isActive !== false);
  }, [config.models]);

  // Publicly available options for each category to ensure items hidden or deleted in dashboard do not display
  const availableWallOptions = useMemo(() => {
    return (config.wallOptions || []).filter((w: any) => w.isAvailable !== false && w.isActive !== false);
  }, [config.wallOptions]);

  // The 12 official Expandable House Factory Catalog finishes from the spec sheet
  const factory12WallOptions = useMemo(() => {
    const ids = [
      'wenge',
      'big-eye-wood',
      'ancient-wall-grey',
      'angel-white',
      'desert-yellow',
      'multi-color-brick',
      'grass-green',
      'pine-knot',
      'culture-stone',
      'golden-buff-brick',
      'classic-red-brick',
      'antique-blue-brick',
    ];
    const items = ids
      .map((id) => availableWallOptions.find((w: any) => w.id === id))
      .filter(Boolean);
    return items.length > 0 ? items : availableWallOptions.slice(0, 12);
  }, [availableWallOptions]);

  const availableInteriorWallOptions = useMemo(() => {
    return (config.interiorWallOptions || INTERIOR_WALL_OPTIONS).filter(
      (w: any) => w.isAvailable !== false && w.isActive !== false
    );
  }, [config.interiorWallOptions]);

  const availableGlazingOptions = useMemo(() => {
    return (config.glazingOptions || []).filter((g: any) => g.isAvailable !== false && g.isActive !== false);
  }, [config.glazingOptions]);

  const availableFlooringOptions = useMemo(() => {
    return (config.flooringOptions || []).filter((f: any) => f.isAvailable !== false && f.isActive !== false);
  }, [config.flooringOptions]);

  // Filtered flooring options by collection
  const filteredFlooringOptions = useMemo(() => {
    return availableFlooringOptions.filter((f: any) => {
      if (flooringSubFilter === 'all') return true;
      return f.category === flooringSubFilter;
    });
  }, [availableFlooringOptions, flooringSubFilter]);

  // Filtered interior wall options by material category
  const filteredInteriorWallOptions = useMemo(() => {
    return availableInteriorWallOptions.filter((w: any) => {
      if (interiorWallSubFilter === 'all') return true;
      return w.category === interiorWallSubFilter;
    });
  }, [availableInteriorWallOptions, interiorWallSubFilter]);

  const availableRoofOptions = useMemo(() => {
    return (config.roofOptions || []).filter((r: any) => r.isAvailable !== false && r.isActive !== false);
  }, [config.roofOptions]);

  const availableAddons = useMemo(() => {
    return (config.addons || []).filter((a: any) => a.isAvailable !== false && a.isActive !== false);
  }, [config.addons]);

  const activeAddonsCount = useMemo(() => {
    return availableAddons.filter((addon: any) => Boolean(state[addon.id])).length;
  }, [availableAddons, state]);

  // Current selected model
  const currentModel =
    availableModels.find((m: any) => m.id === state.modelId) ||
    config.models?.find((m: any) => m.id === state.modelId) ||
    availableModels[0] ||
    config.models?.[0];

  const isExpandableHouse =
    state.modelId.includes('expandable') ||
    state.modelId.includes('20ft') ||
    state.modelId.includes('30ft') ||
    state.modelId.includes('40ft') ||
    currentModel?.series === 'expandable';

  // Filtered floor plan options (exclusive to expandable houses)
  const filteredFloorPlans = useMemo(() => {
    return FLOOR_PLAN_OPTIONS.filter((p) => {
      if (p.id === '10ft-1bed') return false; // Handled in dedicated 10FT layout view
      if (floorPlanFilter === 'all') return true;
      if (floorPlanFilter === '1-bed') return p.bedrooms === 1;
      if (floorPlanFilter === '2-bed') return p.bedrooms === 2;
      if (floorPlanFilter === '3-bed') return p.bedrooms === 3;
      if (floorPlanFilter === '4-bed') return p.bedrooms === 4;
      return true;
    });
  }, [floorPlanFilter]);

  const basicCategoryIds = [
    'Base House',
    'Floor plan',
    'Add-ons',
    'Wall Panels',
    'Glazing & Windows',
    'Interior Modules',
  ];

  const allCategories = [
    { id: 'Base House', label: 'Base House', icon: Home, count: availableModels.length },
    ...(isExpandableHouse
      ? [
          {
            id: 'Floor plan',
            label: state.modelId === 'expandable-10ft' ? 'Floor plan (Fixed 1-Bed)' : 'Floor plan',
            icon: LayoutGrid,
            count: state.modelId === 'expandable-10ft' ? 1 : FLOOR_PLAN_OPTIONS.filter((p) => p.id !== '10ft-1bed').length,
          },
        ]
      : []),
    {
      id: 'Add-ons',
      label: 'Add-ons & Furniture',
      icon: Sparkles,
      count: availableAddons.length,
    },
    {
      id: 'Wall Panels',
      label: 'Wall Panels',
      icon: Layers,
      count: availableWallOptions.length + availableInteriorWallOptions.length,
    },
    { id: 'Glazing & Windows', label: 'Doors & Windows', icon: Grid, count: availableGlazingOptions.length },
    { id: 'Flooring', label: 'Flooring', icon: Grid, count: availableFlooringOptions.length },
    { id: 'Roof & Energy', label: 'Roof & Terraces', icon: SunMedium, count: availableRoofOptions.length },
    { id: 'Smart Living', label: 'Smart Living & AI', icon: Zap, count: availableAddons.filter((a: any) => a.category === 'Smart Living').length },
  ];

  const categories = useMemo(() => {
    if (isAdvancedMode) return allCategories;
    return allCategories.filter(
      (cat) =>
        basicCategoryIds.includes(cat.id) ||
        cat.id === activeCategory ||
        ((cat.id === 'Glazing & Windows' || cat.id === 'Doors & Windows') &&
          (activeCategory === 'Glazing & Windows' || activeCategory === 'Doors & Windows'))
    );
  }, [isAdvancedMode, allCategories, activeCategory]);

  // Filtered models
  const filteredModels = availableModels.filter((m: any) => {
    if (modelSeriesFilter === 'all') return true;
    if (modelSeriesFilter === 'expandable') return m.series === 'expandable' || m.id.includes('expandable');
    if (modelSeriesFilter === 'apple-cabin') return m.series === 'apple-cabin' || m.id === 'studio' || m.id === 'one-bedroom' || m.id === 'two-bedroom' || m.id.includes('apple');
    if (modelSeriesFilter === 'space-capsule') return m.series === 'space-capsule' || m.id.includes('space-capsule');
    if (modelSeriesFilter === 'folding') return m.series === 'folding' || m.id.includes('folding') || m.id.includes('assembly');
    return true;
  });

  // Filtered wall options
  const filteredWallOptions = availableWallOptions.filter((w: any) => {
    if (wallSubFilter === 'all') return true;
    if (wallSubFilter === 'Factory 12 Catalog') return w.category === 'Factory 12 Catalog';
    if (wallSubFilter === 'Wood Grain') {
      return (
        w.id === 'wenge' ||
        w.id === 'big-eye-wood' ||
        w.id === 'pine-knot' ||
        w.name?.includes('Wood') ||
        w.name?.includes('Pine') ||
        w.badge?.includes('Wood') ||
        w.badge?.includes('Timber')
      );
    }
    if (wallSubFilter === 'Carved Masonry') {
      return (
        w.id === 'ancient-wall-grey' ||
        w.id === 'angel-white' ||
        w.id === 'desert-yellow' ||
        w.category === 'Metal Carved Panel' ||
        w.badge?.includes('Carved') ||
        w.badge?.includes('Sandstone')
      );
    }
    if (wallSubFilter === 'Brick Masonry') {
      return (
        w.id === 'multi-color-brick' ||
        w.id === 'culture-stone' ||
        w.id === 'golden-buff-brick' ||
        w.id === 'classic-red-brick' ||
        w.id === 'antique-blue-brick' ||
        w.badge?.includes('Brick') ||
        w.badge?.includes('Stone')
      );
    }
    return w.category === wallSubFilter;
  });

  // Filtered windows & doors options
  const filteredGlazingOptions = availableGlazingOptions.filter((g: any) => {
    if (glazingSubFilter === 'all') return true;
    return g.category === glazingSubFilter;
  });

  return (
    <div 
      className="bg-white flex flex-col h-full overflow-hidden"
      style={{ '--primary': config.branding.primaryColor } as React.CSSProperties}
    >
      {/* Panel Top Header: Configuration Mode Status & Quick Access to Advanced Tools */}
      <div className="px-3 sm:px-3.5 py-2.5 bg-white border-b border-gray-100 flex items-center justify-between gap-2 shrink-0">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-black text-gray-950 tracking-tight">
              {isAdvancedMode ? 'Advanced Studio Tools' : 'Basic Configuration'}
            </span>
            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
              isAdvancedMode ? 'bg-orange-100 text-orange-900 border border-orange-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}>
              {isAdvancedMode ? 'All 8 Suites Active' : 'Default Mode'}
            </span>
          </div>
          <p className="text-[10px] text-gray-500 truncate mt-0.5">
            {isAdvancedMode
              ? 'All modular categories, specs & engineering tools unlocked'
              : 'Clean, essential building tools for fast configuration'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onToggleAdvancedMode && onToggleAdvancedMode()}
          className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95 ${
            isAdvancedMode
              ? 'bg-gray-100 hover:bg-gray-200 text-gray-800 shadow-2xs'
              : 'bg-orange-600 hover:bg-orange-700 text-white shadow-2xs'
          }`}
          title={isAdvancedMode ? 'Switch back to Basic Tools' : 'Unlock all tools across the platform'}
        >
          {isAdvancedMode ? (
            <>
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              <span>Basic View</span>
            </>
          ) : (
            <>
              <Sliders className="w-3.5 h-3.5" />
              <span>Advanced Tools</span>
            </>
          )}
        </button>
      </div>

      {/* Quick Add-ons & Furniture Access Bar */}
      <div className="px-3 py-1.5 bg-gradient-to-r from-orange-50/90 via-amber-50/70 to-orange-50/90 border-b border-orange-200/80 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
          <Sparkles className="w-3.5 h-3.5 text-orange-600 shrink-0" />
          <span className="text-[11px] font-bold text-gray-950 shrink-0">
            Modules:
          </span>
          {/* Quick toggle Bath Pod */}
          <button
            type="button"
            onClick={() =>
              onChange((prev) => ({
                ...prev,
                hasLuxuryBathPod: !prev.hasLuxuryBathPod,
              }))
            }
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
              state.hasLuxuryBathPod
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 hover:bg-red-50 hover:text-red-700 hover:border-red-200'
                : 'bg-white text-gray-500 border border-gray-300 hover:border-emerald-400'
            }`}
            title={state.hasLuxuryBathPod ? 'Bath Pod is included by default. Click to remove.' : 'Click to add Bath Pod'}
          >
            <span>🛁</span>
            <span>{state.hasLuxuryBathPod ? '✓ Bath Pod' : '+ Bath Pod'}</span>
          </button>

          {/* Quick toggle Kitchenette */}
          <button
            type="button"
            onClick={() =>
              onChange((prev) => ({
                ...prev,
                hasKitchenetteModule: !prev.hasKitchenetteModule,
              }))
            }
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
              state.hasKitchenetteModule
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 hover:bg-red-50 hover:text-red-700 hover:border-red-200'
                : 'bg-white text-gray-500 border border-gray-300 hover:border-emerald-400'
            }`}
            title={state.hasKitchenetteModule ? 'Kitchenette is included by default. Click to remove.' : 'Click to add Kitchenette'}
          >
            <span>🍳</span>
            <span>{state.hasKitchenetteModule ? '✓ Kitchen' : '+ Kitchen'}</span>
          </button>

          {/* Quick toggle Bed Suite */}
          <button
            type="button"
            onClick={() =>
              onChange((prev) => ({
                ...prev,
                hasLuxuryBedSuite: !prev.hasLuxuryBedSuite,
              }))
            }
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
              state.hasLuxuryBedSuite
                ? 'bg-indigo-100 text-indigo-900 border border-indigo-300 hover:bg-red-50 hover:text-red-700 hover:border-red-200'
                : 'bg-white text-gray-500 border border-gray-300 hover:border-indigo-400'
            }`}
            title={state.hasLuxuryBedSuite ? 'Bed is added. Click to remove.' : 'Click to self-add Architectural Bed Suite'}
          >
            <span>🛏️</span>
            <span>{state.hasLuxuryBedSuite ? '✓ Bed' : '+ Add Bed'}</span>
          </button>

          {/* Quick toggle Living Sofa */}
          <button
            type="button"
            onClick={() =>
              onChange((prev) => ({
                ...prev,
                hasLivingSofa: !prev.hasLivingSofa,
              }))
            }
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
              state.hasLivingSofa
                ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-red-50 hover:text-red-700 hover:border-red-200'
                : 'bg-white text-gray-500 border border-gray-300 hover:border-amber-400'
            }`}
            title={state.hasLivingSofa ? 'Sofa is added. Click to remove.' : 'Click to self-add Designer Living Sofa'}
          >
            <span>🛋️</span>
            <span>{state.hasLivingSofa ? '✓ Sofa' : '+ Add Sofa'}</span>
          </button>
        </div>
        <button
          type="button"
          onClick={() => onSelectCategory('Add-ons')}
          className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
            activeCategory === 'Add-ons' || activeCategory === 'Interior Modules'
              ? 'bg-orange-600 text-white shadow-2xs'
              : 'bg-white hover:bg-orange-600 hover:text-white text-orange-700 border border-orange-300 shadow-2xs'
          }`}
          title="Open Add-on & Furniture Manager to add bed, sofa, kitchenette, bath, etc."
        >
          {activeCategory === 'Add-ons' || activeCategory === 'Interior Modules' ? 'Managing Add-ons' : 'Manage Add-ons →'}
        </button>
      </div>

      {/* Category Navigation Tabs */}
      <div className="flex border-b border-gray-200/80 bg-[#FAFAFC] overflow-x-auto p-2.5 gap-1.5 shrink-0 scrollbar-thin scrollbar-thumb-gray-200">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isGlazingTab = cat.id === 'Glazing & Windows' || cat.id === 'Doors & Windows';
          const isActive =
            activeCategory === cat.id ||
            (isGlazingTab && (activeCategory === 'Glazing & Windows' || activeCategory === 'Doors & Windows'));
          const isWallPanelsTab = cat.id === 'Wall Panels';
          const isFloorPlanTab = cat.id === 'Floor plan';
          const isAddonTab = cat.id === 'Add-ons' || cat.id === 'Interior Modules';
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isFloorPlanTab
                  ? isActive
                    ? 'bg-gradient-to-r from-blue-700 via-indigo-600 to-indigo-700 text-white shadow-sm font-bold ring-2 ring-indigo-400/30'
                    : 'bg-blue-50/90 hover:bg-blue-100/90 text-blue-900 border border-blue-200/80 shadow-2xs font-semibold'
                  : isWallPanelsTab
                  ? isActive
                    ? 'bg-gradient-to-r from-orange-50 via-white to-amber-50 text-gray-950 shadow-sm border border-orange-300 ring-2 ring-orange-500/20 font-bold'
                    : 'bg-white/80 hover:bg-orange-50/40 text-gray-800 hover:text-gray-950 border border-gray-200 hover:border-orange-200 shadow-2xs font-semibold'
                  : isAddonTab
                  ? isActive
                    ? 'bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white shadow-sm font-bold ring-2 ring-orange-400/30'
                    : 'bg-orange-50/80 hover:bg-orange-100 text-orange-950 border border-orange-200/90 shadow-2xs font-bold'
                  : isActive
                  ? 'bg-white text-gray-900 shadow-xs border border-gray-200/90 ring-1 ring-black/5 font-bold'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/80 border border-transparent'
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 transition-colors ${
                  isFloorPlanTab
                    ? isActive
                      ? 'text-white'
                      : 'text-blue-600'
                    : isWallPanelsTab
                    ? isActive
                      ? 'text-orange-600'
                      : 'text-orange-500/80'
                    : isAddonTab
                    ? isActive
                      ? 'text-white'
                      : 'text-orange-600'
                    : isActive
                    ? 'text-[var(--primary)]'
                    : 'text-gray-400'
                }`}
              />
              <span>{cat.label}</span>
              {isFloorPlanTab ? (
                <span className="flex items-center gap-1">
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono font-bold tracking-tight transition-colors ${
                      isActive
                        ? 'bg-white/20 text-white shadow-2xs'
                        : 'bg-blue-200/70 text-blue-900 border border-blue-300/60'
                    }`}
                  >
                    6 Plans
                  </span>
                </span>
              ) : isWallPanelsTab ? (
                <span className="flex items-center gap-1">
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono font-bold tracking-tight transition-colors ${
                      isActive
                        ? 'bg-orange-600 text-white shadow-2xs'
                        : 'bg-orange-100 text-orange-800 border border-orange-200/80'
                    }`}
                  >
                    In/Out • {cat.count}
                  </span>
                </span>
              ) : isAddonTab ? (
                <span className="flex items-center gap-1">
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono font-bold tracking-tight transition-colors ${
                      isActive
                        ? 'bg-white/25 text-white shadow-2xs'
                        : activeAddonsCount > 0
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-orange-200/80 text-orange-900 border border-orange-300/80'
                    }`}
                  >
                    {activeAddonsCount > 0 ? `${activeAddonsCount} Added` : `${cat.count} Available`}
                  </span>
                </span>
              ) : cat.count > 0 ? (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold transition-colors ${
                    isActive
                      ? 'bg-orange-50 text-orange-700 border border-orange-200/60'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {cat.count}
                </span>
              ) : null}
            </button>
          );
        })}

        {/* In Basic Mode, provide clean +3 Advanced Tools button at the end of the tabs */}
        {!isAdvancedMode && (
          <button
            type="button"
            onClick={() => onToggleAdvancedMode && onToggleAdvancedMode()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-orange-800 bg-orange-50 hover:bg-orange-100/90 border border-orange-200/90 whitespace-nowrap transition-all cursor-pointer shrink-0 shadow-2xs active:scale-95 group"
            title="Click to reveal all tools: Roof & Terraces, 24 SPC Floorings, Smart Living IoT"
          >
            <Sliders className="w-3.5 h-3.5 text-orange-600 group-hover:rotate-45 transition-transform" />
            <span>+3 Advanced Tools</span>
            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-orange-200/80 text-orange-900 font-extrabold">
              Pro
            </span>
          </button>
        )}
      </div>

      {/* Options Body Container - CSS selector 2 */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6 overscroll-contain scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent hover:scrollbar-thumb-gray-300">
        
        {/* =========================================================================
            0. BASE HOUSE SELECTION (SHOP FROM BASE HOUSE)
           ========================================================================= */}
        {activeCategory === 'Base House' && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  1. Shop Base House Model
                </h3>
                <span className="text-[10px] font-bold text-orange-700 uppercase tracking-wider bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {availableModels.length} Public Footprints
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Select your foundational architectural footprint. Each base home includes a structural steel chassis, insulated wall panels, and pre-wired factory utilities.
              </p>
            </div>

            {/* Series Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'all', label: 'All Series' },
                { id: 'expandable', label: 'Expandable' },
                { id: 'apple-cabin', label: 'Apple Cabin' },
                { id: 'space-capsule', label: 'Space Capsule' },
                { id: 'folding', label: 'Folding / Fast Pack' },
              ].map((filter) => {
                const isSelected = modelSeriesFilter === filter.id;
                return (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setModelSeriesFilter(filter.id as any)}
                    className={`px-3 py-1.5 text-[11px] font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer shadow-2xs ${
                      isSelected
                        ? 'bg-gray-900 text-white shadow-xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>

            {/* Empty state if all models in series are hidden */}
            {filteredModels.length === 0 && (
              <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-2 font-bold text-sm">
                  !
                </div>
                <h4 className="text-xs font-bold text-gray-900">No Models Currently Available</h4>
                <p className="text-[11px] text-gray-500 mt-1 max-w-xs mx-auto">
                  Models in this series are currently not set to public. You can enable them in the Admin Dashboard.
                </p>
              </div>
            )}

            {/* Models Cards Grid */}
            <div className="grid grid-cols-1 gap-3.5">
              {filteredModels.map((model: any) => {
                const isSelected = state.modelId === model.id;
                return (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => {
                      if (onSelectModel) {
                        onSelectModel(model.id as HomeModelId);
                      }
                      onChange((prev) => ({
                        ...prev,
                        modelId: model.id as HomeModelId,
                      }));
                    }}
                    className={`text-left p-4 sm:p-4.5 rounded-2xl border transition-all relative flex flex-col gap-2.5 cursor-pointer active:scale-[0.99] ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50/40 shadow-sm ring-2 ring-orange-500/25'
                        : 'border-gray-200/90 hover:border-gray-300 hover:bg-gray-50/80 bg-white shadow-2xs'
                    }`}
                  >
                    {/* Top Row: Series Tag & Base Price */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono uppercase font-black tracking-wider text-orange-800 bg-orange-100 px-2 py-0.5 rounded">
                          {model.series ? model.series.toUpperCase() : 'PREFAB'}
                        </span>
                        <span className="text-xs font-black text-gray-950 truncate max-w-[210px]">
                          {model.name}
                        </span>
                        {isSelected && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Live in 3D
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm font-black font-mono text-gray-950">
                          {formatCurrency(model.basePrice * markupFactor, config.currency, { ratesMap: config.exchangeRates })}
                        </span>
                        {isSelected ? (
                          <div className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                            ✓
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-gray-300" />
                        )}
                      </div>
                    </div>

                    {/* Tagline */}
                    <p className="text-[11px] font-medium text-gray-600">
                      {model.tagline}
                    </p>

                    {/* Dimensions & Specs Badge Row */}
                    <div className="grid grid-cols-3 gap-2 bg-gray-50/90 p-2.5 rounded-xl border border-gray-100 text-[11px]">
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase font-bold block">Floor Area</span>
                        <span className="font-mono font-bold text-gray-900">{model.sqft} sq ft</span>
                        {model.areaM2 && <span className="text-[10px] text-gray-500 ml-1">({model.areaM2}m²)</span>}
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase font-bold block">Rooms</span>
                        <span className="font-bold text-gray-900">{model.bedrooms} Bed · {model.bathrooms} Bath</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase font-bold block">Lead Time</span>
                        <span className="font-mono text-orange-700 font-semibold">{model.leadTime}</span>
                      </div>
                    </div>

                    {/* Metric Dimension & Loading note */}
                    <div className="text-[10px] text-gray-500 font-mono flex items-center justify-between">
                      <span className="truncate">Span: {model.dimensions?.metricStr || `${model.dimensions?.lengthFt}ft × ${model.dimensions?.widthFt}ft`}</span>
                      {model.weightKg && <span className="shrink-0">{model.weightKg.toLocaleString()} kg</span>}
                    </div>

                    {/* Inclusions summary */}
                    {model.includedFeatures && (
                      <div className="pt-2 border-t border-gray-100 flex flex-wrap gap-1.5">
                        {model.includedFeatures.slice(0, 3).map((feat: string, idx: number) => (
                          <span key={idx} className="text-[10px] bg-white border border-gray-200 px-2 py-0.5 rounded text-gray-600 flex items-center gap-1 shadow-2xs">
                            <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span className="truncate max-w-[170px]">{feat}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            FLOOR PLAN SELECTION (20FT, 30FT & 40FT DOUBLE-WING EXPANDABLE EXCLUSIVE)
           ========================================================================= */}
        {activeCategory === 'Floor plan' && (
          <div className="space-y-4">
            {!isExpandableHouse ? (
              <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                  <LayoutGrid className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-950 text-sm">Double-Wing Expandable Exclusive Feature</h4>
                  <p className="text-xs text-gray-600 mt-1 max-w-sm mx-auto">
                    The Floor plan customization feature is exclusively engineered for the 10ft, 20ft, 30ft, and 40ft Double-Wing Expandable models.
                  </p>
                </div>
                <div className="flex flex-col gap-2 pt-2 max-w-xs mx-auto">
                  <button
                    type="button"
                    onClick={() => onSelectModel('expandable-10ft')}
                    className="w-full py-2 px-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    Switch to 10FT Double-Wing Expandable
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectModel('expandable-20ft')}
                    className="w-full py-2 px-3 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    Switch to 20FT Double-Wing Expandable
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectModel('expandable-30ft')}
                    className="w-full py-2 px-3 rounded-xl bg-white border border-gray-300 text-gray-800 text-xs font-bold hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Switch to 30FT Double-Wing Expandable
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectModel('expandable-40ft')}
                    className="w-full py-2 px-3 rounded-xl bg-white border border-gray-300 text-gray-800 text-xs font-bold hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Switch to 40FT Flagship Expandable
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Header / Intro */}
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                        Floor plan Customization
                      </h3>
                      <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                        Double-Wing Exclusive
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md font-mono">
                      {currentModel.name?.split(' ')[0] || '20FT'} Selected
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Customize your interior living layout. Engineered specifically for 20ft, 30ft, and 40ft double-wing expandable homes with factory-integrated utility risers, partition walls, and pre-fitted suites.
                  </p>
                </div>

                {/* Quick 3D Viewpoint Mode Bar */}
                <div className="bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 p-3 rounded-2xl text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                      <LayoutGrid className="w-4 h-4 text-blue-300" />
                    </div>
                    <div>
                      <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
                        <span>3D Interior Inspection Mode</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      </div>
                      <div className="text-[10px] text-blue-200/80">
                        Real-time top-down blueprint &amp; cutaway room viewer
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        if (onPerspectiveChange) onPerspectiveChange('top-down-floorplan');
                        if (!cutawayMode && onCutawayToggle) onCutawayToggle();
                        if (onRoofLiftChange) onRoofLiftChange(0);
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold flex items-center gap-1 transition-all shadow-xs cursor-pointer"
                      title="Switch to Top-Down 3D Blueprint View"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Top-Down View</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (onPerspectiveChange) onPerspectiveChange('sectional-cutaway');
                        if (!cutawayMode && onCutawayToggle) onCutawayToggle();
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer"
                      title="View Cross-Section Cutaway"
                    >
                      <Box className="w-3.5 h-3.5" />
                      <span>Cutaway</span>
                    </button>
                  </div>
                </div>

                {/* Model Footprint Selector Tabs */}
                <div className="bg-gray-50/80 p-2 rounded-2xl border border-gray-200/80 flex items-center justify-between gap-1 text-xs">
                  {[
                    { id: 'expandable-10ft', label: '10FT Micro', area: '18 m²' },
                    { id: 'expandable-20ft', label: '20FT Expandable', area: '38 m²' },
                    { id: 'expandable-30ft', label: '30FT Expandable', area: '58 m²' },
                    { id: 'expandable-40ft', label: '40FT Flagship', area: '75 m²' },
                  ].map((m) => {
                    const isCur = state.modelId === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => onSelectModel(m.id as any)}
                        className={`flex-1 py-1.5 px-2 rounded-xl text-center font-bold transition-all cursor-pointer ${
                          isCur
                            ? 'bg-white text-blue-900 shadow-xs border border-blue-200 ring-1 ring-blue-500/20'
                            : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
                        }`}
                      >
                        <div className="text-[11px] truncate">{m.label}</div>
                        <div className="text-[9px] font-normal text-gray-400">{m.area}</div>
                      </button>
                    );
                  })}
                </div>

                {state.modelId === 'expandable-10ft' ? (
                  /* -----------------------------------------------------------
                     10FT DOUBLE-WING EXPANDABLE: FIXED 1-BEDROOM ARCHITECTURE
                     Strictly 1-Bedroom (Users cannot configure multi-bedroom like 20/30/40ft).
                     Kitchenette is "L"-shaped and optional. Bathroom is optional.
                     ----------------------------------------------------------- */
                  <div className="flex flex-col gap-4">
                    {/* Architectural Fixed Floor Plan Card */}
                    <div className="p-4 rounded-2xl border-2 border-blue-500/40 bg-gradient-to-br from-blue-50/90 via-white to-indigo-50/60 shadow-xs flex flex-col gap-3 text-left">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-base font-extrabold text-gray-950 leading-tight">
                              10FT Dedicated 1-Bedroom Layout
                            </h4>
                            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-600 text-white shadow-2xs">
                              Fixed 1-Bedroom Architecture
                            </span>
                          </div>
                          <p className="text-xs text-blue-900/80 font-semibold mt-1">
                            Ultra-compact dual-wing footprint (18 m² / 195 sq ft) · Non-configurable bedroom count
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-bold font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                            Standard Included
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-600 leading-relaxed">
                        To maximize usable space and spatial flow within the 10ft micro footprint, this model is built exclusively as an open-concept <strong>1-Bedroom Suite</strong> with no interior dividing wall or door to the room. The room flows seamlessly into the central living space. The "L"-shaped kitchenette and central bathroom pod can be toggled on or off below.
                      </p>

                      {/* 10FT Architectural Floor Plan Diagram */}
                      <div className="relative group">
                        <FloorPlanDiagram
                          planId="10ft-1bed"
                          modelId="expandable-10ft"
                          modelName={currentModel?.name}
                          hasWardrobe={Boolean(state.hasWardrobe)}
                          hasKitchenette={Boolean(state.hasKitchenetteModule)}
                          hasBathPod={Boolean(state.hasLuxuryBathPod)}
                          hasTvConsole={Boolean(state.hasTvConsole)}
                          hasHvacMiniSplit={Boolean(state.hasHvacMiniSplit)}
                          showLabels={true}
                          className="w-full h-52 rounded-xl border border-amber-200/80 shadow-2xs"
                        />
                        {/* Interactive 3D Inspect Trigger */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onPerspectiveChange) onPerspectiveChange('top-down-floorplan');
                            if (!cutawayMode && onCutawayToggle) onCutawayToggle();
                          }}
                          className="absolute bottom-2.5 right-2.5 px-3 py-1.5 rounded-lg bg-gray-900/90 hover:bg-gray-900 text-white text-[11px] font-bold backdrop-blur-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-amber-300" />
                          <span>Inspect 10FT in 3D</span>
                        </button>
                      </div>

                      {/* Room Metrics & Specs */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-gray-200 text-gray-800 font-bold">
                          <Bed className="w-4 h-4 text-blue-600 shrink-0" />
                          <span className="truncate">1 Bedroom (Fixed)</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-gray-200 text-gray-800 font-bold">
                          <Bath className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="truncate">
                            {state.hasLuxuryBathPod ? '1 Restroom (Opt)' : 'No Restroom'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-gray-200 text-gray-800 font-bold">
                          <Utensils className="w-4 h-4 text-amber-600 shrink-0" />
                          <span className="truncate">
                            {state.hasKitchenetteModule ? '"L"-Kitchen (Opt)' : 'No Kitchen'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-gray-200 text-gray-800 font-bold">
                          <Maximize2 className="w-4 h-4 text-indigo-600 shrink-0" />
                          <span className="truncate">18 m² / 195 sq ft</span>
                        </div>
                      </div>
                    </div>

                    {/* Optional Modules Configuration (Kitchenette & Bathroom) */}
                    <div className="bg-gray-50/90 rounded-2xl border border-gray-200/90 p-4 flex flex-col gap-3 text-left">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-amber-600" />
                          <span>Optional Modules for 10FT Double-Wing</span>
                        </h4>
                        <span className="text-[10px] text-gray-500 font-medium">Click to include or remove</span>
                      </div>

                      {/* 1. Optional L-Shaped Kitchenette */}
                      <div className={`p-3.5 rounded-xl border transition-all ${
                        state.hasKitchenetteModule
                          ? 'bg-white border-amber-300 ring-1 ring-amber-400/30 shadow-xs'
                          : 'bg-white/60 border-gray-200 opacity-80'
                      }`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center text-lg shrink-0 mt-0.5">
                              🍳
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h5 className="text-xs font-extrabold text-gray-950">
                                  "L"-Shaped Gourmet Kitchenette
                                </h5>
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                  state.hasKitchenetteModule
                                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                    : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {state.hasKitchenetteModule ? 'Included (Optional)' : 'Removed (Open Space)'}
                                </span>
                              </div>
                              <p className="text-[11px] text-gray-600 mt-1 leading-snug">
                                Continuous "L"-shaped quartz countertop along the rear and left wall with undermount stainless steel sink, gooseneck faucet, and 2-burner ceramic induction cooktop.
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              onChange((prev) => ({
                                ...prev,
                                hasKitchenetteModule: !prev.hasKitchenetteModule,
                              }))
                            }
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all shrink-0 ${
                              state.hasKitchenetteModule
                                ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
                                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                            }`}
                          >
                            {state.hasKitchenetteModule ? '✓ Included (Remove)' : '+ Add Kitchenette'}
                          </button>
                        </div>
                      </div>

                      {/* 2. Optional Central Bathroom Pod */}
                      <div className={`p-3.5 rounded-xl border transition-all ${
                        state.hasLuxuryBathPod
                          ? 'bg-white border-emerald-300 ring-1 ring-emerald-400/30 shadow-xs'
                          : 'bg-white/60 border-gray-200 opacity-80'
                      }`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-lg shrink-0 mt-0.5">
                              🛁
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h5 className="text-xs font-extrabold text-gray-950">
                                  Integrated Central Bathroom Pod
                                </h5>
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                  state.hasLuxuryBathPod
                                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                    : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {state.hasLuxuryBathPod ? 'Included (Optional)' : 'Removed (Open Foyer)'}
                                </span>
                              </div>
                              <p className="text-[11px] text-gray-600 mt-1 leading-snug">
                                Factory pre-plumbed central sanitation module with modern ceramic toilet, vanity sink, backlit mirror, and rainfall shower. Can be omitted for office/studio use.
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              onChange((prev) => ({
                                ...prev,
                                hasLuxuryBathPod: !prev.hasLuxuryBathPod,
                              }))
                            }
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all shrink-0 ${
                              state.hasLuxuryBathPod
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                            }`}
                          >
                            {state.hasLuxuryBathPod ? '✓ Included (Remove)' : '+ Add Bath Pod'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Bedroom / Layout Filter Chips */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    { id: 'all', label: 'All Floor Plans (6)' },
                    { id: '1-bed', label: '1 Bedroom (2)' },
                    { id: '2-bed', label: '2 Bedrooms (1)' },
                    { id: '3-bed', label: '3 Bedrooms (2)' },
                    { id: '4-bed', label: '4 Bedrooms (1)' },
                  ].map((filter) => {
                    const isActive = floorPlanFilter === filter.id;
                    return (
                      <button
                        key={filter.id}
                        type="button"
                        onClick={() => setFloorPlanFilter(filter.id as any)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-gray-100 hover:bg-gray-200/80 text-gray-600'
                        }`}
                      >
                        {filter.label}
                      </button>
                    );
                  })}
                </div>

                {/* List of Floor Plans matching the attached factory blueprint catalog */}
                <div className="grid grid-cols-1 gap-4">
                  {filteredFloorPlans.map((plan) => {
                    const isSelected = (state.floorPlan || '2-bed-1-bath') === plan.id;
                    const bedroomMapping: Record<FloorPlanId, '1-bedroom' | '2-bedroom' | '3-bedroom' | '4-bedroom'> = {
                      '10ft-1bed': '1-bedroom',
                      '2-bed-1-bath': '2-bedroom',
                      '3-bed-split-1-bath': '3-bedroom',
                      '3-bed-kitchen-lounge': '3-bedroom',
                      '1-bed-grand-dining': '1-bedroom',
                      '1-bed-studio-suite': '1-bedroom',
                      '4-bed-quad-suite': '4-bedroom',
                    };

                    return (
                      <div
                        key={plan.id}
                        className={`p-3.5 sm:p-4 rounded-2xl border transition-all text-left relative flex flex-col gap-3 ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/25 shadow-md ring-2 ring-blue-500/20'
                            : 'border-gray-200/90 bg-white hover:border-blue-300 hover:shadow-xs'
                        }`}
                      >
                        {/* Top Row: Plan Name & Badge */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-extrabold text-gray-900 leading-tight">
                                {plan.name}
                              </h4>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                  isSelected
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                    : 'bg-blue-50 text-blue-800 border-blue-200'
                                }`}
                              >
                                {plan.badge}
                              </span>
                            </div>
                            <p className="text-xs text-blue-950/70 font-medium mt-0.5">
                              {plan.tagline}
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="text-xs font-bold font-mono text-gray-900">
                              {plan.price === 0
                                ? 'Standard Included'
                                : `+${formatCurrency(plan.price * markupFactor, config.currency, { ratesMap: config.exchangeRates })}`}
                            </div>
                            <div className="text-[10px] text-gray-400">
                              {plan.price === 0 ? 'No upgrade fee' : 'Factory partition setup'}
                            </div>
                          </div>
                        </div>

                        {/* Architectural Floor Plan SVG Diagram */}
                        <div className="relative group">
                          <FloorPlanDiagram
                            planId={plan.id}
                            modelId={state.modelId}
                            modelName={currentModel?.name}
                            hasWardrobe={Boolean(state.hasWardrobe)}
                            hasTvConsole={Boolean(state.hasTvConsole)}
                            hasHvacMiniSplit={Boolean(state.hasHvacMiniSplit)}
                            hasKitchenette={Boolean(state.hasKitchenetteModule)}
                            hasBathPod={Boolean(state.hasLuxuryBathPod)}
                            showLabels={true}
                            className="w-full h-48 rounded-xl border border-amber-200/60"
                          />
                          {/* Interactive 3D Inspect Trigger */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onChange((prev) => ({
                                ...prev,
                                floorPlan: plan.id,
                                bedroomLayout: bedroomMapping[plan.id],
                                hasLuxuryBathPod: true,
                                hasKitchenetteModule: plan.id !== '4-bed-quad-suite',
                              }));
                              if (onPerspectiveChange) onPerspectiveChange('top-down-floorplan');
                              if (!cutawayMode && onCutawayToggle) onCutawayToggle();
                            }}
                            className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-gray-900/85 hover:bg-gray-900 text-white text-[10px] font-bold backdrop-blur-xs flex items-center gap-1 transition-all shadow-xs cursor-pointer"
                          >
                            <Eye className="w-3 h-3 text-amber-300" />
                            <span>Inspect in 3D</span>
                          </button>
                        </div>

                        {/* Room Metrics & Icons */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px]">
                          <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-gray-50 border border-gray-100 text-gray-700 font-semibold">
                            <Bed className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span className="truncate">{plan.bedrooms} Bed{plan.bedrooms > 1 ? 's' : ''}</span>
                          </div>
                          <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-gray-50 border border-gray-100 text-gray-700 font-semibold">
                            <Bath className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate">1 Restroom</span>
                          </div>
                          <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-gray-50 border border-gray-100 text-gray-700 font-semibold">
                            <Tv className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                            <span className="truncate">{plan.livingRooms > 0 ? `${plan.livingRooms} Living` : 'Quad Enclosed'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-gray-50 border border-gray-100 text-gray-700 font-semibold">
                            <Utensils className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span className="truncate">
                              {plan.id === '4-bed-quad-suite'
                                ? 'Communal Hall'
                                : plan.id.includes('lounge')
                                ? 'Peninsula Bar'
                                : plan.id.includes('dining')
                                ? 'Banquet 8-Seat'
                                : 'Kitchenette'}
                            </span>
                          </div>
                        </div>

                        {/* Description & Recommended For */}
                        <div className="space-y-1.5 text-xs text-gray-600">
                          <p className="leading-relaxed">{plan.description}</p>
                          <div className="text-[11px] bg-blue-50/60 p-2 rounded-xl border border-blue-100/80 text-blue-950 flex items-start gap-1.5">
                            <Info className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                            <span><strong>Recommended:</strong> {plan.recommendedFor}</span>
                          </div>
                        </div>

                        {/* Architectural Feature Bullets */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1 border-t border-gray-100">
                          {plan.features.map((feat, fIdx) => (
                            <div key={fIdx} className="flex items-center gap-1.5 text-[11px] text-gray-600">
                              <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span className="truncate">{feat}</span>
                            </div>
                          ))}
                        </div>

                        {/* Bottom Action Selection Button */}
                        <button
                          type="button"
                          onClick={() => {
                            onChange((prev) => ({
                              ...prev,
                              floorPlan: plan.id,
                              bedroomLayout: bedroomMapping[plan.id],
                              hasLuxuryBathPod: true,
                              hasKitchenetteModule: plan.id !== '4-bed-quad-suite',
                            }));
                            if (onPerspectiveChange) onPerspectiveChange('top-down-floorplan');
                            if (!cutawayMode && onCutawayToggle) onCutawayToggle();
                          }}
                          className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-500/20'
                              : 'bg-gray-100 hover:bg-blue-50 text-gray-800 hover:text-blue-900 border border-gray-200 hover:border-blue-200'
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-white" />
                              <span>Selected Floor Plan Layout</span>
                            </>
                          ) : (
                            <>
                              <span>Apply This Floor Plan</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

                {/* Optional Modular Room Furnishings: Wardrobe Suite */}
                <div className="p-4 rounded-2xl border border-gray-200 bg-gradient-to-br from-amber-50/40 via-white to-orange-50/30 space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Box className="w-4 h-4 text-orange-600" />
                      <h4 className="text-xs font-bold text-gray-900">Optional Room Furnishings</h4>
                    </div>
                    <span className="text-[10px] font-bold text-orange-700 uppercase tracking-wider bg-orange-100/70 px-2 py-0.5 rounded-full border border-orange-200">
                      Modular Furniture
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Wardrobes are optional modular additions for the rooms. You can add or remove them freely like any other turnkey furniture.
                  </p>
                  {/* Optional Custom Wardrobe Suite */}
                  <label className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                    state.hasWardrobe 
                      ? 'border-orange-500 bg-orange-50/20 shadow-xs ring-1 ring-orange-500/20' 
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}>
                    <input 
                      type="checkbox"
                      checked={Boolean(state.hasWardrobe)}
                      onChange={(e) => onChange((prev) => ({ ...prev, hasWardrobe: e.target.checked }))}
                      className="mt-0.5 rounded border-gray-300 text-orange-600 focus:ring-orange-500 w-4 h-4 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-gray-900">Custom Fitted Bedroom Wardrobe Suite</span>
                        <span className="text-xs font-bold text-orange-600">
                          {formatCurrency(1250 * markupFactor, config.currency, { ratesMap: config.exchangeRates })}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                        Floor-to-ceiling multi-compartment wardrobes with integrated hanging rails, shelving, soft-close drawers, and interior LED lighting for private bedrooms.
                      </p>
                    </div>
                  </label>

                  {/* Optional Television & Media Console */}
                  <label className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                    state.hasTvConsole 
                      ? 'border-orange-500 bg-orange-50/20 shadow-xs ring-1 ring-orange-500/20' 
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}>
                    <input 
                      type="checkbox"
                      checked={Boolean(state.hasTvConsole)}
                      onChange={(e) => onChange((prev) => ({ ...prev, hasTvConsole: e.target.checked }))}
                      className="mt-0.5 rounded border-gray-300 text-orange-600 focus:ring-orange-500 w-4 h-4 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-gray-900">Television &amp; Floating Media Console</span>
                        <span className="text-xs font-bold text-orange-600">
                          {formatCurrency((state.modelId === 'expandable-40ft' ? 1350 : state.modelId === 'expandable-30ft' ? 1150 : 950) * markupFactor, config.currency, { ratesMap: config.exchangeRates })}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                        Wall-mounted 50&quot; 4K Smart TV paired with a minimalist floating timber entertainment console, acoustic wood slat accent, and concealed cable management.
                      </p>
                    </div>
                  </label>
                </div>
              </>
            )}
          </div>
        )}

        {/* =========================================================================
            1. WALL PANELS & CLADDING (OUTDOOR & INDOOR DUAL SCOPE)
           ========================================================================= */}
        {activeCategory === 'Wall Panels' && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  2. Wall Panels &amp; Finishes
                </h3>
                <span className="text-[10px] font-bold text-orange-700 uppercase tracking-wider bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                  Outdoor &amp; Indoor Selection
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Customize both the exterior facade cladding and interior wallboards. Choose outdoor weatherproof color steel or carved panels, and indoor bamboo-charcoal, acoustic wood slats, or UV marble.
              </p>
            </div>

            {/* Dual Scope Selector: Outdoor vs Indoor */}
            <div className="bg-gray-100/90 p-1.5 rounded-2xl flex items-center gap-1.5 border border-gray-200/90 shadow-2xs">
              <button
                type="button"
                onClick={() => {
                  setWallScope('exterior');
                  if (cutawayMode && onCutawayToggle) {
                    onCutawayToggle(false);
                  }
                  if (onPerspectiveChange) {
                    onPerspectiveChange('exterior-iso');
                  }
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer select-none active:scale-[0.98] ${
                  wallScope === 'exterior'
                    ? 'bg-white text-gray-950 shadow-sm border border-gray-300 ring-2 ring-black/5 font-extrabold'
                    : 'text-gray-600 hover:text-gray-950 hover:bg-white/60 font-semibold'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">🏡</span>
                  <span className="tracking-tight">Outdoor / Exterior</span>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold transition-all flex items-center gap-1 ${
                    wallScope === 'exterior'
                      ? 'bg-orange-600 text-white shadow-2xs border border-orange-700/30'
                      : 'bg-gray-200 text-gray-700 border border-gray-300/40'
                  }`}
                >
                  <span>{availableWallOptions.length}</span>
                  <span className="text-[9px] opacity-85">Finishes</span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setWallScope('interior');
                  if (!cutawayMode && onCutawayToggle) {
                    onCutawayToggle(true);
                  }
                  if (onPerspectiveChange) {
                    onPerspectiveChange('interior-walkthrough');
                  }
                  if (onRoofLiftChange) {
                    onRoofLiftChange(50);
                  }
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs transition-all duration-200 cursor-pointer select-none active:scale-[0.98] ${
                  wallScope === 'interior'
                    ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 text-white font-extrabold shadow-md shadow-amber-600/30 ring-2 ring-amber-400/60 border border-amber-300'
                    : 'bg-white hover:bg-amber-50/80 text-gray-800 hover:text-amber-950 font-bold border border-gray-200 hover:border-amber-300 shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {wallScope === 'interior' ? (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-200 opacity-80" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                    </span>
                  ) : (
                    <span className="text-sm">🛋️</span>
                  )}
                  <span className="tracking-tight">Indoor / Interior</span>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold transition-all flex items-center gap-1 ${
                    wallScope === 'interior'
                      ? 'bg-black/35 text-white border border-white/30 shadow-2xs backdrop-blur-xs'
                      : 'bg-amber-100/90 text-amber-900 border border-amber-200/80'
                  }`}
                >
                  <span>{availableInteriorWallOptions.length}</span>
                  <span className="text-[9px] opacity-85">Finishes</span>
                </span>
              </button>
            </div>

            {/* Current Active Pair Summary */}
            <div className="bg-[#FAF8F5] border border-orange-200/60 rounded-xl p-2.5 flex items-center justify-between text-[11px] shadow-2xs">
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-[10px] font-bold text-orange-800 uppercase tracking-wider bg-orange-100 px-1.5 py-0.2 rounded shrink-0">
                  {wallScope === 'exterior' ? 'Selected Exterior' : 'Selected Interior'}
                </span>
                <span className="font-bold text-gray-900 truncate">
                  {wallScope === 'exterior'
                    ? availableWallOptions.find((w: any) => w.id === state.wallCladding)?.name || 'Custom Finish'
                    : availableInteriorWallOptions.find((w: any) => w.id === state.interiorWall)?.name || 'Custom Wallboard'}
                </span>
              </div>
              <span className="text-[10px] font-mono text-gray-500 shrink-0 ml-2">
                Scope: {wallScope === 'exterior' ? 'Outside Facade' : 'Inside Rooms'}
              </span>
            </div>

            {/* =================================================================
                A. OUTDOOR / EXTERIOR WALL PANELS
               ================================================================= */}
            {wallScope === 'exterior' && (
              <div className="space-y-4">
                {/* Quick 12-Design Factory Catalog Swatch Grid */}
                <div className="bg-white border border-gray-200/90 rounded-2xl p-3.5 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-orange-600 animate-pulse" />
                      <span className="text-xs font-bold text-gray-950">
                        12 Official Factory Exterior Designs
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-orange-800 bg-orange-100/90 border border-orange-200 px-2 py-0.5 rounded-full">
                      Spec Sheet Catalog (12)
                    </span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {factory12WallOptions.map((opt: any) => {
                      const isCurrent = state.wallCladding === opt.id;
                      const englishName = opt.name.split(' (')[0];
                      const isWood = opt.id === 'wenge' || opt.id === 'big-eye-wood' || opt.id === 'pine-knot';
                      const isBrick = opt.id === 'multi-color-brick' || opt.id === 'golden-buff-brick' || opt.id === 'classic-red-brick' || opt.id === 'antique-blue-brick';
                      const isStone = opt.id === 'culture-stone' || opt.id === 'ancient-wall-grey';
                      const isGreen = opt.id === 'grass-green';

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => onChange((prev) => ({ ...prev, wallCladding: opt.id }))}
                          className={`group flex flex-col items-center gap-1.5 p-2.5 rounded-2xl border transition-all cursor-pointer select-none active:scale-[0.98] ${
                            isCurrent
                              ? 'bg-orange-50/50 border-orange-500 ring-2 ring-orange-500/25 shadow-xs'
                              : 'bg-white border-gray-200 hover:border-orange-300 hover:bg-orange-50/20 shadow-2xs'
                          }`}
                          title={`${englishName} — ${getItemPriceForModel(opt, state.modelId, config.models) === 0 ? 'Included' : formatCurrency(getItemPriceForModel(opt, state.modelId, config.models) * markupFactor, config.currency, { ratesMap: config.exchangeRates })}`}
                        >
                          <span
                            className="w-11 h-11 rounded-xl border border-black/15 shadow-2xs shrink-0 flex items-center justify-center relative overflow-hidden transition-transform group-hover:scale-105"
                            style={{ backgroundColor: opt.color || '#ccc' }}
                          >
                            {/* Realistic Simulated Visual Reliefs */}
                            {isWood && (
                              <div className="w-full h-full flex justify-between px-0.5 py-0.5 opacity-60">
                                <span className="w-1 h-full bg-black/25 rounded-xs" />
                                <span className="w-1 h-full bg-black/25 rounded-xs" />
                                <span className="w-1 h-full bg-black/25 rounded-xs" />
                              </div>
                            )}
                            {isBrick && (
                              <div className="absolute inset-0 opacity-40 bg-[repeating-linear-gradient(0deg,transparent,transparent_4px,rgba(0,0,0,0.3)_4px,rgba(0,0,0,0.3)_5px)]" />
                            )}
                            {isStone && (
                              <div className="absolute inset-0 opacity-45 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:4px_4px]" />
                            )}
                            {isGreen && (
                              <div className="absolute inset-0 opacity-30 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.6),transparent)]" />
                            )}
                            {isCurrent && (
                              <span className="text-xs font-black text-white z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                                ✓
                              </span>
                            )}
                          </span>
                          <span className="text-[11px] font-bold text-gray-900 truncate w-full text-center leading-tight tracking-tight">
                            {englishName}
                          </span>
                          <span
                            className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full transition-colors ${
                              isCurrent
                                ? 'bg-orange-600 text-white shadow-2xs'
                                : 'bg-gray-100 text-gray-600 group-hover:bg-orange-100/80 group-hover:text-orange-900'
                            }`}
                          >
                            {getItemPriceForModel(opt, state.modelId, config.models) === 0
                              ? 'Included'
                              : formatCurrency(getItemPriceForModel(opt, state.modelId, config.models) * markupFactor, config.currency, { showPlus: true, ratesMap: config.exchangeRates })}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sub-category Filter: Exterior */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    { id: 'all', label: 'All 12 Designs' },
                    { id: 'Factory 12 Catalog', label: '⭐ Factory 12 Catalog' },
                    { id: 'Wood Grain', label: '🪵 Timber Finishes' },
                    { id: 'Carved Masonry', label: '🏛️ Carved Slate' },
                    { id: 'Brick Masonry', label: '🧱 Brick & Stone' },
                    { id: 'Color Steel Plate', label: '⚡ Solid Color Steel' },
                    { id: 'Aerospace Shell', label: '🚀 Aerospace Shell' },
                  ].map((cat) => {
                    const isSelected = wallSubFilter === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setWallSubFilter(cat.id)}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                          isSelected
                            ? 'bg-black text-white shadow-xs'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>

                {/* Exterior Options Cards Grid */}
                <div className="grid grid-cols-1 gap-2.5">
                  {filteredWallOptions.map((opt: any) => {
                    const isSelected = state.wallCladding === opt.id;
                    const englishName = opt.name.split(' (')[0];
                    const chineseName = opt.name.includes('(') ? opt.name.match(/\((.*?)\)/)?.[1] : '';

                    return (
                      <button
                        key={opt.id}
                        onClick={() =>
                          onChange((prev) => ({ ...prev, wallCladding: opt.id }))
                        }
                        className={`text-left p-3.5 rounded-2xl border transition-all relative flex flex-col gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'border-orange-600 bg-orange-50/20 shadow-xs ring-1 ring-orange-500/20'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <span
                              className="w-8 h-8 rounded-lg border border-black/15 shrink-0 shadow-xs relative overflow-hidden flex items-center justify-center"
                              style={{ backgroundColor: opt.color || '#ccc' }}
                            >
                              {isSelected && (
                                <span className="text-[10px] text-white font-bold drop-shadow">✓</span>
                              )}
                            </span>
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-bold text-gray-900">
                                  {englishName}
                                </span>
                                {opt.badge && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-gray-100 text-gray-700">
                                    {opt.badge}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-gray-400 font-medium">
                                {opt.category}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold font-mono text-gray-900">
                              {getItemPriceForModel(opt, state.modelId, config.models) === 0 ? 'Included' : formatCurrency(getItemPriceForModel(opt, state.modelId, config.models) * markupFactor, config.currency, { showPlus: true, ratesMap: config.exchangeRates })}
                            </span>
                            {isSelected ? (
                              <div className="w-5 h-5 rounded-full bg-orange-600 flex items-center justify-center shrink-0">
                                <span className="text-[10px] text-white font-bold">✓</span>
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-full border border-gray-300 shrink-0" />
                            )}
                          </div>
                        </div>

                        <p className="text-[11px] text-gray-500 leading-relaxed pl-10.5">
                          {opt.description}
                        </p>

                        {opt.specDetail && (
                          <div className="ml-10.5 mt-0.5 text-[10px] text-gray-600 font-mono bg-orange-50/80 border border-orange-200/60 px-2 py-0.5 rounded-md inline-block w-fit">
                            Spec: {opt.specDetail}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* =================================================================
                B. INDOOR / INTERIOR WALL PANELS & FINISHES (6 COLLECTIONS)
               ================================================================= */}
            {wallScope === 'interior' && (
              <div className="space-y-4">
                {/* 6 Collections Catalog Header Card */}
                <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-950 text-white p-3.5 rounded-2xl shadow-sm border border-amber-700/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-black uppercase tracking-[0.2em] text-amber-200">
                        Architectural Interior Wall Collections
                      </div>
                      <h4 className="text-sm font-black tracking-tight text-white mt-0.5">
                        6 Collections • Multiple Finishes • Unlimited Inspiration
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (!cutawayMode && onCutawayToggle) {
                          onCutawayToggle(true);
                        }
                        if (onPerspectiveChange) {
                          onPerspectiveChange('interior-walkthrough');
                        }
                        if (onRoofLiftChange) {
                          onRoofLiftChange(60);
                        }
                      }}
                      className="px-2.5 py-1.5 bg-white/15 hover:bg-white/25 border border-white/25 rounded-xl text-[10px] font-bold text-white flex items-center gap-1 shadow-2xs transition-colors cursor-pointer shrink-0"
                    >
                      <Eye className="w-3 h-3 text-amber-300" />
                      <span>View Inside 3D</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-amber-100/80 leading-relaxed">
                    Select from 24 premium wall finishes spanning organic wood grain, acoustic tactile fabrics, sleek architectural metals, bold natural marbles, high-specular mirrors, and fluid water ripples.
                  </p>
                </div>

                {/* 6 Collection Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    { id: 'all', label: `All Finishes (${availableInteriorWallOptions.length})` },
                    { id: 'Wood Grain', label: '🪵 Wood Grain (4)' },
                    { id: 'Fabric', label: '🧶 Fabric (4)' },
                    { id: 'Metal', label: '⚡ Metal (4)' },
                    { id: 'Marble/Rock', label: '🏛️ Marble/Rock (4)' },
                    { id: 'Mirror', label: '🪞 Mirror (4)' },
                    { id: 'Water Ripple', label: '💧 Water Ripple (4)' },
                  ].map((cat) => {
                    const isSelected = interiorWallSubFilter === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setInteriorWallSubFilter(cat.id)}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                          isSelected
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>

                {/* Quick Swatch Grid for Interior Wallboards */}
                <div className="bg-white border border-gray-200/90 rounded-2xl p-3.5 space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
                      <span className="text-xs font-bold text-gray-900">
                        {interiorWallSubFilter === 'all'
                          ? '24 Interior Finishes Palette'
                          : `${interiorWallSubFilter} Palette`}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-100/90 border border-amber-200 px-2 py-0.5 rounded-full">
                      {availableInteriorWallOptions.find((w: any) => w.id === state.interiorWall)?.name || 'Custom Finish'}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {filteredInteriorWallOptions.map((opt: any) => {
                      const isCurrent = state.interiorWall === opt.id;
                      const isWood = opt.category === 'Wood Grain';
                      const isFabric = opt.category === 'Fabric';
                      const isMetal = opt.category === 'Metal';
                      const isMarble = opt.category === 'Marble/Rock';
                      const isMirror = opt.category === 'Mirror';
                      const isRipple = opt.category === 'Water Ripple';

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => onChange((prev) => ({ ...prev, interiorWall: opt.id }))}
                          className={`group flex flex-col items-center gap-1 p-1.5 rounded-xl border transition-all cursor-pointer ${
                            isCurrent
                              ? 'bg-white border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                              : 'bg-white/80 border-gray-200 hover:border-gray-300 hover:bg-white'
                          }`}
                          title={`${opt.name} — ${getItemPriceForModel(opt, state.modelId, config.models) === 0 ? 'Included' : formatCurrency(getItemPriceForModel(opt, state.modelId, config.models) * markupFactor, config.currency, { ratesMap: config.exchangeRates })}`}
                        >
                          <span
                            className="w-8 h-8 rounded-lg border border-black/15 shadow-2xs shrink-0 flex items-center justify-center relative overflow-hidden transition-transform group-hover:scale-105"
                            style={{ backgroundColor: opt.color || '#f8fafc' }}
                          >
                            {/* Realistic Simulated Visual Reliefs */}
                            {isWood && (
                              <div className="w-full h-full flex justify-between px-0.5 py-0.2 opacity-70">
                                <span className="w-1 h-full bg-black/25 rounded-xs" />
                                <span className="w-1 h-full bg-black/25 rounded-xs" />
                                <span className="w-1 h-full bg-black/25 rounded-xs" />
                              </div>
                            )}
                            {isFabric && (
                              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:3px_3px]" />
                            )}
                            {isMetal && (
                              <div className="absolute inset-0 opacity-40 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.6),transparent)]" />
                            )}
                            {isMarble && (
                              <div className="absolute inset-0 opacity-45 bg-[radial-gradient(#5a626d_1px,transparent_1px)] [background-size:4px_4px]" />
                            )}
                            {isMirror && (
                              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/70 to-transparent opacity-80" />
                            )}
                            {isRipple && (
                              <div className="absolute inset-0 opacity-50 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.8),transparent)]" />
                            )}
                            {isCurrent && (
                              <span className="text-xs font-black text-amber-950 z-10 drop-shadow-[0_1px_1px_rgba(255,255,255,0.95)]">
                                ✓
                              </span>
                            )}
                          </span>
                          <span className="text-[9px] font-bold text-gray-700 truncate w-full text-center leading-tight">
                            {opt.name.split(' ').slice(0, 2).join(' ')}
                          </span>
                          <span className="text-[8px] font-medium text-gray-400 truncate w-full text-center">
                            {opt.category}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Interior Options Cards Grid */}
                <div className="grid grid-cols-1 gap-2.5">
                  {filteredInteriorWallOptions.map((opt: any) => {
                    const isSelected = state.interiorWall === opt.id;
                    const isWood = opt.category === 'Wood Grain';
                    const isFabric = opt.category === 'Fabric';
                    const isMetal = opt.category === 'Metal';
                    const isMarble = opt.category === 'Marble/Rock';
                    const isMirror = opt.category === 'Mirror';
                    const isRipple = opt.category === 'Water Ripple';

                    return (
                      <button
                        key={opt.id}
                        onClick={() =>
                          onChange((prev) => ({ ...prev, interiorWall: opt.id }))
                        }
                        className={`text-left p-3.5 rounded-2xl border transition-all relative flex flex-col gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'border-amber-600 bg-amber-50/25 shadow-xs ring-1 ring-amber-500/20'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <span
                              className="w-8 h-8 rounded-lg border border-black/15 shrink-0 shadow-xs relative overflow-hidden flex items-center justify-center"
                              style={{ backgroundColor: opt.color || '#f8fafc' }}
                            >
                              {isWood && (
                                <div className="w-full h-full flex justify-between px-0.5 py-0.2 opacity-70">
                                  <span className="w-1 h-full bg-black/30 rounded-xs" />
                                  <span className="w-1 h-full bg-black/30 rounded-xs" />
                                  <span className="w-1 h-full bg-black/30 rounded-xs" />
                                </div>
                              )}
                              {isFabric && (
                                <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:3px_3px]" />
                              )}
                              {isMetal && (
                                <div className="absolute inset-0 opacity-40 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.6),transparent)]" />
                              )}
                              {isMarble && (
                                <div className="absolute inset-0 opacity-45 bg-[radial-gradient(#5a626d_1px,transparent_1px)] [background-size:4px_4px]" />
                              )}
                              {isMirror && (
                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/70 to-transparent opacity-80" />
                              )}
                              {isRipple && (
                                <div className="absolute inset-0 opacity-50 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.8),transparent)]" />
                              )}
                            </span>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-gray-900">
                                  {opt.name}
                                </span>
                                {opt.badge && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200/60">
                                    {opt.badge}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-gray-400 font-medium">
                                {opt.category} Collection
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold font-mono text-gray-900">
                              {opt.price === 0 ? 'Included' : formatCurrency(opt.price * markupFactor, config.currency, { showPlus: true, ratesMap: config.exchangeRates })}
                            </span>
                            {isSelected ? (
                              <div className="w-5 h-5 rounded-full bg-amber-600 flex items-center justify-center shrink-0">
                                <span className="text-[10px] text-white font-bold">✓</span>
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-full border border-gray-300 shrink-0" />
                            )}
                          </div>
                        </div>

                        <p className="text-[11px] text-gray-500 leading-relaxed pl-10">
                          {opt.description}
                        </p>

                        {opt.specDetail && (
                          <div className="ml-10 mt-0.5 text-[10px] text-gray-600 font-mono bg-amber-50/80 border border-amber-200/60 px-2 py-0.5 rounded-md inline-block w-fit">
                            Spec: {opt.specDetail}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            2. GLAZING, DOORS & WINDOWS (Catalog Page)
           ========================================================================= */}
        {(activeCategory === 'Glazing & Windows' || activeCategory === 'Doors & Windows') && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  3. Windows &amp; Doors Customization
                </h3>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Included at $0
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                The standard house includes an entrance door and perimeter windows. You have full freedom to select any door or window style at no additional cost ($0).
              </p>
            </div>

            {/* Sub-category Filter: Windows vs Entrance Doors */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'all', label: 'All Options' },
                { id: 'Windows', label: 'Windows (4)' },
                { id: 'Entrance Doors', label: 'Entrance Doors (5)' },
              ].map((cat) => {
                const isSelected = glazingSubFilter === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setGlazingSubFilter(cat.id as any)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                      isSelected
                        ? 'bg-black text-white shadow-xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Front Facade Inspection Banner */}
            <div className="bg-orange-50/90 border border-orange-200/90 p-2.5 rounded-2xl flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center text-sm shadow-xs font-bold">
                  🚪
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Front Facade Eye-Level Inspection</p>
                  <p className="text-[10px] text-gray-500">Camera frames the entrance door and wing windows up close</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (onPerspectiveChange) {
                    onPerspectiveChange('front-elevation');
                  }
                }}
                className="px-2.5 py-1.5 rounded-lg bg-black hover:bg-gray-800 text-white text-[11px] font-bold shadow-xs transition-colors shrink-0 cursor-pointer"
              >
                Focus View
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {filteredGlazingOptions.map((opt: any) => {
                const isSelected = state.glazing === opt.id;
                const isWindow = opt.category === 'Windows';
                return (
                  <button
                    key={opt.id}
                    onClick={() =>
                      onChange((prev) => ({ ...prev, glazing: opt.id }))
                    }
                    className={`text-left p-3 rounded-2xl border transition-all relative flex flex-col gap-2 cursor-pointer ${
                      isSelected
                        ? 'border-orange-600 bg-orange-50/20 shadow-xs ring-1 ring-orange-500/20'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 bg-white'
                    }`}
                  >
                    <div className="flex gap-3 items-center">
                      {/* Architectural Vector Diagram Thumbnail */}
                      <div className="w-20 h-16 rounded-xl bg-slate-50 border border-gray-200/90 shrink-0 overflow-hidden p-1 shadow-2xs flex items-center justify-center">
                        <DoorWindowDiagram id={opt.id} />
                      </div>

                      {/* Content & Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                            {opt.color && (
                              <span
                                className="w-3 h-3 rounded-full border border-gray-300 shrink-0 shadow-2xs"
                                style={{ backgroundColor: opt.color }}
                                title={opt.color === '#f8fafc' ? 'White finish' : 'Architectural black finish'}
                              />
                            )}
                            <span className="text-xs font-bold text-gray-900 truncate">
                              {opt.name}
                            </span>
                            {opt.badge && (
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap ${
                                  opt.badge.includes('White')
                                    ? 'bg-gray-100 text-gray-800 border border-gray-200'
                                    : 'bg-zinc-900 text-white shadow-2xs'
                                }`}
                              >
                                {opt.badge}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-xs font-bold font-mono text-gray-900">
                              {opt.price === 0 ? 'Included' : formatCurrency(opt.price * markupFactor, config.currency, { showPlus: true, ratesMap: config.exchangeRates })}
                            </span>
                            {isSelected ? (
                              <div className="w-5 h-5 rounded-full bg-orange-600 flex items-center justify-center shrink-0">
                                <span className="text-[10px] text-white font-bold">✓</span>
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-full border border-gray-300 shrink-0" />
                            )}
                          </div>
                        </div>

                        <p className="text-[11px] text-gray-500 leading-snug mt-1 line-clamp-2">
                          {opt.description}
                        </p>
                      </div>
                    </div>

                    {opt.specDetail && (
                      <div className="text-[10px] text-gray-500 font-mono bg-gray-100/90 px-2 py-0.5 rounded-md w-fit max-w-full truncate">
                        Tech Spec: {opt.specDetail}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            3. FLOORING COLLECTIONS (Catalog Page 26) - 6 Collections, 24 Finishes
           ========================================================================= */}
        {activeCategory === 'Flooring' && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  4. Flooring Material Collections
                </h3>
                <span className="text-[10px] font-bold text-orange-700 uppercase tracking-wider bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                  6 Collections · 24 Finishes
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Select from 6 architectural floor collections: Wood Grain, Stone Grain, Marble Grain, Solid Color, Cement Look, and Patterned Parquet.
              </p>
            </div>

            {/* Quick Double-Wing Expandable House Size Matrix (20FT, 30FT, 40FT) */}
            <div className="p-3 bg-gradient-to-br from-orange-50/70 via-amber-50/40 to-white rounded-2xl border border-orange-200/90 shadow-2xs">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-orange-600 animate-pulse" />
                  <span className="text-[11px] font-black text-orange-950 uppercase tracking-wider">
                    Double-Wing Expandable House Floor Size
                  </span>
                </div>
                <span className="text-[10px] font-bold text-orange-800 bg-white/90 px-2 py-0.5 rounded-full border border-orange-200 font-mono">
                  {state.modelId === 'expandable-10ft'
                    ? '18 m² · 195 sq ft'
                    : state.modelId === 'expandable-20ft'
                    ? '38 m² · 409 sq ft'
                    : state.modelId === 'expandable-30ft'
                    ? '58 m² · 624 sq ft'
                    : state.modelId === 'expandable-40ft'
                    ? '75 m² · 807 sq ft'
                    : 'Expandable Option'}
                </span>
              </div>
              <p className="text-[11px] text-gray-600 mb-2 leading-relaxed">
                Seamlessly preview and select floor types across the 10ft, 20ft, 30ft, and 40ft expandable living layouts:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {[
                  {
                    id: 'expandable-10ft',
                    label: '10FT Micro',
                    dim: '3.1m × 5.9m',
                    area: '18 m² (195 sq ft)',
                  },
                  {
                    id: 'expandable-20ft',
                    label: '20FT Expandable',
                    dim: '6.4m × 5.9m',
                    area: '38 m² (409 sq ft)',
                  },
                  {
                    id: 'expandable-30ft',
                    label: '30FT Expandable',
                    dim: '9.0m × 6.4m',
                    area: '58 m² (624 sq ft)',
                  },
                  {
                    id: 'expandable-40ft',
                    label: '40FT Flagship',
                    dim: '11.8m × 6.4m',
                    area: '75 m² (807 sq ft)',
                  },
                ].map((sizeOpt) => {
                  const isCurrent = state.modelId === sizeOpt.id;
                  return (
                    <button
                      key={sizeOpt.id}
                      type="button"
                      onClick={() =>
                        onChange((prev) => ({
                          ...prev,
                          modelId: sizeOpt.id as any,
                        }))
                      }
                      className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-orange-600 text-white border-orange-700 shadow-xs'
                          : 'bg-white hover:bg-orange-50/70 text-gray-800 border-orange-200/70'
                      }`}
                    >
                      <div className="text-[11px] font-black truncate">
                        {sizeOpt.label}
                      </div>
                      <div
                        className={`text-[9px] font-medium truncate ${
                          isCurrent ? 'text-orange-100' : 'text-gray-500'
                        }`}
                      >
                        {sizeOpt.dim}
                      </div>
                      <div
                        className={`text-[9px] font-bold font-mono truncate ${
                          isCurrent ? 'text-white' : 'text-orange-700'
                        }`}
                      >
                        {sizeOpt.area}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sub-Collection Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'all', label: `All Finishes (${availableFlooringOptions.length})` },
                { id: 'Wood Grain', label: '🪵 Wood Grain (4)' },
                { id: 'Stone Grain', label: '🪨 Stone Grain (4)' },
                { id: 'Marble Grain', label: '🏛️ Marble Grain (4)' },
                { id: 'Solid Color', label: '🎨 Solid Color (4)' },
                { id: 'Cement Look', label: '🏗️ Cement Look (4)' },
                { id: 'Patterned', label: '✨ Patterned Parquet (4)' },
              ].map((cat) => {
                const isSelected = flooringSubFilter === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFlooringSubFilter(cat.id)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                      isSelected
                        ? 'bg-black text-white shadow-xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Visual Swatch Matrix for Fast 1-Click Selection */}
            <div className="p-2.5 bg-gray-50/90 rounded-2xl border border-gray-200/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">
                  Quick Palette Swatches ({filteredFlooringOptions.length})
                </span>
                <span className="text-[10px] text-gray-500">
                  Tap to preview in 3D
                </span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {filteredFlooringOptions.map((opt: any) => {
                  const isSelected = state.flooring === opt.id;
                  const isWood = opt.category === 'Wood Grain';
                  const isStone = opt.category === 'Stone Grain';
                  const isMarble = opt.category === 'Marble Grain';
                  const isCement = opt.category === 'Cement Look';
                  const isPatterned = opt.category === 'Patterned';

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() =>
                        onChange((prev) => ({ ...prev, flooring: opt.id }))
                      }
                      title={`${opt.name} (${opt.category || 'Floor'})`}
                      className={`group relative flex flex-col items-center gap-1 p-1.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-orange-600 bg-orange-50 ring-2 ring-orange-500/30 shadow-xs'
                          : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <span
                        className="w-8 h-8 rounded-lg border border-black/15 shadow-2xs shrink-0 flex items-center justify-center relative overflow-hidden transition-transform group-hover:scale-105"
                        style={{ backgroundColor: opt.color || '#ccc' }}
                      >
                        {isWood && (
                          <div className="w-full h-full flex justify-between px-0.5 py-0.5 opacity-40">
                            <span className="w-0.5 h-full bg-black/35 rounded-xs" />
                            <span className="w-0.5 h-full bg-black/35 rounded-xs" />
                            <span className="w-0.5 h-full bg-black/35 rounded-xs" />
                          </div>
                        )}
                        {isStone && (
                          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:3px_3px]" />
                        )}
                        {isMarble && (
                          <div className="absolute inset-0 opacity-35 bg-[linear-gradient(45deg,transparent_40%,rgba(0,0,0,0.3)_45%,transparent_50%)]" />
                        )}
                        {isCement && (
                          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:2px_2px]" />
                        )}
                        {isPatterned && (
                          <div className="absolute inset-0 opacity-40 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,rgba(0,0,0,0.35)_2px,rgba(0,0,0,0.35)_4px)]" />
                        )}
                        {isSelected && (
                          <span className="text-[10px] font-black text-white z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                            ✓
                          </span>
                        )}
                      </span>
                      <span className="text-[9px] font-bold text-gray-800 truncate w-full text-center leading-tight">
                        {opt.name.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Detailed Floor List Cards */}
            <div className="grid grid-cols-1 gap-2.5">
              {filteredFlooringOptions.map((opt: any) => {
                const isSelected = state.flooring === opt.id;
                const isWood = opt.category === 'Wood Grain';
                const isStone = opt.category === 'Stone Grain';
                const isMarble = opt.category === 'Marble Grain';
                const isCement = opt.category === 'Cement Look';
                const isPatterned = opt.category === 'Patterned';

                return (
                  <button
                    key={opt.id}
                    onClick={() =>
                      onChange((prev) => ({ ...prev, flooring: opt.id }))
                    }
                    className={`text-left p-3.5 rounded-2xl border transition-all relative flex flex-col gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'border-orange-600 bg-orange-50/20 shadow-xs ring-1 ring-orange-500/20'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="w-7 h-7 rounded-lg border border-black/15 shrink-0 shadow-2xs relative overflow-hidden flex items-center justify-center"
                          style={{ backgroundColor: opt.color || '#d1d5db' }}
                        >
                          {isWood && (
                            <div className="w-full h-full flex justify-between px-0.5 py-0.5 opacity-40">
                              <span className="w-0.5 h-full bg-black/35 rounded-xs" />
                              <span className="w-0.5 h-full bg-black/35 rounded-xs" />
                              <span className="w-0.5 h-full bg-black/35 rounded-xs" />
                            </div>
                          )}
                          {isStone && (
                            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:3px_3px]" />
                          )}
                          {isMarble && (
                            <div className="absolute inset-0 opacity-35 bg-[linear-gradient(45deg,transparent_40%,rgba(0,0,0,0.3)_45%,transparent_50%)]" />
                          )}
                          {isCement && (
                            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:2px_2px]" />
                          )}
                          {isPatterned && (
                            <div className="absolute inset-0 opacity-40 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,rgba(0,0,0,0.35)_2px,rgba(0,0,0,0.35)_4px)]" />
                          )}
                          {isSelected && (
                            <span className="text-[10px] font-black text-white z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                              ✓
                            </span>
                          )}
                        </span>
                        <div className="min-w-0">
                          <span className="text-xs font-black text-gray-900 truncate block">
                            {opt.name}
                          </span>
                          {opt.category && (
                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                              Collection: {opt.category}
                            </span>
                          )}
                        </div>
                        {opt.badge && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-600 shrink-0 hidden sm:inline">
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-bold font-mono text-gray-900">
                          {opt.price === 0
                            ? 'Included'
                            : formatCurrency(opt.price * markupFactor, config.currency, {
                                showPlus: true,
                                ratesMap: config.exchangeRates,
                              })}
                        </span>
                        {isSelected ? (
                          <div className="w-5 h-5 rounded-full bg-orange-600 flex items-center justify-center shrink-0">
                            <span className="text-[10px] text-white font-bold">✓</span>
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-gray-300 shrink-0" />
                        )}
                      </div>
                    </div>

                    <p className="text-[11px] text-gray-500 leading-relaxed pl-8">
                      {opt.description}
                    </p>

                    {opt.specDetail && (
                      <div className="ml-8 mt-0.5 text-[10px] text-gray-500 font-mono bg-gray-100/90 px-2 py-0.5 rounded-md inline-block w-fit">
                        Tech Spec: {opt.specDetail}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            4. ROOFS, TERRACES & SOLAR (Page 29, 38)
           ========================================================================= */}
        {activeCategory === 'Roof & Energy' && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  5. Roof Architecture &amp; Terraces
                </h3>
                <span className="text-[10px] font-bold text-orange-700 uppercase tracking-wider bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                  Page 29 Outdoor Living
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Customize between flat parapet, pitched gable roof (fast runoff), or a full walkable rooftop observation terrace with external staircase.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {availableRoofOptions.map((opt: any) => {
                const isSelected = state.roofOption === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() =>
                      onChange((prev) => ({ ...prev, roofOption: opt.id }))
                    }
                    className={`text-left p-3.5 rounded-2xl border transition-all relative flex flex-col gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'border-orange-600 bg-orange-50/20 shadow-xs ring-1 ring-orange-500/20'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-900">
                          {opt.name}
                        </span>
                        {opt.badge && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-700">
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono text-gray-900">
                          {getItemPriceForModel(opt, state.modelId, config.models) === 0
                            ? 'Included'
                            : formatCurrency(getItemPriceForModel(opt, state.modelId, config.models) * markupFactor, config.currency, { showPlus: true, ratesMap: config.exchangeRates })}
                        </span>
                        {isSelected ? (
                          <div className="w-5 h-5 rounded-full bg-orange-600 flex items-center justify-center shrink-0">
                            <span className="text-[10px] text-white font-bold">✓</span>
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-gray-300 shrink-0" />
                        )}
                      </div>
                    </div>

                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      {opt.description}
                    </p>

                    {opt.specDetail && (
                      <div className="mt-0.5 text-[10px] text-gray-500 font-mono bg-gray-100/90 px-2 py-0.5 rounded-md inline-block w-fit">
                        Tech Spec: {opt.specDetail}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            5. MODULAR ADD-ONS & ACCESSORIES (Page 28, 44, 70)
           ========================================================================= */}
        {(activeCategory === 'Add-ons' || activeCategory === 'Interior Modules' || activeCategory === 'Smart Living') && (
          <div className="space-y-4">
            {/* Header with Title and Dashboard Link */}
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-600 animate-pulse" />
                  <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em]">
                    6. Add-ons &amp; Modular Accessories
                  </h3>
                </div>
                <a
                  href="/dashboard?tab=addons"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-[11px] font-bold text-orange-800 border border-orange-200 transition-colors shadow-2xs group"
                  title="Manage add-on prices, specs, and availability in the Admin Dashboard"
                >
                  <Sliders className="w-3.5 h-3.5 text-orange-600 group-hover:rotate-45 transition-transform" />
                  <span className="hidden sm:inline">Manage in Dashboard</span>
                  <span className="sm:hidden">Dashboard</span>
                  <ExternalLink className="w-3 h-3 text-orange-400" />
                </a>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Configure turnkey modular kits, HVAC mini-split climate systems, living pods, patio pergola decks, and smart living packages.
              </p>
            </div>

            {/* Quick Status Bar */}
            <div className="bg-[#FAF8F5] border border-orange-200/60 rounded-2xl p-3 flex items-center justify-between text-xs shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-bold text-gray-900">
                  {activeAddonsCount} of {availableAddons.length} Add-ons Selected
                </span>
              </div>
              <span className="text-[11px] font-mono text-gray-500">
                Turnkey Modular Factory Add-ons
              </span>
            </div>

            {/* Standard Core Modules (Bath Pod & Kitchenette) Management */}
            <div className="bg-gradient-to-br from-emerald-50/70 via-white to-blue-50/60 border border-emerald-200/90 rounded-2xl p-3.5 sm:p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">🛁🍳</span>
                  <div>
                    <h4 className="text-xs font-black text-gray-950 uppercase tracking-wider flex items-center gap-2">
                      <span>Standard Core Modules (20ft, 30ft, 40ft)</span>
                      <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded border border-emerald-200">
                        Default On
                      </span>
                    </h4>
                    <p className="text-[11px] text-gray-500">
                      Added on starting by default. You can remove each if you prefer an open, unpartitioned shell.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded-full border border-emerald-200 text-emerald-900 shadow-2xs">
                  {Number(Boolean(state.hasLuxuryBathPod)) + Number(Boolean(state.hasKitchenetteModule))}/2 Included
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Bath Pod Toggle */}
                <div className={`p-3 rounded-xl border transition-all flex flex-col justify-between gap-2 ${
                  state.hasLuxuryBathPod
                    ? 'bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-400/30'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🛁</span>
                      <div>
                        <div className="text-xs font-bold text-gray-950 flex items-center gap-1.5">
                          <span>Luxury Bath Pod</span>
                          {state.hasLuxuryBathPod && (
                            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                              Included
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-500">Glass shower, porcelain toilet &amp; vanity</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-gray-100">
                    <span className="text-xs font-bold font-mono text-gray-900">
                      {formatCurrency(
                        getItemPriceForModel(
                          availableAddons.find((a: any) => a.id === 'hasLuxuryBathPod') || { price: 7800 },
                          state.modelId,
                          config.models
                        ) * markupFactor,
                        config.currency,
                        { showPlus: true, ratesMap: config.exchangeRates }
                      )}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {onPerspectiveChange && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onPerspectiveChange('interior-walkthrough');
                          }}
                          className="text-[10px] font-bold px-2 py-1 rounded-md bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 cursor-pointer"
                          title="Focus 3D camera on interior walkthrough"
                        >
                          👁️ 3D
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          onChange((prev) => ({
                            ...prev,
                            hasLuxuryBathPod: !prev.hasLuxuryBathPod,
                          }))
                        }
                        className={`text-[10px] font-black px-2.5 py-1 rounded-lg cursor-pointer transition-all ${
                          state.hasLuxuryBathPod
                            ? 'bg-emerald-600 hover:bg-red-600 text-white shadow-2xs'
                            : 'bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-gray-700 border border-gray-200'
                        }`}
                        title={state.hasLuxuryBathPod ? 'Click to remove the Bath Pod from the house' : 'Click to add the Bath Pod back'}
                      >
                        {state.hasLuxuryBathPod ? '✓ Included (Remove)' : '+ Add Bath Pod'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Kitchenette Toggle */}
                <div className={`p-3 rounded-xl border transition-all flex flex-col justify-between gap-2 ${
                  state.hasKitchenetteModule
                    ? 'bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-400/30'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🍳</span>
                      <div>
                        <div className="text-xs font-bold text-gray-950 flex items-center gap-1.5">
                          <span>Modular Kitchenette</span>
                          {state.hasKitchenetteModule && (
                            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                              Included
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-500">Quartz counter, induction cooktop &amp; sink</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-gray-100">
                    <span className="text-xs font-bold font-mono text-gray-900">
                      {formatCurrency(
                        getItemPriceForModel(
                          availableAddons.find((a: any) => a.id === 'hasKitchenetteModule') || { price: 4800 },
                          state.modelId,
                          config.models
                        ) * markupFactor,
                        config.currency,
                        { showPlus: true, ratesMap: config.exchangeRates }
                      )}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {onPerspectiveChange && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onPerspectiveChange('living-lounge');
                          }}
                          className="text-[10px] font-bold px-2 py-1 rounded-md bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 cursor-pointer"
                          title="Focus 3D camera on living lounge & kitchenette"
                        >
                          👁️ 3D
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          onChange((prev) => ({
                            ...prev,
                            hasKitchenetteModule: !prev.hasKitchenetteModule,
                          }))
                        }
                        className={`text-[10px] font-black px-2.5 py-1 rounded-lg cursor-pointer transition-all ${
                          state.hasKitchenetteModule
                            ? 'bg-emerald-600 hover:bg-red-600 text-white shadow-2xs'
                            : 'bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-gray-700 border border-gray-200'
                        }`}
                        title={state.hasKitchenetteModule ? 'Click to remove the Kitchenette from the house' : 'Click to add the Kitchenette back'}
                      >
                        {state.hasKitchenetteModule ? '✓ Included (Remove)' : '+ Add Kitchenette'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Furniture (Bed & Sofa) Self-Addition Module */}
            <div className="bg-gradient-to-br from-indigo-50/70 via-white to-amber-50/60 border border-indigo-200/90 rounded-2xl p-3.5 sm:p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">🛋️🛏️</span>
                  <div>
                    <h4 className="text-xs font-black text-gray-950 uppercase tracking-wider">
                      Self-Add Furniture (20ft, 30ft, 40ft)
                    </h4>
                    <p className="text-[11px] text-gray-500">
                      Beds and sofas are optional — add them when desired with 1 click.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded-full border border-indigo-200 text-indigo-900 shadow-2xs">
                  {Number(Boolean(state.hasLuxuryBedSuite)) + Number(Boolean(state.hasLivingSofa))}/2 Added
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Bed Suite Toggle */}
                <div className={`p-3 rounded-xl border transition-all flex flex-col justify-between gap-2 ${
                  state.hasLuxuryBedSuite
                    ? 'bg-indigo-50/80 border-indigo-300 ring-1 ring-indigo-400/30'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🛏️</span>
                      <div>
                        <div className="text-xs font-bold text-gray-950">Architectural Bed Suite</div>
                        <div className="text-[10px] text-gray-500">Floating platform, mattress &amp; lamps</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-gray-100">
                    <span className="text-xs font-bold font-mono text-gray-900">
                      {formatCurrency(
                        getItemPriceForModel(
                          availableAddons.find((a: any) => a.id === 'hasLuxuryBedSuite') || { price: 3200 },
                          state.modelId,
                          config.models
                        ) * markupFactor,
                        config.currency,
                        { showPlus: true, ratesMap: config.exchangeRates }
                      )}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {onPerspectiveChange && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onPerspectiveChange('bedroom-suite');
                          }}
                          className="text-[10px] font-bold px-2 py-1 rounded-md bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 cursor-pointer"
                          title="Focus 3D camera on bedroom"
                        >
                          👁️ 3D
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          onChange((prev) => ({
                            ...prev,
                            hasLuxuryBedSuite: !prev.hasLuxuryBedSuite,
                          }))
                        }
                        className={`text-[10px] font-black px-2.5 py-1 rounded-lg cursor-pointer transition-all ${
                          state.hasLuxuryBedSuite
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs'
                            : 'bg-gray-100 hover:bg-indigo-50 hover:text-indigo-700 text-gray-700 border border-gray-200'
                        }`}
                      >
                        {state.hasLuxuryBedSuite ? '✓ Bed Added' : '+ Add Bed'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Living Room Sofa Toggle */}
                <div className={`p-3 rounded-xl border transition-all flex flex-col justify-between gap-2 ${
                  state.hasLivingSofa
                    ? 'bg-amber-50/80 border-amber-300 ring-1 ring-amber-400/30'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🛋️</span>
                      <div>
                        <div className="text-xs font-bold text-gray-950">Designer Sofa Lounge</div>
                        <div className="text-[10px] text-gray-500">Modular sofa, travertine table &amp; rug</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-gray-100">
                    <span className="text-xs font-bold font-mono text-gray-900">
                      {formatCurrency(
                        getItemPriceForModel(
                          availableAddons.find((a: any) => a.id === 'hasLivingSofa') || { price: 1350 },
                          state.modelId,
                          config.models
                        ) * markupFactor,
                        config.currency,
                        { showPlus: true, ratesMap: config.exchangeRates }
                      )}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {onPerspectiveChange && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onPerspectiveChange('living-lounge');
                          }}
                          className="text-[10px] font-bold px-2 py-1 rounded-md bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 cursor-pointer"
                          title="Focus 3D camera on living lounge"
                        >
                          👁️ 3D
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          onChange((prev) => ({
                            ...prev,
                            hasLivingSofa: !prev.hasLivingSofa,
                          }))
                        }
                        className={`text-[10px] font-black px-2.5 py-1 rounded-lg cursor-pointer transition-all ${
                          state.hasLivingSofa
                            ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-2xs'
                            : 'bg-gray-100 hover:bg-amber-50 hover:text-amber-800 text-gray-700 border border-gray-200'
                        }`}
                      >
                        {state.hasLivingSofa ? '✓ Sofa Added' : '+ Add Sofa'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sub-Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'all', label: 'All Add-ons', count: availableAddons.length },
                {
                  id: 'living',
                  label: 'Living Pods & Furnishings',
                  count: availableAddons.filter((a: any) => a.category !== 'Smart Living' && !a.id.includes('Hvac')).length,
                },
                {
                  id: 'climate',
                  label: 'HVAC & Climate Systems',
                  count: availableAddons.filter((a: any) => a.id.includes('Hvac') || a.name?.toLowerCase().includes('hvac') || a.name?.toLowerCase().includes('air conditioning')).length,
                },
                {
                  id: 'smart',
                  label: 'Smart Living & Security',
                  count: availableAddons.filter((a: any) => (a.category === 'Smart Living' || a.id.includes('Smart') || a.id === 'hasBioDigester') && !a.id.includes('Hvac')).length,
                },
              ].map((tab) => {
                const isCurrent = addonSubFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setAddonSubFilter(tab.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                      isCurrent
                        ? 'bg-gray-900 text-white shadow-xs font-bold'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${isCurrent ? 'bg-white/20 text-white' : 'bg-white text-gray-500 border border-gray-200'}`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Add-ons Cards Grid */}
            <div className="grid grid-cols-1 gap-2.5">
              {availableAddons
                .filter((addon: any) => {
                  const isHvac = addon.id.includes('Hvac') || addon.name?.toLowerCase().includes('hvac') || addon.name?.toLowerCase().includes('air conditioning');
                  const isSmart = (addon.category === 'Smart Living' || addon.id.includes('Smart') || addon.id === 'hasBioDigester') && !isHvac;
                  const isLiving = !isHvac && !isSmart;

                  if (addonSubFilter === 'living') return isLiving;
                  if (addonSubFilter === 'climate') return isHvac;
                  if (addonSubFilter === 'smart') return isSmart;
                  return true;
                })
                .map((addon: any) => {
                  const isChecked = Boolean(state[addon.id]);
                  const unitPrice = getItemPriceForModel(addon, state.modelId, config.models);
                  const unitSpec = getItemUnitSpec(addon, state.modelId);
                  const isHvac = addon.id.includes('Hvac') || addon.name?.toLowerCase().includes('hvac');

                  return (
                    <div
                      key={addon.id}
                      className={`text-left p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col gap-2.5 cursor-pointer ${
                        isChecked
                          ? 'border-orange-600 bg-orange-50/25 shadow-xs ring-1 ring-orange-500/20'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 bg-white'
                      }`}
                      onClick={() =>
                        onChange((prev) => ({
                          ...prev,
                          [addon.id]: !isChecked,
                        }))
                      }
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              e.stopPropagation();
                              onChange((prev) => ({
                                ...prev,
                                [addon.id]: e.target.checked,
                              }));
                            }}
                            className="mt-1 w-4 h-4 rounded text-orange-600 focus:ring-orange-400 border-gray-300 accent-orange-600 shrink-0 cursor-pointer"
                          />
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs sm:text-sm font-bold text-gray-950">
                                {addon.name}
                              </span>
                              {unitSpec.sizeLabel && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200/80">
                                  {unitSpec.sizeLabel}
                                </span>
                              )}
                              {isHvac && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200/80">
                                  ❄️🔥 Indoor + Exterior Dual System
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-500 leading-relaxed">
                              {unitSpec.description || addon.description}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs sm:text-sm font-bold font-mono text-gray-900 block">
                            {formatCurrency(unitPrice * markupFactor, config.currency, { showPlus: true, ratesMap: config.exchangeRates })}
                          </span>
                          <span
                            className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                              isChecked
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-gray-100 text-gray-500 border border-gray-200'
                            }`}
                          >
                            {isChecked ? '✓ Added to Home' : '+ Click to Add'}
                          </span>
                        </div>
                      </div>

                      {/* Specs and 3D View Shortcut */}
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-100/80 text-[10px]">
                        {(unitSpec.specDetail || addon.specDetail) ? (
                          <div className="text-gray-600 font-mono bg-orange-50/60 border border-orange-100 px-2 py-0.5 rounded-md truncate max-w-[240px]">
                            Spec: {unitSpec.specDetail || addon.specDetail}
                          </div>
                        ) : <div />}

                        {onPerspectiveChange && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isHvac) {
                                onPerspectiveChange('living-lounge');
                              } else if (addon.id === 'hasExteriorPergolaDeck') {
                                onPerspectiveChange('exterior-iso');
                              } else if (addon.id === 'hasLuxuryBathPod') {
                                onPerspectiveChange('interior-walkthrough');
                              } else if (addon.id === 'hasKitchenetteModule') {
                                onPerspectiveChange('living-lounge');
                              } else if (addon.id === 'hasSmartDoorLock') {
                                onPerspectiveChange('front-elevation');
                              } else {
                                onPerspectiveChange('interior-walkthrough');
                              }
                            }}
                            className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold cursor-pointer transition-colors shrink-0"
                            title="Focus 3D camera on this modular element"
                          >
                            <Eye className="w-3 h-3 text-orange-600" />
                            <span>View in 3D</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
