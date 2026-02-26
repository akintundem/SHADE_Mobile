import type { UserSettings } from '../../../core/auth/types/auth';

export type SettingsView = 'main' | 'privacy' | 'notifications' | 'security' | 'data';

export type SettingsBanner = {
  text: string;
  tone: 'success' | 'error';
};

export type SettingsState = {
  settings: UserSettings | null;
  loading: boolean;
  isUpdating: boolean;
};
