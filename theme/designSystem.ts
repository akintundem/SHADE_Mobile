/**
 * Shade Design System
 * A comprehensive design system for premium private event sharing
 */

export const Colors = {
  // Brand Colors - Pure black and white
  brand: {
    primary: '#000000',      // Pure black
    primaryDark: '#000000',  // Pure black
    primaryLight: '#808080', // Medium gray
    secondary: '#F59E0B',    // Amber accent - luxury and warmth
    secondaryDark: '#D97706',
    secondaryLight: '#FCD34D',
  },

  // Neutral Palette - Improved accessibility and contrast
  light: {
    background: '#FFFFFF',        // Pure white for better contrast
    surface: '#F8F9FA',          // Soft gray surface
    surfaceElevated: '#FFFFFF',   // Pure white for elevated elements
    card: '#F1F3F4',             // Warm card background
    cardElevated: '#FFFFFF',      // Pure white for elevated cards
    border: '#D1D5DB',           // Better contrast border
    borderLight: '#E5E7EB',      // Light borders with better visibility
    divider: '#E5E7EB',          // More visible dividers
    
    text: {
      primary: '#111827',        // High contrast black
      secondary: '#374151',      // Better contrast gray
      tertiary: '#6B7280',       // Accessible medium gray
      disabled: '#9CA3AF',       // Accessible disabled state
      inverse: '#FFFFFF',
    },
    
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.2)',
  },

  dark: {
    background: '#000000',        // Pure black for better contrast
    surface: '#111827',          // Dark gray surface
    surfaceElevated: '#1F2937',   // Elevated elements with better contrast
    card: '#1F2937',             // Card background
    cardElevated: '#374151',      // Elevated cards
    border: '#374151',           // More visible borders
    borderLight: '#4B5563',       // Light borders with better visibility
    divider: '#374151',          // More visible dividers
    
    text: {
      primary: '#F9FAFB',        // High contrast white
      secondary: '#D1D5DB',      // Better contrast gray
      tertiary: '#9CA3AF',       // Accessible medium gray
      disabled: '#6B7280',       // Accessible disabled state
      inverse: '#000000',
    },
    
    overlay: 'rgba(0, 0, 0, 0.7)',
    overlayLight: 'rgba(0, 0, 0, 0.4)',
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
    info: '#000000',         // Pure black
    infoLight: '#E5E5E5',    // Light gray
    infoDark: '#000000',     // Pure black
  },

  // Social Platform Colors
  social: {
    spotify: '#1DB954',
    apple: '#000000',
    google: '#000000',      // Changed from blue to black
    facebook: '#000000',    // Changed from blue to black
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
    xs: 11,
    sm: 13,
    base: 15,
    lg: 17,
    xl: 19,
    '2xl': 22,
    '3xl': 26,
    '4xl': 30,
    '5xl': 36,
    '6xl': 44,
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
  return {
    ...base,
    brand: Colors.brand,
    semantic: Colors.semantic,
    social: Colors.social,
    // Primary color system for consistent theming
    primary: Colors.brand.primary,
    primaryDark: Colors.brand.primaryDark,
    primaryLight: Colors.brand.primaryLight,
  };
};
