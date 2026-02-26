/**
 * Card validation (Luhn, expiry, CVC).
 * Used only on device; full card number is never sent to the backend.
 */

const LUHN_MOD = 10;

/** Luhn (mod 10) check. Input: digits only. */
export function luhnCheck(digits: string): boolean {
  const s = digits.replace(/\D/g, '');
  if (s.length < 13 || s.length > 19) return false;
  let sum = 0;
  let alternate = false;
  for (let i = s.length - 1; i >= 0; i--) {
    let n = parseInt(s[i], 10);
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }
  return sum % LUHN_MOD === 0;
}

/** Validate card number (digits only, 13–19 digits, Luhn). */
export function validateCardNumber(number: string): { valid: boolean; message?: string } {
  const digits = number.replace(/\D/g, '');
  if (digits.length < 13) return { valid: false, message: 'Card number too short' };
  if (digits.length > 19) return { valid: false, message: 'Card number too long' };
  if (!/^\d+$/.test(digits)) return { valid: false, message: 'Invalid characters' };
  if (!luhnCheck(digits)) return { valid: false, message: 'Invalid card number' };
  return { valid: true };
}

/** Validate expiry MM/YY. Month 01–12, year >= current. */
export function validateExpiry(month: string, year: string): { valid: boolean; message?: string } {
  const m = parseInt(month, 10);
  const y = parseInt(year.length === 2 ? `20${year}` : year, 10);
  if (Number.isNaN(m) || m < 1 || m > 12) return { valid: false, message: 'Invalid month' };
  if (Number.isNaN(y) || y < 2000 || y > 2100) return { valid: false, message: 'Invalid year' };
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  if (y < currentYear || (y === currentYear && m < currentMonth)) {
    return { valid: false, message: 'Card has expired' };
  }
  return { valid: true };
}

/** Validate CVC (3 or 4 digits). */
export function validateCvc(cvc: string): { valid: boolean; message?: string } {
  const s = cvc.replace(/\D/g, '');
  if (s.length < 3) return { valid: false, message: 'CVV too short' };
  if (s.length > 4) return { valid: false, message: 'CVV too long' };
  if (!/^\d+$/.test(s)) return { valid: false, message: 'Invalid CVV' };
  return { valid: true };
}

/** Format card number with spaces (e.g. 4242 4242 4242 4242). */
export function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 19);
  const groups: string[] = [];
  for (let i = 0; i < digits.length; i += 4) {
    groups.push(digits.slice(i, i + 4));
  }
  return groups.join(' ');
}

/** Parse MM/YY input into { month, year }. */
export function parseExpiry(value: string): { month: string; year: string } {
  const cleaned = value.replace(/\D/g, '');
  let month = cleaned.slice(0, 2);
  let year = cleaned.slice(2, 4);
  if (cleaned.length >= 4) year = cleaned.slice(2, 4);
  if (month.length === 1 && parseInt(month, 10) > 1) month = `0${month}`;
  if (month === '00') month = '';
  return { month, year };
}

/** Format expiry as MM/YY. */
export function formatExpiry(month: string, year: string): string {
  if (!month) return '';
  if (!year) return month;
  return `${month}/${year}`;
}

/** Get last 4 digits from raw number. */
export function getLast4(number: string): string {
  return number.replace(/\D/g, '').slice(-4);
}

/** Simple brand hint from first digit (optional). */
export function getCardBrandHint(number: string): string {
  const first = number.replace(/\D/g, '')[0];
  switch (first) {
    case '4': return 'Visa';
    case '5': return 'Mastercard';
    case '3': return 'Amex';
    case '6': return 'Discover';
    default: return 'Card';
  }
}
