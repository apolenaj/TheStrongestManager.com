/**
 * Browser helpers to sample lighting / metadata for camera quality.
 * Never invents pose-based framing — that waits for landmarks.
 */

export type VideoQualitySample = {
  widthPx: number;
  heightPx: number;
  durationSeconds: number;
  meanLuma: number | null;
  estimatedFps: number | null;
};

export async function sampleVideoQualityFromFile(
  file: File,
): Promise<VideoQualitySample> {
  const url = URL.createObjectURL(file);
  try {
    return await sampleVideoQualityFromUrl(url);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function sampleVideoQualityFromUrl(
  src: string,
): Promise<VideoQualitySample> {
  const video = document.createElement("video");
  video.preload = "auto";
  video.muted = true;
  video.playsInline = true;
  video.src = src;

  await new Promise<void>((resolve, reject) => {
    video.onloadedmetadata = () => resolve();
    video.onerror = () => reject(new Error("Could not load video for quality sample."));
  });

  const widthPx = video.videoWidth;
  const heightPx = video.videoHeight;
  const durationSeconds = video.duration;
  const meanLuma = await sampleMeanLuma(video);
  const estimatedFps = await estimateFps(video);

  return { widthPx, heightPx, durationSeconds, meanLuma, estimatedFps };
}

async function sampleMeanLuma(video: HTMLVideoElement): Promise<number | null> {
  const duration = video.duration;
  if (!Number.isFinite(duration) || duration <= 0) return null;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  const times = [0.1, 0.4, 0.7]
    .map((f) => Math.min(duration * f, Math.max(0, duration - 0.05)))
    .filter((t, i, arr) => arr.indexOf(t) === i);

  const lumas: number[] = [];
  for (const t of times) {
    await seek(video, t);
    const w = Math.min(160, video.videoWidth || 160);
    const h = Math.min(90, video.videoHeight || 90);
    if (w < 2 || h < 2) continue;
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(video, 0, 0, w, h);
    try {
      const data = ctx.getImageData(0, 0, w, h).data;
      let sum = 0;
      let n = 0;
      for (let i = 0; i < data.length; i += 16) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        sum += 0.2126 * r + 0.7152 * g + 0.0722 * b;
        n += 1;
      }
      if (n > 0) lumas.push(sum / n);
    } catch {
      // Tainted canvas / codec — skip lighting sample honestly
      return null;
    }
  }
  if (lumas.length === 0) return null;
  return lumas.reduce((a, b) => a + b, 0) / lumas.length;
}

/**
 * Rough fps estimate from seekable frame steps — null when unreliable.
 */
async function estimateFps(video: HTMLVideoElement): Promise<number | null> {
  // Media Capabilities / getVideoPlaybackQuality are inconsistent for files.
  // Prefer null over a fabricated fps; metadata duration alone is not fps.
  void video;
  return null;
}

function seek(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const onSeeked = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error("Seek failed during quality sample."));
    };
    const cleanup = () => {
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
    };
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("error", onError);
    video.currentTime = time;
  });
}
