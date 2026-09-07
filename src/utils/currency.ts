export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  locale: string;
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyInfo> = {
  GHS: { code: 'GHS', symbol: 'GH₵', name: 'Ghana Cedi', locale: 'en-GH' },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
  CAD: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', locale: 'en-CA' },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU' },
  NGN: { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', locale: 'en-NG' },
  ZAR: { code: 'ZAR', symbol: 'R', name: 'South African Rand', locale: 'en-ZA' },
  KES: { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', locale: 'en-KE' },
  EGP: { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound', locale: 'en-EG' },
};

export function normalizeCurrency(curr?: string): string {
  if (!curr) return 'USD';
  const c = curr.trim().toUpperCase();
  if (c === 'CEDIS' || c === 'CEDI' || c === 'GHC' || c === 'GH₵') return 'GHS';
  if (c === 'DOLLAR' || c === 'DOLLARS' || c === 'US' || c === '$') return 'USD';
  if (c === 'EURO' || c === 'EUROS' || c === '€') return 'EUR';
  if (c === 'POUND' || c === 'POUNDS' || c === '£') return 'GBP';
  return c;
}

export function getCurrencySymbol(curr?: string): string {
  const code = normalizeCurrency(curr);
  return SUPPORTED_CURRENCIES[code]?.symbol || code;
}

export function formatCurrency(
  val: number,
  curr?: string,
  options?: { showPlus?: boolean; maximumFractionDigits?: number }
): string {
  const code = normalizeCurrency(curr);
  const info = SUPPORTED_CURRENCIES[code];
  const locale = info?.locale || 'en-US';
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
    const symbol = info?.symbol || code;
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
