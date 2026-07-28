export default function LegendaryMethodsLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl animate-pulse px-4 py-10 sm:px-6 sm:py-14">
      <div className="h-3 w-40 bg-[var(--color-surface-elevated)]" />
      <div className="mt-6 h-10 w-3/4 max-w-xl bg-[var(--color-surface-elevated)]" />
      <div className="mt-4 h-16 max-w-2xl bg-[var(--color-surface)]" />
      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        <div className="aspect-[4/3] bg-[var(--color-surface-elevated)]" />
        <div className="aspect-[4/3] bg-[var(--color-surface-elevated)]" />
      </div>
    </div>
  );
}
