import { PasswordValidationResult } from '../types';

/**
 * Email validation regex
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Username validation regex (3-30 chars, letters, numbers, '.', '_', can't start/end with '.' or '_')
 */
const USERNAME_REGEX = /^(?![._])(?!.*[._]$)[a-zA-Z0-9._]{3,30}$/;

/**
 * Phone number validation regex
 */
const PHONE_REGEX = /^\+?[0-9 .-]{7,20}$/;

/**
 * Validates an email address
 */
export function isValidEmail(email: string): boolean {
  const trimmed = email.trim();
  return trimmed.length > 0 && EMAIL_REGEX.test(trimmed);
}

/**
 * Validates a username
 */
export function isValidUsername(username: string): boolean {
  const trimmed = username.trim();
  return USERNAME_REGEX.test(trimmed);
}

/**
 * Validates a phone number
 */
export function isValidPhoneNumber(phoneNumber: string): boolean {
  const trimmed = phoneNumber.trim();
  return PHONE_REGEX.test(trimmed);
}

/**
 * Validates a name (2-100 characters, no HTML tags)
 */
export function isValidName(name: string): boolean {
  const trimmed = name.trim();
  const hasHtmlTags = /<[^>]*>/g.test(trimmed);
  return trimmed.length >= 2 && trimmed.length <= 100 && !hasHtmlTags;
}

/**
 * Password requirement checkers
 */
const passwordChecks = {
  length: (pwd: string) => pwd.length >= 8 && pwd.length <= 128,
  hasLowercase: (pwd: string) => /[a-z]/.test(pwd),
  hasUppercase: (pwd: string) => /[A-Z]/.test(pwd),
  hasDigit: (pwd: string) => /\d/.test(pwd),
  hasSpecialChar: (pwd: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(pwd),
};

/**
 * Validates a password and returns detailed requirements status
 */
export function validatePassword(password: string): PasswordValidationResult {
  const requirements = {
    length: passwordChecks.length(password),
    hasLowercase: passwordChecks.hasLowercase(password),
    hasUppercase: passwordChecks.hasUppercase(password),
    hasDigit: passwordChecks.hasDigit(password),
    hasSpecialChar: passwordChecks.hasSpecialChar(password),
  };

  const isValid = Object.values(requirements).every(Boolean);

  return { isValid, requirements };
}

/**
 * Checks if two passwords match
 */
export function doPasswordsMatch(password: string, confirmPassword: string): boolean {
  return password === confirmPassword;
}

/**
 * Gets the first unmet password requirement (for displaying single error)
 */
export function getFirstUnmetRequirement(
  requirements: PasswordValidationResult['requirements']
): keyof PasswordValidationResult['requirements'] | null {
  if (!requirements.length) return 'length';
  if (!requirements.hasLowercase) return 'hasLowercase';
  if (!requirements.hasUppercase) return 'hasUppercase';
  if (!requirements.hasDigit) return 'hasDigit';
  if (!requirements.hasSpecialChar) return 'hasSpecialChar';
  return null;
}
