"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Alert, Badge, Button } from "@/design-system";
import {
  createHumanAnalysisOrderAction,
  type HumanAnalysisActionState,
} from "@/services/human-analysis/actions";
import type { HumanAnalysisProductDefinition } from "@/domain/human-analysis";

const initial: HumanAnalysisActionState = { ok: false };

export function HumanAnalysisCatalog({
  catalog,
  honesty,
  capacityMessage,
  turnaroundPromise,
  checkoutReady,
  orders,
}: {
  catalog: HumanAnalysisProductDefinition[];
  honesty: readonly string[];
  capacityMessage: string;
  turnaroundPromise: string | null;
  checkoutReady: boolean;
  orders: Array<{
    id: string;
    productName: string;
    statusLabel: string;
    status: string;
  }>;
}) {
  return (
    <div className="grid gap-8">
      <Alert tone="info" title="Paid Expert Technique Review">
        {honesty[0]} {honesty[2]}
      </Alert>

      <section className="grid gap-2">
        <h2 className="font-[family-name:var(--font-display)] text-lg">
          Capacity
        </h2>
        <p className="text-sm text-[var(--color-muted)]">{capacityMessage}</p>
        {turnaroundPromise ? (
          <p className="text-sm text-[var(--color-foreground)]">
            Published target: {turnaroundPromise}
          </p>
        ) : (
          <Badge variant="neutral">No turnaround time promised</Badge>
        )}
        {!checkoutReady ? (
          <p className="text-xs text-[var(--color-muted)]">{honesty[3]}</p>
        ) : null}
      </section>

      <section className="grid gap-4">
        <h2 className="font-[family-name:var(--font-display)] text-lg">
          Products
        </h2>
        <ul className="grid gap-4 lg:grid-cols-3">
          {catalog.map((p) => (
            <li
              key={p.sku}
              className="grid gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] p-4"
            >
              <div>
                <h3 className="font-medium">{p.name}</h3>
                <p className="mt-1 text-sm text-[var(--color-muted)]">
                  {p.tagline}
                </p>
              </div>
              <p className="text-sm font-medium">
                {p.formattedPrice ?? "Price not published"}
              </p>
              {p.availabilityNote ? (
                <p className="text-xs text-[var(--color-muted)]">
                  {p.availabilityNote}
                </p>
              ) : null}
              <ul className="list-inside list-disc text-xs text-[var(--color-muted)]">
                {p.uploadRequirements.map((u) => (
                  <li key={u}>{u}</li>
                ))}
              </ul>
              <StartOrderForm productSku={p.sku} />
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-lg">
          Your orders
        </h2>
        {orders.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">No orders yet.</p>
        ) : (
          <ul className="divide-y divide-[var(--color-border)] rounded-[var(--radius-md)] border border-[var(--color-border)]">
            {orders.map((o) => (
              <li
                key={o.id}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
              >
                <span>
                  {o.productName}{" "}
                  <Badge variant="neutral">{o.statusLabel}</Badge>
                </span>
                <Link
                  href={`/app/human-analysis/${o.id}`}
                  className="text-[var(--color-accent)] underline-offset-2 hover:underline"
                >
                  Track status
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StartOrderForm({ productSku }: { productSku: string }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(
    createHumanAnalysisOrderAction,
    initial,
  );

  useEffect(() => {
    if (state.ok && state.orderId) {
      router.push(`/app/human-analysis/${state.orderId}`);
      router.refresh();
    }
  }, [state.ok, state.orderId, router]);

  return (
    <form action={action} className="grid gap-2">
      <input type="hidden" name="productSku" value={productSku} />
      {state.error ? (
        <Alert tone="danger" title="Could not start order">
          {state.error}
        </Alert>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Starting…" : "Start order"}
      </Button>
      <p className="text-xs text-[var(--color-muted)]">
        Creates an order in Awaiting purchase — payment required before queue.
      </p>
    </form>
  );
}
