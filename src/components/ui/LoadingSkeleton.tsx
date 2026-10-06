import type { ReactNode } from 'react';

export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded bg-[#151b28] ${className}`} />;
}

export function PosterGridSkeleton({ count = 10, className = '' }: { count?: number; className?: string }) {
  return (
    <div role="status" aria-label="Carregando conteúdo" className={`grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5 ${className}`}>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="min-w-0">
          <Skeleton className="aspect-[2/3] w-full rounded-xl" />
          <Skeleton className="mt-2 h-3 w-4/5" />
          <Skeleton className="mt-2 h-2.5 w-2/5" />
        </div>
      ))}
      <span className="sr-only">Carregando</span>
    </div>
  );
}

export function DetailPageSkeleton({ title = 'Carregando página' }: { title?: string }) {
  return (
    <div role="status" aria-label={title} className="animate-pulse">
      <div className="relative -mx-4 -mt-4 h-[25vh] min-h-48 bg-[#0c111b] sm:-mx-7 sm:-mt-7 sm:h-[35vh] lg:-mx-9 lg:-mt-9">
        <Skeleton className="h-full w-full rounded-none opacity-40" />
      </div>
      <div className="relative z-10 -mt-16 flex flex-col items-center gap-6 sm:-mt-20 md:flex-row md:items-end md:px-4 lg:-mt-24">
        <Skeleton className="h-56 w-44 shrink-0 rounded-2xl sm:h-64 sm:w-48" />
        <div className="w-full space-y-4 pb-2">
          <Skeleton className="mx-auto h-3 w-24 md:mx-0" />
          <Skeleton className="mx-auto h-9 w-3/4 md:mx-0" />
          <Skeleton className="mx-auto h-3 w-2/5 md:mx-0" />
          <div className="flex flex-wrap justify-center gap-3 md:justify-start">
            <Skeleton className="h-10 w-28 rounded-xl" />
            <Skeleton className="h-10 w-28 rounded-xl" />
            <Skeleton className="h-10 w-28 rounded-xl" />
          </div>
        </div>
      </div>
      <div className="mt-12 space-y-4">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="aspect-[2/3] rounded-xl" />)}
        </div>
      </div>
      <span className="sr-only">{title}</span>
    </div>
  );
}

export function ListSkeleton({ count = 5, children }: { count?: number; children?: ReactNode }) {
  return (
    <div role="status" aria-label="Carregando conteúdo" className="animate-pulse space-y-3">
      {children}
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="rounded-2xl border border-[#151b28] bg-[#06080d] p-4">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="mt-3 h-3 w-full" />
          <Skeleton className="mt-2 h-3 w-4/5" />
        </div>
      ))}
    </div>
  );
}
