import type { ReactNode } from "react";

export function MarketingContainer({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      {children}
    </div>
  );
}
