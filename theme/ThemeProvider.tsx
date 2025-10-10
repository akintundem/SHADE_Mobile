import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { StatusBar, useColorScheme, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = { children: React.ReactNode };

type ThemeColors = {
  bg: string;
  surface: string;
  card: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  tint: string;
};

type ThemeContextType = { isDark: boolean; setDark: (v: boolean) => void; colors: ThemeColors };
const ThemeContext = createContext<ThemeContextType>({ isDark: false, setDark: () => {}, colors: { bg: '#fff', surface: '#fff', card: '#f9fafb', border: '#e5e7eb', textPrimary: '#111827', textSecondary: '#6B7280', tint: '#111827' } });

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

  const colors: ThemeColors = isDark
    ? {
        bg: '#000000',
        surface: '#0B0F14',
        card: '#111827',
        border: '#1F2937',
        textPrimary: '#F9FAFB',
        textSecondary: '#9CA3AF',
        tint: '#FACC15',
      }
    : {
        bg: '#FFFFFF',
        surface: '#FFFFFF',
        card: '#F9FAFB',
        border: '#E5E7EB',
        textPrimary: '#111827',
        textSecondary: '#6B7280',
        tint: '#111827',
      };

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

