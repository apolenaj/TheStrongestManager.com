import {
  getShareCardFormat,
  type ShareCardFormatId,
} from "@/domain/share-cards/formats";
import type { ShareCardModel } from "@/domain/share-cards/build";

/** Fixed brand palette for exported pixels (matches product gold-on-charcoal). */
export const SHARE_CARD_PALETTE = {
  background: "#0a0a0b",
  surface: "#141416",
  accent: "#d4a017",
  foreground: "#f5f5f4",
  muted: "#a1a1aa",
  border: "#27272a",
} as const;

/**
 * Draw a branded performance card onto a canvas at native format resolution.
 * Client-only (needs CanvasRenderingContext2D).
 */
export function drawShareCard(
  ctx: CanvasRenderingContext2D,
  model: ShareCardModel,
  formatId: ShareCardFormatId = model.formatId,
): void {
  const format = getShareCardFormat(formatId);
  const { width: w, height: h } = format;

  ctx.clearRect(0, 0, w, h);

  // Background atmosphere — subtle diagonal wash, not flat
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, "#0a0a0b");
  bg.addColorStop(0.45, "#121214");
  bg.addColorStop(1, "#0c0c0e");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Accent plane
  ctx.fillStyle = SHARE_CARD_PALETTE.accent;
  const barH = Math.round(h * 0.012);
  ctx.fillRect(0, 0, w, barH);

  // Soft gold radial
  const glow = ctx.createRadialGradient(
    w * 0.2,
    h * 0.15,
    0,
    w * 0.2,
    h * 0.15,
    w * 0.7,
  );
  glow.addColorStop(0, "rgba(212, 160, 23, 0.12)");
  glow.addColorStop(1, "rgba(212, 160, 23, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  const padX = Math.round(w * 0.08);
  const isWide = w / h > 1.2;
  const isSquare = Math.abs(w / h - 1) < 0.05;
  let y = isWide ? Math.round(h * 0.18) : Math.round(h * 0.22);

  // Eyebrow
  ctx.fillStyle = SHARE_CARD_PALETTE.accent;
  ctx.font = `600 ${Math.round(w * 0.032)}px system-ui, sans-serif`;
  ctx.fillText(model.eyebrow, padX, y);
  y += Math.round(h * (isWide ? 0.12 : isSquare ? 0.1 : 0.08));

  // Headline
  ctx.fillStyle = SHARE_CARD_PALETTE.foreground;
  const headlineSize = Math.round(w * (isWide ? 0.09 : isSquare ? 0.1 : 0.11));
  ctx.font = `700 ${headlineSize}px system-ui, sans-serif`;
  wrapText(ctx, model.headline, padX, y, w - padX * 2, headlineSize * 1.1);
  y += headlineSize * (model.headline.length > 14 ? 2.4 : 1.5);

  // Stats
  const stats = model.lines.filter((l) => l.kind === "stat");
  for (const line of stats) {
    ctx.fillStyle = SHARE_CARD_PALETTE.muted;
    ctx.font = `500 ${Math.round(w * 0.028)}px system-ui, sans-serif`;
    if (line.label) {
      ctx.fillText(line.label.toUpperCase(), padX, y);
      y += Math.round(h * 0.035);
    }
    ctx.fillStyle = SHARE_CARD_PALETTE.foreground;
    ctx.font = `600 ${Math.round(w * 0.048)}px system-ui, sans-serif`;
    ctx.fillText(line.value, padX, y);
    y += Math.round(h * (isWide ? 0.12 : 0.07));
  }

  // Brand + honesty at bottom
  const brand = model.lines.find((l) => l.kind === "brand")?.value ?? model.brand;
  ctx.fillStyle = SHARE_CARD_PALETTE.accent;
  ctx.font = `600 ${Math.round(w * 0.03)}px system-ui, sans-serif`;
  ctx.fillText(brand, padX, h - Math.round(h * 0.08));

  ctx.fillStyle = SHARE_CARD_PALETTE.muted;
  ctx.font = `400 ${Math.round(w * 0.018)}px system-ui, sans-serif`;
  ctx.fillText(
    model.honestyFootnote,
    padX,
    h - Math.round(h * 0.045),
  );
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): void {
  const words = text.split(" ");
  let line = "";
  let cy = y;
  for (let i = 0; i < words.length; i++) {
    const test = line + words[i] + " ";
    if (ctx.measureText(test).width > maxWidth && i > 0) {
      ctx.fillText(line.trim(), x, cy);
      line = words[i] + " ";
      cy += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line.trim(), x, cy);
}

export function createShareCardCanvas(
  model: ShareCardModel,
  formatId?: ShareCardFormatId,
): HTMLCanvasElement {
  const id = formatId ?? model.formatId;
  const format = getShareCardFormat(id);
  const canvas = document.createElement("canvas");
  canvas.width = format.width;
  canvas.height = format.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  drawShareCard(ctx, model, id);
  return canvas;
}

export async function downloadShareCardPng(
  model: ShareCardModel,
  formatId?: ShareCardFormatId,
  filename = "thestrongestmanager-pr.png",
): Promise<void> {
  const canvas = createShareCardCanvas(model, formatId);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );
  if (!blob) throw new Error("PNG export failed");
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
