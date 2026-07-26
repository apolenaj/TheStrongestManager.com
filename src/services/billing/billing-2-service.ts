/**
 * Billing 2.0 service — capability snapshot for admin.
 */

import {
  buildBilling2Snapshot,
  type Billing2Snapshot,
} from "@/domain/billing/billing-2-snapshot";

export function getBilling2Snapshot(): Billing2Snapshot {
  return buildBilling2Snapshot();
}
