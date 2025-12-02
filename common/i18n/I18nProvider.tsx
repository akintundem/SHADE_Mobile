import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
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

export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLangState] = useState<Language>('en');

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved === 'en' || saved === 'fr') setLangState(saved);
      } catch {}
    })();
  }, []);

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

