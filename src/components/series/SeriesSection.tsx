import { useState } from "react";
import clsx from "clsx";
import { Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useSeries } from "../../hooks/useSeries";
import type { SeriesStatus } from "../../types/app";
import AddSeriesDialog from "./AddSeriesDialog";
import SeriesCard from "./SeriesCard";

interface SeriesSectionProps {
  userId: string;
  canEdit: boolean;
  currentUserId?: string;
  publicReadOnly?: boolean;
}

export default function SeriesSection({
  userId,
  canEdit,
  currentUserId,
  publicReadOnly = false,
}: SeriesSectionProps) {
  const [, setLocation] = useLocation();
  const {
    seriesQuery,
    updateProgressMutation,
    addSeriesMutation,
    deleteSeriesMutation,
    rateSeriesMutation,
  } = useSeries(userId);
  const [filter, setFilter] = useState<SeriesStatus>("watched");
  const [isExpanded, setIsExpanded] = useState(false);
  const [mobileVisibleCount, setMobileVisibleCount] = useState(10);

  const filteredSeries = (seriesQuery.data || []).filter(
    (series) => series.status === filter,
  );

  const maxInitialItems = canEdit ? 11 : 12;
  const hasMore = filteredSeries.length > maxInitialItems;
  const displayedSeries = isExpanded
    ? filteredSeries
    : filteredSeries.slice(0, maxInitialItems);
  const mobileSeriesLimit = canEdit
    ? Math.max(0, mobileVisibleCount - 1)
    : mobileVisibleCount;
  const mobileDisplayedSeries = filteredSeries.slice(0, mobileSeriesLimit);
  const mobileHasMore = filteredSeries.length > mobileDisplayedSeries.length;
  const isPublicLocked = publicReadOnly && filter !== "watched";

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 border-b border-[#111] pb-4">
        <h2 className="text-xl md:text-2xl font-light tracking-widest text-brand-gold">
          SERIES
        </h2>
        <div className="flex items-center gap-4 text-xs md:text-sm tracking-widest font-light uppercase mt-1 md:mt-0">
          <button
            onClick={() => setFilter("watched")}
            className={clsx(
              "transition-colors pb-1",
              filter === "watched"
                ? "text-brand-gold border-b border-brand-gold"
                : "text-brand-text-muted hover:text-brand-text",
            )}
          >
            Vistas
          </button>
          <span className="text-[#333]">|</span>
          <button
            onClick={() => setFilter("watching")}
            className={clsx(
              "transition-colors pb-1",
              filter === "watching"
                ? "text-brand-gold border-b border-brand-gold"
                : "text-brand-text-muted hover:text-brand-text",
            )}
          >
            Em andamento
          </button>
          <span className="text-[#333]">|</span>
          <button
            onClick={() => setFilter("watchlist")}
            className={clsx(
              "transition-colors pb-1",
              filter === "watchlist"
                ? "text-brand-gold border-b border-brand-gold"
                : "text-brand-text-muted hover:text-brand-text",
            )}
          >
            Watchlist
          </button>
        </div>{" "}
      </div>

      {seriesQuery.isLoading ? (
        <div className="flex justify-center items-center py-20 text-brand-gold-alt opacity-50">
          <Loader2 className="animate-spin" size={32} />
        </div>
      ) : isPublicLocked ? (
        <div className="rounded-2xl border border-brand-gold/25 bg-brand-gold/[0.04] px-6 py-12 text-center text-sm text-brand-text-muted">
          Para visualização completa,{" "}
          <button
            type="button"
            onClick={() => setLocation("/login")}
            className="text-brand-gold hover:underline"
          >
            entre
          </button>{" "}
          ou{" "}
          <button
            type="button"
            onClick={() => setLocation("/cadastro")}
            className="text-brand-gold hover:underline"
          >
            crie sua conta
          </button>
          .
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 md:hidden">
            {canEdit && (
              <AddSeriesDialog
                defaultStatus={filter}
                onSubmit={(series) => addSeriesMutation.mutateAsync(series)}
                isPending={addSeriesMutation.isPending}
              />
            )}
            {mobileDisplayedSeries.map((series) => (
              <SeriesCard
                key={series.id}
                series={series}
                canEdit={canEdit}
                currentUserId={currentUserId}
                onSaveProgress={(payload) =>
                  updateProgressMutation.mutateAsync(payload)
                }
                onDelete={(seriesId) => deleteSeriesMutation.mutate(seriesId)}
                onRate={(seriesId, stars, review) =>
                  rateSeriesMutation.mutateAsync({
                    actorUserId: currentUserId || '',
                    seriesId,
                    stars,
                    review,
                  })
                }
              />
            ))}
            {mobileHasMore && (
              <button
                type="button"
                onClick={() => setMobileVisibleCount((count) => count + 10)}
                className="mt-1 border border-brand-gold bg-black px-4 py-3 text-xs uppercase tracking-widest text-white transition hover:bg-brand-gold/10"
              >
                Ver mais
              </button>
            )}
          </div>

          <div className="hidden md:grid md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-y-8 md:gap-x-6">
            {canEdit ? (
              <div className="flex">
                <AddSeriesDialog
                  defaultStatus={filter}
                  onSubmit={(series) => addSeriesMutation.mutateAsync(series)}
                  isPending={addSeriesMutation.isPending}
                />
              </div>
            ) : null}

            {displayedSeries.map((series) => (
              <SeriesCard
                key={series.id}
                series={series}
                canEdit={canEdit}
                currentUserId={currentUserId}
                onSaveProgress={(payload) =>
                  updateProgressMutation.mutateAsync(payload)
                }
                onDelete={(seriesId) => deleteSeriesMutation.mutate(seriesId)}
                onRate={(seriesId, stars, review) =>
                  rateSeriesMutation.mutateAsync({
                    actorUserId: currentUserId || '',
                    seriesId,
                    stars,
                    review,
                  })
                }
              />
            ))}
          </div>

          {hasMore && (
            <div className="hidden md:flex justify-center mt-6">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs uppercase tracking-widest text-brand-text-muted hover:text-brand-gold transition-colors py-2 px-4 bg-transparent border-none cursor-pointer focus:outline-none"
              >
                {isExpanded ? "recolher" : "mostrar todos"}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
