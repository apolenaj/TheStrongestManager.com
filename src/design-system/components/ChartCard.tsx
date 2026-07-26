import type { ReactNode } from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/design-system/components/Card";
import { EmptyState } from "@/design-system/components/EmptyState";
import { cn } from "@/design-system/utils/cn";

export type ChartCardProps = {
  title: string;
  description?: string;
  /** Chart or visualization — lazy-load heavy chart libs at call site */
  children?: ReactNode;
  empty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  action?: ReactNode;
  className?: string;
};

/**
 * Container for charts. Does not invent chart data.
 * Pass real visualizations as children when analytics ships.
 */
export function ChartCard({
  title,
  description,
  children,
  empty = false,
  emptyTitle = "No chart data",
  emptyDescription = "Charts render only from real logged performance data.",
  action,
  className,
}: ChartCardProps) {
  return (
    <Card elevated className={cn("flex flex-col", className)}>
      <CardHeader className="mb-4 flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>{title}</CardTitle>
          {description ? (
            <CardDescription>{description}</CardDescription>
          ) : null}
        </div>
        {action}
      </CardHeader>
      {empty || !children ? (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          className="border-none bg-transparent px-0 py-6"
        />
      ) : (
        <div className="min-h-[12rem]">{children}</div>
      )}
    </Card>
  );
}
