import React, { useState } from 'react';
import {
  CustomizationState,
  WallCladdingId,
  GlazingId,
  LightingPackageId,
  ElectricalTierId,
  FlooringId,
  RoofOptionId,
} from '../types';
import { useAppConfig } from '../context/AppConfigContext';
import { formatCurrency } from '../utils/currency';
import {
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
} from 'lucide-react';

interface ConfiguratorPanelProps {
  state: CustomizationState;
  onChange: (updater: (prev: CustomizationState) => CustomizationState) => void;
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
}

export const ConfiguratorPanel: React.FC<ConfiguratorPanelProps> = ({
  state,
  onChange,
  activeCategory,
  onSelectCategory,
}) => {
  const { config } = useAppConfig();
  const markupFactor = 1 + ((config.markup || 0) / 100);
  const categories = [
    { id: 'Wall Panels', label: 'Wall Panels', icon: Layers, count: config.wallOptions?.length || 0 },
    { id: 'Glazing & Windows', label: 'Glazing & Glass', icon: Grid, count: config.glazingOptions?.length || 0 },
    { id: 'Lighting System', label: 'Lighting & Power', icon: Zap, count: (config.lightingOptions?.length || 0) + (config.electricalOptions?.length || 0) },
    { id: 'Flooring', label: 'Flooring', icon: Grid, count: config.flooringOptions?.length || 0 },
    { id: 'Cabinetry', label: 'Cabinetry', icon: Grid, count: config.cabinetryOptions?.length || 0 },
    { id: 'Roof & Energy', label: 'Roof & Energy', icon: SunMedium, count: config.roofOptions?.length || 0 },
    { id: 'Interior Modules', label: 'Pods & Add-ons', icon: Sparkles, count: config.addons?.length || 0 },
  ];

  return (
    <div 
      className="bg-white flex flex-col h-full overflow-hidden"
      style={{ '--primary': config.branding.primaryColor } as React.CSSProperties}
    >
      {/* Category Navigation Tabs */}
      <div className="flex border-b border-gray-200/80 bg-[#FAFAFC] overflow-x-auto p-2.5 gap-1.5 shrink-0 scrollbar-thin scrollbar-thumb-gray-200">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-white text-gray-900 shadow-xs border border-gray-200/90 ring-1 ring-black/5 font-bold'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/80 border border-transparent'
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 transition-colors ${
                  isActive ? 'text-[var(--primary)]' : 'text-gray-400'
                }`}
              />
              <span>{cat.label}</span>
              {cat.count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold transition-colors ${
                    isActive
                      ? 'bg-orange-50 text-orange-700 border border-orange-200/60'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {cat.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Options Body Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6 overscroll-contain">
        {/* 1. WALL PANELS & CLADDING */}
        {activeCategory === 'Wall Panels' && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  Exterior Wall Cladding
                </h3>
                <span className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-wider bg-[var(--primary)/10] px-2 py-0.5 rounded-full border border-[var(--primary)/20]">
                  20ft Cabin Spec
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Engineered fluorocarbon composite and metal carved panels with 50mm high-density thermal break insulation.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {config.wallOptions.map((opt) => {
                const isSelected = state.wallCladding === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() =>
                      onChange((prev) => ({ ...prev, wallCladding: opt.id }))
                    }
                    className={`text-left p-3.5 rounded-2xl border transition-all relative flex flex-col gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'border-[var(--primary)] bg-[#FFFBF7] shadow-xs ring-1 ring-[var(--primary)]/20'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-[#F8F9FB] bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-5 h-5 rounded-full border border-gray-300 shrink-0 shadow-2xs"
                          style={{ backgroundColor: opt.color }}
                        />
                        <span className="text-xs font-bold text-gray-900">
                          {opt.name}
                        </span>
                        {opt.badge && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                              opt.badge === '20ft Cabin Spec'
                                ? 'bg-[var(--primary)/20] text-[var(--primary)]'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono text-gray-900">
                          {opt.price === 0 ? 'Included' : formatCurrency(opt.price * markupFactor, config.currency, { showPlus: true })}
                        </span>
                        {isSelected ? (
                          <div className="w-5 h-5 rounded-full bg-[var(--primary)] flex items-center justify-center shrink-0">
                            <span className="text-[10px] text-white font-bold">✓</span>
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-gray-300 shrink-0" />
                        )}
                      </div>
                    </div>

                    <p className="text-[11px] text-gray-500 leading-relaxed pl-7">
                      {opt.description}
                    </p>

                    {opt.specDetail && (
                      <div className="ml-7 mt-0.5 text-[10px] text-gray-500 font-mono bg-gray-100/90 px-2 py-0.5 rounded-md inline-block w-fit">
                        Tech Spec: {opt.specDetail}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. GLAZING & WINDOWS */}
        {activeCategory === 'Glazing & Windows' && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  Glazing & Panoramic Glass
                </h3>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded-full">
                  Thermal Broken
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Double-layer hollow tempered Low-E glass assemblies engineered for maximum solar heat rejection and sound suppression.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {config.glazingOptions.map((opt) => {
                const isSelected = state.glazing === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() =>
                      onChange((prev) => ({ ...prev, glazing: opt.id }))
                    }
                    className={`text-left p-3.5 rounded-2xl border transition-all relative flex flex-col gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'border-[var(--primary)] bg-[#FFFBF7] shadow-xs ring-1 ring-[var(--primary)]/20'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-[#F8F9FB] bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-5 h-5 rounded-full border border-gray-300 shrink-0 shadow-2xs opacity-80"
                          style={{ backgroundColor: opt.color }}
                        />
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
                          {opt.price === 0 ? 'Included' : formatCurrency(opt.price * markupFactor, config.currency, { showPlus: true })}
                        </span>
                        {isSelected ? (
                          <div className="w-5 h-5 rounded-full bg-[var(--primary)] flex items-center justify-center shrink-0">
                            <span className="text-[10px] text-white font-bold">✓</span>
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-gray-300 shrink-0" />
                        )}
                      </div>
                    </div>

                    <p className="text-[11px] text-gray-500 leading-relaxed pl-7">
                      {opt.description}
                    </p>

                    {opt.specDetail && (
                      <div className="ml-7 mt-0.5 text-[10px] text-gray-500 font-mono bg-gray-100/90 px-2 py-0.5 rounded-md inline-block w-fit">
                        Tech Spec: {opt.specDetail}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick add-on toggle for motorized blinds */}
            <div className="pt-2 border-t border-gray-100">
              <label className="flex items-center justify-between p-3.5 rounded-2xl border border-gray-200 bg-[#F8F9FB] hover:bg-gray-100 cursor-pointer">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={state.hasElectricBlinds}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        hasElectricBlinds: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 rounded text-[var(--primary)] focus:ring-orange-400 border-gray-300 accent-orange-600"
                  />
                  <div>
                    <div className="text-xs font-bold text-gray-900">
                      Motorized Dual-Layer Blackout Blinds
                    </div>
                    <div className="text-[11px] text-gray-500">
                      Remote controlled quiet blackout shades for panoramic glass
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold font-mono text-gray-900 shrink-0">
                  {formatCurrency(1850 * markupFactor, config.currency, { showPlus: true })}
                </span>
              </label>
            </div>
          </div>
        )}

        {/* 3. LIGHTING & ELECTRICAL SYSTEMS */}
        {activeCategory === 'Lighting System' && (
          <div className="space-y-6">
            {/* Lighting Packages */}
            <div className="space-y-3">
              <div>
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  Interior & Exterior Lighting Architecture
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Pre-wired architectural LED fixtures with warm 3000K illumination and cove perimeter channels.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {config.lightingOptions.map((opt) => {
                  const isSelected = state.lightingPackage === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() =>
                        onChange((prev) => ({
                          ...prev,
                          lightingPackage: opt.id,
                        }))
                      }
                      className={`text-left p-3.5 rounded-2xl border transition-all relative flex flex-col gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'border-[var(--primary)] bg-[#FFFBF7] shadow-xs ring-1 ring-[var(--primary)]/20'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-[#F8F9FB] bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: opt.color }}
                          />
                          <span className="text-xs font-bold text-gray-900">
                            {opt.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold font-mono text-gray-900">
                            {opt.price === 0
                              ? 'Included'
                              : formatCurrency(opt.price * markupFactor, config.currency, { showPlus: true })}
                          </span>
                          {isSelected ? (
                            <div className="w-5 h-5 rounded-full bg-[var(--primary)] flex items-center justify-center shrink-0">
                              <span className="text-[10px] text-white font-bold">✓</span>
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border border-gray-300 shrink-0" />
                          )}
                        </div>
                      </div>
                      <p className="text-[11px] text-gray-500 leading-relaxed pl-5">
                        {opt.description}
                      </p>
                      {opt.specDetail && (
                        <div className="ml-5 mt-0.5 text-[10px] text-gray-500 font-mono bg-gray-100/90 px-2 py-0.5 rounded-md inline-block w-fit">
                          {opt.specDetail}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Electrical Service Center */}
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <div>
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  Electrical Infrastructure & Breaker Box
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  100% pre-wired factory electrical harness compliant with NEC & international RV/modular standards.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {config.electricalOptions.map((opt) => {
                  const isSelected = state.electricalTier === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() =>
                        onChange((prev) => ({
                          ...prev,
                          electricalTier: opt.id,
                        }))
                      }
                      className={`text-left p-3.5 rounded-2xl border transition-all relative flex flex-col gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'border-[var(--primary)] bg-[#FFFBF7] shadow-xs ring-1 ring-[var(--primary)]/20'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-[#F8F9FB] bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-900">
                          {opt.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold font-mono text-gray-900">
                            {opt.price === 0
                              ? 'Included'
                              : formatCurrency(opt.price * markupFactor, config.currency, { showPlus: true })}
                          </span>
                          {isSelected ? (
                            <div className="w-5 h-5 rounded-full bg-[var(--primary)] flex items-center justify-center shrink-0">
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
                        <div className="text-[10px] text-gray-500 font-mono bg-gray-100/90 px-2 py-0.5 rounded-md inline-block w-fit">
                          {opt.specDetail}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 4. FLOORING */}
        {activeCategory === 'Flooring' && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  Structural & Finished Flooring
                </h3>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded-full">
                  100% Waterproof
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Heavy-duty commercial Stone Plastic Composite (SPC) flooring with IXPE sound absorption underlayment.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {config.flooringOptions.map((opt) => {
                const isSelected = state.flooring === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() =>
                      onChange((prev) => ({ ...prev, flooring: opt.id }))
                    }
                    className={`text-left p-3.5 rounded-2xl border transition-all relative flex flex-col gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'border-[var(--primary)] bg-[#FFFBF7] shadow-xs ring-1 ring-[var(--primary)]/20'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-[#F8F9FB] bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-5 h-5 rounded border border-gray-300 shrink-0 shadow-2xs"
                          style={{ backgroundColor: opt.color }}
                        />
                        <span className="text-xs font-bold text-gray-900">
                          {opt.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono text-gray-900">
                          {opt.price === 0 ? 'Included' : formatCurrency(opt.price * markupFactor, config.currency, { showPlus: true })}
                        </span>
                        {isSelected ? (
                          <div className="w-5 h-5 rounded-full bg-[var(--primary)] flex items-center justify-center shrink-0">
                            <span className="text-[10px] text-white font-bold">✓</span>
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-gray-300 shrink-0" />
                        )}
                      </div>
                    </div>

                    <p className="text-[11px] text-gray-500 leading-relaxed pl-7">
                      {opt.description}
                    </p>

                    {opt.specDetail && (
                      <div className="ml-7 mt-0.5 text-[10px] text-gray-500 font-mono bg-gray-100/90 px-2 py-0.5 rounded-md inline-block w-fit">
                        Tech Spec: {opt.specDetail}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. ROOF & ENERGY */}
        {activeCategory === 'Roof & Energy' && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  Roofing Architecture & Solar Harvest
                </h3>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded-full">
                  Load Rated
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Engineered flat roof assemblies with integrated drainage, walkable composite terraces, or high-output bifacial solar PV systems.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {config.roofOptions.map((opt) => {
                const isSelected = state.roofOption === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() =>
                      onChange((prev) => ({ ...prev, roofOption: opt.id }))
                    }
                    className={`text-left p-3.5 rounded-2xl border transition-all relative flex flex-col gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'border-[var(--primary)] bg-[#FFFBF7] shadow-xs ring-1 ring-[var(--primary)]/20'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-[#F8F9FB] bg-white'
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
                          {opt.price === 0 ? 'Included' : formatCurrency(opt.price * markupFactor, config.currency, { showPlus: true })}
                        </span>
                        {isSelected ? (
                          <div className="w-5 h-5 rounded-full bg-[var(--primary)] flex items-center justify-center shrink-0">
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
                      <div className="text-[10px] text-gray-500 font-mono bg-gray-100/90 px-2 py-0.5 rounded-md inline-block w-fit">
                        Tech Spec: {opt.specDetail}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* CABINETRY */}
        {activeCategory === 'Cabinetry' && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  Kitchen Cabinetry Finish
                </h3>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded-full">
                  Euro-Style
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Select the finish for the kitchenette pod's soft-close cabinetry.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {config.cabinetryOptions.map((opt) => {
                const isSelected = state.cabinetry === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() =>
                      onChange((prev) => ({ ...prev, cabinetry: opt.id }))
                    }
                    className={`text-left p-3.5 rounded-2xl border transition-all relative flex flex-col gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'border-[var(--primary)] bg-[#FFFBF7] shadow-xs ring-1 ring-[var(--primary)]/20'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-[#F8F9FB] bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-5 h-5 rounded border border-gray-300 shrink-0 shadow-2xs"
                          style={{ backgroundColor: opt.color }}
                        />
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
                          {opt.price === 0 ? 'Included' : formatCurrency(opt.price * markupFactor, config.currency, { showPlus: true })}
                        </span>
                        {isSelected ? (
                          <div className="w-5 h-5 rounded-full bg-[var(--primary)] flex items-center justify-center shrink-0">
                            <span className="text-[10px] text-white font-bold">✓</span>
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-gray-300 shrink-0" />
                        )}
                      </div>
                    </div>

                    <p className="text-[11px] text-gray-500 leading-relaxed pl-7">
                      {opt.description}
                    </p>

                    {opt.specDetail && (
                      <div className="ml-7 mt-0.5 text-[10px] text-gray-500 font-mono bg-gray-100/90 px-2 py-0.5 rounded-md inline-block w-fit">
                        Tech Spec: {opt.specDetail}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 6. INTERIOR PODS & STRUCTURAL ADD-ONS */}
        {activeCategory === 'Interior Modules' && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  Modular Pods & Upgrades
                </h3>
                <span className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-wider bg-[var(--primary)/10] px-2 py-0.5 rounded-full border border-[var(--primary)/20]">
                  Plug & Play
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Factory-assembled modules installed and tested on the manufacturing line prior to flat-pack transport.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {config.addons.map((addon) => {
                const isChecked = Boolean(state[addon.id]);
                return (
                  <label
                    key={addon.id}
                    className={`text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${
                      isChecked
                        ? 'border-[var(--primary)] bg-[#FFFBF7] shadow-xs ring-1 ring-[var(--primary)]/20'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-[#F8F9FB] bg-white'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) =>
                        onChange((prev) => ({
                          ...prev,
                          [addon.id]: e.target.checked,
                        }))
                      }
                      className="mt-0.5 w-4 h-4 rounded text-[var(--primary)] focus:ring-orange-400 border-gray-300 accent-orange-600"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-900">
                          {addon.name}
                        </span>
                        <span className="text-xs font-bold font-mono text-gray-900">
                          {formatCurrency(addon.price * markupFactor, config.currency, { showPlus: true })}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 leading-relaxed">
                        {addon.description}
                      </p>
                      {addon.specDetail && (
                        <div className="text-[10px] text-gray-500 font-mono bg-gray-100/90 px-2 py-0.5 rounded-md inline-block">
                          {addon.specDetail}
                        </div>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
