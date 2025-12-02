import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CaptureClip } from './captureSession';

const DRAFT_KEY = 'camera:draft:clips';

export async function saveDraftClips(clips: CaptureClip[]): Promise<void> {
  try {
    const payload = JSON.stringify(clips ?? []);
    await AsyncStorage.setItem(DRAFT_KEY, payload);
  } catch {}
}

export async function loadDraftClips(): Promise<CaptureClip[] | null> {
  try {
    const raw = await AsyncStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CaptureClip[];
    if (!Array.isArray(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function clearDraftClips(): Promise<void> {
  try {
    await AsyncStorage.removeItem(DRAFT_KEY);
  } catch {}
}

