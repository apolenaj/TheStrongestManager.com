"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Alert,
  ButtonLink,
  Input,
  Label,
  Select,
} from "@/design-system";
import {
  DEFAULT_BAR_KG,
  DEFAULT_TRAINING_MAX_FRACTION,
  ESTIMATED_1RM_FORMULAS,
  attemptPlannerRefusalReason,
  computeAttemptPlan,
  computeEstimated1rm,
  computePlateLoading,
  computeRelativeStrength,
  computeTrainingMax,
  computeVolume,
  plateCalculatorRefusalReason,
  relativeStrengthRefusalReason,
  trainingMaxRefusalReason,
  type CalculatorId,
  type Estimated1rmFormula,
  type RelativeStrengthFormula,
} from "@/domain/calculator-suite";
import type { AttemptLift, AttemptRiskPreference } from "@/domain/attempt-selector";
import type { DotsSex } from "@/domain/calculator-suite";

function num(value: string): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : NaN;
}

const E1RM_FORMULA_LABEL_KEYS: Record<Estimated1rmFormula, string> = {
  epley: "formula_epley",
  brzycki: "formula_brzycki",
  lombardi: "formula_lombardi",
  oconner: "formula_oconner",
};

const E1RM_FORMULA_CITE_KEYS: Record<Estimated1rmFormula, string> = {
  epley: "formula_cite_epley",
  brzycki: "formula_cite_brzycki",
  lombardi: "formula_cite_lombardi",
  oconner: "formula_cite_oconner",
};

const e1rmFieldClass =
  "mt-1 w-full border border-[var(--color-border)] bg-zinc-900 px-3 py-2.5 text-[var(--color-foreground)] outline-none transition-colors focus:border-[var(--color-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]";

function Estimated1rmForm() {
  const t = useTranslations("Tool_1RM");
  const [weight, setWeight] = useState("100");
  const [reps, setReps] = useState("5");
  const [formula, setFormula] = useState<Estimated1rmFormula>("epley");
  const weightKg = num(weight);
  const repsN = Math.trunc(num(reps));

  const refusalKey = useMemo(() => {
    if (!(weightKg > 0) || !Number.isFinite(weightKg)) return "refuse_load" as const;
    if (!Number.isInteger(repsN) || repsN < 2) return "refuse_reps_low" as const;
    if (repsN > 12) return "refuse_reps_high" as const;
    return null;
  }, [weightKg, repsN]);

  const result = refusalKey
    ? null
    : computeEstimated1rm({ weightKg, reps: repsN, formula });

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="e1rm-weight">{t("label_load")}</Label>
          <Input
            id="e1rm-weight"
            type="number"
            min={1}
            step={0.5}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className={e1rmFieldClass}
          />
        </div>
        <div>
          <Label htmlFor="e1rm-reps">{t("label_reps")}</Label>
          <Input
            id="e1rm-reps"
            type="number"
            min={2}
            max={12}
            step={1}
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            className={e1rmFieldClass}
          />
        </div>
        <div>
          <Label htmlFor="e1rm-formula">{t("label_formula")}</Label>
          <Select
            id="e1rm-formula"
            value={formula}
            onChange={(e) => setFormula(e.target.value as Estimated1rmFormula)}
            className={e1rmFieldClass}
          >
            {ESTIMATED_1RM_FORMULAS.map((id) => (
              <option key={id} value={id}>
                {t(E1RM_FORMULA_LABEL_KEYS[id])}
              </option>
            ))}
          </Select>
        </div>
      </div>
      {refusalKey ? (
        <Alert tone="warning" title={t("refuse_title")}>
          {t(refusalKey)}
        </Alert>
      ) : result ? (
        <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-zinc-900/80 p-4">
          <p className="font-[family-name:var(--font-heading)] text-3xl font-black tracking-normal">
            {result.displayKg}{" "}
            <span className="text-base font-normal text-[var(--color-muted)]">
              {t("result_unit")}
            </span>
          </p>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            {t(E1RM_FORMULA_CITE_KEYS[formula])}
          </p>
          <p className="mt-2 text-xs text-[var(--color-muted)]">
            {t("disclaimer")}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function PlateForm() {
  const [target, setTarget] = useState("100");
  const [bar, setBar] = useState(String(DEFAULT_BAR_KG));
  const targetKg = num(target);
  const barKg = num(bar);
  const refusal = plateCalculatorRefusalReason({ targetKg, barKg });
  const result = refusal ? null : computePlateLoading({ targetKg, barKg });

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="plate-target">Target (kg)</Label>
          <Input
            id="plate-target"
            type="number"
            min={0}
            step={0.5}
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="plate-bar">Bar (kg)</Label>
          <Input
            id="plate-bar"
            type="number"
            min={0}
            step={0.5}
            value={bar}
            onChange={(e) => setBar(e.target.value)}
            className="mt-1"
          />
        </div>
      </div>
      {refusal ? (
        <Alert tone="warning" title="Cannot compute">
          {refusal}
        </Alert>
      ) : result ? (
        <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 space-y-3">
          <p className="font-[family-name:var(--font-display)] text-2xl">
            {result.loadableKg} kg loadable
            {!result.exact ? (
              <span className="ml-2 text-sm text-[var(--color-muted)]">
                (remainder {result.remainderKg} kg)
              </span>
            ) : null}
          </p>
          <p className="text-sm text-[var(--color-muted)]">
            {result.perSideKg} kg per side
          </p>
          <ul className="text-sm">
            {result.platesPerSide.map((p) => (
              <li key={p.plateKg}>
                {p.countPerSide}× {p.plateKg} kg each side
              </li>
            ))}
          </ul>
          <p className="text-xs text-[var(--color-muted)]">{result.precisionNote}</p>
        </div>
      ) : null}
    </div>
  );
}

const rsFieldClass =
  "mt-1 w-full border border-[var(--color-border)] bg-zinc-900 px-3 py-2.5 text-[var(--color-foreground)] outline-none transition-colors focus:border-[var(--color-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]";

function DotsForm() {
  const t = useTranslations("Tool_RelativeStrength");
  const [formula, setFormula] = useState<RelativeStrengthFormula>("ipf_gl");
  const [sex, setSex] = useState<DotsSex>("male");
  const [bw, setBw] = useState("83");
  const [total, setTotal] = useState("550");
  const input = {
    formula,
    sex,
    bodyweightKg: num(bw),
    totalKg: num(total),
  };
  const refusalKey = relativeStrengthRefusalReason(input);
  const result = refusalKey ? null : computeRelativeStrength(input);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Label htmlFor="rs-formula">{t("label_formula")}</Label>
          <Select
            id="rs-formula"
            value={formula}
            onChange={(e) =>
              setFormula(e.target.value as RelativeStrengthFormula)
            }
            className={rsFieldClass}
          >
            <option value="ipf_gl">{t("formula_ipf_gl")}</option>
            <option value="dots">{t("formula_dots")}</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="rs-sex">{t("label_gender")}</Label>
          <Select
            id="rs-sex"
            value={sex}
            onChange={(e) => setSex(e.target.value as DotsSex)}
            className={rsFieldClass}
          >
            <option value="male">{t("gender_male")}</option>
            <option value="female">{t("gender_female")}</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="rs-bw">{t("label_bw")}</Label>
          <Input
            id="rs-bw"
            type="number"
            min={1}
            step={0.1}
            value={bw}
            onChange={(e) => setBw(e.target.value)}
            className={rsFieldClass}
          />
        </div>
        <div>
          <Label htmlFor="rs-total">{t("label_total")}</Label>
          <Input
            id="rs-total"
            type="number"
            min={1}
            step={0.5}
            value={total}
            onChange={(e) => setTotal(e.target.value)}
            className={rsFieldClass}
          />
        </div>
      </div>
      {refusalKey ? (
        <Alert tone="warning" title={t("refuse_title")}>
          {t(refusalKey)}
        </Alert>
      ) : result ? (
        <div className="space-y-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-zinc-900/80 p-4">
          <p className="font-[family-name:var(--font-heading)] text-3xl font-black tracking-normal">
            {result.displayScore}{" "}
            <span className="text-base font-normal text-[var(--color-muted)]">
              {t(result.unitKey)}
            </span>
          </p>
          {result.bodyweightClamped ? (
            <p className="text-sm text-[var(--color-muted)]">
              {t("clamped", { kg: result.bodyweightUsedKg })}
            </p>
          ) : null}
          <p className="text-xs text-[var(--color-muted)]">
            {t(formula === "ipf_gl" ? "cite_ipf_gl" : "cite_dots")}
          </p>
          <p className="text-xs text-[var(--color-muted)]">{t("disclaimer")}</p>
        </div>
      ) : null}
    </div>
  );
}

function VolumeForm() {
  const [load, setLoad] = useState("100");
  const [reps, setReps] = useState("5");
  const [sets, setSets] = useState("3");
  const [load2, setLoad2] = useState("80");
  const [reps2, setReps2] = useState("8");
  const [sets2, setSets2] = useState("3");

  const result = useMemo(() => {
    const rows = [
      {
        loadKg: num(load),
        reps: Math.trunc(num(reps)),
        sets: Math.trunc(num(sets)),
        label: "Exercise A",
      },
      {
        loadKg: num(load2),
        reps: Math.trunc(num(reps2)),
        sets: Math.trunc(num(sets2)),
        label: "Exercise B",
      },
    ];
    return computeVolume(rows);
  }, [load, reps, sets, load2, reps2, sets2]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="vol-load">A · Load (kg)</Label>
          <Input id="vol-load" type="number" value={load} onChange={(e) => setLoad(e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="vol-reps">A · Reps</Label>
          <Input id="vol-reps" type="number" value={reps} onChange={(e) => setReps(e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="vol-sets">A · Sets</Label>
          <Input id="vol-sets" type="number" value={sets} onChange={(e) => setSets(e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="vol-load2">B · Load (kg)</Label>
          <Input id="vol-load2" type="number" value={load2} onChange={(e) => setLoad2(e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="vol-reps2">B · Reps</Label>
          <Input id="vol-reps2" type="number" value={reps2} onChange={(e) => setReps2(e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="vol-sets2">B · Sets</Label>
          <Input id="vol-sets2" type="number" value={sets2} onChange={(e) => setSets2(e.target.value)} className="mt-1" />
        </div>
      </div>
      {result ? (
        <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 space-y-2">
          <p className="font-[family-name:var(--font-display)] text-2xl">
            {result.totalTonnageKg}{" "}
            <span className="text-base text-[var(--color-muted)]">kg tonnage</span>
          </p>
          <ul className="text-sm text-[var(--color-muted)]">
            {result.rows.map((r) => (
              <li key={r.label}>
                {r.label}: {r.tonnageKg} kg · {r.totalReps} reps
              </li>
            ))}
          </ul>
          <p className="text-xs text-[var(--color-muted)]">{result.precisionNote}</p>
        </div>
      ) : (
        <Alert tone="warning" title="Cannot compute">
          Enter positive load, integer reps, and integer sets for both rows.
        </Alert>
      )}
    </div>
  );
}

function AttemptForm() {
  const [ceiling, setCeiling] = useState("200");
  const [risk, setRisk] = useState<AttemptRiskPreference>("balanced");
  const [lift, setLift] = useState<AttemptLift>("squat");
  const [goal, setGoal] = useState("");
  const input = {
    planningCeilingKg: num(ceiling),
    risk,
    lift,
    goalKg: goal.trim() ? num(goal) : null,
  };
  const refusal = attemptPlannerRefusalReason(input);
  const result = refusal ? null : computeAttemptPlan(input);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Label htmlFor="att-ceiling">Planning ceiling (kg)</Label>
          <Input
            id="att-ceiling"
            type="number"
            value={ceiling}
            onChange={(e) => setCeiling(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="att-lift">Lift</Label>
          <Select
            id="att-lift"
            value={lift}
            onChange={(e) => setLift(e.target.value as AttemptLift)}
            className="mt-1"
          >
            <option value="squat">Squat</option>
            <option value="bench">Bench</option>
            <option value="deadlift">Deadlift</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="att-risk">Risk</Label>
          <Select
            id="att-risk"
            value={risk}
            onChange={(e) => setRisk(e.target.value as AttemptRiskPreference)}
            className="mt-1"
          >
            <option value="conservative">Conservative</option>
            <option value="balanced">Balanced</option>
            <option value="aggressive">Aggressive</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="att-goal">Goal third (optional)</Label>
          <Input
            id="att-goal"
            type="number"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="mt-1"
          />
        </div>
      </div>
      {refusal ? (
        <Alert tone="warning" title="Cannot compute">
          {refusal}
        </Alert>
      ) : result ? (
        <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 space-y-2">
          <p className="font-[family-name:var(--font-display)] text-lg">
            Opener {result.selection.openerKg} · Second {result.selection.secondKg} ·
            Third {result.selection.third.lowKg}–{result.selection.third.highKg} kg
          </p>
          <p className="text-sm text-[var(--color-muted)]">
            {result.selection.third.condition}
          </p>
          <p className="text-xs text-[var(--color-muted)]">{result.precisionNote}</p>
          <ButtonLink href="/app/attempt-selector" variant="secondary" size="sm">
            Open full attempt selector
          </ButtonLink>
        </div>
      ) : null}
    </div>
  );
}

function TrainingMaxForm() {
  const [oneRm, setOneRm] = useState("200");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [fraction, setFraction] = useState(String(DEFAULT_TRAINING_MAX_FRACTION));
  const input = {
    oneRmKg: oneRm.trim() ? num(oneRm) : null,
    weightKg: weight.trim() ? num(weight) : null,
    reps: reps.trim() ? Math.trunc(num(reps)) : null,
    fraction: num(fraction),
  };
  const refusal = trainingMaxRefusalReason(input);
  const result = refusal ? null : computeTrainingMax(input);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Label htmlFor="tm-1rm">1RM (kg)</Label>
          <Input id="tm-1rm" type="number" value={oneRm} onChange={(e) => setOneRm(e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="tm-w">Or load (kg)</Label>
          <Input id="tm-w" type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="tm-r">Or reps</Label>
          <Input id="tm-r" type="number" value={reps} onChange={(e) => setReps(e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="tm-f">Fraction</Label>
          <Input id="tm-f" type="number" min={0.01} max={1} step={0.01} value={fraction} onChange={(e) => setFraction(e.target.value)} className="mt-1" />
        </div>
      </div>
      {refusal ? (
        <Alert tone="warning" title="Cannot compute">
          {refusal}
        </Alert>
      ) : result ? (
        <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 space-y-2">
          <p className="font-[family-name:var(--font-display)] text-3xl">
            {result.displayKg}{" "}
            <span className="text-base text-[var(--color-muted)]">kg TM</span>
          </p>
          <p className="text-sm text-[var(--color-muted)]">
            From {result.oneRmUsedKg} kg ({result.oneRmSource}) × {result.fraction}
          </p>
          <p className="text-xs text-[var(--color-muted)]">{result.precisionNote}</p>
        </div>
      ) : null}
    </div>
  );
}

export function CalculatorTool({ slug }: { slug: CalculatorId }) {
  switch (slug) {
    case "estimated-1rm":
      return <Estimated1rmForm />;
    case "plate-calculator":
      return <PlateForm />;
    case "dots":
      return <DotsForm />;
    case "volume-calculator":
      return <VolumeForm />;
    case "attempt-planner":
      return <AttemptForm />;
    case "training-max":
      return <TrainingMaxForm />;
    default:
      return null;
  }
}
