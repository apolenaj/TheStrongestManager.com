import Link from "next/link";
import {
  Alert,
  Badge,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  Input,
  Label,
  Select,
} from "@/design-system";
import {
  FATIGUE_PROFILE_LABELS,
  METHOD_CATEGORY_LABELS,
  type MethodListItem,
} from "@/domain/methods/types";
import { listMethodCategories } from "@/domain/methods/search";

export function MethodsIndex({
  methods,
  basePath,
  q,
  category,
}: {
  methods: MethodListItem[];
  basePath: "/methods" | "/app/methods";
  q: string;
  category: string;
}) {
  const categories = listMethodCategories();

  return (
    <div className="space-y-8">
      <Alert tone="info" title="History ≠ evidence verdict">
        Method pages separate historical description from modern interpretation.
        Coaching practice is labeled honestly — we do not invent citations.
      </Alert>

      <p className="text-sm text-[var(--color-muted)]">
        Compare 2–3 methods side by side —{" "}
        <Link href="/compare" className="text-[var(--color-accent)]">
          open comparison
        </Link>
        {" · "}
        <Link
          href="/compare?methods=daily-undulating-periodization,block-periodization"
          className="text-[var(--color-accent)]"
        >
          example: DUP vs Block
        </Link>
        {" · "}
        <Link href="/history" className="text-[var(--color-accent)]">
          training history timeline
        </Link>
        {" · "}
        <Link href="/fit" className="text-[var(--color-accent)]">
          what fits me?
        </Link>
        .
      </p>

      <form
        className="grid gap-3 sm:grid-cols-[1fr_14rem_auto_auto]"
        action={basePath}
        method="get"
      >
        <div>
          <Label htmlFor="methods-q">Search</Label>
          <Input
            id="methods-q"
            name="q"
            defaultValue={q}
            className="min-h-12"
            placeholder="e.g. conjugate, DUP, volume"
          />
        </div>
        <div>
          <Label htmlFor="methods-category">Category</Label>
          <Select
            id="methods-category"
            name="category"
            defaultValue={category}
            className="min-h-12"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-accent)] px-5 text-sm font-medium text-[var(--color-accent-foreground)] sm:w-auto"
          >
            Apply
          </button>
        </div>
        <div className="flex items-end">
          <Link
            href={basePath}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] px-5 text-sm font-medium text-[var(--color-foreground)] sm:w-auto"
          >
            Reset
          </Link>
        </div>
      </form>

      {methods.length === 0 ? (
        <EmptyState
          title="No methods match"
          description="Try another category or clear the search. The catalog is curated — not hundreds of thin stubs."
        />
      ) : (
        <ul className="grid gap-4">
          {methods.map((method) => (
            <li key={method.slug}>
              <Link
                href={`${basePath}/${method.slug}`}
                className="block rounded-[var(--radius-md)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
              >
                <Card className="transition-colors hover:bg-[var(--color-surface-elevated)]">
                  <CardHeader>
                    <div className="flex flex-wrap gap-2">
                      {method.categories.map((c) => (
                        <Badge key={c} variant="neutral">
                          {METHOD_CATEGORY_LABELS[c]}
                        </Badge>
                      ))}
                      <Badge variant="accent">
                        Fatigue · {FATIGUE_PROFILE_LABELS[method.fatigueProfile]}
                      </Badge>
                    </div>
                    <CardTitle>{method.name}</CardTitle>
                    <CardDescription>{method.summary}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
