"use client";

import { useMemo, type CSSProperties } from "react";
import {
  getShareCardFormat,
  SHARE_CARD_PALETTE,
} from "@/domain/share-cards";
import type { TechniqueShareCardModel } from "@/domain/technique-share-cards";

export function TechniqueScoreCardPreview({
  model,
  className,
}: {
  model: TechniqueShareCardModel;
  className?: string;
}) {
  const format = getShareCardFormat(model.formatId);
  const aspect = `${format.width} / ${format.height}`;

  const style = useMemo(
    (): CSSProperties => ({
      aspectRatio: aspect,
      background: `linear-gradient(145deg, ${SHARE_CARD_PALETTE.background} 0%, #121214 50%, #0c0c0e 100%)`,
      color: SHARE_CARD_PALETTE.foreground,
      borderTop: `3px solid ${SHARE_CARD_PALETTE.accent}`,
      boxShadow: "inset 0 0 100px rgba(212, 160, 23, 0.08)",
    }),
    [aspect],
  );

  return (
    <div
      className={className}
      style={style}
      role="img"
      aria-label={`${model.eyebrow}${model.scoreLine ? ` ${model.scoreLine}` : ""}`}
    >
      <div className="flex h-full flex-col justify-between p-[8%] pb-[6%]">
        <div className="grid gap-3">
          {model.includeThumbnailInPng ? (
            <div
              className="flex aspect-video items-center justify-center rounded-md text-xs"
              style={{
                background: "#1a1a1e",
                color: SHARE_CARD_PALETTE.muted,
                border: `1px solid ${SHARE_CARD_PALETTE.border}`,
              }}
            >
              Lift thumbnail
            </div>
          ) : null}
          <p
            className="text-[clamp(0.65rem,2.6vw,0.9rem)] font-semibold uppercase tracking-[0.14em]"
            style={{ color: SHARE_CARD_PALETTE.accent }}
          >
            {model.eyebrow}
          </p>
          {model.scoreLine ? (
            <p className="font-[family-name:var(--font-display)] text-[clamp(2.4rem,12vw,4rem)] font-bold leading-none tracking-tight">
              {model.scoreLine}
            </p>
          ) : null}
          <div className="mt-2 grid gap-3">
            {model.strongestLine ? (
              <div>
                <p
                  className="text-[clamp(0.55rem,2vw,0.7rem)] uppercase tracking-[0.1em]"
                  style={{ color: SHARE_CARD_PALETTE.muted }}
                >
                  Strongest
                </p>
                <p className="text-[clamp(1rem,4vw,1.4rem)] font-semibold">
                  {model.strongestLine}
                </p>
              </div>
            ) : null}
            {model.improveLine ? (
              <div>
                <p
                  className="text-[clamp(0.55rem,2vw,0.7rem)] uppercase tracking-[0.1em]"
                  style={{ color: SHARE_CARD_PALETTE.muted }}
                >
                  Improve
                </p>
                <p className="text-[clamp(1rem,4vw,1.4rem)] font-semibold">
                  {model.improveLine}
                </p>
              </div>
            ) : null}
            {model.insightLine ? (
              <div>
                <p
                  className="text-[clamp(0.55rem,2vw,0.7rem)] uppercase tracking-[0.1em]"
                  style={{ color: SHARE_CARD_PALETTE.muted }}
                >
                  Insight
                </p>
                <p className="text-[clamp(0.85rem,3vw,1.05rem)] leading-snug">
                  {model.insightLine}
                </p>
              </div>
            ) : null}
          </div>
        </div>
        <div className="grid gap-2">
          <span
            className="inline-flex w-fit rounded-md px-3 py-1.5 text-[clamp(0.7rem,2.5vw,0.85rem)] font-bold"
            style={{
              background: SHARE_CARD_PALETTE.accent,
              color: SHARE_CARD_PALETTE.background,
            }}
          >
            {model.cta}
          </span>
          <p
            className="text-[clamp(0.7rem,2.6vw,0.95rem)] font-semibold"
            style={{ color: SHARE_CARD_PALETTE.accent }}
          >
            {model.brand}
          </p>
          <p
            className="text-[clamp(0.45rem,1.6vw,0.6rem)]"
            style={{ color: SHARE_CARD_PALETTE.muted }}
          >
            {model.honestyFootnote}
          </p>
        </div>
      </div>
    </div>
  );
}
