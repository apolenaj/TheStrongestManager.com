import { requireSession } from "@/services/auth/session";

/**
 * Auth-only layout for all /app routes.
 * Shell + onboarding completion are enforced in nested layouts.
 */
export default async function AppRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireSession();
  return children;
}
