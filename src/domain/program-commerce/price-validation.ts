import { prisma } from "@/lib/db";
import {
  envStripePriceIdForProgramSlug,
  PROGRAM_COMMERCE_KIND,
} from "@/domain/program-commerce/constants";

export type ValidatedProgramPurchase = {
  productId: string;
  slug: string;
  name: string;
  displayPrice: number;
  defaultCurrency: string;
  stripePriceId: string;
  isBundle: boolean;
};

export type ProgramPriceValidationResult =
  | { ok: true; product: ValidatedProgramPurchase }
  | { ok: false; error: string };

/**
 * Resolve purchasable product from DB id only.
 * Never trusts client price, currency, or Stripe price id.
 */
export async function validateProgramProductForCheckout(
  productId: string,
): Promise<ProgramPriceValidationResult> {
  const id = productId.trim();
  if (!id || id.length > 64) {
    return { ok: false, error: "Invalid product." };
  }

  const product = await prisma.programProduct.findFirst({
    where: { id, status: "published" },
    select: {
      id: true,
      slug: true,
      name: true,
      displayPrice: true,
      defaultCurrency: true,
      stripePriceId: true,
      isFree: true,
      bundleIds: true,
    },
  });

  if (!product) {
    return { ok: false, error: "Program not found or not published." };
  }
  if (product.isFree) {
    return {
      ok: false,
      error: "Free programs do not use checkout. Start them from the free onboarding flow.",
    };
  }
  if (product.displayPrice <= 0) {
    return { ok: false, error: "This program has no valid list price." };
  }

  const stripePriceId =
    product.stripePriceId?.trim() ||
    envStripePriceIdForProgramSlug(product.slug);

  if (!stripePriceId) {
    return {
      ok: false,
      error:
        "Checkout is not configured for this program yet (missing Stripe Price id).",
    };
  }

  // Persist env-resolved price id onto the product when DB was empty — still server-owned.
  if (!product.stripePriceId?.trim()) {
    await prisma.programProduct.update({
      where: { id: product.id },
      data: { stripePriceId },
    });
  }

  return {
    ok: true,
    product: {
      productId: product.id,
      slug: product.slug,
      name: product.name,
      displayPrice: product.displayPrice,
      defaultCurrency: product.defaultCurrency,
      stripePriceId,
      isBundle: product.bundleIds.length > 0,
    },
  };
}

/**
 * Optional live Stripe Price check — amount/currency must match ProgramProduct.
 * Skips when Stripe is unreachable; never trusts the client.
 */
export async function assertStripePriceMatchesProduct(input: {
  stripePriceId: string;
  displayPrice: number;
  currency: string;
  secretKey: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const res = await fetch(
      `https://api.stripe.com/v1/prices/${encodeURIComponent(input.stripePriceId)}`,
      {
        headers: { Authorization: `Bearer ${input.secretKey}` },
        cache: "no-store",
      },
    );
    if (!res.ok) {
      return {
        ok: false,
        error: "Could not verify Stripe Price for this program.",
      };
    }
    const price = (await res.json()) as {
      unit_amount?: number | null;
      currency?: string;
      type?: string;
      active?: boolean;
    };
    if (price.active === false) {
      return { ok: false, error: "Stripe Price is inactive." };
    }
    if (price.type && price.type !== "one_time") {
      return {
        ok: false,
        error:
          "Program checkout requires a one-time Stripe Price — not a recurring subscription price.",
      };
    }
    if (
      typeof price.unit_amount === "number" &&
      price.unit_amount !== input.displayPrice
    ) {
      return {
        ok: false,
        error:
          "Server price mismatch: ProgramProduct.displayPrice does not match Stripe Price amount.",
      };
    }
    if (
      typeof price.currency === "string" &&
      price.currency.toLowerCase() !== input.currency.toLowerCase()
    ) {
      return {
        ok: false,
        error:
          "Server currency mismatch: ProgramProduct.defaultCurrency does not match Stripe Price.",
      };
    }
    return { ok: true };
  } catch {
    return {
      ok: false,
      error: "Could not verify Stripe Price for this program.",
    };
  }
}

export function programCheckoutMetadata(input: {
  userId: string;
  productId: string;
  orderId: string;
}): Record<string, string> {
  return {
    commerceKind: PROGRAM_COMMERCE_KIND,
    commerceChannel: "program_one_time",
    userId: input.userId,
    productId: input.productId,
    orderId: input.orderId,
  };
}
