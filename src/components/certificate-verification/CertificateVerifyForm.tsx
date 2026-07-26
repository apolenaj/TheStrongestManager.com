"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Alert, Button } from "@/design-system";
import { normalizeCertificateCode } from "@/domain/certificate-verification";

export function CertificateVerifyForm({
  initialCode = "",
}: {
  initialCode?: string;
}) {
  const router = useRouter();
  const [code, setCode] = useState(initialCode);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        const normalized = normalizeCertificateCode(code);
        if (!normalized) {
          setError("Enter a certificate ID to verify.");
          return;
        }
        startTransition(() => {
          router.push(`/verify/certificate/${encodeURIComponent(normalized)}`);
        });
      }}
    >
      <label className="block space-y-2">
        <span className="text-sm font-medium text-[var(--color-foreground)]">
          Certificate ID
        </span>
        <input
          type="text"
          name="code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="e.g. AOC-1A2B3C4D5E6F"
          autoComplete="off"
          spellCheck={false}
          className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 font-mono text-sm text-[var(--color-foreground)] outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
        />
      </label>
      {error ? (
        <Alert tone="danger" title="Missing ID">
          {error}
        </Alert>
      ) : null}
      <Button type="submit" disabled={pending}>
        Verify certificate
      </Button>
    </form>
  );
}
