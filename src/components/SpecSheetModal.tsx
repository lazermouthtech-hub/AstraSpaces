import React from 'react';
import { CustomizationState } from '../types';
import { BASE_MODELS } from '../data/models';
import {
  WALL_CLADDING_OPTIONS,
  GLAZING_OPTIONS,
  LIGHTING_OPTIONS,
  ELECTRICAL_OPTIONS,
  FLOORING_OPTIONS,
  ROOF_OPTIONS,
  MODULAR_ADDONS,
} from '../data/options';
import { X, Printer, Download, ShieldCheck, Check, FileText } from 'lucide-react';
import { useAppConfig } from '../context/AppConfigContext';
import { formatCurrency } from '../utils/currency';

interface SpecSheetModalProps {
  state: CustomizationState;
  onClose: () => void;
  totalPrice: number;
}

export const SpecSheetModal: React.FC<SpecSheetModalProps> = ({
  state,
  onClose,
  totalPrice,
}) => {
  const { config } = useAppConfig();
  const markupFactor = 1 + ((config.markup || 0) / 100);

  const currentModel =
    config.models?.find((m: any) => m.id === state.modelId) || config.models?.[0] || BASE_MODELS[0];

  const wallOpt =
    config.wallOptions?.find((o: any) => o.id === state.wallCladding) ||
    config.wallOptions?.[0] || WALL_CLADDING_OPTIONS[0];
  const glassOpt =
    config.glazingOptions?.find((o: any) => o.id === state.glazing) ||
    config.glazingOptions?.[0] || GLAZING_OPTIONS[0];
  const lightOpt =
    config.lightingOptions?.find((o: any) => o.id === state.lightingPackage) ||
    config.lightingOptions?.[0] || LIGHTING_OPTIONS[0];
  const elecOpt =
    config.electricalOptions?.find((o: any) => o.id === state.electricalTier) ||
    config.electricalOptions?.[0] || ELECTRICAL_OPTIONS[0];
  const floorOpt =
    config.flooringOptions?.find((o: any) => o.id === state.flooring) ||
    config.flooringOptions?.[0] || FLOORING_OPTIONS[0];
  const roofOpt =
    config.roofOptions?.find((o: any) => o.id === state.roofOption) ||
    config.roofOptions?.[0] || ROOF_OPTIONS[0];
  const cabOpt =
    config.cabinetryOptions?.find((o: any) => o.id === state.cabinetry) ||
    config.cabinetryOptions?.[0] || null;

  const activeAddons = (config.addons || MODULAR_ADDONS).filter((addon: any) => state[addon.id]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-gray-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-[#FAFAFC] border-b border-gray-100 p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-600 text-white font-black rounded-xl flex items-center justify-center text-xl shadow-xs">
              B
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-gray-950 tracking-tight">
                  BOXABL ARCHITECTURAL SPECIFICATION
                </span>
                <span className="text-[10px] bg-orange-50 text-orange-600 font-bold px-2 py-0.5 rounded-full border border-orange-200">
                  20ft Apple Cabin Series
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Official Engineering Document & Customization Bill of Materials
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              title="Print Specification Document"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto print:max-h-none">
          {/* Engineering Overview Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-[#F8F9FB] border border-gray-200 rounded-2xl">
              <div className="text-[10px] uppercase font-bold text-gray-400">
                External Dimensions
              </div>
              <div className="text-xs font-bold text-gray-900 mt-1">
                {currentModel.dimensions.metricStr}
              </div>
              <div className="text-[11px] text-gray-500 font-mono">
                {currentModel.dimensions.lengthFt}′ × {currentModel.dimensions.widthFt}′ ×{' '}
                {currentModel.dimensions.heightFt}′
              </div>
            </div>

            <div className="p-3.5 bg-[#F8F9FB] border border-gray-200 rounded-2xl">
              <div className="text-[10px] uppercase font-bold text-gray-400">
                Structural Frame
              </div>
              <div className="text-xs font-bold text-gray-900 mt-1">
                Galvanized Q235 Steel
              </div>
              <div className="text-[11px] text-gray-500 font-mono">
                50+ Year Rated Lifespan
              </div>
            </div>

            <div className="p-3.5 bg-[#F8F9FB] border border-gray-200 rounded-2xl">
              <div className="text-[10px] uppercase font-bold text-gray-400">
                Wind & Seismic
              </div>
              <div className="text-xs font-bold text-gray-900 mt-1">
                Level 12 Typhoon
              </div>
              <div className="text-[11px] text-gray-500 font-mono">
                Seismic Grade 8 Protected
              </div>
            </div>

            <div className="p-3.5 bg-[#F8F9FB] border border-gray-200 rounded-2xl">
              <div className="text-[10px] uppercase font-bold text-gray-400">
                Acoustic & Thermal
              </div>
              <div className="text-xs font-bold text-gray-900 mt-1">
                40 dB Sound Cutoff
              </div>
              <div className="text-[11px] text-gray-500 font-mono">
                R-24 to R-30 Rock Wool
              </div>
            </div>
          </div>

          {/* 20ft Apple Cabin Detailed Component Specifications */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 border-b pb-1 border-slate-200">
              Selected Architectural & Mechanical Systems
            </h4>

            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2.5 flex items-start justify-between">
                <div>
                  <div className="font-bold text-slate-900">Base Architecture: {currentModel.name}</div>
                  <div className="text-slate-500">{currentModel.description}</div>
                </div>
                <span className="font-mono font-bold text-slate-900 shrink-0 ml-4">
                  {formatCurrency(currentModel.basePrice * markupFactor, config.currency)}
                </span>
              </div>

              <div className="py-2.5 flex items-start justify-between">
                <div>
                  <div className="font-bold text-slate-900">Wall Cladding: {wallOpt.name}</div>
                  <div className="text-slate-500">{wallOpt.specDetail}</div>
                </div>
                <span className="font-mono font-bold text-slate-900 shrink-0 ml-4">
                  {wallOpt.price === 0 ? 'Included' : formatCurrency(wallOpt.price * markupFactor, config.currency, { showPlus: true })}
                </span>
              </div>

              <div className="py-2.5 flex items-start justify-between">
                <div>
                  <div className="font-bold text-slate-900">Glazing Envelope: {glassOpt.name}</div>
                  <div className="text-slate-500">{glassOpt.specDetail}</div>
                </div>
                <span className="font-mono font-bold text-slate-900 shrink-0 ml-4">
                  {glassOpt.price === 0 ? 'Included' : formatCurrency(glassOpt.price * markupFactor, config.currency, { showPlus: true })}
                </span>
              </div>

              <div className="py-2.5 flex items-start justify-between">
                <div>
                  <div className="font-bold text-slate-900">Lighting Architecture: {lightOpt.name}</div>
                  <div className="text-slate-500">{lightOpt.specDetail}</div>
                </div>
                <span className="font-mono font-bold text-slate-900 shrink-0 ml-4">
                  {lightOpt.price === 0 ? 'Included' : formatCurrency(lightOpt.price * markupFactor, config.currency, { showPlus: true })}
                </span>
              </div>

              <div className="py-2.5 flex items-start justify-between">
                <div>
                  <div className="font-bold text-slate-900">Electrical Load Service: {elecOpt.name}</div>
                  <div className="text-slate-500">{elecOpt.specDetail}</div>
                </div>
                <span className="font-mono font-bold text-slate-900 shrink-0 ml-4">
                  {elecOpt.price === 0 ? 'Included' : formatCurrency(elecOpt.price * markupFactor, config.currency, { showPlus: true })}
                </span>
              </div>

              <div className="py-2.5 flex items-start justify-between">
                <div>
                  <div className="font-bold text-slate-900">Structural Flooring: {floorOpt.name}</div>
                  <div className="text-slate-500">{floorOpt.specDetail}</div>
                </div>
                <span className="font-mono font-bold text-slate-900 shrink-0 ml-4">
                  {floorOpt.price === 0 ? 'Included' : formatCurrency(floorOpt.price * markupFactor, config.currency, { showPlus: true })}
                </span>
              </div>

              {cabOpt && (
                <div className="py-2.5 flex items-start justify-between">
                  <div>
                    <div className="font-bold text-slate-900">Kitchen Cabinetry: {cabOpt.name}</div>
                    <div className="text-slate-500">{cabOpt.description}</div>
                  </div>
                  <span className="font-mono font-bold text-slate-900 shrink-0 ml-4">
                    {cabOpt.price === 0 ? 'Included' : formatCurrency(cabOpt.price * markupFactor, config.currency, { showPlus: true })}
                  </span>
                </div>
              )}

              <div className="py-2.5 flex items-start justify-between">
                <div>
                  <div className="font-bold text-slate-900">Roof & Clean Energy: {roofOpt.name}</div>
                  <div className="text-slate-500">{roofOpt.specDetail}</div>
                </div>
                <span className="font-mono font-bold text-slate-900 shrink-0 ml-4">
                  {roofOpt.price === 0 ? 'Included' : formatCurrency(roofOpt.price * markupFactor, config.currency, { showPlus: true })}
                </span>
              </div>

              {activeAddons.map((addon) => (
                <div key={addon.id} className="py-2.5 flex items-start justify-between">
                  <div>
                    <div className="font-bold text-slate-900">{addon.name}</div>
                    <div className="text-slate-500">{addon.specDetail}</div>
                  </div>
                  <span className="font-mono font-bold text-slate-900 shrink-0 ml-4">
                    {formatCurrency(addon.price * markupFactor, config.currency, { showPlus: true })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Total Summary */}
          <div className="p-4 bg-[#F8F9FB] border border-gray-200 text-gray-900 rounded-2xl flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500 font-medium">Total Factory Manufactured Price</div>
              <div className="text-[11px] text-orange-600 font-semibold">
                Transparent Pricing • 100% Pre-Fabricated & Utility Tested
              </div>
            </div>
            <div className="text-2xl font-extrabold font-mono text-gray-950">
              {formatCurrency(totalPrice, config.currency)}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#FAFAFC] border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
