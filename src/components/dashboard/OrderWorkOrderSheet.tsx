import React, { useState } from 'react';
import { CustomerOrder } from '../../types';
import { PrimaryCurrencyCode, formatCurrency } from '../../utils/currency';
import { BASE_MODELS } from '../../data/models';
import { ProductLineDrawing } from './ProductLineDrawing';
import {
  Printer,
  Download,
  CheckCircle2,
  Building,
  Ruler,
  Compass,
  Zap,
  Droplets,
  Wind,
  CheckSquare,
  Square,
  FileCheck,
  Shield,
  Layers,
  MapPin,
  Calendar,
  User,
  Loader2,
  FileText,
} from 'lucide-react';

interface OrderWorkOrderSheetProps {
  order: CustomerOrder;
  activeCurrency: PrimaryCurrencyCode;
  onPrint?: () => void;
  onDownloadPDF?: () => void;
  isDownloadingPDF?: boolean;
}

export const OrderWorkOrderSheet: React.FC<OrderWorkOrderSheetProps> = ({
  order,
  activeCurrency,
  onPrint,
  onDownloadPDF,
  isDownloadingPDF = false,
}) => {
  // Active sheet view on screen: 'all' (all 3 sheets stacked) or individual sheet
  const [activeSheetTab, setActiveSheetTab] = useState<'all' | 'sheet1' | 'sheet2' | 'sheet3'>('all');

  // Find model specification or fallback
  const modelSpec =
    BASE_MODELS.find((m) => m.id === order.customization.modelId) || BASE_MODELS[0];

  // Specific model dimensions
  const dims = modelSpec.dimensions;
  const isStudio = order.customization.modelId === 'studio';
  const isOneBed = order.customization.modelId === 'one-bedroom';
  const isTwoBed = order.customization.modelId === 'two-bedroom';

  // Engineering specs based on model
  const tareWeightLbs = isStudio ? 8200 : isOneBed ? 15400 : 23800;
  const tareWeightKg = Math.round(tareWeightLbs * 0.453592);
  const cranePickPoints = isTwoBed ? '6x ISO Corner Twistlock Castings' : '4x ISO Corner Twistlock Castings';
  const electricalService = isStudio ? '100A 120/240V 1-Phase' : isOneBed ? '150A 120/240V 1-Phase' : '200A 120/240V Dual-Bus';
  const hvacBtu = isStudio ? '12,000 BTU 22 SEER2' : isOneBed ? '18,000 BTU 20 SEER2' : '24,000 BTU Multi-Zone Dual-Head';
  const pierCount = isStudio ? 6 : isOneBed ? 8 : 10;

  // Interactive QA checklist items state
  const [qaChecks, setQaChecks] = useState<Record<string, boolean>>({
    frame: true,
    welds: true,
    torques: true,
    waterTest: true,
    megger: true,
    plumbingPressure: true,
    glazingSeals: false,
    cabinetryAlignment: false,
    hvacVacuum: false,
    protectiveWrapping: false,
  });

  const toggleCheck = (key: string) => {
    setQaChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const completedChecksCount = Object.values(qaChecks).filter(Boolean).length;
  const totalChecks = Object.keys(qaChecks).length;

  return (
    <div className="space-y-6 text-gray-900 font-sans print:p-0">
      {/* =========================================================================
          SCREEN-ONLY TOP CONTROL BAR & SHEET SWITCHER
         ========================================================================= */}
      <div className="bg-[#0A1628] text-white p-4 sm:p-5 rounded-2xl border border-sky-950 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center font-black text-sm shadow-md shrink-0">
            10A
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-mono font-bold tracking-widest text-orange-400 uppercase">
                10APPLES ARCHITECTURAL &amp; PRODUCTION DIVISION
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-950 text-sky-300 border border-sky-800">
                DWG NO: 10A-DWG-2026.4
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-white mt-0.5">
              FABRICATION WORK ORDER &amp; TECHNICAL BLUEPRINT
            </h1>
            <p className="text-xs text-sky-200/80 font-mono">
              Order #{order.id} • Model: <strong className="text-white">{order.customization.modelName}</strong> ({dims.lengthFt}&apos; × {dims.widthFt}&apos;) • 3-Sheet Engineering Dossier
            </p>
          </div>
        </div>

        {/* Action Controls & Screen Sheet Navigation */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex p-1 bg-white/10 rounded-xl border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => setActiveSheetTab('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeSheetTab === 'all'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              All 3 Sheets (Print View)
            </button>
            <button
              type="button"
              onClick={() => setActiveSheetTab('sheet1')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeSheetTab === 'sheet1'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Sheet 1: Plan
            </button>
            <button
              type="button"
              onClick={() => setActiveSheetTab('sheet2')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeSheetTab === 'sheet2'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Sheet 2: Elevations
            </button>
            <button
              type="button"
              onClick={() => setActiveSheetTab('sheet3')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeSheetTab === 'sheet3'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Sheet 3: BOM &amp; QA
            </button>
          </div>

          {onDownloadPDF && (
            <button
              type="button"
              onClick={onDownloadPDF}
              disabled={isDownloadingPDF}
              className="bg-orange-600 hover:bg-orange-500 active:scale-98 text-white font-black text-xs px-4 py-2 rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              title="Download high-resolution 3-sheet engineering work order PDF"
            >
              {isDownloadingPDF ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating 3-Page PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download PDF Work Order</span>
                </>
              )}
            </button>
          )}

          {onPrint && (
            <button
              type="button"
              onClick={onPrint}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Print Work Order Document"
            >
              <Printer className="w-4 h-4 text-sky-300" />
              <span>Print</span>
            </button>
          )}
        </div>
      </div>

      {/* =========================================================================
          PRINTABLE / PDF DOCUMENT PAGES CONTAINER
          Each sheet has [data-pdf-page="true"] ensuring exact 1:1 page rendering
         ========================================================================= */}
      <div className="space-y-8 print:space-y-0">
        {/* =========================================================================
            SHEET 1: ARCHITECTURAL CAD FLOOR PLAN & PROJECT DOSSIER
           ========================================================================= */}
        <div
          data-pdf-page="true"
          className={`pdf-page bg-white p-5 sm:p-7 rounded-2xl border border-gray-200 shadow-sm print:shadow-none print:border-none print:p-0 flex flex-col justify-between space-y-4 ${
            !isDownloadingPDF && activeSheetTab !== 'all' && activeSheetTab !== 'sheet1' ? 'hidden print:flex' : 'flex'
          }`}
          style={{ minHeight: '1020px' }}
        >
          <div className="space-y-4">
            {/* Sheet 1 Title Block Header */}
            <div className="border-b-2 border-orange-500 pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-orange-600 text-white flex items-center justify-center font-black text-base shadow-sm shrink-0">
                    10A
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono font-bold tracking-widest text-orange-600 uppercase">
                        10APPLES ARCHITECTURAL &amp; PRODUCTION DIVISION
                      </span>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-gray-100 text-gray-800 border border-gray-300">
                        DWG NO: 10A-DWG-2026.4
                      </span>
                    </div>
                    <h2 className="text-xl font-black tracking-tight text-gray-950 mt-0.5">
                      FABRICATION WORK ORDER &amp; TECHNICAL BLUEPRINT
                    </h2>
                    <p className="text-xs text-gray-600 font-mono">
                      Work Order #{order.id} • Model: <strong className="text-gray-950">{order.customization.modelName}</strong> ({dims.lengthFt}&apos; × {dims.widthFt}&apos;)
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="inline-block bg-orange-50 text-orange-800 border border-orange-200 font-mono font-black text-[10px] px-2.5 py-1 rounded-lg">
                    SHEET 1 OF 3: ARCHITECTURAL CAD PLAN
                  </div>
                  <div className="text-[10px] font-mono text-gray-500 mt-1">
                    AUTOCAD REV: 2026.4 • PLANT 1
                  </div>
                </div>
              </div>
            </div>

            {/* Primary Project & Production Dossier Bar (4 Cards) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs">
              <div className="p-2.5 bg-white rounded-lg border border-gray-200/80">
                <div className="text-[9px] uppercase font-bold text-gray-400 flex items-center gap-1">
                  <User className="w-3 h-3 text-orange-600" />
                  <span>Customer &amp; Project</span>
                </div>
                <div className="font-extrabold text-gray-950 text-xs mt-1 truncate">{order.customer.fullName}</div>
                <div className="text-[10px] text-gray-600 font-mono mt-0.5">{order.customer.phone}</div>
                <div className="text-[10px] text-gray-500 truncate">{order.customer.email}</div>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-gray-200/80">
                <div className="text-[9px] uppercase font-bold text-gray-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-orange-600" />
                  <span>Installation Site</span>
                </div>
                <div className="font-bold text-gray-900 text-xs mt-1 leading-snug truncate">
                  {order.customer.deliveryAddress || 'Site Address Pending Review'}
                </div>
                <div className="text-[10px] font-mono text-gray-600 mt-0.5">
                  Zip: <strong>{order.customer.zipCode}</strong>
                </div>
                <div className="text-[10px] text-gray-500">
                  Land: <strong className="capitalize">{order.customer.landStatus?.replace(/-/g, ' ')}</strong>
                </div>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-gray-200/80">
                <div className="text-[9px] uppercase font-bold text-gray-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-orange-600" />
                  <span>Manufacturing Timeline</span>
                </div>
                <div className="font-bold text-gray-900 text-xs mt-1">
                  Issued: <span className="font-mono">{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="text-[10px] text-orange-700 font-mono font-bold mt-0.5">
                  Target: {order.estimatedDeliveryDate || 'TBD (3-4 Wks)'}
                </div>
                <div className="text-[9px] text-gray-500">Bay C4 / Shift 1</div>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-gray-200/80">
                <div className="text-[9px] uppercase font-bold text-gray-400 flex items-center gap-1">
                  <Shield className="w-3 h-3 text-emerald-600" />
                  <span>Status &amp; Verification</span>
                </div>
                <div className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase font-mono bg-emerald-100 text-emerald-900 border border-emerald-300">
                  {order.status.replace(/_/g, ' ')}
                </div>
                <div className="text-[10px] font-mono text-gray-600 mt-1">
                  Deposit: <strong className="text-emerald-700">{formatCurrency(order.pricing.depositDue, activeCurrency)} (Verified)</strong>
                </div>
              </div>
            </div>

            {/* SECTION 1.0: ARCHITECTURAL LINE DRAWING & CAD BLUEPRINT (VIEW 1) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between pb-1 border-b border-gray-200">
                <h3 className="text-xs font-black text-gray-950 uppercase tracking-wide flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-orange-600" />
                  <span>1.0 Architectural Line Drawings &amp; Orthographic Blueprint (View 1: Plan)</span>
                </h3>
                <span className="text-[10px] font-mono text-gray-500">
                  Model: {order.customization.modelName} ({dims.metricStr})
                </span>
              </div>

              {/* View 1 Architectural Floor Plan Drawing */}
              <ProductLineDrawing
                modelId={order.customization.modelId}
                modelName={order.customization.modelName}
                floorPlanId={order.customization.floorPlan || order.customization.floorPlanId}
                customization={order.customization}
                initialView="plan"
                compact
                hideControls
                hideHeader
                hideFooter
              />
            </div>
          </div>

          {/* Sheet 1 Engineering Approval Strip & Footer */}
          <div className="pt-3 border-t border-gray-200 space-y-2">
            <div className="p-2 bg-gray-50 rounded-lg border border-gray-200 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-gray-600">
              <div className="flex items-center gap-2 flex-wrap">
                <span>
                  APPROVED FOR PRODUCTION: <strong className="text-emerald-700 font-bold">YES</strong>
                </span>
                <span>•</span>
                <span>AUTOCAD REV: <strong>2026.4</strong></span>
                <span>•</span>
                <span>IBC &amp; HUD CODE COMPLIANT</span>
                <span>•</span>
                <span>TOLERANCE: <strong>±1/8&quot; [3.2mm]</strong></span>
              </div>
              <div className="text-gray-500">
                Engineering dimensions factory verified. All rights reserved.
              </div>
            </div>

            <div className="flex items-center justify-between text-[9px] font-mono text-gray-400 uppercase tracking-wider">
              <span>10Apples Modular Housing Systems Inc.</span>
              <span>CONFIDENTIAL &amp; PROPRIETARY • FABRICATION USE ONLY</span>
              <span className="font-bold text-gray-700">SHEET 1 OF 3 • REV 2026.4</span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            SHEET 2: ELEVATIONS, RIGGING & FOUNDATION SCHEDULE
           ========================================================================= */}
        <div
          data-pdf-page="true"
          className={`pdf-page bg-white p-5 sm:p-7 rounded-2xl border border-gray-200 shadow-sm print:shadow-none print:border-none print:p-0 flex flex-col justify-between space-y-4 ${
            !isDownloadingPDF && activeSheetTab !== 'all' && activeSheetTab !== 'sheet2' ? 'hidden print:flex' : 'flex'
          }`}
          style={{ minHeight: '1020px' }}
        >
          <div className="space-y-4">
            {/* Sheet 2 Header */}
            <div className="border-b-2 border-orange-500 pb-2.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center font-black text-sm shadow-sm shrink-0">
                    10A
                  </div>
                  <div>
                    <div className="text-[9px] font-mono font-bold tracking-widest text-orange-600 uppercase">
                      10APPLES ARCHITECTURAL &amp; PRODUCTION DIVISION • DWG NO: 10A-DWG-2026.4
                    </div>
                    <h2 className="text-base font-black tracking-tight text-gray-950">
                      FABRICATION WORK ORDER #{order.id} • ELEVATION &amp; FOUNDATION RIGGING
                    </h2>
                    <p className="text-[11px] text-gray-600 font-mono">
                      Model: <strong>{order.customization.modelName}</strong> ({dims.lengthFt}&apos; × {dims.widthFt}&apos;) • Structural Clearances &amp; Utility Ingress
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="inline-block bg-orange-50 text-orange-800 border border-orange-200 font-mono font-black text-[10px] px-2.5 py-1 rounded-lg">
                    SHEET 2 OF 3: ELEVATION &amp; FOUNDATION
                  </div>
                </div>
              </div>
            </div>

            {/* View 2: Front Exterior Elevation Drawing */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between pb-1 border-b border-gray-200 text-xs">
                <span className="font-black text-gray-900 font-mono text-[11px] flex items-center gap-1.5">
                  <Ruler className="w-3.5 h-3.5 text-orange-600" />
                  <span>VIEW 2: FRONT EXTERIOR ORTHOGRAPHIC ELEVATION &amp; RIGGING</span>
                </span>
                <span className="text-[10px] font-mono text-gray-500">WALL PANELS &amp; CURTAIN GLASS</span>
              </div>
              <ProductLineDrawing
                modelId={order.customization.modelId}
                modelName={order.customization.modelName}
                floorPlanId={order.customization.floorPlan || order.customization.floorPlanId}
                customization={order.customization}
                initialView="elevation"
                compact
                hideControls
                hideHeader
                hideFooter
              />
            </div>

            {/* View 3: Foundation Anchor Grid Drawing */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between pb-1 border-b border-gray-200 text-xs">
                <span className="font-black text-gray-900 font-mono text-[11px] flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-orange-600" />
                  <span>VIEW 3: STRUCTURAL FOUNDATION ANCHOR GRID &amp; MEP ROUGH-IN</span>
                </span>
                <span className="text-[10px] font-mono text-gray-500">PIER BOLT LAYOUT &amp; SERVICE INGRESS</span>
              </div>
              <ProductLineDrawing
                modelId={order.customization.modelId}
                modelName={order.customization.modelName}
                floorPlanId={order.customization.floorPlan || order.customization.floorPlanId}
                customization={order.customization}
                initialView="foundation"
                compact
                hideControls
                hideHeader
                hideFooter
              />
            </div>

            {/* Section 2.0: Physical Measures & Clearances */}
            <div className="space-y-2">
              <div className="flex items-center justify-between pb-1 border-b border-orange-500">
                <h3 className="text-xs font-black text-gray-950 uppercase tracking-wide flex items-center gap-1.5">
                  <Ruler className="w-3.5 h-3.5 text-orange-600" />
                  <span>2.0 Physical Measures, Clearances &amp; Rigging Specifications</span>
                </h3>
                <span className="text-[10px] font-mono text-gray-500">
                  Tolerance: ±1/8&quot; (3.2mm)
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200 space-y-0.5">
                  <div className="text-[9px] font-mono font-bold text-gray-400 uppercase">
                    Exterior Footprint
                  </div>
                  <div className="font-extrabold text-gray-950 text-xs font-mono">
                    {dims.lengthFt}&apos;-0&quot; L × {dims.widthFt}&apos;-0&quot; W × {dims.heightFt}&apos;-0&quot; H
                  </div>
                  <div className="text-[10px] text-gray-600 font-mono truncate">{dims.metricStr}</div>
                </div>

                <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200 space-y-0.5">
                  <div className="text-[9px] font-mono font-bold text-gray-400 uppercase">
                    Interior Living Space
                  </div>
                  <div className="font-extrabold text-gray-950 text-xs font-mono">
                    {modelSpec.sqft} SQ FT [{(modelSpec.sqft * 0.092903).toFixed(1)} m²]
                  </div>
                  <div className="text-[10px] text-gray-600 font-mono">Clear Ceiling: 8&apos;-6&quot; AFF</div>
                </div>

                <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200 space-y-0.5">
                  <div className="text-[9px] font-mono font-bold text-gray-400 uppercase">
                    Dry Tare &amp; Crane Rig
                  </div>
                  <div className="font-extrabold text-gray-950 text-xs font-mono">
                    {tareWeightLbs.toLocaleString()} LBS [{tareWeightKg.toLocaleString()} KG]
                  </div>
                  <div className="text-[10px] text-gray-600 font-mono truncate">{cranePickPoints}</div>
                </div>

                <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200 space-y-0.5">
                  <div className="text-[9px] font-mono font-bold text-gray-400 uppercase">
                    Structural Load Ratings
                  </div>
                  <div className="font-extrabold text-gray-950 text-xs font-mono">
                    140 MPH Wind • 40 PSF Snow
                  </div>
                  <div className="text-[10px] text-gray-600 font-mono">Seismic Zone D • Class A</div>
                </div>
              </div>

              {/* Foundation Pier & Anchor Bolt Schedule */}
              <div className="p-2.5 bg-white rounded-xl border border-gray-200 space-y-1.5 text-xs">
                <div className="font-bold text-gray-900 flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-orange-600" />
                    <span>Foundation Pier &amp; Anchor Bolt Schedule ({pierCount}-Point Foundation Support)</span>
                  </span>
                  <span className="text-[9px] font-mono bg-orange-50 text-orange-800 px-2 py-0.5 rounded border border-orange-200 font-bold">
                    Min. 3,000 PSI Concrete
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-0.5 text-[10px] font-mono text-gray-700">
                  <div>
                    <span className="text-gray-400 block text-[9px]">PIER TYPE &amp; SIZING</span>
                    <span>12&quot; Ø Concrete Pier or Helical Pile to frost depth</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[9px]">ANCHOR BOLT HARDWARE</span>
                    <span>2× 5/8&quot; ASTM A307 HDG bolts per pier, 8&quot; embedment</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[9px]">SOIL BEARING CAPACITY</span>
                    <span>Min. 2,000 PSF undisturbed bearing capacity</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sheet 2 Footer */}
          <div className="pt-3 border-t border-gray-200 flex items-center justify-between text-[9px] font-mono text-gray-400 uppercase tracking-wider">
            <span>10Apples Structural Engineering Division</span>
            <span>STRUCTURAL CALCULATIONS PE-STAMPED • SEISMIC &amp; WIND RATED</span>
            <span className="font-bold text-gray-700">SHEET 2 OF 3 • REV 2026.4</span>
          </div>
        </div>

        {/* =========================================================================
            SHEET 3: BILL OF MATERIALS (BOM), MEP UTILITIES & QA SIGN-OFF
           ========================================================================= */}
        <div
          data-pdf-page="true"
          className={`pdf-page bg-white p-5 sm:p-7 rounded-2xl border border-gray-200 shadow-sm print:shadow-none print:border-none print:p-0 flex flex-col justify-between space-y-3.5 ${
            !isDownloadingPDF && activeSheetTab !== 'all' && activeSheetTab !== 'sheet3' ? 'hidden print:flex' : 'flex'
          }`}
          style={{ minHeight: '1020px' }}
        >
          <div className="space-y-3.5">
            {/* Sheet 3 Header */}
            <div className="border-b-2 border-orange-500 pb-2.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center font-black text-sm shadow-sm shrink-0">
                    10A
                  </div>
                  <div>
                    <div className="text-[9px] font-mono font-bold tracking-widest text-orange-600 uppercase">
                      10APPLES ARCHITECTURAL &amp; PRODUCTION DIVISION • DWG NO: 10A-DWG-2026.4
                    </div>
                    <h2 className="text-base font-black tracking-tight text-gray-950">
                      FABRICATION WORK ORDER #{order.id} • MATERIALS, UTILITIES &amp; QA DISPATCH
                    </h2>
                    <p className="text-[11px] text-gray-600 font-mono">
                      Model: <strong>{order.customization.modelName}</strong> ({dims.lengthFt}&apos; × {dims.widthFt}&apos;) • Verification &amp; Final Sign-Off
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="inline-block bg-orange-50 text-orange-800 border border-orange-200 font-mono font-black text-[10px] px-2.5 py-1 rounded-lg">
                    SHEET 3 OF 3: BOM &amp; QA SIGN-OFF
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: ARCHITECTURAL BILL OF MATERIALS & ORDERED FINISHES */}
            <div className="space-y-2">
              <div className="flex items-center justify-between pb-1 border-b border-orange-500">
                <h3 className="text-xs font-black text-gray-950 uppercase tracking-wide flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-orange-600" />
                  <span>3.0 Custom Enclosure &amp; Architectural Materials Bill (BOM)</span>
                </h3>
                <span className="text-[10px] font-mono text-gray-500">
                  Verified Against Customer Reservation Dossier
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs border border-gray-200 rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 uppercase font-bold text-[9px] font-mono">
                      <th className="py-1.5 px-2.5 border-b border-gray-200">Category</th>
                      <th className="py-1.5 px-2.5 border-b border-gray-200">Selected Specification &amp; Material</th>
                      <th className="py-1.5 px-2.5 border-b border-gray-200">Technical Details / Rating</th>
                      <th className="py-1.5 px-2.5 border-b border-gray-200 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-[11px]">
                    <tr>
                      <td className="py-1.5 px-2.5 font-bold text-gray-900 bg-gray-50/50">Exterior Skin</td>
                      <td className="py-1.5 px-2.5 font-extrabold text-gray-950 flex items-center gap-2">
                        {order.customization.wallCladdingColor && (
                          <span
                            className="w-3 h-3 rounded-full border border-black/20 shrink-0 inline-block shadow-2xs"
                            style={{ backgroundColor: order.customization.wallCladdingColor }}
                          />
                        )}
                        <span>{order.customization.wallCladdingName}</span>
                      </td>
                      <td className="py-1.5 px-2.5 font-mono text-[10px] text-gray-600">
                        Fluorocarbon coated alloy, R-24 polyiso core, Class A
                      </td>
                      <td className="py-1.5 px-2.5 text-center">
                        <span className="text-[9px] font-bold font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          Allocated
                        </span>
                      </td>
                    </tr>

                    <tr>
                      <td className="py-1.5 px-2.5 font-bold text-gray-900 bg-gray-50/50">Glazing Envelope</td>
                      <td className="py-1.5 px-2.5 font-bold text-gray-900">{order.customization.glazingName}</td>
                      <td className="py-1.5 px-2.5 font-mono text-[10px] text-gray-600">
                        Dual 6mm+12A+6mm tempered Low-E argon insulated, U-factor 1.4, STC 40dB
                      </td>
                      <td className="py-1.5 px-2.5 text-center">
                        <span className="text-[9px] font-bold font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          In Stock
                        </span>
                      </td>
                    </tr>

                    <tr>
                      <td className="py-1.5 px-2.5 font-bold text-gray-900 bg-gray-50/50">Flooring Core</td>
                      <td className="py-1.5 px-2.5 font-bold text-gray-900">{order.customization.flooringName}</td>
                      <td className="py-1.5 px-2.5 font-mono text-[10px] text-gray-600">
                        Rigid core waterproof SPC plank (7.5mm), IXPE 1.5mm acoustic underlayment
                      </td>
                      <td className="py-1.5 px-2.5 text-center">
                        <span className="text-[9px] font-bold font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          Allocated
                        </span>
                      </td>
                    </tr>

                    <tr>
                      <td className="py-1.5 px-2.5 font-bold text-gray-900 bg-gray-50/50">Kitchen Millwork</td>
                      <td className="py-1.5 px-2.5 font-bold text-gray-900">
                        {order.customization.cabinetryName || 'Standard Integrated Galley'}
                      </td>
                      <td className="py-1.5 px-2.5 font-mono text-[10px] text-gray-600">
                        Quartz composite slab counter, Blum soft-close European hardware
                      </td>
                      <td className="py-1.5 px-2.5 text-center">
                        <span className="text-[9px] font-bold font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          Ready
                        </span>
                      </td>
                    </tr>

                    <tr>
                      <td className="py-1.5 px-2.5 font-bold text-gray-900 bg-gray-50/50">Roof &amp; Solar</td>
                      <td className="py-1.5 px-2.5 font-bold text-gray-900">{order.customization.roofName}</td>
                      <td className="py-1.5 px-2.5 font-mono text-[10px] text-gray-600">
                        TPO/EPDM membrane, 1.5° drainage pitch, pre-wired conduit to inverter hub
                      </td>
                      <td className="py-1.5 px-2.5 text-center">
                        <span className="text-[9px] font-bold font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          Allocated
                        </span>
                      </td>
                    </tr>

                    <tr>
                      <td className="py-1.5 px-2.5 font-bold text-gray-900 bg-gray-50/50">Electrical Hub</td>
                      <td className="py-1.5 px-2.5 font-bold text-gray-900">
                        {order.customization.electricalName || 'Pre-wired 100A Square D Load Center'}
                      </td>
                      <td className="py-1.5 px-2.5 font-mono text-[10px] text-gray-600">
                        {electricalService}, copper romex wiring, AFCI/GFCI breakers throughout
                      </td>
                      <td className="py-1.5 px-2.5 text-center">
                        <span className="text-[9px] font-bold font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          Verified
                        </span>
                      </td>
                    </tr>

                    <tr>
                      <td className="py-1.5 px-2.5 font-bold text-gray-900 bg-gray-50/50">Lighting Package</td>
                      <td className="py-1.5 px-2.5 font-bold text-gray-900">{order.customization.lightingName}</td>
                      <td className="py-1.5 px-2.5 font-mono text-[10px] text-gray-600">
                        24V COB linear architectural indirect LED glow, CRI 95+, 3000K warm white
                      </td>
                      <td className="py-1.5 px-2.5 text-center">
                        <span className="text-[9px] font-bold font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          In Stock
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Selected Modular Add-on Modules List */}
              <div className="p-2 bg-gray-50 rounded-lg border border-gray-200 text-xs">
                <span className="text-[9px] font-bold text-gray-500 uppercase font-mono block mb-1">
                  Factory Pre-Installed Modular Add-ons &amp; Accessories:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {order.customization.addonsList && order.customization.addonsList.length > 0 ? (
                    order.customization.addonsList.map((addon, idx) => (
                      <span
                        key={idx}
                        className="bg-white text-gray-900 text-[10px] font-semibold px-2 py-0.5 rounded border border-gray-200 flex items-center gap-1 shadow-2xs"
                      >
                        <CheckCircle2 className="w-3 h-3 text-orange-600" />
                        <span>{addon}</span>
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 font-mono text-[10px]">Standard baseline cabin configuration</span>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 4: MEP CONNECTION SCHEDULE */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between pb-1 border-b border-orange-500">
                <h3 className="text-xs font-black text-gray-950 uppercase tracking-wide flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-orange-600" />
                  <span>4.0 MEP Factory Utility Rough-in &amp; Connection Schedule</span>
                </h3>
                <span className="text-[10px] font-mono text-gray-500">
                  Plug-and-Play Quick-Connect Ports
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 bg-amber-50/50 rounded-xl border border-amber-200 space-y-1">
                  <div className="flex items-center gap-1 font-bold text-amber-950 text-[11px]">
                    <Zap className="w-3 h-3 text-amber-600" />
                    <span>Electrical Ingress &amp; Breakers</span>
                  </div>
                  <ul className="space-y-0.5 font-mono text-[10px] text-amber-900">
                    <li>• Main: <strong>{electricalService}</strong></li>
                    <li>• Ingress: 2&quot; PVC stub-up @ rear left corner</li>
                    <li>• C1: 20A Kitchen Small Appliance (GFCI)</li>
                    <li>• C2: 20A Induction Cooktop (240V)</li>
                    <li>• C3: 20A Bath Pod GFCI &amp; Exhaust Fan</li>
                    <li>• C4: 25A 240V HVAC Mini-Split</li>
                  </ul>
                </div>

                <div className="p-2.5 bg-sky-50/50 rounded-xl border border-sky-200 space-y-1">
                  <div className="flex items-center gap-1 font-bold text-sky-950 text-[11px]">
                    <Droplets className="w-3 h-3 text-sky-600" />
                    <span>Water Supply &amp; Drainage</span>
                  </div>
                  <ul className="space-y-0.5 font-mono text-[10px] text-sky-900">
                    <li>• Fresh Water: <strong>3/4&quot; PEX-A</strong> brass shutoff</li>
                    <li>• Location: +18&quot; AFF rear wall</li>
                    <li>• Operating: 55–65 PSI pressure</li>
                    <li>• Hot Water: 13.5kW 240V tankless</li>
                    <li>• Sewer Drain: <strong>3&quot; DWV PVC</strong> cleanout drop</li>
                    <li>• Vent: 1-1/2&quot; stack with flashing</li>
                  </ul>
                </div>

                <div className="p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-1">
                  <div className="flex items-center gap-1 font-bold text-emerald-950 text-[11px]">
                    <Wind className="w-3 h-3 text-emerald-600" />
                    <span>Climate Control &amp; Ventilation</span>
                  </div>
                  <ul className="space-y-0.5 font-mono text-[10px] text-emerald-900">
                    <li>• Mini-Split: <strong>{hvacBtu}</strong></li>
                    <li>• Line-Set: 3/8&quot; liquid + 5/8&quot; suction pre-run</li>
                    <li>• Sleeve: 3&quot; thru-wall @ +84&quot; AFF</li>
                    <li>• Condensate: 3/4&quot; gravity drain</li>
                    <li>• Bath ERV: 80 CFM continuous</li>
                    <li>• Range Hood: 250 CFM recirculating</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* SECTION 5: FINANCIAL LEDGER (SINGLE CURRENCY ENFORCED) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between pb-1 border-b border-orange-500">
                <h3 className="text-xs font-black text-gray-950 uppercase tracking-wide flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-orange-600" />
                  <span>5.0 Project Invoicing &amp; Financial Ledger</span>
                </h3>
                <span className="text-[10px] font-mono text-emerald-700 font-bold">
                  Single Currency Enforced: {activeCurrency}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 bg-gray-50 rounded-xl border border-gray-200 text-xs font-mono">
                <div>
                  <span className="text-gray-400 text-[9px] uppercase font-bold block">Base Cabin Chassis</span>
                  <span className="font-extrabold text-gray-900 text-xs">
                    {formatCurrency(order.pricing.basePrice, activeCurrency)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 text-[9px] uppercase font-bold block">Options &amp; Upgrades</span>
                  <span className="font-extrabold text-gray-900 text-xs">
                    {formatCurrency(order.pricing.optionsTotal, activeCurrency)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 text-[9px] uppercase font-bold block">Freight &amp; Site Prep</span>
                  <span className="font-extrabold text-gray-900 text-xs">
                    {formatCurrency((order.pricing.freightCost || 0) + (order.pricing.sitePrepCost || 0), activeCurrency)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 text-[9px] uppercase font-bold block">Total Contract Value</span>
                  <span className="font-black text-emerald-700 text-sm">
                    {formatCurrency(order.pricing.totalPrice, activeCurrency)}
                  </span>
                </div>
              </div>
            </div>

            {/* SECTION 6: SHOP FLOOR QA CHECKLIST & SIGN-OFF */}
            <div className="space-y-2">
              <div className="flex items-center justify-between pb-1 border-b border-orange-500">
                <h3 className="text-xs font-black text-gray-950 uppercase tracking-wide flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-orange-600" />
                  <span>6.0 Shop Floor Fabrication &amp; Pre-Dispatch QA Checklist</span>
                </h3>
                <span className="text-[10px] font-mono font-bold text-gray-700">
                  Completed: <strong className="text-emerald-600">{completedChecksCount}</strong> / {totalChecks} Steps
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                {[
                  { id: 'frame', label: '1. Q235 chassis diagonal squareness verified within ±1/8" (3mm)' },
                  { id: 'welds', label: '2. All structural framing weld seams inspected & magnetic tested' },
                  { id: 'torques', label: '3. Foundation anchor bracket bolt torques certified to 120 ft-lbs' },
                  { id: 'waterTest', label: '4. External envelope rain deluge spray test completed (30m @ 35 PSI)' },
                  { id: 'megger', label: '5. Electrical load center Megger insulation & ground test passed' },
                  { id: 'plumbingPressure', label: '6. PEX supply pressure decay test passed (100 PSI, 24-hr hold)' },
                  { id: 'glazingSeals', label: '7. Low-E panoramic glazing weather-stripping & locks inspected' },
                  { id: 'cabinetryAlignment', label: '8. Quartz kitchen counter & vanity plumbing fixtures leak-free' },
                  { id: 'hvacVacuum', label: '9. Mini-split heat pump line-set vacuum pulled below 500 microns' },
                  { id: 'protectiveWrapping', label: '10. Crane pick lugs tested to 45 kN and transit shrink-wrap applied' },
                ].map((item) => {
                  const isChecked = qaChecks[item.id] || false;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleCheck(item.id)}
                      className={`p-1.5 rounded-lg border text-left flex items-center gap-2 transition-colors cursor-pointer ${
                        isChecked
                          ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-bold'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      )}
                      <span className="text-[10px] leading-tight">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Official Sign-off Stamp Block */}
              <div className="pt-2 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono">
                <div className="border border-dashed border-gray-300 p-2 rounded-xl bg-gray-50/50">
                  <span className="text-[9px] text-gray-400 block font-bold uppercase">Lead Assembly Engineer</span>
                  <div className="font-extrabold text-gray-900 mt-1 font-serif italic text-xs">
                    Marcus Sterling, PE #48291
                  </div>
                  <div className="text-[9px] text-gray-500 mt-0.5">Signature on File • Plant Operations</div>
                </div>

                <div className="border border-dashed border-gray-300 p-2 rounded-xl bg-gray-50/50">
                  <span className="text-[9px] text-gray-400 block font-bold uppercase">Quality Control Inspector</span>
                  <div className="font-extrabold text-gray-900 mt-1 font-serif italic text-xs">
                    Sarah Jenkins, CWI
                  </div>
                  <div className="text-[9px] text-gray-500 mt-0.5">Certified Welding &amp; Code Inspector</div>
                </div>

                <div className="border border-dashed border-gray-300 p-2 rounded-xl bg-gray-50/50 text-center flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full border-2 border-emerald-600 flex flex-col items-center justify-center text-emerald-700 font-extrabold text-[8px] uppercase tracking-tighter shadow-2xs">
                    <span>10APPLES QC</span>
                    <span className="text-[9px] font-black">PASSED</span>
                    <span className="text-[6px]">DISPATCH OK</span>
                  </div>
                  <span className="text-[8px] text-gray-400 mt-0.5">Serial Tag #10A-2026-MFG</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sheet 3 Footer */}
          <div className="pt-2.5 border-t border-gray-200 flex items-center justify-between text-[9px] font-mono text-gray-400 uppercase tracking-wider">
            <span>10Apples Quality Assurance &amp; Plant Operations</span>
            <span>OFFICIAL FABRICATION RELEASE • DISPATCH AUTHORIZED</span>
            <span className="font-bold text-gray-700">SHEET 3 OF 3 • END OF DOSSIER</span>
          </div>
        </div>
      </div>
    </div>
  );
};
