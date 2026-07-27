import { PublicFooter } from "@/components/layout/PublicFooter";
import { Navbar } from "@/components/Navbar";

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-[#050505]">
      <Navbar />
      <main id="main-content" className="w-full flex-1">
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
