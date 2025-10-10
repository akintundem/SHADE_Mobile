import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { StatusBar, useColorScheme, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkColors, lightColors, ThemeColors } from './tokens';

type Props = { children: React.ReactNode };

type ThemeContextType = { isDark: boolean; setDark: (v: boolean) => void; colors: ThemeColors };
const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  setDark: () => {},
  colors: lightColors,
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

  const colors: ThemeColors = isDark ? darkColors : lightColors;

  const value = useMemo<ThemeContextType>(() => ({ isDark, setDark, colors }), [isDark]);

  return (
    <ThemeContext.Provider value={value}>
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        {children}
      </View>
    </ThemeContext.Provider>
  );
}

