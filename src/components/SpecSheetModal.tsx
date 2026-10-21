import React, { useState, useRef } from 'react';
import { CustomizationState } from '../types';
import { BASE_MODELS } from '../data/models';
import {
  WALL_CLADDING_OPTIONS,
  INTERIOR_WALL_OPTIONS,
  GLAZING_OPTIONS,
  LIGHTING_OPTIONS,
  ELECTRICAL_OPTIONS,
  FLOORING_OPTIONS,
  ROOF_OPTIONS,
  MODULAR_ADDONS,
  FLOOR_PLAN_OPTIONS,
} from '../data/options';
import {
  X,
  Printer,
  Download,
  ShieldCheck,
  Check,
  FileText,
  Loader2,
  Compass,
  Ruler,
  Layers,
  Zap,
  Droplets,
  Truck,
  CheckCircle2,
  Building,
  Sparkles,
  Calendar,
  Award,
} from 'lucide-react';
import { useAppConfig } from '../context/AppConfigContext';
import { formatCurrency } from '../utils/currency';
import { getItemPriceForModel, getItemUnitSpec } from '../utils/pricingCalculator';
import { ProductLineDrawing } from './dashboard/ProductLineDrawing';
import { FloorPlanDiagram } from './FloorPlanDiagram';
import { exportElementToPDF } from '../utils/pdfGenerator';

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
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const specSheetRef = useRef<HTMLDivElement>(null);
  const markupFactor = 1 + (config.markup || 0) / 100;

  const allKnownModels = [...(config.models || []), ...BASE_MODELS];
  const currentModel =
    allKnownModels.find((m: any) => m.id === state.modelId) ||
    config.models?.find((m: any) => m.id === state.modelId) ||
    BASE_MODELS.find((m: any) => m.id === state.modelId) ||
    BASE_MODELS[0];

  const mId = (state.modelId || '').toLowerCase();
  const mName = (currentModel?.name || '').toLowerCase();

  const isAppleCabin =
    currentModel?.series === 'apple-cabin' ||
    mId.includes('apple-cabin') ||
    mId === 'studio' ||
    mId === 'one-bedroom' ||
    mId === 'two-bedroom' ||
    mName.includes('apple cabin');

  const isSpaceCapsule =
    currentModel?.series === 'capsule' ||
    mId.includes('space-capsule') ||
    mId.includes('capsule') ||
    mName.includes('space capsule');

  const isFolding =
    currentModel?.series === 'folding' ||
    currentModel?.series === 'fast-assembly' ||
    mId.includes('folding') ||
    mId.includes('fast-assembly') ||
    mName.includes('folding');

  const isExpandableHouse =
    !isAppleCabin &&
    !isSpaceCapsule &&
    !isFolding &&
    (currentModel?.series === 'expandable' ||
      mId === 'expandable-10ft' ||
      mId === 'expandable-20ft' ||
      mId === 'expandable-30ft' ||
      mId === 'expandable-40ft' ||
      mId.startsWith('expandable') ||
      mName.includes('expandable'));

  const is40ft =
    isExpandableHouse &&
    (mId.includes('40ft') || mName.includes('40ft') || (currentModel?.dimensions?.lengthFt || 0) >= 35);
  const is30ft =
    isExpandableHouse &&
    !is40ft &&
    (mId.includes('30ft') || mName.includes('30ft') || ((currentModel?.dimensions?.lengthFt || 0) >= 28 && (currentModel?.dimensions?.lengthFt || 0) < 35));
  const is10ft =
    isExpandableHouse &&
    (mId.includes('10ft') || mName.includes('10ft') || (currentModel?.dimensions?.lengthFt || 0) <= 15);
  const is20ft = isExpandableHouse && !is30ft && !is40ft && !is10ft;

  // Selected floor plan resolution
  const floorPlanOpt = isExpandableHouse
    ? FLOOR_PLAN_OPTIONS.find((f) => f.id === state.floorPlan) || FLOOR_PLAN_OPTIONS[0]
    : null;

  const wallOpt =
    config.wallOptions?.find((o: any) => o.id === state.wallCladding) ||
    config.wallOptions?.[0] ||
    WALL_CLADDING_OPTIONS[0];
  const intWallOpt =
    config.interiorWallOptions?.find((o: any) => o.id === state.interiorWall) ||
    config.interiorWallOptions?.[0] ||
    INTERIOR_WALL_OPTIONS[0];
  const glassOpt =
    config.glazingOptions?.find((o: any) => o.id === state.glazing) ||
    config.glazingOptions?.[0] ||
    GLAZING_OPTIONS[0];
  const lightOpt =
    config.lightingOptions?.find((o: any) => o.id === state.lightingPackage) ||
    config.lightingOptions?.[0] ||
    LIGHTING_OPTIONS[0];
  const elecOpt =
    config.electricalOptions?.find((o: any) => o.id === state.electricalTier) ||
    config.electricalOptions?.[0] ||
    ELECTRICAL_OPTIONS[0];
  const floorOpt =
    config.flooringOptions?.find((o: any) => o.id === state.flooring) ||
    config.flooringOptions?.[0] ||
    FLOORING_OPTIONS[0];
  const roofOpt =
    config.roofOptions?.find((o: any) => o.id === state.roofOption) ||
    config.roofOptions?.[0] ||
    ROOF_OPTIONS[0];
  const cabOpt =
    config.cabinetryOptions?.find((o: any) => o.id === state.cabinetry) ||
    config.cabinetryOptions?.[0] ||
    null;

  const activeAddons = (config.addons || MODULAR_ADDONS).filter(
    (addon: any) => state[addon.id] && addon.isAvailable !== false && addon.isActive !== false
  );

  // Document metadata IDs
  const docDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const docSerial = `CAD-SPEC-${(state.modelId || 'EXP').toUpperCase()}-${(state.floorPlan || 'STD').toUpperCase()}-REV4`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!specSheetRef.current) return;
    try {
      setIsExportingPDF(true);
      const safeModelName = currentModel.name.replace(/[^a-zA-Z0-9]/g, '-').toUpperCase();
      const safePlanName = (floorPlanOpt?.id || 'STANDARD').toUpperCase();
      await exportElementToPDF(specSheetRef.current, {
        filename: `${safeModelName}-${safePlanName}-SPEC-SHEET.pdf`,
        onSuccess: () => setIsExportingPDF(false),
        onError: () => setIsExportingPDF(false),
      });
    } catch (e) {
      console.error(e);
      setIsExportingPDF(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full border border-gray-200 shadow-2xl overflow-hidden my-3 animate-in fade-in zoom-in-95 duration-150 max-h-[94vh] flex flex-col">
        {/* Modal Top Control Bar (Screen Only) */}
        <div className="bg-[#FAFAFC] border-b border-gray-100 p-4 sm:p-5 flex items-center justify-between shrink-0 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-600 text-white font-black rounded-xl flex items-center justify-center text-xl shadow-xs shrink-0">
              {(config.branding?.brandName || currentModel.name).charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-base sm:text-lg text-gray-950 tracking-tight">
                  {currentModel.name.toUpperCase()} ARCHITECTURAL SPECIFICATION &amp; BLUEPRINT
                </span>
                <span className="text-[10px] bg-orange-50 text-orange-700 font-bold px-2 py-0.5 rounded-full border border-orange-200">
                  {floorPlanOpt ? floorPlanOpt.name : currentModel.name}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Official Engineering Submittal, Actual Selected Floor Plan CAD &amp; Full Bill of Materials
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleDownloadPDF}
              disabled={isExportingPDF}
              className="bg-orange-600 hover:bg-orange-500 text-white text-xs font-black px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
              title="Download full architectural specification document as PDF"
            >
              {isExportingPDF ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Spec Sheet (PDF)</span>
                </>
              )}
            </button>
            <button
              onClick={handlePrint}
              className="p-2.5 text-gray-700 hover:text-gray-950 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer border border-gray-200"
              title="Print Specification Document"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Printable Document Body */}
        <div
          ref={specSheetRef}
          data-spec-sheet="true"
          className="p-5 sm:p-8 space-y-7 overflow-y-auto flex-1 text-xs bg-white text-gray-900"
        >
          {/* =========================================================================
              DOCUMENT HEADER BLOCK (Official Architectural Submittal Stamp)
             ========================================================================= */}
          <div className="border-b-2 border-orange-500 pb-5">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.25em] text-orange-600">
                  {config.branding?.brandName || 'CASITA MODULAR HOMES'} • FACTORY ARCHITECTURAL SUBMITTAL
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight mt-1">
                  {currentModel.name.toUpperCase()}
                </h1>
                <p className="text-xs text-gray-600 mt-1 max-w-2xl leading-relaxed">
                  {currentModel.description}
                </p>
              </div>

              {/* Document ID & Certification Stamps */}
              <div className="text-right font-mono text-[10px] text-gray-500 space-y-0.5 shrink-0 bg-gray-50 p-3 rounded-xl border border-gray-200">
                <div>
                  DOC CODE: <strong className="text-gray-900">{docSerial}</strong>
                </div>
                <div>
                  ISSUE DATE: <strong className="text-gray-900">{docDate}</strong>
                </div>
                <div>
                  STATUS: <strong className="text-emerald-700">APPROVED FOR PRODUCTION</strong>
                </div>
                <div>
                  CODE COMPLIANCE: <strong>IBC / HUD / ISO 9001</strong>
                </div>
              </div>
            </div>

            {/* SELECTED FLOOR PLAN OR MODEL CONFIGURATION CALLOUT BANNER */}
            {isExpandableHouse && floorPlanOpt ? (
              <div className="mt-4 p-3.5 bg-blue-50/80 rounded-2xl border border-blue-200 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-wider text-blue-800 bg-blue-100/80 px-2 py-0.5 rounded-md font-mono">
                        Selected Floor Plan
                      </span>
                      <span className="text-sm font-extrabold text-blue-950">
                        {floorPlanOpt.name}
                      </span>
                    </div>
                    <div className="text-xs text-blue-900/80 font-medium mt-0.5">
                      {floorPlanOpt.tagline} • {floorPlanOpt.bedrooms} Bed, {floorPlanOpt.bathrooms} Bath, {floorPlanOpt.livingRooms} Living Lounge
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] font-mono font-bold text-blue-950">
                    Conditioned Space: {currentModel.sqft} sq ft ({currentModel.areaM2 || Math.round(currentModel.sqft * 0.0929)} m²)
                  </div>
                  <div className="text-[10px] text-blue-700 font-medium font-mono">
                    {floorPlanOpt.price === 0 ? 'Standard Included Floor Plan' : `Factory Plan Option (+${formatCurrency(floorPlanOpt.price * markupFactor, config.currency, { ratesMap: config.exchangeRates })})`}
                  </div>
                </div>
              </div>
            ) : isAppleCabin ? (
              <div className="mt-4 p-3.5 bg-sky-50/80 rounded-2xl border border-sky-200 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-wider text-sky-800 bg-sky-100/80 px-2 py-0.5 rounded-md font-mono">
                        Apple Cabin Architectural Series
                      </span>
                      <span className="text-sm font-extrabold text-sky-950">
                        {currentModel.name}
                      </span>
                    </div>
                    <div className="text-xs text-sky-900/80 font-medium mt-0.5">
                      Aerodynamic Aluminum Shell • Curved Low-E Panoramic Glass • Luxury Spa Bath Pod
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] font-mono font-bold text-sky-950">
                    Living Space: {currentModel.sqft} sq ft ({currentModel.areaM2 || Math.round(currentModel.sqft * 0.0929)} m²)
                  </div>
                  <div className="text-[10px] text-sky-700 font-medium font-mono">
                    {currentModel.leadTime} Lead Time • Turnkey Monolithic Delivery
                  </div>
                </div>
              </div>
            ) : isSpaceCapsule ? (
              <div className="mt-4 p-3.5 bg-slate-900 text-white rounded-2xl border border-slate-700 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-xs">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded-md font-mono border border-cyan-800">
                        Futuristic Space Capsule Pod
                      </span>
                      <span className="text-sm font-extrabold text-white">
                        {currentModel.name}
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 font-medium mt-0.5">
                      270° Observation Bubble Lounge • Panoramic Skylight Roof • Smart Voice AI Console
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] font-mono font-bold text-cyan-300">
                    Pod Footprint: {currentModel.sqft} sq ft ({currentModel.areaM2 || Math.round(currentModel.sqft * 0.0929)} m²)
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium font-mono">
                    Aviation Aluminum Alloy Shell • ISO Rigging Certified
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-200 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md font-mono">
                        Modular Container Architecture
                      </span>
                      <span className="text-sm font-extrabold text-emerald-950">
                        {currentModel.name}
                      </span>
                    </div>
                    <div className="text-xs text-emerald-900/80 font-medium mt-0.5">
                      Fast-Assembly Modular Living • Galvanized Steel Chassis
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] font-mono font-bold text-emerald-950">
                    Enclosed Space: {currentModel.sqft} sq ft ({currentModel.areaM2 || Math.round(currentModel.sqft * 0.0929)} m²)
                  </div>
                  <div className="text-[10px] text-emerald-700 font-medium font-mono">
                    Standard Included Architecture
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* =========================================================================
              SECTION 1: ACTUAL SELECTED ARCHITECTURAL FLOOR PLAN & CAD BLUEPRINT
             ========================================================================= */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-gray-200">
              <h2 className="text-xs font-black uppercase tracking-wider text-gray-900 flex items-center gap-2 font-mono">
                <Compass className="w-4 h-4 text-orange-600" />
                <span>1.0 Actual Selected Architectural Floor Plan &amp; Blueprint</span>
              </h2>
              <span className="text-[11px] font-mono text-gray-500">
                {currentModel.dimensions.metricStr} • {currentModel.dimensions.lengthFt}′ × {currentModel.dimensions.widthFt}′ × {currentModel.dimensions.heightFt}′
              </span>
            </div>

            {/* HIGH-FIDELITY ARCHITECTURAL FLOOR PLAN PRESENTATION FOR THE CONFIGURED MODEL */}
            {isExpandableHouse && floorPlanOpt ? (
              <div className="bg-[#FAF7F2] p-4 sm:p-6 rounded-3xl border-2 border-amber-300 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-amber-200/80 flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                      <Building className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-orange-700 bg-orange-100/90 px-2 py-0.5 rounded-md font-mono">
                        Expandable House Floor Plan • Active Selection
                      </span>
                      <h3 className="text-sm sm:text-base font-extrabold text-gray-950 mt-0.5">
                        {floorPlanOpt.name} ({currentModel.name})
                      </h3>
                    </div>
                  </div>
                  <div className="text-right font-mono text-xs">
                    <span className="font-bold text-gray-900">{currentModel.dimensions.metricStr}</span>
                    <span className="block text-[10px] text-gray-600">
                      {currentModel.dimensions.lengthFt}′ × {currentModel.dimensions.widthFt}′ • {currentModel.sqft} Sq Ft ({currentModel.areaM2 || Math.round(currentModel.sqft * 0.0929)} m²)
                    </span>
                  </div>
                </div>

                {/* Actual Expandable House Floor Plan Architectural SVG */}
                <FloorPlanDiagram
                  planId={floorPlanOpt.id}
                  modelId={state.modelId}
                  hasWardrobe={Boolean(state.hasWardrobe)}
                  hasTvConsole={Boolean(state.hasTvConsole)}
                  hasKitchenette={Boolean(state.hasKitchenetteModule)}
                  hasBathPod={Boolean(state.hasLuxuryBathPod)}
                  showLabels={true}
                  modelName={currentModel.name}
                  dimensions={currentModel.dimensions.metricStr}
                  is40ft={is40ft}
                  is30ft={is30ft}
                  className="w-full h-80 sm:h-[430px] rounded-2xl border-2 border-amber-300/80 shadow-md"
                />

                {/* Room Breakdown & Features */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] pt-1">
                  <div className="p-3 bg-white rounded-xl border border-amber-200/80">
                    <div className="font-bold text-gray-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-orange-500" />
                      <span>Private Bedrooms ({floorPlanOpt.bedrooms})</span>
                    </div>
                    <div className="text-gray-500 text-[10px] mt-1 leading-relaxed">
                      Enclosed private sleeping chambers with acoustic decoupling, wood headboards, nightstands, and exterior sliding windows.
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-amber-200/80">
                    <div className="font-bold text-gray-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      <span>Central Restroom Pod ({floorPlanOpt.bathrooms})</span>
                    </div>
                    <div className="text-gray-500 text-[10px] mt-1 leading-relaxed">
                      Pre-plumbed central spine bathroom pod with 36&quot;×36&quot; rain shower, smart bidet toilet, LED vanity, and 3&quot; PVC DWV drain.
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-amber-200/80">
                    <div className="font-bold text-gray-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Living Lounge &amp; TV Credenza</span>
                    </div>
                    <div className="text-gray-500 text-[10px] mt-1 leading-relaxed">
                      {floorPlanOpt.livingRooms > 0
                        ? 'Left-wing luxury sofa, travertine coffee table, area rug, and 65" TV media console mounted clear of structural pillars.'
                        : 'High-density quad bedroom layout maximizing sleeping capacity.'}
                    </div>
                  </div>
                </div>

                {floorPlanOpt.features && floorPlanOpt.features.length > 0 && (
                  <div className="pt-2 border-t border-amber-200/80 flex items-center gap-2 flex-wrap text-[10px] text-gray-700">
                    <span className="font-bold text-gray-900">Included Architectural Features:</span>
                    {floorPlanOpt.features.map((feat, idx) => (
                      <span key={idx} className="bg-white px-2 py-0.5 rounded-md border border-amber-200 text-gray-700 font-medium">
                        ✓ {feat}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : isAppleCabin ? (
              <div className="bg-[#F0F7FF] p-4 sm:p-6 rounded-3xl border-2 border-sky-300 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-sky-200/80 flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                      <Building className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-sky-800 bg-sky-100/90 px-2 py-0.5 rounded-md font-mono">
                        Apple Cabin Architectural Blueprint • Active Model
                      </span>
                      <h3 className="text-sm sm:text-base font-extrabold text-gray-950 mt-0.5">
                        {currentModel.name}
                      </h3>
                    </div>
                  </div>
                  <div className="text-right font-mono text-xs">
                    <span className="font-bold text-gray-900">{currentModel.dimensions.metricStr}</span>
                    <span className="block text-[10px] text-gray-600">
                      {currentModel.dimensions.lengthFt}′ × {currentModel.dimensions.widthFt}′ • {currentModel.sqft} Sq Ft ({currentModel.areaM2 || Math.round(currentModel.sqft * 0.0929)} m²)
                    </span>
                  </div>
                </div>

                {/* Actual Apple Cabin Floor Plan Vector SVG */}
                <FloorPlanDiagram
                  modelId={state.modelId}
                  showLabels={true}
                  modelName={currentModel.name}
                  dimensions={currentModel.dimensions.metricStr}
                  className="w-full h-80 sm:h-[430px] rounded-2xl border-2 border-sky-300/80 shadow-md"
                />

                {/* Room Breakdown for Apple Cabin */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] pt-1">
                  <div className="p-3 bg-white rounded-xl border border-sky-200/80">
                    <div className="font-bold text-gray-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-sky-500" />
                      <span>Capsule Bedroom Chamber</span>
                    </div>
                    <div className="text-gray-500 text-[10px] mt-1 leading-relaxed">
                      Integrated queen/king sleeping suite oriented toward curved Low-E panoramic glass walls for 180° nature immersion.
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-sky-200/80">
                    <div className="font-bold text-gray-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      <span>Spa Ensuite Bathroom Pod</span>
                    </div>
                    <div className="text-gray-500 text-[10px] mt-1 leading-relaxed">
                      Pre-fabricated watertight acrylic bathroom pod with frameless rain shower, smart bidet toilet, and LED vanity mirror.
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-sky-200/80">
                    <div className="font-bold text-gray-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Kitchenette Bar &amp; Living Zone</span>
                    </div>
                    <div className="text-gray-500 text-[10px] mt-1 leading-relaxed">
                      Solid surface kitchenette with induction cooktop, prep sink, under-counter refrigeration, and custom sofa seating.
                    </div>
                  </div>
                </div>
              </div>
            ) : isSpaceCapsule ? (
              <div className="bg-[#0B132B] p-4 sm:p-6 rounded-3xl border-2 border-cyan-500/50 shadow-md space-y-4 text-white">
                <div className="flex items-center justify-between pb-2 border-b border-cyan-800/80 flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-cyan-500 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-xs">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300 bg-cyan-950/90 px-2 py-0.5 rounded-md font-mono border border-cyan-800">
                        Space Capsule Blueprint • Active Model
                      </span>
                      <h3 className="text-sm sm:text-base font-extrabold text-white mt-0.5">
                        {currentModel.name}
                      </h3>
                    </div>
                  </div>
                  <div className="text-right font-mono text-xs">
                    <span className="font-bold text-cyan-300">{currentModel.dimensions.metricStr}</span>
                    <span className="block text-[10px] text-slate-400">
                      {currentModel.dimensions.lengthFt}′ × {currentModel.dimensions.widthFt}′ • {currentModel.sqft} Sq Ft
                    </span>
                  </div>
                </div>

                {/* Actual Space Capsule Floor Plan Vector SVG */}
                <FloorPlanDiagram
                  modelId={state.modelId}
                  showLabels={true}
                  modelName={currentModel.name}
                  dimensions={currentModel.dimensions.metricStr}
                  className="w-full h-80 sm:h-[430px] rounded-2xl border-2 border-cyan-500/60 shadow-lg"
                />

                {/* Room Breakdown for Space Capsule */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] pt-1">
                  <div className="p-3 bg-slate-900 rounded-xl border border-cyan-900">
                    <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      <span>270° Observation Bubble</span>
                    </div>
                    <div className="text-slate-400 text-[10px] mt-1 leading-relaxed">
                      Curved panoramic bubble window with aerospace grade thermal film and custom lounge furniture.
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl border border-cyan-900">
                    <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-400" />
                      <span>Star-View Sleeping Suite</span>
                    </div>
                    <div className="text-slate-400 text-[10px] mt-1 leading-relaxed">
                      Custom king mattress chamber positioned directly beneath the oversized panoramic skylight glass ceiling.
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl border border-cyan-900">
                    <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>Smart Bathroom Pod</span>
                    </div>
                    <div className="text-slate-400 text-[10px] mt-1 leading-relaxed">
                      Integrated smart toilet, high-pressure thermostatic shower system, and voice-controlled LED ambient mood lighting.
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#FAF7F2] p-4 sm:p-6 rounded-3xl border-2 border-amber-300 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-amber-200/80 flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                      <Building className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-orange-700 bg-orange-100/90 px-2 py-0.5 rounded-md font-mono">
                        Modular Container Floor Plan • Active Model
                      </span>
                      <h3 className="text-sm sm:text-base font-extrabold text-gray-950 mt-0.5">
                        {currentModel.name}
                      </h3>
                    </div>
                  </div>
                  <div className="text-right font-mono text-xs">
                    <span className="font-bold text-gray-900">{currentModel.dimensions.metricStr}</span>
                    <span className="block text-[10px] text-gray-600">
                      {currentModel.dimensions.lengthFt}′ × {currentModel.dimensions.widthFt}′ • {currentModel.sqft} Sq Ft
                    </span>
                  </div>
                </div>

                <FloorPlanDiagram
                  modelId={state.modelId}
                  showLabels={true}
                  modelName={currentModel.name}
                  dimensions={currentModel.dimensions.metricStr}
                  className="w-full h-80 sm:h-[430px] rounded-2xl border-2 border-amber-300/80 shadow-md"
                />
              </div>
            )}

            {/* Technical Orthographic CAD Line Drawing Component (Elevation, Foundation & MEP Grid) */}
            <div className="space-y-1.5 pt-2">
              <div className="text-[11px] font-bold text-gray-700 flex items-center gap-1.5 font-mono">
                <Layers className="w-3.5 h-3.5 text-orange-600" />
                <span>Technical Orthographic CAD Projections (Elevations &amp; Foundation MEP Grid)</span>
              </div>
              <ProductLineDrawing
                modelId={state.modelId}
                modelName={currentModel.name}
                floorPlanId={state.floorPlan}
                customization={{
                  wallCladdingName: wallOpt.name,
                  wallCladdingColor: wallOpt.color,
                  interiorWallName: intWallOpt.name,
                  floorPlanName: floorPlanOpt?.name,
                  floorPlanId: state.floorPlan,
                  glazingName: glassOpt.name,
                  roofName: roofOpt.name,
                  lightingName: lightOpt.name,
                  flooringName: floorOpt.name,
                  cabinetryName: cabOpt?.name,
                  addonsList: activeAddons.map((a: any) => a.name),
                  hasWardrobe: Boolean(state.hasWardrobe),
                  hasLivingSofa: Boolean(state.hasLivingSofa),
                  hasTvConsole: Boolean(state.hasTvConsole),
                }}
                initialView="all"
              />
            </div>
          </div>

          {/* =========================================================================
              SECTION 2: PHYSICAL MEASURES & STRUCTURAL ENGINEERING MATRIX (8 Cards)
             ========================================================================= */ }
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-gray-200">
              <h2 className="text-xs font-black uppercase tracking-wider text-gray-900 flex items-center gap-2 font-mono">
                <Ruler className="w-4 h-4 text-orange-600" />
                <span>2.0 Physical Dimensions, Rigging &amp; Structural Engineering Matrix</span>
              </h2>
              <span className="text-[11px] font-mono text-gray-500">Tolerance: ±1/8&quot; (3.2mm)</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 bg-[#F8F9FB] border border-gray-200 rounded-2xl">
                <div className="text-[10px] uppercase font-bold text-gray-400">External Dimensions</div>
                <div className="text-xs font-bold text-gray-900 mt-1">{currentModel.dimensions.metricStr}</div>
                <div className="text-[11px] text-gray-500 font-mono">
                  {currentModel.dimensions.lengthFt}′ × {currentModel.dimensions.widthFt}′ × {currentModel.dimensions.heightFt}′
                </div>
              </div>

              <div className="p-3.5 bg-[#F8F9FB] border border-gray-200 rounded-2xl">
                <div className="text-[10px] uppercase font-bold text-gray-400">Conditioned Living Area</div>
                <div className="text-xs font-bold text-gray-900 mt-1">{currentModel.sqft} Sq Ft</div>
                <div className="text-[11px] text-gray-500 font-mono">
                  {currentModel.areaM2 || Math.round(currentModel.sqft * 0.0929)} m² Usable Area
                </div>
              </div>

              <div className="p-3.5 bg-[#F8F9FB] border border-gray-200 rounded-2xl">
                <div className="text-[10px] uppercase font-bold text-gray-400">Structural Frame</div>
                <div className="text-xs font-bold text-gray-900 mt-1">Galvanized Q235 Steel</div>
                <div className="text-[11px] text-gray-500 font-mono">50+ Year Rated Lifespan</div>
              </div>

              <div className="p-3.5 bg-[#F8F9FB] border border-gray-200 rounded-2xl">
                <div className="text-[10px] uppercase font-bold text-gray-400">Folded Transport Profile</div>
                <div className="text-xs font-bold text-gray-900 mt-1">2,200mm (7.2′) Width</div>
                <div className="text-[11px] text-gray-500 font-mono">Standard Ocean Container Fit</div>
              </div>

              <div className="p-3.5 bg-[#F8F9FB] border border-gray-200 rounded-2xl">
                <div className="text-[10px] uppercase font-bold text-gray-400">Wind &amp; Typhoon</div>
                <div className="text-xs font-bold text-gray-900 mt-1">Level 12 Typhoon (140+ mph)</div>
                <div className="text-[11px] text-gray-500 font-mono">Seismic Grade 8 Rated</div>
              </div>

              <div className="p-3.5 bg-[#F8F9FB] border border-gray-200 rounded-2xl">
                <div className="text-[10px] uppercase font-bold text-gray-400">Thermal &amp; Acoustics</div>
                <div className="text-xs font-bold text-gray-900 mt-1">R-24 to R-32 Rockwool</div>
                <div className="text-[11px] text-gray-500 font-mono">40 dB Sound Isolation</div>
              </div>

              <div className="p-3.5 bg-[#F8F9FB] border border-gray-200 rounded-2xl">
                <div className="text-[10px] uppercase font-bold text-gray-400">Total Curb Weight</div>
                <div className="text-xs font-bold text-gray-900 mt-1">
                  {currentModel.weightKg ? `${currentModel.weightKg.toLocaleString()} kg` : '3,500 - 6,000 kg'}
                </div>
                <div className="text-[11px] text-gray-500 font-mono">
                  {currentModel.weightKg ? `~${Math.round(currentModel.weightKg * 2.20462).toLocaleString()} lbs` : '~10,000 lbs'}
                </div>
              </div>

              <div className="p-3.5 bg-[#F8F9FB] border border-gray-200 rounded-2xl">
                <div className="text-[10px] uppercase font-bold text-gray-400">Crane Pick Points</div>
                <div className="text-xs font-bold text-gray-900 mt-1">4x Corner Castings</div>
                <div className="text-[11px] text-gray-500 font-mono">Standard ISO Twistlock</div>
              </div>
            </div>
          </div>

          {/* =========================================================================
              SECTION 3: COMPLETE ARCHITECTURAL & MECHANICAL SYSTEMS SPECIFICATION
             ========================================================================= */}
          <div className="space-y-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-gray-900 border-b pb-1 border-gray-200 flex items-center gap-2 font-mono">
              <Zap className="w-4 h-4 text-orange-600" />
              <span>3.0 Selected Architectural, Electrical &amp; Mechanical Systems</span>
            </h2>

            <div className="divide-y divide-gray-100 text-xs">
              {/* Base Architecture */}
              <div className="py-2.5 flex items-start justify-between">
                <div>
                  <div className="font-bold text-gray-900">Base Architecture: {currentModel.name}</div>
                  <div className="text-gray-500">{currentModel.description}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    Lead time: {currentModel.leadTime} • Series: {currentModel.series || 'Modular Prefab'}
                  </div>
                </div>
                <span className="font-mono font-bold text-gray-900 shrink-0 ml-4">
                  {formatCurrency(currentModel.basePrice * markupFactor, config.currency)}
                </span>
              </div>

              {/* Selected Floor Plan */}
              {isExpandableHouse && floorPlanOpt && (
                <div className="py-2.5 flex items-start justify-between bg-blue-50/50 px-2 rounded-lg">
                  <div>
                    <div className="font-bold text-blue-950">Floor Plan Layout: {floorPlanOpt.name}</div>
                    <div className="text-blue-900/80 font-medium">
                      {floorPlanOpt.tagline} • {floorPlanOpt.bedrooms} Bed, {floorPlanOpt.bathrooms} Bath, {floorPlanOpt.livingRooms} Living
                    </div>
                    <div className="text-[10px] text-blue-700/80 mt-0.5">
                      Recommended: {floorPlanOpt.recommendedFor}
                    </div>
                  </div>
                  <span className="font-mono font-bold text-blue-950 shrink-0 ml-4">
                    {floorPlanOpt.price === 0
                      ? 'Included'
                      : formatCurrency(floorPlanOpt.price * markupFactor, config.currency, { showPlus: true })}
                  </span>
                </div>
              )}

              {/* Exterior Wall Cladding */}
              <div className="py-2.5 flex items-start justify-between">
                <div>
                  <div className="font-bold text-gray-900 flex items-center gap-2">
                    <span>Exterior Wall Cladding: {wallOpt.name}</span>
                    {wallOpt.color && (
                      <span
                        className="w-3 h-3 rounded-full border border-gray-300 inline-block"
                        style={{ backgroundColor: wallOpt.color }}
                      />
                    )}
                  </div>
                  <div className="text-gray-500">{wallOpt.specDetail || wallOpt.description}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    Category: {wallOpt.category || 'Factory Direct'} • Fire Rating: Class B1/A
                  </div>
                </div>
                <span className="font-mono font-bold text-gray-900 shrink-0 ml-4">
                  {getItemPriceForModel(wallOpt, state.modelId, config.models) === 0
                    ? 'Included'
                    : formatCurrency(getItemPriceForModel(wallOpt, state.modelId, config.models) * markupFactor, config.currency, { showPlus: true })}
                </span>
              </div>

              {/* Interior Wall Panels */}
              <div className="py-2.5 flex items-start justify-between">
                <div>
                  <div className="font-bold text-gray-900">Interior Wall Panels &amp; Ceiling: {intWallOpt.name}</div>
                  <div className="text-gray-500">{intWallOpt.specDetail || intWallOpt.description}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    Bamboo charcoal fiber composite • Zero formaldehyde (E0 standard) • 40dB acoustic barrier
                  </div>
                </div>
                <span className="font-mono font-bold text-gray-900 shrink-0 ml-4">
                  {getItemPriceForModel(intWallOpt, state.modelId, config.models) === 0
                    ? 'Included'
                    : formatCurrency(getItemPriceForModel(intWallOpt, state.modelId, config.models) * markupFactor, config.currency, { showPlus: true })}
                </span>
              </div>

              {/* Glazing Envelope */}
              <div className="py-2.5 flex items-start justify-between">
                <div>
                  <div className="font-bold text-gray-900">Doors &amp; Windows: {glassOpt.name}</div>
                  <div className="text-gray-500">{glassOpt.specDetail || glassOpt.description}</div>
                  <div className="text-[10px] text-emerald-700 font-medium mt-0.5">
                    Entrance door and perimeter windows included at no additional cost
                  </div>
                </div>
                <span className="font-mono font-bold text-gray-900 shrink-0 ml-4">
                  {getItemPriceForModel(glassOpt, state.modelId, config.models) === 0
                    ? 'Included'
                    : formatCurrency(getItemPriceForModel(glassOpt, state.modelId, config.models) * markupFactor, config.currency, { showPlus: true })}
                </span>
              </div>

              {/* Lighting Architecture */}
              <div className="py-2.5 flex items-start justify-between">
                <div>
                  <div className="font-bold text-gray-900">Lighting Architecture: {lightOpt.name}</div>
                  <div className="text-gray-500">{lightOpt.specDetail || lightOpt.description}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    Factory pre-wired 3000K warm recessed LED downlights + ambient perimeter halo channels
                  </div>
                </div>
                <span className="font-mono font-bold text-gray-900 shrink-0 ml-4">
                  {getItemPriceForModel(lightOpt, state.modelId, config.models) === 0
                    ? 'Included'
                    : formatCurrency(getItemPriceForModel(lightOpt, state.modelId, config.models) * markupFactor, config.currency, { showPlus: true })}
                </span>
              </div>

              {/* Electrical Load Center */}
              <div className="py-2.5 flex items-start justify-between">
                <div>
                  <div className="font-bold text-gray-900">Electrical Load Service: {elecOpt.name}</div>
                  <div className="text-gray-500">{elecOpt.specDetail || elecOpt.description}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    Multi-zone breaker panel • Smart scene switches • Dual-voltage 110V/220V circuitry
                  </div>
                </div>
                <span className="font-mono font-bold text-gray-900 shrink-0 ml-4">
                  {getItemPriceForModel(elecOpt, state.modelId, config.models) === 0
                    ? 'Included'
                    : formatCurrency(getItemPriceForModel(elecOpt, state.modelId, config.models) * markupFactor, config.currency, { showPlus: true })}
                </span>
              </div>

              {/* Structural Flooring */}
              <div className="py-2.5 flex items-start justify-between">
                <div>
                  <div className="font-bold text-gray-900">Structural Flooring &amp; Subfloor: {floorOpt.name}</div>
                  <div className="text-gray-500">{floorOpt.specDetail || floorOpt.description}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    18mm fireproof glass-magnesium (MGO) board + acoustic IXPE underlayment + waterproof surface
                  </div>
                </div>
                <span className="font-mono font-bold text-gray-900 shrink-0 ml-4">
                  {getItemPriceForModel(floorOpt, state.modelId, config.models) === 0
                    ? 'Included'
                    : formatCurrency(getItemPriceForModel(floorOpt, state.modelId, config.models) * markupFactor, config.currency, { showPlus: true })}
                </span>
              </div>

              {/* Kitchen Cabinetry */}
              {cabOpt && (
                <div className="py-2.5 flex items-start justify-between">
                  <div>
                    <div className="font-bold text-gray-900">Kitchen Cabinetry &amp; Counter: {cabOpt.name}</div>
                    <div className="text-gray-500">{cabOpt.description}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">
                      Solid quartz countertop, undermount sink, induction cooktop outlet, soft-close hardware
                    </div>
                  </div>
                  <span className="font-mono font-bold text-gray-900 shrink-0 ml-4">
                    {getItemPriceForModel(cabOpt, state.modelId, config.models) === 0
                      ? 'Included'
                      : formatCurrency(getItemPriceForModel(cabOpt, state.modelId, config.models) * markupFactor, config.currency, { showPlus: true })}
                  </span>
                </div>
              )}

              {/* Roof & Renewable Energy */}
              <div className="py-2.5 flex items-start justify-between">
                <div>
                  <div className="font-bold text-gray-900">Roof System &amp; Clean Energy: {roofOpt.name}</div>
                  <div className="text-gray-500">{roofOpt.specDetail || roofOpt.description}</div>
                </div>
                <span className="font-mono font-bold text-gray-900 shrink-0 ml-4">
                  {getItemPriceForModel(roofOpt, state.modelId, config.models) === 0
                    ? 'Included'
                    : formatCurrency(getItemPriceForModel(roofOpt, state.modelId, config.models) * markupFactor, config.currency, { showPlus: true })}
                </span>
              </div>

              {/* Active Modular Add-ons */}
              {activeAddons.map((addon) => {
                const unitPrice = getItemPriceForModel(addon, state.modelId, config.models);
                const unitSpec = getItemUnitSpec(addon, state.modelId);

                return (
                  <div key={addon.id} className="py-2.5 flex items-start justify-between">
                    <div>
                      <div className="font-bold text-gray-900 flex items-center gap-1.5 flex-wrap">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{addon.name}</span>
                        {unitSpec.sizeLabel && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                            {unitSpec.sizeLabel}
                          </span>
                        )}
                      </div>
                      <div className="text-gray-500">{unitSpec.specDetail || addon.specDetail || unitSpec.description || addon.description}</div>
                    </div>
                    <span className="font-mono font-bold text-gray-900 shrink-0 ml-4">
                      {formatCurrency(unitPrice * markupFactor, config.currency, { showPlus: true, ratesMap: config.exchangeRates })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* =========================================================================
              SECTION 4: LOGISTICS, TRANSPORT & ON-SITE ASSEMBLY PROTOCOL
             ========================================================================= */}
          <div className="space-y-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-gray-900 border-b pb-1 border-gray-200 flex items-center gap-2 font-mono">
              <Truck className="w-4 h-4 text-orange-600" />
              <span>4.0 Shipping, Foundation &amp; Rapid On-Site Deployment Protocol</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 bg-[#F8F9FB] rounded-2xl border border-gray-200 space-y-1">
                <div className="font-bold text-gray-900 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-orange-600" />
                  <span>Freight &amp; Ocean Transport</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Ships folded flat (2.2m width) inside standard 40HQ high-cube shipping container (1 unit for 30ft/40ft, 2 units for 20ft) or flatbed trailer.
                </p>
              </div>

              <div className="p-3.5 bg-[#F8F9FB] rounded-2xl border border-gray-200 space-y-1">
                <div className="font-bold text-gray-900 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-orange-600" />
                  <span>30-Minute Deployment</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Dual mechanical assisted wing deployment. Central chassis settles on foundation; wings unfold in under 30 minutes with 4-person crew.
                </p>
              </div>

              <div className="p-3.5 bg-[#F8F9FB] rounded-2xl border border-gray-200 space-y-1">
                <div className="font-bold text-gray-900 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-orange-600" />
                  <span>Plug &amp; Play Utilities</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Single-point quick connects: 3/4&quot; PEX-A cold water inlet, 3&quot; PVC DWV sewer drop, and 200A electrical service disconnect.
                </p>
              </div>
            </div>
          </div>

          {/* =========================================================================
              SECTION 5: COMMERCIAL INVESTMENT & FINANCIAL SUMMARY
             ========================================================================= */}
          <div className="space-y-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-gray-900 border-b pb-1 border-gray-200 font-mono">
              5.0 Commercial Bill of Materials (BOM) &amp; Total Investment Summary
            </h2>

            <div className="p-5 bg-[#F8F9FB] border border-gray-200 rounded-2xl space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <div className="text-xs text-gray-500 font-medium">Total Configured Factory Price</div>
                  <div className="text-[11px] text-orange-600 font-bold">
                    Transparent Pricing • 100% Pre-Fabricated, Utility Tested &amp; Warranted
                  </div>
                </div>
                <div className="text-3xl font-extrabold font-mono text-gray-950">
                  {formatCurrency(totalPrice, config.currency, { ratesMap: config.exchangeRates })}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-gray-600">
                <div>
                  <span className="text-[10px] text-gray-400 block uppercase font-bold">Production Lead Time</span>
                  <span className="font-bold text-gray-900 font-mono">{currentModel.leadTime}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block uppercase font-bold">Estimated Financing</span>
                  <span className="font-bold text-gray-900 font-mono">
                    {formatCurrency(Math.round((totalPrice * 0.85 * 0.0625) / 12), config.currency, { ratesMap: config.exchangeRates })}/mo*
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block uppercase font-bold">Refundable Deposit</span>
                  <span className="font-bold text-emerald-700 font-mono">
                    {formatCurrency(config.branding.reservationFee || 250, config.currency, { ratesMap: config.exchangeRates })}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block uppercase font-bold">Structural Frame Warranty</span>
                  <span className="font-bold text-gray-900">50-Year Limited</span>
                </div>
              </div>
            </div>
          </div>

          {/* =========================================================================
              SECTION 6: OFFICIAL QUALITY ASSURANCE SEAL & SIGN-OFF BLOCK
             ========================================================================= */}
          <div className="pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs text-gray-600">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
              <div className="font-bold text-gray-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Pre-Delivery Factory Inspection Checklist</span>
              </div>
              <ul className="text-[11px] text-gray-500 space-y-1 pl-4 list-disc">
                <li>100% Hydraulic &amp; Pneumatic Leak Tightness Test Passed</li>
                <li>1500V Dielectric Breakdown Electrical Safety Verification Passed</li>
                <li>Full Weather-Seal Spray Rig Simulation (Zero Infiltration)</li>
                <li>Structural Column Alignment &amp; Hinged Tolerance Verification</li>
              </ul>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col justify-between space-y-4">
              <div className="space-y-1">
                <div className="font-bold text-gray-900">Engineering Document Sign-Off</div>
                <div className="text-[10px] text-gray-500">
                  Certified Chief Structural Engineer &amp; Prefab Production Supervisor
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 text-[10px] font-mono">
                <div className="border-t border-gray-400 pt-1">
                  <div className="text-gray-400 uppercase">Chief Structural Engineer</div>
                  <div className="font-bold text-gray-900">APPROVED &amp; SEALED</div>
                </div>
                <div className="border-t border-gray-400 pt-1">
                  <div className="text-gray-400 uppercase">Client Acceptance Date</div>
                  <div className="font-bold text-gray-900">{docDate}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls (Screen Only) */}
        <div className="p-4 bg-[#FAFAFC] border-t border-gray-100 flex items-center justify-between gap-3 shrink-0 flex-wrap">
          <div className="text-xs text-gray-500 flex items-center gap-2">
            <Award className="w-4 h-4 text-orange-600" />
            <span>
              {currentModel.name} • {floorPlanOpt ? floorPlanOpt.name : 'Standard Layout'} • Ready for Download
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isExportingPDF}
              className="px-4 py-2.5 text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white rounded-xl shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
            >
              {isExportingPDF ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Spec Sheet (PDF)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
