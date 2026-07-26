import {
  getShareCardFormat,
  SHARE_CARD_PALETTE,
  type ShareCardFormatId,
} from "@/domain/share-cards";
import type { TechniqueShareCardModel } from "@/domain/technique-share-cards/types";

/**
 * Draw technique score card at native format resolution.
 */
export function drawTechniqueShareCard(
  ctx: CanvasRenderingContext2D,
  model: TechniqueShareCardModel,
  formatId: ShareCardFormatId = model.formatId,
): void {
  const format = getShareCardFormat(formatId);
  const { width: w, height: h } = format;

  ctx.clearRect(0, 0, w, h);
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, "#0a0a0b");
  bg.addColorStop(0.5, "#121214");
  bg.addColorStop(1, "#0c0c0e");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = SHARE_CARD_PALETTE.accent;
  ctx.fillRect(0, 0, w, Math.round(h * 0.012));

  const glow = ctx.createRadialGradient(
    w * 0.75,
    h * 0.2,
    0,
    w * 0.75,
    h * 0.2,
    w * 0.6,
  );
  glow.addColorStop(0, "rgba(212, 160, 23, 0.14)");
  glow.addColorStop(1, "rgba(212, 160, 23, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  const padX = Math.round(w * 0.08);
  const isWide = w / h > 1.2;
  let y = isWide ? Math.round(h * 0.16) : Math.round(h * 0.18);

  // Optional thumbnail placeholder band (never private pixels without video draw)
  if (model.includeThumbnailInPng) {
    ctx.fillStyle = "#1a1a1e";
    const th = Math.round(h * (isWide ? 0.28 : 0.22));
    ctx.fillRect(padX, y, w - padX * 2, th);
    ctx.strokeStyle = SHARE_CARD_PALETTE.border;
    ctx.strokeRect(padX, y, w - padX * 2, th);
    ctx.fillStyle = SHARE_CARD_PALETTE.muted;
    ctx.font = `500 ${Math.round(w * 0.028)}px system-ui, sans-serif`;
    ctx.fillText("Lift thumbnail", padX + Math.round(w * 0.04), y + th / 2);
    y += th + Math.round(h * 0.04);
  }

  ctx.fillStyle = SHARE_CARD_PALETTE.accent;
  ctx.font = `600 ${Math.round(w * 0.03)}px system-ui, sans-serif`;
  ctx.fillText(model.eyebrow, padX, y);
  y += Math.round(h * (isWide ? 0.14 : 0.07));

  if (model.scoreLine) {
    ctx.fillStyle = SHARE_CARD_PALETTE.foreground;
    ctx.font = `700 ${Math.round(w * (isWide ? 0.14 : 0.16))}px system-ui, sans-serif`;
    ctx.fillText(model.scoreLine, padX, y);
    y += Math.round(h * (isWide ? 0.14 : 0.09));
  }

  const stat = (label: string, value: string) => {
    ctx.fillStyle = SHARE_CARD_PALETTE.muted;
    ctx.font = `500 ${Math.round(w * 0.026)}px system-ui, sans-serif`;
    ctx.fillText(label.toUpperCase(), padX, y);
    y += Math.round(h * 0.032);
    ctx.fillStyle = SHARE_CARD_PALETTE.foreground;
    ctx.font = `600 ${Math.round(w * 0.042)}px system-ui, sans-serif`;
    ctx.fillText(value, padX, y);
    y += Math.round(h * (isWide ? 0.1 : 0.055));
  };

  if (model.strongestLine) stat("Strongest", model.strongestLine);
  if (model.improveLine) stat("Improve", model.improveLine);

  if (model.insightLine) {
    ctx.fillStyle = SHARE_CARD_PALETTE.muted;
    ctx.font = `500 ${Math.round(w * 0.026)}px system-ui, sans-serif`;
    ctx.fillText("INSIGHT", padX, y);
    y += Math.round(h * 0.032);
    ctx.fillStyle = SHARE_CARD_PALETTE.foreground;
    ctx.font = `500 ${Math.round(w * 0.032)}px system-ui, sans-serif`;
    const maxW = w - padX * 2;
    wrap(ctx, model.insightLine, padX, y, maxW, Math.round(w * 0.038));
    y += Math.round(h * 0.08);
  }

  // CTA pill
  const ctaY = h - Math.round(h * 0.16);
  ctx.fillStyle = SHARE_CARD_PALETTE.accent;
  const ctaPad = Math.round(w * 0.04);
  ctx.font = `700 ${Math.round(w * 0.032)}px system-ui, sans-serif`;
  const ctaW = ctx.measureText(model.cta).width + ctaPad * 2;
  const ctaH = Math.round(h * 0.045);
  roundRect(ctx, padX, ctaY, ctaW, ctaH, 8);
  ctx.fill();
  ctx.fillStyle = SHARE_CARD_PALETTE.background;
  ctx.fillText(model.cta, padX + ctaPad, ctaY + ctaH * 0.7);

  ctx.fillStyle = SHARE_CARD_PALETTE.accent;
  ctx.font = `600 ${Math.round(w * 0.028)}px system-ui, sans-serif`;
  ctx.fillText(model.brand, padX, h - Math.round(h * 0.07));

  ctx.fillStyle = SHARE_CARD_PALETTE.muted;
  ctx.font = `400 ${Math.round(w * 0.016)}px system-ui, sans-serif`;
  ctx.fillText(model.honestyFootnote, padX, h - Math.round(h * 0.04));
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrap(
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

export function createTechniqueShareCanvas(
  model: TechniqueShareCardModel,
  formatId?: ShareCardFormatId,
): HTMLCanvasElement {
  const id = formatId ?? model.formatId;
  const format = getShareCardFormat(id);
  const canvas = document.createElement("canvas");
  canvas.width = format.width;
  canvas.height = format.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  drawTechniqueShareCard(ctx, model, id);
  return canvas;
}

export async function downloadTechniqueSharePng(
  model: TechniqueShareCardModel,
  formatId?: ShareCardFormatId,
  filename = "thestrongestmanager-technique.png",
): Promise<void> {
  const canvas = createTechniqueShareCanvas(model, formatId);
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
