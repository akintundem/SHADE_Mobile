/** @type {import('tailwindcss').Config} */
const tokens = require('./common/theme/tokens.json');

const toPx = value => `${value}px`;
const mapScale = scale =>
  Object.fromEntries(Object.entries(scale).map(([key, value]) => [key, typeof value === 'number' ? toPx(value) : value]));

const fontSize = Object.fromEntries(
  Object.entries(tokens.fontSize).map(([key, value]) => [
    key,
    [toPx(value.size), { lineHeight: toPx(value.lineHeight) }],
  ])
);

const light = tokens.colors.light;
const dark = tokens.colors.dark;

const colors = {
  // Brand
  brand: {
    primary: tokens.colors.brand.primary,
    secondary: tokens.colors.brand.secondary,
    'secondary-dark': tokens.colors.brand.secondaryDark,
    'secondary-light': tokens.colors.brand.secondaryLight,
    'primary-dark': tokens.colors.brand.primaryDark,
    'primary-light': tokens.colors.brand.primaryLight,
  },
  // Semantic
  semantic: {
    success: tokens.colors.semantic.success,
    'success-light': tokens.colors.semantic.successLight,
    'success-dark': tokens.colors.semantic.successDark,
    error: tokens.colors.semantic.error,
    'error-light': tokens.colors.semantic.errorLight,
    'error-dark': tokens.colors.semantic.errorDark,
    warning: tokens.colors.semantic.warning,
    'warning-light': tokens.colors.semantic.warningLight,
    'warning-dark': tokens.colors.semantic.warningDark,
    info: tokens.colors.semantic.info,
    'info-light': tokens.colors.semantic.infoLight,
    'info-dark': tokens.colors.semantic.infoDark,
  },
  // Social
  social: tokens.colors.social,
  // Neutral
  neutral: tokens.colors.neutral,
  // Event types
  event: tokens.colors.eventType,
  // Light mode
  light: {
    background: light.background,
    surface: light.surface,
    'surface-elevated': light.surfaceElevated,
    'surface-subtle': light.surfaceSubtle,
    'surface-muted': light.surfaceMuted,
    'surface-soft': light.surfaceSoft,
    'surface-strong': light.surfaceStrong,
    'surface-emphasis': light.surfaceEmphasis,
    card: light.card,
    'card-elevated': light.cardElevated,
    border: light.border,
    'border-light': light.borderLight,
    'border-subtle': light.borderSubtle,
    'border-muted': light.borderMuted,
    'border-strong': light.borderStrong,
    'border-emphasis': light.borderEmphasis,
    divider: light.divider,
    overlay: light.overlay,
    'overlay-light': light.overlayLight,
    'overlay-soft': light.overlaySoft,
    'overlay-strong': light.overlayStrong,
    'overlay-stronger': light.overlayStronger,
    'overlay-strongest': light.overlayStrongest,
  },
  // Dark mode
  dark: {
    background: dark.background,
    surface: dark.surface,
    'surface-elevated': dark.surfaceElevated,
    'surface-subtle': dark.surfaceSubtle,
    'surface-muted': dark.surfaceMuted,
    'surface-soft': dark.surfaceSoft,
    'surface-strong': dark.surfaceStrong,
    'surface-emphasis': dark.surfaceEmphasis,
    card: dark.card,
    'card-elevated': dark.cardElevated,
    border: dark.border,
    'border-light': dark.borderLight,
    'border-subtle': dark.borderSubtle,
    'border-muted': dark.borderMuted,
    'border-strong': dark.borderStrong,
    'border-emphasis': dark.borderEmphasis,
    divider: dark.divider,
    overlay: dark.overlay,
    'overlay-light': dark.overlayLight,
    'overlay-soft': dark.overlaySoft,
    'overlay-strong': dark.overlayStrong,
    'overlay-stronger': dark.overlayStronger,
    'overlay-strongest': dark.overlayStrongest,
  },
  // Text colors
  txt: {
    primary: light.text.primary,
    secondary: light.text.secondary,
    tertiary: light.text.tertiary,
    disabled: light.text.disabled,
    inverse: light.text.inverse,
    'dark-primary': dark.text.primary,
    'dark-secondary': dark.text.secondary,
    'dark-tertiary': dark.text.tertiary,
    'dark-disabled': dark.text.disabled,
    'dark-inverse': dark.text.inverse,
  },
};

module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './features/**/*.{js,jsx,ts,tsx}',
    './common/**/*.{js,jsx,ts,tsx}',
    './main/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors,
      spacing: mapScale(tokens.spacing),
      borderRadius: mapScale(tokens.borderRadius),
      fontSize,
    },
  },
  plugins: [],
};
