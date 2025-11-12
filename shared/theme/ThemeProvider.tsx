import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { StatusBar, useColorScheme, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getThemedColors, Spacing, BorderRadius, Typography, Shadows, Colors, Components } from './designSystem';

type Props = { children: React.ReactNode };

export type ThemeColors = ReturnType<typeof getThemedColors>;

type ThemeContextType = { 
  isDark: boolean; 
  setDark: (v: boolean) => void; 
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

export default function ThemeProvider({ children }: Props) {
  const systemDark = useColorScheme() === 'dark';
  const [isDark, setIsDark] = useState(systemDark);

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem('pref:theme');
      if (saved === 'dark') setIsDark(true);
      else if (saved === 'light') setIsDark(false);
      else setIsDark(systemDark);
    })();
  }, [systemDark]);

  const setDark = async (v: boolean) => {
    setIsDark(v);
    await AsyncStorage.setItem('pref:theme', v ? 'dark' : 'light');
  };

  const colors = useMemo(() => getThemedColors(isDark), [isDark]);

  const value = useMemo<ThemeContextType>(() => ({ 
    isDark, 
    setDark, 
    colors,
    spacing: Spacing,
    borderRadius: BorderRadius,
    typography: Typography,
    shadows: Shadows,
    brand: Colors.brand,
    components: Components,
  }), [isDark, colors]);

  return (
    <ThemeContext.Provider value={value}>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
        {children}
      </View>
    </ThemeContext.Provider>
  );
}

