"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Badge,
  Button,
  ButtonLink,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  Input,
  Label,
} from "@/design-system";
import { ORG_KINDS, ORG_KIND_LABELS } from "@/domain/org";
import { createOrganizationAction } from "@/services/org/actions";
import type { OrgListItem } from "@/services/org/org-service";

export function OrgListPanel({ orgs }: { orgs: OrgListItem[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      <Alert tone="info" title="Organizations are not Coach Mode">
        Org membership does not unlock private athlete data. Coaches still need
        an athlete grant to open a 1:1 workspace.
      </Alert>

      <section>
        <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--color-foreground)]">
          Your organizations
        </h2>
        {orgs.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="No organizations yet"
              description="Create a gym or team to manage coaches, athletes, and aggregate training analytics."
            />
          </div>
        ) : (
          <ul className="mt-4 grid gap-3">
            {orgs.map((org) => (
              <li key={org.id}>
                <Card>
                  <CardHeader>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="neutral">{org.kindLabel}</Badge>
                      <Badge variant="info">{org.roleLabel}</Badge>
                    </div>
                    <CardTitle>{org.name}</CardTitle>
                    <CardDescription>/{org.slug}</CardDescription>
                  </CardHeader>
                  <div className="px-1 pb-1">
                    <ButtonLink
                      href={`/app/org/${org.id}`}
                      variant="secondary"
                      size="sm"
                    >
                      Open dashboard
                    </ButtonLink>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--color-foreground)]">
          Create organization
        </h2>
        {error ? (
          <Alert tone="danger" title="Could not create">
            {error}
          </Alert>
        ) : null}
        <form
          className="space-y-3 rounded-[var(--radius-md)] border border-[var(--color-border)] p-4"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            setError(null);
            startTransition(async () => {
              const result = await createOrganizationAction(fd);
              if (!result.ok) {
                setError(result.error);
                return;
              }
              router.push(`/app/org/${result.organizationId}`);
              router.refresh();
            });
          }}
        >
          <div>
            <Label htmlFor="org-name">Name</Label>
            <Input
              id="org-name"
              name="name"
              required
              className="mt-1 min-h-12"
              placeholder="Northside Strength"
            />
          </div>
          <div>
            <Label htmlFor="org-kind">Kind</Label>
            <select
              id="org-kind"
              name="kind"
              defaultValue="gym"
              className="mt-1 flex h-12 w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-transparent px-3 text-sm"
            >
              {ORG_KINDS.map((k) => (
                <option key={k} value={k}>
                  {ORG_KIND_LABELS[k]}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" disabled={pending}>
            Create
          </Button>
        </form>
      </section>
    </div>
  );
}
