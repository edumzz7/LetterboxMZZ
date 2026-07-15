function SkeletonBlock({ className }: { className: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded bg-[#151b28] ${className}`} />;
}

export default function ProfilePageSkeleton() {
  return (
    <div
      role="status"
      aria-label="Carregando página"
      className="grid grid-cols-1 gap-6 xl:grid-cols-[260px_minmax(0,1fr)_260px]"
    >
      <aside className="rounded-3xl border border-[#151b28] bg-[#06080d] p-5">
        <div className="flex flex-col items-center text-center">
          <SkeletonBlock className="h-24 w-24 rounded-full border-[3px] border-[#222a3a]" />
          <SkeletonBlock className="mt-4 h-4 w-32" />
          <SkeletonBlock className="mt-2 h-3 w-20" />
          <SkeletonBlock className="mt-4 h-7 w-20 rounded-full" />
        </div>

        <div className="mt-6 space-y-3 border-t border-white/10 pt-4">
          <SkeletonBlock className="h-3 w-24" />
          <SkeletonBlock className="h-10 w-full rounded-xl" />
          <SkeletonBlock className="h-10 w-full rounded-xl" />
          <SkeletonBlock className="h-10 w-full rounded-xl" />
        </div>
      </aside>

      <main className="min-w-0 rounded-3xl border border-[#151b28] bg-[#06080d] p-4 sm:p-7 lg:p-9">
        <div className="mb-8 flex flex-col gap-3 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <SkeletonBlock className="h-6 w-48" />
            <SkeletonBlock className="h-3 w-64 max-w-full" />
          </div>
          <SkeletonBlock className="h-9 w-28 rounded-xl" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="rounded-2xl border border-[#151b28] bg-[#0b0f17] p-5">
              <SkeletonBlock className="h-3 w-24" />
              <SkeletonBlock className="mt-4 h-7 w-36" />
              <SkeletonBlock className="mt-3 h-3 w-full" />
              <SkeletonBlock className="mt-2 h-3 w-3/4" />
            </div>
          ))}
        </div>
      </main>

      <aside className="space-y-5">
        <section className="rounded-3xl border border-[#151b28] bg-[#06080d] p-5">
          <SkeletonBlock className="mx-auto h-3 w-24" />
          <SkeletonBlock className="mt-5 h-3 w-full" />
          <SkeletonBlock className="mt-2 h-3 w-5/6" />
          <SkeletonBlock className="mt-2 h-3 w-2/3" />
        </section>
        <section className="rounded-3xl border border-[#151b28] bg-[#06080d] p-5">
          <SkeletonBlock className="h-3 w-28" />
          <div className="mt-4 space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <SkeletonBlock className="h-8 w-8 rounded-full" />
                <SkeletonBlock className="h-3 flex-1" />
              </div>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}
