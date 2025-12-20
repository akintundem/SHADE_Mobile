import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { NativeModules, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { en } from './locales/en';
import { fr } from './locales/fr';

type Language = 'en' | 'fr';
type Dictionary = typeof en;

const DICTS: Record<Language, Dictionary> = { en, fr };
const STORAGE_KEY = 'shade.lang';

type I18nContextType = {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: keyof Dictionary, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextType>({
  lang: 'en',
  setLang: () => {},
  t: (k: any) => String(k),
});

const getDeviceLocale = (): Language => {
  try {
    let locale: string = 'en';
    
    if (Platform.OS === 'ios') {
      const settings = NativeModules.SettingsManager?.settings;
      locale = settings?.AppleLocale || 
               settings?.AppleLanguages?.[0] || 
               'en';
    } else {
      locale = NativeModules.I18nManager?.localeIdentifier || 'en';
    }
    
    // Check if locale starts with 'fr' (French)
    if (locale.toLowerCase().startsWith('fr')) {
      return 'fr';
    }
    return 'en';
  } catch {
    return 'en';
  }
};

type I18nProviderProps = {
  children: React.ReactNode;
  userLanguagePreference?: string | null; // Optional user language preference from settings
};

export const I18nProvider = ({ children, userLanguagePreference }: I18nProviderProps) => {
  const [lang, setLangState] = useState<Language>('en');
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize language on mount - priority: userLanguagePreference > AsyncStorage > device locale
  useEffect(() => {
    (async () => {
      try {
        // Priority 1: User settings (if provided)
        if (userLanguagePreference && (userLanguagePreference === 'en' || userLanguagePreference === 'fr')) {
          setLangState(userLanguagePreference as Language);
          await AsyncStorage.setItem(STORAGE_KEY, userLanguagePreference);
          setIsInitialized(true);
          return;
        }
        
        // Priority 2: Local storage
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved === 'en' || saved === 'fr') {
          setLangState(saved);
          setIsInitialized(true);
          return;
        }
        
        // Priority 3: Device locale
        const deviceLang = getDeviceLocale();
        setLangState(deviceLang);
        await AsyncStorage.setItem(STORAGE_KEY, deviceLang);
        setIsInitialized(true);
      } catch {
        // Fallback to device locale if storage fails
        const deviceLang = getDeviceLocale();
        setLangState(deviceLang);
        setIsInitialized(true);
      }
    })();
  }, []);

  // Update language when user settings change (after initial load)
  useEffect(() => {
    if (isInitialized && userLanguagePreference && (userLanguagePreference === 'en' || userLanguagePreference === 'fr')) {
      setLangState(userLanguagePreference as Language);
      AsyncStorage.setItem(STORAGE_KEY, userLanguagePreference).catch(() => {});
    }
  }, [userLanguagePreference, isInitialized]);

  const setLang = useCallback((l: Language) => {
    setLangState(l);
    AsyncStorage.setItem(STORAGE_KEY, l).catch(() => {});
  }, []);

  const t = useCallback<I18nContextType['t']>((key, vars) => {
    const dict = DICTS[lang];
    let str = (dict as any)[key] ?? String(key);
    if (vars) {
      Object.keys(vars).forEach(k => {
        str = str.replace(new RegExp(`{${k}}`, 'g'), String(vars[k]));
      });
    }
    return str;
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => useContext(I18nContext);

