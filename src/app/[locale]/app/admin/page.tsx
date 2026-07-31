import Link from "next/link";
import { Alert, Badge, Card, CardDescription, CardHeader, CardTitle } from "@/design-system";
import { ADMIN_NAV } from "@/domain/admin";
import {
  getAdminDashboardSnapshot,
  recordAdminAccess,
} from "@/services/admin/admin-service";
import { requireAdmin } from "@/services/admin/require-admin";

export default async function AdminHomePage() {
  const admin = await requireAdmin();
  await recordAdminAccess(admin.user.id);
  const snap = getAdminDashboardSnapshot();

  return (
    <div className="space-y-6">
      <Alert tone="info" title="Secure admin console">
        {snap.honesty[1]} {snap.honesty[2]}
      </Alert>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(
          [
            ["Exercises", snap.counts.exercises],
            ["Methods", snap.counts.methods],
            ["Articles", snap.counts.articles],
            ["Academy", snap.counts.academy],
          ] as const
        ).map(([label, count]) => (
          <Card key={label}>
            <CardHeader>
              <CardTitle>{label}</CardTitle>
              <CardDescription>{count} published catalog items</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <section className="space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl">
          Areas
        </h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {ADMIN_NAV.filter((n) => n.href !== "/app/admin").map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-3 text-sm hover:border-[var(--color-accent)]"
              >
                <span>{item.label}</span>
                <Badge variant="neutral">{item.entity}</Badge>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
