import React, { useState } from 'react';
import { CustomizationState } from '../types';
import { useAppConfig } from '../context/AppConfigContext';
import {
  DollarSign,
  Calendar,
  Truck,
  ShieldCheck,
  ChevronUp,
  ChevronDown,
  X,
  CreditCard,
  Download,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

interface CostBuildupPanelProps {
  state: CustomizationState;
  onStateChange: (updater: (prev: CustomizationState) => CustomizationState) => void;
  onOpenReserve: () => void;
  onOpenSpecSheet: () => void;
}

export const CostBuildupPanel: React.FC<CostBuildupPanelProps> = ({
  state,
  onStateChange,
  onOpenReserve,
  onOpenSpecSheet,
}) => {
  const [isCollapsedMobile, setIsCollapsedMobile] = useState(false);
  const [includeFreight, setIncludeFreight] = useState(true);
  const [includeSitePrep, setIncludeSitePrep] = useState(true);
  const { config } = useAppConfig();

  const currentModel =
    config.models.find((m: any) => m.id === state.modelId) || config.models[0];

  // Lookups for prices
  const wallOpt =
    config.wallOptions.find((o: any) => o.id === state.wallCladding) ||
    config.wallOptions[0];
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

  // Active modular addons
  const activeAddons = config.addons.filter((addon: any) => state[addon.id]);

  const freightCost = includeFreight ? (config.logistics?.freightCost || 4500) : 0;
  const sitePrepCost = includeSitePrep ? (config.logistics?.sitePrepCost || 5500) : 0;

  // Calculate Subtotal & Total
  const upgradesTotal =
    wallOpt.price +
    glassOpt.price +
    lightOpt.price +
    elecOpt.price +
    floorOpt.price +
    roofOpt.price +
    cabOpt.price +
    activeAddons.reduce((acc: number, a: any) => acc + a.price, 0);

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

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: config.currency || 'USD',
      maximumFractionDigits: 0,
    }).format(val);
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

            {/* Custom Wall Cladding */}
            {wallOpt.price > 0 && (
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
                    +{formatCurrency(wallOpt.price * markupFactor)}
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

            {/* Glazing */}
            {glassOpt.price > 0 && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-gray-200">
                <div>
                  <div className="font-semibold text-gray-900">{glassOpt.name}</div>
                  <div className="text-[10px] text-gray-400">Panoramic Glazing</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-gray-900">
                    +{formatCurrency(glassOpt.price * markupFactor)}
                  </span>
                  <button
                    onClick={() =>
                      onStateChange((prev) => ({
                        ...prev,
                        glazing: 'low-e-clear',
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

            {/* Lighting */}
            {lightOpt.price > 0 && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-gray-200">
                <div>
                  <div className="font-semibold text-gray-900">{lightOpt.name}</div>
                  <div className="text-[10px] text-gray-400">Lighting Architecture</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-gray-900">
                    +{formatCurrency(lightOpt.price * markupFactor)}
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
            {elecOpt.price > 0 && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-gray-200">
                <div>
                  <div className="font-semibold text-gray-900">{elecOpt.name}</div>
                  <div className="text-[10px] text-gray-400">Electrical Load Center</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-gray-900">
                    +{formatCurrency(elecOpt.price * markupFactor)}
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
            {floorOpt.price > 0 && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-gray-200">
                <div>
                  <div className="font-semibold text-gray-900">{floorOpt.name}</div>
                  <div className="text-[10px] text-gray-400">Flooring Upgrade</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-gray-900">
                    +{formatCurrency(floorOpt.price * markupFactor)}
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
            {roofOpt.price > 0 && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-gray-200">
                <div>
                  <div className="font-semibold text-gray-900">{roofOpt.name}</div>
                  <div className="text-[10px] text-gray-400">Roof & Energy</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-gray-900">
                    +{formatCurrency(roofOpt.price * markupFactor)}
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
            {cabOpt.price > 0 && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-gray-200">
                <div>
                  <div className="font-semibold text-gray-900">{cabOpt.name}</div>
                  <div className="text-[10px] text-gray-400">Cabinetry Finish</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-gray-900">
                    +{formatCurrency(cabOpt.price * markupFactor)}
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
            {activeAddons.map((addon) => (
              <div
                key={addon.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-gray-200"
              >
                <div>
                  <div className="font-semibold text-gray-900">{addon.name}</div>
                  <div className="text-[10px] text-gray-400">{addon.category}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-gray-900">
                    +{formatCurrency(addon.price * markupFactor)}
                  </span>
                  <button
                    onClick={() =>
                      onStateChange((prev) => ({
                        ...prev,
                        [addon.id]: false,
                      }))
                    }
                    className="text-gray-400 hover:text-red-500 p-0.5 cursor-pointer"
                    title="Remove module"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
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
            <li>${config.branding.reservationFee} Fully Refundable Reservation Slot</li>
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
          <span>{config.branding.ctaText} (${config.branding.reservationFee} Deposit)</span>
        </button>

        <button
          onClick={onOpenSpecSheet}
          className="w-full py-2.5 px-3 bg-[#F8F9FB] hover:bg-gray-100 text-gray-700 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-gray-200"
        >
          <Download className="w-3.5 h-3.5 text-gray-500" />
          <span>Download Apple Cabin Specification Sheet</span>
        </button>
      </div>
    </aside>
  );
};
