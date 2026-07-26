/**
 * Object-ownership helpers (Prompt 43).
 * Prefer filtering by owner in queries; use these when asserting after fetch.
 */

export class OwnershipError extends Error {
  readonly status = 403;
  constructor(message = "You do not have access to this resource.") {
    super(message);
    this.name = "OwnershipError";
  }
}

/**
 * Assert the authenticated actor owns the resource.
 * Use opaque ids only — never trust client-supplied owner ids without a DB check.
 */
export function assertObjectOwner(input: {
  actorUserId: string;
  ownerUserId: string | null | undefined;
  label?: string;
}): void {
  if (!input.ownerUserId || input.ownerUserId !== input.actorUserId) {
    throw new OwnershipError(
      input.label
        ? `You do not have access to this ${input.label}.`
        : undefined,
    );
  }
}

/** Non-throwing ownership check for API routes. */
export function isObjectOwner(
  actorUserId: string,
  ownerUserId: string | null | undefined,
): boolean {
  return Boolean(ownerUserId && ownerUserId === actorUserId);
}
