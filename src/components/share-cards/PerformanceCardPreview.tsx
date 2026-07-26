"use client";

import { useMemo, type CSSProperties } from "react";
import {
  getShareCardFormat,
  SHARE_CARD_PALETTE,
  type ShareCardModel,
} from "@/domain/share-cards";

/**
 * Live CSS preview of the share card (mirrors canvas export branding).
 */
export function PerformanceCardPreview({
  model,
  className,
}: {
  model: ShareCardModel;
  className?: string;
}) {
  const format = getShareCardFormat(model.formatId);
  const aspect = `${format.width} / ${format.height}`;
  const stats = model.lines.filter((l) => l.kind === "stat");
  const brand =
    model.lines.find((l) => l.kind === "brand")?.value ?? model.brand;

  const style = useMemo(
    (): CSSProperties => ({
      aspectRatio: aspect,
      background: `linear-gradient(145deg, ${SHARE_CARD_PALETTE.background} 0%, #121214 45%, #0c0c0e 100%)`,
      color: SHARE_CARD_PALETTE.foreground,
    }),
    [aspect],
  );

  return (
    <div
      className={className}
      style={style}
      data-format={model.formatId}
      role="img"
      aria-label={`${model.eyebrow}: ${model.headline}`}
    >
      <div
        className="h-full w-full overflow-hidden"
        style={{
          borderTop: `3px solid ${SHARE_CARD_PALETTE.accent}`,
          boxShadow: "inset 0 0 120px rgba(212, 160, 23, 0.08)",
        }}
      >
        <div className="flex h-full flex-col justify-between p-[8%] pb-[6%]">
          <div className="grid gap-[4%]">
            <p
              className="text-[clamp(0.65rem,2.8vw,0.95rem)] font-semibold uppercase tracking-[0.14em]"
              style={{ color: SHARE_CARD_PALETTE.accent }}
            >
              {model.eyebrow}
            </p>
            <p className="font-[family-name:var(--font-display)] text-[clamp(1.6rem,8vw,3.2rem)] font-bold leading-[1.05] tracking-tight">
              {model.headline}
            </p>
            <div className="mt-[4%] grid gap-[3.5%]">
              {stats.map((line, i) => (
                <div key={i}>
                  {line.label ? (
                    <p
                      className="text-[clamp(0.55rem,2.2vw,0.75rem)] font-medium uppercase tracking-[0.1em]"
                      style={{ color: SHARE_CARD_PALETTE.muted }}
                    >
                      {line.label}
                    </p>
                  ) : null}
                  <p className="text-[clamp(1rem,4.2vw,1.6rem)] font-semibold tracking-tight">
                    {line.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-1">
            <p
              className="text-[clamp(0.7rem,2.8vw,1rem)] font-semibold"
              style={{ color: SHARE_CARD_PALETTE.accent }}
            >
              {brand}
            </p>
            <p
              className="text-[clamp(0.5rem,1.8vw,0.65rem)]"
              style={{ color: SHARE_CARD_PALETTE.muted }}
            >
              {model.honestyFootnote}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
