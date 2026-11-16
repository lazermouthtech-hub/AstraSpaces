import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bed,
  Bath,
  Tv,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  CheckCircle2,
  Search,
  Filter,
  RotateCcw,
  Save,
  Calculator,
  Sparkles,
  Check,
  Home,
} from 'lucide-react';
import { FloorPlanOption } from '../../types';
import { BASE_MODELS } from '../../data/models';
import { FLOOR_PLAN_OPTIONS } from '../../data/options';
import { getItemPriceForModel } from '../../utils/pricingCalculator';
import { formatCurrency } from '../../utils/currency';

interface BedroomsPricingManagerProps {
  floorPlanOptions: FloorPlanOption[];
  setFloorPlanOptions: React.Dispatch<React.SetStateAction<FloorPlanOption[]>>;
  models: any[];
  baseCurrency: string;
  exchangeRates: Record<string, number>;
  markup: number;
  toDisplayPrice: (usdPrice: number | undefined) => number;
  toStoredUsdPrice: (displayPrice: number) => number;
  onSaveLive: (updatedPlans: FloorPlanOption[]) => void;
  onResetDefaults: () => void;
}

const EXPANDABLE_UNITS = [
  {
    modelId: 'expandable-10ft',
    aliasKey: '10ft',
    shortLabel: '10FT Micro',
    label: '10FT Expandable House',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  {
    modelId: 'expandable-20ft',
    aliasKey: '20ft',
    shortLabel: '20FT Double-Wing',
    label: '20FT Expandable House',
    badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
  },
  {
    modelId: 'expandable-30ft',
    aliasKey: '30ft',
    shortLabel: '30FT Double-Wing',
    label: '30FT Expandable House',
    badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  },
  {
    modelId: 'expandable-40ft',
    aliasKey: '40ft',
    shortLabel: '40FT Flagship',
    label: '40FT Flagship Residence',
    badgeClass: 'bg-orange-50 text-orange-800 border-orange-200',
  },
] as const;

const isPlanPublic = (plan: FloorPlanOption) =>
  plan.isAvailable !== false && plan.isActive !== false;

const isPlanEnabledForModel = (plan: FloorPlanOption, modelId: string): boolean => {
  if (Array.isArray(plan.availableModels)) {
    return plan.availableModels.includes(modelId);
  }
  if (plan.id === '10ft-1bed') return modelId === 'expandable-10ft';
  return modelId !== 'expandable-10ft';
};

export const BedroomsPricingManager: React.FC<BedroomsPricingManagerProps> = ({
  floorPlanOptions,
  setFloorPlanOptions,
  models,
  baseCurrency,
  exchangeRates,
  markup,
  toDisplayPrice,
  toStoredUsdPrice,
  onSaveLive,
  onResetDefaults,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [bedroomFilter, setBedroomFilter] = useState<'all' | '1' | '2' | '3' | '4'>('all');
  const [modelFilter, setModelFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'public' | 'hidden'>('all');

  // Batch price adjustment toolbar state
  const [batchTarget, setBatchTarget] = useState<
    'all-multi' | 'all' | 'expandable-10ft' | 'expandable-20ft' | 'expandable-30ft' | 'expandable-40ft' | 'baseline'
  >('all-multi');
  const [batchMode, setBatchMode] = useState<'flat' | 'percent'>('flat');
  const [batchValue, setBatchValue] = useState<string>('250');
  const [skipIncludedZero, setSkipIncludedZero] = useState<boolean>(true);
  const [batchFeedback, setBatchFeedback] = useState<string | null>(null);

  const markupFactor = 1 + (Number(markup) || 0) / 100;

  const getExpandableModelInfo = (modelId: string) => {
    const found =
      models?.find((m: any) => m.id === modelId) ||
      BASE_MODELS.find((m: any) => m.id === modelId);
    return found || { id: modelId, name: modelId, basePrice: 0, sqft: 0 };
  };

  const publicCount = useMemo(
    () => floorPlanOptions.filter((p) => isPlanPublic(p)).length,
    [floorPlanOptions]
  );
  const hiddenCount = floorPlanOptions.length - publicCount;

  const filteredPlans = useMemo(() => {
    return floorPlanOptions.filter((plan) => {
      const pub = isPlanPublic(plan);
      if (statusFilter === 'public' && !pub) return false;
      if (statusFilter === 'hidden' && pub) return false;

      if (bedroomFilter !== 'all' && Number(plan.bedrooms) !== Number(bedroomFilter)) {
        return false;
      }

      if (modelFilter !== 'all' && !isPlanEnabledForModel(plan, modelFilter)) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const hay = `${plan.id} ${plan.name} ${plan.tagline} ${plan.description} ${plan.badge} ${plan.recommendedFor}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });
  }, [floorPlanOptions, statusFilter, bedroomFilter, modelFilter, searchQuery]);

  const updatePlanById = (
    planId: string,
    updater: (plan: FloorPlanOption) => FloorPlanOption
  ) => {
    setFloorPlanOptions((prev) =>
      prev.map((p) => (p.id === planId ? updater(p) : p))
    );
  };

  const handleToggleVisibility = (planId: string) => {
    const updated = floorPlanOptions.map((p) => {
      if (p.id !== planId) return p;
      const next = !isPlanPublic(p);
      return { ...p, isAvailable: next, isActive: next };
    });
    setFloorPlanOptions(updated);
    onSaveLive(updated);
  };

  const handleToggleModelAvailability = (planId: string, modelId: string) => {
    updatePlanById(planId, (plan) => {
      const currentModels = Array.isArray(plan.availableModels)
        ? plan.availableModels
        : plan.id === '10ft-1bed'
        ? ['expandable-10ft']
        : ['expandable-20ft', 'expandable-30ft', 'expandable-40ft'];

      const exists = currentModels.includes(modelId);
      const nextModels = exists
        ? currentModels.filter((m) => m !== modelId)
        : [...currentModels, modelId];

      return { ...plan, availableModels: nextModels };
    });
  };

  const handleUnitPriceChange = (
    planId: string,
    modelId: string,
    aliasKey: string,
    usdPrice: number
  ) => {
    const clampedUsd = Math.max(0, Number.isFinite(usdPrice) ? usdPrice : 0);
    updatePlanById(planId, (plan) => ({
      ...plan,
      priceByModel: {
        ...(plan.priceByModel || {}),
        [modelId]: clampedUsd,
        [aliasKey]: clampedUsd,
      },
    }));
  };

  const handleUnitSpecChange = (
    planId: string,
    modelId: string,
    field: 'sizeLabel' | 'specDetail',
    val: string
  ) => {
    updatePlanById(planId, (plan) => ({
      ...plan,
      unitSpecs: {
        ...(plan.unitSpecs || {}),
        [modelId]: {
          ...((plan.unitSpecs && plan.unitSpecs[modelId]) || {}),
          [field]: val,
        },
      },
    }));
  };

  const handleAddCustomPlan = () => {
    const timestamp = Date.now();
    const newPlan: FloorPlanOption = {
      id: `custom-bedroom-plan-${timestamp}`,
      name: 'Custom Multi-Bedroom Layout',
      tagline: 'Custom Partitioned Expandable Interior Layout',
      bedrooms: 2,
      bathrooms: 1,
      livingRooms: 1,
      description:
        'Custom bedroom addition floor plan with acoustic interior walls, bedroom entry doors, and optimized living zone.',
      price: 1500,
      isAvailable: true,
      isActive: true,
      availableModels: ['expandable-20ft', 'expandable-30ft', 'expandable-40ft'],
      priceByModel: {
        'expandable-20ft': 1500,
        '20ft': 1500,
        'expandable-30ft': 1850,
        '30ft': 1850,
        'expandable-40ft': 2200,
        '40ft': 2200,
      },
      badge: 'Custom Bedroom Plan',
      recommendedFor: 'Custom homeowner and developer multi-bedroom configurations',
      features: [
        'Custom bedroom partition layout & doors',
        'Pre-wired bedroom lighting & wall receptacles',
        'Optimized living room & hallway flow',
        'Central bath & kitchenette integration',
      ],
    };
    setFloorPlanOptions((prev) => [newPlan, ...prev]);
  };

  const handleDeletePlan = (plan: FloorPlanOption) => {
    if (floorPlanOptions.length <= 1) return;
    const isFactory = FLOOR_PLAN_OPTIONS.some((f) => f.id === plan.id);
    const msg = isFactory
      ? `Delete built-in floor plan "${plan.name}"? (Tip: You can use the "Hidden from Public" toggle instead so 3D previews still work.)`
      : `Delete custom bedroom plan "${plan.name}"?`;
    if (!window.confirm(msg)) return;
    const updated = floorPlanOptions.filter((p) => p.id !== plan.id);
    setFloorPlanOptions(updated);
    onSaveLive(updated);
  };

  const handleApplyBatchAdjustment = () => {
    const numericVal = Number(batchValue);
    if (!Number.isFinite(numericVal) || numericVal === 0) {
      setBatchFeedback('Enter a non-zero adjustment value first.');
      setTimeout(() => setBatchFeedback(null), 3500);
      return;
    }

    const deltaUsd = batchMode === 'flat' ? toStoredUsdPrice(numericVal) : 0;
    let touchedCells = 0;

    const adjustPrice = (currentUsd: number) => {
      if (skipIncludedZero && currentUsd === 0) return currentUsd;
      touchedCells++;
      if (batchMode === 'flat') {
        return Math.max(0, Math.round((currentUsd + deltaUsd) * 100) / 100);
      }
      return Math.max(0, Math.round(currentUsd * (1 + numericVal / 100) * 100) / 100);
    };

    const targetUnits =
      batchTarget === 'all-multi'
        ? EXPANDABLE_UNITS.filter((u) => u.modelId !== 'expandable-10ft')
        : batchTarget === 'all'
        ? EXPANDABLE_UNITS
        : batchTarget === 'baseline'
        ? []
        : EXPANDABLE_UNITS.filter((u) => u.modelId === batchTarget);

    setFloorPlanOptions((prev) =>
      prev.map((plan) => {
        if (!filteredPlans.some((fp) => fp.id === plan.id)) return plan;

        let nextPlan = { ...plan };
        if (batchTarget === 'baseline' || batchTarget === 'all') {
          nextPlan.price = adjustPrice(Number(plan.price) || 0);
        }

        if (targetUnits.length > 0) {
          const nextMap = { ...(plan.priceByModel || {}) };
          targetUnits.forEach((unit) => {
            if (!isPlanEnabledForModel(plan, unit.modelId)) return;
            const currentUnitUsd = getItemPriceForModel(plan, unit.modelId, models);
            const adjusted = adjustPrice(currentUnitUsd);
            nextMap[unit.modelId] = adjusted;
            nextMap[unit.aliasKey] = adjusted;
          });
          nextPlan.priceByModel = nextMap;
        }
        return nextPlan;
      })
    );

    setBatchFeedback(
      `Adjusted ${touchedCells} price field(s) across filtered bedroom plans. Click "Save Bedroom Prices Live" to publish.`
    );
    setTimeout(() => setBatchFeedback(null), 5000);
  };

  const formatMoney = (usd: number) =>
    formatCurrency(usd, baseCurrency, { ratesMap: exchangeRates });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200/80">
              <Bed className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-gray-900 text-base sm:text-lg">
              Bedrooms Addition &amp; Expandable Floor Plan Pricing
            </h3>
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              1–4 Bedrooms · 10FT / 20FT / 30FT / 40FT
            </span>
          </div>
          <p className="text-xs text-gray-500 max-w-3xl leading-relaxed">
            Configure detailed bedroom addition pricing, unit availability, and architectural layout specs independently for{' '}
            <strong className="text-gray-800">10FT</strong>,{' '}
            <strong className="text-gray-800">20FT</strong>,{' '}
            <strong className="text-gray-800">30FT</strong>, and{' '}
            <strong className="text-gray-800">40FT</strong> expandable houses. Any price adjustment updates the 3D Configurator, Cost Breakdown, Homepage Model Cards, and PDF Spec Sheets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleAddCustomPlan}
            className="px-3.5 py-2 text-xs font-bold bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Bedroom Plan</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  'Reset all bedroom addition prices, specs, and expandable availability back to factory defaults?'
                )
              ) {
                onResetDefaults();
              }
            }}
            className="px-3 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={() => onSaveLive(floorPlanOptions)}
            className="px-4 py-2 text-xs font-extrabold text-white bg-black hover:bg-neutral-800 rounded-xl flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-orange-400" />
            <span>Save Bedroom Prices Live</span>
          </button>
        </div>
      </div>

      {/* KPI & Base House Reference Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Bedroom Plans
            </div>
            <div className="text-xl font-black text-gray-900 font-mono mt-0.5">
              {floorPlanOptions.length}
            </div>
            <div className="text-[10px] text-gray-500">
              {publicCount} public · {hiddenCount} hidden
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Bed className="w-5 h-5" />
          </div>
        </div>

        {EXPANDABLE_UNITS.slice(1).map((unit) => {
          const m = getExpandableModelInfo(unit.modelId);
          const enabledPlansCount = floorPlanOptions.filter(
            (p) => isPlanPublic(p) && isPlanEnabledForModel(p, unit.modelId)
          ).length;
          return (
            <div
              key={unit.modelId}
              className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between gap-2"
            >
              <div className="min-w-0">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">
                  {unit.shortLabel} Base
                </div>
                <div className="text-lg font-black text-gray-900 font-mono mt-0.5">
                  {formatMoney(m.basePrice || 0)}
                </div>
                <div className="text-[10px] text-emerald-700 font-semibold">
                  {enabledPlansCount} bedroom layout{enabledPlansCount === 1 ? '' : 's'} active
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center shrink-0">
                <Home className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters & Batch Price Adjuster */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search bedroom plans by name, ID, tagline, or specs..."
              className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Bedroom Count Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-1 shrink-0">
              Bedrooms:
            </span>
            {[
              { id: 'all', label: 'All Counts' },
              { id: '1', label: '1 Bed' },
              { id: '2', label: '2 Beds' },
              { id: '3', label: '3 Beds' },
              { id: '4', label: '4 Beds' },
            ].map((chip) => {
              const active = bedroomFilter === chip.id;
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setBedroomFilter(chip.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* House Size & Visibility Filter Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-1 shrink-0">
              Expandable House:
            </span>
            {[
              { id: 'all', label: 'All Houses' },
              { id: 'expandable-10ft', label: '10FT Micro' },
              { id: 'expandable-20ft', label: '20FT Double-Wing' },
              { id: 'expandable-30ft', label: '30FT Double-Wing' },
              { id: 'expandable-40ft', label: '40FT Flagship' },
            ].map((mChip) => {
              const active = modelFilter === mChip.id;
              return (
                <button
                  key={mChip.id}
                  type="button"
                  onClick={() => setModelFilter(mChip.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-black text-white font-bold shadow-2xs'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {mChip.label}
                </button>
              );
            })}
          </div>

          <div className="inline-flex p-1 bg-gray-100 rounded-xl gap-1 shrink-0">
            {[
              { id: 'all', label: `All (${floorPlanOptions.length})` },
              { id: 'public', label: `Public (${publicCount})` },
              { id: 'hidden', label: `Hidden (${hiddenCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-white text-gray-900 shadow-2xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Batch Price Adjustment Bar */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-orange-50/80 via-amber-50/40 to-gray-50 border border-orange-200/80 space-y-2.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-xs font-extrabold text-gray-900">
              <Calculator className="w-4 h-4 text-orange-600" />
              <span>Bulk Bedroom Price Adjuster</span>
              <span className="text-[10px] font-semibold text-gray-500 font-normal">
                (Applies to the {filteredPlans.length} currently filtered plan{filteredPlans.length === 1 ? '' : 's'})
              </span>
            </div>
            <label className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={skipIncludedZero}
                onChange={(e) => setSkipIncludedZero(e.target.checked)}
                className="w-3.5 h-3.5 accent-orange-600 rounded"
              />
              <span>Keep $0 &ldquo;Included&rdquo; plans at $0</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 items-center">
            <select
              value={batchTarget}
              onChange={(e) => setBatchTarget(e.target.value as any)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:border-orange-500"
            >
              <option value="all-multi">20FT, 30FT &amp; 40FT Expandables</option>
              <option value="expandable-20ft">20FT Expandable Only</option>
              <option value="expandable-30ft">30FT Expandable Only</option>
              <option value="expandable-40ft">40FT Flagship Only</option>
              <option value="expandable-10ft">10FT Micro Only</option>
              <option value="baseline">Baseline Fallback Price</option>
              <option value="all">All Sizes + Baseline</option>
            </select>

            <select
              value={batchMode}
              onChange={(e) => setBatchMode(e.target.value as any)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:border-orange-500"
            >
              <option value="flat">Add / Subtract Flat Amount ({baseCurrency})</option>
              <option value="percent">Increase / Decrease by Percentage (%)</option>
            </select>

            <div className="relative">
              <input
                type="number"
                value={batchValue}
                onChange={(e) => setBatchValue(e.target.value)}
                placeholder={batchMode === 'flat' ? 'e.g. 250 or -150' : 'e.g. 10 or -5'}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-orange-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-gray-400">
                {batchMode === 'flat' ? baseCurrency : '%'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleApplyBatchAdjustment}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-extrabold rounded-xl transition-all shadow-xs active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Apply Adjustment</span>
            </button>
          </div>

          {batchFeedback && (
            <div className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{batchFeedback}</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Side-by-Side Comparison Matrix Table */}
      {filteredPlans.length > 0 && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-gray-50/60">
            <div>
              <h4 className="font-extrabold text-gray-900 text-sm">
                Quick Bedroom Price Matrix Across Expandable Houses ({baseCurrency})
              </h4>
              <p className="text-[11px] text-gray-500">
                Edit any cell directly to adjust bedroom addition pricing for 10FT, 20FT, 30FT, or 40FT models side-by-side. Resulting home totals update live below each input.
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-gray-600 shrink-0">
              Showing {filteredPlans.length} of {floorPlanOptions.length} plans
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[920px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80 text-[10px] font-black uppercase tracking-wider text-gray-500">
                  <th className="py-3 px-4 w-[240px]">Bedroom Layout</th>
                  <th className="py-3 px-3 w-[125px]">Default ({baseCurrency})</th>
                  {EXPANDABLE_UNITS.map((unit) => {
                    const m = getExpandableModelInfo(unit.modelId);
                    return (
                      <th key={unit.modelId} className="py-3 px-3 min-w-[140px]">
                        <div>{unit.shortLabel}</div>
                        <div className="text-[9px] font-mono font-semibold text-gray-400 normal-case">
                          Base: {formatMoney(m.basePrice || 0)}
                        </div>
                      </th>
                    );
                  })}
                  <th className="py-3 px-3 text-right w-[105px]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredPlans.map((plan) => {
                  const pub = isPlanPublic(plan);
                  return (
                    <tr
                      key={plan.id}
                      className={`transition-colors ${
                        pub ? 'hover:bg-blue-50/20' : 'bg-amber-50/20 opacity-85'
                      }`}
                    >
                      <td className="py-3 px-4 align-top">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-blue-100 text-blue-800 border border-blue-200">
                            {plan.bedrooms} Bed{plan.bedrooms > 1 ? 's' : ''}
                          </span>
                          <span className="text-[10px] font-mono text-gray-400 truncate max-w-[130px]">
                            {plan.id}
                          </span>
                        </div>
                        <div className="font-bold text-gray-900 mt-1 leading-snug">
                          {plan.tagline || plan.name}
                        </div>
                        <div className="text-[10px] text-gray-500 mt-0.5">
                          {plan.badge}
                        </div>
                      </td>

                      <td className="py-3 px-3 align-top">
                        <input
                          type="number"
                          min={0}
                          value={toDisplayPrice(plan.price)}
                          onChange={(e) => {
                            const val = Math.max(0, toStoredUsdPrice(Number(e.target.value)));
                            updatePlanById(plan.id, (p) => ({ ...p, price: val }));
                          }}
                          className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono font-bold focus:outline-none focus:border-orange-500 focus:bg-white"
                        />
                        <div className="text-[9px] text-gray-400 mt-1 font-mono">
                          {plan.price === 0 ? 'Included ($0)' : `+${formatMoney(plan.price)}`}
                        </div>
                      </td>

                      {EXPANDABLE_UNITS.map((unit) => {
                        const enabled = isPlanEnabledForModel(plan, unit.modelId);
                        const unitPriceUsd = getItemPriceForModel(plan, unit.modelId, models);
                        const houseBaseUsd = getExpandableModelInfo(unit.modelId).basePrice || 0;
                        const totalHouseUsd = (houseBaseUsd + unitPriceUsd) * markupFactor;

                        return (
                          <td key={unit.modelId} className="py-3 px-3 align-top">
                            {enabled ? (
                              <div className="space-y-1">
                                <input
                                  type="number"
                                  min={0}
                                  value={toDisplayPrice(unitPriceUsd)}
                                  onChange={(e) =>
                                    handleUnitPriceChange(
                                      plan.id,
                                      unit.modelId,
                                      unit.aliasKey,
                                      toStoredUsdPrice(Number(e.target.value))
                                    )
                                  }
                                  className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-mono font-bold focus:outline-none focus:border-orange-500"
                                />
                                <div className="flex items-center justify-between text-[9.5px] font-mono">
                                  <span className="text-gray-500">Total:</span>
                                  <span className="font-bold text-gray-900">
                                    {formatMoney(totalHouseUsd)}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleToggleModelAvailability(plan.id, unit.modelId)}
                                className="w-full py-2 px-2 rounded-lg border border-dashed border-gray-200 text-[10px] font-semibold text-gray-400 hover:text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-colors cursor-pointer text-center"
                                title={`Click to enable ${plan.name} on ${unit.shortLabel}`}
                              >
                                Not enabled · Enable
                              </button>
                            )}
                          </td>
                        );
                      })}

                      <td className="py-3 px-3 align-top text-right">
                        <button
                          type="button"
                          onClick={() => handleToggleVisibility(plan.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border cursor-pointer transition-colors ${
                            pub
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                          }`}
                        >
                          {pub ? (
                            <>
                              <Eye className="w-3 h-3" />
                              <span>Public</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3" />
                              <span>Hidden</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredPlans.length === 0 && (
        <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Filter className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-gray-900">No bedroom plans match your filter</h4>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Reset the bedroom count, house size, or search filters to view all floor plan options.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setBedroomFilter('all');
              setModelFilter('all');
              setStatusFilter('all');
            }}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Detailed Per-Plan Configuration Cards */}
      <div className="space-y-4">
        {filteredPlans.map((plan) => {
          const pub = isPlanPublic(plan);
          const previewModelId =
            EXPANDABLE_UNITS.find((u) => isPlanEnabledForModel(plan, u.modelId))?.modelId ||
            'expandable-20ft';

          return (
            <div
              key={plan.id}
              className={`bg-white p-5 sm:p-6 rounded-3xl border transition-all flex flex-col gap-5 ${
                pub
                  ? 'border-gray-200 shadow-xs'
                  : 'border-amber-300 bg-amber-50/15 ring-1 ring-amber-400/20 shadow-xs'
              }`}
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-blue-600 text-white shadow-2xs flex items-center gap-1.5">
                    <Bed className="w-3.5 h-3.5" />
                    <span>
                      {plan.bedrooms} Bedroom{plan.bedrooms > 1 ? 's' : ''}
                    </span>
                  </span>
                  <span className="px-2 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <Bath className="w-3 h-3" />
                    <span>{plan.bathrooms} Bath</span>
                  </span>
                  <span className="px-2 py-1 rounded-lg text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200 flex items-center gap-1">
                    <Tv className="w-3 h-3" />
                    <span>{plan.livingRooms} Living</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg border border-gray-200">
                    {plan.id}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleToggleVisibility(plan.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border shadow-2xs active:scale-95 ${
                      pub
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-500/20 hover:bg-emerald-100'
                        : 'bg-amber-50 text-amber-900 border-amber-300 ring-2 ring-amber-500/20 hover:bg-amber-100'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        pub ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                      }`}
                    />
                    <span>{pub ? 'Public in Configurator' : 'Hidden from Public'}</span>
                    <div
                      className={`w-8 h-4.5 rounded-full relative transition-colors ${
                        pub ? 'bg-emerald-600' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                          pub ? 'left-4' : 'left-0.5'
                        }`}
                      />
                    </div>
                  </button>

                  <Link
                    to={`/configurator?model=${previewModelId}&bedrooms=${Math.min(4, Math.max(1, plan.bedrooms || 2))}`}
                    target="_blank"
                    className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Preview this bedroom layout in 3D Configurator"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>

                  {floorPlanOptions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeletePlan(plan)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete floor plan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Core Metadata Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div className="lg:col-span-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Layout Name
                  </label>
                  <input
                    type="text"
                    value={plan.name}
                    onChange={(e) =>
                      updatePlanById(plan.id, (p) => ({ ...p, name: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Baseline Upgrade Price ({baseCurrency})
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={toDisplayPrice(plan.price)}
                    onChange={(e) => {
                      const val = Math.max(0, toStoredUsdPrice(Number(e.target.value)));
                      updatePlanById(plan.id, (p) => ({ ...p, price: val }));
                    }}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Badge Tag
                  </label>
                  <input
                    type="text"
                    value={plan.badge || ''}
                    onChange={(e) =>
                      updatePlanById(plan.id, (p) => ({ ...p, badge: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Architectural Tagline
                  </label>
                  <input
                    type="text"
                    value={plan.tagline || ''}
                    onChange={(e) =>
                      updatePlanById(plan.id, (p) => ({ ...p, tagline: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Beds
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={6}
                      value={plan.bedrooms}
                      onChange={(e) =>
                        updatePlanById(plan.id, (p) => ({
                          ...p,
                          bedrooms: Math.max(1, Number(e.target.value) || 1),
                        }))
                      }
                      className="w-full px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Baths
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={4}
                      value={plan.bathrooms}
                      onChange={(e) =>
                        updatePlanById(plan.id, (p) => ({
                          ...p,
                          bathrooms: Math.max(0, Number(e.target.value) || 0),
                        }))
                      }
                      className="w-full px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Living
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={3}
                      value={plan.livingRooms}
                      onChange={(e) =>
                        updatePlanById(plan.id, (p) => ({
                          ...p,
                          livingRooms: Math.max(0, Number(e.target.value) || 0),
                        }))
                      }
                      className="w-full px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Recommended For
                  </label>
                  <input
                    type="text"
                    value={plan.recommendedFor || ''}
                    onChange={(e) =>
                      updatePlanById(plan.id, (p) => ({ ...p, recommendedFor: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Customer Description & Feature Bullets */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Customer Description
                  </label>
                  <textarea
                    rows={3}
                    value={plan.description || ''}
                    onChange={(e) =>
                      updatePlanById(plan.id, (p) => ({ ...p, description: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs leading-relaxed focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Included Room Features (1 feature per line)
                  </label>
                  <textarea
                    rows={3}
                    value={(plan.features || []).join('\n')}
                    onChange={(e) =>
                      updatePlanById(plan.id, (p) => ({
                        ...p,
                        features: e.target.value
                          .split('\n')
                          .map((line) => line.trim())
                          .filter(Boolean),
                      }))
                    }
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs leading-relaxed focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Detailed Per-Expandable-House Pricing & Availability Cards */}
              <div className="p-4 rounded-2xl bg-gray-50/90 border border-gray-200/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="text-[11px] font-black uppercase tracking-wider text-gray-800">
                      Expandable House Size Pricing &amp; Availability ({baseCurrency})
                    </div>
                    <p className="text-[11px] text-gray-500">
                      Enable or disable this bedroom option per house footprint, set custom addition prices, and preview the final combined home price.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      updatePlanById(plan.id, (p) => {
                        const baseUsd = Number(p.price) || 0;
                        const nextMap = { ...(p.priceByModel || {}) };
                        EXPANDABLE_UNITS.forEach((u) => {
                          if (isPlanEnabledForModel(p, u.modelId)) {
                            nextMap[u.modelId] = baseUsd;
                            nextMap[u.aliasKey] = baseUsd;
                          }
                        });
                        return { ...p, priceByModel: nextMap };
                      });
                    }}
                    className="px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-[11px] font-bold transition-colors cursor-pointer shrink-0"
                  >
                    Sync All Enabled to Baseline ({formatMoney(plan.price || 0)})
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {EXPANDABLE_UNITS.map((unit) => {
                    const enabled = isPlanEnabledForModel(plan, unit.modelId);
                    const modelInfo = getExpandableModelInfo(unit.modelId);
                    const houseBaseUsd = Number(modelInfo.basePrice) || 0;
                    const unitPriceUsd = getItemPriceForModel(plan, unit.modelId, models);
                    const combinedTotalUsd = (houseBaseUsd + unitPriceUsd) * markupFactor;
                    const customSpec = plan.unitSpecs?.[unit.modelId];

                    return (
                      <div
                        key={unit.modelId}
                        className={`p-3.5 rounded-2xl border transition-all flex flex-col gap-2.5 ${
                          enabled
                            ? 'bg-white border-gray-200 shadow-2xs'
                            : 'bg-gray-100/70 border-dashed border-gray-300 opacity-75'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${unit.badgeClass}`}
                          >
                            {unit.shortLabel}
                          </span>

                          <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={enabled}
                              onChange={() => handleToggleModelAvailability(plan.id, unit.modelId)}
                              className="w-3.5 h-3.5 accent-blue-600 rounded cursor-pointer"
                            />
                            <span>{enabled ? 'Enabled' : 'Disabled'}</span>
                          </label>
                        </div>

                        <div className="text-[10px] text-gray-500 flex items-center justify-between">
                          <span>House Base:</span>
                          <span className="font-mono font-bold text-gray-800">
                            {formatMoney(houseBaseUsd)}
                          </span>
                        </div>

                        {enabled ? (
                          <>
                            <div>
                              <label className="block text-[9.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                                Bedroom Addition Price ({baseCurrency})
                              </label>
                              <input
                                type="number"
                                min={0}
                                value={toDisplayPrice(unitPriceUsd)}
                                onChange={(e) =>
                                  handleUnitPriceChange(
                                    plan.id,
                                    unit.modelId,
                                    unit.aliasKey,
                                    toStoredUsdPrice(Number(e.target.value))
                                  )
                                }
                                className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono font-bold focus:outline-none focus:border-orange-500 focus:bg-white"
                              />
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  handleUnitPriceChange(plan.id, unit.modelId, unit.aliasKey, 0)
                                }
                                className="flex-1 py-1 px-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold cursor-pointer transition-colors flex items-center justify-center gap-1"
                              >
                                <Check className="w-3 h-3" />
                                <span>Set $0 Included</span>
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleUnitPriceChange(
                                    plan.id,
                                    unit.modelId,
                                    unit.aliasKey,
                                    Number(plan.price) || 0
                                  )
                                }
                                className="py-1 px-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] font-bold cursor-pointer transition-colors"
                                title="Reset to baseline price"
                              >
                                Base
                              </button>
                            </div>

                            <div className="p-2 rounded-xl bg-blue-50/70 border border-blue-200/70 text-[10px] space-y-0.5">
                              <div className="flex items-center justify-between text-blue-900/80">
                                <span>Addition Cost:</span>
                                <span className="font-mono font-bold">
                                  {unitPriceUsd === 0 ? 'Included' : `+${formatMoney(unitPriceUsd)}`}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-blue-950 font-extrabold border-t border-blue-200/60 pt-0.5">
                                <span>Combined Total:</span>
                                <span className="font-mono">{formatMoney(combinedTotalUsd)}</span>
                              </div>
                            </div>

                            <div>
                              <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                                {unit.shortLabel} Layout Note (Optional)
                              </label>
                              <input
                                type="text"
                                placeholder={`Custom ${unit.shortLabel} room size/layout spec...`}
                                value={customSpec?.specDetail || ''}
                                onChange={(e) =>
                                  handleUnitSpecChange(
                                    plan.id,
                                    unit.modelId,
                                    'specDetail',
                                    e.target.value
                                  )
                                }
                                className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-[10.5px] focus:outline-none focus:border-orange-500"
                              />
                            </div>
                          </>
                        ) : (
                          <div className="flex-1 flex flex-col items-center justify-center text-center py-4 text-[10.5px] text-gray-500 space-y-1.5">
                            <span>Hidden on {unit.shortLabel} customer configurator.</span>
                            <button
                              type="button"
                              onClick={() => handleToggleModelAvailability(plan.id, unit.modelId)}
                              className="px-2.5 py-1 rounded-lg bg-white border border-gray-300 text-gray-700 font-bold text-[10px] hover:bg-gray-50 cursor-pointer"
                            >
                              Enable for {unit.shortLabel}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
