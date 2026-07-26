/**
 * Accessibility 2.0 service — WCAG audit snapshot for admin.
 */

import {
  buildAccessibilityAuditSnapshot,
  type AccessibilityAuditSnapshot,
} from "@/domain/accessibility-system";

export function getAccessibilityAuditSnapshot(): AccessibilityAuditSnapshot {
  return buildAccessibilityAuditSnapshot();
}
