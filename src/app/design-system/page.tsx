import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DesignSystemPreview } from "./DesignSystemPreview";

export const metadata: Metadata = {
  title: "Design system",
  robots: { index: false, follow: false },
};

/** Evaluated per-request so production can 404 while local `next dev` works. */
export const dynamic = "force-dynamic";

function isDesignSystemAllowed(): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  return process.env.ALLOW_DESIGN_SYSTEM === "true";
}

export default function DesignSystemPage() {
  if (!isDesignSystemAllowed()) {
    notFound();
  }

  return <DesignSystemPreview />;
}
