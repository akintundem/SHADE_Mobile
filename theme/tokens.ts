export type ThemeColors = {
  bg: string;
  surface: string;
  card: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  tint: string; // primary accent color
  scrim: string; // overlay/sheet background
};

// Base palette (mostly black/white neutrals)
const palette = {
  white: '#FFFFFF',
  black: '#000000',
  neutral50: '#F9FAFB',
  neutral100: '#F3F4F6',
  neutral200: '#E5E7EB',
  neutral300: '#D1D5DB',
  neutral600: '#4B5563',
  neutral700: '#374151',
  neutral800: '#1F2937',
  neutral900: '#111827',
};

export const lightColors: ThemeColors = {
  bg: palette.white,
  surface: palette.white,
  card: palette.neutral50,
  border: palette.neutral200,
  textPrimary: palette.neutral900,
  textSecondary: '#6B7280',
  tint: palette.neutral900, // primary accent in light mode is near-black
  scrim: '#00000066',
};

export const darkColors: ThemeColors = {
  bg: palette.black,
  surface: '#0B0F14',
  card: palette.neutral900,
  border: palette.neutral800,
  textPrimary: palette.neutral50,
  textSecondary: '#9CA3AF',
  tint: palette.white, // primary accent in dark mode is white
  scrim: '#00000066',
};


