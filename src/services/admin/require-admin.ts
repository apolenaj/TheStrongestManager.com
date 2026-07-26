import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireSession } from "@/services/auth/session";

export type AdminSession = {
  user: {
    id: string;
    email: string | null | undefined;
    isAdmin: true;
  };
};

/**
 * Server-side admin gate.
 * Non-admins get notFound() — never leak admin UI existence to standard users.
 * Always re-checks User.isAdmin in the database (not JWT claims alone).
 */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await requireSession();
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, isAdmin: true },
  });

  if (!user?.isAdmin) {
    notFound();
  }

  return {
    user: {
      id: user.id,
      email: user.email ?? session.user.email,
      isAdmin: true,
    },
  };
}

/** Soft check for UI that must not render admin links for non-admins. */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const session = await requireSession().catch(() => null);
  if (!session?.user?.id) return false;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  });
  return Boolean(user?.isAdmin);
}
