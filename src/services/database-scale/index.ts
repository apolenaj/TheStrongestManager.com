/**
 * Database Scale Audit service — snapshot for admin.
 */

import {
  buildDatabaseScaleSnapshot,
  type DatabaseScaleSnapshot,
} from "@/domain/database-scale";

export function getDatabaseScaleSnapshot(): DatabaseScaleSnapshot {
  return buildDatabaseScaleSnapshot();
}
