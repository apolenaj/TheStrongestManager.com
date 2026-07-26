import { auth } from "@/auth";
import { redirect } from "next/navigation";

/**
 * Server-side session guard for Server Components / actions.
 */
export async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  return session;
}

export async function getOptionalSession() {
  return auth();
}
