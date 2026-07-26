import type { ReactNode } from "react";
import { PageHeader } from "@/components/layout/PageHeader";

export type AppPageProps = {
  title: string;
  description: string;
  eyebrow?: string;
  actions?: ReactNode;
  children?: ReactNode;
};

/**
 * Consistent authenticated page chrome.
 * Auth is enforced by middleware + app layout — no fake “not connected” banner.
 */
export function AppPage({
  title,
  description,
  eyebrow = "App",
  actions,
  children,
}: AppPageProps) {
  return (
    <div className="min-w-0 space-y-8">
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        actions={actions}
      />
      {children}
    </div>
  );
}
