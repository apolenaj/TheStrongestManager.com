import type { ReactNode } from "react";
import { Alert } from "@/design-system/components/Alert";
import { cn } from "@/design-system/utils/cn";

export type ErrorStateProps = {
  title?: string;
  description: string;
  action?: ReactNode;
  className?: string;
};

export function ErrorState({
  title = "Something went wrong",
  description,
  action,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <Alert tone="danger" title={title} role="alert">
        {description}
      </Alert>
      {action}
    </div>
  );
}
