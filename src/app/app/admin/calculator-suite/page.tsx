import { ComingSoon } from "@/components/ui/ComingSoon";
import { CalculatorSuitePanel } from "@/components/calculator-suite/CalculatorSuitePanel";
import { featureFlags } from "@/config/feature-flags";
import { requireAdmin } from "@/services/admin/require-admin";
import { getCalculatorSuiteSnapshot } from "@/services/calculator-suite";

export default async function AdminCalculatorSuitePage() {
  await requireAdmin();

  if (!featureFlags.calculatorSuite) {
    return (
      <ComingSoon
        title="Calculator Suite"
        description="Training calculators are not enabled yet."
        reason="Set NEXT_PUBLIC_FF_CALCULATOR_SUITE=true to review allowlisted tools that lead into the platform."
      />
    );
  }

  const snapshot = getCalculatorSuiteSnapshot();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          Calculator suite
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Useful tools with precision honesty and product CTAs. Generated{" "}
          {new Date(snapshot.generatedAt).toLocaleString("en-US")}.
        </p>
      </div>
      <CalculatorSuitePanel snapshot={snapshot} />
    </div>
  );
}
