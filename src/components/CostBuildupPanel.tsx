import React, { useState } from 'react';
import { CustomizationState, FloorPlanId } from '../types';
import { useAppConfig } from '../context/AppConfigContext';
import { BASE_MODELS } from '../data/models';
import { FLOOR_PLAN_OPTIONS, GLAZING_OPTIONS } from '../data/options';
import { formatCurrency as formatCurrencyUtil } from '../utils/currency';
import { getItemPriceForModel, getItemUnitSpec } from '../utils/pricingCalculator';
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
} from 'lucide-react';

interface CostBuildupPanelProps {
  state: CustomizationState;
  onStateChange: (updater: (prev: CustomizationState) => CustomizationState) => void;
  onOpenReserve: () => void;
  onOpenSpecSheet: () => void;
  onToggleCollapse?: () => void;
  isReserved?: boolean;
  onSelectCategory?: (category: string) => void;
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
  const [includeFreight, setIncludeFreight] = useState(true);
  const [includeSitePrep, setIncludeSitePrep] = useState(true);
  const [showDoorFeaturesModal, setShowDoorFeaturesModal] = useState(false);
  const [doorModalSubFilter, setDoorModalSubFilter] = useState<'all' | 'Entrance Doors' | 'Windows'>('all');
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

  const freightCost = includeFreight ? (config.logistics?.freightCost || 4500) : 0;
  const sitePrepCost = includeSitePrep ? (config.logistics?.sitePrepCost || 5500) : 0;

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

  // Calculate Subtotal & Total
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

  const homeFactoryTotal = currentModel.basePrice + upgradesTotal;
  const markupFactor = 1 + ((config.markup || 0) / 100);
  const homeTotalWithMarkup = homeFactoryTotal * markupFactor;
  
  const taxRate = config.logistics?.taxRate || 0;
  const taxAmount = (homeTotalWithMarkup + freightCost + sitePrepCost) * (taxRate / 100);
  
  const grandTotal = homeTotalWithMarkup + freightCost + sitePrepCost + taxAmount;

  // Monthly financing calculation: 30 yr @ 6.25% APR with 15% down
  const principal = grandTotal * 0.85;
  const monthlyRate = 0.0625 / 12;
  const nMonths = 360;
  const monthlyPayment = Math.round(
    (principal * (monthlyRate * Math.pow(1 + monthlyRate, nMonths))) /
      (Math.pow(1 + monthlyRate, nMonths) - 1)
  );

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
      <div className="p-4 border-b border-gray-100 bg-[#FAFAFC] flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />
            <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em]">
              Investment Breakdown
            </h2>
          </div>
          <p className="text-[11px] text-gray-500 mt-0.5">Transparent factory direct pricing</p>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setIsCollapsedMobile(!isCollapsedMobile)}
          className="lg:hidden p-1.5 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 cursor-pointer"
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
            className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-gray-500 hover:text-gray-950 hover:bg-gray-200/70 transition-colors cursor-pointer group"
            title="Hide Investment Breakdown (expands 3D viewer)"
          >
            <span>Hide</span>
            <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div
        className={`flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 ${
          isCollapsedMobile ? 'hidden lg:block' : 'block'
        }`}
      >
        {/* Total Price Bento Card */}
        <div className="bg-[#F8F9FB] rounded-2xl p-4 sm:p-5 border border-gray-200 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Total Configured Cost</span>
            <span className="font-mono text-[var(--primary)] font-bold text-[11px] flex items-center gap-1 bg-[var(--primary)/10] px-2 py-0.5 rounded-full border border-[var(--primary)/20]">
              <Clock className="w-3 h-3" /> {currentModel.leadTime}
            </span>
          </div>

          <div className="mt-2 text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-gray-950">
            {formatCurrency(grandTotal)}
          </div>

          <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between text-xs">
            <span className="text-gray-500 font-medium">Estimated Financing</span>
            <span className="font-bold text-gray-900 font-mono">
              {formatCurrency(monthlyPayment)}/mo*
            </span>
          </div>
          <div className="text-[10px] text-gray-400 mt-1">
            *Est. 30-year fixed @ 6.25% APR with 15% down.
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
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F8F9FB] border border-gray-200/80">
              <div>
                <div className="font-bold text-gray-900">{currentModel.name}</div>
                <div className="text-[11px] text-gray-500">
                  {currentModel.sqft} sq ft • {currentModel.dimensions.metricStr}
                </div>
              </div>
              <span className="font-mono font-bold text-gray-900">
                {formatCurrency(currentModel.basePrice * markupFactor)}
              </span>
            </div>

            {/* Double-Wing Floor Plan Layout */}
            {isExpandableHouse && floorPlanOpt && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50/50 border border-blue-200/80">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                    <LayoutGrid className="w-3 h-3 text-blue-700" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 leading-tight">{floorPlanOpt.name}</div>
                    <div className="text-[10px] text-blue-900/70 font-medium">
                      Floor plan · {floorPlanOpt.bedrooms} Bed, {floorPlanOpt.bathrooms} Bath
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
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
                      className="text-gray-400 hover:text-red-500 p-0.5 cursor-pointer"
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
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-gray-200">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-gray-300"
                    style={{ backgroundColor: wallOpt.color }}
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{wallOpt.name}</div>
                    <div className="text-[10px] text-gray-400">Wall Panels</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
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
                    className="text-gray-400 hover:text-red-500 p-0.5 cursor-pointer"
                    title="Revert to standard"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Interior Wall Panels */}
            {intWallOpt && getItemPriceForModel(intWallOpt, state.modelId, config.models) > 0 && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-gray-200">
                <div>
                  <div className="font-semibold text-gray-900">{intWallOpt.name}</div>
                  <div className="text-[10px] text-gray-400">Indoor Wall Panels & Acoustic Slats</div>
                </div>
                <div className="flex items-center gap-2">
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
                    className="text-gray-400 hover:text-red-500 p-0.5 cursor-pointer"
                    title="Revert to standard"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Standard Entrance Door & Windows (Included at no other cost) */}
            <div
              onClick={() => {
                setShowDoorFeaturesModal(true);
                if (onSelectCategory) onSelectCategory('Glazing & Windows');
              }}
              className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-gray-200 hover:border-orange-300 hover:bg-orange-50/40 transition-all cursor-pointer group"
              title="Click to view door or window features and select style at no additional cost ($0)"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-lg bg-orange-100 flex items-center justify-center shrink-0 text-xs group-hover:scale-105 transition-transform">
                  🚪
                </div>
                <div>
                  <div className="font-semibold text-gray-900 leading-tight flex items-center gap-1.5 flex-wrap">
                    <span>{glassOpt?.name || 'Standard Entrance Door & Windows'}</span>
                    <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                      Included ($0)
                    </span>
                  </div>
                  <div className="text-[10px] text-emerald-700 font-medium flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <span>Door &amp; Window System · Included at $0</span>
                    {onSelectCategory && (
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDoorFeaturesModal(true);
                          if (onSelectCategory) {
                            onSelectCategory('Glazing & Windows');
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.stopPropagation();
                            setShowDoorFeaturesModal(true);
                            if (onSelectCategory) onSelectCategory('Glazing & Windows');
                          }
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-zinc-900 hover:bg-orange-600 text-white font-bold text-[10px] shadow-2xs hover:shadow-xs transition-all active:scale-95 cursor-pointer ml-1 select-none"
                        title="Click to view and choose from all entrance doors and window features"
                      >
                        <span>View Features</span>
                        <ChevronRight className="w-3 h-3 text-white/80" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[11px]">
                  Included ($0)
                </span>
                {onSelectCategory && (
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-orange-600 group-hover:translate-x-0.5 transition-transform" />
                )}
              </div>
            </div>

            {/* Lighting */}
            {getItemPriceForModel(lightOpt, state.modelId, config.models) > 0 && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-gray-200">
                <div>
                  <div className="font-semibold text-gray-900">{lightOpt.name}</div>
                  <div className="text-[10px] text-gray-400">Lighting Architecture</div>
                </div>
                <div className="flex items-center gap-2">
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
                    className="text-gray-400 hover:text-red-500 p-0.5 cursor-pointer"
                    title="Revert to standard"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Electrical */}
            {getItemPriceForModel(elecOpt, state.modelId, config.models) > 0 && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-gray-200">
                <div>
                  <div className="font-semibold text-gray-900">{elecOpt.name}</div>
                  <div className="text-[10px] text-gray-400">Electrical Load Center</div>
                </div>
                <div className="flex items-center gap-2">
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
                    className="text-gray-400 hover:text-red-500 p-0.5 cursor-pointer"
                    title="Revert to standard"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Flooring */}
            {getItemPriceForModel(floorOpt, state.modelId, config.models) > 0 && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-gray-200">
                <div>
                  <div className="font-semibold text-gray-900">{floorOpt.name}</div>
                  <div className="text-[10px] text-gray-400">Flooring Upgrade</div>
                </div>
                <div className="flex items-center gap-2">
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
                    className="text-gray-400 hover:text-red-500 p-0.5 cursor-pointer"
                    title="Revert to standard"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Roof Option */}
            {getItemPriceForModel(roofOpt, state.modelId, config.models) > 0 && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-gray-200">
                <div>
                  <div className="font-semibold text-gray-900">{roofOpt.name}</div>
                  <div className="text-[10px] text-gray-400">Roof & Energy</div>
                </div>
                <div className="flex items-center gap-2">
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
                    className="text-gray-400 hover:text-red-500 p-0.5 cursor-pointer"
                    title="Revert to standard"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Cabinetry Option */}
            {getItemPriceForModel(cabOpt, state.modelId, config.models) > 0 && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-gray-200">
                <div>
                  <div className="font-semibold text-gray-900">{cabOpt.name}</div>
                  <div className="text-[10px] text-gray-400">Cabinetry Finish</div>
                </div>
                <div className="flex items-center gap-2">
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
                    className="text-gray-400 hover:text-red-500 p-0.5 cursor-pointer"
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
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-gray-200"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-gray-900">{addon.name}</span>
                      {unitSpec.sizeLabel && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-orange-100 text-orange-800">
                          {unitSpec.sizeLabel}
                        </span>
                      )}
                      {isDefaultModule && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-blue-50 text-blue-800 border border-blue-200">
                          Standard
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-gray-400">{addon.category}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
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
                      className="flex items-center gap-1 text-[10px] font-bold text-gray-500 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded-lg border border-gray-200 hover:border-red-200 cursor-pointer transition-colors"
                      title={`Remove ${addon.name} from house`}
                    >
                      <X className="w-3 h-3 text-red-500" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Notification & Quick Re-add if Bath Pod or Kitchenette was removed */}
            {isExpandableHouse && (!state.hasLuxuryBathPod || !state.hasKitchenetteModule) && (
              <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/90 text-xs flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-amber-900">
                  <span className="text-[10px] font-black uppercase tracking-wider">
                    Removed Standard Modules
                  </span>
                  <span className="text-[10px] text-amber-700 font-medium">Shell layout</span>
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

        {/* Estimated Logistics & Site Delivery */}
        <div className="space-y-2 pt-2 border-t border-gray-100 text-xs">
          <div className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
            Delivery & Installation
          </div>

          <label className="flex items-center justify-between p-3 rounded-2xl border border-gray-200 bg-[#F8F9FB] hover:bg-gray-100 cursor-pointer">
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                checked={includeFreight}
                onChange={(e) => setIncludeFreight(e.target.checked)}
                className="w-4 h-4 rounded text-[var(--primary)] focus:ring-[var(--primary)/80] border-gray-300 accent-[var(--primary)]"
              />
              <div>
                <div className="font-semibold text-gray-900">Flatbed Freight Transport</div>
                <div className="text-[10px] text-gray-500">Continental US direct delivery</div>
              </div>
            </div>
            <span className="font-mono font-bold text-gray-900">
              {includeFreight ? `+${formatCurrency(config.logistics?.freightCost || 4500)}` : formatCurrency(0)}
            </span>
          </label>

          <label className="flex items-center justify-between p-3 rounded-2xl border border-gray-200 bg-[#F8F9FB] hover:bg-gray-100 cursor-pointer">
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                checked={includeSitePrep}
                onChange={(e) => setIncludeSitePrep(e.target.checked)}
                className="w-4 h-4 rounded text-[var(--primary)] focus:ring-[var(--primary)/80] border-gray-300 accent-[var(--primary)]"
              />
              <div>
                <div className="font-semibold text-gray-900">Foundation & Utility Hookup</div>
                <div className="text-[10px] text-gray-500">Certified local crew estimate</div>
              </div>
            </div>
            <span className="font-mono font-bold text-gray-900">
              {includeSitePrep ? `+${formatCurrency(config.logistics?.sitePrepCost || 5500)}` : formatCurrency(0)}
            </span>
          </label>
          
          {(config.logistics?.taxRate > 0) && (
            <div className="flex items-center justify-between p-3 rounded-2xl border border-gray-200 bg-white">
               <div className="font-semibold text-gray-900">Estimated Taxes ({config.logistics.taxRate}%)</div>
               <span className="font-mono font-bold text-gray-900">+{formatCurrency(taxAmount)}</span>
            </div>
          )}
        </div>

        {/* Guarantees Bento Card */}
        <div className="p-3.5 bg-[#F8F9FB] rounded-2xl border border-gray-200 space-y-2 text-[11px] text-gray-600">
          <div className="flex items-center gap-2 font-bold text-gray-900">
            <ShieldCheck className="w-4 h-4 shrink-0" style={{ color: config.branding.primaryColor }} />
            <span>{config.branding.brandName || 'Manufacturer'} Commitment</span>
          </div>
          <ul className="space-y-1 text-[10px] text-gray-500 pl-6 list-disc">
            <li>50-Year Structural Steel Frame Warranty</li>
            <li>Class-A Fire Prevention & 40dB Sound Isolation</li>
            <li>Category 5 Hurricane / Level 12 Typhoon Resistance</li>
            <li>{formatCurrency(config.branding.reservationFee || 250)} Fully Refundable Reservation Slot</li>
          </ul>
          {config.branding.supportEmail && (
            <div className="mt-2 pt-2 border-t border-gray-200 text-[10px]">
              Questions? Contact <a href={`mailto:${config.branding.supportEmail}`} className="font-bold hover:underline" style={{ color: config.branding.primaryColor }}>{config.branding.supportEmail}</a>
            </div>
          )}
        </div>
      </div>

      {/* Persistent Bottom Action Drawer */}
      <div className="p-4 border-t border-gray-100 bg-white space-y-2 shrink-0">
        <button
          onClick={onOpenReserve}
          style={{ backgroundColor: config.branding.primaryColor }}
          className="w-full py-3.5 px-4 hover:opacity-90 text-white rounded-2xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 hover:shadow-md cursor-pointer"
        >
          <CreditCard className="w-4 h-4" />
          <span>{config.branding.ctaText} ({formatCurrency(config.branding.reservationFee || 250)} Deposit)</span>
        </button>
      </div>
      {/* Interactive Door & Window Features Modal */}
      {showDoorFeaturesModal && (
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
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-gray-900 text-base sm:text-lg">
                      Door &amp; Window Features
                    </h3>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                      All Included at $0
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Select any architectural entrance door or perimeter window system at no extra cost.
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
            <div className="flex items-center gap-2 px-5 pt-3 pb-2 border-b border-gray-100 bg-white">
              {[
                { id: 'all', label: 'All Options (9)' },
                { id: 'Entrance Doors', label: 'Entrance Doors (5)' },
                { id: 'Windows', label: 'Windows (4)' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setDoorModalSubFilter(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
              {((config.glazingOptions && config.glazingOptions.length ? config.glazingOptions : GLAZING_OPTIONS) as any[])
                .filter((opt) => {
                  if (doorModalSubFilter === 'all') return true;
                  return opt.category === doorModalSubFilter;
                })
                .map((opt) => {
                  const isSelected = state.glazing === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => {
                        onStateChange((prev) => ({ ...prev, glazing: opt.id }));
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
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Included ($0)
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">
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
            <div className="p-4 border-t border-gray-100 bg-[#FAFAFC] flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Doors &amp; windows are factory installed in architectural black broken-bridge aluminum.
              </span>
              <button
                type="button"
                onClick={() => setShowDoorFeaturesModal(false)}
                className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
