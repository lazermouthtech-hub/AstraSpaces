import {
  LogisticsConfig,
  LogisticsFeeCategory,
  LogisticsLineItem,
  OrderLogisticsItemSnapshot,
} from '../types';

export interface LogisticsCategoryPreset {
  category: LogisticsFeeCategory;
  label: string;
  shortLabel: string;
  defaultName: string;
  defaultPricingType: 'fixed' | 'percent';
  defaultAmount: number;
  defaultDescription: string;
  badgeClass: string;
}

export const LOGISTICS_CATEGORY_PRESETS: LogisticsCategoryPreset[] = [
  {
    category: 'international_freight',
    label: 'International Freight',
    shortLabel: 'Int’l Freight',
    defaultName: 'International Ocean Freight',
    defaultPricingType: 'fixed',
    defaultAmount: 4500,
    defaultDescription: 'Sealed 40HQ container shipping from factory port to arrival seaport',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    category: 'local_logistics',
    label: 'Local Logistics',
    shortLabel: 'Local Logistics',
    defaultName: 'Local Logistics & Haulage',
    defaultPricingType: 'fixed',
    defaultAmount: 1800,
    defaultDescription: 'Domestic flatbed haulage, port pickup & final-mile transport to site',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  {
    category: 'customs',
    label: 'Customs & Port Clearance',
    shortLabel: 'Customs',
    defaultName: 'Customs & Port Clearance',
    defaultPricingType: 'fixed',
    defaultAmount: 1000,
    defaultDescription: 'Import customs brokerage, port terminal handling & inspection duties',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  {
    category: 'insurance',
    label: 'Insurance',
    shortLabel: 'Insurance',
    defaultName: 'Marine & Transit Insurance',
    defaultPricingType: 'percent',
    defaultAmount: 1.5,
    defaultDescription: 'All-risk ocean & inland cargo coverage up to site handover',
    badgeClass: 'bg-cyan-50 text-cyan-800 border-cyan-200',
  },
  {
    category: 'site_prep',
    label: 'Site Preparation',
    shortLabel: 'Site Prep',
    defaultName: 'Site Preparation & Installation',
    defaultPricingType: 'fixed',
    defaultAmount: 2700,
    defaultDescription: 'Pad leveling, crane placement, wing expansion & utility tie-ins',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    category: 'permits',
    label: 'Local Permission Rates',
    shortLabel: 'Permits',
    defaultName: 'Local Permission & Permit Rates',
    defaultPricingType: 'fixed',
    defaultAmount: 850,
    defaultDescription: 'Municipal building permits, zoning sign-offs & council inspection fees',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  {
    category: 'tax',
    label: 'Local Tax / Duty Rate (%)',
    shortLabel: 'Tax / Levy',
    defaultName: 'Local Tax / VAT Rate',
    defaultPricingType: 'percent',
    defaultAmount: 5,
    defaultDescription: 'Applicable regional sales tax, VAT, or municipal housing levy',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  {
    category: 'other',
    label: 'Custom Pricing Item',
    shortLabel: 'Custom Fee',
    defaultName: 'Custom Service / Logistics Fee',
    defaultPricingType: 'fixed',
    defaultAmount: 500,
    defaultDescription: 'Additional project-specific service or regulatory charge',
    badgeClass: 'bg-gray-100 text-gray-700 border-gray-200',
  },
];

export const getLogisticsPreset = (category: LogisticsFeeCategory): LogisticsCategoryPreset => {
  return (
    LOGISTICS_CATEGORY_PRESETS.find((p) => p.category === category) ||
    LOGISTICS_CATEGORY_PRESETS[LOGISTICS_CATEGORY_PRESETS.length - 1]
  );
};

export function createDefaultLogisticsLineItems(legacy?: {
  freightCost?: number;
  sitePrepCost?: number;
  taxRate?: number;
}): LogisticsLineItem[] {
  const baseFreight = legacy?.freightCost !== undefined ? Number(legacy.freightCost) : 4500;
  const baseSitePrep = legacy?.sitePrepCost !== undefined ? Number(legacy.sitePrepCost) : 5500;
  const baseTaxRate = legacy?.taxRate !== undefined ? Number(legacy.taxRate) : 0;

  // Preserve exact legacy sitePrepCost split smoothly:
  // default 5500 => 1800 local logistics + 1000 customs + 2700 site prep = 5500
  const localLogisticsUsd =
    baseSitePrep === 5500 ? 1800 : Math.round(baseSitePrep * 0.33);
  const customsUsd =
    baseSitePrep === 5500 ? 1000 : Math.round(baseSitePrep * 0.18);
  const sitePrepUsd = Math.max(0, baseSitePrep - localLogisticsUsd - customsUsd);

  return [
    {
      id: 'fee-international-freight',
      name: 'International Ocean Freight',
      category: 'international_freight',
      pricingType: 'fixed',
      amount: baseFreight,
      enabled: baseFreight > 0 || legacy?.freightCost === undefined,
      description: 'Sealed 40HQ container shipping from factory port to arrival seaport',
    },
    {
      id: 'fee-local-logistics',
      name: 'Local Logistics & Haulage',
      category: 'local_logistics',
      pricingType: 'fixed',
      amount: localLogisticsUsd,
      enabled: localLogisticsUsd > 0 || legacy?.sitePrepCost === undefined,
      description: 'Domestic flatbed haulage, port pickup & final-mile transport to site',
    },
    {
      id: 'fee-customs-clearance',
      name: 'Customs & Port Clearance',
      category: 'customs',
      pricingType: 'fixed',
      amount: customsUsd,
      enabled: customsUsd > 0 || legacy?.sitePrepCost === undefined,
      description: 'Import customs brokerage, port terminal handling & inspection duties',
    },
    {
      id: 'fee-site-prep',
      name: 'Site Preparation & Installation',
      category: 'site_prep',
      pricingType: 'fixed',
      amount: sitePrepUsd,
      enabled: sitePrepUsd > 0 || legacy?.sitePrepCost === undefined,
      description: 'Pad leveling, crane placement, wing expansion & utility tie-ins',
    },
    {
      id: 'fee-transit-insurance',
      name: 'Marine & Transit Insurance',
      category: 'insurance',
      pricingType: 'percent',
      amount: 1.5,
      enabled: false,
      description: 'All-risk ocean & inland cargo coverage up to site handover',
    },
    {
      id: 'fee-local-permits',
      name: 'Local Permission & Permit Rates',
      category: 'permits',
      pricingType: 'fixed',
      amount: 850,
      enabled: false,
      description: 'Municipal building permits, zoning sign-offs & council inspection fees',
    },
    {
      id: 'fee-local-tax',
      name: 'Local Tax / VAT Rate',
      category: 'tax',
      pricingType: 'percent',
      amount: baseTaxRate,
      enabled: baseTaxRate > 0,
      description: 'Applicable regional sales tax, VAT, or municipal housing levy',
    },
  ];
}

export function getLogisticsLineItems(logistics?: Partial<LogisticsConfig> | null): LogisticsLineItem[] {
  if (logistics?.lineItems && Array.isArray(logistics.lineItems)) {
    return logistics.lineItems.map((item) => ({
      ...item,
      pricingType: item.pricingType === 'percent' ? 'percent' : 'fixed',
      amount: Number.isFinite(Number(item.amount)) ? Number(item.amount) : 0,
      enabled: item.enabled !== false,
    }));
  }
  return createDefaultLogisticsLineItems({
    freightCost: logistics?.freightCost,
    sitePrepCost: logistics?.sitePrepCost,
    taxRate: logistics?.taxRate,
  });
}

/**
 * Synchronizes lineItems back onto LogisticsConfig while keeping legacy
 * freightCost, sitePrepCost, and taxRate fields populated accurately.
 */
export function syncLogisticsFromLineItems(
  prevLogistics: Partial<LogisticsConfig> | null | undefined,
  lineItems: LogisticsLineItem[]
): LogisticsConfig {
  const enabledItems = lineItems.filter((item) => item.enabled);

  // Sync fixed/freight estimate for legacy consumers
  const fixedFreight = enabledItems
    .filter((i) => i.category === 'international_freight' && i.pricingType === 'fixed')
    .reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

  const fixedSiteAndLocal = enabledItems
    .filter(
      (i) =>
        i.category !== 'international_freight' &&
        i.category !== 'tax' &&
        i.pricingType === 'fixed'
    )
    .reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

  const totalTaxPct = enabledItems
    .filter((i) => i.category === 'tax' && i.pricingType === 'percent')
    .reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

  return {
    ...(prevLogistics || {}),
    freightCost: Math.round(fixedFreight * 100) / 100,
    sitePrepCost: Math.round(fixedSiteAndLocal * 100) / 100,
    taxRate: Math.round(totalTaxPct * 100) / 100,
    lineItems,
  };
}

export interface ComputedLogisticsItem extends LogisticsLineItem {
  calculatedUsd: number;
}

export interface LogisticsBreakdownResult {
  allItems: LogisticsLineItem[];
  enabledItems: ComputedLogisticsItem[];
  taxItems: ComputedLogisticsItem[];
  serviceAndDeliveryItems: ComputedLogisticsItem[];
  freightStageItems: ComputedLogisticsItem[];
  clearingStageItems: ComputedLogisticsItem[];
  sitePrepStageItems: ComputedLogisticsItem[];
  taxTotalUsd: number;
  effectiveTaxPercent: number;
  freightStageUsd: number;
  clearingTransportStageUsd: number;
  installationPermitsStageUsd: number;
  deliveryAndSiteTotalUsd: number;
  totalLogisticsAndTaxesUsd: number;
  snapshots: OrderLogisticsItemSnapshot[];
}

export function computeLogisticsBreakdown(
  logistics: Partial<LogisticsConfig> | null | undefined,
  houseSubtotalUsd: number
): LogisticsBreakdownResult {
  const allItems = getLogisticsLineItems(logistics);
  const safeSubtotal = Math.max(0, Number(houseSubtotalUsd) || 0);

  const enabledItems: ComputedLogisticsItem[] = allItems
    .filter((item) => item.enabled)
    .map((item) => {
      const rawAmount = Number(item.amount) || 0;
      const calculatedUsd =
        item.pricingType === 'percent' ? (safeSubtotal * rawAmount) / 100 : rawAmount;
      return {
        ...item,
        amount: rawAmount,
        calculatedUsd: Math.max(0, Math.round(calculatedUsd * 100) / 100),
      };
    });

  const taxItems = enabledItems.filter((i) => i.category === 'tax');
  const serviceAndDeliveryItems = enabledItems.filter((i) => i.category !== 'tax');

  const freightStageItems = serviceAndDeliveryItems.filter(
    (i) => i.category === 'international_freight' || i.category === 'insurance'
  );
  const clearingStageItems = serviceAndDeliveryItems.filter(
    (i) => i.category === 'local_logistics' || i.category === 'customs'
  );
  const sitePrepStageItems = serviceAndDeliveryItems.filter(
    (i) => i.category === 'site_prep' || i.category === 'permits' || i.category === 'other'
  );

  const sumUsd = (arr: ComputedLogisticsItem[]) =>
    arr.reduce((acc, i) => acc + i.calculatedUsd, 0);

  const taxTotalUsd = sumUsd(taxItems);
  const effectiveTaxPercent = taxItems
    .filter((i) => i.pricingType === 'percent')
    .reduce((acc, i) => acc + i.amount, 0);

  const freightStageUsd = sumUsd(freightStageItems);
  const clearingTransportStageUsd = sumUsd(clearingStageItems);
  const installationPermitsStageUsd = sumUsd(sitePrepStageItems);
  const deliveryAndSiteTotalUsd =
    freightStageUsd + clearingTransportStageUsd + installationPermitsStageUsd;

  const snapshots: OrderLogisticsItemSnapshot[] = enabledItems.map((i) => ({
    id: i.id,
    name: i.name,
    category: i.category,
    pricingType: i.pricingType,
    rateOrUsdAmount: i.amount,
    calculatedUsdAmount: i.calculatedUsd,
  }));

  return {
    allItems,
    enabledItems,
    taxItems,
    serviceAndDeliveryItems,
    freightStageItems,
    clearingStageItems,
    sitePrepStageItems,
    taxTotalUsd,
    effectiveTaxPercent,
    freightStageUsd,
    clearingTransportStageUsd,
    installationPermitsStageUsd,
    deliveryAndSiteTotalUsd,
    totalLogisticsAndTaxesUsd: deliveryAndSiteTotalUsd + taxTotalUsd,
    snapshots,
  };
}
