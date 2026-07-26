"use client";

import { useState } from "react";
import { Button } from "@/design-system";
import { TechniqueShareStudio } from "@/components/technique-share/TechniqueShareStudio";

export function TechniqueShareSection({
  analysisId,
  exerciseLabel,
  overallScore,
  components,
  insightOptions,
}: {
  analysisId: string;
  exerciseLabel: string;
  overallScore: number | null;
  components: Array<{ label: string; score: number | null; status: string }>;
  insightOptions: string[];
}) {
  const [open, setOpen] = useState(false);

  if (overallScore == null && components.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-3">
      <Button type="button" variant="secondary" onClick={() => setOpen((o) => !o)}>
        {open ? "Hide technique card" : "Share technique score card"}
      </Button>
      {open ? (
        <TechniqueShareStudio
          analysisId={analysisId}
          exerciseLabel={exerciseLabel}
          overallScore={overallScore}
          components={components}
          insightOptions={insightOptions}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </div>
  );
}
