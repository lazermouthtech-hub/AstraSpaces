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
  Wrench,
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
  Phone,
  Mail,
  Loader2,
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

  // Interactive QA checklist items state (stored in local component state for shop technician)
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
    <div className="space-y-6 bg-white text-gray-900 font-sans print:p-0">
      {/* Top Document Header & Quick Actions */}
      <div className="bg-[#0A1628] text-white p-5 sm:p-6 rounded-3xl border border-sky-950 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 print:bg-white print:text-black print:border-black print:shadow-none">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white flex items-center justify-center font-black text-xl shadow-md shrink-0 print:border print:border-black">
            B
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold tracking-widest text-orange-400 uppercase print:text-black">
                BOXABL ARCHITECTURAL &amp; PRODUCTION DIVISION
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-950 text-sky-300 border border-sky-800 print:border-black print:text-black">
                DWG NO: BX-DWG-2026.4
              </span>
            </div>
            <h1 className="text-lg sm:text-2xl font-black tracking-tight text-white mt-0.5 print:text-black">
              FABRICATION WORK ORDER &amp; TECHNICAL BLUEPRINT
            </h1>
            <p className="text-xs text-sky-200/80 font-mono mt-0.5 print:text-gray-600">
              Work Order #{order.id} • Model: <strong className="text-white print:text-black">{order.customization.modelName}</strong> ({dims.lengthFt}&apos; × {dims.widthFt}&apos;)
            </p>
          </div>
        </div>

        {/* Action Controls (Hidden on Print) */}
        <div className="flex items-center gap-2 flex-wrap no-print">
          {onDownloadPDF && (
            <button
              type="button"
              onClick={onDownloadPDF}
              disabled={isDownloadingPDF}
              className="bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              title="Download high-resolution engineering blueprint work order as PDF"
            >
              {isDownloadingPDF ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating PDF...</span>
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
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Print Work Order Document"
            >
              <Printer className="w-4 h-4 text-sky-300" />
              <span>Print Spec</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary Project & Production Dossier Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs print:bg-white print:border-black">
        <div className="p-3 bg-white rounded-xl border border-gray-100 print:border-gray-300">
          <div className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
            <User className="w-3 h-3 text-orange-600" />
            <span>Customer &amp; Project</span>
          </div>
          <div className="font-extrabold text-gray-950 text-sm mt-1">{order.customer.fullName}</div>
          <div className="text-[11px] text-gray-600 font-mono mt-0.5">{order.customer.phone}</div>
          <div className="text-[11px] text-gray-600 truncate">{order.customer.email}</div>
        </div>

        <div className="p-3 bg-white rounded-xl border border-gray-100 print:border-gray-300">
          <div className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-orange-600" />
            <span>Installation Site</span>
          </div>
          <div className="font-bold text-gray-900 mt-1 leading-snug">
            {order.customer.deliveryAddress || 'Site Address Pending Review'}
          </div>
          <div className="text-[11px] font-mono text-gray-600 mt-0.5">
            Zip: <strong>{order.customer.zipCode}</strong> • Land: <strong className="capitalize">{order.customer.landStatus?.replace(/-/g, ' ')}</strong>
          </div>
        </div>

        <div className="p-3 bg-white rounded-xl border border-gray-100 print:border-gray-300">
          <div className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-orange-600" />
            <span>Manufacturing Timeline</span>
          </div>
          <div className="font-bold text-gray-900 mt-1">
            Issued: <span className="font-mono">{new Date(order.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="text-[11px] text-orange-700 font-mono font-bold mt-0.5">
            Target Delivery: {order.estimatedDeliveryDate || 'TBD (3-4 Weeks)'}
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">Plant 1, Bay C4</div>
        </div>

        <div className="p-3 bg-white rounded-xl border border-gray-100 print:border-gray-300">
          <div className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
            <Shield className="w-3 h-3 text-emerald-600" />
            <span>Status &amp; Verification</span>
          </div>
          <div className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-black uppercase font-mono bg-emerald-100 text-emerald-900 border border-emerald-300">
            {order.status.replace(/_/g, ' ')}
          </div>
          <div className="text-[11px] font-mono text-gray-600 mt-1">
            Deposit: <strong className="text-emerald-700">{formatCurrency(order.pricing.depositDue, activeCurrency)} (Verified)</strong>
          </div>
        </div>
      </div>

      {/* SECTION 1: ARCHITECTURAL LINE DRAWING & CAD BLUEPRINT */}
      <div className="space-y-3 print-break-inside-avoid">
        <div className="flex items-center justify-between pb-1 border-b-2 border-orange-500">
          <h2 className="text-sm font-black text-gray-950 uppercase tracking-wide flex items-center gap-2">
            <Compass className="w-4 h-4 text-orange-600" />
            <span>1.0 Architectural Line Drawings &amp; Orthographic Blueprint</span>
          </h2>
          <span className="text-[11px] font-mono text-gray-500">
            Model: {order.customization.modelName} ({dims.metricStr})
          </span>
        </div>

        {/* Embedded Vector CAD Drawing Component */}
        <ProductLineDrawing
          modelId={order.customization.modelId}
          modelName={order.customization.modelName}
          customization={order.customization}
          initialView="all"
        />
      </div>

      {/* SECTION 2: PHYSICAL MEASURES & STRUCTURAL ENGINEERING MATRIX */}
      <div className="space-y-3 print-break-inside-avoid">
        <div className="flex items-center justify-between pb-1 border-b-2 border-orange-500">
          <h2 className="text-sm font-black text-gray-950 uppercase tracking-wide flex items-center gap-2">
            <Ruler className="w-4 h-4 text-orange-600" />
            <span>2.0 Physical Measures, Clearances &amp; Rigging Specifications</span>
          </h2>
          <span className="text-[11px] font-mono text-gray-500">
            Engineering Precision Tolerance: ±1/8&quot; (3.2mm)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {/* External Dimensions */}
          <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
            <div className="text-[10px] font-mono font-bold text-gray-400 uppercase">
              Overall Exterior Footprint
            </div>
            <div className="font-extrabold text-gray-950 text-sm font-mono">
              {dims.lengthFt}&apos;-0&quot; L × {dims.widthFt}&apos;-0&quot; W × {dims.heightFt}&apos;-0&quot; H
            </div>
            <div className="text-[11px] text-gray-600 font-mono">
              {dims.metricStr}
            </div>
          </div>

          {/* Internal Living Space */}
          <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
            <div className="text-[10px] font-mono font-bold text-gray-400 uppercase">
              Usable Interior Living Space
            </div>
            <div className="font-extrabold text-gray-950 text-sm font-mono">
              {modelSpec.sqft} SQ FT [{(modelSpec.sqft * 0.092903).toFixed(1)} m²]
            </div>
            <div className="text-[11px] text-gray-600 font-mono">
              Clear Ceiling: 8&apos;-6&quot; [2,590 mm] AFF
            </div>
          </div>

          {/* Tare Weight & Rigging */}
          <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
            <div className="text-[10px] font-mono font-bold text-gray-400 uppercase">
              Dry Tare Weight &amp; Crane Rig
            </div>
            <div className="font-extrabold text-gray-950 text-sm font-mono">
              {tareWeightLbs.toLocaleString()} LBS [{tareWeightKg.toLocaleString()} KG]
            </div>
            <div className="text-[11px] text-gray-600 font-mono">
              {cranePickPoints}
            </div>
          </div>

          {/* Environmental Loads */}
          <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
            <div className="text-[10px] font-mono font-bold text-gray-400 uppercase">
              Structural Load Ratings
            </div>
            <div className="font-extrabold text-gray-950 text-sm font-mono">
              140 MPH Wind • 40 PSF Snow
            </div>
            <div className="text-[11px] text-gray-600 font-mono">
              Seismic Zone D • Flame Spread Class A
            </div>
          </div>
        </div>

        {/* Foundation Anchor Schedule */}
        <div className="p-4 bg-white rounded-2xl border border-gray-200 space-y-2 text-xs">
          <div className="font-bold text-gray-900 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-orange-600" />
              <span>Foundation Pier &amp; Anchor Bolt Schedule ({pierCount}-Point Foundation Support)</span>
            </span>
            <span className="text-[10px] font-mono bg-orange-50 text-orange-800 px-2 py-0.5 rounded border border-orange-200">
              Min. 3,000 PSI Concrete
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-[11px] font-mono text-gray-700">
            <div>
              <span className="text-gray-400 block text-[10px]">PIER TYPE &amp; SIZING</span>
              <span>12&quot; Ø Concrete Pier or Helical Pile to frost depth</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px]">ANCHOR BOLT HARDWARE</span>
              <span>2× 5/8&quot; ASTM A307 HDG bolts per pier, 8&quot; embedment</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px]">SOIL BEARING CAPACITY</span>
              <span>Min. 2,000 PSF undisturbed bearing capacity</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: ARCHITECTURAL BILL OF MATERIALS & ORDERED FINISHES */}
      <div className="space-y-3 print-break-inside-avoid">
        <div className="flex items-center justify-between pb-1 border-b-2 border-orange-500">
          <h2 className="text-sm font-black text-gray-950 uppercase tracking-wide flex items-center gap-2">
            <Layers className="w-4 h-4 text-orange-600" />
            <span>3.0 Custom Enclosure &amp; Architectural Materials Bill (BOM)</span>
          </h2>
          <span className="text-[11px] font-mono text-gray-500">
            Verified Against Customer Reservation Dossier
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs border border-gray-200 rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-gray-100 text-gray-700 uppercase font-bold text-[10px] font-mono">
                <th className="py-2.5 px-3 border-b border-gray-200">Category</th>
                <th className="py-2.5 px-3 border-b border-gray-200">Selected Specification &amp; Material</th>
                <th className="py-2.5 px-3 border-b border-gray-200">Technical Details / Rating</th>
                <th className="py-2.5 px-3 border-b border-gray-200 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="py-2.5 px-3 font-bold text-gray-900 bg-gray-50/50">Exterior Skin</td>
                <td className="py-2.5 px-3 font-extrabold text-gray-950 flex items-center gap-2">
                  {order.customization.wallCladdingColor && (
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0 inline-block shadow-xs"
                      style={{ backgroundColor: order.customization.wallCladdingColor }}
                    />
                  )}
                  <span>{order.customization.wallCladdingName}</span>
                </td>
                <td className="py-2.5 px-3 font-mono text-[11px] text-gray-600">
                  Fluorocarbon coated alloy, R-24 polyiso core, fire-retardant Class A
                </td>
                <td className="py-2.5 px-3 text-center">
                  <span className="text-[10px] font-bold font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Allocated
                  </span>
                </td>
              </tr>

              <tr>
                <td className="py-2.5 px-3 font-bold text-gray-900 bg-gray-50/50">Glazing Envelope</td>
                <td className="py-2.5 px-3 font-bold text-gray-900">
                  {order.customization.glazingName}
                </td>
                <td className="py-2.5 px-3 font-mono text-[11px] text-gray-600">
                  Dual 6mm+12A+6mm tempered Low-E argon insulated, U-factor 1.4, STC 40dB
                </td>
                <td className="py-2.5 px-3 text-center">
                  <span className="text-[10px] font-bold font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    In Stock
                  </span>
                </td>
              </tr>

              <tr>
                <td className="py-2.5 px-3 font-bold text-gray-900 bg-gray-50/50">Flooring Core</td>
                <td className="py-2.5 px-3 font-bold text-gray-900">
                  {order.customization.flooringName}
                </td>
                <td className="py-2.5 px-3 font-mono text-[11px] text-gray-600">
                  Rigid core waterproof SPC plank (7.5mm), IXPE 1.5mm acoustic underlayment
                </td>
                <td className="py-2.5 px-3 text-center">
                  <span className="text-[10px] font-bold font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Allocated
                  </span>
                </td>
              </tr>

              <tr>
                <td className="py-2.5 px-3 font-bold text-gray-900 bg-gray-50/50">Kitchen Millwork</td>
                <td className="py-2.5 px-3 font-bold text-gray-900">
                  {order.customization.cabinetryName || 'Standard Integrated Galley'}
                </td>
                <td className="py-2.5 px-3 font-mono text-[11px] text-gray-600">
                  Quartz composite slab counter, Blum soft-close European hardware
                </td>
                <td className="py-2.5 px-3 text-center">
                  <span className="text-[10px] font-bold font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Ready
                  </span>
                </td>
              </tr>

              <tr>
                <td className="py-2.5 px-3 font-bold text-gray-900 bg-gray-50/50">Roof &amp; Solar</td>
                <td className="py-2.5 px-3 font-bold text-gray-900">
                  {order.customization.roofName}
                </td>
                <td className="py-2.5 px-3 font-mono text-[11px] text-gray-600">
                  TPO/EPDM membrane, 1.5° drainage pitch, pre-wired conduit to inverter hub
                </td>
                <td className="py-2.5 px-3 text-center">
                  <span className="text-[10px] font-bold font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Allocated
                  </span>
                </td>
              </tr>

              <tr>
                <td className="py-2.5 px-3 font-bold text-gray-900 bg-gray-50/50">Electrical Hub</td>
                <td className="py-2.5 px-3 font-bold text-gray-900">
                  {order.customization.electricalName || 'Pre-wired 100A Square D Load Center'}
                </td>
                <td className="py-2.5 px-3 font-mono text-[11px] text-gray-600">
                  {electricalService}, copper romex wiring, AFCI/GFCI breakers throughout
                </td>
                <td className="py-2.5 px-3 text-center">
                  <span className="text-[10px] font-bold font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Verified
                  </span>
                </td>
              </tr>

              <tr>
                <td className="py-2.5 px-3 font-bold text-gray-900 bg-gray-50/50">Lighting Package</td>
                <td className="py-2.5 px-3 font-bold text-gray-900">
                  {order.customization.lightingName}
                </td>
                <td className="py-2.5 px-3 font-mono text-[11px] text-gray-600">
                  24V COB linear architectural indirect LED glow, CRI 95+, 3000K warm white
                </td>
                <td className="py-2.5 px-3 text-center">
                  <span className="text-[10px] font-bold font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    In Stock
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Selected Modular Add-on Modules List */}
        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs">
          <span className="text-[10px] font-bold text-gray-500 uppercase font-mono block mb-1">
            Factory Pre-Installed Modular Add-ons &amp; Accessories:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {order.customization.addonsList && order.customization.addonsList.length > 0 ? (
              order.customization.addonsList.map((addon, idx) => (
                <span
                  key={idx}
                  className="bg-white text-gray-900 text-xs font-semibold px-2.5 py-1 rounded-lg border border-gray-200 flex items-center gap-1 shadow-2xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-orange-600" />
                  <span>{addon}</span>
                </span>
              ))
            ) : (
              <span className="text-gray-400 font-mono text-xs">Standard baseline cabin configuration</span>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 4: MEP (MECHANICAL, ELECTRICAL, PLUMBING) CONNECTION SCHEDULE */}
      <div className="space-y-3 print-break-inside-avoid">
        <div className="flex items-center justify-between pb-1 border-b-2 border-orange-500">
          <h2 className="text-sm font-black text-gray-950 uppercase tracking-wide flex items-center gap-2">
            <Zap className="w-4 h-4 text-orange-600" />
            <span>4.0 MEP Factory Utility Rough-in &amp; Connection Schedule</span>
          </h2>
          <span className="text-[11px] font-mono text-gray-500">
            Plug-and-Play Quick-Connect Ports
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Electrical Cut Sheet */}
          <div className="p-3.5 bg-amber-50/50 rounded-2xl border border-amber-200 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-amber-950">
              <Zap className="w-4 h-4 text-amber-600" />
              <span>Electrical Ingress &amp; Breakers</span>
            </div>
            <ul className="space-y-1 font-mono text-[11px] text-amber-900">
              <li>• Main: <strong>{electricalService}</strong></li>
              <li>• Ingress: 2&quot; PVC stub-up @ rear left corner</li>
              <li>• C1: 20A Kitchen Small Appliance (GFCI)</li>
              <li>• C2: 20A Induction Cooktop (240V dedicated)</li>
              <li>• C3: 20A Bath Pod GFCI &amp; Exhaust Fan</li>
              <li>• C4: 25A 240V HVAC Mini-Split circuit</li>
              <li>• C5: 15A Architectural Lighting &amp; USB outlets</li>
            </ul>
          </div>

          {/* Water Supply Cut Sheet */}
          <div className="p-3.5 bg-sky-50/50 rounded-2xl border border-sky-200 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-sky-950">
              <Droplets className="w-4 h-4 text-sky-600" />
              <span>Water Supply &amp; Drainage</span>
            </div>
            <ul className="space-y-1 font-mono text-[11px] text-sky-900">
              <li>• Fresh Water: <strong>3/4&quot; PEX-A</strong> with brass shutoff</li>
              <li>• Location: +18&quot; AFF chassis rear wall</li>
              <li>• Pressure Rating: 55–65 PSI operating range</li>
              <li>• Hot Water: 13.5kW 240V on-demand tankless</li>
              <li>• Sewer Drain: <strong>3&quot; DWV PVC</strong> cleanout drop</li>
              <li>• Drain Ingress: 6&quot; below finished chassis base</li>
              <li>• Vent: 1-1/2&quot; stack with flashing collar</li>
            </ul>
          </div>

          {/* HVAC & Climate Cut Sheet */}
          <div className="p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-emerald-950">
              <Wind className="w-4 h-4 text-emerald-600" />
              <span>Climate Control &amp; Ventilation</span>
            </div>
            <ul className="space-y-1 font-mono text-[11px] text-emerald-900">
              <li>• Mini-Split: <strong>{hvacBtu}</strong></li>
              <li>• Line-Set: 3/8&quot; liquid + 5/8&quot; suction pre-run</li>
              <li>• Sleeve: 3&quot; thru-wall collar @ +84&quot; AFF</li>
              <li>• Condensate: 3/4&quot; gravity drain to grade</li>
              <li>• Exterior Bracket: Heavy-gauge powder coated</li>
              <li>• Bathroom ERV: 80 CFM continuous cycle</li>
              <li>• Range Hood: 250 CFM recirculating / exterior</li>
            </ul>
          </div>
        </div>
      </div>

      {/* SECTION 5: FINANCIAL LEDGER (SINGLE CURRENCY ENFORCED) */}
      <div className="space-y-3 print-break-inside-avoid">
        <div className="flex items-center justify-between pb-1 border-b-2 border-orange-500">
          <h2 className="text-sm font-black text-gray-950 uppercase tracking-wide flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-orange-600" />
            <span>5.0 Project Invoicing &amp; Financial Ledger</span>
          </h2>
          <span className="text-[11px] font-mono text-emerald-700 font-bold">
            Single Currency Enforced: {activeCurrency}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs font-mono">
          <div>
            <span className="text-gray-400 text-[10px] uppercase font-bold block">Base Cabin Chassis</span>
            <span className="font-extrabold text-gray-900 text-sm">
              {formatCurrency(order.pricing.basePrice, activeCurrency)}
            </span>
          </div>
          <div>
            <span className="text-gray-400 text-[10px] uppercase font-bold block">Options &amp; Upgrades</span>
            <span className="font-extrabold text-gray-900 text-sm">
              {formatCurrency(order.pricing.optionsTotal, activeCurrency)}
            </span>
          </div>
          <div>
            <span className="text-gray-400 text-[10px] uppercase font-bold block">Freight &amp; Site Prep</span>
            <span className="font-extrabold text-gray-900 text-sm">
              {formatCurrency((order.pricing.freightCost || 0) + (order.pricing.sitePrepCost || 0), activeCurrency)}
            </span>
          </div>
          <div>
            <span className="text-gray-400 text-[10px] uppercase font-bold block">Total Contract Value</span>
            <span className="font-black text-emerald-700 text-base">
              {formatCurrency(order.pricing.totalPrice, activeCurrency)}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 6: SHOP FLOOR QUALITY ASSURANCE (QA) CHECKLIST & SIGN-OFF */}
      <div className="space-y-3 print-break-inside-avoid">
        <div className="flex items-center justify-between pb-1 border-b-2 border-orange-500">
          <h2 className="text-sm font-black text-gray-950 uppercase tracking-wide flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-orange-600" />
            <span>6.0 Shop Floor Fabrication &amp; Pre-Dispatch QA Inspection Checklist</span>
          </h2>
          <span className="text-[11px] font-mono font-bold text-gray-700">
            Completed: <strong className="text-emerald-600">{completedChecksCount}</strong> / {totalChecks} Steps
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-200 space-y-3 text-xs">
          <p className="text-[11px] text-gray-500">
            Lead technician must verify and stamp each checkpoint before rolling unit to transit packaging.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {[
              { id: 'frame', label: '1. Q235 steel chassis diagonal squareness verified within ±1/8" (3mm)' },
              { id: 'welds', label: '2. All structural framing weld seams inspected & magnetic particle tested' },
              { id: 'torques', label: '3. Foundation anchor bracket bolt torques certified to 120 ft-lbs' },
              { id: 'waterTest', label: '4. External envelope rain deluge spray test completed (30 mins @ 35 PSI)' },
              { id: 'megger', label: '5. Electrical load center Megger insulation & dielectric ground test passed' },
              { id: 'plumbingPressure', label: '6. PEX supply pressure decay test passed (100 PSI air, 24-hour hold)' },
              { id: 'glazingSeals', label: '7. Low-E panoramic glazing weather-stripping & window locks inspected' },
              { id: 'cabinetryAlignment', label: '8. Quartz kitchen counter & bathroom vanity plumbing fixtures leak-free' },
              { id: 'hvacVacuum', label: '9. Mini-split heat pump line-set vacuum pulled below 500 microns' },
              { id: 'protectiveWrapping', label: '10. Crane pick lugs load-tested to 45 kN and transit shrink-wrap applied' },
            ].map((item) => {
              const isChecked = qaChecks[item.id] || false;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleCheck(item.id)}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-colors cursor-pointer ${
                    isChecked
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-bold'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {isChecked ? (
                    <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-gray-400 shrink-0" />
                  )}
                  <span className="text-[11px]">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Official Sign-off Stamp Block */}
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div className="border border-dashed border-gray-300 p-3 rounded-xl bg-gray-50/50">
              <span className="text-[10px] text-gray-400 block font-bold uppercase">Lead Assembly Engineer</span>
              <div className="font-extrabold text-gray-900 mt-2 font-serif italic text-sm">
                Marcus Sterling, PE #48291
              </div>
              <div className="text-[10px] text-gray-500 mt-1">Signature on File • Plant Operations</div>
            </div>

            <div className="border border-dashed border-gray-300 p-3 rounded-xl bg-gray-50/50">
              <span className="text-[10px] text-gray-400 block font-bold uppercase">Quality Control Inspector</span>
              <div className="font-extrabold text-gray-900 mt-2 font-serif italic text-sm">
                Sarah Jenkins, CWI
              </div>
              <div className="text-[10px] text-gray-500 mt-1">Certified Welding &amp; Code Inspector</div>
            </div>

            <div className="border border-dashed border-gray-300 p-3 rounded-xl bg-gray-50/50 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full border-2 border-emerald-600 flex flex-col items-center justify-center text-emerald-700 font-extrabold text-[9px] uppercase tracking-tighter shadow-xs">
                <span>BOXABL QC</span>
                <span className="text-[11px] font-black">PASSED</span>
                <span className="text-[7px]">DISPATCH OK</span>
              </div>
              <span className="text-[9px] text-gray-400 mt-1">Serial Tag #BX-2026-MFG</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
