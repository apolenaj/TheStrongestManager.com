import type { ReactNode } from "react";
import { EmptyState } from "@/design-system/components/EmptyState";
import { cn } from "@/design-system/utils/cn";

export type DataTableColumn<T> = {
  id: string;
  header: string;
  cell: (row: T) => ReactNode;
  align?: "left" | "right" | "center";
};

export type DataTableProps<T> = {
  caption: string;
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
};

const alignClass = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
} as const;

export function DataTable<T>({
  caption,
  columns,
  rows,
  rowKey,
  emptyTitle = "No data yet",
  emptyDescription = "Rows will appear here when data is available. Nothing is fabricated for display.",
  className,
}: DataTableProps<T>) {
  if (rows.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        className={className}
      />
    );
  }

  return (
    <div
      className={cn(
        "overflow-x-auto rounded-[var(--radius-md)] border border-[var(--color-border)]",
        className,
      )}
    >
      <table className="w-full min-w-[32rem] border-collapse text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-[var(--color-surface-elevated)]">
          <tr>
            {columns.map((column) => (
              <th
                key={column.id}
                scope="col"
                className={cn(
                  "border-b border-[var(--color-border)] px-4 py-3 font-medium text-[var(--color-muted)]",
                  alignClass[column.align ?? "left"],
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              className="border-b border-[var(--color-border)] last:border-b-0"
            >
              {columns.map((column) => (
                <td
                  key={column.id}
                  className={cn(
                    "px-4 py-3 text-[var(--color-foreground)]",
                    alignClass[column.align ?? "left"],
                  )}
                >
                  {column.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
