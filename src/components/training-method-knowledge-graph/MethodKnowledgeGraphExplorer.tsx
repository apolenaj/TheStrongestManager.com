"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/design-system";
import {
  METHOD_GRAPH_NODE_KIND_LABELS,
  methodGraphNodeKey,
  type MethodGraphNeighbor,
  type MethodGraphNode,
  type MethodGraphNodeKind,
  type MethodGraphPathStep,
  type TrainingMethodKnowledgeGraph,
} from "@/domain/training-method-knowledge-graph";

type Props = {
  graph: TrainingMethodKnowledgeGraph;
  featuredWalk: MethodGraphPathStep[] | null;
  initialNeighbors: MethodGraphNeighbor[];
};

function kindBadge(kind: MethodGraphNodeKind) {
  return METHOD_GRAPH_NODE_KIND_LABELS[kind];
}

export function MethodKnowledgeGraphExplorer({
  graph,
  featuredWalk,
  initialNeighbors,
}: Props) {
  const [path, setPath] = useState<MethodGraphPathStep[]>(
    featuredWalk?.slice(0, 1) ??
      (graph.featuredPath[0] ? [graph.featuredPath[0]] : []),
  );
  const [neighbors, setNeighbors] =
    useState<MethodGraphNeighbor[]>(initialNeighbors);
  const [, startTransition] = useTransition();

  const focus = path[path.length - 1] ?? null;
  const focusNode: MethodGraphNode | null = useMemo(() => {
    if (!focus) return null;
    return (
      graph.nodes.find((n) => n.kind === focus.kind && n.id === focus.id) ??
      null
    );
  }, [focus, graph.nodes]);

  const neighborIndex = useMemo(() => {
    const map = new Map<string, MethodGraphNeighbor[]>();
    for (const node of graph.nodes) {
      const key = methodGraphNodeKey(node.kind, node.id);
      const list: MethodGraphNeighbor[] = [];
      for (const edge of graph.edges) {
        if (edge.fromKind === node.kind && edge.fromId === node.id) {
          const target = graph.nodes.find(
            (n) => n.kind === edge.toKind && n.id === edge.toId,
          );
          if (target) {
            list.push({ edge, node: target, direction: "outgoing" });
          }
        } else if (edge.toKind === node.kind && edge.toId === node.id) {
          const source = graph.nodes.find(
            (n) => n.kind === edge.fromKind && n.id === edge.fromId,
          );
          if (source) {
            list.push({ edge, node: source, direction: "incoming" });
          }
        }
      }
      map.set(key, list);
    }
    return map;
  }, [graph.edges, graph.nodes]);

  function selectNode(step: MethodGraphPathStep, replacePath?: MethodGraphPathStep[]) {
    startTransition(() => {
      const nextPath = replacePath ?? [...path, step];
      // Avoid duplicate consecutive nodes
      const last = nextPath[nextPath.length - 1];
      const prev = nextPath[nextPath.length - 2];
      const cleaned =
        last && prev && last.kind === prev.kind && last.id === prev.id
          ? nextPath.slice(0, -1)
          : nextPath;
      setPath(cleaned);
      const tip = cleaned[cleaned.length - 1];
      if (!tip) return;
      setNeighbors(
        neighborIndex.get(methodGraphNodeKey(tip.kind, tip.id)) ?? [],
      );
    });
  }

  function loadFeaturedPath() {
    if (!featuredWalk || featuredWalk.length === 0) return;
    startTransition(() => {
      setPath(featuredWalk);
      const tip = featuredWalk[featuredWalk.length - 1]!;
      setNeighbors(
        neighborIndex.get(methodGraphNodeKey(tip.kind, tip.id)) ?? [],
      );
    });
  }

  function jumpToStep(index: number) {
    startTransition(() => {
      const next = path.slice(0, index + 1);
      setPath(next);
      const tip = next[next.length - 1];
      if (!tip) return;
      setNeighbors(
        neighborIndex.get(methodGraphNodeKey(tip.kind, tip.id)) ?? [],
      );
    });
  }

  function resetToStart() {
    const start = graph.featuredPath[0];
    if (!start) return;
    selectNode(start, [start]);
  }

  const outgoing = neighbors.filter((n) => n.direction === "outgoing");
  const incoming = neighbors.filter((n) => n.direction === "incoming");

  return (
    <div className="grid gap-8">
      <Alert tone="info" title="Educational exploration">
        {graph.honesty[0]} {graph.honesty[1]}
      </Alert>

      <section className="grid gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
            Featured path
          </h2>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={loadFeaturedPath}>
              Play Conjugate → Powerlifting
            </Button>
            <Button type="button" variant="secondary" onClick={resetToStart}>
              Reset
            </Button>
          </div>
        </div>
        <p className="text-sm text-[var(--color-muted)]">
          Example: Conjugate → Westside → Max effort → Dynamic effort →
          Powerlifting. Click a step to jump back; expand neighbors below to
          explore.
        </p>
        <ol className="flex flex-wrap items-center gap-2">
          {(featuredWalk ?? graph.featuredPath).map((step, index) => {
            const inCurrent = path.some(
              (p) => p.kind === step.kind && p.id === step.id,
            );
            return (
              <li key={`${step.kind}:${step.id}`} className="flex items-center gap-2">
                {index > 0 ? (
                  <span className="text-[var(--color-muted)]" aria-hidden>
                    →
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={() =>
                    selectNode(
                      step,
                      (featuredWalk ?? graph.featuredPath).slice(0, index + 1),
                    )
                  }
                  className={`rounded-[var(--radius-md)] border px-3 py-1.5 text-sm transition-colors ${
                    inCurrent
                      ? "border-[var(--color-accent)] bg-[var(--color-accent-muted)] text-[var(--color-accent)]"
                      : "border-[var(--color-border)] hover:border-[var(--color-accent)]/40"
                  }`}
                >
                  {step.label}
                </button>
              </li>
            );
          })}
        </ol>
        {featuredWalk &&
        path.length === featuredWalk.length &&
        path.every((p, i) => p.id === featuredWalk[i]?.id) ? (
          <Badge variant="success">Featured path complete</Badge>
        ) : null}
      </section>

      <section className="grid gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
          Your trail
        </h2>
        {path.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">
            Select a starting node to begin.
          </p>
        ) : (
          <ol className="flex flex-wrap items-center gap-2">
            {path.map((step, index) => (
              <li
                key={`trail-${index}-${step.kind}:${step.id}`}
                className="flex items-center gap-2"
              >
                {index > 0 ? (
                  <span className="text-[var(--color-muted)]" aria-hidden>
                    →
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={() => jumpToStep(index)}
                  className={`rounded-[var(--radius-md)] border px-3 py-1.5 text-sm ${
                    index === path.length - 1
                      ? "border-[var(--color-accent)] font-medium"
                      : "border-[var(--color-border)]"
                  }`}
                >
                  {step.label}
                </button>
              </li>
            ))}
          </ol>
        )}
      </section>

      {focusNode ? (
        <Card>
          <CardHeader>
            <div className="flex flex-wrap gap-2">
              <Badge variant="accent">{kindBadge(focusNode.kind)}</Badge>
            </div>
            <CardTitle>{focusNode.label}</CardTitle>
            <CardDescription>{focusNode.summary}</CardDescription>
          </CardHeader>
          <div className="px-6 pb-6 text-sm">
            {focusNode.href ? (
              <Link
                href={focusNode.href}
                className="text-[var(--color-accent)] underline-offset-2 hover:underline"
              >
                Open related page
              </Link>
            ) : (
              <span className="text-[var(--color-muted)]">
                No dedicated page — educational node only.
              </span>
            )}
          </div>
        </Card>
      ) : null}

      <section className="grid gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
          Neighbors
        </h2>
        <p className="text-sm text-[var(--color-muted)]">
          Curated edges only — click to extend your trail.
        </p>

        {outgoing.length > 0 ? (
          <div className="grid gap-2">
            <h3 className="text-sm font-medium">Outgoing</h3>
            <ul className="grid gap-2 sm:grid-cols-2">
              {outgoing.map((n) => (
                <li key={`out-${n.edge.relation}-${n.node.kind}:${n.node.id}`}>
                  <button
                    type="button"
                    onClick={() =>
                      selectNode({
                        kind: n.node.kind,
                        id: n.node.id,
                        label: n.node.label,
                        href: n.node.href,
                      })
                    }
                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-3 text-left text-sm transition-colors hover:border-[var(--color-accent)]/40"
                  >
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="neutral">{n.edge.relation}</Badge>
                      <Badge variant="neutral">{kindBadge(n.node.kind)}</Badge>
                    </div>
                    <p className="mt-2 font-medium">{n.node.label}</p>
                    <p className="mt-1 text-[var(--color-muted)]">{n.edge.note}</p>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {incoming.length > 0 ? (
          <div className="grid gap-2">
            <h3 className="text-sm font-medium">Incoming</h3>
            <ul className="grid gap-2 sm:grid-cols-2">
              {incoming.map((n) => (
                <li key={`in-${n.edge.relation}-${n.node.kind}:${n.node.id}`}>
                  <button
                    type="button"
                    onClick={() =>
                      selectNode({
                        kind: n.node.kind,
                        id: n.node.id,
                        label: n.node.label,
                        href: n.node.href,
                      })
                    }
                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-3 text-left text-sm transition-colors hover:border-[var(--color-accent)]/40"
                  >
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="neutral">{n.edge.relation}</Badge>
                      <Badge variant="neutral">{kindBadge(n.node.kind)}</Badge>
                    </div>
                    <p className="mt-2 font-medium">{n.node.label}</p>
                    <p className="mt-1 text-[var(--color-muted)]">{n.edge.note}</p>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {neighbors.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">
            No curated neighbors for this node.
          </p>
        ) : null}
      </section>

      <section className="grid gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
          Browse starting points
        </h2>
        <ul className="flex flex-wrap gap-2">
          {graph.nodes
            .filter((n) => n.kind === "method")
            .map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() =>
                    selectNode(
                      {
                        kind: n.kind,
                        id: n.id,
                        label: n.label,
                        href: n.href,
                      },
                      [
                        {
                          kind: n.kind,
                          id: n.id,
                          label: n.label,
                          href: n.href,
                        },
                      ],
                    )
                  }
                  className="rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-1.5 text-sm hover:border-[var(--color-accent)]/40"
                >
                  {n.label}
                </button>
              </li>
            ))}
        </ul>
      </section>

      <p className="text-xs text-[var(--color-muted)]">
        {graph.honesty[2]} Engine {graph.engineVersion}. Nodes {graph.nodes.length}{" "}
        · Edges {graph.edges.length}.
      </p>
    </div>
  );
}
