import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { CustomizationState } from '../types';
import { BASE_MODELS } from '../data/models';
import { X, CheckCircle2, ShieldCheck, CreditCard, Sparkles, MapPin, Truck } from 'lucide-react';
import { useAppConfig } from '../context/AppConfigContext';
import { formatCurrency, normalizeCurrency } from '../utils/currency';
import { addOrder } from '../utils/orderManager';

interface ReserveModalProps {
  state: CustomizationState;
  totalPrice: number;
  onClose: () => void;
}

export const ReserveModal: React.FC<ReserveModalProps> = ({
  state,
  totalPrice,
  onClose,
}) => {
  const { config } = useAppConfig();
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [createdOrderId, setCreatedOrderId] = useState<string>('BX-2026-9841');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    deliveryAddress: '',
    zipCode: '',
    landStatus: 'own-land',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reservationFee = config.branding?.reservationFee || 250;
  const primaryColor = config.branding?.primaryColor || '#ea580c';

  const currentModel =
    BASE_MODELS.find((m) => m.id === state.modelId) || BASE_MODELS[0];

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
    if (state.hasKitchenetteModule) activeAddons.push('Galley Kitchenette Pod');
    if (state.hasLuxuryBathPod) activeAddons.push('Luxury Bath Pod & Rain Shower');
    if (state.hasLuxuryBedSuite) activeAddons.push('Built-in Master Bed Suite & Storage');
    if (state.hasHvacMiniSplit) activeAddons.push('HVAC Climate Mini-Split 18k BTU');
    if (state.hasExteriorPergolaDeck) activeAddons.push('Exterior Pergola Decking Extension');
    if (state.hasBioDigester) activeAddons.push('Eco Bio-Digester Blackwater System');
    if (state.hasSmartDoorLock) activeAddons.push('Smart Biometric Entry Door Lock');
    if (state.hasElectricBlinds) activeAddons.push('Motorized Architectural Blackout Blinds');

    const freight = config.logistics?.freightCost || 4500;
    const sitePrep = config.logistics?.sitePrepCost || 5500;
    const basePrice = currentModel.basePrice || 54900;
    const optionsTotal = Math.max(0, totalPrice - basePrice - freight - sitePrep);

    const newOrder = addOrder({
      status: 'deposit_received',
      customer: {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        deliveryAddress: formData.deliveryAddress.trim() || undefined,
        zipCode: formData.zipCode.trim(),
        landStatus: formData.landStatus,
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
      initialNote: `Deposit of ${formatCurrency(reservationFee, config.currency)} authorized online. Placed via 3D Configurator.`,
    });

    setCreatedOrderId(newOrder.id);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-gray-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-[#FAFAFC] border-b border-gray-100 p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 text-white font-black rounded-xl flex items-center justify-center text-base"
              style={{ backgroundColor: primaryColor }}
            >
              {config.branding?.brandName?.charAt(0) || 'A'}
            </div>
            <div>
              <h3 className="font-extrabold text-sm tracking-tight text-gray-900">
                RESERVE PRODUCTION SLOT
              </h3>
              <p className="text-[11px] text-gray-500">
                {formatCurrency(reservationFee, config.currency)} Fully Refundable Deposit • Priority Manufacturing Queue
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
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Quick Summary Pill */}
            <div className="p-3 bg-[#F8F9FB] rounded-2xl border border-gray-200 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-gray-900">{currentModel.name}</span>
                <span className="text-gray-500 block text-[11px]">
                  Estimated Total: {formatCurrency(totalPrice, config.currency)}
                </span>
              </div>
              <span
                className="font-mono font-extrabold px-2.5 py-1 rounded-xl border"
                style={{
                  color: primaryColor,
                  backgroundColor: `${primaryColor}15`,
                  borderColor: `${primaryColor}30`,
                }}
              >
                {formatCurrency(reservationFee, config.currency)} Deposit Due
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="alex@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="(555) 000-0000"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Delivery Zip Code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 89101"
                    value={formData.zipCode}
                    onChange={(e) =>
                      setFormData({ ...formData, zipCode: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Land / Site Status
                  </label>
                  <select
                    value={formData.landStatus}
                    onChange={(e) =>
                      setFormData({ ...formData, landStatus: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs bg-white"
                  >
                    <option value="own-land">I own land ready for installation</option>
                    <option value="purchasing-land">Currently purchasing land</option>
                    <option value="backyard-adu">Backyard ADU / Guest house</option>
                    <option value="commercial-resort">Commercial glamping / Resort</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Delivery Site / Street Address <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1420 Desert Sun Way, Nevada"
                  value={formData.deliveryAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, deliveryAddress: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs"
                />
              </div>
            </div>

            {/* Refundable Guarantee Notice */}
            <div className="p-3.5 bg-orange-50/70 border border-orange-200/80 rounded-2xl flex items-start gap-2 text-[11px] text-orange-950">
              <ShieldCheck className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">100% Risk-Free Guarantee:</span> Your {formatCurrency(reservationFee, config.currency)}{' '}
                reservation fee holds your factory production queue spot and locks in
                your configuration pricing. Cancel anytime before manufacturing for a
                prompt, full refund.
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{ backgroundColor: primaryColor }}
              className="w-full py-3.5 px-4 hover:opacity-95 text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-xs"
            >
              <CreditCard className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? 'Securing Production Queue...'
                  : `Place ${formatCurrency(reservationFee, config.currency)} Fully Refundable Deposit`}
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
                Thank you, <span className="font-bold">{formData.fullName || 'Customer'}</span>.
                Your custom {currentModel.name} order has been queued. Confirmation and
                delivery coordination details have been sent to{' '}
                <span className="font-mono font-semibold">{formData.email || 'your email'}</span>.
              </p>
            </div>

            <div className="p-4 bg-[#F8F9FB] border border-gray-200 rounded-2xl text-left text-xs space-y-1.5 font-mono">
              <div className="flex justify-between text-gray-600">
                <span>Order Reference:</span>
                <span className="font-bold text-gray-900 bg-orange-100 text-orange-800 px-2 py-0.5 rounded-md">{createdOrderId}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Estimated Factory Ready:</span>
                <span className="font-bold text-gray-900">{currentModel.leadTime}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Target Zip Code:</span>
                <span className="font-bold text-gray-900">{formData.zipCode || '89101'}</span>
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
