/**
 * Theme preference: persists the user's choice (light/dark/system) to AsyncStorage
 * and syncs it to React Native's Appearance so NativeWind's dark: variant applies.
 *
 * Source-of-truth priority (highest → lowest):
 *   1. User explicitly changes the setting (setThemePreference / setDark)
 *   2. AsyncStorage 'pref:theme' — read at boot by App.tsx → initialThemePreference
 *   3. Backend userThemePreference — used ONLY when there is no local preference at all
 *
 * isDark MUST be derived from useColorScheme() so it stays in sync with NativeWind's
 * dark: variant (which also reads from useColorScheme / Appearance internally).
 * We call Appearance.setColorScheme() to drive both in lockstep.
 */
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Appearance, Platform, Settings, StatusBar, useColorScheme, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getThemedColors, Spacing, BorderRadius, Typography, Shadows, Colors, Components } from './designSystem';
import { ThemePreference } from '../../core/auth/types/auth';

const ASYNC_STORAGE_KEY = 'pref:theme';
const NATIVE_THEME_KEY = 'capsule.themePreference';

// ─── helpers ─────────────────────────────────────────────────────────────────

function applyAppearance(pref: ThemePreference | null) {
  if (pref === ThemePreference.DARK) {
    Appearance.setColorScheme('dark');
  } else if (pref === ThemePreference.LIGHT) {
    Appearance.setColorScheme('light');
  } else {
    Appearance.setColorScheme(null); // respect OS
  }
}

function persistNative(pref: ThemePreference | null) {
  if (Platform.OS !== 'ios' || pref === null) return;
  const value = pref === ThemePreference.DARK ? 'dark' : pref === ThemePreference.LIGHT ? 'light' : 'system';
  Settings.set({ [NATIVE_THEME_KEY]: value, [ASYNC_STORAGE_KEY]: value });
}

async function persistAsync(pref: ThemePreference) {
  if (pref === ThemePreference.SYSTEM) {
    await AsyncStorage.removeItem(ASYNC_STORAGE_KEY);
  } else {
    await AsyncStorage.setItem(ASYNC_STORAGE_KEY, pref === ThemePreference.DARK ? 'dark' : 'light');
  }
}

// ─── types ───────────────────────────────────────────────────────────────────

type Props = {
  children: React.ReactNode;
  /** User's theme preference from the backend, resolved after login. */
  userThemePreference?: ThemePreference | null;
  /** Pre-read from AsyncStorage in App.tsx to avoid flash-of-wrong-theme. */
  initialThemePreference?: ThemePreference | null;
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
  disabledButtonBackground: string;
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
  disabledButtonBackground: 'rgba(0,0,0,0.08)',
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function useSwitchTrackColors() {
  const { colors } = useContext(ThemeContext);
  return useMemo(
    () => ({ false: colors.borderLight, true: colors.text.primary }),
    [colors.borderLight, colors.text.primary],
  );
}

// ─── provider ────────────────────────────────────────────────────────────────

export default function ThemeProvider({ children, userThemePreference, initialThemePreference }: Props) {
  // Resolve starting preference: local AsyncStorage wins over backend.
  const resolveInitial = (): ThemePreference | null => {
    if (initialThemePreference != null) return initialThemePreference;
    if (userThemePreference != null) return userThemePreference;
    return null;
  };

  const [themePreference, setThemePreferenceState] = useState<ThemePreference | null>(() => {
    const pref = resolveInitial();
    // Apply immediately so Appearance is set before first render.
    applyAppearance(pref);
    return pref;
  });

  // Once the user writes a preference locally, block backend from overriding it.
  const hasLocalPreference = useRef<boolean>(
    initialThemePreference != null
  );

  // isDark MUST come from useColorScheme so it stays in sync with NativeWind.
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // When the backend delivers a preference (post-login), apply it only if
  // the user has never saved a local choice.
  const prevUserPref = useRef<ThemePreference | null | undefined>(undefined);
  useEffect(() => {
    if (userThemePreference === prevUserPref.current) return;
    prevUserPref.current = userThemePreference;
    if (hasLocalPreference.current) return; // local choice wins
    if (userThemePreference == null) return;
    applyAppearance(userThemePreference);
    setThemePreferenceState(userThemePreference);
    persistNative(userThemePreference);
  }, [userThemePreference]);

  // Keep Appearance in sync whenever themePreference state changes.
  useEffect(() => {
    applyAppearance(themePreference);
  }, [themePreference]);

  // ── public API ──────────────────────────────────────────────────────────────

  const setThemePreference = async (pref: ThemePreference) => {
    hasLocalPreference.current = true;
    applyAppearance(pref);
    setThemePreferenceState(pref);
    await persistAsync(pref);
    persistNative(pref);
  };

  const setDark = async (v: boolean) => {
    await setThemePreference(v ? ThemePreference.DARK : ThemePreference.LIGHT);
  };

  // ── derived values ──────────────────────────────────────────────────────────

  const colors = useMemo(() => getThemedColors(isDark), [isDark]);
  const disabledButtonBackground = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)';

  const value = useMemo<ThemeContextType>(
    () => ({
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
      disabledButtonBackground,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isDark, themePreference, colors, disabledButtonBackground],
  );

  return (
    <ThemeContext.Provider value={value}>
      <View className="flex-1 bg-light-background dark:bg-dark-background">
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
        {children}
      </View>
    </ThemeContext.Provider>
  );
}
