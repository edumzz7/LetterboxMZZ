import { useEffect, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Eye, EyeOff, Loader2, Trash2, Tv, X, Pencil, MessageSquare } from 'lucide-react';
import ReviewModal from '../ui/ReviewModal';
import clsx from 'clsx';
import { generateImagePath } from '../../lib/imageUtils';
import type { Series } from '../../hooks/useSeries';
import {
  getTvDetails,
  getTvSeasonEpisodes,
  getTvWatchProviders,
  searchSeries,
  type TMDBSeasonEpisode,
  type TMDBTvSeasonMeta,
} from '../../lib/tmdb';
import { updateSeriesStreaming } from '../../lib/appData';
import StarRatingInput from '../ui/StarRatingInput';

interface SeriesCardProps {
  series: Series;
  canEdit: boolean;
  currentUserId: string;
  onSaveProgress: (payload: {
    id: string;
    episodios_vistos?: number;
    temporada?: number;
    total_episodios?: number;
    status?: 'watchlist' | 'watching' | 'watched';
    plataforma_slug?: string;
  }) => Promise<unknown>;
  onDelete: (id: string) => void;
  onRate: (seriesId: string, stars: number, review?: string | null) => Promise<unknown>;
}

export default function SeriesCard({
  series,
  canEdit,
  currentUserId,
  onSaveProgress,
  onDelete,
  onRate,
}: SeriesCardProps) {
  const [open, setOpen] = useState(false);
  const [localEps, setLocalEps] = useState(series.episodios_vistos.toString());
  const [localTemporada, setLocalTemporada] = useState((series.temporada || 1).toString());
  const [localTotalEps, setLocalTotalEps] = useState((series.total_episodios || 0).toString());
  const [showProviders, setShowProviders] = useState(false);
  const [providersLoading, setProvidersLoading] = useState(false);
  const [providers, setProviders] = useState<Array<{ provider_id?: number; provider_name?: string; logo_path?: string | null }>>([]);
  const [tmdbSeriesId, setTmdbSeriesId] = useState<number | null>(null);
  const [seasonMeta, setSeasonMeta] = useState<TMDBTvSeasonMeta[]>([]);
  const [seasonEpisodes, setSeasonEpisodes] = useState<TMDBSeasonEpisode[]>([]);
  const [episodesLoading, setEpisodesLoading] = useState(false);
  const [episodesCache, setEpisodesCache] = useState<Record<number, TMDBSeasonEpisode[]>>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [ratingPending, setRatingPending] = useState<number | null>(null);
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [localRating, setLocalRating] = useState(series.rating ?? series.avaliacao ?? 0);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [pendingRating, setPendingRating] = useState<number>(localRating);
  const [reactionsOpen, setReactionsOpen] = useState(false);
  const providersRef = useRef<HTMLDivElement | null>(null);

  const syncLocalState = () => {
    setLocalEps(series.episodios_vistos.toString());
    setLocalTemporada((series.temporada || 1).toString());
    setLocalTotalEps((series.total_episodios || 0).toString());
  };

  const loadSeasonEpisodes = async (seriesId: number, seasonNumber: number) => {
    if (episodesCache[seasonNumber]) {
      setSeasonEpisodes(episodesCache[seasonNumber]);
      return;
    }
    setEpisodesLoading(true);
    try {
      const episodes = await getTvSeasonEpisodes(seriesId, seasonNumber);
      setSeasonEpisodes(episodes);
      setEpisodesCache((prev) => ({ ...prev, [seasonNumber]: episodes }));
    } finally {
      setEpisodesLoading(false);
    }
  };

  const hydrateSeriesContext = async (seasonNumber: number) => {
    let currentId = tmdbSeriesId;
    if (!currentId) {
      const candidates = await searchSeries(series.titulo);
      const picked = candidates[0];
      if (!picked) {
        setSeasonMeta([]);
        setSeasonEpisodes([]);
        return;
      }
      currentId = picked.id;
      setTmdbSeriesId(currentId);
    }

    if (seasonMeta.length === 0) {
      const details = await getTvDetails(currentId);
      if (details) {
        setSeasonMeta(details.seasons);
        const activeSeason = details.seasons.find((item) => item.season_number === seasonNumber);
        if (activeSeason?.episode_count && activeSeason.episode_count > 0) {
          setLocalTotalEps(String(activeSeason.episode_count));
        }
      }
    }

    await loadSeasonEpisodes(currentId, seasonNumber);
  };

  const limit = parseInt(localTotalEps, 10) || 1;
  const progressPercent =
    limit > 0 ? Math.min(100, Math.round((series.episodios_vistos / limit) * 100)) : 0;

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    const episodiosVistos = parseInt(localEps, 10);
    const temporada = parseInt(localTemporada, 10);
    const totalEpisodios = parseInt(localTotalEps, 10);

    if (Number.isNaN(episodiosVistos) || Number.isNaN(temporada) || Number.isNaN(totalEpisodios)) {
      return;
    }

    setSaveError(null);
    setIsSaving(true);
    try {
      await onSaveProgress({
        id: series.id,
        episodios_vistos: episodiosVistos,
        temporada,
        total_episodios: totalEpisodios,
      });
      setOpen(false);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Falha ao salvar progresso.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleStatus = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!canEdit) return;
    const nextStatus = series.status === 'watched' ? 'watchlist' : 'watched';
    onSaveProgress({
      id: series.id,
      status: nextStatus,
      episodios_vistos: nextStatus === 'watched' ? Math.max(series.total_episodios, 1) : 0,
    });
  };

  const handleDelete = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!canEdit) return;
    if (confirm(`Deseja remover a serie "${series.titulo}"?`)) {
      onDelete(series.id);
    }
  };

  const imageSrc = generateImagePath(series.titulo, series.capa_url);
  const isWatched = series.status === 'watched';
  const isFriendCard = series.user_id !== currentUserId;
  const canRate = canEdit && !isFriendCard && isWatched;
  const showRating = isWatched && (canRate || localRating > 0);

  const handleCoverClick = (event: React.MouseEvent) => {
    if (isFriendCard) {
      event.preventDefault();
      event.stopPropagation();
      setReactionsOpen((prev) => !prev);
    }
  };

  useEffect(() => {
    setLocalRating(series.rating ?? series.avaliacao ?? 0);
  }, [series.rating, series.avaliacao]);

  useEffect(() => {
    if (!series.streaming_data) {
      setProviders([]);
      return;
    }
    try {
      const parsed = JSON.parse(series.streaming_data);
      setProviders(Array.isArray(parsed) ? parsed : []);
    } catch {
      setProviders([]);
    }
  }, [series.streaming_data]);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (providersRef.current && !providersRef.current.contains(event.target as Node)) {
        setShowProviders(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const resolveProviders = async () => {
    if (providers.length > 0 || providersLoading) return;
    setProvidersLoading(true);
    try {
      const candidates = await searchSeries(series.titulo);
      const picked = candidates[0];
      if (!picked) {
        setProviders([]);
        return;
      }
      const nextProviders = await getTvWatchProviders(picked.id, 'BR');
      setProviders(nextProviders);
      await updateSeriesStreaming(series.id, JSON.stringify(nextProviders));
    } finally {
      setProvidersLoading(false);
    }
  };

  const derivedEpisodeCount = Math.min(
    Math.max(parseInt(localEps, 10) || 0, 0),
    Math.max(parseInt(localTotalEps, 10) || 0, 0),
  );

  const handleRate = async (stars: number, review?: string | null) => {
    const previousRating = localRating;
    setRatingError(null);
    setLocalRating(stars);
    setRatingPending(stars);
    try {
      await onRate(series.id, stars, review);
    } catch (error) {
      setLocalRating(previousRating);
      setRatingError(error instanceof Error ? error.message : 'Falha ao salvar avaliacao.');
    } finally {
      setRatingPending(null);
    }
  };

  return (
    <>
      <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) {
          syncLocalState();
          setSaveError(null);
          void hydrateSeriesContext(series.temporada || 1);
        }
        setOpen(nextOpen);
      }}
    >
      <Dialog.Trigger asChild disabled={!canEdit}>
        <div className="flex min-w-0 w-full flex-col gap-3 snap-center group">
          <div
            className={clsx(
              'relative aspect-[2/3] w-full rounded-md overflow-hidden bg-brand-card border border-[#222] transition-all',
              canEdit && 'hover:border-brand-gold-alt hover:shadow-[0_0_15px_rgba(212,175,55,0.15)] cursor-pointer',
              isFriendCard && 'cursor-pointer',
            )}
            onClick={handleCoverClick}
          >
            <img
              src={imageSrc}
              alt={series.titulo}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              onError={(event) => {
                (event.target as HTMLImageElement).style.display = 'none';
                (event.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden absolute inset-0 w-full h-full flex flex-col items-center justify-center p-4 text-center bg-brand-card">
              <Tv size={24} className="text-[#333] mb-2" />
              <span className="text-xs text-brand-text-muted">{series.titulo}</span>
            </div>

            {isFriendCard ? (
              <div
                className={clsx(
                  'absolute inset-0 flex items-center justify-center transition-opacity duration-200 z-20',
                  reactionsOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto',
                )}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-black/80 border border-[#333] rounded-full px-2 py-1 flex items-center gap-1">
                  {(['❤️', '🔥', '😂', '👎'] as const).map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setReactionsOpen(false);
                      }}
                      className="w-8 h-8 rounded-full border border-[#333] text-base hover:border-brand-gold/40 bg-brand-bg/70 flex items-center justify-center"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {!isFriendCard ? (
              <div
                onClick={(e) => { e.stopPropagation(); toggleStatus(e); }}
                className={clsx(
                  'absolute top-2 left-2 p-1.5 rounded-full bg-brand-bg/80 backdrop-blur-sm transition-all',
                  canEdit && 'hover:scale-110',
                  isWatched
                    ? 'text-brand-gold border border-brand-gold/30'
                    : 'text-brand-text-muted border border-[#333]/50 hover:text-brand-text',
                )}
                title={isWatched ? 'Retornar para watchlist' : 'Marcar como visto'}
              >
                {isWatched ? <Eye size={14} /> : <EyeOff size={14} />}
              </div>
            ) : null}

            {canEdit ? (
              <div
                onClick={(e) => { e.stopPropagation(); handleDelete(e); }}
                className="absolute top-10 left-2 p-1.5 rounded-full bg-brand-bg/80 backdrop-blur-sm text-brand-text-muted border border-[#333]/50 hover:text-red-500 hover:border-red-500/30 transition-all hover:scale-110"
                title="Remover"
              >
                <Trash2 size={14} />
              </div>
            ) : null}
          </div>

          <div className="flex flex-col gap-2 px-0.5">
            <h3 className="text-sm font-medium text-brand-text line-clamp-1" title={series.titulo}>
              {series.titulo}
            </h3>

            <div className="flex items-center justify-between mt-1 text-[10px] tracking-wider font-light uppercase">
              <span className="text-brand-text-muted">
                T{series.temporada || 1} {'\u2022'} {series.episodios_vistos} / {limit > 0 ? limit : '?'} EPS
              </span>
              <span className="text-brand-gold">{progressPercent}%</span>
            </div>
            <div className="w-full h-1 bg-[#0a0f1e] overflow-hidden rounded-full border border-[#222] mt-0.5">
              <div
                className="h-full bg-gradient-to-r from-brand-gold-alt to-brand-gold rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {showRating ? (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 group/stars">
                  <StarRatingInput
                    value={localRating}
                    onChange={(stars) => {
                      if (canRate) {
                        setPendingRating(stars);
                        setIsReviewModalOpen(true);
                      }
                    }}
                    disabled={!canRate}
                  />
                  {canRate ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPendingRating(localRating);
                        setIsReviewModalOpen(true);
                      }}
                      className="p-1 text-brand-text-muted hover:text-brand-gold transition-colors"
                      title="Escrever Resenha"
                    >
                      <Pencil size={12} className={clsx(series.review && "text-brand-gold-alt")} />
                    </button>
                  ) : (
                    series.review && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPendingRating(localRating);
                          setIsReviewModalOpen(true);
                        }}
                        className="p-1 text-brand-gold-alt hover:text-brand-gold transition-colors animate-pulse"
                        title="Ver Resenha"
                      >
                        <MessageSquare size={12} />
                      </button>
                    )
                  )}
                  {canRate && ratingPending ? <Loader2 size={12} className="animate-spin text-brand-gold ml-1" /> : null}
                </div>
                {ratingError ? <p className="text-[10px] leading-relaxed text-red-300">{ratingError}</p> : null}
              </div>
            ) : null}

            <div className="relative" ref={providersRef}>
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  const next = !showProviders;
                  setShowProviders(next);
                  if (next) void resolveProviders();
                }}
                className="text-[11px] uppercase tracking-[0.12em] text-brand-gold-alt hover:text-brand-gold"
              >
                Onde assistir?
              </button>
              {showProviders ? (
                <div className="absolute left-0 top-[110%] z-20 min-w-[180px] border border-[#222] rounded-md bg-[#0a0f1e] p-2">
                  {providersLoading ? (
                    <div className="flex items-center gap-2 text-xs text-brand-text-muted">
                      <Loader2 size={12} className="animate-spin" /> Carregando...
                    </div>
                  ) : providers.length > 0 ? (
                    <ul className="flex flex-col gap-1">
                      {providers.map((provider) => (
                        <li key={provider.provider_id ?? provider.provider_name} className="text-xs text-brand-text flex items-center gap-2">
                          {provider.logo_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                              alt={provider.provider_name ?? 'provider'}
                              className="w-5 h-5 rounded"
                            />
                          ) : null}
                          <span>{provider.provider_name}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-[10px] text-brand-text-muted uppercase tracking-[0.12em]">
                      Sem stream BR
                    </span>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </Dialog.Trigger>

      {canEdit ? (
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-xs translate-x-[-50%] translate-y-[-50%] gap-4 border border-[#222] bg-brand-bg p-6 shadow-lg rounded-xl">
            <div className="flex flex-col space-y-1.5 text-center sm:text-left">
              <Dialog.Title className="text-lg font-light text-brand-gold tracking-wider">
                EDITAR PROGRESSO
              </Dialog.Title>
              <Dialog.Description className="text-sm text-brand-text-muted">
                {series.titulo}
              </Dialog.Description>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-4 mt-2">
              <div className="flex items-center gap-4">
                <label htmlFor="temp" className="text-xs text-brand-text uppercase tracking-widest shrink-0 w-20">
                  Temp. Atual:
                </label>
                <input
                  id="temp"
                  type="number"
                  min="1"
                  value={localTemporada}
                  onChange={(event) => {
                    const next = event.target.value;
                    setLocalTemporada(next);
                    const seasonNumber = parseInt(next, 10);
                    if (Number.isNaN(seasonNumber) || seasonNumber < 1) return;
                    const selectedSeason = seasonMeta.find((item) => item.season_number === seasonNumber);
                    if (selectedSeason?.episode_count && selectedSeason.episode_count > 0) {
                      setLocalTotalEps(String(selectedSeason.episode_count));
                      setLocalEps((current) =>
                        String(
                          Math.min(
                            Math.max(parseInt(current, 10) || 0, 0),
                            selectedSeason.episode_count,
                          ),
                        ),
                      );
                    }
                    if (tmdbSeriesId) {
                      void loadSeasonEpisodes(tmdbSeriesId, seasonNumber);
                    } else {
                      void hydrateSeriesContext(seasonNumber);
                    }
                  }}
                  className="w-full bg-[#0a0f1e] border border-[#222] text-brand-text p-2 rounded focus:outline-none focus:border-brand-gold text-right"
                />
              </div>

              <div className="flex items-center gap-4">
                <label htmlFor="toteps" className="text-xs text-brand-text uppercase tracking-widest shrink-0 w-20">
                  Total Eps:
                </label>
                <input
                  id="toteps"
                  type="number"
                  min="1"
                  value={localTotalEps}
                  readOnly
                  className="w-full bg-[#0a0f1e] border border-[#222] text-brand-text p-2 rounded text-right cursor-not-allowed opacity-80"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="text-xs text-brand-text uppercase tracking-widest shrink-0 w-20">
                  Eps Vistos
                </label>
                <div className="w-full bg-[#0a0f1e] border border-[#222] text-brand-text p-2 rounded text-right opacity-80">
                  {derivedEpisodeCount}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label htmlFor="ep-select" className="text-xs text-brand-text uppercase tracking-widest shrink-0 w-20">
                  Ultimo Ep
                </label>
                <select
                  id="ep-select"
                  value={localEps}
                  onChange={(event) => setLocalEps(event.target.value)}
                  className="w-full bg-[#0a0f1e] border border-[#222] text-brand-text p-2 rounded focus:outline-none focus:border-brand-gold"
                >
                  <option value="0">Nenhum</option>
                  {seasonEpisodes.map((episode) => (
                    <option key={episode.episode_number} value={episode.episode_number}>
                      E{episode.episode_number}: {episode.name}
                    </option>
                  ))}
                </select>
              </div>
              {episodesLoading ? (
                <div className="text-[11px] text-brand-text-muted uppercase tracking-[0.12em] flex items-center gap-2">
                  <Loader2 size={12} className="animate-spin" /> Carregando episodios...
                </div>
              ) : null}
              {saveError ? <div className="text-[11px] text-red-300 leading-relaxed">{saveError}</div> : null}

              <div className="flex gap-3 justify-end mt-4">
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="px-4 py-2 text-xs uppercase tracking-wider text-brand-text-muted hover:text-brand-text transition-colors"
                  >
                    Cancelar
                  </button>
                </Dialog.Close>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 text-xs uppercase tracking-widest bg-brand-gold text-brand-bg font-medium rounded transition-all hover:bg-opacity-90 active:scale-95"
                >
                  {isSaving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>

            <Dialog.Close asChild>
              <button className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 hover:text-brand-gold">
                <X size={16} />
                <span className="sr-only">Close</span>
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      ) : null}
      </Dialog.Root>

      {isReviewModalOpen && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onOpenChange={setIsReviewModalOpen}
          title={series.titulo}
          coverUrl={series.capa_url}
          initialRating={pendingRating}
          initialReview={series.review || ''}
          isReadOnly={!canRate}
          onSave={async (stars, text) => {
            await handleRate(stars, text);
          }}
          onSkip={async (stars) => {
            await handleRate(stars, series.review);
          }}
        />
      )}
    </>
  );
}
