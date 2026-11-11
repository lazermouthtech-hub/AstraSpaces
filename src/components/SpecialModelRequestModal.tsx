import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Sparkles,
  Send,
  CheckCircle2,
  Shield,
  HelpCircle,
  Home,
  Layers,
  MapPin,
  User,
  Mail,
  Phone,
  FileText,
  DollarSign,
  Calendar,
  AlertCircle,
  ArrowRight,
  Copy,
  Check,
} from 'lucide-react';
import { useAppConfig } from '../context/AppConfigContext';
import { addOrder } from '../utils/orderManager';
import { getCurrentUser } from '../utils/authManager';
import { SpecialRequestDetails } from '../types';

interface SpecialModelRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSeries?: string;
}

export const SpecialModelRequestModal: React.FC<SpecialModelRequestModalProps> = ({
  isOpen,
  onClose,
  initialSeries = 'expandable',
}) => {
  const { config } = useAppConfig();
  const currentUser = getCurrentUser();

  const [series, setSeries] = useState<string>(initialSeries);
  const [modelTitle, setModelTitle] = useState('');
  const [dimensions, setDimensions] = useState('40ft x 20ft (800 sq ft)');
  const [bedrooms, setBedrooms] = useState('2-bedroom');
  const [bathrooms, setBathrooms] = useState('1-bathroom');
  const [intendedUse, setIntendedUse] = useState('Residential Living');
  const [budget, setBudget] = useState('standard');
  const [contactMethod, setContactMethod] = useState<'email' | 'phone' | 'whatsapp'>('whatsapp');

  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [customRequirements, setCustomRequirements] = useState('');
  const [financingType, setFinancingType] = useState('milestone');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    if (initialSeries && initialSeries !== 'all') {
      setSeries(initialSeries);
    }
  }, [initialSeries]);

  useEffect(() => {
    if (currentUser) {
      if (!fullName && currentUser.fullName) setFullName(currentUser.fullName);
      if (!email && currentUser.email) setEmail(currentUser.email);
      if (!phone && currentUser.phone) setPhone(currentUser.phone);
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim()) return;

    setIsSubmitting(true);

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const requestId = `SR-2026-${randomSuffix}`;

    const seriesDisplayMap: Record<string, string> = {
      expandable: 'Expandable Modular Series',
      'apple-cabin': 'Apple Cabin Architectural Series',
      'space-capsule': 'Space Capsule Panoramic Pod Series',
      folding: 'Folding Fast-Pack Container Series',
      custom: 'Custom Architectural Footprint',
    };

    const formattedSeries = seriesDisplayMap[series] || series;
    const finalModelTitle = modelTitle.trim() || `${formattedSeries} - Custom ${dimensions}`;

    const specialDetails: SpecialRequestDetails = {
      requestedSeries: formattedSeries,
      requestedModelName: finalModelTitle,
      desiredDimensions: dimensions,
      bedrooms,
      bathrooms,
      intendedUse,
      estimatedBudget: budget,
      deliveryLocation: deliveryLocation.trim() || undefined,
      customRequirements: customRequirements.trim() || undefined,
      preferredContactMethod: contactMethod,
    };

    const initialNote = `⭐ SPECIAL MODEL REQUEST FROM CUSTOMER:
• Series: ${formattedSeries}
• Target Model / Concept: ${finalModelTitle}
• Dimensions / Footprint: ${dimensions}
• Partitioning: ${bedrooms}, ${bathrooms}
• Intended Use: ${intendedUse}
• Location: ${deliveryLocation.trim() || 'Not specified'}
• Preferred Contact: ${contactMethod.toUpperCase()} (${phone} / ${email})
• Financing Preference: ${financingType.replace('_', ' ')}
• Custom Specifications: ${customRequirements.trim() || 'Standard factory specifications requested'}`;

    // Add order with isSpecialRequest flag
    addOrder({
      status: 'pending_review',
      customer: {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        deliveryAddress: deliveryLocation.trim() || 'To be confirmed during engineering consultation',
        zipCode: '00000',
        landStatus: 'owned',
        notes: customRequirements.trim() || undefined,
      },
      customization: {
        modelId: 'special-request' as any,
        modelName: `⭐ Special Request: ${finalModelTitle}`,
        wallCladdingName: 'Custom Architectural Specified',
        glazingName: 'Broken-Bridge Low-E System',
        lightingName: 'Architectural Smart Ambient Package',
        electricalName: '200A Modular Distribution Board',
        flooringName: 'Acoustic Rigid Core SPC',
        roofName: 'Engineered Weatherproof System',
        cabinetryName: 'Custom Joinery Plan',
        addonsList: [
          `Special Series: ${formattedSeries}`,
          `Target Footprint: ${dimensions}`,
          `Rooms: ${bedrooms} & ${bathrooms}`,
        ],
      },
      pricing: {
        basePrice: 0,
        optionsTotal: 0,
        freightCost: config.logistics?.freightCost || 4500,
        sitePrepCost: config.logistics?.sitePrepCost || 5500,
        taxAmount: 0,
        totalPrice: 0,
        depositDue: 0,
        depositPaid: false,
        currency: config.currency || 'USD',
      },
      paymentOption: (financingType === 'bank_mortgage' || financingType === 'gov_scheme' ? financingType : 'milestone') as any,
      estimatedDeliveryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      initialNote,
      isSpecialRequest: true,
      specialRequestDetails: specialDetails,
    } as any);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // Ignore confetti errors
    }

    setIsSubmitting(false);
    setSubmittedId(requestId);
  };

  const handleCopyId = () => {
    if (!submittedId) return;
    navigator.clipboard.writeText(submittedId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleResetAndClose = () => {
    setSubmittedId(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-2xl rounded-3xl border border-gray-200 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200 select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Sparkles className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-tight">Special Model Request</h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/25">
                  Direct to 10Apples
                </span>
              </div>
              <p className="text-xs text-orange-100 font-medium">
                Request custom dimensions, unlisted series models, or specialized prefab layouts
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetAndClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white/90 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {submittedId ? (
            /* =========================================================================
               SUCCESS CONFIRMATION VIEW
               ========================================================================= */
            <div className="py-6 px-4 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md ring-8 ring-emerald-50">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-1">
                <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-black uppercase tracking-wider border border-emerald-200">
                  Request Dispatched to 10Apples
                </span>
                <h4 className="text-xl font-black text-gray-950">Special Request Received!</h4>
                <p className="text-xs text-gray-600 max-w-md mx-auto leading-relaxed">
                  Thank you, <strong>{fullName}</strong>. Your special model request has been successfully registered and placed into the 10Apples engineering review queue.
                </p>
              </div>

              {/* Reference ID Pill */}
              <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-gray-50 rounded-2xl border border-gray-200 shadow-2xs">
                <span className="text-xs text-gray-500 font-semibold">Special Request ID:</span>
                <span className="text-sm font-mono font-black text-orange-600 tracking-wider">
                  {submittedId}
                </span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="p-1 rounded-lg hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
                  title="Copy ID"
                >
                  {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Next Steps Information Box */}
              <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200/90 text-left space-y-2.5 max-w-lg mx-auto">
                <h5 className="text-xs font-black text-orange-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-orange-600" />
                  What happens next?
                </h5>
                <ul className="text-xs text-gray-700 space-y-1.5 list-disc pl-4 leading-snug">
                  <li>Our structural engineering team will review your requested dimensions and site feasibility.</li>
                  <li>An itemized CAD specification with turnkey pricing will be compiled.</li>
                  <li>Our lead project manager will contact you via <strong>{contactMethod.toUpperCase()}</strong> at <strong>{phone}</strong> / <strong>{email}</strong> within 24 hours.</li>
                </ul>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-6 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  Return to 3D Configurator
                </button>
              </div>
            </div>
          ) : (
            /* =========================================================================
               REQUEST FORM VIEW
               ========================================================================= */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Informational Banner */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-orange-50/90 via-amber-50/60 to-white border border-orange-200/80 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                <div className="text-xs text-gray-700 leading-snug">
                  <span className="font-bold text-gray-950">Looking for a custom build? </span>
                  Customers can submit custom specifications directly to the 10Apples architectural engineering team for review. We will evaluate custom footprints, room layouts, and multi-unit compounds.
                </div>
              </div>

              {/* 1. Series & Concept Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-gray-700 block">
                  1. Prefab Modular Series:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {[
                    { id: 'expandable', label: 'Expandable Series' },
                    { id: 'apple-cabin', label: 'Apple Cabin' },
                    { id: 'space-capsule', label: 'Space Capsule' },
                    { id: 'folding', label: 'Folding Pack' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSeries(s.id)}
                      className={`p-2 rounded-xl text-xs font-bold text-center border transition-all cursor-pointer truncate ${
                        series === s.id
                          ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Model Concept Name & Target Footprint Dimensions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 block">
                    Model Concept / Title:
                  </label>
                  <input
                    type="text"
                    value={modelTitle}
                    onChange={(e) => setModelTitle(e.target.value)}
                    placeholder="e.g., 40ft Luxury Quad-Wing with Rooftop"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 block">
                    Desired Footprint Dimensions:
                  </label>
                  <select
                    value={dimensions}
                    onChange={(e) => setDimensions(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none bg-white font-medium"
                  >
                    <option value="20ft x 20ft (400 sq ft)">20ft Standard Wing (400 sq ft)</option>
                    <option value="30ft x 20ft (600 sq ft)">30ft Extended Wing (600 sq ft)</option>
                    <option value="40ft x 20ft (800 sq ft)">40ft Grand Executive (800 sq ft)</option>
                    <option value="Double-Story (1,200 sq ft)">Double-Story Modular Duplex (1,200 sq ft)</option>
                    <option value="Multi-Unit Compound">Multi-Unit Modular Compound / Hotel</option>
                    <option value="Custom Specified Dimensions">Custom Specified Dimensions</option>
                  </select>
                </div>
              </div>

              {/* 3. Rooms & Intended Purpose */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 block">Bedrooms:</label>
                  <select
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none bg-white font-medium"
                  >
                    <option value="Studio / Open Suite">Studio / Open Suite</option>
                    <option value="1-bedroom">1 Bedroom</option>
                    <option value="2-bedroom">2 Bedrooms</option>
                    <option value="3-bedroom">3 Bedrooms</option>
                    <option value="4-bedroom">4 Bedrooms</option>
                    <option value="Custom Partitioning">Custom Partitioning</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 block">Bathrooms:</label>
                  <select
                    value={bathrooms}
                    onChange={(e) => setBathrooms(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none bg-white font-medium"
                  >
                    <option value="1-bathroom">1 Full Bath Pod</option>
                    <option value="2-bathroom">2 Full Bathrooms</option>
                    <option value="1.5-bathroom">1 Full Bath + Powder Room</option>
                    <option value="Commercial Multi-Restroom">Commercial Restroom</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 block">Intended Purpose:</label>
                  <select
                    value={intendedUse}
                    onChange={(e) => setIntendedUse(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none bg-white font-medium"
                  >
                    <option value="Primary Residential Living">Primary Residential</option>
                    <option value="Airbnb / Boutique Hospitality">Airbnb / Hospitality</option>
                    <option value="Backyard Guest House / ADU">Backyard Guest House / ADU</option>
                    <option value="Executive Studio / Garden Office">Executive Office / Studio</option>
                    <option value="Farmland / Eco-Resort Retreat">Farmland / Eco-Resort</option>
                  </select>
                </div>
              </div>

              {/* 4. Customer Contact Details */}
              <div className="pt-2 border-t border-gray-100 space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-gray-700 block">
                  2. Your Contact Information:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-600 block">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Kwame Mensah"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-600 block">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. kwame@example.com"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-600 block">Phone / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+233 55 123 4567"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-600 block">
                      Delivery Location / City &amp; Country:
                    </label>
                    <input
                      type="text"
                      value={deliveryLocation}
                      onChange={(e) => setDeliveryLocation(e.target.value)}
                      placeholder="e.g. East Legon Hills, Accra, Ghana"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-600 block">
                      Preferred Contact Channel:
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      {(['whatsapp', 'phone', 'email'] as const).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setContactMethod(m)}
                          className={`py-2 text-[11px] font-bold rounded-xl border transition-all cursor-pointer capitalize text-center ${
                            contactMethod === m
                              ? 'bg-orange-600 text-white border-orange-600'
                              : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {m === 'whatsapp' ? 'WhatsApp' : m}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. Custom Architectural Requirements */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 block">
                  Architectural Specifications &amp; Special Requirements:
                </label>
                <textarea
                  rows={3}
                  value={customRequirements}
                  onChange={(e) => setCustomRequirements(e.target.value)}
                  placeholder="Describe your special requirements: e.g. off-grid 10kW solar system, double panoramic glass sliding doors on front, exterior pergola wrap-around deck, specific room dimensions, or luxury marble finishes..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-between gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Submitting Request...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Special Request to 10Apples</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
