import { useEffect, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tv, Eye, Plus, Trash2, Edit3, Star, ArrowLeft, Play, Video, Lock } from 'lucide-react';
import { useLocation } from 'wouter';
import { useSeries } from '../../hooks/useSeries';
import { useUsers } from '../../hooks/useUsers';
import { getTvDetailsRawWithFallback, getTvCredits, getTvSimilarWithFallback, getTvWatchProviders, getTvSeasonEpisodes, getTvYouTubeTrailer, isReleaseDateUpcoming, type TMDBTvSeasonMeta } from '../../lib/tmdb';
import { getSeriesCineratsStats } from '../../lib/appData';
import StarRatingInput from '../ui/StarRatingInput';
import ReviewModal from '../ui/ReviewModal';
import AvatarDisplay from '../layout/AvatarDisplay';
import { generateImagePath } from '../../lib/imageUtils';
import clsx from 'clsx';
import SimilarMediaSection from '../ui/SimilarMediaSection';
import WatchedTimingDialog from '../movies/WatchedTimingDialog';
import TmdbImage from '../ui/TmdbImage';
import { DetailPageSkeleton } from '../ui/LoadingSkeleton';
import { Skeleton } from '../ui/LoadingSkeleton';

interface SeriesDetailScreenProps {
  id: string;
  currentUserId: string | null;
}

export default function SeriesDetailScreen({ id, currentUserId }: SeriesDetailScreenProps) {
  const [, setLocation] = useLocation();
  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    setLocation('/');
  };
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const [isWatchedTimingOpen, setIsWatchedTimingOpen] = useState(false);
  const isGuest = !currentUserId;
  const [pendingSeriesCompletion, setPendingSeriesCompletion] = useState<{
    temporada: number;
    total_episodios: number;
    episodios_vistos: number;
  } | null>(null);

  // 1. Fetch TMDB TV Details (Raw)
  const seriesQuery = useQuery({
    queryKey: ['tmdb-tv-details', id],
    queryFn: () => getTvDetailsRawWithFallback(Number(id)),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // 2. Fetch TMDB TV Credits
  const creditsQuery = useQuery({
    queryKey: ['tmdb-tv-credits', id],
    queryFn: () => getTvCredits(id),
    staleTime: 1000 * 60 * 10,
    enabled: !!seriesQuery.data,
  });

  // 3. Fetch TMDB TV Watch Providers
  const providersQuery = useQuery({
    queryKey: ['tmdb-tv-providers', id],
    queryFn: () => getTvWatchProviders(Number(id)),
    staleTime: 1000 * 60 * 10,
    enabled: !!seriesQuery.data,
  });

  const trailerQuery = useQuery({
    queryKey: ['tmdb-tv-trailer', id],
    queryFn: () => getTvYouTubeTrailer(id),
    staleTime: 1000 * 60 * 60 * 24,
    enabled: !!seriesQuery.data,
  });

  const similarQuery = useQuery({
    queryKey: ['tmdb-tv-similar', id],
    queryFn: () => getTvSimilarWithFallback(
      Number(id),
      (seriesQuery.data?.genres || []).map((genre: { id: number }) => genre.id),
    ),
    staleTime: 1000 * 60 * 60,
    enabled: !!seriesQuery.data,
  });

  // 4. Fetch CineRats Stats for this series
  const cineratsQuery = useQuery({
    queryKey: ['cinerats-series-stats', id],
    queryFn: () => getSeriesCineratsStats(id, seriesQuery.data?.name || ''),
    enabled: !!seriesQuery.data,
  });

  // 5. Fetch episodes of selected season
  const episodesQuery = useQuery({
    queryKey: ['tmdb-tv-episodes', id, selectedSeason],
    queryFn: () => getTvSeasonEpisodes(Number(id), selectedSeason),
    enabled: !!seriesQuery.data && selectedSeason > 0,
    staleTime: 1000 * 60 * 10,
  });

  // 6. Hook into series mutations and users
  const { seriesQuery: userSeriesQuery, addSeriesMutation, updateProgressMutation, deleteSeriesMutation, rateSeriesMutation } = useSeries(currentUserId);
  const usersQuery = useUsers();

  const series = seriesQuery.data;
  const credits = creditsQuery.data;
  const providers = providersQuery.data || [];
  const cineratsStats = cineratsQuery.data;
  const userSeriesList = useMemo(() => userSeriesQuery.data || [], [userSeriesQuery.data]);
  const users = usersQuery.data || [];

  // Match current user's local series document
  const userSeriesDoc = useMemo(() => {
    if (!series) return null;
    return userSeriesList.find(
      (s) => s.titulo.toLowerCase().trim() === series.name.toLowerCase().trim()
    );
  }, [userSeriesList, series]);
  const canEditUserReview = Boolean(
    currentUserId && userSeriesDoc && userSeriesDoc.user_id === currentUserId,
  );

  // Sync selected season with user's progress
  useEffect(() => {
    if (userSeriesDoc && userSeriesDoc.temporada) {
      setSelectedSeason(userSeriesDoc.temporada);
    }
  }, [userSeriesDoc]);

  const startYear = series?.first_air_date ? series.first_air_date.split('-')[0] : null;
  const isUpcoming = isReleaseDateUpcoming(series?.first_air_date);
  const creators: Array<{ id: number; name: string }> = series?.created_by || [];
  const cast = credits?.cast?.slice(0, 6) || [];
  const genres = series?.genres?.map((genre: { name: string }) => genre.name).join(', ') || '';
  const seasonsList = useMemo<TMDBTvSeasonMeta[]>(
    () => series?.seasons || [],
    [series?.seasons],
  );

  const activeSeasonMeta = useMemo(() => {
    return seasonsList.find((season) => season.season_number === selectedSeason);
  }, [seasonsList, selectedSeason]);
  const regularSeasons = useMemo(
    () => seasonsList
      .filter((season) => season.season_number > 0)
      .sort((a, b) => a.season_number - b.season_number),
    [seasonsList],
  );
  const lastSeasonMeta = regularSeasons[regularSeasons.length - 1];

  const isPending =
    addSeriesMutation.isPending ||
    updateProgressMutation.isPending ||
    deleteSeriesMutation.isPending ||
    rateSeriesMutation.isPending;

  const handleAddSeries = async (status: 'watchlist' | 'watching' | 'watched', isRetroactive = false) => {
    if (isGuest || !series || (isUpcoming && status !== 'watchlist')) return;
    const totalEpsOfSeason = activeSeasonMeta?.episode_count || 1;
    const targetSeason = status === 'watched'
      ? (lastSeasonMeta?.season_number || selectedSeason)
      : selectedSeason;
    const targetSeasonEpisodes = status === 'watched'
      ? (lastSeasonMeta?.episode_count || totalEpsOfSeason)
      : totalEpsOfSeason;

    await addSeriesMutation.mutateAsync({
      titulo: series.name,
      capa_url: series.poster_path ? `https://image.tmdb.org/t/p/w500${series.poster_path}` : null,
      status,
      temporada: targetSeason,
      total_episodios: targetSeasonEpisodes,
      episodios_vistos: status === 'watched' ? targetSeasonEpisodes : 0,
      plataforma_slug: 'stremio',
      source_movie_id: String(series.id),
      rating: null,
      streaming_data: JSON.stringify(providers),
      is_retroactive: status === 'watched' ? isRetroactive : false,
    });
    await cineratsQuery.refetch();
  };

  const saveSeriesProgress = async (
    progress: {
      id: string;
      temporada: number;
      total_episodios: number;
      episodios_vistos: number;
      status: 'watchlist' | 'watching' | 'watched';
    },
    isRetroactive = false,
  ) => {
    if (isGuest) return;
    await updateProgressMutation.mutateAsync({
      ...progress,
      is_retroactive: isRetroactive,
    });
    await cineratsQuery.refetch();
  };

  const handleUpdateEpisodeProgress = async (episodeNumber: number) => {
    if (!userSeriesDoc) return;
    const totalEpsOfSeason = activeSeasonMeta?.episode_count || 1;
    const completedSeries = Boolean(
      lastSeasonMeta
      && selectedSeason === lastSeasonMeta.season_number
      && episodeNumber >= totalEpsOfSeason,
    );
    const nextStatus = completedSeries
      ? 'watched'
      : episodeNumber > 0 || userSeriesDoc.status !== 'watchlist'
        ? 'watching'
        : 'watchlist';

    if (completedSeries) {
      setPendingSeriesCompletion({
        temporada: selectedSeason,
        total_episodios: totalEpsOfSeason,
        episodios_vistos: episodeNumber,
      });
      setIsWatchedTimingOpen(true);
      return;
    }

    setIsUpdatingProgress(true);
    try {
      await saveSeriesProgress({
        id: userSeriesDoc.id,
        temporada: selectedSeason,
        total_episodios: totalEpsOfSeason,
        episodios_vistos: episodeNumber,
        status: nextStatus,
      });
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  const handleConfirmWatched = async (isRetroactive: boolean) => {
    if (isGuest || !series || isUpcoming) return;

    if (pendingSeriesCompletion && userSeriesDoc) {
      await saveSeriesProgress(
        {
          id: userSeriesDoc.id,
          ...pendingSeriesCompletion,
          status: 'watched',
        },
        isRetroactive,
      );
      setPendingSeriesCompletion(null);
      return;
    }

    if (userSeriesDoc) {
      const totalEpsOfSeries = lastSeasonMeta?.episode_count || activeSeasonMeta?.episode_count || 1;
      await saveSeriesProgress(
        {
          id: userSeriesDoc.id,
          temporada: lastSeasonMeta?.season_number || selectedSeason,
          total_episodios: totalEpsOfSeries,
          episodios_vistos: totalEpsOfSeries,
          status: 'watched',
        },
        isRetroactive,
      );
      return;
    }

    await handleAddSeries('watched', isRetroactive);
  };

  const handleWatchedTimingOpenChange = (open: boolean) => {
    setIsWatchedTimingOpen(open);
    if (!open) setPendingSeriesCompletion(null);
  };

  const handleToggleWatchlistOnly = async () => {
    if (isGuest || !series) return;
    if (userSeriesDoc) {
      if (userSeriesDoc.status === 'watchlist') {
        await deleteSeriesMutation.mutateAsync(userSeriesDoc.id);
      } else {
        await updateProgressMutation.mutateAsync({
          id: userSeriesDoc.id,
          status: 'watchlist',
          temporada: userSeriesDoc.temporada,
          total_episodios: userSeriesDoc.total_episodios,
          episodios_vistos: 0,
        });
      }
      cineratsQuery.refetch();
    } else {
      await handleAddSeries('watchlist');
    }
  };

  const handleSaveRatingAndReview = async (stars: number, review: string) => {
    if (!canEditUserReview || !userSeriesDoc) return;
    await rateSeriesMutation.mutateAsync({
      actorUserId: currentUserId!,
      seriesId: userSeriesDoc.id,
      stars,
      review,
    });
    cineratsQuery.refetch();
  };

  if (seriesQuery.isLoading || creditsQuery.isLoading) {
    return <DetailPageSkeleton title="Carregando série" />;
  }

  if (seriesQuery.isError || !series) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
        <span className="text-4xl">📺</span>
        <h2 className="text-lg uppercase tracking-widest text-red-400">Série não encontrada</h2>
        <button
          onClick={handleBack}
          className="text-xs uppercase tracking-widest text-brand-gold hover:underline flex items-center gap-2 mt-2"
        >
          <ArrowLeft size={14} /> Voltar para o painel
        </button>
      </div>
    );
  }

  const imageSrc = generateImagePath(series.name, series.poster_path ? `https://image.tmdb.org/t/p/w500${series.poster_path}` : null);
  const backdropUrl = series.backdrop_path ? `https://image.tmdb.org/t/p/original${series.backdrop_path}` : '';
  const tmdbRating = Number(series.vote_average ?? 0) / 2;
  const progressPercent = userSeriesDoc && userSeriesDoc.total_episodios > 0
    ? Math.min(100, Math.round((userSeriesDoc.episodios_vistos / userSeriesDoc.total_episodios) * 100))
    : 0;

  return (
    <div className="flex-1 min-w-0 animate-in fade-in duration-500">
      {/* 1. Backdrop Hero Banner */}
      <div className="relative -mx-4 sm:-mx-7 lg:-mx-9 -mt-4 sm:-mt-7 lg:-mt-9 h-[25vh] sm:h-[35vh] md:h-[40vh] overflow-hidden rounded-t-3xl border-b border-[#151515]">
        {backdropUrl && (
          <>
            <TmdbImage
              src={backdropUrl}
              alt={series.name}
              sizes="100vw"
              loading="eager"
              className="w-full h-full object-cover object-top opacity-30 blur-[2px] scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          </>
        )}
        <button
          onClick={handleBack}
          className="absolute top-6 left-6 px-4 py-2 border border-white/10 rounded-xl text-xs uppercase tracking-widest bg-black/60 backdrop-blur-md text-brand-text hover:text-brand-gold hover:border-brand-gold/30 transition-all flex items-center gap-2 z-10"
        >
          <ArrowLeft size={14} /> Painel
        </button>
      </div>

      {/* 2. Main Content Grid */}
      <div className="relative z-10 px-0 sm:px-4 -mt-24 sm:-mt-32 md:-mt-40 flex flex-col md:flex-row gap-8 items-start">
        {/* Left Side: Poster */}
        <div className="w-48 sm:w-56 md:w-64 aspect-[2/3] shrink-0 rounded-2xl overflow-hidden border border-[#222] bg-[#050811] shadow-2xl shadow-black/80 mx-auto md:mx-0">
          <TmdbImage src={imageSrc} alt={series.name} sizes="(max-width: 639px) 192px, 256px" className="w-full h-full object-cover" />
        </div>

        {/* Right Side: Information */}
        <div className="flex-1 min-w-0 flex flex-col gap-6 text-center md:text-left">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extralight tracking-wide text-brand-text break-words uppercase">
              {series.name} {startYear && <span className="text-brand-gold-alt font-light text-2xl">({startYear})</span>}
            </h1>
            <p className="text-xs uppercase tracking-widest text-brand-text-muted font-light">
              {genres} {series.number_of_seasons ? `• ${series.number_of_seasons} temp.` : ''} {series.number_of_episodes ? `• ${series.number_of_episodes} eps.` : ''}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <button
              onClick={handleToggleWatchlistOnly}
              disabled={isPending || isGuest}
              title={isGuest ? 'Entre para usar a watchlist' : undefined}
              className={clsx(
                'flex items-center gap-2 py-3 px-6 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all active:scale-95 border disabled:opacity-50',
                userSeriesDoc?.status === 'watchlist'
                  ? 'bg-brand-gold text-brand-bg border-brand-gold font-bold'
                  : 'bg-black/45 border-[#222] text-brand-text hover:border-brand-gold/35 hover:text-brand-gold'
              )}
            >
              {isGuest ? <Lock size={14} /> : userSeriesDoc?.status === 'watchlist' ? <Trash2 size={14} /> : <Plus size={14} />}
              {isGuest ? 'Watchlist' : userSeriesDoc?.status === 'watchlist' ? 'Na Watchlist' : 'Watchlist'}
            </button>

            {!isUpcoming && !userSeriesDoc && (
              <>
                <button
                  onClick={() => handleAddSeries('watching')}
                  disabled={isPending || isGuest}
                  title={isGuest ? 'Entre para acompanhar esta serie' : undefined}
                  className="flex items-center gap-2 py-3 px-6 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all active:scale-95 border bg-black/45 border-[#222] text-brand-text hover:border-brand-gold/35 hover:text-brand-gold disabled:opacity-50"
                >
                  {isGuest ? <Lock size={14} /> : <Play size={12} className="fill-brand-text text-brand-text" />}
                  Acompanhar
                </button>
              </>
            )}

            {!isUpcoming && userSeriesDoc?.status !== 'watched' && (
              <button
                onClick={() => setIsWatchedTimingOpen(true)}
                disabled={isPending || isGuest}
                title={isGuest ? 'Entre para marcar como vista' : undefined}
                className="flex items-center gap-2 py-3 px-6 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all active:scale-95 border bg-black/45 border-[#222] text-brand-text hover:border-brand-gold/35 hover:text-brand-gold disabled:opacity-50"
              >
                {isGuest ? <Lock size={14} /> : <Eye size={14} />}
                Marcar Vista
              </button>
            )}

            {canEditUserReview && userSeriesDoc && (
              <button
                onClick={() => setIsReviewOpen(true)}
                className="flex items-center gap-2 py-3 px-6 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all active:scale-95 border bg-black/45 border-[#222] text-brand-gold-alt hover:border-brand-gold hover:text-brand-gold"
              >
                <Edit3 size={14} />
                {userSeriesDoc.review ? 'Editar Resenha' : 'Escrever Resenha'}
              </button>
            )}
          </div>

          {/* Interactive Rating Input if watched */}
          {canEditUserReview && userSeriesDoc?.status === 'watched' && (
            <div className="flex items-center justify-center md:justify-start gap-4 p-4 rounded-2xl bg-black/20 border border-[#151515] w-fit">
              <span className="text-xs uppercase tracking-wider text-brand-text-muted font-light">Sua avaliação:</span>
              <StarRatingInput
                value={userSeriesDoc?.rating ?? userSeriesDoc?.avaliacao ?? 0}
                onChange={(val) => handleSaveRatingAndReview(val, userSeriesDoc?.review || '')}
                disabled={isPending}
              />
              <span className="text-xs font-bold text-brand-gold">
                {(userSeriesDoc?.rating || userSeriesDoc?.avaliacao) ? `${Number(userSeriesDoc.rating ?? userSeriesDoc.avaliacao ?? 0).toFixed(1)} / 5.0` : 'Sem nota'}
              </span>
            </div>
          )}

          {/* Progress Tracker (If watching or watched) */}
          {userSeriesDoc && userSeriesDoc.status !== 'watchlist' && (
            <div className="bg-black/20 border border-[#151515] rounded-2xl p-4 w-full sm:max-w-md space-y-2 text-left">
              <div className="flex items-center justify-between text-xs tracking-wider uppercase font-light">
                <span className="text-brand-text-muted">
                  Progresso: Temp. {userSeriesDoc.temporada || 1} • {userSeriesDoc.episodios_vistos} / {userSeriesDoc.total_episodios} eps
                </span>
                <span className="text-brand-gold font-semibold">{progressPercent}%</span>
              </div>
              <div className="w-full h-1.5 bg-[#0a0f1e] overflow-hidden rounded-full border border-[#222]">
                <div
                  className="h-full bg-gradient-to-r from-brand-gold-alt to-brand-gold rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* CineRats Stats Block */}
          {cineratsStats && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-black/20 border border-[#151515] rounded-2xl p-4 w-full sm:max-w-lg mt-2">
              <div className="text-center border-r border-[#151515] pr-4">
                <span className="text-[10px] uppercase tracking-widest text-brand-text-muted block">Média CineRats</span>
                <span className="text-2xl font-bold text-brand-gold flex items-center justify-center gap-1.5 mt-1">
                  <Star size={18} className="fill-brand-gold text-brand-gold shrink-0" />
                  {cineratsStats.averageRating > 0 ? Number(cineratsStats.averageRating).toFixed(1) : '-'}
                </span>
              </div>
              <div className="text-center pl-4 flex flex-col justify-center">
                <span className="text-[10px] uppercase tracking-widest text-brand-text-muted block">Média TMDB</span>
                <span className="text-2xl font-bold text-brand-gold flex items-center justify-center gap-1.5 mt-1">
                  <Star size={18} className="fill-brand-gold text-brand-gold shrink-0" />
                  {tmdbRating > 0 ? tmdbRating.toFixed(1) : '-'}
                </span>
              </div>
              <div className="col-span-2 border-t border-[#151515] pt-3 text-center sm:col-span-1 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0 flex flex-col justify-center">
                <span className="text-[10px] uppercase tracking-widest text-brand-text-muted block">Acompanham/Viram</span>
                <span className="text-xl font-light text-brand-text mt-1">
                  {cineratsStats.watchersCount} {cineratsStats.watchersCount === 1 ? 'membro' : 'membros'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Details & Seasons */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12">
        {/* Main Details (Sinopse, Temporadas e Episódios) */}
        <div className="lg:col-span-2 space-y-10">
          {/* Synopsis */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold tracking-[0.25em] uppercase text-brand-gold">Sinopse</h3>
            <p className="text-brand-text/90 font-light leading-relaxed text-sm">
              {series.overview || <span className="italic text-brand-text-muted">Sinopse não disponível no momento.</span>}
            </p>
          </div>

          {trailerQuery.data && (
            <a
              href={trailerQuery.data.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#222] bg-black/35 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-brand-gold-alt transition-colors hover:border-brand-gold hover:bg-brand-gold/10 hover:text-brand-gold"
              aria-label={`Abrir trailer de ${series.name} no YouTube`}
            >
              <Video size={15} /> Link do Trailer no YouTube
            </a>
          )}

          {/* Technical Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold tracking-[0.25em] uppercase text-brand-gold">Ficha Técnica & Elenco</h3>
            <div className="bg-black/10 border border-[#151515] rounded-2xl p-5 space-y-4">
              <div className="text-sm">
                <span className="font-semibold text-brand-text-muted uppercase text-xs tracking-wider">Criador:</span>{' '}
                {creators.length ? creators.map((creator, index) => <span key={creator.id}>{index > 0 && ', '}<button type="button" onClick={() => setLocation(`/director/${creator.id}`)} className="cursor-pointer font-light text-brand-text transition hover:text-brand-gold hover:underline">{creator.name}</button></span>) : <span className="font-light text-brand-text">Não especificado</span>}
              </div>

              {cast.length > 0 && (
                <div>
                  <span className="font-semibold text-brand-text-muted uppercase text-xs tracking-wider block mb-3">Elenco principal:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {cast.map((actor: { id: number; name: string; profile_path: string | null; character?: string }) => (
                      <button key={actor.id} type="button" onClick={() => setLocation(`/actor/${actor.id}`)} className="flex min-w-0 cursor-pointer items-center gap-2 text-left transition hover:text-brand-gold">
                        {actor.profile_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                            alt={actor.name}
                            className="w-10 h-10 object-cover rounded-full border border-[#222] shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full border border-[#222] bg-brand-card flex items-center justify-center shrink-0">
                            <Tv size={14} className="text-[#333]" />
                          </div>
                        )}
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs truncate font-medium text-brand-text">{actor.name}</span>
                          <span className="text-[10px] text-brand-text-muted truncate font-light">{actor.character}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold tracking-[0.25em] uppercase text-brand-gold">Onde Assistir</h3>
            {providersQuery.isLoading ? (
              <p className="text-xs text-brand-text-muted">Consultando plataformas...</p>
            ) : providers.length ? (
              <div className="flex items-center gap-3 flex-wrap">
                {providers.map((provider) => (
                  <div key={provider.provider_id} className="flex items-center gap-2 bg-black/35 border border-[#151515] px-3 py-1.5 rounded-xl text-xs font-light text-brand-text shrink-0">
                    {provider.logo_path ? (
                      <img src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`} alt={provider.provider_name} className="w-5 h-5 rounded object-cover" />
                    ) : (
                      <Tv size={12} className="text-brand-gold-alt" />
                    )}
                    {provider.provider_name}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-brand-text-muted">Nenhuma plataforma encontrada no Brasil.</p>
            )}
          </div>

          <SimilarMediaSection items={similarQuery.data || []} type="series" isLoading={similarQuery.isLoading} />

          {/* Seasons and Episodes Selector */}
          {seasonsList.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#151515] pb-3">
                <h3 className="text-sm font-semibold tracking-[0.25em] uppercase text-brand-gold">Episódios por Temporada</h3>

                {/* Season select */}
                <select
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(Number(e.target.value))}
                  className="bg-[#0a0f1e] border border-[#222] text-xs font-semibold uppercase tracking-wider text-brand-text px-3 py-1.5 rounded-xl focus:outline-none focus:border-brand-gold cursor-pointer"
                >
                  {seasonsList
                    .filter((season) => season.season_number > 0)
                    .map((season) => (
                      <option key={season.season_number} value={season.season_number}>
                        Temporada {season.season_number} ({season.episode_count} eps)
                      </option>
                    ))}
                </select>
              </div>

              {/* Episodes List */}
              <div className="bg-black/15 border border-[#151515] rounded-2xl p-4">
                {episodesQuery.isLoading ? (
                  <div className="flex items-center justify-center py-12 text-brand-text-muted text-xs uppercase tracking-widest gap-2">
                    <div role="status" aria-label="Carregando episódios" className="space-y-2">{[0, 1, 2, 3].map((item) => <div key={item} className="flex items-center gap-3 rounded-xl border border-white/5 p-3"><Skeleton className="h-12 w-20 shrink-0 rounded" /><div className="flex-1 space-y-2"><Skeleton className="h-3 w-1/2" /><Skeleton className="h-2.5 w-4/5" /></div></div>)}</div>
                  </div>
                ) : episodesQuery.data && episodesQuery.data.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-2">
                    {episodesQuery.data.map((ep) => {
                      const isSeen = userSeriesDoc &&
                        userSeriesDoc.temporada === selectedSeason &&
                        userSeriesDoc.episodios_vistos >= ep.episode_number;


                      return (
                        <div
                          key={ep.episode_number}
                          onClick={() => {
                            if (userSeriesDoc && !isUpdatingProgress) {
                              handleUpdateEpisodeProgress(
                                isSeen ? ep.episode_number - 1 : ep.episode_number
                              );
                            }
                          }}
                          className={clsx(
                            'flex items-center justify-between p-3 rounded-xl border transition-all select-none',
                            userSeriesDoc ? 'cursor-pointer hover:border-brand-gold/30 hover:bg-black/40' : '',
                            isSeen
                              ? 'bg-brand-gold/5 border-brand-gold/20 text-brand-gold'
                              : 'bg-black/20 border-[#151515] text-brand-text-muted'
                          )}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-[10px] font-semibold tracking-wider bg-black/40 px-2 py-0.5 rounded border border-[#222] shrink-0">
                              EP {ep.episode_number}
                            </span>
                            <span className="text-xs font-light truncate">{ep.name}</span>
                          </div>

                          {userSeriesDoc && (
                            <button
                              type="button"
                              disabled={isUpdatingProgress}
                              className={clsx(
                                'p-1 rounded-full border transition-colors shrink-0',
                                isSeen
                                  ? 'border-brand-gold bg-brand-gold/25 text-brand-gold'
                                  : 'border-[#222] text-[#333] hover:text-brand-text hover:border-brand-text'
                              )}
                            >
                              <Eye size={12} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-xs text-brand-text-muted italic">
                    Nenhum episódio listado para esta temporada.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <div className="space-y-6">
          <h3 className="text-sm font-semibold tracking-[0.25em] uppercase text-brand-gold">Resenhas CineRats</h3>

          {cineratsStats?.reviews && cineratsStats.reviews.length > 0 ? (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              {cineratsStats.reviews.map((rev, idx) => {
                const author = users.find((u) => u.id === rev.userId);
                if (!author) return null;
                const formattedDate = new Date(rev.createdAt).toLocaleDateString('pt-BR');

                return (
                  <div key={idx} className="bg-black/35 border border-[#151515] rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <a href={`/${author.username}`} className="flex items-center gap-2 group min-w-0">
                        <AvatarDisplay avatarId={author.avatar_id} className="w-6 h-6 rounded-full overflow-hidden shrink-0 border border-[#222]" />
                        <span className="text-xs font-semibold text-brand-text group-hover:text-brand-gold transition-colors truncate">
                          {author.display_name || author.username}
                        </span>
                      </a>
                      <span className="text-[9px] text-brand-text-muted tracking-wide shrink-0">{formattedDate}</span>
                    </div>

                    {rev.rating !== null && rev.rating > 0 && (
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={10}
                            className={clsx(
                              rev.rating! >= star
                                ? 'text-yellow-400 fill-yellow-400'
                                : rev.rating! >= star - 0.5
                                ? 'text-yellow-400 fill-yellow-400 overflow-hidden'
                                : 'text-[#333]'
                            )}
                          />
                        ))}
                        <span className="text-[10px] text-brand-gold ml-1 font-light">{Number(rev.rating || 0).toFixed(1)}</span>
                      </div>
                    )}

                    <p className="text-xs text-brand-text/90 font-light leading-relaxed whitespace-pre-wrap">
                      {rev.review}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-[#111] border border-[#222] rounded-2xl p-8 text-center text-brand-text-muted text-xs font-light">
              Nenhuma resenha escrita ainda.
            </div>
          )}
        </div>
      </div>

      {/* Review Modal for editing review */}
      {canEditUserReview && userSeriesDoc && (
        <ReviewModal
          isOpen={isReviewOpen}
          onOpenChange={setIsReviewOpen}
          title={series.name}
          coverUrl={series.poster_path ? `https://image.tmdb.org/t/p/w500${series.poster_path}` : null}
          initialRating={userSeriesDoc.rating ?? userSeriesDoc.avaliacao ?? 0}
          initialReview={userSeriesDoc.review || ''}
          isReadOnly={false}
          onSave={async (stars, text) => {
            await handleSaveRatingAndReview(stars, text);
          }}
          onSkip={async (stars) => {
            await handleSaveRatingAndReview(stars, userSeriesDoc.review || '');
          }}
          watchedAt={userSeriesDoc.status === 'watched' ? userSeriesDoc.created_at : null}
          isRetroactive={Boolean(userSeriesDoc.is_retroactive)}
        />
      )}

      <WatchedTimingDialog
        open={isWatchedTimingOpen}
        onOpenChange={handleWatchedTimingOpenChange}
        mediaTitle={series.name}
        mediaType="series"
        isPending={isPending || isUpdatingProgress}
        onConfirm={handleConfirmWatched}
      />
    </div>
  );
}
