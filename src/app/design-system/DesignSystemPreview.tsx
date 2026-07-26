"use client";

import { useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  ChartCard,
  Checkbox,
  DataTable,
  Drawer,
  Dropdown,
  EmptyState,
  ErrorState,
  IconButton,
  Input,
  Label,
  MetricCard,
  Modal,
  ProgressBar,
  ScoreRing,
  Select,
  Skeleton,
  SkeletonBlock,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Tooltip,
  scoreLabels,
  type ScoreLevel,
} from "@/design-system";

const scoreLevels: ScoreLevel[] = [
  "excellent",
  "good",
  "needsAttention",
  "critical",
];

const sampleRows = [
  { id: "1", lift: "Back squat", load: "140 kg", note: "Session logged" },
  { id: "2", lift: "Bench press", load: "100 kg", note: "Session logged" },
];

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 border-t border-[var(--color-border)] pt-10"
    >
      <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
        {title}
      </h2>
      <div className="mt-6 space-y-6">{children}</div>
    </section>
  );
}

export function DesignSystemPreview() {
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <header className="mb-12">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-accent)]">
          Development only
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight sm:text-5xl">
          Design system
        </h1>
        <p className="mt-4 max-w-2xl text-[var(--color-muted)]">
          Premium strength-performance technology tokens and components.
          This page is blocked in production unless{" "}
          <code className="text-[var(--color-foreground)]">ALLOW_DESIGN_SYSTEM=true</code>.
        </p>
      </header>

      <nav aria-label="Design system sections" className="mb-10 flex flex-wrap gap-2">
        {[
          "Colors",
          "Typography",
          "Buttons",
          "Feedback",
          "Data",
          "Forms",
          "Overlays",
          "Scores",
        ].map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase()}`}
            className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
          >
            {item}
          </a>
        ))}
      </nav>

      <div className="space-y-4">
        <Section id="colors" title="Colors">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Background", "var(--color-background)"],
              ["Surface", "var(--color-surface)"],
              ["Elevated", "var(--color-surface-elevated)"],
              ["Accent", "var(--color-accent)"],
              ["Border", "var(--color-border)"],
              ["Muted", "var(--color-muted)"],
              ["Success", "var(--color-success)"],
              ["Danger", "var(--color-danger)"],
            ].map(([name, color]) => (
              <div
                key={name}
                className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)]"
              >
                <div className="h-16" style={{ background: color }} />
                <p className="px-3 py-2 text-xs text-[var(--color-muted)]">{name}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {scoreLevels.map((level) => (
              <div
                key={level}
                className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-3"
              >
                <Badge score={level} />
                <p className="mt-2 text-xs text-[var(--color-subtle)]">{level}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section id="typography" title="Typography">
          <p className="font-[family-name:var(--font-display)] text-4xl font-semibold">
            Display — Syne
          </p>
          <p className="text-lg text-[var(--color-muted)]">
            Body — DM Sans. Used for supporting copy, forms, and dense UI.
          </p>
        </Section>

        <Section id="buttons" title="Buttons">
          <div className="flex flex-wrap gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button loading>Loading</Button>
            <Tooltip content="Icon-only control requires an accessible name.">
              <IconButton aria-label="More options">
                <span aria-hidden>···</span>
              </IconButton>
            </Tooltip>
          </div>
        </Section>

        <Section id="feedback" title="Feedback">
          <div className="grid gap-3">
            <Alert tone="info" title="Informational">
              Neutral product guidance without medical claims.
            </Alert>
            <Alert tone="success" title="Positive performance state">
              Reserved for real improvements — not decorative success chrome.
            </Alert>
            <Alert tone="warning" title="Needs attention">
              Review this position; consider consulting a qualified professional if pain is present.
            </Alert>
            <Alert tone="danger" title="Critical" role="alert">
              Blocking error or critical score band.
            </Alert>
            <ErrorState description="Example recoverable failure state for failed requests." />
            <EmptyState
              title="Nothing here yet"
              description="Honest empty state for production accounts with no data."
              action={<Button variant="secondary">Set a goal</Button>}
            />
            <div className="grid gap-3 sm:grid-cols-3">
              <Skeleton className="h-20" />
              <Skeleton variant="circle" />
              <SkeletonBlock lines={4} />
            </div>
          </div>
        </Section>

        <Section id="scores" title="Scores">
          <div className="flex flex-wrap gap-8">
            {[92, 78, 61, 38].map((value) => (
              <ScoreRing key={value} value={value} label="Sample metric" />
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <ProgressBar label="Session quality" value={88} />
            <ProgressBar label="Recovery readiness" value={54} />
          </div>
          <div className="flex flex-wrap gap-2">
            {scoreLevels.map((level) => (
              <Badge key={level} score={level}>
                {scoreLabels[level]}
              </Badge>
            ))}
          </div>
        </Section>

        <Section id="data" title="Data">
          <div className="grid gap-4 sm:grid-cols-2">
            <MetricCard
              label="Estimated 1RM"
              value={140}
              unit="kg"
              delta="+2.5 kg vs last block"
              deltaTone="positive"
              score="good"
              description="Heuristic estimate — not a lab measurement."
            />
            <MetricCard
              label="Adherence"
              value="—"
              description="No sessions logged yet."
            />
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Card</CardTitle>
              <CardDescription>
                Deep charcoal surface with a subtle border — no glow.
              </CardDescription>
            </CardHeader>
            <p className="text-sm text-[var(--color-muted)]">
              Prefer cards for interactive or grouped content, not decorative chrome.
            </p>
          </Card>
          <DataTable
            caption="Sample logged lifts"
            rows={sampleRows}
            rowKey={(row) => row.id}
            columns={[
              { id: "lift", header: "Lift", cell: (row) => row.lift },
              {
                id: "load",
                header: "Load",
                align: "right",
                cell: (row) => row.load,
              },
              { id: "note", header: "Note", cell: (row) => row.note },
            ]}
          />
          <DataTable
            caption="Empty table demo"
            rows={[]}
            rowKey={() => ""}
            columns={[{ id: "x", header: "Col", cell: () => null }]}
            emptyTitle="No rows"
            emptyDescription="Tables stay empty until real data exists."
          />
          <ChartCard
            title="Progress"
            description="Chart container — visualizations load when analytics ships."
            empty
          />
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="detail">Detail</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <p className="text-sm text-[var(--color-muted)]">
                Tabs keep related views in one region without fake dashboards.
              </p>
            </TabsContent>
            <TabsContent value="detail">
              <p className="text-sm text-[var(--color-muted)]">
                Detail panel content.
              </p>
            </TabsContent>
          </Tabs>
        </Section>

        <Section id="forms" title="Forms">
          <div className="grid max-w-md gap-4">
            <div>
              <Label htmlFor="ds-name">Athlete name</Label>
              <Input id="ds-name" name="name" placeholder="Your name" />
            </div>
            <div>
              <Label htmlFor="ds-goal">Primary goal</Label>
              <Select id="ds-goal" name="goal" defaultValue="">
                <option value="" disabled>
                  Select a goal
                </option>
                <option value="strength">Strength</option>
                <option value="physique">Physique</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="ds-notes" optional>
                Notes
              </Label>
              <Textarea id="ds-notes" name="notes" placeholder="Optional context" />
            </div>
            <Checkbox id="ds-terms" name="terms" label="I understand this is not medical advice" />
          </div>
        </Section>

        <Section id="overlays" title="Overlays">
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setModalOpen(true)}>Open modal</Button>
            <Button variant="secondary" onClick={() => setDrawerOpen(true)}>
              Open drawer
            </Button>
            <Dropdown
              label="Actions"
              items={[
                { id: "1", label: "View profile", onSelect: () => undefined },
                { id: "2", label: "Export", disabled: true },
                { id: "3", label: "Settings", onSelect: () => undefined },
              ]}
            />
          </div>
          <Modal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Confirm action"
            description="Native dialog with keyboard dismiss and backdrop click."
            footer={
              <>
                <Button variant="ghost" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setModalOpen(false)}>Confirm</Button>
              </>
            }
          >
            <p className="text-sm text-[var(--color-muted)]">
              Use modals for focused decisions — not for entire workflows.
            </p>
          </Modal>
          <Drawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            title="Filters"
          >
            <p className="text-sm text-[var(--color-muted)]">
              Drawer for secondary panels. Escape and backdrop close it.
            </p>
          </Drawer>
        </Section>
      </div>
    </div>
  );
}
