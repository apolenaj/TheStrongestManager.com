"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Badge,
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/design-system";
import {
  SHARE_CARD_FORMATS,
  type ShareCardFormatId,
} from "@/domain/share-cards";
import {
  buildTechniqueShareCard,
  defaultTechniqueShareFields,
  downloadTechniqueSharePng,
  pickStrongestAndImprove,
  TECHNIQUE_SHARE_FIELD_OPTIONS,
  type TechniqueShareFieldId,
} from "@/domain/technique-share-cards";
import { TechniqueScoreCardPreview } from "@/components/technique-share/TechniqueScoreCardPreview";
import { shareTechniqueCardAction } from "@/services/technique-share/actions";

export type TechniqueShareStudioProps = {
  analysisId: string;
  exerciseLabel: string;
  overallScore: number | null;
  components: Array<{ label: string; score: number | null; status: string }>;
  insightOptions: string[];
  onClose?: () => void;
};

export function TechniqueShareStudio({
  analysisId,
  exerciseLabel,
  overallScore,
  components,
  insightOptions,
  onClose,
}: TechniqueShareStudioProps) {
  const { strongest, improve } = useMemo(
    () => pickStrongestAndImprove(components),
    [components],
  );

  const [formatId, setFormatId] =
    useState<ShareCardFormatId>("instagram_story");
  const [selected, setSelected] = useState<TechniqueShareFieldId[]>(
    defaultTechniqueShareFields(),
  );
  const [insight, setInsight] = useState<string | null>(
    insightOptions[0] ?? null,
  );
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [referralPath, setReferralPath] = useState<string | null>(null);

  const model = useMemo(
    () =>
      buildTechniqueShareCard({
        analysisId,
        exerciseLabel,
        overallScore,
        strongest,
        improve,
        insightOptions,
        selectedInsight: insight,
        selectedFields: selected,
        formatId,
        includeThumbnailInPng: selected.includes("thumbnail"),
      }),
    [
      analysisId,
      exerciseLabel,
      overallScore,
      strongest,
      improve,
      insightOptions,
      insight,
      selected,
      formatId,
    ],
  );

  function toggle(id: TechniqueShareFieldId) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function onDownload() {
    start(async () => {
      setMessage(null);
      try {
        await downloadTechniqueSharePng(
          model,
          formatId,
          `thestrongestmanager-technique-${formatId}.png`,
        );
        setMessage("PNG downloaded.");
      } catch {
        setMessage("Could not export PNG in this browser.");
      }
    });
  }

  function onShare() {
    start(async () => {
      setMessage(null);
      const result = await shareTechniqueCardAction(analysisId, model);
      if (!result.ok || !result.path) {
        setMessage(result.error ?? "Could not create share link.");
        return;
      }
      const url = `${window.location.origin}${result.path}`;
      setReferralPath(result.referralPath ?? null);
      try {
        await navigator.clipboard.writeText(url);
        setMessage("Share link copied.");
      } catch {
        setMessage(url);
      }
    });
  }

  function onCopyReferral() {
    if (!referralPath) return;
    start(async () => {
      const url = `${window.location.origin}${referralPath}`;
      try {
        await navigator.clipboard.writeText(url);
        setMessage("Referral URL copied.");
      } catch {
        setMessage(url);
      }
    });
  }

  return (
    <Card elevated className="grid gap-6">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-xl tracking-tight">
            Technique score card
          </CardTitle>
          {onClose ? (
            <Button type="button" variant="ghost" onClick={onClose}>
              Close
            </Button>
          ) : null}
        </div>
        <CardDescription>
          Share score, strongest/improve, and one insight — with an Analyze your
          lift CTA and referral-ready URL. Thumbnail is PNG-only (never a public
          video link).
        </CardDescription>
      </CardHeader>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="grid gap-5">
          <div className="grid gap-2">
            <p className="text-sm font-medium">Format</p>
            <div className="flex flex-wrap gap-2">
              {SHARE_CARD_FORMATS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFormatId(f.id)}
                  className={`rounded-md border px-3 py-1.5 text-sm transition ${
                    formatId === f.id
                      ? "border-[var(--color-accent)] bg-[var(--color-accent-muted)] text-[var(--color-accent)]"
                      : "border-[var(--color-border)] text-[var(--color-muted)]"
                  }`}
                >
                  {f.label}
                  {f.optional ? " (optional)" : ""}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <p className="text-sm font-medium">What to share</p>
            <ul className="grid gap-2">
              {TECHNIQUE_SHARE_FIELD_OPTIONS.map((opt) => (
                <li key={opt.id}>
                  <label className="flex cursor-pointer items-start gap-3 rounded-md border border-[var(--color-border)] px-3 py-2 text-sm">
                    <input
                      type="checkbox"
                      className="mt-1 accent-[var(--color-accent)]"
                      checked={selected.includes(opt.id)}
                      onChange={() => toggle(opt.id)}
                    />
                    <span>
                      <span className="font-medium">{opt.label}</span>
                      {opt.privateByDefault ? (
                        <Badge variant="neutral" className="ml-2">
                          Private by default
                        </Badge>
                      ) : null}
                      <span className="mt-0.5 block text-xs text-[var(--color-muted)]">
                        {opt.description}
                      </span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </div>

          {selected.includes("insight") && insightOptions.length > 0 ? (
            <div className="grid gap-2">
              <p className="text-sm font-medium">One insight</p>
              <select
                className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
                value={insight ?? ""}
                onChange={(e) => setInsight(e.target.value || null)}
              >
                {insightOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={onDownload} disabled={pending}>
              Download PNG
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onShare}
              disabled={pending}
            >
              Copy share link
            </Button>
            {referralPath ? (
              <Button
                type="button"
                variant="ghost"
                onClick={onCopyReferral}
                disabled={pending}
              >
                Copy referral URL
              </Button>
            ) : null}
          </div>
          {message ? (
            <p className="text-xs text-[var(--color-muted)] break-all">
              {message}
            </p>
          ) : null}
          {referralPath ? (
            <p className="text-xs text-[var(--color-muted)] break-all">
              Referral: {referralPath}
            </p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <p className="text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">
            Preview
          </p>
          <TechniqueScoreCardPreview
            model={model}
            className="mx-auto w-full max-w-sm overflow-hidden rounded-lg border border-[var(--color-border)]"
          />
        </div>
      </div>
    </Card>
  );
}
