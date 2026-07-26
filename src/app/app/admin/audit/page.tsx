import { Badge, EmptyState } from "@/design-system";
import { listAdminAuditLogs } from "@/services/admin/admin-service";
import { requireAdmin } from "@/services/admin/require-admin";

export default async function AdminAuditPage() {
  await requireAdmin();
  const logs = await listAdminAuditLogs(80);

  return (
    <div className="space-y-4">
      <h2 className="font-[family-name:var(--font-display)] text-2xl">
        Audit log
      </h2>
      <p className="text-sm text-[var(--color-muted)]">
        Append-only history of important admin and content operations.
      </p>
      {logs.length === 0 ? (
        <EmptyState
          title="No audit events yet"
          description="Reviews, flag reviews, and console access appear here."
        />
      ) : (
        <ul className="space-y-3">
          {logs.map((log) => (
            <li
              key={log.id}
              className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-3 text-sm"
            >
              <div className="flex flex-wrap gap-2">
                <Badge variant="accent">{log.action}</Badge>
                <Badge variant="neutral">{log.entityType}</Badge>
                {log.entityId ? (
                  <Badge variant="info">{log.entityId}</Badge>
                ) : null}
              </div>
              <p className="mt-2 text-[var(--color-foreground)]">{log.summary}</p>
              <p className="mt-1 text-xs text-[var(--color-muted)]">
                {log.actorEmail ?? log.actorName ?? "admin"} ·{" "}
                {new Date(log.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
