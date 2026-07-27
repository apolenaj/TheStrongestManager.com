"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { startProgramCheckout } from "@/services/program-commerce/checkout-service";

export type ProgramCheckoutActionState = {
  ok: boolean;
  error?: string;
};

/**
 * Client may only submit productId — never price or stripePriceId.
 */
export async function startProgramCheckoutAction(
  _prev: ProgramCheckoutActionState,
  formData: FormData,
): Promise<ProgramCheckoutActionState> {
  const session = await auth();
  const productId = String(formData.get("productId") ?? "").trim();

  if (!session?.user?.id) {
    const callback = productId
      ? `/pricing?tab=programs&buy=${encodeURIComponent(productId)}`
      : "/pricing?tab=programs";
    redirect(`/login?callbackUrl=${encodeURIComponent(callback)}`);
  }

  if (!productId) {
    return { ok: false, error: "Choose a program to purchase." };
  }

  // Reject any client-supplied price fields if present.
  if (
    formData.has("price") ||
    formData.has("amount") ||
    formData.has("stripePriceId") ||
    formData.has("displayPrice")
  ) {
    return {
      ok: false,
      error: "Invalid checkout request. Price data must not be sent from the client.",
    };
  }

  const result = await startProgramCheckout({
    userId: session.user.id,
    productId,
    customerEmail: session.user.email,
  });

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  redirect(result.checkoutUrl);
}
