export default function Loading() {
  return (
    <div
      className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="ui-skeleton h-3 w-24" />
          <div className="ui-skeleton h-8 w-64 max-w-full" />
          <div className="ui-skeleton h-4 w-full max-w-md" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="ui-skeleton h-36 w-full" />
          <div className="ui-skeleton h-36 w-full" />
        </div>
        <div className="ui-skeleton h-48 w-full" />
      </div>
    </div>
  );
}
