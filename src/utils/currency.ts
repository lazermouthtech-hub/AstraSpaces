export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  locale: string;
  label: string;
  defaultRate: number; // 1 USD = X Currency
}

export const BASE_CURRENCY_CODE = 'USD';

export const POPULAR_CURRENCIES: CurrencyInfo[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', label: '$ USD (US Dollar)', locale: 'en-US', defaultRate: 1.0 },
  { code: 'GHS', symbol: 'GH₵', name: 'Ghana Cedi', label: 'GH₵ GHS (Ghana Cedi)', locale: 'en-GH', defaultRate: 15.2 },
  { code: 'EUR', symbol: '€', name: 'Euro', label: '€ EUR (European Euro)', locale: 'de-DE', defaultRate: 0.92 },
  { code: 'GBP', symbol: '£', name: 'British Pound', label: '£ GBP (British Pound)', locale: 'en-GB', defaultRate: 0.78 },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', label: 'CA$ CAD (Canadian Dollar)', locale: 'en-CA', defaultRate: 1.36 },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', label: 'A$ AUD (Australian Dollar)', locale: 'en-AU', defaultRate: 1.52 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', label: '¥ JPY (Japanese Yen)', locale: 'ja-JP', defaultRate: 152.0 },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', label: '₦ NGN (Nigerian Naira)', locale: 'en-NG', defaultRate: 1480.0 },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', label: 'KSh KES (Kenyan Shilling)', locale: 'sw-KE', defaultRate: 129.0 },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', label: 'R ZAR (South African Rand)', locale: 'en-ZA', defaultRate: 18.2 },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham', label: 'AED (UAE Dirham)', locale: 'ar-AE', defaultRate: 3.67 },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', label: '¥ CNY (Chinese Yuan)', locale: 'zh-CN', defaultRate: 7.24 },
];

export const TWO_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar', label: '$ USD (US Dollar)', locale: 'en-US' },
  { code: 'GHS', symbol: 'GH₵', name: 'Ghana Cedi', label: 'GH₵ GHS (Ghana Cedi)', locale: 'en-GH' },
];

export const DEFAULT_EXCHANGE_RATES: Record<string, number> = {
  USD: 1.0,
  GHS: 15.2,
  EUR: 0.92,
  GBP: 0.78,
  CAD: 1.36,
  AUD: 1.52,
  JPY: 152.0,
  NGN: 1480.0,
  KES: 129.0,
  ZAR: 18.2,
  AED: 3.67,
  CNY: 7.24,
};

export const SUPPORTED_CURRENCIES: Record<string, CurrencyInfo> = POPULAR_CURRENCIES.reduce(
  (acc, item) => {
    acc[item.code] = item;
    return acc;
  },
  {} as Record<string, CurrencyInfo>
);

export const DEFAULT_USD_TO_GHS_RATE = 15.2;

const STORAGE_RATES_KEY = 'boxabl_exchange_rates';
const RATES_CHANGED_EVENT = 'boxabl_rates_updated';

export function getActiveStoredCurrency(): string {
  if (typeof window === 'undefined') return 'USD';
  try {
    const direct = localStorage.getItem('boxabl_active_currency');
    if (direct && direct.trim()) {
      return direct.trim().toUpperCase();
    }
    const raw = localStorage.getItem('boxabl_app_config');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed?.currency === 'string' && parsed.currency.trim()) {
        return parsed.currency.trim().toUpperCase();
      }
      if (typeof parsed?.currency?.primaryCurrency === 'string' && parsed.currency.primaryCurrency.trim()) {
        return parsed.currency.primaryCurrency.trim().toUpperCase();
      }
    }
  } catch (err) {}
  return 'USD';
}

export function getStoredExchangeRates(): Record<string, number> {
  if (typeof window === 'undefined') return DEFAULT_EXCHANGE_RATES;
  try {
    let result = { ...DEFAULT_EXCHANGE_RATES };
    const raw = localStorage.getItem(STORAGE_RATES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      result = { ...result, ...parsed };
    }
    const cfgRaw = localStorage.getItem('boxabl_app_config');
    if (cfgRaw) {
      const cfg = JSON.parse(cfgRaw);
      if (cfg?.exchangeRates && typeof cfg.exchangeRates === 'object') {
        result = { ...result, ...cfg.exchangeRates };
      }
    }
    return { ...result, USD: 1.0 };
  } catch (err) {
    console.error('Failed to parse exchange rates from storage', err);
  }
  return { ...DEFAULT_EXCHANGE_RATES };
}

export function saveStoredExchangeRate(curr: string, rate: number): Record<string, number> {
  const current = getStoredExchangeRates();
  const normalized = normalizeCurrency(curr);
  if (normalized === 'USD') return current; // USD is always 1.0

  const safeRate = Math.max(0.000001, rate);
  const updated = {
    ...current,
    [normalized]: safeRate,
    USD: 1.0,
  };
  try {
    localStorage.setItem(STORAGE_RATES_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(RATES_CHANGED_EVENT, { detail: updated }));
  } catch (err) {
    console.error('Failed to save exchange rate', err);
  }
  return updated;
}

export function getExchangeRate(
  curr?: string,
  runtimeRates?: Record<string, number>
): number {
  const code = normalizeCurrency(curr);
  if (code === 'USD') return 1.0;
  if (runtimeRates && runtimeRates[code] !== undefined && runtimeRates[code] > 0) {
    return runtimeRates[code];
  }
  const stored = getStoredExchangeRates();
  if (stored && stored[code] !== undefined && stored[code] > 0) {
    return stored[code];
  }
  return DEFAULT_EXCHANGE_RATES[code] || 1.0;
}

export function convertUSDToCurrency(
  usdAmount: number,
  targetCurrency?: string,
  customRate?: number,
  runtimeRates?: Record<string, number>
): number {
  if (!usdAmount) return 0;
  const code = normalizeCurrency(targetCurrency);
  if (code === 'USD') return usdAmount;

  const rate =
    customRate !== undefined && customRate > 0
      ? customRate
      : getExchangeRate(code, runtimeRates);

  return Math.round(usdAmount * rate * 100) / 100;
}

export function convertCurrencyToUSD(
  foreignAmount: number,
  sourceCurrency?: string,
  customRate?: number,
  runtimeRates?: Record<string, number>
): number {
  if (!foreignAmount) return 0;
  const code = normalizeCurrency(sourceCurrency);
  if (code === 'USD') return foreignAmount;

  const rate =
    customRate !== undefined && customRate > 0
      ? customRate
      : getExchangeRate(code, runtimeRates);

  if (rate <= 0) return foreignAmount;
  return Math.round((foreignAmount / rate) * 100) / 100;
}

export function normalizeCurrency(curr?: any): string {
  if (curr === undefined || curr === null || curr === '') {
    return getActiveStoredCurrency();
  }
  if (typeof curr === 'object') {
    const nested = curr.currency || curr.primaryCurrency || curr.code;
    if (nested) return normalizeCurrency(nested);
    return getActiveStoredCurrency();
  }
  const c = String(curr).trim().toUpperCase();
  if (c === 'CEDIS' || c === 'CEDI' || c === 'GHC' || c === 'GH₵') return 'GHS';
  if (c === 'DOLLAR' || c === 'DOLLARS' || c === '$') return 'USD';
  if (c === 'EUROS' || c === '€') return 'EUR';
  if (c === 'POUNDS' || c === 'POUND' || c === '£') return 'GBP';
  if (c === 'YEN' || c === '¥') return 'JPY';
  if (c === 'NAIRA' || c === '₦') return 'NGN';
  return c || getActiveStoredCurrency();
}

export type PrimaryCurrencyCode = string;

export function getCurrencySymbol(curr?: string): string {
  const code = normalizeCurrency(curr);
  return SUPPORTED_CURRENCIES[code]?.symbol || (code === 'GHS' ? 'GH₵' : code === 'EUR' ? '€' : code === 'GBP' ? '£' : '$');
}

export function formatCurrency(
  val: number,
  curr?: any,
  options?: {
    showPlus?: boolean;
    maximumFractionDigits?: number;
    isAlreadyConverted?: boolean;
    customRate?: number;
    ratesMap?: Record<string, number>;
  }
): string {
  const code = normalizeCurrency(curr);
  const info = SUPPORTED_CURRENCIES[code] || {
    code,
    symbol: code === 'GHS' ? 'GH₵' : code === 'EUR' ? '€' : code === 'GBP' ? '£' : '$',
    name: code,
    locale: code === 'GHS' ? 'en-GH' : 'en-US',
    label: code,
    defaultRate: 1.0,
  };

  // Convert from USD if needed
  let amount = val;
  if (!options?.isAlreadyConverted && code !== 'USD') {
    amount = convertUSDToCurrency(val, code, options?.customRate, options?.ratesMap);
  }

  const locale = info.locale || (code === 'GHS' ? 'en-GH' : 'en-US');
  const maxDigits = options?.maximumFractionDigits ?? 0;
  const absVal = Math.abs(amount);
  let formatted = '';

  try {
    formatted = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: code,
      maximumFractionDigits: maxDigits,
    }).format(absVal);
  } catch {
    const symbol = info.symbol || (code === 'GHS' ? 'GH₵' : '$');
    formatted = `${symbol}${absVal.toLocaleString(undefined, { maximumFractionDigits: maxDigits })}`;
  }

  if (amount < 0) {
    return `-${formatted}`;
  }
  if (options?.showPlus && amount > 0) {
    return `+${formatted}`;
  }
  return formatted;
}

