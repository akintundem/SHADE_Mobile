/**
 * Shade Design System
 * A comprehensive design system for premium private event sharing
 */

export const Colors = {
  // Brand Colors - Premium and sophisticated
  brand: {
    primary: '#0F172A',      // Slate - ultra premium, sophisticated
    primaryDark: '#020617',  // Deeper slate
    primaryLight: '#334155', // Light slate
    secondary: '#F59E0B',    // Amber accent - luxury and warmth
    secondaryDark: '#D97706',
    secondaryLight: '#FCD34D',
  },

  // Neutral Palette - Softer, more sophisticated
  light: {
    background: '#FEFEFE',        // Warm off-white instead of harsh white
    surface: '#F8F9FA',          // Soft gray surface
    surfaceElevated: '#FFFFFF',   // Pure white only for elevated elements
    card: '#F1F3F4',             // Warm card background
    cardElevated: '#FFFFFF',      // Pure white for elevated cards
    border: '#E1E5E9',           // Softer border color
    borderLight: '#F0F2F5',      // Very light borders
    divider: '#E8EAED',          // Subtle dividers
    
    text: {
      primary: '#1A1D21',        // Softer black, less harsh
      secondary: '#5F6368',      // Warmer gray
      tertiary: '#80868B',       // Medium gray
      disabled: '#BDC1C6',       // Disabled state
      inverse: '#FFFFFF',
    },
    
    overlay: 'rgba(0, 0, 0, 0.4)',
    overlayLight: 'rgba(0, 0, 0, 0.15)',
  },

  dark: {
    background: '#0D1117',        // GitHub-style dark, not pure black
    surface: '#161B22',          // Slightly lighter surface
    surfaceElevated: '#21262D',   // Elevated elements
    card: '#1C2128',             // Card background
    cardElevated: '#262C36',      // Elevated cards
    border: '#30363D',           // Visible but subtle borders
    borderLight: '#21262D',       // Light borders
    divider: '#21262D',          // Dividers
    
    text: {
      primary: '#F0F6FC',        // Softer white, easier on eyes
      secondary: '#8B949E',      // Warm gray
      tertiary: '#6E7681',       // Medium gray
      disabled: '#484F58',       // Disabled state
      inverse: '#0D1117',
    },
    
    overlay: 'rgba(0, 0, 0, 0.6)',
    overlayLight: 'rgba(0, 0, 0, 0.3)',
  },

  // Semantic Colors - Modern and accessible
  semantic: {
    success: '#059669',      // Emerald green
    successLight: '#D1FAE5',
    successDark: '#047857',
    error: '#DC2626',        // Red
    errorLight: '#FEE2E2',
    errorDark: '#B91C1C',
    warning: '#D97706',      // Orange
    warningLight: '#FEF3C7',
    warningDark: '#B45309',
    info: '#2563EB',         // Blue
    infoLight: '#DBEAFE',
    infoDark: '#1D4ED8',
  },

  // Social Platform Colors
  social: {
    spotify: '#1DB954',
    apple: '#000000',
    google: '#4285F4',
    facebook: '#1877F2',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
  '7xl': 80,
};

export const BorderRadius = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
};

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
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 40,
    '6xl': 48,
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
    shadowColor: '#8B5CF6',
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
  return {
    ...base,
    brand: Colors.brand,
    semantic: Colors.semantic,
    social: Colors.social,
  };
};

