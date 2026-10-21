import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CustomizationState } from '../types';
import { BASE_MODELS } from '../data/models';
import {
  X,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Sparkles,
  MapPin,
  Truck,
  Globe,
  Building,
  Navigation,
  Compass,
  ChevronDown,
  Info,
} from 'lucide-react';
import { useAppConfig } from '../context/AppConfigContext';
import { formatCurrency, normalizeCurrency } from '../utils/currency';
import { getItemUnitSpec } from '../utils/pricingCalculator';
import { addOrder } from '../utils/orderManager';
import { getCurrentUser } from '../utils/authManager';
import {
  COUNTRIES,
  CountryOption,
  getCountryByCode,
  getSubdivisions,
  getDistricts,
} from '../data/regions';

interface ReserveModalProps {
  state: CustomizationState;
  totalPrice: number;
  onClose: () => void;
  onSuccess?: (orderId: string) => void;
}

export const ReserveModal: React.FC<ReserveModalProps> = ({
  state,
  totalPrice,
  onClose,
  onSuccess,
}) => {
  const { config } = useAppConfig();
  const currentUser = getCurrentUser();
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [createdOrderId, setCreatedOrderId] = useState<string>('BX-2026-9841');

  // Dynamic Country, State/Region, and District Hierarchy
  const defaultCountryCode = config.currency === 'GHS' ? 'GH' : 'US';
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>(defaultCountryCode);
  const selectedCountry = getCountryByCode(selectedCountryCode);

  const availableSubdivisions = getSubdivisions(selectedCountryCode);
  const [selectedSubdivisionId, setSelectedSubdivisionId] = useState<string>(
    availableSubdivisions[0]?.id || ''
  );

  const availableDistricts = getDistricts(selectedCountryCode, selectedSubdivisionId);
  const [selectedDistrict, setSelectedDistrict] = useState<string>(
    availableDistricts[0] || ''
  );
  const [customDistrict, setCustomDistrict] = useState<string>('');

  const [formData, setFormData] = useState({
    fullName: currentUser?.fullName || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    streetAddress: '',
    zipCode: '',
    landStatus: 'own-land',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync country if currency switches
  useEffect(() => {
    if (config.currency === 'GHS' && selectedCountryCode !== 'GH') {
      handleCountryChange('GH');
    }
  }, [config.currency]);

  // When country code changes, update subdivision and district
  const handleCountryChange = (countryCode: string) => {
    setSelectedCountryCode(countryCode);
    const newSubs = getSubdivisions(countryCode);
    const firstSub = newSubs[0];
    const subId = firstSub?.id || '';
    setSelectedSubdivisionId(subId);
    const newDistricts = getDistricts(countryCode, subId);
    setSelectedDistrict(newDistricts[0] || '');
    setCustomDistrict('');
  };

  // When subdivision changes, update districts
  const handleSubdivisionChange = (subdivisionId: string) => {
    setSelectedSubdivisionId(subdivisionId);
    const newDistricts = getDistricts(selectedCountryCode, subdivisionId);
    setSelectedDistrict(newDistricts[0] || '');
    setCustomDistrict('');
  };

  const reservationFee = config.branding?.reservationFee || 250;
  const primaryColor = config.branding?.primaryColor || '#ea580c';

  const currentModel =
    BASE_MODELS.find((m) => m.id === state.modelId) || BASE_MODELS[0];

  const currentSubdivision = availableSubdivisions.find(
    (s) => s.id === selectedSubdivisionId
  );
  const subdivisionName = currentSubdivision?.name || selectedSubdivisionId;

  const resolvedDistrict =
    selectedDistrict.includes('Other') || selectedDistrict.includes('Custom')
      ? customDistrict.trim() || selectedDistrict
      : selectedDistrict;

  const fullDeliveryAddress = [
    formData.streetAddress.trim(),
    resolvedDistrict,
    subdivisionName,
    selectedCountry.name,
  ]
    .filter(Boolean)
    .join(', ');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Calculate options details
    const wallOpt = config.wallOptions?.find((w: any) => w.id === state.wallCladding);
    const glazingOpt = config.glazingOptions?.find((g: any) => g.id === state.glazing);
    const lightingOpt = config.lightingOptions?.find((l: any) => l.id === state.lightingPackage);
    const electricalOpt = config.electricalOptions?.find((el: any) => el.id === state.electricalTier);
    const flooringOpt = config.flooringOptions?.find((f: any) => f.id === state.flooring);
    const roofOpt = config.roofOptions?.find((r: any) => r.id === state.roofOption);
    const cabinetryOpt = config.cabinetryOptions?.find((c: any) => c.id === state.cabinetry);

    const activeAddons: string[] = [];
    (config.addons || []).forEach((addon: any) => {
      if (state[addon.id] && addon.isAvailable !== false && addon.isActive !== false) {
        const spec = getItemUnitSpec(addon, state.modelId);
        activeAddons.push(spec.sizeLabel ? `${addon.name} (${spec.sizeLabel})` : addon.name);
      }
    });

    const freight = config.logistics?.freightCost || 4500;
    const sitePrep = config.logistics?.sitePrepCost || 5500;
    const basePrice = currentModel.basePrice || 54900;
    const optionsTotal = Math.max(0, totalPrice - basePrice - freight - sitePrep);

    const newOrder = addOrder({
      status: 'deposit_received',
      customer: {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.startsWith('+')
          ? formData.phone.trim()
          : `${selectedCountry.phonePrefix} ${formData.phone.trim()}`,
        deliveryAddress: fullDeliveryAddress,
        zipCode: formData.zipCode.trim(),
        landStatus: formData.landStatus,
        country: selectedCountry.name,
        stateOrRegion: subdivisionName,
        districtOrCounty: resolvedDistrict,
        notes: formData.notes.trim() || undefined,
      },
      customization: {
        modelId: state.modelId,
        modelName: currentModel.name,
        wallCladdingName: wallOpt?.name || 'Standard Wall Cladding',
        wallCladdingColor: wallOpt?.color || '#334155',
        glazingName: glazingOpt?.name || 'Panoramic Low-E Clear Glass',
        lightingName: lightingOpt?.name || 'Architectural Lighting Suite',
        electricalName: electricalOpt?.name || 'Standard Pre-Wired Electrical',
        flooringName: flooringOpt?.name || 'Rigid Core SPC Flooring',
        roofName: roofOpt?.name || 'Architectural Parapet Roof',
        cabinetryName: cabinetryOpt?.name || 'Standard Cabinetry',
        addonsList: activeAddons,
        rawState: state,
      },
      pricing: {
        basePrice,
        optionsTotal,
        freightCost: freight,
        sitePrepCost: sitePrep,
        taxAmount: 0,
        totalPrice,
        depositDue: reservationFee,
        depositPaid: true,
        currency: normalizeCurrency(config.currency),
      },
      estimatedDeliveryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 35).toISOString().split('T')[0],
      initialNote: `Deposit of ${formatCurrency(reservationFee, config.currency, { ratesMap: config.exchangeRates })} authorized online. Route: ${resolvedDistrict}, ${subdivisionName}, ${selectedCountry.name}.`,
    });

    setCreatedOrderId(newOrder.id);
    if (onSuccess) {
      onSuccess(newOrder.id);
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setStep('success');
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#0f172a', '#38bdf8'],
      });
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-gray-200 shadow-2xl overflow-hidden my-4 sm:my-6 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-[#FAFAFC] border-b border-gray-100 p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 text-white font-black rounded-xl flex items-center justify-center text-base shadow-xs"
              style={{ backgroundColor: primaryColor }}
            >
              {config.branding?.brandName?.charAt(0) || 'A'}
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base tracking-tight text-gray-950 flex items-center gap-2">
                <span>RESERVE PRODUCTION SLOT</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold uppercase">
                  Active Intake
                </span>
              </h3>
              <p className="text-[11px] text-gray-500">
                {formatCurrency(reservationFee, config.currency, { ratesMap: config.exchangeRates })} Fully Refundable Deposit • Priority Manufacturing Queue
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        {step === 'form' ? (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
            {/* Quick Summary Pill */}
            <div className="p-3.5 bg-[#F8F9FB] rounded-2xl border border-gray-200 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-gray-900 text-sm">{currentModel.name}</span>
                <span className="text-gray-500 block text-[11px] mt-0.5">
                  Turnkey Investment: <span className="font-semibold text-gray-800 font-mono">{formatCurrency(totalPrice, config.currency, { ratesMap: config.exchangeRates })}</span>
                </span>
              </div>
              <span
                className="font-mono font-extrabold px-3 py-1.5 rounded-xl border text-xs shadow-2xs"
                style={{
                  color: primaryColor,
                  backgroundColor: `${primaryColor}15`,
                  borderColor: `${primaryColor}30`,
                }}
              >
                {formatCurrency(reservationFee, config.currency, { ratesMap: config.exchangeRates })} Deposit Due
              </span>
            </div>

            {/* SECTION 1: CUSTOMER CONTACT DETAILS */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
                  Client Contact
                </span>
                <span className="text-[10px] text-gray-400">Step 1 of 2</span>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1 text-xs">
                  Full Legal Name <span className="text-orange-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-xs text-gray-900 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1 text-xs">
                    Email Address <span className="text-orange-600">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="alex@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-xs text-gray-900 transition-all"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1 text-xs">
                    Phone Number <span className="text-orange-600">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 font-mono font-bold text-xs text-gray-500 select-none flex items-center gap-1">
                      <span>{selectedCountry.flag}</span>
                      <span>{selectedCountry.phonePrefix}</span>
                    </span>
                    <input
                      type="tel"
                      required
                      placeholder={selectedCountry.phonePlaceholder}
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full pl-16 pr-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-xs text-gray-900 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: DYNAMIC COUNTRY, REGION & DISTRICT HIERARCHY */}
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-orange-600" />
                  <span>Delivery Destination &amp; Jurisdiction</span>
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Dynamic Logistics
                </span>
              </div>

              {/* Country Selection */}
              <div>
                <label className="block font-bold text-gray-700 mb-1 text-xs flex items-center justify-between">
                  <span>Country <span className="text-orange-600">*</span></span>
                  <span className="text-[10px] font-normal text-gray-500">
                    Auto-calibrates administrative zones
                  </span>
                </label>
                <div className="relative">
                  <select
                    value={selectedCountryCode}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-xs text-gray-900 bg-white cursor-pointer font-bold appearance-none pr-8 transition-all"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.name} ({c.phonePrefix})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Dynamic State / Region & District Dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Dynamic Primary Subdivision (State / Region / Province / Emirate) */}
                <div>
                  <label className="block font-bold text-gray-700 mb-1 text-xs flex items-center justify-between">
                    <span>{selectedCountry.subdivisionLabel} <span className="text-orange-600">*</span></span>
                    <span className="text-[9px] font-mono text-gray-400 uppercase font-semibold">
                      {availableSubdivisions.length} Available
                    </span>
                  </label>
                  <div className="relative">
                    <select
                      value={selectedSubdivisionId}
                      onChange={(e) => handleSubdivisionChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-xs text-gray-900 bg-white cursor-pointer font-semibold appearance-none pr-8 transition-all"
                    >
                      {availableSubdivisions.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 2. Dynamic Secondary Division (District / County / Municipality / LGA) */}
                <div>
                  <label className="block font-bold text-gray-700 mb-1 text-xs flex items-center justify-between">
                    <span>{selectedCountry.districtLabel} <span className="text-orange-600">*</span></span>
                    <span className="text-[9px] font-mono text-gray-400 uppercase font-semibold">
                      {availableDistricts.length} Options
                    </span>
                  </label>
                  <div className="relative">
                    <select
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-xs text-gray-900 bg-white cursor-pointer font-semibold appearance-none pr-8 transition-all"
                    >
                      {availableDistricts.map((d, idx) => (
                        <option key={idx} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Optional Custom District Input if "Other" is chosen */}
              {(selectedDistrict.includes('Other') || selectedDistrict.includes('Custom')) && (
                <div className="animate-in fade-in slide-in-from-top-1 duration-150">
                  <label className="block font-bold text-gray-700 mb-1 text-xs">
                    Specify Your Local District / County / Locality Name:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter specific district or municipal area"
                    value={customDistrict}
                    onChange={(e) => setCustomDistrict(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-xs text-gray-900 bg-orange-50/20"
                  />
                </div>
              )}

              {/* Dynamic Postal / Routing / GPS Code & Land Readiness */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Dynamic Postal / GPS Code */}
                <div>
                  <label className="block font-bold text-gray-700 mb-1 text-xs">
                    {selectedCountry.postalLabel} <span className="text-orange-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={selectedCountry.postalPlaceholder}
                    value={formData.zipCode}
                    onChange={(e) =>
                      setFormData({ ...formData, zipCode: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-xs text-gray-900 font-mono transition-all"
                  />
                </div>

                {/* Land Status */}
                <div>
                  <label className="block font-bold text-gray-700 mb-1 text-xs">
                    Land / Site Preparedness
                  </label>
                  <div className="relative">
                    <select
                      value={formData.landStatus}
                      onChange={(e) =>
                        setFormData({ ...formData, landStatus: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-xs bg-white text-gray-900 cursor-pointer appearance-none pr-8 transition-all"
                    >
                      <option value="own-land">I own land ready for installation</option>
                      <option value="purchasing-land">Currently purchasing land</option>
                      <option value="backyard-adu">Backyard ADU / Guest house</option>
                      <option value="commercial-resort">Commercial eco-resort / Glamping</option>
                      <option value="off-grid">Remote / Off-grid site</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Street Address / Plot Location */}
              <div>
                <label className="block font-bold text-gray-700 mb-1 text-xs">
                  Street Address / Plot Landmark <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1420 Desert Sun Way, Plot #24, or Nearest Landmark"
                  value={formData.streetAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, streetAddress: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-xs text-gray-900 transition-all"
                />
              </div>

              {/* Live Dynamic Delivery Route Preview Badge */}
              <div className="p-3 bg-gradient-to-r from-orange-50/80 via-amber-50/60 to-gray-50 border border-orange-200/70 rounded-2xl text-xs space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-orange-950">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-orange-600" />
                    <span>Calibrated Freight Route:</span>
                  </span>
                  <span className="font-mono text-[10px] text-orange-700 bg-white/80 px-2 py-0.5 rounded-md border border-orange-200">
                    {selectedCountry.flag} {selectedCountry.code}
                  </span>
                </div>
                <div className="font-semibold text-gray-900 text-xs truncate">
                  {resolvedDistrict}, {subdivisionName}, {selectedCountry.name}
                  {formData.zipCode ? ` (${formData.zipCode})` : ''}
                </div>
                <div className="text-[10px] text-gray-500 flex items-center gap-1">
                  <Truck className="w-3 h-3 text-gray-400 shrink-0" />
                  <span>Staging Hub: {selectedCountry.logisticsHub}</span>
                </div>
              </div>
            </div>

            {/* Refundable Guarantee Notice */}
            <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-2xl flex items-start gap-2.5 text-[11px] text-gray-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-bold text-gray-900">100% Risk-Free Guarantee:</span> Your {formatCurrency(reservationFee, config.currency, { ratesMap: config.exchangeRates })}{' '}
                reservation fee secures your factory production queue slot and locks in
                your architectural configuration pricing. Fully refundable anytime prior to assembly initiation.
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{ backgroundColor: primaryColor }}
              className="w-full py-3.5 px-4 hover:opacity-95 text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md hover:shadow-lg active:scale-98"
            >
              <CreditCard className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? 'Securing Production Queue...'
                  : `Place ${formatCurrency(reservationFee, config.currency, { ratesMap: config.exchangeRates })} Fully Refundable Deposit`}
              </span>
            </button>
          </form>
        ) : (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h4 className="text-xl font-extrabold text-gray-950">
                Production Slot Reserved!
              </h4>
              <p className="text-xs text-gray-600 mt-1 max-w-sm mx-auto">
                Thank you, <span className="font-bold text-gray-900">{formData.fullName || 'Customer'}</span>.
                Your custom {currentModel.name} order has been queued. Confirmation and
                delivery coordination details have been sent to{' '}
                <span className="font-mono font-semibold text-orange-600">{formData.email || 'your email'}</span>.
              </p>
            </div>

            <div className="p-4 bg-[#F8F9FB] border border-gray-200 rounded-2xl text-left text-xs space-y-2 font-mono">
              <div className="flex justify-between text-gray-600">
                <span>Order Reference:</span>
                <span className="font-bold text-gray-900 bg-orange-100 text-orange-800 px-2 py-0.5 rounded-md">{createdOrderId}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Destination:</span>
                <span className="font-bold text-gray-900 truncate max-w-[220px]">
                  {resolvedDistrict}, {subdivisionName} ({selectedCountry.flag} {selectedCountry.code})
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Logistics Staging:</span>
                <span className="font-bold text-orange-700">{selectedCountry.logisticsHub}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Estimated Factory Ready:</span>
                <span className="font-bold text-gray-900">{currentModel.leadTime}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Postal / Routing:</span>
                <span className="font-bold text-gray-900">{formData.zipCode || 'Verified'}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 px-4 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-2xl text-xs transition-colors cursor-pointer"
            >
              Return to 3D Configurator
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

