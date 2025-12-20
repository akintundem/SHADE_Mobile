import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { StatusBar, useColorScheme, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getThemedColors, Spacing, BorderRadius, Typography, Shadows, Colors, Components } from './designSystem';
import { ThemePreference } from '../../core/auth/types/auth';

type Props = { 
  children: React.ReactNode;
  userThemePreference?: ThemePreference | null; // Optional user theme preference from settings
};

export type ThemeColors = ReturnType<typeof getThemedColors>;

type ThemeContextType = { 
  isDark: boolean; 
  setDark: (v: boolean) => void; 
  themePreference: ThemePreference | null;
  setThemePreference: (pref: ThemePreference) => Promise<void>;
  colors: ThemeColors;
  spacing: typeof Spacing;
  borderRadius: typeof BorderRadius;
  typography: typeof Typography;
  shadows: typeof Shadows;
  brand: typeof Colors.brand;
  components: typeof Components;
};

const defaultColors = getThemedColors(false);

const ThemeContext = createContext<ThemeContextType>({ 
  isDark: false, 
  setDark: () => {}, 
  themePreference: null,
  setThemePreference: async () => {},
  colors: defaultColors,
  spacing: Spacing,
  borderRadius: BorderRadius,
  typography: Typography,
  shadows: Shadows,
  brand: Colors.brand,
  components: Components,
});

export function useTheme() {
  return useContext(ThemeContext);
}

export default function ThemeProvider({ children, userThemePreference }: Props) {
  const systemDark = useColorScheme() === 'dark';
  const [isDark, setIsDark] = useState(systemDark);
  const [themePreference, setThemePreferenceState] = useState<ThemePreference | null>(userThemePreference || null);

  // Update theme preference when user settings change
  useEffect(() => {
    if (userThemePreference !== undefined) {
      setThemePreferenceState(userThemePreference);
    }
  }, [userThemePreference]);

  useEffect(() => {
    (async () => {
      // Priority: user settings > local storage > system
      if (themePreference === ThemePreference.SYSTEM || themePreference === null) {
        setIsDark(systemDark);
      } else if (themePreference === ThemePreference.DARK) {
        setIsDark(true);
      } else if (themePreference === ThemePreference.LIGHT) {
        setIsDark(false);
      } else {
        // Fallback to local storage for backward compatibility
        const saved = await AsyncStorage.getItem('pref:theme');
        if (saved === 'dark') setIsDark(true);
        else if (saved === 'light') setIsDark(false);
        else setIsDark(systemDark);
      }
    })();
  }, [systemDark, themePreference]);

  const setDark = async (v: boolean) => {
    setIsDark(v);
    // Update local storage for backward compatibility
    await AsyncStorage.setItem('pref:theme', v ? 'dark' : 'light');
  };

  const setThemePreference = async (pref: ThemePreference) => {
    setThemePreferenceState(pref);
    // Update local storage for backward compatibility
    if (pref === ThemePreference.SYSTEM) {
      await AsyncStorage.removeItem('pref:theme');
    } else {
      await AsyncStorage.setItem('pref:theme', pref === ThemePreference.DARK ? 'dark' : 'light');
    }
  };

  const colors = useMemo(() => getThemedColors(isDark), [isDark]);

  const value = useMemo<ThemeContextType>(() => ({ 
    isDark, 
    setDark, 
    themePreference,
    setThemePreference,
    colors,
    spacing: Spacing,
    borderRadius: BorderRadius,
    typography: Typography,
    shadows: Shadows,
    brand: colors.brand,
    components: Components,
  }), [isDark, themePreference, colors]);

  return (
    <ThemeContext.Provider value={value}>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
        {children}
      </View>
    </ThemeContext.Provider>
  );
}

