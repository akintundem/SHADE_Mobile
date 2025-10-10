export type CaptureClip = {
  id: string;
  path: string;
  duration: number;
  speed: number;
  type: 'photo' | 'video';
};

let clips: CaptureClip[] = [];

export function getCaptureClips() {
  return clips;
}

export function addCaptureClip(clip: CaptureClip) {
  clips = [...clips, clip];
}

export function removeLastClip() {
  clips = clips.slice(0, -1);
}

export function removeClipById(id: string) {
  clips = clips.filter(c => c.id !== id);
}

export function clearCaptureClips() {
  clips = [];
}

export function updateClip(id: string, update: Partial<CaptureClip>) {
  clips = clips.map(c => (c.id === id ? { ...c, ...update } : c));
}

// Allow initializing session clips from persisted drafts
export function setCaptureClips(next: CaptureClip[]) {
  clips = Array.isArray(next) ? [...next] : [];
}
