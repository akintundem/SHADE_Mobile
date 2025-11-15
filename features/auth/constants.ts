export const AUTH_MODES = {
  SIGN_IN: 'signIn',
  SIGN_UP: 'signUp',
  COMPLETE_PROFILE: 'completeProfile',
  RESET_PASSWORD: 'resetPassword',
  VERIFY_EMAIL: 'verifyEmail',
} as const;

export type AuthMode = typeof AUTH_MODES[keyof typeof AUTH_MODES];

export const DEV_USER = {
  id: 'spotify-dev',
  email: 'dev+spotify@auree.app',
  name: 'Auree Tester',
  provider: 'spotify' as const,
};

