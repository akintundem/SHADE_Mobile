/**
 * Shade Design System
 * A comprehensive design system for premium private event sharing
 */

import tokens from './tokens.json';

export const Colors = tokens.colors;
export const Spacing = tokens.spacing;
export const BorderRadius = tokens.borderRadius;
const fontSizeTokens = tokens.fontSize;

export const Typography = {
  // Font Families (React Native defaults)
  family: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },

  // Font Sizes
  size: {
    xs: fontSizeTokens.xs.size,
    sm: fontSizeTokens.sm.size,
    base: fontSizeTokens.base.size,
    lg: fontSizeTokens.lg.size,
    xl: fontSizeTokens.xl.size,
    '2xl': fontSizeTokens['2xl'].size,
    '3xl': fontSizeTokens['3xl'].size,
    '4xl': fontSizeTokens['4xl'].size,
    '5xl': fontSizeTokens['5xl'].size,
    '6xl': fontSizeTokens['6xl'].size,
  },

  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Font Weights
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  brand: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
};

export const Animations = {
  duration: {
    fast: 150,
    normal: 250,
    slow: 350,
  },
  easing: {
    default: 'ease-in-out',
    spring: 'spring',
  },
};

// Component-specific design tokens
export const Components = {
  button: {
    height: {
      sm: 40,
      md: 48,
      lg: 56,
    },
    padding: {
      sm: Spacing.md,
      md: Spacing.lg,
      lg: Spacing.xl,
    },
  },
  input: {
    height: 52,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  card: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
  },
  tabBar: {
    height: 72,
    iconSize: 24,
  },
};

// Helper function to get themed colors
export const getThemedColors = (isDark: boolean) => {
  const base = isDark ? Colors.dark : Colors.light;
  
  // Dynamic brand colors that adapt to theme
  const themeBrand = {
    primary: isDark ? '#FFFFFF' : '#000000',
    primaryDark: isDark ? '#FFFFFF' : '#000000',
    primaryLight: isDark ? '#FFFFFF' : '#000000',
    secondary: isDark ? '#FFFFFF' : '#000000',
    secondaryDark: isDark ? '#FFFFFF' : '#000000',
    secondaryLight: isDark ? '#FFFFFF' : '#000000',
  };
  
  return {
    ...base,
    brand: themeBrand,
    semantic: Colors.semantic,
    social: Colors.social,
    // Primary color system for consistent theming
    primary: themeBrand.primary,
    primaryDark: themeBrand.primaryDark,
    primaryLight: themeBrand.primaryLight,
  };
};
