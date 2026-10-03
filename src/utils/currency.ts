export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  locale: string;
  label: string;
}

export type PrimaryCurrencyCode = 'USD' | 'GHS';

export const TWO_CURRENCIES: {
  code: PrimaryCurrencyCode;
  symbol: string;
  name: string;
  label: string;
  locale: string;
}[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', label: '$ USD (US Dollar)', locale: 'en-US' },
  { code: 'GHS', symbol: 'GH₵', name: 'Ghana Cedi', label: 'GH₵ GHS (Ghana Cedi)', locale: 'en-GH' },
];

export const SUPPORTED_CURRENCIES: Record<string, CurrencyInfo> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US', label: '$ USD' },
  GHS: { code: 'GHS', symbol: 'GH₵', name: 'Ghana Cedi', locale: 'en-GH', label: 'GH₵ GHS' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE', label: '€ EUR' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB', label: '£ GBP' },
};

export const DEFAULT_USD_TO_GHS_RATE = 15.0;

export function normalizeCurrency(curr?: string): PrimaryCurrencyCode {
  if (!curr) return 'USD';
  const c = curr.trim().toUpperCase();
  if (c === 'CEDIS' || c === 'CEDI' || c === 'GHC' || c === 'GH₵' || c === 'GHS') return 'GHS';
  if (c === 'EUR' || c === 'EUROS' || c === '€') return 'USD'; // unify to primary currency
  if (c === 'GBP' || c === 'POUND') return 'USD';
  return 'USD';
}

export function getCurrencySymbol(curr?: string): string {
  const code = normalizeCurrency(curr);
  return SUPPORTED_CURRENCIES[code]?.symbol || (code === 'GHS' ? 'GH₵' : '$');
}

export function formatCurrency(
  val: number,
  curr?: string,
  options?: { showPlus?: boolean; maximumFractionDigits?: number }
): string {
  const code = normalizeCurrency(curr);
  const info = SUPPORTED_CURRENCIES[code] || SUPPORTED_CURRENCIES.USD;
  const locale = info?.locale || (code === 'GHS' ? 'en-GH' : 'en-US');
  const maxDigits = options?.maximumFractionDigits ?? 0;

  const absVal = Math.abs(val);
  let formatted = '';

  try {
    formatted = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: code,
      maximumFractionDigits: maxDigits,
    }).format(absVal);
  } catch {
    const symbol = info?.symbol || (code === 'GHS' ? 'GH₵' : '$');
    formatted = `${symbol}${absVal.toLocaleString(undefined, { maximumFractionDigits: maxDigits })}`;
  }

  if (val < 0) {
    return `-${formatted}`;
  }
  if (options?.showPlus && val > 0) {
    return `+${formatted}`;
  }
  return formatted;
}

