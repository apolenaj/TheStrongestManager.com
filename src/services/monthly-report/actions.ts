"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/services/auth/session";
import { createMonthlyReportShare } from "@/services/monthly-report/monthly-report-service";

export type MonthlyReportActionState = {
  ok: boolean;
  error?: string;
  sharePath?: string;
};

export async function createMonthlyReportShareAction(
  _prev: MonthlyReportActionState,
  formData: FormData,
): Promise<MonthlyReportActionState> {
  const session = await requireSession();
  const monthKey = String(formData.get("monthKey") ?? "").trim() || null;
  const result = await createMonthlyReportShare({
    userId: session.user.id,
    monthKey,
  });
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath("/app/monthly-report");
  return { ok: true, sharePath: result.path };
}
