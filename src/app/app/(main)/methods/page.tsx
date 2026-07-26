import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { MethodsIndex } from "@/components/methods/MethodsIndex";
import { searchMethods } from "@/domain/methods";

export const metadata: Metadata = {
  title: "Methods",
  robots: { index: false, follow: false },
};

type AppMethodsPageProps = {
  searchParams: Promise<{ q?: string; category?: string }>;
};

export default async function AppMethodsPage({
  searchParams,
}: AppMethodsPageProps) {
  const params = await searchParams;
  const q = params.q ?? "";
  const category = params.category ?? "";
  const methods = searchMethods({ q, category });

  return (
    <AppPage
      eyebrow="Knowledge"
      title="Training Methods"
      description="Browse methods with origins and modern interpretation kept separate — then apply them in programming."
    >
      <MethodsIndex
        methods={methods}
        basePath="/app/methods"
        q={q}
        category={category}
      />
    </AppPage>
  );
}
