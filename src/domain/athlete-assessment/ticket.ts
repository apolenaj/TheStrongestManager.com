export type AthleteAssessmentTicketPayload = {
  tid: string;
  exp: number;
  scope: "athlete_assessment";
};

export function isAthleteAssessmentTicketPayload(
  value: unknown,
): value is AthleteAssessmentTicketPayload {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.tid === "string" &&
    v.tid.length >= 8 &&
    typeof v.exp === "number" &&
    v.scope === "athlete_assessment"
  );
}
