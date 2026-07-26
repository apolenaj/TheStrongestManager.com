import Link from "next/link";
import { Alert, Badge } from "@/design-system";
import {
  DECISION_TREE_HONESTY,
  decisionTreePath,
  type DecisionTreeDefinition,
} from "@/domain/decision-trees";

export function DecisionTreeIndex({
  trees,
}: {
  trees: DecisionTreeDefinition[];
}) {
  return (
    <div className="grid gap-10">
      <Alert tone="info" title="Structured coaching rules">
        {DECISION_TREE_HONESTY[0]}
      </Alert>
      <Alert tone="warning" title="Not a medical tool">
        {DECISION_TREE_HONESTY[1]} {DECISION_TREE_HONESTY[2]}
      </Alert>

      <ul className="grid gap-4">
        {trees.map((tree) => (
          <li key={tree.slug}>
            <Link
              href={decisionTreePath(tree.slug)}
              className="group block border-b border-[var(--color-border)] pb-4 transition-colors hover:border-[var(--color-accent)]"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="accent">Decision tree</Badge>
              </div>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-xl text-[var(--color-foreground)] group-hover:text-[var(--color-accent)]">
                {tree.question}
              </h2>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                {tree.description}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      <p className="text-sm text-[var(--color-muted)]">
        Related:{" "}
        <Link href="/fit" className="text-[var(--color-accent)]">
          Approach fit
        </Link>
        ,{" "}
        <Link href="/myths" className="text-[var(--color-accent)]">
          Myth vs Reality
        </Link>
        ,{" "}
        <Link href="/methods" className="text-[var(--color-accent)]">
          Training methods
        </Link>
        .
      </p>
    </div>
  );
}
