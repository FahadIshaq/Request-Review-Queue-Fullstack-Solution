export default function Loading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <div className="flex items-end justify-between gap-3">
        <div className="space-y-2">
          <div className="h-7 w-44 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-4 w-64 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
        </div>
        <div className="h-9 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
      </div>

      <div className="card space-y-3 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_2fr]">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <div className="mb-2 h-3 w-16 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
              <div className="h-9 animate-pulse rounded-md bg-slate-100 dark:bg-slate-800" />
            </div>
          ))}
        </div>
        <div className="flex h-6 items-center justify-end">
          <div className="h-6 w-28 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="grid grid-cols-6 gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-3 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-700"
            />
          ))}
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-6 items-center gap-4 border-b border-slate-100 px-4 py-4 last:border-b-0 dark:border-slate-800"
          >
            <div className="space-y-2">
              <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-3 w-16 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
            </div>
            <div className="h-5 w-20 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
            <div className="h-5 w-16 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
            <div className="h-4 w-24 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
            <div className="h-4 w-28 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
            <div className="h-4 w-32 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
          </div>
        ))}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60">
          <div className="h-4 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-8 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
