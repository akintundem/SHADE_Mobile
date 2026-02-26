import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { CACHE_CONFIG } from '../../../common/utils/constants';
import { authService } from '../../../core/auth/services/authService';
import type {
  NotificationSettingsUpdateRequest,
  PrivacySettingsUpdateRequest,
  SecuritySettingsUpdateRequest,
  SecureUserResponse,
  UserSettings,
} from '../../../core/auth/types/auth';
import { useCurrentUser } from '../../auth/hooks';
import { clearCachedValue, getCachedValue, setCachedValue } from '../../../common/utils/cache';

export type SettingsContextValue = {
  userId: string | null;
  userName: string | null;
  settings: UserSettings | null;
  loading: boolean;
  isUpdating: boolean;
  refresh: () => Promise<void>;
  updatePrivacy: (patch: PrivacySettingsUpdateRequest) => Promise<boolean>;
  updateNotifications: (patch: NotificationSettingsUpdateRequest) => Promise<boolean>;
  updateSecurity: (patch: SecuritySettingsUpdateRequest) => Promise<boolean>;
  updateProfileSettings: (patch: Partial<UserSettings>) => Promise<boolean>;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

const buildSettingsCacheKey = (userId: string) => `settings:${userId}`;

type ProviderProps = {
  children: React.ReactNode;
};

export function SettingsProvider({ children }: ProviderProps) {
  const { user, refetch, loading } = useCurrentUser();
  const userId = user?.id ?? null;
  const userName = user?.name ?? null;
  const cacheKey = userId ? buildSettingsCacheKey(userId) : null;

  const [settings, setSettings] = useState<UserSettings | null>(() => {
    if (!cacheKey) {
      return user?.settings ?? null;
    }
    const cached = getCachedValue<UserSettings>(cacheKey);
    return cached ?? user?.settings ?? null;
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const settingsRef = useRef<UserSettings | null>(settings);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    if (!userId) {
      setSettings(null);
      return;
    }
    if (user?.settings) {
      setSettings(user.settings);
      if (cacheKey) {
        setCachedValue(cacheKey, user.settings, CACHE_CONFIG.USER_CACHE_DURATION);
      }
    } else if (cacheKey) {
      const cached = getCachedValue<UserSettings>(cacheKey);
      if (cached) {
        setSettings(cached);
      }
    }
  }, [cacheKey, userId, user?.settings]);

  const applyUpdate = useCallback(
    async (
      patch: Partial<UserSettings>,
      updater: () => Promise<SecureUserResponse>
    ) => {
      if (!userId || !cacheKey) {
        return false;
      }

      const previous = settingsRef.current;
      const optimistic = {
        ...(previous ?? {}),
        ...patch,
      } as UserSettings;

      setSettings(optimistic);
      setCachedValue(cacheKey, optimistic, CACHE_CONFIG.USER_CACHE_DURATION);
      setIsUpdating(true);

      try {
        const response = await updater();
        const updated = response.settings ?? optimistic;
        setSettings(updated);
        setCachedValue(cacheKey, updated, CACHE_CONFIG.USER_CACHE_DURATION);
        return true;
      } catch (error) {
        setSettings(previous);
        if (previous && cacheKey) {
          setCachedValue(cacheKey, previous, CACHE_CONFIG.USER_CACHE_DURATION);
        } else if (cacheKey) {
          clearCachedValue(cacheKey);
        }
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    [cacheKey, userId]
  );

  const updatePrivacy = useCallback(
    async (patch: PrivacySettingsUpdateRequest) => {
      return applyUpdate(patch, () => authService.updateMyPrivacySettings(patch));
    },
    [applyUpdate]
  );

  const updateNotifications = useCallback(
    async (patch: NotificationSettingsUpdateRequest) => {
      return applyUpdate(patch, () => authService.updateMyNotificationSettings(patch));
    },
    [applyUpdate]
  );

  const updateSecurity = useCallback(
    async (patch: SecuritySettingsUpdateRequest) => {
      return applyUpdate(patch, () => authService.updateMySecuritySettings(patch));
    },
    [applyUpdate]
  );

  const updateProfileSettings = useCallback(
    async (patch: Partial<UserSettings>) => {
      if (!userId) return false;
      const name = user?.name || user?.email || 'User';
      return applyUpdate(patch, () => authService.updateUserProfile(userId, { name, settings: patch }));
    },
    [applyUpdate, user?.email, user?.name, userId]
  );

  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const value = useMemo<SettingsContextValue>(
    () => ({
      userId,
      userName,
      settings,
      loading,
      isUpdating,
      refresh,
      updatePrivacy,
      updateNotifications,
      updateSecurity,
      updateProfileSettings,
    }),
    [
      userId,
      userName,
      settings,
      loading,
      isUpdating,
      refresh,
      updatePrivacy,
      updateNotifications,
      updateSecurity,
      updateProfileSettings,
    ]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
