const key = (themeId: string): string => `verba-theme-photo-${themeId}`;

export function savePhoto(storage: Storage, themeId: string, dataUrl: string): boolean {
  try {
    storage.setItem(key(themeId), dataUrl);
    return true;
  } catch {
    // Quota exceeded — the theme keeps its luminance and renders the fallback surface
    return false;
  }
}

export function loadPhoto(storage: Storage, themeId: string): string | null {
  return storage.getItem(key(themeId));
}

export function deletePhoto(storage: Storage, themeId: string): void {
  storage.removeItem(key(themeId));
}

export type ImportedPhoto = { dataUrl: string; luminance: number };

const loadImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('image failed to decode'));
    img.src = url;
  });

// Downscale once at pick time: the face never needs more than screen resolution, and the
// stored copy has to fit localStorage. Luminance is averaged from a coarse resample.
export async function importPhoto(file: File): Promise<ImportedPhoto> {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const scale = Math.min(1, 1_280 / Math.max(img.naturalWidth, img.naturalHeight));
    const width = Math.max(1, Math.round(img.naturalWidth * scale));
    const height = Math.max(1, Math.round(img.naturalHeight * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas unavailable');
    ctx.drawImage(img, 0, 0, width, height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);

    const probe = document.createElement('canvas');
    probe.width = 32;
    probe.height = 32;
    const probeCtx = probe.getContext('2d');
    if (!probeCtx) throw new Error('canvas unavailable');
    probeCtx.drawImage(img, 0, 0, 32, 32);
    const { data } = probeCtx.getImageData(0, 0, 32, 32);
    let sum = 0;
    for (let i = 0; i < data.length; i += 4) {
      sum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    }
    return { dataUrl, luminance: sum / (32 * 32 * 255) };
  } finally {
    URL.revokeObjectURL(url);
  }
}
