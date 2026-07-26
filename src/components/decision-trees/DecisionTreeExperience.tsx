"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Alert,
  Badge,
  Button,
  ProgressBar,
} from "@/design-system";
import {
  DECISION_TREE_MEDICAL_DISCLAIMER,
  applyDecisionOption,
  buildDecisionTreeSharePath,
  getOutcomeNode,
  getQuestionNode,
  resolveDecisionTreePath,
  type DecisionTreeDefinition,
  type DecisionTreePathStep,
  type DecisionTreeResult,
} from "@/domain/decision-trees";

export function DecisionTreeExperience({
  tree,
  initialOptionIds = [],
  initialResult = null,
}: {
  tree: DecisionTreeDefinition;
  initialOptionIds?: string[];
  initialResult?: DecisionTreeResult | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [optionIds, setOptionIds] = useState<string[]>(initialOptionIds);
  const [result, setResult] = useState<DecisionTreeResult | null>(initialResult);

  const walk = useMemo(() => {
    const steps: DecisionTreePathStep[] = [];
    let nodeId = tree.startNodeId;
    for (const optionId of optionIds) {
      const applied = applyDecisionOption(tree, nodeId, optionId);
      if (!applied.ok) break;
      steps.push(applied.step);
      nodeId = applied.nextNodeId;
    }
    return { steps, nodeId };
  }, [tree, optionIds]);

  const currentQuestion = getQuestionNode(tree, walk.nodeId);
  const currentOutcome =
    !currentQuestion && result
      ? result.outcome
      : getOutcomeNode(tree, walk.nodeId);

  const depthHint = Math.min(optionIds.length + (currentQuestion ? 1 : 0), 5);
  const progress = currentOutcome
    ? 100
    : Math.round((optionIds.length / Math.max(depthHint, 3)) * 100);

  function choose(optionId: string) {
    if (!currentQuestion) return;
    const applied = applyDecisionOption(tree, currentQuestion.id, optionId);
    if (!applied.ok) return;

    const nextIds = [...optionIds, optionId];
    setOptionIds(nextIds);

    const nextOutcome = getOutcomeNode(tree, applied.nextNodeId);
    if (nextOutcome) {
      const resolved = resolveDecisionTreePath(tree, nextIds);
      if (resolved.ok) {
        setResult(resolved.result);
        startTransition(() => {
          router.replace(resolved.result.sharePath, { scroll: false });
        });
      }
    } else {
      setResult(null);
      startTransition(() => {
        router.replace(buildDecisionTreeSharePath(tree.slug, nextIds), {
          scroll: false,
        });
      });
    }
  }

  function reset() {
    setOptionIds([]);
    setResult(null);
    startTransition(() => {
      router.replace(`/decision-trees/${tree.slug}`, { scroll: false });
    });
  }

  function back() {
    if (optionIds.length === 0) return;
    const nextIds = optionIds.slice(0, -1);
    setOptionIds(nextIds);
    setResult(null);
    startTransition(() => {
      router.replace(buildDecisionTreeSharePath(tree.slug, nextIds), {
        scroll: false,
      });
    });
  }

  return (
    <div className="grid gap-8">
      <Alert tone="warning" title="Not medical advice">
        {DECISION_TREE_MEDICAL_DISCLAIMER}
      </Alert>

      <div className="grid gap-2">
        <ProgressBar
          label="Decision path"
          value={Math.min(progress, 100)}
          tone="accent"
          showValue={!pending}
        />
      </div>

      {currentQuestion ? (
        <section className="grid gap-4">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold sm:text-2xl">
            {currentQuestion.prompt}
          </h2>
          {currentQuestion.help ? (
            <p className="text-sm text-[var(--color-muted)]">
              {currentQuestion.help}
            </p>
          ) : null}
          <div className="grid gap-3">
            {currentQuestion.options.map((opt) => (
              <Button
                key={opt.id}
                type="button"
                variant="secondary"
                className="h-auto justify-start whitespace-normal px-4 py-3 text-left"
                onClick={() => choose(opt.id)}
              >
                {opt.label}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="ghost" onClick={back} disabled={optionIds.length === 0}>
              Back
            </Button>
            <Button type="button" variant="ghost" onClick={reset}>
              Start over
            </Button>
          </div>
        </section>
      ) : null}

      {result && currentOutcome ? (
        <DecisionTreeResultView result={result} onReset={reset} />
      ) : null}

      {walk.steps.length > 0 && !result ? (
        <PathTrail steps={walk.steps} />
      ) : null}
    </div>
  );
}

function DecisionTreeResultView({
  result,
  onReset,
}: {
  result: DecisionTreeResult;
  onReset: () => void;
}) {
  return (
    <div className="grid gap-8">
      <Alert tone="success" title={result.outcome.title}>
        {result.outcome.summary}
      </Alert>

      <section className="grid gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
          Practical guidance
        </h2>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-[var(--color-foreground)]">
          {result.outcome.guidance.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="grid gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
          Caveats
        </h2>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-[var(--color-muted)]">
          {result.outcome.caveats.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="grid gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
          Why this result — rules that applied
        </h2>
        <p className="text-sm text-[var(--color-muted)]">
          Structured rules from your answers. This explanation is the product —
          not a hidden black box.
        </p>
        <ol className="grid gap-3">
          {result.rulesApplied.map((rule, index) => (
            <li
              key={`${rule.ruleId}-${index}`}
              className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="neutral">Step {index + 1}</Badge>
                <span className="text-sm font-medium text-[var(--color-foreground)]">
                  {rule.ruleLabel}
                </span>
              </div>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                {rule.ruleExplanation}
              </p>
              <p className="mt-1 text-xs text-[var(--color-subtle)]">
                <code>{rule.ruleId}</code>
              </p>
            </li>
          ))}
        </ol>
      </section>

      <PathTrail steps={result.path} />

      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={onReset}>
          Run again
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            void navigator.clipboard?.writeText(
              `${window.location.origin}${result.sharePath}`,
            );
          }}
        >
          Copy share link
        </Button>
        <Link
          href="/decision-trees"
          className="inline-flex items-center text-sm text-[var(--color-accent)]"
        >
          All decision trees
        </Link>
      </div>

      <p className="text-xs text-[var(--color-muted)]">
        {DECISION_TREE_MEDICAL_DISCLAIMER}
      </p>
    </div>
  );
}

function PathTrail({ steps }: { steps: DecisionTreePathStep[] }) {
  if (steps.length === 0) return null;
  return (
    <section className="grid gap-2">
      <h3 className="text-sm font-medium text-[var(--color-foreground)]">
        Your path
      </h3>
      <ol className="list-decimal space-y-2 pl-5 text-sm text-[var(--color-muted)]">
        {steps.map((step) => (
          <li key={`${step.nodeId}-${step.optionId}`}>
            <span className="text-[var(--color-foreground)]">{step.prompt}</span>
            {" → "}
            {step.optionLabel}
          </li>
        ))}
      </ol>
    </section>
  );
}
