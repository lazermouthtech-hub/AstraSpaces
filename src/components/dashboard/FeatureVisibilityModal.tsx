import React, { useMemo, useState } from 'react';
import {
  X,
  Eye,
  EyeOff,
  Search,
  CheckCircle2,
  Layers,
  Sparkles,
  Home,
  Grid,
  SunMedium,
  Zap,
  Box,
  Palette,
  LayoutGrid,
} from 'lucide-react';
import { useAppConfig } from '../../context/AppConfigContext';
import { INTERIOR_WALL_OPTIONS } from '../../data/options';

interface FeatureVisibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FeatureGroupKey =
  | 'all'
  | 'sections'
  | 'models'
  | 'addons'
  | 'wallOptions'
  | 'interiorWallOptions'
  | 'glazingOptions'
  | 'flooringOptions'
  | 'roofOptions'
  | 'lightingOptions'
  | 'electricalOptions'
  | 'cabinetryOptions';

const CONFIGURATOR_SECTIONS = [
  {
    id: 'Floor plan',
    name: 'Floor Plan Layout Selector',
    description: 'Allows public clients to choose between 1-bed, 2-bed, 3-bed, and 4-bed floor plans.',
    category: 'Configurator Section',
  },
  {
    id: 'Add-ons',
    name: 'Add-ons & Furniture Modules',
    description: 'Bath pod, kitchenette, AC unit, HVAC, solar + battery systems, pergola decks, and furniture.',
    category: 'Configurator Section',
  },
  {
    id: 'Wall Panels',
    name: 'Wall Panels (Exterior & Interior)',
    description: 'Exterior cladding finishes and interior bamboo charcoal / timber wall panels.',
    category: 'Configurator Section',
  },
  {
    id: 'Glazing & Windows',
    name: 'Doors & Windows (Glazing)',
    description: 'Panoramic Low-E windows, broken-bridge sliding doors, and entrance door upgrades.',
    category: 'Configurator Section',
  },
  {
    id: 'Flooring',
    name: 'SPC Acoustic Flooring',
    description: 'Rigid core SPC wood, stone, marble, cement, and patterned floorings.',
    category: 'Configurator Section',
  },
  {
    id: 'Roof & Energy',
    name: 'Roof & Terraces',
    description: 'Parapet flat roof, pitched gable roof, rooftop terrace decks, and roof solar options.',
    category: 'Configurator Section',
  },
  {
    id: 'Smart Living',
    name: 'Smart Living & AI Systems',
    description: 'Smart control panels, biometric door locks, electric blinds, sound system, and cinema.',
    category: 'Configurator Section',
  },
];

const GROUP_META: {
  id: FeatureGroupKey;
  label: string;
  configKey?: string;
  icon: React.ElementType;
}[] = [
  { id: 'all', label: 'All Features', icon: Eye },
  { id: 'sections', label: 'Configurator Sections', icon: LayoutGrid },
  { id: 'models', label: 'Models & Houses', configKey: 'models', icon: Home },
  { id: 'addons', label: 'Add-ons, AC & Solar', configKey: 'addons', icon: Sparkles },
  { id: 'wallOptions', label: 'Exterior Walls', configKey: 'wallOptions', icon: Layers },
  { id: 'interiorWallOptions', label: 'Interior Walls', configKey: 'interiorWallOptions', icon: Layers },
  { id: 'glazingOptions', label: 'Windows & Doors', configKey: 'glazingOptions', icon: Grid },
  { id: 'flooringOptions', label: 'Flooring', configKey: 'flooringOptions', icon: Palette },
  { id: 'roofOptions', label: 'Roof & Terraces', configKey: 'roofOptions', icon: SunMedium },
  { id: 'lightingOptions', label: 'Lighting', configKey: 'lightingOptions', icon: Zap },
  { id: 'electricalOptions', label: 'Electrical Tiers', configKey: 'electricalOptions', icon: Zap },
  { id: 'cabinetryOptions', label: 'Cabinetry', configKey: 'cabinetryOptions', icon: Box },
];

export const getHiddenFeatureCount = (config: any): number => {
  if (!config) return 0;
  const hiddenCategoriesCount = Array.isArray(config.hiddenCategories)
    ? config.hiddenCategories.length
    : 0;
  const keys = [
    'models',
    'addons',
    'wallOptions',
    'interiorWallOptions',
    'glazingOptions',
    'flooringOptions',
    'roofOptions',
    'lightingOptions',
    'electricalOptions',
    'cabinetryOptions',
  ];
  const hiddenItemsCount = keys.reduce((acc, key) => {
    const arr = Array.isArray(config[key]) ? config[key] : [];
    return (
      acc +
      arr.filter((item: any) => item.isAvailable === false || item.isActive === false).length
    );
  }, 0);
  return hiddenCategoriesCount + hiddenItemsCount;
};

export const FeatureVisibilityModal: React.FC<FeatureVisibilityModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { config, updateConfig } = useAppConfig();
  const [activeGroup, setActiveGroup] = useState<FeatureGroupKey>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'public' | 'hidden'>('all');

  const hiddenCategories: string[] = Array.isArray(config.hiddenCategories)
    ? config.hiddenCategories
    : [];

  const getGroupItems = (groupKey: Exclude<FeatureGroupKey, 'all'>): any[] => {
    if (groupKey === 'sections') {
      return CONFIGURATOR_SECTIONS.map((sec) => ({
        ...sec,
        _groupKey: 'sections' as const,
        _groupLabel: 'Configurator Sections',
        _isPublic: !hiddenCategories.includes(sec.id),
      }));
    }
    const source =
      groupKey === 'interiorWallOptions'
        ? config.interiorWallOptions || INTERIOR_WALL_OPTIONS
        : config[groupKey] || [];
    const groupLabel =
      GROUP_META.find((g) => g.id === groupKey)?.label || groupKey;
    return source.map((item: any) => ({
      ...item,
      _groupKey: groupKey,
      _groupLabel: groupLabel,
      _isPublic: item.isAvailable !== false && item.isActive !== false,
    }));
  };

  const allFeatures = useMemo(() => {
    const groups: Exclude<FeatureGroupKey, 'all'>[] = [
      'sections',
      'models',
      'addons',
      'wallOptions',
      'interiorWallOptions',
      'glazingOptions',
      'flooringOptions',
      'roofOptions',
      'lightingOptions',
      'electricalOptions',
      'cabinetryOptions',
    ];
    return groups.flatMap((g) => getGroupItems(g));
  }, [config, hiddenCategories]);

  const totalCount = allFeatures.length;
  const hiddenCount = allFeatures.filter((f) => !f._isPublic).length;
  const publicCount = totalCount - hiddenCount;

  const filteredFeatures = useMemo(() => {
    const base =
      activeGroup === 'all' ? allFeatures : allFeatures.filter((f) => f._groupKey === activeGroup);

    return base.filter((item) => {
      if (statusFilter === 'public' && !item._isPublic) return false;
      if (statusFilter === 'hidden' && item._isPublic) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.name?.toLowerCase().includes(q) ||
          item.id?.toLowerCase().includes(q) ||
          item.category?.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          item._groupLabel?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allFeatures, activeGroup, statusFilter, searchQuery]);

  const toggleItemVisibility = (
    groupKey: Exclude<FeatureGroupKey, 'all'>,
    itemId: string,
    makePublic?: boolean
  ) => {
    if (groupKey === 'sections') {
      const currentlyPublic = !hiddenCategories.includes(itemId);
      const nextPublic = makePublic !== undefined ? makePublic : !currentlyPublic;
      const nextHidden = nextPublic
        ? hiddenCategories.filter((id) => id !== itemId)
        : Array.from(new Set([...hiddenCategories, itemId]));
      updateConfig({
        ...config,
        hiddenCategories: nextHidden,
      });
      return;
    }

    const currentList =
      groupKey === 'interiorWallOptions'
        ? config.interiorWallOptions || INTERIOR_WALL_OPTIONS
        : config[groupKey] || [];
    const updatedList = currentList.map((item: any) => {
      if (item.id !== itemId) return item;
      const currentlyPublic = item.isAvailable !== false && item.isActive !== false;
      const nextPublic = makePublic !== undefined ? makePublic : !currentlyPublic;
      return {
        ...item,
        isAvailable: nextPublic,
        isActive: nextPublic,
      };
    });

    updateConfig({
      ...config,
      [groupKey]: updatedList,
    });
  };

  const handleBulkVisibility = (makePublic: boolean) => {
    const targetIdsByGroup = new Map<Exclude<FeatureGroupKey, 'all'>, Set<string>>();
    filteredFeatures.forEach((f) => {
      if (!targetIdsByGroup.has(f._groupKey)) {
        targetIdsByGroup.set(f._groupKey, new Set());
      }
      targetIdsByGroup.get(f._groupKey)!.add(f.id);
    });

    const nextConfig: any = { ...config };

    targetIdsByGroup.forEach((idSet, groupKey) => {
      if (groupKey === 'sections') {
        if (makePublic) {
          nextConfig.hiddenCategories = (config.hiddenCategories || []).filter(
            (id: string) => !idSet.has(id)
          );
        } else {
          nextConfig.hiddenCategories = Array.from(
            new Set([...(config.hiddenCategories || []), ...Array.from(idSet)])
          );
        }
      } else {
        const source =
          groupKey === 'interiorWallOptions'
            ? config.interiorWallOptions || INTERIOR_WALL_OPTIONS
            : config[groupKey] || [];
        nextConfig[groupKey] = source.map((item: any) =>
          idSet.has(item.id)
            ? { ...item, isAvailable: makePublic, isActive: makePublic }
            : item
        );
      }
    });

    updateConfig(nextConfig);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] flex flex-col border border-gray-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-[#FAFAFC] border-b border-gray-200 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-extrabold text-gray-950 tracking-tight">
                  Public &amp; Client Feature Visibility
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {publicCount} Public
                </span>
                {hiddenCount > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                    {hiddenCount} Hidden from Client
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5 truncate">
                Show or hide any configurator section, cabin model, add-on, wall finish, window, flooring, or solar package from public clients.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer shrink-0"
            title="Close Feature Visibility Manager"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search, Status Filters, & Bulk Controls */}
        <div className="px-6 py-3.5 bg-white border-b border-gray-100 space-y-3 shrink-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search any feature (e.g. Air Conditioner, Solar, 20ft, Bath Pod)..."
                className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-xs font-bold cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex p-1 bg-gray-100 rounded-xl border border-gray-200 gap-1">
                {[
                  { id: 'all', label: `All (${totalCount})` },
                  { id: 'public', label: `Public (${publicCount})` },
                  { id: 'hidden', label: `Hidden (${hiddenCount})` },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setStatusFilter(tab.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      statusFilter === tab.id
                        ? tab.id === 'public'
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : tab.id === 'hidden'
                          ? 'bg-amber-600 text-white shadow-2xs'
                          : 'bg-black text-white shadow-2xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => handleBulkVisibility(true)}
                disabled={filteredFeatures.length === 0}
                className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-40"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Show All Shown</span>
              </button>
              <button
                type="button"
                onClick={() => handleBulkVisibility(false)}
                disabled={filteredFeatures.length === 0}
                className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-40"
              >
                <EyeOff className="w-3.5 h-3.5" />
                <span>Hide All Shown</span>
              </button>
            </div>
          </div>

          {/* Group Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {GROUP_META.map((group) => {
              const Icon = group.icon;
              const isSelected = activeGroup === group.id;
              const groupItems =
                group.id === 'all' ? allFeatures : allFeatures.filter((f) => f._groupKey === group.id);
              const groupHidden = groupItems.filter((f) => !f._isPublic).length;

              return (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => setActiveGroup(group.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-gray-900 text-white border-gray-900 shadow-xs font-bold'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{group.label}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : groupHidden > 0
                        ? 'bg-amber-100 text-amber-900 font-bold'
                        : 'bg-white text-gray-500 border border-gray-200'
                    }`}
                  >
                    {groupHidden > 0 ? `${groupHidden} hidden` : groupItems.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Features List */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-[#F8F9FC] space-y-2.5">
          {filteredFeatures.length === 0 ? (
            <div className="bg-white p-10 rounded-2xl border border-dashed border-gray-300 text-center space-y-2">
              <p className="text-sm font-bold text-gray-900">No features match this filter</p>
              <p className="text-xs text-gray-500">
                Try clearing the search box or switching between All, Public, and Hidden filters.
              </p>
            </div>
          ) : (
            filteredFeatures.map((item) => {
              const isPub = item._isPublic;
              return (
                <div
                  key={`${item._groupKey}-${item.id}`}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isPub
                      ? 'bg-white border-gray-200 shadow-2xs'
                      : 'bg-amber-50/50 border-amber-300/90 ring-1 ring-amber-400/20'
                  }`}
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 border border-gray-200">
                        {item._groupLabel}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-gray-950 truncate">
                        {item.name}
                      </span>
                      <span className="text-[10px] font-mono text-gray-400">{item.id}</span>
                    </div>
                    {item.description && (
                      <p className="text-[11px] text-gray-500 line-clamp-1">{item.description}</p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleItemVisibility(item._groupKey, item.id)}
                    className={`flex items-center gap-2.5 px-3.5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer border shrink-0 active:scale-95 ${
                      isPub
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                        : 'bg-amber-100 text-amber-950 border-amber-300 hover:bg-amber-200'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isPub ? 'bg-emerald-500' : 'bg-amber-600'
                      }`}
                    />
                    <span>{isPub ? 'Visible to Public / Client' : 'Hidden from Public / Client'}</span>
                    <div
                      className={`w-8 h-4.5 rounded-full relative transition-colors ${
                        isPub ? 'bg-emerald-600' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                          isPub ? 'left-4' : 'left-0.5'
                        }`}
                      />
                    </div>
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-white border-t border-gray-200 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-emerald-700 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Changes sync immediately to the live customer Configurator and Spec Sheets.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-black hover:bg-gray-800 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
