// UI-specific auth types
// API types remain in core/auth/types/auth.ts

/**
 * Sign-in error codes returned by useSignIn hook
 */
export type SignInErrorCode =
  | 'PASSWORD_INCORRECT'
  | 'EMAIL_NOT_VERIFIED'
  | 'SIGN_IN_FAILED';

/**
 * Sign-up error codes returned by useSignUp hook
 */
export type SignUpErrorCode =
  | 'NETWORK_ERROR'
  | 'EMAIL_ALREADY_REGISTERED'
  | 'RATE_LIMIT_EXCEEDED'
  | 'VALIDATION_ERROR'
  | 'REGISTRATION_FAILED';

/**
 * Forgot password error codes returned by useForgotPassword hook
 */
export type ForgotPasswordErrorCode =
  | 'NETWORK_ERROR'
  | 'USER_NOT_FOUND'
  | 'RATE_LIMIT_EXCEEDED'
  | 'REQUEST_FAILED';

/**
 * Onboarding error codes returned by useOnboarding hook
 */
export type OnboardingErrorCode =
  | 'USERNAME_TAKEN'
  | 'EMAIL_NOT_VERIFIED'
  | 'EMAIL_MISMATCH'
  | 'IMAGE_UPLOAD_FAILED'
  | 'ONBOARDING_FAILED';

/**
 * Auth state for the AuthProvider context
 */
export type AuthState = {
  user: import('../../../core/auth/types/auth').User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  onboardingRequired: boolean;
};

/**
 * Auth actions available through the AuthProvider context
 */
export type AuthActions = {
  login: (user: import('../../../core/auth/types/auth').User, onboardingRequired: boolean) => void;
  logout: () => Promise<void>;
  completeOnboarding: (user: import('../../../core/auth/types/auth').User) => void;
  refreshUser: () => Promise<void>;
};

/**
 * Password validation result
 */
export type PasswordValidationResult = {
  isValid: boolean;
  requirements: {
    length: boolean;
    hasLowercase: boolean;
    hasUppercase: boolean;
    hasDigit: boolean;
    hasSpecialChar: boolean;
  };
};

/**
 * Onboarding form data
 */
export type OnboardingFormData = {
  name: string;
  username: string;
  phoneNumber: string;
  profileImage: string | null;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  marketingOptIn: boolean;
};
