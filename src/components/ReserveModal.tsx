import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { CustomizationState, PaymentMilestoneItem, PaymentOptionType } from '../types';
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
  ArrowRight,
  Ship,
  Wrench,
  Layers,
  ChevronLeft,
  Check,
  User,
  AlertCircle,
  Copy,
  ExternalLink,
  Landmark,
  Award,
  Calculator,
  HelpCircle,
  FileText,
  Building2,
  Percent,
  CheckSquare,
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

export const PARTNER_BANKS = [
  {
    id: 'Republic Bank Ghana',
    name: 'Republic Bank Ghana',
    tagline: 'Leading Mortgage Specialist',
    description: 'Home purchase & completion financing with up to 20-year terms.',
    maxTenure: 20,
    minDownPayment: 15,
  },
  {
    id: 'Stanbic Bank Ghana',
    name: 'Stanbic Bank Ghana',
    tagline: 'Home Loans & Diaspora Mortgages',
    description: 'Competitive cedi and USD mortgage facilities for local and diaspora buyers.',
    maxTenure: 20,
    minDownPayment: 20,
  },
  {
    id: 'Ecobank Ghana',
    name: 'Ecobank Ghana',
    tagline: 'Pan-African Modular Housing Facility',
    description: 'Fast-tracked pre-qualification and structured milestone disbursements.',
    maxTenure: 15,
    minDownPayment: 20,
  },
  {
    id: 'Absa Bank Ghana',
    name: 'Absa Bank Ghana',
    tagline: 'Affordable Home Financing Solutions',
    description: 'Structured residential financing with vetted builder partners.',
    maxTenure: 20,
    minDownPayment: 20,
  },
  {
    id: 'GCB Bank PLC',
    name: 'GCB Bank PLC',
    tagline: 'Public & Private Payroll Schemes',
    description: 'Nationwide institutional backing with direct payroll deductions.',
    maxTenure: 15,
    minDownPayment: 20,
  },
  {
    id: 'Diaspora Mortgage Desk',
    name: 'Diaspora Mortgage Desk',
    tagline: 'Foreign Remittance & Global Citizens',
    description: 'For Ghanaians in US, UK, Canada & Europe utilizing overseas income proof.',
    maxTenure: 20,
    minDownPayment: 20,
  },
];

export const GOV_HOUSING_SCHEMES = [
  {
    id: 'nhf_civil_servant',
    title: 'Public Sector & Civil Servant NHF Facility',
    sponsor: 'National Housing and Mortgage Fund (NHF)',
    rateLabel: '11.5% Concessional Rate',
    description: 'Subsidized mortgage program for teachers, health personnel, civil service, police & military officers.',
    badge: '11.5% Subsidized',
    eligibility: 'Civil servants, public sector employees, SSNIT active contributors',
  },
  {
    id: 'nhf_general_affordable',
    title: 'National Homeownership Fund (Affordable Housing Pilot)',
    sponsor: 'Ministry of Works & Housing / NHF',
    rateLabel: 'Concessional Single-Digit Window',
    description: 'National program enabling affordable prefabricated home acquisition with public interest subsidies.',
    badge: 'National Program',
    eligibility: 'Formal & informal sector workers with verified income & SSNIT',
  },
  {
    id: 'nhf_diaspora_reit',
    title: 'Diaspora Returnee & Homeownership Window',
    sponsor: 'Diaspora Engagement / Housing Scheme',
    rateLabel: 'Concessional Diaspora Facility',
    description: 'Special channel for overseas Ghanaians investing in modular homes with escrow protections.',
    badge: 'Diaspora Window',
    eligibility: 'Ghanaians abroad with verified remittances and valid Ghana Card',
  },
];

interface ReserveModalProps {
  state: CustomizationState;
  totalPrice: number;
  onClose: () => void;
  onSuccess?: (orderId: string) => void;
  includeFreight?: boolean;
  setIncludeFreight?: (val: boolean) => void;
  includeSitePrep?: boolean;
  setIncludeSitePrep?: (val: boolean) => void;
  initialPaymentOption?: PaymentOptionType;
}

export const ReserveModal: React.FC<ReserveModalProps> = ({
  state,
  totalPrice,
  onClose,
  onSuccess,
  includeFreight: externalIncludeFreight,
  setIncludeFreight: externalSetIncludeFreight,
  includeSitePrep: externalIncludeSitePrep,
  setIncludeSitePrep: externalSetIncludeSitePrep,
  initialPaymentOption = 'milestone',
}) => {
  const navigate = useNavigate();
  const { config } = useAppConfig();
  const currentUser = getCurrentUser();
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [createdOrderId, setCreatedOrderId] = useState<string>('BX-2026-9841');
  const [copiedOrderId, setCopiedOrderId] = useState(false);
  const [paymentOption, setPaymentOption] = useState<PaymentOptionType>(initialPaymentOption || 'milestone');

  const handleCopyOrderId = () => {
    if (createdOrderId) {
      navigator.clipboard.writeText(createdOrderId);
      setCopiedOrderId(true);
      setTimeout(() => setCopiedOrderId(false), 2000);
    }
  };

  // Checkout Delivery & Site Prep Options (Users can uncheck to avoid extra costs)
  const [internalIncludeFreight, setInternalIncludeFreight] = useState(
    externalIncludeFreight !== undefined ? externalIncludeFreight : true
  );
  const [internalIncludeSitePrep, setInternalIncludeSitePrep] = useState(
    externalIncludeSitePrep !== undefined ? externalIncludeSitePrep : true
  );

  const includeFreight = externalIncludeFreight !== undefined ? externalIncludeFreight : internalIncludeFreight;
  const handleToggleFreight = (checked: boolean) => {
    setInternalIncludeFreight(checked);
    if (externalSetIncludeFreight) externalSetIncludeFreight(checked);
  };

  const includeSitePrep = externalIncludeSitePrep !== undefined ? externalIncludeSitePrep : internalIncludeSitePrep;
  const handleToggleSitePrep = (checked: boolean) => {
    setInternalIncludeSitePrep(checked);
    if (externalSetIncludeSitePrep) externalSetIncludeSitePrep(checked);
  };

  const freightAmount = config.logistics?.freightCost || 4500;
  const sitePrepAmount = config.logistics?.sitePrepCost || 5500;
  const clearingTransportAmount = Math.round(sitePrepAmount * 0.51); // Port clearing & local site transport ($2,800)
  const installationAmount = sitePrepAmount - clearingTransportAmount; // On-site crane, installation & hookup ($2,700)

  const activeFreightCost = includeFreight ? freightAmount : 0;
  const activeClearingCost = includeSitePrep ? clearingTransportAmount : 0;
  const activeInstallationCost = includeSitePrep ? installationAmount : 0;
  const activeSitePrepCost = activeClearingCost + activeInstallationCost;
  const checkoutTotal = totalPrice + activeFreightCost + activeSitePrepCost;

  // The 4 Milestone Tranches (Stage-by-stage transparent triggers)
  const generatedMilestones: PaymentMilestoneItem[] = [
    {
      id: 'milestone-1-house',
      stageNumber: 1,
      stageKey: 'house_manufacturing',
      title: '1. House Manufacturing & Interior Modules',
      timing: 'Due Separately Upfront to Start Manufacturing',
      triggerEvent: 'Pay separately for the house to initiate factory fabrication',
      amount: totalPrice,
      description: 'Factory fabrication of steel frame, insulated sandwich panels, Low-E glass, interior bathroom/kitchen pods, and architectural finishes.',
      isHouseSeparate: true,
      status: 'due_now',
    },
    {
      id: 'milestone-2-freight',
      stageNumber: 2,
      stageKey: 'international_freight',
      title: '2. International Ocean Freight Container',
      timing: 'Due After Factory Finishes Manufacturing',
      triggerEvent: 'Pay after the factory has finished manufacturing the house',
      amount: activeFreightCost,
      description: 'Ocean freight shipping in sealed 40HQ container from the international factory port to arrival seaport.',
      status: 'upcoming',
    },
    {
      id: 'milestone-3-clearing-transport',
      stageNumber: 3,
      stageKey: 'clearing_transport',
      title: '3. Port Clearing & Local Site Transportation',
      timing: 'Due When Shipping Container Arrives at Port',
      triggerEvent: 'Pay when your container arrives for customs clearance and transportation of the house to your site locally',
      amount: activeClearingCost,
      description: 'Port customs clearance, terminal cargo handling, duty documentation, and heavy-duty flatbed transport of the container to your site locally.',
      status: 'upcoming',
    },
    {
      id: 'milestone-4-installation',
      stageNumber: 4,
      stageKey: 'installation',
      title: '4. On-Site Installation & Foundation Hookup',
      timing: 'Due Upon Container Arrival on Site for Installation',
      triggerEvent: 'Pay upon container arrival on site for certified positioning, expansion, and installation',
      amount: activeInstallationCost,
      description: 'Certified rigging crew, crane placement, mechanical unfolding/expansion of living wings, foundation tie-downs, and utility connections.',
      status: 'upcoming',
    },
  ];

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

  // Bank & Government Scheme exploration state
  const [mortgageBank, setMortgageBank] = useState<string>('Republic Bank Ghana');
  const [mortgageTenure, setMortgageTenure] = useState<number>(15);
  const [mortgageDownPaymentPct, setMortgageDownPaymentPct] = useState<number>(20);
  const [requestBankPreApproval, setRequestBankPreApproval] = useState<boolean>(true);
  const [employmentType, setEmploymentType] = useState<string>('salaried');

  const [govSchemeCategory, setGovSchemeCategory] = useState<string>('nhf_civil_servant');
  const [requestGovSubsidyScreening, setRequestGovSubsidyScreening] = useState<boolean>(true);
  const [applicantIdOrSsnit, setApplicantIdOrSsnit] = useState<string>('');

  // Interest rates calibrated to market & currency
  const isGHS = config.currency === 'GHS';
  const commercialAnnualRate = isGHS ? 0.195 : 0.095; // 19.5% GHS / 9.5% USD
  const govSchemeAnnualRate = isGHS ? 0.115 : 0.065; // 11.5% GHS (NHF subsidized) / 6.5% USD

  // Commercial Mortgage calculations
  const bankDownPaymentAmount = Math.round(checkoutTotal * (mortgageDownPaymentPct / 100));
  const bankFinancedPrincipal = Math.max(0, checkoutTotal - bankDownPaymentAmount);
  const bankMonthlyRate = commercialAnnualRate / 12;
  const bankTotalMonths = mortgageTenure * 12;
  const bankEstimatedMonthly =
    bankFinancedPrincipal > 0
      ? Math.round(
          (bankFinancedPrincipal *
            bankMonthlyRate *
            Math.pow(1 + bankMonthlyRate, bankTotalMonths)) /
            (Math.pow(1 + bankMonthlyRate, bankTotalMonths) - 1)
        )
      : 0;

  // Government Housing Scheme calculations (Concessional 15% down payment default)
  const govDownPaymentPct = 15;
  const govDownPaymentAmount = Math.round(checkoutTotal * (govDownPaymentPct / 100));
  const govFinancedPrincipal = Math.max(0, checkoutTotal - govDownPaymentAmount);
  const govMonthlyRate = govSchemeAnnualRate / 12;
  const govTotalMonths = 20 * 12; // 20 years concessional tenure
  const govEstimatedMonthly =
    govFinancedPrincipal > 0
      ? Math.round(
          (govFinancedPrincipal *
            govMonthlyRate *
            Math.pow(1 + govMonthlyRate, govTotalMonths)) /
            (Math.pow(1 + govMonthlyRate, govTotalMonths) - 1)
        )
      : 0;

  // Comparison savings: Commercial monthly over 20 years vs Government Scheme subsidized monthly
  const standardCommercialMonthlyAt20Yrs =
    govFinancedPrincipal > 0
      ? Math.round(
          (govFinancedPrincipal *
            (commercialAnnualRate / 12) *
            Math.pow(1 + commercialAnnualRate / 12, 240)) /
            (Math.pow(1 + commercialAnnualRate / 12, 240) - 1)
        )
      : 0;
  const monthlySubsidySavings = Math.max(0, standardCommercialMonthlyAt20Yrs - govEstimatedMonthly);

  type ReservationStepNumber = 1 | 2 | 3 | 4;
  const [formStep, setFormStep] = useState<ReservationStepNumber>(1);
  const [stepError, setStepError] = useState<string | null>(null);

  const STEP_CONFIG = [
    { number: 1 as const, title: 'Contact', label: 'Client Details', icon: User },
    { number: 2 as const, title: 'Destination', label: 'Site Logistics', icon: Globe },
    { number: 3 as const, title: 'Funding', label: 'Payment & Financing', icon: CreditCard },
    { number: 4 as const, title: 'Review & Lock', label: 'Confirm Slot', icon: ShieldCheck },
  ];

  const validateCurrentStep = (targetStep: ReservationStepNumber): boolean => {
    setStepError(null);
    if (formStep === 1 && targetStep > 1) {
      if (!formData.fullName.trim()) {
        setStepError('Please enter your full legal name to continue.');
        return false;
      }
      if (!formData.email.trim() || !formData.email.includes('@')) {
        setStepError('Please enter a valid email address.');
        return false;
      }
      if (!formData.phone.trim()) {
        setStepError('Please enter your contact phone number.');
        return false;
      }
    }

    if (formStep === 2 && targetStep > 2) {
      if (!formData.zipCode.trim()) {
        setStepError(`Please provide your ${selectedCountry.postalLabel || 'postal or GPS code'}.`);
        return false;
      }
    }

    return true;
  };

  const handleNextStep = () => {
    const next = (formStep + 1) as ReservationStepNumber;
    if (validateCurrentStep(next)) {
      setFormStep(next);
      setStepError(null);
    }
  };

  const handlePrevStep = () => {
    setStepError(null);
    setFormStep((prev) => Math.max(1, prev - 1) as ReservationStepNumber);
  };

  const handleJumpToStep = (targetStep: ReservationStepNumber) => {
    if (targetStep < formStep) {
      setStepError(null);
      setFormStep(targetStep);
    } else if (validateCurrentStep(targetStep)) {
      setFormStep(targetStep);
    }
  };

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

    const basePrice = currentModel.basePrice || 54900;
    const optionsTotal = Math.max(0, totalPrice - basePrice);

    const financingDetails =
      paymentOption === 'bank_mortgage' || paymentOption === 'gov_scheme'
        ? {
            fundingType: paymentOption,
            providerName: paymentOption === 'bank_mortgage' ? mortgageBank : 'National Housing and Mortgage Fund (NHF)',
            schemeName: paymentOption === 'gov_scheme' ? govSchemeCategory : undefined,
            tenureYears: paymentOption === 'bank_mortgage' ? mortgageTenure : 20,
            downPaymentPercent: paymentOption === 'bank_mortgage' ? mortgageDownPaymentPct : govDownPaymentPct,
            downPaymentAmount: paymentOption === 'bank_mortgage' ? bankDownPaymentAmount : govDownPaymentAmount,
            financedAmount: paymentOption === 'bank_mortgage' ? bankFinancedPrincipal : govFinancedPrincipal,
            estimatedMonthlyPayment: paymentOption === 'bank_mortgage' ? bankEstimatedMonthly : govEstimatedMonthly,
            applicantType: employmentType,
            preApprovalRequested: paymentOption === 'bank_mortgage' ? requestBankPreApproval : requestGovSubsidyScreening,
            notes: applicantIdOrSsnit ? `ID/SSNIT: ${applicantIdOrSsnit}` : undefined,
          }
        : undefined;

    let initialFundingNote = '';
    if (paymentOption === 'milestone') {
      initialFundingNote = `Payment Plan: Milestone Tranches. Stage 1: House Manufacturing (${formatCurrency(totalPrice, config.currency)} separate upfront), Stage 2: Int'l Freight (${formatCurrency(activeFreightCost, config.currency)} due post-factory), Stage 3: Port Clearing & Transport (${formatCurrency(activeClearingCost, config.currency)} due on container arrival), Stage 4: On-Site Installation (${formatCurrency(activeInstallationCost, config.currency)} due on site arrival).`;
    } else if (paymentOption === 'full') {
      initialFundingNote = `Payment Plan: Full Turnkey Payment (${formatCurrency(checkoutTotal, config.currency)} single consolidated invoice).`;
    } else if (paymentOption === 'bank_mortgage') {
      initialFundingNote = `Payment Plan: Commercial Bank Mortgage via ${mortgageBank} (${mortgageTenure} Yrs tenure, ${mortgageDownPaymentPct}% down: ${formatCurrency(bankDownPaymentAmount, config.currency)}, Financed Principal: ${formatCurrency(bankFinancedPrincipal, config.currency)}, Est. Installment: ~${formatCurrency(bankEstimatedMonthly, config.currency)}/mo). Pre-qualification dossier requested: ${requestBankPreApproval ? 'Yes' : 'No'}. Profile: ${employmentType}.`;
    } else if (paymentOption === 'gov_scheme') {
      initialFundingNote = `Payment Plan: Government Housing Scheme (NHF Concessional Facility, ~${formatCurrency(govEstimatedMonthly, config.currency)}/mo at subsidized ${isGHS ? '11.5%' : '6.5%'} interest rate, saving ~${formatCurrency(monthlySubsidySavings, config.currency)}/mo). Subsidy screening requested: ${requestGovSubsidyScreening ? 'Yes' : 'No'}.${applicantIdOrSsnit ? ` Applicant ID/SSNIT: ${applicantIdOrSsnit}.` : ''}`;
    }

    const newOrder = addOrder({
      status: 'deposit_received',
      paymentOption,
      paymentMilestones: generatedMilestones,
      financingDetails,
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
        freightCost: activeFreightCost,
        sitePrepCost: activeSitePrepCost,
        clearingTransportCost: activeClearingCost,
        installationCost: activeInstallationCost,
        taxAmount: 0,
        totalPrice: checkoutTotal,
        depositDue: reservationFee,
        depositPaid: true,
        currency: normalizeCurrency(config.currency),
        paymentOption,
        paymentMilestones: generatedMilestones,
        financingDetails,
      },
      estimatedDeliveryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 35).toISOString().split('T')[0],
      initialNote: `${initialFundingNote} Deposit of ${formatCurrency(reservationFee, config.currency, { ratesMap: config.exchangeRates })} authorized online. Destination: ${resolvedDistrict}, ${subdivisionName}, ${selectedCountry.name}.`,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-gray-200 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] sm:max-h-[90vh] flex flex-col">
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
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 overscroll-contain scroll-smooth">
            {/* Quick Summary Pill */}
            <div className="p-3.5 bg-[#F8F9FB] rounded-2xl border border-gray-200 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-gray-900 text-sm">{currentModel.name}</span>
                <div className="text-gray-500 text-[11px] mt-0.5 flex items-center gap-1.5 flex-wrap">
                  <span>Turnkey Investment:</span>
                  <span className="font-bold text-gray-950 font-mono text-xs">
                    {formatCurrency(checkoutTotal, config.currency, { ratesMap: config.exchangeRates })}
                  </span>
                  {(!includeFreight || !includeSitePrep) && (
                    <span className="text-[10px] text-emerald-800 bg-emerald-100 font-bold px-1.5 py-0.2 rounded border border-emerald-200">
                      Savings Applied
                    </span>
                  )}
                </div>
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

            {/* PROGRESS TRACKER */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
              {/* Stepper Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-gray-950 uppercase tracking-wider">
                    Step {formStep} of 4: {STEP_CONFIG[formStep - 1].title}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-extrabold text-xs text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
                    {formStep === 1 ? '25%' : formStep === 2 ? '50%' : formStep === 3 ? '75%' : '100%'} Completed
                  </span>
                </div>
              </div>

              {/* Progress Line */}
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500 rounded-full transition-all duration-300"
                  style={{
                    width: `${formStep === 1 ? 25 : formStep === 2 ? 50 : formStep === 3 ? 75 : 100}%`,
                  }}
                />
              </div>

              {/* Step Circles & Labels */}
              <div className="grid grid-cols-4 gap-1 pt-1">
                {STEP_CONFIG.map((s) => {
                  const isCompleted = s.number < formStep;
                  const isCurrent = s.number === formStep;
                  const StepIcon = s.icon;

                  return (
                    <button
                      key={s.number}
                      type="button"
                      disabled={s.number > formStep}
                      onClick={() => handleJumpToStep(s.number)}
                      className={`flex flex-col items-center text-center group transition-all ${
                        isCompleted ? 'cursor-pointer' : isCurrent ? 'cursor-default' : 'cursor-not-allowed opacity-60'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                          isCompleted
                            ? 'bg-emerald-600 text-white shadow-xs group-hover:scale-105'
                            : isCurrent
                            ? 'text-white shadow-md ring-4 ring-orange-100'
                            : 'bg-gray-100 text-gray-400 border border-gray-200'
                        }`}
                        style={isCurrent ? { backgroundColor: primaryColor } : undefined}
                      >
                        {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : <StepIcon className="w-3.5 h-3.5" />}
                      </div>
                      <span
                        className={`text-[10px] font-extrabold mt-1.5 truncate max-w-full leading-tight ${
                          isCurrent
                            ? 'text-orange-600'
                            : isCompleted
                            ? 'text-gray-900 group-hover:text-orange-600'
                            : 'text-gray-400'
                        }`}
                      >
                        {s.title}
                      </span>
                      <span className="text-[9px] text-gray-400 font-medium hidden sm:block truncate max-w-full">
                        {s.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Encouragement Badge */}
              <div className="p-2.5 rounded-xl bg-gradient-to-r from-orange-50/90 via-amber-50/70 to-emerald-50/60 border border-orange-200/80 text-[11px] text-orange-950 flex items-center justify-between gap-2">
                <span className="font-semibold flex items-center gap-1.5 truncate">
                  <Sparkles className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                  <span className="truncate">
                    {formStep === 1 && '✨ Step 1 of 4: Enter contact details to begin your factory queue reservation.'}
                    {formStep === 2 && '📍 Step 2 of 4: 50% completed — Calibrate destination port and delivery route.'}
                    {formStep === 3 && '💳 Step 3 of 4: 75% completed — Select milestone schedule or full payment.'}
                    {formStep === 4 && '🚀 Final Step: Review your turnkey package and lock in production queue!'}
                  </span>
                </span>
                <span className="text-[10px] font-mono font-bold text-orange-800 bg-white px-2 py-0.5 rounded-md border border-orange-200 shadow-2xs shrink-0">
                  {formStep === 4 ? 'Ready to Lock' : `${4 - formStep} steps left`}
                </span>
              </div>
            </div>

            {/* Validation Error Banner */}
            {stepError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700 flex items-center gap-2 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{stepError}</span>
              </div>
            )}

            {/* STEP 1: CLIENT CONTACT DETAILS */}
            {formStep === 1 && (
              <div className="space-y-3.5 animate-in fade-in slide-in-from-right-2 duration-200">
                <div className="flex items-center justify-between pb-1 border-b border-gray-100">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-orange-600" />
                      <span>Primary Contact Information</span>
                    </h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Used strictly for engineering intake verification and dispatch updates.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    Step 1 / 4
                  </span>
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
                    onChange={(e) => {
                      setFormData({ ...formData, fullName: e.target.value });
                      if (stepError) setStepError(null);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-xs text-gray-900 transition-all font-medium"
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
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (stepError) setStepError(null);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-xs text-gray-900 transition-all font-medium"
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
                        onChange={(e) => {
                          setFormData({ ...formData, phone: e.target.value });
                          if (stepError) setStepError(null);
                        }}
                        className="w-full pl-16 pr-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-xs text-gray-900 transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/80 flex items-center gap-2 text-[11px] text-gray-600">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Your contact information is 100% private and protected by standard Cloud Firestore encryption.
                  </span>
                </div>
              </div>
            )}

            {/* STEP 2: DYNAMIC DELIVERY DESTINATION & JURISDICTION */}
            {formStep === 2 && (
              <div className="space-y-3.5 animate-in fade-in slide-in-from-right-2 duration-200">
                <div className="flex items-center justify-between pb-1 border-b border-gray-100">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-orange-600" />
                      <span>Delivery Destination &amp; Site Readiness</span>
                    </h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Automatically calibrates ocean freight port routes and municipal zoning.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Step 2 / 4
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
                  {/* Primary Subdivision */}
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

                  {/* Secondary Division */}
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

                {/* Optional Custom District */}
                {(selectedDistrict.includes('Other') || selectedDistrict.includes('Custom')) && (
                  <div className="animate-in fade-in slide-in-from-top-1 duration-150">
                    <label className="block font-bold text-gray-700 mb-1 text-xs">
                      Specify Local District / Locality Name:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter specific municipal or district area"
                      value={customDistrict}
                      onChange={(e) => setCustomDistrict(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-xs text-gray-900 bg-orange-50/20"
                    />
                  </div>
                )}

                {/* Postal Code & Land Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1 text-xs">
                      {selectedCountry.postalLabel} <span className="text-orange-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={selectedCountry.postalPlaceholder}
                      value={formData.zipCode}
                      onChange={(e) => {
                        setFormData({ ...formData, zipCode: e.target.value });
                        if (stepError) setStepError(null);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-xs text-gray-900 font-mono transition-all font-medium"
                    />
                  </div>

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
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-xs bg-white text-gray-900 cursor-pointer appearance-none pr-8 transition-all font-medium"
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

                {/* Street Address */}
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-xs text-gray-900 transition-all font-medium"
                  />
                </div>

                {/* Freight Route Preview Badge */}
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
            )}

            {/* STEP 3: PAYMENT STRUCTURE & FUNDING PATHWAYS */}
            {formStep === 3 && (
              <div className="space-y-3.5 animate-in fade-in slide-in-from-right-2 duration-200">
                <div className="flex items-center justify-between pb-1 border-b border-gray-100">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-orange-600" />
                      <span>Payment Plan &amp; Funding Pathways</span>
                    </h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Explore direct cash tranches, turnkey invoice, commercial bank mortgages, or government housing scheme subsidies.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-orange-800 bg-orange-100 px-2 py-0.5 rounded border border-orange-200">
                    Step 3 / 4
                  </span>
                </div>

                {/* 4 Funding Option Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Option 1: Milestone Plan */}
                  <div
                    onClick={() => setPaymentOption('milestone')}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer relative text-left ${
                      paymentOption === 'milestone'
                        ? 'border-orange-500 bg-orange-50/40 ring-2 ring-orange-500/20 shadow-xs'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-black text-gray-950 flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                        <span>Direct Milestone Plan</span>
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                        paymentOption === 'milestone' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {paymentOption === 'milestone' ? 'Selected' : 'Select'}
                      </span>
                    </div>
                    <p className="text-[10.5px] text-gray-600 leading-snug">
                      Pay progressively in 4 transparent stages: House build first, ocean freight next, customs/transport on arrival, and assembly on site.
                    </p>
                  </div>

                  {/* Option 2: Full Turnkey Payment */}
                  <div
                    onClick={() => setPaymentOption('full')}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer relative text-left ${
                      paymentOption === 'full'
                        ? 'border-orange-500 bg-orange-50/40 ring-2 ring-orange-500/20 shadow-xs'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-black text-gray-950 flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>Full Turnkey Invoice</span>
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                        paymentOption === 'full' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {paymentOption === 'full' ? 'Selected' : 'Select'}
                      </span>
                    </div>
                    <p className="text-[10.5px] text-gray-600 leading-snug">
                      Single consolidated contract covering manufacturing, international shipping, destination port clearance, and certified assembly.
                    </p>
                  </div>

                  {/* Option 3: Commercial Bank Mortgage */}
                  <div
                    onClick={() => setPaymentOption('bank_mortgage')}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer relative text-left ${
                      paymentOption === 'bank_mortgage'
                        ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20 shadow-xs'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-black text-gray-950 flex items-center gap-1.5">
                        <Landmark className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                        <span>Bank Mortgage &amp; Loans</span>
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                        paymentOption === 'bank_mortgage' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {paymentOption === 'bank_mortgage' ? 'Selected' : 'Explore'}
                      </span>
                    </div>
                    <p className="text-[10.5px] text-gray-600 leading-snug">
                      Pre-qualify with partner banks (Republic Bank, Stanbic, Ecobank, Absa). Spread payments over 5–20 years with loan pre-approval.
                    </p>
                  </div>

                  {/* Option 4: Government Housing Scheme */}
                  <div
                    onClick={() => setPaymentOption('gov_scheme')}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer relative text-left ${
                      paymentOption === 'gov_scheme'
                        ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-black text-gray-950 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span>Gov Housing Schemes</span>
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                        paymentOption === 'gov_scheme' ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {paymentOption === 'gov_scheme' ? 'Selected' : 'Subsidized'}
                      </span>
                    </div>
                    <p className="text-[10.5px] text-gray-600 leading-snug">
                      Access National Housing &amp; Mortgage Fund (NHF) concessional rates ({isGHS ? '11.5%' : '6.5%'}) for civil servants &amp; contributors.
                    </p>
                  </div>
                </div>

                {/* 1. Milestone Roadmap View */}
                {paymentOption === 'milestone' && (
                  <div className="p-3.5 rounded-2xl bg-[#FAFAFC] border border-gray-200/90 space-y-2.5">
                    <div className="flex items-center justify-between text-xs pb-1 border-b border-gray-200/70">
                      <span className="font-extrabold text-gray-900 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                        <span>Transparent 4-Stage Milestone Schedule</span>
                      </span>
                      <span className="text-[10px] text-gray-500 font-medium">Stage-by-Stage</span>
                    </div>

                    <div className="space-y-2">
                      {/* Milestone 1 */}
                      <div className="p-2.5 rounded-xl bg-white border border-gray-200/80 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-800 text-[10px] font-black flex items-center justify-center shrink-0">1</span>
                            <span className="font-bold text-gray-900 text-xs">House Manufacturing (Paid Separately)</span>
                          </div>
                          <span className="font-mono font-bold text-gray-950 text-xs">
                            {formatCurrency(totalPrice, config.currency, { ratesMap: config.exchangeRates })}
                          </span>
                        </div>
                        <div className="text-[10px] text-orange-800 font-medium pl-6">
                          ⏰ Due separately upfront to start manufacturing in factory
                        </div>
                        <p className="text-[10px] text-gray-500 pl-6 leading-relaxed">
                          Q235 steel chassis, Rockwool insulation panels, Low-E glass, interior bathroom/kitchen modules, and customized finishes.
                        </p>
                        <div className="pl-6 pt-0.5 text-[9px] text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>{formatCurrency(reservationFee, config.currency, { ratesMap: config.exchangeRates })} deposit paid today locks queue &amp; credits toward this milestone.</span>
                        </div>
                      </div>

                      {/* Milestone 2 */}
                      <div className="p-2.5 rounded-xl bg-white border border-gray-200/80 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black flex items-center justify-center shrink-0">2</span>
                            <span className="font-bold text-gray-900 text-xs">International Ocean Freight</span>
                          </div>
                          <span className="font-mono font-bold text-gray-950 text-xs">
                            {formatCurrency(activeFreightCost, config.currency, { ratesMap: config.exchangeRates })}
                          </span>
                        </div>
                        <div className="text-[10px] text-blue-800 font-medium pl-6">
                          ⏰ Due after the factory has finished manufacturing the house
                        </div>
                        <p className="text-[10px] text-gray-500 pl-6 leading-relaxed">
                          Sealed 40HQ container ocean freight shipping from the international factory port to arrival seaport.
                        </p>
                      </div>

                      {/* Milestone 3 */}
                      <div className="p-2.5 rounded-xl bg-white border border-gray-200/80 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black flex items-center justify-center shrink-0">3</span>
                            <span className="font-bold text-gray-900 text-xs">Port Clearing &amp; Local Site Transportation</span>
                          </div>
                          <span className="font-mono font-bold text-gray-950 text-xs">
                            {formatCurrency(activeClearingCost, config.currency, { ratesMap: config.exchangeRates })}
                          </span>
                        </div>
                        <div className="text-[10px] text-amber-800 font-medium pl-6">
                          ⏰ Due when your container arrives at the destination port
                        </div>
                        <p className="text-[10px] text-gray-500 pl-6 leading-relaxed">
                          Port customs clearance, terminal cargo handling, duty documentation, and heavy-duty flatbed transport of the container to your site locally.
                        </p>
                      </div>

                      {/* Milestone 4 */}
                      <div className="p-2.5 rounded-xl bg-white border border-gray-200/80 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center justify-center shrink-0">4</span>
                            <span className="font-bold text-gray-900 text-xs">On-Site Installation &amp; Setup</span>
                          </div>
                          <span className="font-mono font-bold text-gray-950 text-xs">
                            {formatCurrency(activeInstallationCost, config.currency, { ratesMap: config.exchangeRates })}
                          </span>
                        </div>
                        <div className="text-[10px] text-emerald-800 font-medium pl-6">
                          ⏰ Due upon container arrival on site for installation
                        </div>
                        <p className="text-[10px] text-gray-500 pl-6 leading-relaxed">
                          Certified crane placement, mechanical unfolding/expansion of living wings, foundation tie-downs, and utility connections.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Full Turnkey Payment View */}
                {paymentOption === 'full' && (
                  <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 text-xs space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>House Base &amp; Custom Options:</span>
                      <span className="font-mono font-bold text-gray-900">{formatCurrency(totalPrice, config.currency, { ratesMap: config.exchangeRates })}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Turnkey Freight, Logistics &amp; Installation:</span>
                      <span className="font-mono font-bold text-gray-900">{formatCurrency(activeFreightCost + activeSitePrepCost, config.currency, { ratesMap: config.exchangeRates })}</span>
                    </div>
                    <div className="flex justify-between text-gray-950 font-bold pt-2 border-t border-gray-200 text-sm">
                      <span>Total Turnkey Investment:</span>
                      <span className="font-mono text-orange-700">{formatCurrency(checkoutTotal, config.currency, { ratesMap: config.exchangeRates })}</span>
                    </div>
                  </div>
                )}

                {/* 3. Commercial Bank Mortgage Explorer View */}
                {paymentOption === 'bank_mortgage' && (
                  <div className="p-3.5 rounded-2xl bg-blue-50/30 border border-blue-200 space-y-3">
                    <div className="flex items-center justify-between pb-1.5 border-b border-blue-100">
                      <div className="flex items-center gap-1.5">
                        <Landmark className="w-4 h-4 text-blue-700" />
                        <span className="font-black text-xs text-blue-950 uppercase tracking-wide">
                          Partner Bank Mortgage Calculator
                        </span>
                      </div>
                      <span className="text-[10px] text-blue-700 font-bold bg-blue-100/80 px-2 py-0.5 rounded-md">
                        Supporting Banks
                      </span>
                    </div>

                    <div className="text-[10.5px] text-blue-900 bg-blue-100/70 p-2.5 rounded-xl border border-blue-200/80 leading-relaxed">
                      <strong>Financing Notice:</strong> We do not have monthly financing on our platform. All financing options, underwriting, and loan terms are managed entirely by our supporting banks.
                    </div>

                    {/* Bank Selection Cards */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1.5">
                        Select Preferred Financing Partner:
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                        {PARTNER_BANKS.map((b) => (
                          <div
                            key={b.id}
                            onClick={() => setMortgageBank(b.name)}
                            className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                              mortgageBank === b.name
                                ? 'bg-white border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                                : 'bg-white/70 border-gray-200 hover:bg-white text-gray-600'
                            }`}
                          >
                            <div className="font-bold text-[11px] text-gray-950 truncate">{b.name}</div>
                            <div className="text-[9px] text-blue-700 font-semibold truncate">{b.tagline}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Interactive Loan Tenure & Down Payment Controls */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {/* Tenure Selector */}
                      <div className="bg-white p-2.5 rounded-xl border border-blue-100 space-y-1.5">
                        <div className="flex justify-between items-center text-[11px] font-bold text-gray-700">
                          <span>Loan Tenure:</span>
                          <span className="font-mono text-blue-700 font-black">{mortgageTenure} Years</span>
                        </div>
                        <div className="grid grid-cols-4 gap-1">
                          {[5, 10, 15, 20].map((yr) => (
                            <button
                              key={yr}
                              type="button"
                              onClick={() => setMortgageTenure(yr)}
                              className={`py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                mortgageTenure === yr
                                  ? 'bg-blue-600 text-white shadow-2xs'
                                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                              }`}
                            >
                              {yr} Yrs
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Down Payment Selector */}
                      <div className="bg-white p-2.5 rounded-xl border border-blue-100 space-y-1.5">
                        <div className="flex justify-between items-center text-[11px] font-bold text-gray-700">
                          <span>Down Payment:</span>
                          <span className="font-mono text-blue-700 font-black">{mortgageDownPaymentPct}%</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                          {[15, 20, 30].map((pct) => (
                            <button
                              key={pct}
                              type="button"
                              onClick={() => setMortgageDownPaymentPct(pct)}
                              className={`py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                mortgageDownPaymentPct === pct
                                  ? 'bg-blue-600 text-white shadow-2xs'
                                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                              }`}
                            >
                              {pct}%
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Mortgage Financial Breakdown Bento */}
                    <div className="p-3 bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-2xl space-y-2 shadow-xs">
                      <div className="grid grid-cols-2 gap-2 text-xs border-b border-white/10 pb-2">
                        <div>
                          <div className="text-[9.5px] uppercase tracking-wider text-blue-200 font-semibold">Down Payment ({mortgageDownPaymentPct}%)</div>
                          <div className="font-mono font-bold text-white text-xs">
                            {formatCurrency(bankDownPaymentAmount, config.currency, { ratesMap: config.exchangeRates })}
                          </div>
                        </div>
                        <div>
                          <div className="text-[9.5px] uppercase tracking-wider text-blue-200 font-semibold">Financed Principal</div>
                          <div className="font-mono font-bold text-white text-xs">
                            {formatCurrency(bankFinancedPrincipal, config.currency, { ratesMap: config.exchangeRates })}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-0.5">
                        <div>
                          <div className="text-[10px] uppercase font-bold text-blue-200 flex items-center gap-1">
                            <Calculator className="w-3 h-3 text-amber-400" />
                            <span>Estimated Monthly Installment</span>
                          </div>
                          <div className="text-[10px] text-white/70">
                            Based on ~{isGHS ? '19.5% p.a.' : '9.5% p.a.'} over {mortgageTenure} years
                          </div>
                        </div>
                        <div className="font-mono font-black text-amber-300 text-base sm:text-lg">
                          ~{formatCurrency(bankEstimatedMonthly, config.currency, { ratesMap: config.exchangeRates })}<span className="text-xs text-white/80 font-normal">/mo</span>
                        </div>
                      </div>
                    </div>

                    {/* Employment Type Selector */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Applicant Income / Employment Status:
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        {[
                          { id: 'salaried', label: 'Formal Salaried' },
                          { id: 'civil_servant', label: 'Public Sector / Civil' },
                          { id: 'self_employed', label: 'Business Owner' },
                          { id: 'diaspora', label: 'Diaspora Remittance' },
                        ].map((emp) => (
                          <button
                            key={emp.id}
                            type="button"
                            onClick={() => setEmploymentType(emp.id)}
                            className={`py-1.5 px-2 rounded-xl text-[10.5px] font-semibold border transition-all text-center cursor-pointer ${
                              employmentType === emp.id
                                ? 'bg-white border-blue-600 text-blue-900 ring-1 ring-blue-500/20 font-bold'
                                : 'bg-white/60 border-gray-200 text-gray-600 hover:bg-white'
                            }`}
                          >
                            {emp.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Pre-approval Toggle */}
                    <label className="flex items-start gap-2.5 p-2.5 bg-white rounded-xl border border-blue-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={requestBankPreApproval}
                        onChange={(e) => setRequestBankPreApproval(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500/30 border-gray-300 accent-blue-600 cursor-pointer"
                      />
                      <div className="text-[11px] leading-snug text-gray-700">
                        <span className="font-bold text-gray-950">Forward dossier to {mortgageBank} for loan pre-qualification.</span>
                        <div className="text-[10px] text-gray-500 mt-0.5">
                          A 10Apples mortgage advisor will assist you with paperwork. Your {formatCurrency(reservationFee, config.currency, { ratesMap: config.exchangeRates })} deposit secures production placement while underwriting finishes.
                        </div>
                      </div>
                    </label>

                    {/* Eligibility Checklist Note */}
                    <div className="p-2.5 bg-blue-100/40 rounded-xl border border-blue-200/80 text-[10.5px] text-blue-950 space-y-1">
                      <div className="font-bold flex items-center gap-1 text-[11px]">
                        <CheckSquare className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                        <span>Mortgage Pre-Qualification Requirements:</span>
                      </div>
                      <ul className="list-disc list-inside space-y-0.5 text-gray-600 pl-1 text-[10px]">
                        <li>3–6 months recent payslips or 12 months audited bank statements</li>
                        <li>Valid Ghana Card / Passport &amp; Tax/SSNIT Number</li>
                        <li>Site allocation, land title deed, or lease agreement</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* 4. Government Housing Scheme Explorer View */}
                {paymentOption === 'gov_scheme' && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50/40 border border-emerald-200 space-y-3">
                    <div className="flex items-center justify-between pb-1.5 border-b border-emerald-200/80">
                      <div className="flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-emerald-700" />
                        <span className="font-black text-xs text-emerald-950 uppercase tracking-wide">
                          Government Housing Scheme (NHF) Explorer
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
                        Subsidized Scheme
                      </span>
                    </div>

                    <div className="text-[10.5px] text-emerald-950 bg-emerald-100/70 p-2.5 rounded-xl border border-emerald-200/80 leading-relaxed">
                      <strong>Financing Notice:</strong> 10Apples does not provide in-house credit. All subsidized housing facilities and monthly terms are managed and disbursed directly by our partner banks under the national housing scheme.
                    </div>

                    {/* Scheme Cards */}
                    <div className="space-y-1.5">
                      {GOV_HOUSING_SCHEMES.map((scheme) => (
                        <div
                          key={scheme.id}
                          onClick={() => setGovSchemeCategory(scheme.id)}
                          className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                            govSchemeCategory === scheme.id
                              ? 'bg-white border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs'
                              : 'bg-white/70 border-gray-200 hover:bg-white text-gray-600'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs text-gray-950">{scheme.title}</span>
                            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              {scheme.rateLabel}
                            </span>
                          </div>
                          <p className="text-[10.5px] text-gray-600 leading-snug">{scheme.description}</p>
                          <div className="mt-1 text-[9.5px] text-emerald-800 font-medium">
                            Eligibility: {scheme.eligibility}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Concessional Savings Bento */}
                    <div className="p-3 bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-2xl space-y-2 shadow-xs">
                      <div className="grid grid-cols-2 gap-2 text-xs border-b border-white/10 pb-2">
                        <div>
                          <div className="text-[9.5px] uppercase tracking-wider text-emerald-200 font-semibold">Subsidized Down Payment (15%)</div>
                          <div className="font-mono font-bold text-white text-xs">
                            {formatCurrency(govDownPaymentAmount, config.currency, { ratesMap: config.exchangeRates })}
                          </div>
                        </div>
                        <div>
                          <div className="text-[9.5px] uppercase tracking-wider text-emerald-200 font-semibold">Concessional Loan Term</div>
                          <div className="font-mono font-bold text-white text-xs">20 Years @ {isGHS ? '11.5% p.a.' : '6.5% p.a.'}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-0.5">
                        <div>
                          <div className="text-[10px] uppercase font-bold text-emerald-200 flex items-center gap-1">
                            <Percent className="w-3 h-3 text-amber-300" />
                            <span>Concessional Monthly Installment</span>
                          </div>
                          <div className="text-[10px] text-amber-300 font-semibold">
                            Saves ~{formatCurrency(monthlySubsidySavings, config.currency, { ratesMap: config.exchangeRates })}/mo vs commercial rates!
                          </div>
                        </div>
                        <div className="font-mono font-black text-amber-300 text-base sm:text-lg">
                          ~{formatCurrency(govEstimatedMonthly, config.currency, { ratesMap: config.exchangeRates })}<span className="text-xs text-white/80 font-normal">/mo</span>
                        </div>
                      </div>
                    </div>

                    {/* Government Scheme Applicant Input */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-gray-700">
                        Ghana Card, SSNIT Contributor ID, or Staff ID <span className="text-gray-400 font-normal">(Optional for pre-screening)</span>:
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. GHA-123456789-0 or SSNIT # / Ministry Staff ID"
                        value={applicantIdOrSsnit}
                        onChange={(e) => setApplicantIdOrSsnit(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-xs text-gray-900 bg-white"
                      />
                    </div>

                    {/* Subsidy Screening Checkbox */}
                    <label className="flex items-start gap-2.5 p-2.5 bg-white rounded-xl border border-emerald-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={requestGovSubsidyScreening}
                        onChange={(e) => setRequestGovSubsidyScreening(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500/30 border-gray-300 accent-emerald-600 cursor-pointer"
                      />
                      <div className="text-[11px] leading-snug text-gray-700">
                        <span className="font-bold text-gray-950">Apply for Government Housing Scheme / NHF subsidy verification.</span>
                        <div className="text-[10px] text-gray-500 mt-0.5">
                          10Apples will submit your architectural specifications to the National Housing and Mortgage Fund window. Your {formatCurrency(reservationFee, config.currency, { ratesMap: config.exchangeRates })} deposit secures your slot while scheme eligibility is verified.
                        </div>
                      </div>
                    </label>
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: LOGISTICS EXTRAS, REVIEW & PRODUCTION LOCK-IN */}
            {formStep === 4 && (
              <div className="space-y-3.5 animate-in fade-in slide-in-from-right-2 duration-200">
                <div className="flex items-center justify-between pb-1 border-b border-gray-100">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Review Contract &amp; Lock Production Slot</span>
                    </h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Verify turnkey services, configuration summary, and risk-free deposit.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                    Step 4 / 4
                  </span>
                </div>

                {/* Turnkey Delivery & Foundation Options */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-orange-600" />
                      <span>Turnkey Logistics Inclusions</span>
                    </span>
                    <span className="text-[10px] text-gray-500 font-medium">Uncheck if self-managing</span>
                  </div>

                  {/* Flatbed Freight Transport */}
                  <label className={`flex items-start justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                    includeFreight
                      ? 'border-orange-500 bg-orange-50/20 ring-1 ring-orange-500/20 shadow-2xs'
                      : 'border-gray-200 bg-gray-50/70 hover:bg-gray-100 opacity-80'
                  }`}>
                    <div className="flex items-start gap-2.5">
                      <input
                        type="checkbox"
                        checked={includeFreight}
                        onChange={(e) => handleToggleFreight(e.target.checked)}
                        className="mt-1 w-4 h-4 rounded text-orange-600 focus:ring-orange-500/30 border-gray-300 accent-orange-600 cursor-pointer"
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-gray-900 text-xs">Flatbed Freight Transport</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            includeFreight ? 'text-orange-700 bg-orange-100' : 'text-gray-600 bg-gray-200'
                          }`}>
                            {includeFreight ? 'Included in Total' : 'Unchecked (Removed)'}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          Certified flatbed direct transport from staging hub ({selectedCountry.logisticsHub}) to destination.
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <span className={`font-mono font-bold text-xs ${includeFreight ? 'text-gray-900' : 'line-through text-gray-400'}`}>
                        +{formatCurrency(freightAmount, config.currency, { ratesMap: config.exchangeRates })}
                      </span>
                      {!includeFreight && (
                        <div className="text-[10px] text-emerald-600 font-bold">Unchecked ($0)</div>
                      )}
                    </div>
                  </label>

                  {/* Foundation & Utility Hookup */}
                  <label className={`flex items-start justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                    includeSitePrep
                      ? 'border-orange-500 bg-orange-50/20 ring-1 ring-orange-500/20 shadow-2xs'
                      : 'border-gray-200 bg-gray-50/70 hover:bg-gray-100 opacity-80'
                  }`}>
                    <div className="flex items-start gap-2.5">
                      <input
                        type="checkbox"
                        checked={includeSitePrep}
                        onChange={(e) => handleToggleSitePrep(e.target.checked)}
                        className="mt-1 w-4 h-4 rounded text-orange-600 focus:ring-orange-500/30 border-gray-300 accent-orange-600 cursor-pointer"
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-gray-900 text-xs">Foundation &amp; Utility Hookup</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            includeSitePrep ? 'text-orange-700 bg-orange-100' : 'text-gray-600 bg-gray-200'
                          }`}>
                            {includeSitePrep ? 'Included in Total' : 'Unchecked (Removed)'}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          Certified local installation crew, ground leveling, foundation tie-downs, and plumbing/electrical hookups.
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <span className={`font-mono font-bold text-xs ${includeSitePrep ? 'text-gray-900' : 'line-through text-gray-400'}`}>
                        +{formatCurrency(sitePrepAmount, config.currency, { ratesMap: config.exchangeRates })}
                      </span>
                      {!includeSitePrep && (
                        <div className="text-[10px] text-emerald-600 font-bold">Unchecked ($0)</div>
                      )}
                    </div>
                  </label>

                  {/* Dynamic Savings Notification */}
                  {(!includeFreight || !includeSitePrep) && (
                    <div className="p-2.5 rounded-xl bg-emerald-50/90 border border-emerald-200 text-xs flex items-center justify-between text-emerald-950">
                      <span className="flex items-center gap-1.5 font-bold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Extra Cost Deducted:</span>
                      </span>
                      <span className="font-mono font-bold text-[11px] text-emerald-800">
                        Saved {formatCurrency((!includeFreight ? freightAmount : 0) + (!includeSitePrep ? sitePrepAmount : 0), config.currency, { ratesMap: config.exchangeRates })}
                      </span>
                    </div>
                  )}
                </div>

                {/* Final Order Review Summary Bento */}
                <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-2xl space-y-2 text-xs">
                  <div className="flex justify-between items-center text-gray-700">
                    <span className="font-semibold">Reserved Model:</span>
                    <span className="font-bold text-gray-950">{currentModel.name}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-700">
                    <span className="font-semibold">Recipient:</span>
                    <span className="text-gray-900">{formData.fullName} ({formData.phone})</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-700">
                    <span className="font-semibold">Destination Route:</span>
                    <span className="text-gray-900 font-mono text-[11px] truncate max-w-[200px]">
                      {resolvedDistrict}, {selectedCountry.name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-gray-700">
                    <span className="font-semibold">Payment / Funding Plan:</span>
                    <span className="font-bold text-orange-700">
                      {paymentOption === 'milestone' && 'Milestone Plan (4 Tranches)'}
                      {paymentOption === 'full' && 'Full Turnkey Invoice'}
                      {paymentOption === 'bank_mortgage' && `Bank Mortgage (${mortgageBank})`}
                      {paymentOption === 'gov_scheme' && 'Gov Housing Scheme (NHF)'}
                    </span>
                  </div>

                  {paymentOption === 'bank_mortgage' && (
                    <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="font-bold text-blue-900 flex items-center gap-1">
                          <Landmark className="w-3.5 h-3.5 text-blue-700" />
                          <span>Pre-Qualification ({mortgageBank}):</span>
                        </span>
                        <span className="font-mono font-bold text-blue-800">
                          ~{formatCurrency(bankEstimatedMonthly, config.currency, { ratesMap: config.exchangeRates })}/mo
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-600 flex justify-between">
                        <span>{mortgageTenure} Yrs tenure • {mortgageDownPaymentPct}% down payment</span>
                        <span className="text-blue-700 font-semibold">{requestBankPreApproval ? 'Dossier Forwarding Active' : 'Self Arranged'}</span>
                      </div>
                    </div>
                  )}

                  {paymentOption === 'gov_scheme' && (
                    <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="font-bold text-emerald-950 flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-emerald-700" />
                          <span>NHF Subsidized Concessional Rate:</span>
                        </span>
                        <span className="font-mono font-bold text-emerald-800">
                          ~{formatCurrency(govEstimatedMonthly, config.currency, { ratesMap: config.exchangeRates })}/mo
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-600 flex justify-between">
                        <span>20 Yrs @ {isGHS ? '11.5%' : '6.5%'} • Saves ~{formatCurrency(monthlySubsidySavings, config.currency, { ratesMap: config.exchangeRates })}/mo</span>
                        <span className="text-emerald-700 font-semibold">Priority Window Active</span>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-gray-200 flex justify-between items-center text-sm font-black text-gray-950">
                    <span>Total Turnkey Investment:</span>
                    <span className="font-mono text-orange-700">
                      {formatCurrency(checkoutTotal, config.currency, { ratesMap: config.exchangeRates })}
                    </span>
                  </div>
                </div>

                {/* Refundable Guarantee Notice */}
                <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-start gap-2.5 text-[11px] text-emerald-950">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <span className="font-bold text-emerald-900">100% Risk-Free Guarantee:</span> Your {formatCurrency(reservationFee, config.currency, { ratesMap: config.exchangeRates })}{' '}
                    reservation deposit locks in priority manufacturing queue placement and is fully refundable anytime prior to factory assembly initiation.
                  </div>
                </div>
              </div>
            )}

            {/* STEPPER NAVIGATION BAR */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
              {formStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold text-xs transition-colors cursor-pointer shrink-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              ) : (
                <div className="text-[11px] text-gray-400 font-medium">
                  Step 1 of 4: Contact
                </div>
              )}

              {formStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  style={{ backgroundColor: primaryColor }}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg cursor-pointer hover:opacity-95 active:scale-[0.99]"
                >
                  <span>Continue to {STEP_CONFIG[formStep].title}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ backgroundColor: primaryColor }}
                  className="flex-1 inline-flex items-center justify-between gap-3 px-5 py-3 hover:opacity-95 text-white rounded-xl transition-all cursor-pointer disabled:opacity-50 shadow-md hover:shadow-lg active:scale-[0.99]"
                >
                  <div className="flex items-center gap-2 text-left">
                    <CreditCard className="w-4 h-4 text-white shrink-0" />
                    <div>
                      <div className="font-extrabold text-xs uppercase tracking-wider">
                        {isSubmitting ? 'Securing Slot...' : `Place ${formatCurrency(reservationFee, config.currency, { ratesMap: config.exchangeRates })} Deposit`}
                      </div>
                      <div className="text-[9px] text-white/80 font-mono">
                        100% Fully Refundable
                      </div>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-1 font-bold text-xs uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-lg border border-white/30 shrink-0">
                    <span>Lock Slot</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              )}
            </div>
          </form>
        ) : (
          <div className="p-4 sm:p-7 text-center space-y-4 overflow-y-auto flex-1 overscroll-contain scroll-smooth">
            {/* Success Celebration Badge */}
            <div className="relative inline-flex items-center justify-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm ring-4 ring-emerald-50">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 text-white text-[9px] font-black items-center justify-center">
                  ✓
                </span>
              </span>
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-black uppercase tracking-wider mb-1">
                <span>Intake Confirmed</span>
                <span>•</span>
                <span>Priority Slot Assigned</span>
              </div>
              <h4 className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight">
                Production Slot Reserved!
              </h4>
              <p className="text-xs text-gray-600 max-w-md mx-auto leading-relaxed">
                Thank you, <span className="font-bold text-gray-900">{formData.fullName || 'Customer'}</span>.
                Your custom {currentModel.name} order has been queued. Confirmation and
                manufacturing scheduling details have been dispatched to{' '}
                <span className="font-mono font-bold text-orange-600">{formData.email || 'your email'}</span>.
              </p>
            </div>

            {/* Order Reference Bento Card */}
            <div className="p-4 bg-[#F8F9FB] border border-gray-200 rounded-2xl text-left text-xs space-y-3 font-sans shadow-2xs">
              <div className="flex justify-between items-center pb-2.5 border-b border-gray-200/80 flex-wrap gap-2">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Order Reference
                  </span>
                  <span className="font-mono font-black text-sm text-gray-950">
                    {createdOrderId}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyOrderId}
                  className="px-2.5 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
                  title="Copy Order Reference ID"
                >
                  {copiedOrderId ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-gray-500" />
                      <span>Copy ID</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-white rounded-xl border border-gray-200/80">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Funding Pathway
                  </span>
                  <span className="font-bold text-orange-700 block mt-0.5 truncate">
                    {paymentOption === 'milestone' && 'Milestone Plan (4 Tranches)'}
                    {paymentOption === 'full' && 'Full Turnkey Invoice'}
                    {paymentOption === 'bank_mortgage' && `Bank Mortgage (${mortgageBank})`}
                    {paymentOption === 'gov_scheme' && 'Gov Housing Scheme (NHF)'}
                  </span>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-gray-200/80">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Estimated Ready
                  </span>
                  <span className="font-bold text-gray-900 block mt-0.5">
                    {currentModel.leadTime || '10-12 Weeks'}
                  </span>
                </div>
              </div>

              <div className="p-2.5 bg-white rounded-xl border border-gray-200/80 text-xs">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Delivery Destination Route
                </span>
                <span className="font-bold text-gray-900 truncate block mt-0.5">
                  {resolvedDistrict}, {subdivisionName} ({selectedCountry.flag} {selectedCountry.name})
                </span>
              </div>

              {/* Milestone Breakdown if Milestone Plan */}
              {paymentOption === 'milestone' && (
                <div className="p-3 rounded-xl bg-orange-50/50 border border-orange-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-orange-900 tracking-wider">
                      Scheduled Milestone Tranches
                    </span>
                    <span className="text-[10px] text-orange-700 font-mono font-bold">
                      Pay as Built
                    </span>
                  </div>
                  <div className="space-y-1.5 text-[11px] font-mono">
                    <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-orange-100">
                      <span className="text-gray-700 font-sans font-medium">1. House Build (Separate):</span>
                      <span className="font-bold text-emerald-700">
                        {formatCurrency(totalPrice, config.currency, { ratesMap: config.exchangeRates })}{' '}
                        <span className="text-[9px] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">Deposit Paid</span>
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-orange-100">
                      <span className="text-gray-700 font-sans font-medium">2. Ocean Freight:</span>
                      <span className="font-bold text-gray-900">
                        {formatCurrency(activeFreightCost, config.currency, { ratesMap: config.exchangeRates })}{' '}
                        <span className="text-[9px] text-gray-400 font-sans">Post-factory</span>
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-orange-100">
                      <span className="text-gray-700 font-sans font-medium">3. Clearing &amp; Transit:</span>
                      <span className="font-bold text-gray-900">
                        {formatCurrency(activeClearingCost, config.currency, { ratesMap: config.exchangeRates })}{' '}
                        <span className="text-[9px] text-gray-400 font-sans">Port arrival</span>
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-orange-100">
                      <span className="text-gray-700 font-sans font-medium">4. Site Installation:</span>
                      <span className="font-bold text-gray-900">
                        {formatCurrency(activeInstallationCost, config.currency, { ratesMap: config.exchangeRates })}{' '}
                        <span className="text-[9px] text-gray-400 font-sans">On site</span>
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Bank Mortgage Breakdown */}
              {paymentOption === 'bank_mortgage' && (
                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-left space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase text-blue-950 tracking-wider flex items-center gap-1.5">
                      <Landmark className="w-3.5 h-3.5 text-blue-700" />
                      <span>Bank Mortgage Pre-Qualification</span>
                    </span>
                    <span className="text-[10px] text-blue-800 font-mono font-bold bg-white px-2 py-0.5 rounded border border-blue-200">
                      {mortgageBank}
                    </span>
                  </div>
                  <div className="space-y-1 text-[11px] text-gray-700">
                    <div className="flex justify-between bg-white p-2 rounded-lg border border-blue-100">
                      <span className="font-medium">Estimated Monthly Installment:</span>
                      <span className="font-mono font-bold text-blue-800">~{formatCurrency(bankEstimatedMonthly, config.currency, { ratesMap: config.exchangeRates })}/mo</span>
                    </div>
                    <div className="flex justify-between bg-white p-2 rounded-lg border border-blue-100 text-[10.5px]">
                      <span>Tenure &amp; Down Payment:</span>
                      <span className="font-semibold text-gray-900">{mortgageTenure} Years • {mortgageDownPaymentPct}% Down ({formatCurrency(bankDownPaymentAmount, config.currency, { ratesMap: config.exchangeRates })})</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-500 leading-snug">
                    A 10Apples mortgage coordinator will reach out within 24-48 hours to assemble your income verification documents and liaise directly with {mortgageBank}.
                  </p>
                </div>
              )}

              {/* Government Housing Scheme Breakdown */}
              {paymentOption === 'gov_scheme' && (
                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-left space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase text-emerald-950 tracking-wider flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-emerald-700" />
                      <span>National Housing Scheme (NHF) Intake</span>
                    </span>
                    <span className="text-[10px] text-emerald-800 font-bold bg-white px-2 py-0.5 rounded border border-emerald-200">
                      11.5% Subsidized
                    </span>
                  </div>
                  <div className="space-y-1 text-[11px] text-gray-700">
                    <div className="flex justify-between bg-white p-2 rounded-lg border border-emerald-100">
                      <span className="font-medium">Concessional Monthly Installment:</span>
                      <span className="font-mono font-bold text-emerald-800">~{formatCurrency(govEstimatedMonthly, config.currency, { ratesMap: config.exchangeRates })}/mo</span>
                    </div>
                    <div className="flex justify-between bg-white p-2 rounded-lg border border-emerald-100 text-[10.5px]">
                      <span>Concessional Benefit:</span>
                      <span className="font-semibold text-emerald-700">Saves ~{formatCurrency(monthlySubsidySavings, config.currency, { ratesMap: config.exchangeRates })}/mo vs commercial rates</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-500 leading-snug">
                    Your reservation has been registered for the public sector / NHF subsidy window. Our housing liaison will verify your civil service / SSNIT contributor credentials.
                  </p>
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-xs font-bold text-gray-700">Total Turnkey Investment:</span>
                <span className="font-mono font-black text-orange-700 text-sm sm:text-base">
                  {formatCurrency(checkoutTotal, config.currency, { ratesMap: config.exchangeRates })}
                </span>
              </div>
            </div>

            {/* Action Buttons: Go to Dashboard or Return */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/user-dashboard');
                }}
                className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl text-xs transition-all shadow-xs hover:shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <User className="w-3.5 h-3.5" />
                <span>Go to User Dashboard</span>
                <ExternalLink className="w-3 h-3 opacity-80" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-2xl text-xs transition-colors cursor-pointer"
              >
                Return to Configurator
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

