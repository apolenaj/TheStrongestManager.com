"use client";

import { useActionState } from "react";
import { Alert, Button, Input, Label } from "@/design-system";
import {
  deleteAccountAction,
  type ActionState,
} from "@/services/auth/actions";

const initial: ActionState = { ok: false };

export function DeleteAccountForm({
  hasPassword,
}: {
  hasPassword: boolean;
}) {
  const [state, action, pending] = useActionState(
    deleteAccountAction,
    initial,
  );

  return (
    <form action={action} className="space-y-4">
      <Alert tone="warning" title="Permanent deletion">
        This removes your account, sign-in sessions, and private technique videos
        from storage. Type DELETE to confirm.
      </Alert>
      <div>
        <Label htmlFor="delete-confirmation">Confirmation</Label>
        <Input
          id="delete-confirmation"
          name="confirmation"
          autoComplete="off"
          placeholder="DELETE"
          required
        />
      </div>
      {hasPassword ? (
        <div>
          <Label htmlFor="delete-password">Password</Label>
          <Input
            id="delete-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
      ) : (
        <p className="text-sm text-[var(--color-muted)]">
          This account uses a social provider. Confirmation text is enough to
          delete it.
        </p>
      )}
      {state.error ? (
        <Alert tone="danger" title="Deletion failed" role="alert">
          {state.error}
        </Alert>
      ) : null}
      <Button type="submit" variant="danger" loading={pending}>
        Delete account
      </Button>
    </form>
  );
}
