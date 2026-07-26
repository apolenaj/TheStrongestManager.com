/**
 * Enterprise Security Prep — admin snapshot for B2B procurement.
 */

import {
  buildEnterpriseSecuritySnapshot,
  type EnterpriseSecuritySnapshot,
} from "@/domain/enterprise-security";

export function getEnterpriseSecuritySnapshot(): EnterpriseSecuritySnapshot {
  return buildEnterpriseSecuritySnapshot();
}
