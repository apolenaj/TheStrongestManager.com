import Link from "next/link";
import { siteConfig } from "@/config/site";

export function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-[100svh] w-full max-w-md flex-col justify-center px-4 py-12">
      <Link
        href="/"
        className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-[var(--color-foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
      >
        {siteConfig.name}
      </Link>
      <h1 className="mt-8 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight">
        {title}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
        {description}
      </p>
      <div className="mt-8">{children}</div>
    </div>
  );
}
