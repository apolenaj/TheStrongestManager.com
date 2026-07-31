import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-background)]">
      <SiteHeader />
      <main id="main-content" className="w-full flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
