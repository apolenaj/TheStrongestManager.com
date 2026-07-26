type ComingSoonProps = {
  title: string;
  description: string;
  reason?: string;
};

export function ComingSoon({ title, description, reason }: ComingSoonProps) {
  return (
    <div className="flex flex-col items-start rounded-[var(--radius-md)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface)] px-[var(--space-6)] py-[var(--space-8)]">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-accent)]">
        Coming soon
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-4xl">
        {title}
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--color-muted)]">
        {description}
      </p>
      {reason ? (
        <p className="mt-6 border-l border-[var(--color-border)] pl-4 text-sm text-[var(--color-muted)]">
          {reason}
        </p>
      ) : null}
    </div>
  );
}
