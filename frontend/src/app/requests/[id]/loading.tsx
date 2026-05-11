export default function Loading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <div className="h-4 w-32 animate-pulse rounded bg-slate-100" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="space-y-6 lg:col-span-2">
          <div className="card space-y-3 p-6">
            <div className="h-3 w-20 animate-pulse rounded bg-slate-100" />
            <div className="h-8 w-2/3 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />

            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 w-16 animate-pulse rounded bg-slate-100" />
                  <div className="h-5 w-24 animate-pulse rounded bg-slate-200" />
                </div>
              ))}
            </div>
          </div>

          <div className="card space-y-4 p-6">
            <div className="h-5 w-24 animate-pulse rounded bg-slate-200" />
            <div className="h-20 animate-pulse rounded bg-slate-100" />
            <div className="flex justify-end">
              <div className="h-9 w-24 animate-pulse rounded bg-slate-200" />
            </div>
            <div className="space-y-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="h-16 animate-pulse rounded-md bg-slate-100"
                />
              ))}
            </div>
          </div>

          <div className="card space-y-4 p-6">
            <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="mt-1.5 h-2.5 w-2.5 animate-pulse rounded-full bg-slate-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/3 animate-pulse rounded bg-slate-200" />
                  <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card space-y-3 p-6">
              <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
              <div className="h-9 animate-pulse rounded-md bg-slate-100" />
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}
