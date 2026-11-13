import React, { useState } from 'react';
import { CustomizationState, FloorPlanId } from '../types';
import { useAppConfig } from '../context/AppConfigContext';
import { BASE_MODELS } from '../data/models';
import {
  FLOOR_PLAN_OPTIONS,
  GLAZING_OPTIONS,
  INTERIOR_DOOR_OPTIONS,
  BATHROOM_DOOR_OPTIONS,
} from '../data/options';
import { formatCurrency as formatCurrencyUtil } from '../utils/currency';
import { getItemPriceForModel, getItemUnitSpec } from '../utils/pricingCalculator';
import { computeLogisticsBreakdown, getLogisticsPreset } from '../utils/logisticsPricing';
import { DoorWindowDiagram } from './ConfiguratorPanel';
import {
  DollarSign,
  Calendar,
  Truck,
  ShieldCheck,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  X,
  CreditCard,
  Download,
  FileText,
  CheckCircle2,
  Clock,
  Sparkles,
  LayoutGrid,
  Lock,
  Grid,
  Ship,
  Wrench,
} from 'lucide-react';

interface CostBuildupPanelProps {
  state: CustomizationState;
  onStateChange: (updater: (prev: CustomizationState) => CustomizationState) => void;
  onOpenReserve: (plan?: 'full' | 'milestone') => void;
  onOpenSpecSheet: () => void;
  onToggleCollapse?: () => void;
  isReserved?: boolean;
  onSelectCategory?: (category: string) => void;
  includeFreight?: boolean;
  setIncludeFreight?: (val: boolean) => void;
  includeSitePrep?: boolean;
  setIncludeSitePrep?: (val: boolean) => void;
}

export const CostBuildupPanel: React.FC<CostBuildupPanelProps> = ({
  state,
  onStateChange,
  onOpenReserve,
  onOpenSpecSheet,
  onToggleCollapse,
  isReserved = false,
  onSelectCategory,
}) => {
  const [isCollapsedMobile, setIsCollapsedMobile] = useState(false);
  const [paymentOption, setPaymentOption] = useState<'full' | 'milestone'>('milestone');
  const [isPaymentRevealed, setIsPaymentRevealed] = useState(false);

  const [showDoorFeaturesModal, setShowDoorFeaturesModal] = useState(false);
  const [doorModalSubFilter, setDoorModalSubFilter] = useState<
    'all' | 'Room Doors' | 'Bathroom Doors' | 'Entrance Doors' | 'Windows'
  >('all');
  const { config } = useAppConfig();

  const currentModel =
    config.models?.find((m: any) => m.id === state.modelId) ||
    BASE_MODELS.find((m: any) => m.id === state.modelId) ||
    config.models?.[0] ||
    BASE_MODELS[0];

  // Lookups for prices
  const wallOpt =
    config.wallOptions.find((o: any) => o.id === state.wallCladding) ||
    config.wallOptions[0];
  const intWallOpt =
    (config.interiorWallOptions || []).find((o: any) => o.id === state.interiorWall) ||
    (config.interiorWallOptions || [])[0];
  const glassOpt =
    config.glazingOptions.find((o: any) => o.id === state.glazing) || config.glazingOptions[0];
  const windowList = (config.glazingOptions || GLAZING_OPTIONS).filter(
    (g: any) => g.category === 'Windows'
  );
  const entranceList = (config.glazingOptions || GLAZING_OPTIONS).filter(
    (g: any) => g.category !== 'Windows'
  );
  const isLegacyWindowSelected = windowList.some((w: any) => w.id === state.glazing);
  const resolvedWindowId =
    state.windowStyle || (isLegacyWindowSelected ? state.glazing : 'sliding-window');
  const resolvedEntranceId = !isLegacyWindowSelected
    ? state.glazing || 'broken-bridge-sliding-door'
    : 'broken-bridge-sliding-door';
  const winOpt = windowList.find((o: any) => o.id === resolvedWindowId) || windowList[0];
  const entranceOpt =
    entranceList.find((o: any) => o.id === resolvedEntranceId) || entranceList[0] || glassOpt;
  const intDoorList =
    config.interiorDoorOptions && config.interiorDoorOptions.length > 0
      ? config.interiorDoorOptions
      : INTERIOR_DOOR_OPTIONS;
  const intDoorOpt =
    intDoorList.find((o: any) => o.id === state.interiorDoor) || intDoorList[0];
  const bathDoorList =
    config.bathroomDoorOptions && config.bathroomDoorOptions.length > 0
      ? config.bathroomDoorOptions
      : BATHROOM_DOOR_OPTIONS;
  const bathDoorOpt =
    bathDoorList.find((o: any) => o.id === state.bathroomDoor) || bathDoorList[0];
  const lightOpt =
    config.lightingOptions.find((o: any) => o.id === state.lightingPackage) ||
    config.lightingOptions[0];
  const elecOpt =
    config.electricalOptions.find((o: any) => o.id === state.electricalTier) ||
    config.electricalOptions[0];
  const floorOpt =
    config.flooringOptions.find((o: any) => o.id === state.flooring) || config.flooringOptions[0];
  const roofOpt =
    config.roofOptions.find((o: any) => o.id === state.roofOption) || config.roofOptions[0];
  const cabOpt =
    config.cabinetryOptions.find((o: any) => o.id === state.cabinetry) || config.cabinetryOptions[0];

  // Active modular addons (excluding any hidden by admin)
  const activeAddons = (config.addons || []).filter(
    (addon: any) => state[addon.id] && addon.isAvailable !== false && addon.isActive !== false
  );

  const isExpandableHouse =
    state.modelId.includes('expandable') ||
    state.modelId.includes('20ft') ||
    state.modelId.includes('30ft') ||
    state.modelId.includes('40ft') ||
    currentModel?.series === 'expandable';

  const floorPlanOpt = isExpandableHouse && state.floorPlan
    ? FLOOR_PLAN_OPTIONS.find((f) => f.id === state.floorPlan)
    : null;
  const floorPlanPrice = floorPlanOpt ? getItemPriceForModel(floorPlanOpt, state.modelId, config.models) : 0;

  const intDoorPrice = getItemPriceForModel(intDoorOpt, state.modelId, config.models);
  const bathDoorPrice = getItemPriceForModel(bathDoorOpt, state.modelId, config.models);
  const winPrice = getItemPriceForModel(winOpt, state.modelId, config.models);
  const entrancePrice = getItemPriceForModel(entranceOpt, state.modelId, config.models);

  // Calculate Subtotal & Total
  const upgradesTotal =
    getItemPriceForModel(wallOpt, state.modelId, config.models) +
    getItemPriceForModel(intWallOpt, state.modelId, config.models) +
    floorPlanPrice +
    entrancePrice +
    (winOpt && entranceOpt && winOpt.id !== entranceOpt.id ? winPrice : 0) +
    intDoorPrice +
    bathDoorPrice +
    getItemPriceForModel(lightOpt, state.modelId, config.models) +
    getItemPriceForModel(elecOpt, state.modelId, config.models) +
    getItemPriceForModel(floorOpt, state.modelId, config.models) +
    getItemPriceForModel(roofOpt, state.modelId, config.models) +
    getItemPriceForModel(cabOpt, state.modelId, config.models) +
    activeAddons.reduce((acc: number, a: any) => acc + getItemPriceForModel(a, state.modelId, config.models), 0);

  const homeFactoryTotal = currentModel.basePrice + upgradesTotal;
  const markupFactor = 1 + ((config.markup || 0) / 100);
  const homeTotalWithMarkup = homeFactoryTotal * markupFactor;

  const logisticsBreakdown = computeLogisticsBreakdown(config.logistics, homeTotalWithMarkup);
  const taxRate = logisticsBreakdown.effectiveTaxPercent;
  const taxAmount = logisticsBreakdown.taxTotalUsd;

  const grandTotal = homeTotalWithMarkup + taxAmount;

  // Itemized Milestone Logistics & Installation breakdown
  const freightCost = logisticsBreakdown.freightStageUsd;
  const clearingTransportCost = logisticsBreakdown.clearingTransportStageUsd;
  const installationCost = logisticsBreakdown.installationPermitsStageUsd;
  const sitePrepCost = clearingTransportCost + installationCost;
  const turnkeyTotal = grandTotal + freightCost + sitePrepCost;

  const formatCurrency = (val: number, opts?: { showPlus?: boolean }) => {
    return formatCurrencyUtil(val, config.currency, {
      ...opts,
      ratesMap: config.exchangeRates,
    });
  };

  return (
    <aside
      id="cost-buildup-panel"
      className="bg-white flex flex-col h-full overflow-hidden"
      style={{ '--primary': config.branding.primaryColor } as React.CSSProperties}
    >
      {/* Panel Header */}
      <div className="p-3.5 sm:p-4 border-b border-gray-100 bg-[#FAFAFC] flex items-center justify-between gap-2 shrink-0">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-orange-600 shrink-0" />
            <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-wider truncate">
              Investment Breakdown
            </h2>
          </div>
          <p className="text-[10px] text-gray-500 mt-0.5 truncate">Transparent factory direct pricing</p>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setIsCollapsedMobile(!isCollapsedMobile)}
          className="lg:hidden p-1.5 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 cursor-pointer shrink-0"
        >
          {isCollapsedMobile ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronUp className="w-4 h-4" />
          )}
        </button>

        {/* Desktop Hide / Collapse Button */}
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-gray-500 hover:text-gray-950 hover:bg-gray-200/70 transition-colors cursor-pointer group shrink-0"
            title="Hide Investment Breakdown (expands 3D viewer)"
          >
            <span>Hide</span>
            <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div
        className={`flex-1 overflow-y-auto p-3 sm:p-3.5 space-y-4 overscroll-contain scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent hover:scrollbar-thumb-gray-300 ${
          isCollapsedMobile ? 'hidden lg:block' : 'block'
        }`}
      >
        {/* 10Apples Brand & Direct Production Header */}
        <div className="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-orange-50/70 border border-orange-200/80 shadow-2xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-orange-600 animate-pulse shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-black text-gray-950 uppercase tracking-wider truncate">
                  {config.branding?.brandName || '10Apples'} Home Customizer
                </span>
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-md bg-orange-200/70 text-orange-900 border border-orange-300 shrink-0">
                  Direct
                </span>
              </div>
              <p className="text-[10px] text-gray-600 font-medium leading-none mt-0.5 truncate">
                Precision modular architecture &amp; turnkey factory build
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold text-orange-950 bg-white px-2 py-0.5 rounded-xl border border-orange-200 shadow-2xs shrink-0">
            Series 2026
          </span>
        </div>

        {/* Total Price Bento Card */}
        <div className="bg-[#F8F9FB] rounded-2xl p-3.5 sm:p-4 border border-gray-200 relative overflow-hidden">
          <div className="flex items-center justify-between gap-2 text-xs text-gray-500">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 truncate">Total Customized Cost</span>
            <span className="font-mono text-orange-700 font-bold text-[10px] flex items-center gap-1 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200 shrink-0">
              <Clock className="w-3 h-3" /> {currentModel.leadTime || '10-12 Weeks'}
            </span>
          </div>

          <div className="mt-1.5 text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-gray-950 truncate">
            {formatCurrency(grandTotal)}
          </div>
          <div className="text-[10px] text-gray-500 font-medium mt-1 leading-snug">
            {config.branding?.brandName || '10Apples'} factory build cost · Freight &amp; foundation fees calculated at checkout
          </div>

          <div className="mt-2.5 pt-2.5 border-t border-gray-200 flex items-center justify-between gap-2 text-xs">
            <span className="text-gray-500 font-medium truncate">Financing Options</span>
            <span className="font-bold text-orange-800 text-[11px] bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200 shrink-0">
              Supporting Banks
            </span>
          </div>
          <div className="text-[10px] text-gray-500 mt-1 leading-snug">
            Financing options are managed entirely by our supporting banks. We do not provide monthly financing on our platform.
          </div>
        </div>

        {/* Itemized Buildup List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
            <span>Itemized Specs</span>
            <span className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-wider">Live Sync</span>
          </div>

          <div className="space-y-2 text-xs">
            {/* Base Home Model */}
            <div className="flex items-center justify-between gap-2 p-2.5 sm:p-3 rounded-2xl bg-[#F8F9FB] border border-gray-200/80">
              <div className="min-w-0">
                <div className="font-bold text-gray-900 truncate">{currentModel.name}</div>
                <div className="text-[11px] text-gray-500 truncate">
                  {currentModel.sqft} sq ft • {currentModel.dimensions.metricStr}
                </div>
              </div>
              <span className="font-mono font-bold text-gray-900 shrink-0">
                {formatCurrency(currentModel.basePrice * markupFactor)}
              </span>
            </div>

            {/* Double-Wing Floor Plan Layout */}
            {isExpandableHouse && floorPlanOpt && (
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-blue-50/50 border border-blue-200/80">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-5 h-5 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                    <LayoutGrid className="w-3 h-3 text-blue-700" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900 leading-tight truncate">{floorPlanOpt.name}</div>
                    <div className="text-[10px] text-blue-900/70 font-medium truncate">
                      Floor plan · {floorPlanOpt.bedrooms} Bed, {floorPlanOpt.bathrooms} Bath
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="font-mono font-bold text-gray-900">
                    {floorPlanPrice === 0
                      ? 'Included'
                      : `+${formatCurrency(floorPlanPrice * markupFactor)}`}
                  </span>
                  {floorPlanPrice > 0 && (
                    <button
                      onClick={() =>
                        onStateChange((prev) => ({
                          ...prev,
                          floorPlan: '2-bed-1-bath',
                          bedroomLayout: '2-bedroom',
                        }))
                      }
                      className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                      title="Revert to standard 2-Bed layout"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Custom Wall Cladding */}
            {getItemPriceForModel(wallOpt, state.modelId, config.models) > 0 && (
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white border border-gray-200">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-gray-300 shrink-0"
                    style={{ backgroundColor: wallOpt.color }}
                  />
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900 truncate">{wallOpt.name}</div>
                    <div className="text-[10px] text-gray-400 truncate">Wall Panels</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="font-mono font-bold text-gray-900">
                    +{formatCurrency(getItemPriceForModel(wallOpt, state.modelId, config.models) * markupFactor)}
                  </span>
                  <button
                    onClick={() =>
                      onStateChange((prev) => ({
                        ...prev,
                        wallCladding: 'fluoro-white',
                      }))
                    }
                    className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                    title="Revert to standard"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Interior Wall Panels */}
            {intWallOpt && getItemPriceForModel(intWallOpt, state.modelId, config.models) > 0 && (
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white border border-gray-200">
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 truncate">{intWallOpt.name}</div>
                  <div className="text-[10px] text-gray-400 truncate">Indoor Wall Panels</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="font-mono font-bold text-gray-900">
                    +{formatCurrency(getItemPriceForModel(intWallOpt, state.modelId, config.models) * markupFactor)}
                  </span>
                  <button
                    onClick={() =>
                      onStateChange((prev) => ({
                        ...prev,
                        interiorWall: 'bamboo-charcoal-offwhite',
                      }))
                    }
                    className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                    title="Revert to standard"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Perimeter Windows */}
            <div
              onClick={() => {
                setDoorModalSubFilter('Windows');
                setShowDoorFeaturesModal(true);
                if (onSelectCategory) onSelectCategory('Glazing & Windows');
              }}
              className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white border border-gray-200 hover:border-sky-300 hover:bg-sky-50/40 transition-all cursor-pointer group"
              title="Click to customize perimeter windows"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-sky-100 flex items-center justify-center shrink-0 text-xs group-hover:scale-105 transition-transform">
                  🪟
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 leading-tight truncate">
                    {winOpt?.name || 'Sliding window'}
                  </div>
                  <div className="text-[10px] text-gray-500 font-medium truncate flex items-center gap-1 mt-0.5">
                    <span>Perimeter Windows</span>
                    <span className="text-sky-600 font-semibold group-hover:underline">· Change</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[10px]">
                  {winPrice === 0 ? 'Included ($0)' : `+${formatCurrency(winPrice * markupFactor)}`}
                </span>
                {onSelectCategory && (
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-sky-600 group-hover:translate-x-0.5 transition-transform" />
                )}
              </div>
            </div>

            {/* Main Entrance Door */}
            <div
              onClick={() => {
                setDoorModalSubFilter('Entrance Doors');
                setShowDoorFeaturesModal(true);
                if (onSelectCategory) onSelectCategory('Glazing & Windows');
              }}
              className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white border border-gray-200 hover:border-orange-300 hover:bg-orange-50/40 transition-all cursor-pointer group"
              title="Click to view or change Main Entrance Door style"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-orange-100 flex items-center justify-center shrink-0 text-xs group-hover:scale-105 transition-transform">
                  🚪
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 leading-tight truncate">
                    {entranceOpt?.name || 'Broken bridge aluminum sliding door'}
                  </div>
                  <div className="text-[10px] text-gray-500 font-medium truncate flex items-center gap-1 mt-0.5">
                    <span>Main Entrance Door</span>
                    <span className="text-orange-600 font-semibold group-hover:underline">· Change</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[10px]">
                  {entrancePrice === 0 ? 'Included ($0)' : `+${formatCurrency(entrancePrice * markupFactor)}`}
                </span>
                {onSelectCategory && (
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-orange-600 group-hover:translate-x-0.5 transition-transform" />
                )}
              </div>
            </div>

            {/* Interior Room Doors */}
            <div
              onClick={() => {
                setDoorModalSubFilter('Room Doors');
                setShowDoorFeaturesModal(true);
                if (onSelectCategory) onSelectCategory('Glazing & Windows');
              }}
              className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/40 transition-all cursor-pointer group"
              title="Click to customize interior bedroom & partition doors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-4 h-4 rounded-md border border-gray-300 shrink-0"
                  style={{ backgroundColor: intDoorOpt?.color || '#c89f72' }}
                />
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 leading-tight truncate">
                    {intDoorOpt?.name || 'Nordic Oak Solid-Core Flush Door'}
                  </div>
                  <div className="text-[10px] text-gray-500 font-medium truncate flex items-center gap-1 mt-0.5">
                    <span>Interior Room Doors</span>
                    <span className="text-indigo-600 font-semibold group-hover:underline">· Customize</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {intDoorPrice === 0 ? (
                  <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[10px]">
                    Included
                  </span>
                ) : (
                  <>
                    <span className="font-mono font-bold text-gray-900">
                      +{formatCurrency(intDoorPrice * markupFactor)}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onStateChange((prev) => ({
                          ...prev,
                          interiorDoor: 'room-solid-flush-oak',
                        }));
                      }}
                      className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                      title="Revert to standard Nordic Oak door"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Bathroom Doors */}
            <div
              onClick={() => {
                setDoorModalSubFilter('Bathroom Doors');
                setShowDoorFeaturesModal(true);
                if (onSelectCategory) onSelectCategory('Glazing & Windows');
              }}
              className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/40 transition-all cursor-pointer group"
              title="Click to customize waterproof bathroom doors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-4 h-4 rounded-md border border-gray-300 shrink-0"
                  style={{ backgroundColor: bathDoorOpt?.color || '#f8fafc' }}
                />
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 leading-tight truncate">
                    {bathDoorOpt?.name || 'WPC Waterproof Matte White Restroom Door'}
                  </div>
                  <div className="text-[10px] text-gray-500 font-medium truncate flex items-center gap-1 mt-0.5">
                    <span>Bathroom Door</span>
                    <span className="text-emerald-600 font-semibold group-hover:underline">· Customize</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {bathDoorPrice === 0 ? (
                  <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[10px]">
                    Included
                  </span>
                ) : (
                  <>
                    <span className="font-mono font-bold text-gray-900">
                      +{formatCurrency(bathDoorPrice * markupFactor)}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onStateChange((prev) => ({
                          ...prev,
                          bathroomDoor: 'bath-wpc-waterproof-white',
                        }));
                      }}
                      className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                      title="Revert to standard WPC waterproof white door"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Lighting */}
            {getItemPriceForModel(lightOpt, state.modelId, config.models) > 0 && (
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white border border-gray-200">
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 truncate">{lightOpt.name}</div>
                  <div className="text-[10px] text-gray-400 truncate">Lighting Architecture</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="font-mono font-bold text-gray-900">
                    +{formatCurrency(getItemPriceForModel(lightOpt, state.modelId, config.models) * markupFactor)}
                  </span>
                  <button
                    onClick={() =>
                      onStateChange((prev) => ({
                        ...prev,
                        lightingPackage: 'standard-recessed',
                      }))
                    }
                    className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                    title="Revert to standard"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Electrical */}
            {getItemPriceForModel(elecOpt, state.modelId, config.models) > 0 && (
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white border border-gray-200">
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 truncate">{elecOpt.name}</div>
                  <div className="text-[10px] text-gray-400 truncate">Electrical Load Center</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="font-mono font-bold text-gray-900">
                    +{formatCurrency(getItemPriceForModel(elecOpt, state.modelId, config.models) * markupFactor)}
                  </span>
                  <button
                    onClick={() =>
                      onStateChange((prev) => ({
                        ...prev,
                        electricalTier: 'standard-100a',
                      }))
                    }
                    className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                    title="Revert to standard"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Flooring */}
            {getItemPriceForModel(floorOpt, state.modelId, config.models) > 0 && (
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white border border-gray-200">
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 truncate">{floorOpt.name}</div>
                  <div className="text-[10px] text-gray-400 truncate">Flooring Upgrade</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="font-mono font-bold text-gray-900">
                    +{formatCurrency(getItemPriceForModel(floorOpt, state.modelId, config.models) * markupFactor)}
                  </span>
                  <button
                    onClick={() =>
                      onStateChange((prev) => ({
                        ...prev,
                        flooring: 'spc-nordic-oak',
                      }))
                    }
                    className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                    title="Revert to standard"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Roof Option */}
            {getItemPriceForModel(roofOpt, state.modelId, config.models) > 0 && (
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white border border-gray-200">
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 truncate">{roofOpt.name}</div>
                  <div className="text-[10px] text-gray-400 truncate">Roof &amp; Energy</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="font-mono font-bold text-gray-900">
                    +{formatCurrency(getItemPriceForModel(roofOpt, state.modelId, config.models) * markupFactor)}
                  </span>
                  <button
                    onClick={() =>
                      onStateChange((prev) => ({
                        ...prev,
                        roofOption: 'standard-parapet',
                      }))
                    }
                    className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                    title="Revert to standard"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Cabinetry Option */}
            {getItemPriceForModel(cabOpt, state.modelId, config.models) > 0 && (
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white border border-gray-200">
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 truncate">{cabOpt.name}</div>
                  <div className="text-[10px] text-gray-400 truncate">Cabinetry Finish</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="font-mono font-bold text-gray-900">
                    +{formatCurrency(getItemPriceForModel(cabOpt, state.modelId, config.models) * markupFactor)}
                  </span>
                  <button
                    onClick={() =>
                      onStateChange((prev) => ({
                        ...prev,
                        cabinetry: 'matte-black',
                      }))
                    }
                    className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                    title="Revert to standard"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Active Modular Add-ons */}
            {activeAddons.map((addon) => {
              const unitPrice = getItemPriceForModel(addon, state.modelId, config.models);
              const unitSpec = getItemUnitSpec(addon, state.modelId);
              const isDefaultModule = addon.id === 'hasLuxuryBathPod' || addon.id === 'hasKitchenetteModule';

              return (
                <div
                  key={addon.id}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white border border-gray-200"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-gray-900 truncate">{addon.name}</span>
                      {unitSpec.sizeLabel && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-orange-100 text-orange-800 shrink-0">
                          {unitSpec.sizeLabel}
                        </span>
                      )}
                      {isDefaultModule && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-blue-50 text-blue-800 border border-blue-200 shrink-0">
                          Standard
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-gray-400 truncate">{addon.category}</div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="font-mono font-bold text-gray-900">
                      +{formatCurrency(unitPrice * markupFactor)}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        onStateChange((prev) => ({
                          ...prev,
                          [addon.id]: false,
                        }))
                      }
                      className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                      title={`Remove ${addon.name} from house`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Notification & Quick Re-add if Bath Pod or Kitchenette was removed */}
            {isExpandableHouse && (!state.hasLuxuryBathPod || !state.hasKitchenetteModule) && (
              <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/90 text-xs flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2 text-amber-900">
                  <span className="text-[10px] font-black uppercase tracking-wider truncate">
                    Removed Standard Modules
                  </span>
                  <span className="text-[10px] text-amber-700 font-medium shrink-0">Shell layout</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {!state.hasLuxuryBathPod && (
                    <button
                      type="button"
                      onClick={() =>
                        onStateChange((prev) => ({
                          ...prev,
                          hasLuxuryBathPod: true,
                        }))
                      }
                      className="px-2 py-1 rounded-lg bg-white hover:bg-amber-100 text-amber-900 font-bold border border-amber-300 text-[10px] flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                    >
                      <span>+ Re-add Bath Pod</span>
                    </button>
                  )}
                  {!state.hasKitchenetteModule && (
                    <button
                      type="button"
                      onClick={() =>
                        onStateChange((prev) => ({
                          ...prev,
                          hasKitchenetteModule: true,
                        }))
                      }
                      className="px-2 py-1 rounded-lg bg-white hover:bg-amber-100 text-amber-900 font-bold border border-amber-300 text-[10px] flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                    >
                      <span>+ Re-add Kitchenette</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Itemized Logistics, Duties, Permits & Tax Rates */}
        {logisticsBreakdown.enabledItems.length > 0 && (
          <div className="pt-2 border-t border-gray-100 space-y-2 text-xs">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-gray-400">
              <span>Logistics, Duties, Permits &amp; Taxes</span>
              <span className="font-mono text-gray-600">
                +{formatCurrency(logisticsBreakdown.totalLogisticsAndTaxesUsd)}
              </span>
            </div>
            <div className="space-y-1.5">
              {logisticsBreakdown.enabledItems.map((fee) => (
                <div
                  key={fee.id}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-gray-200 bg-white"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-gray-900 truncate">{fee.name}</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded border shrink-0 ${getLogisticsPreset(fee.category).badgeClass}`}
                      >
                        {fee.pricingType === 'percent'
                          ? `${fee.amount}%`
                          : getLogisticsPreset(fee.category).shortLabel}
                      </span>
                    </div>
                    {fee.description && (
                      <div className="text-[10px] text-gray-400 truncate mt-0.5">{fee.description}</div>
                    )}
                  </div>
                  <span className="font-mono font-bold text-gray-900 shrink-0">
                    +{formatCurrency(fee.calculatedUsd)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Guarantees Bento Card */}
        <div className="p-3.5 bg-[#F8F9FB] rounded-2xl border border-gray-200 space-y-2.5 text-[11px] text-gray-600">
          <div className="flex items-center gap-2 font-bold text-gray-900">
            <ShieldCheck className="w-4 h-4 shrink-0 text-orange-600" />
            <span className="truncate">{config.branding?.brandName || '10Apples'} Commitment</span>
          </div>
          <div className="space-y-1.5 text-[10px] text-gray-600">
            <div className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>50-Year Structural Steel Frame Warranty</span>
            </div>
            <div className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>Class-A Fire Prevention &amp; 40dB Sound Isolation</span>
            </div>
            <div className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>Category 5 Hurricane / Level 12 Typhoon Resistance</span>
            </div>
            <div className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>{formatCurrency(config.branding.reservationFee ?? 250)} Fully Refundable Queue Slot</span>
            </div>
          </div>
          {config.branding.supportEmail && (
            <div className="mt-2 pt-2 border-t border-gray-200 text-[10px] truncate">
              Questions? Contact <a href={`mailto:${config.branding.supportEmail}`} className="font-bold hover:underline text-orange-600">{config.branding.supportEmail}</a>
            </div>
          )}
        </div>
      </div>

      {/* Persistent Bottom Action Drawer */}
      <div className="p-3 sm:p-3.5 border-t border-gray-100 bg-white space-y-2 shrink-0 transition-all">
        {/* Toggle / Header Bar */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <CreditCard className="w-3.5 h-3.5 text-orange-600 shrink-0" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-900 truncate">
              Payment &amp; Turnkey Plan
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-orange-100 text-orange-800 border border-orange-200 shrink-0">
              {paymentOption === 'milestone' ? '4 Milestones' : 'Full Invoice'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsPaymentRevealed(!isPaymentRevealed)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all border cursor-pointer shrink-0 ${
              isPaymentRevealed
                ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200'
                : 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200 shadow-2xs'
            }`}
            title={isPaymentRevealed ? 'Hide payment schedule and options' : 'Reveal payment schedule and options'}
          >
            <span>{isPaymentRevealed ? 'Hide' : 'Reveal'}</span>
            {isPaymentRevealed ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* REVEALED CONTENT: Detailed payment selector and milestone schedule */}
        {isPaymentRevealed && (
          <div className="space-y-2 pt-1 animate-in fade-in duration-200">
            {/* Payment Plan Selector Tabs */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                <span>Select Plan</span>
                <span className="text-orange-700 normal-case font-semibold">
                  {paymentOption === 'milestone' ? 'Pay stage by stage' : 'Single lump-sum invoice'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1 p-1 bg-gray-100 rounded-xl border border-gray-200/80 text-xs font-bold">
                <div
                  onClick={() => setPaymentOption('milestone')}
                  className={`py-1.5 px-2 rounded-lg transition-all cursor-pointer text-center truncate ${
                    paymentOption === 'milestone'
                      ? 'bg-white text-gray-900 shadow-xs font-black'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                  role="button"
                  tabIndex={0}
                >
                  <span>Milestone Plan</span>
                </div>
                <div
                  onClick={() => setPaymentOption('full')}
                  className={`py-1.5 px-2 rounded-lg transition-all cursor-pointer text-center truncate ${
                    paymentOption === 'full'
                      ? 'bg-white text-gray-900 shadow-xs font-black'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                  role="button"
                  tabIndex={0}
                >
                  <span>Full Payment</span>
                </div>
              </div>
            </div>

            {/* Milestone Schedule or Full Payment Summary */}
            {paymentOption === 'milestone' ? (
              <div className="space-y-1.5 p-2.5 rounded-xl bg-orange-50/40 border border-orange-200/80 text-xs">
                <div className="flex items-center justify-between text-[11px] font-black text-orange-950 uppercase tracking-wider">
                  <span>Milestone Schedule</span>
                  <span className="font-mono text-[9px] bg-white px-1.5 py-0.2 rounded font-bold border border-orange-200 text-orange-800">
                    Stage-by-Stage
                  </span>
                </div>

                <div className="space-y-1 text-[11px]">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-gray-700 font-semibold truncate">1. 🏠 House Build (Separate):</span>
                    <span className="font-mono font-bold text-gray-950 shrink-0">{formatCurrency(grandTotal)}</span>
                  </div>
                  <div className="text-[10px] text-gray-400 pl-4 pb-0.5">
                    ↳ Paid separately upfront to start manufacturing
                  </div>

                  <div className="flex items-center justify-between gap-1">
                    <span className="text-gray-700 font-semibold truncate">2. 🚢 Int'l Freight &amp; Insurance:</span>
                    <span className="font-mono font-bold text-gray-950 shrink-0">{formatCurrency(freightCost)}</span>
                  </div>
                  <div className="text-[10px] text-gray-400 pl-4 pb-0.5">
                    ↳ Paid after factory finishes manufacturing
                  </div>

                  <div className="flex items-center justify-between gap-1">
                    <span className="text-gray-700 font-semibold truncate">3. 🚚 Customs &amp; Local Logistics:</span>
                    <span className="font-mono font-bold text-gray-950 shrink-0">{formatCurrency(clearingTransportCost)}</span>
                  </div>
                  <div className="text-[10px] text-gray-400 pl-4 pb-0.5">
                    ↳ Paid when container arrives at destination port
                  </div>

                  <div className="flex items-center justify-between gap-1">
                    <span className="text-gray-700 font-semibold truncate">4. 🏗️ Site Prep, Permits &amp; Install:</span>
                    <span className="font-mono font-bold text-gray-950 shrink-0">{formatCurrency(installationCost)}</span>
                  </div>
                  <div className="text-[10px] text-gray-400 pl-4 pb-0.5">
                    ↳ Paid upon arrival on site for installation
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1.5 border-t border-orange-200/80 font-bold text-xs text-orange-950">
                  <span>Total Turnkey Package:</span>
                  <span className="font-mono text-orange-900 font-black">{formatCurrency(turnkeyTotal)}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5 p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs">
                <div className="flex items-center justify-between text-[11px] font-black text-gray-900 uppercase tracking-wider">
                  <span>Full Turnkey Payment</span>
                  <span className="font-mono text-[9px] bg-white px-1.5 py-0.2 rounded font-bold border border-gray-200 text-gray-700">
                    Single Invoice
                  </span>
                </div>
                <div className="space-y-1 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">House Build{taxAmount > 0 ? ` + Taxes (${taxRate}%)` : ''}:</span>
                    <span className="font-mono font-bold text-gray-950">{formatCurrency(grandTotal)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Logistics, Customs, Permits &amp; Install:</span>
                    <span className="font-mono font-bold text-gray-950">{formatCurrency(freightCost + sitePrepCost)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1.5 border-t border-gray-200 font-bold text-xs text-gray-950">
                  <span>Total Turnkey Investment:</span>
                  <span className="font-mono text-orange-700 font-black">{formatCurrency(turnkeyTotal)}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* When HIDDEN: Compact summary row */}
        {!isPaymentRevealed && (
          <div className="flex items-center justify-between text-xs py-0.5 px-1 bg-gray-50/70 rounded-xl border border-gray-100">
            <span className="text-gray-500 font-medium">Turnkey Package:</span>
            <span className="font-mono font-black text-gray-950">
              {formatCurrency(turnkeyTotal)}
            </span>
          </div>
        )}

        {/* Primary Action Button */}
        <button
          onClick={() => onOpenReserve(paymentOption)}
          style={{ backgroundColor: config.branding.primaryColor }}
          className="w-full py-3 px-4 hover:opacity-95 active:scale-[0.99] text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
        >
          <CreditCard className="w-4 h-4" />
          <span>
            {paymentOption === 'milestone'
              ? `Proceed with Milestone Plan (${formatCurrency(config.branding.reservationFee ?? 250)} Deposit)`
              : `Proceed with Full Payment (${formatCurrency(config.branding.reservationFee ?? 250)} Deposit)`}
          </span>
        </button>

        {isPaymentRevealed && (
          <p className="text-[10px] text-center text-gray-400 font-medium leading-tight">
            {paymentOption === 'milestone'
              ? 'Milestone: Pay for the house separately. Pay international freight when manufacturing finishes. Pay clearing, transport & installation when your container arrives.'
              : 'Full Payment: Comprehensive turnkey invoice for the house, shipping, customs clearance, and certified on-site installation.'}
          </p>
        )}
      </div>
      {/* Interactive Door & Window Features Modal */}
      {showDoorFeaturesModal && (() => {
        const roomDoorChoices = (
          config.interiorDoorOptions && config.interiorDoorOptions.length > 0
            ? config.interiorDoorOptions
            : INTERIOR_DOOR_OPTIONS
        )
          .filter((o: any) => o.isAvailable !== false && o.isActive !== false)
          .map((o: any) => ({ ...o, _kind: 'room' as const }));

        const bathDoorChoices = (
          config.bathroomDoorOptions && config.bathroomDoorOptions.length > 0
            ? config.bathroomDoorOptions
            : BATHROOM_DOOR_OPTIONS
        )
          .filter((o: any) => o.isAvailable !== false && o.isActive !== false)
          .map((o: any) => ({ ...o, _kind: 'bath' as const }));

        const glazingChoices = (
          config.glazingOptions && config.glazingOptions.length > 0
            ? config.glazingOptions
            : GLAZING_OPTIONS
        )
          .filter((o: any) => o.isAvailable !== false && o.isActive !== false);

        const entranceChoices = glazingChoices
          .filter((o: any) => o.category !== 'Windows')
          .map((o: any) => ({ ...o, _kind: 'entrance' as const }));
        const windowChoices = glazingChoices
          .filter((o: any) => o.category === 'Windows')
          .map((o: any) => ({ ...o, _kind: 'window' as const }));

        const visibleChoices =
          doorModalSubFilter === 'Room Doors'
            ? roomDoorChoices
            : doorModalSubFilter === 'Bathroom Doors'
            ? bathDoorChoices
            : doorModalSubFilter === 'Entrance Doors'
            ? entranceChoices
            : doorModalSubFilter === 'Windows'
            ? windowChoices
            : [...windowChoices, ...entranceChoices, ...roomDoorChoices, ...bathDoorChoices];

        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setShowDoorFeaturesModal(false)}
          >
            <div
              className="bg-white rounded-3xl shadow-2xl border border-gray-200 max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-[#FAFAFC]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center text-lg font-bold shadow-2xs">
                    🚪
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-extrabold text-gray-900 text-base sm:text-lg">
                        Doors &amp; Window Systems
                      </h3>
                      <span className="text-[10px] font-bold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                        4 Independent Systems
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Independently change Perimeter Windows, Main Entrance Door, Room Doors, and Bathroom Doors.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDoorFeaturesModal(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 px-5 pt-3 pb-2 border-b border-gray-100 bg-white overflow-x-auto scrollbar-none">
                {[
                  {
                    id: 'all',
                    label: `All (${windowChoices.length + entranceChoices.length + roomDoorChoices.length + bathDoorChoices.length})`,
                  },
                  { id: 'Windows', label: `Windows (${windowChoices.length})` },
                  { id: 'Entrance Doors', label: `Main Entrance (${entranceChoices.length})` },
                  { id: 'Room Doors', label: `Room Doors (${roomDoorChoices.length})` },
                  { id: 'Bathroom Doors', label: `Bathroom Doors (${bathDoorChoices.length})` },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setDoorModalSubFilter(tab.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      doorModalSubFilter === tab.id
                        ? 'bg-zinc-900 text-white shadow-xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Modal List Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
                {visibleChoices.map((opt: any) => {
                  const isSelected =
                    opt._kind === 'room'
                      ? (state.interiorDoor || 'room-solid-flush-oak') === opt.id
                      : opt._kind === 'bath'
                      ? (state.bathroomDoor || 'bath-wpc-waterproof-white') === opt.id
                      : opt._kind === 'window'
                      ? resolvedWindowId === opt.id
                      : resolvedEntranceId === opt.id;

                  const rawPrice = getItemPriceForModel(opt, state.modelId, config.models);
                  const displayPrice = rawPrice * markupFactor;

                  return (
                    <div
                      key={`${opt._kind}-${opt.id}`}
                      onClick={() => {
                        onStateChange((prev) => {
                          if (opt._kind === 'room') return { ...prev, interiorDoor: opt.id };
                          if (opt._kind === 'bath') return { ...prev, bathroomDoor: opt.id };
                          if (opt._kind === 'window') return { ...prev, windowStyle: opt.id };
                          return { ...prev, glazing: opt.id };
                        });
                        if (onSelectCategory) onSelectCategory('Glazing & Windows');
                      }}
                      className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 cursor-pointer ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50/30 ring-2 ring-orange-500/20 shadow-xs'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 flex-1 min-w-0">
                        <div className="w-16 h-14 rounded-xl bg-slate-50 border border-gray-200 shrink-0 p-1 flex items-center justify-center">
                          <DoorWindowDiagram id={opt.id} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-gray-900 text-sm">{opt.name}</span>
                            {opt.badge && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-900 text-white shadow-2xs">
                                {opt.badge}
                              </span>
                            )}
                            <span
                              className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border ${
                                rawPrice === 0
                                  ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
                                  : 'text-orange-800 bg-orange-50 border-orange-200'
                              }`}
                            >
                              {rawPrice === 0 ? 'Included ($0)' : formatCurrency(displayPrice, { showPlus: true })}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                            {opt.description}
                          </p>
                          {opt.specDetail && (
                            <p className="text-[10px] text-gray-400 font-mono mt-1">
                              Tech Spec: {opt.specDetail}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {isSelected ? (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-600 text-white text-xs font-bold shadow-xs">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Selected</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-zinc-900 hover:text-white text-gray-700 text-xs font-bold transition-colors cursor-pointer"
                          >
                            Apply Style
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-100 bg-[#FAFAFC] flex items-center justify-between gap-3">
                <span className="text-xs text-gray-500">
                  Changes immediately update your 3D interior &amp; exterior model and factory build price.
                </span>
                <button
                  type="button"
                  onClick={() => setShowDoorFeaturesModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs shrink-0"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </aside>
  );
};
