import { Alert } from "@/design-system";
import { LEGAL_REVIEW_BANNER } from "@/domain/gdpr-readiness";

/** Marks legal copy as draft — for professional legal review. */
export function LegalReviewAlert({
  surface = "This page",
}: {
  surface?: string;
}) {
  return (
    <Alert tone="warning" title="Draft — for professional legal review">
      {surface} is a <strong>placeholder</strong>. {LEGAL_REVIEW_BANNER} Do not
      treat it as a complete or binding legal statement. Replace after counsel
      review before relying on it in production.
    </Alert>
  );
}
