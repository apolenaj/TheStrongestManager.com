"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/services/admin/require-admin";
import { dryRunResearchLibraryImport } from "@/services/research-library";

export type ResearchImportActionState = {
  ok: boolean;
  error?: string;
  message?: string;
  accepted?: number;
  rejected?: number;
  rejectionReasons?: string[];
};

export async function dryRunResearchLibraryImportAction(
  _prev: ResearchImportActionState,
  formData: FormData,
): Promise<ResearchImportActionState> {
  await requireAdmin();

  const formatRaw = String(formData.get("format") ?? "csv");
  const format = formatRaw === "json" ? "json" : "csv";
  const payload = String(formData.get("payload") ?? "");

  if (!payload.trim()) {
    return { ok: false, error: "Paste CSV or JSON to dry-run import." };
  }

  const result = await dryRunResearchLibraryImport({ format, payload });
  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  revalidatePath("/app/admin/research");
  return {
    ok: true,
    message:
      "Dry-run complete. Accepted rows are validated only — the curated catalog is not auto-written (prevents invented citations from shipping).",
    accepted: result.result.accepted.length,
    rejected: result.result.rejected.length,
    rejectionReasons: result.result.rejected.map(
      (r) => `Row ${r.rowIndex + 1}: ${r.reason}`,
    ),
  };
}
