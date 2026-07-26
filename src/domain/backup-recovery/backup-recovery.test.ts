import { describe, expect, it } from "vitest";
import {
  BACKUP_RECOVERY_AREAS,
  BACKUP_RECOVERY_FINDINGS,
  BACKUP_RECOVERY_HONESTY,
  buildBackupRecoverySnapshot,
} from "@/domain/backup-recovery";

describe("backup and recovery", () => {
  it("covers all prompt documentation areas", () => {
    const areas = new Set(BACKUP_RECOVERY_FINDINGS.map((f) => f.area));
    for (const id of BACKUP_RECOVERY_AREAS) {
      expect(areas.has(id)).toBe(true);
    }
  });

  it("stays honest about no automated backup product", () => {
    expect(BACKUP_RECOVERY_HONESTY.join(" ")).toMatch(/No automated backup/i);
    expect(
      BACKUP_RECOVERY_FINDINGS.some(
        (f) => f.id === "db.postgres_path" && f.status === "planned",
      ),
    ).toBe(true);
    expect(
      BACKUP_RECOVERY_FINDINGS.some(
        (f) => f.id === "video.no_ttl_job" && f.status === "planned",
      ),
    ).toBe(true);
    const snap = buildBackupRecoverySnapshot("2026-07-22T00:00:00.000Z");
    expect(snap.docPath).toBe("docs/DISASTER_RECOVERY.md");
    expect(snap.counts.documented).toBeGreaterThan(0);
  });
});
