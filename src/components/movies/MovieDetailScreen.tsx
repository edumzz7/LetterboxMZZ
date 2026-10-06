import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Film, Eye, EyeOff, Plus, Trash2, Edit3, Star, ArrowLeft, Video, Lock } from 'lucide-react';
import { useLocation } from 'wouter';
import { usePersonalMovies } from '../../hooks/usePersonalMovies';
import { useSocialActions } from '../../hooks/useSocialActions';
import { useUsers } from '../../hooks/useUsers';
import { getMovieDetailsWithFallback, getMovieCredits, getMovieSimilarWithFallback, getMovieWatchProviders, getMovieYouTubeTrailer, isReleaseDateOnOrBeforeToday } from '../../lib/tmdb';
import { getMovieCineratsStats } from '../../lib/appData';
import StarRatingInput from '../ui/StarRatingInput';
import ReviewModal from '../ui/ReviewModal';
import AvatarDisplay from '../layout/AvatarDisplay';
import { generateImagePath } from '../../lib/imageUtils';
import clsx from 'clsx';
import SimilarMediaSection from '../ui/SimilarMediaSection';
import WatchedTimingDialog from './WatchedTimingDialog';
import TmdbImage from '../ui/TmdbImage';
import { DetailPageSkeleton } from '../ui/LoadingSkeleton';

interface MovieDetailScreenProps {
  id: string;
  currentUserId: string | null;
}

export default function MovieDetailScreen({ id, currentUserId }: MovieDetailScreenProps) {
  const [, setLocation] = useLocation();
  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    setLocation('/');
  };
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isWatchedTimingOpen, setIsWatchedTimingOpen] = useState(false);
  const isGuest = !currentUserId;

  // 1. Fetch TMDB Movie Details
  const movieQuery = useQuery({
    queryKey: ['tmdb-movie-details', id],
    queryFn: () => getMovieDetailsWithFallback(id),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // 2. Fetch TMDB Movie Credits
  const creditsQuery = useQuery({
    queryKey: ['tmdb-movie-credits', id],
    queryFn: () => getMovieCredits(id),
    staleTime: 1000 * 60 * 10,
    enabled: !!movieQuery.data,
  });

  // 3. Fetch TMDB Watch Providers
  const providersQuery = useQuery({
    queryKey: ['tmdb-movie-providers', id],
    queryFn: () => getMovieWatchProviders(Number(id)),
    staleTime: 1000 * 60 * 10,
    enabled: !!movieQuery.data,
  });

  const trailerQuery = useQuery({
    queryKey: ['tmdb-movie-trailer', id],
    queryFn: () => getMovieYouTubeTrailer(id),
    staleTime: 1000 * 60 * 60 * 24,
    enabled: !!movieQuery.data,
  });

  const similarQuery = useQuery({
    queryKey: ['tmdb-movie-similar', id],
    queryFn: () => getMovieSimilarWithFallback(
      Number(id),
      (movieQuery.data?.genres || []).map((genre: { id: number }) => genre.id),
    ),
    staleTime: 1000 * 60 * 60,
    enabled: !!movieQuery.data,
  });

  // 4. Fetch CineRats Stats and Reviews for this Movie
  const cineratsQuery = useQuery({
    queryKey: ['cinerats-movie-stats', id],
    queryFn: () => getMovieCineratsStats(id, movieQuery.data?.title || ''),
    enabled: !!movieQuery.data,
  });

  // 5. Load current user's movies to match local state
  const { moviesQuery, addMovieMutation, updateStatusMutation, deleteMovieMutation } = usePersonalMovies(currentUserId);
  const { rateMutation } = useSocialActions();
  const usersQuery = useUsers();

  const movie = movieQuery.data;
  const credits = creditsQuery.data;
  const providers = providersQuery.data || [];
  const cineratsStats = cineratsQuery.data;
  const userMovies = useMemo(() => moviesQuery.data || [], [moviesQuery.data]);
  const users = usersQuery.data || [];

  // Find if current user has this movie in their list
  const userMovieDoc = useMemo(() => {
    if (!movie) return null;
    return userMovies.find(
      (m) =>
        m.source_movie_id === String(movie.id) ||
        m.titulo.toLowerCase().trim() === movie.title.toLowerCase().trim()
    );
  }, [userMovies, movie]);
  const canEditUserReview = Boolean(
    currentUserId && userMovieDoc && userMovieDoc.user_id === currentUserId,
  );

  const releaseYear = movie?.release_date ? movie.release_date.split('-')[0] : null;
  const releaseDateEntries = movie?.release_dates?.results as Array<{
    release_dates?: Array<{ release_date?: string }>;
  }> | undefined;
  const hasBeenReleasedAnywhere = releaseDateEntries
    ? releaseDateEntries.some((country) =>
      (country.release_dates || []).some((release) => isReleaseDateOnOrBeforeToday(release.release_date)))
    : isReleaseDateOnOrBeforeToday(movie?.release_date);
  const canMarkWatched = hasBeenReleasedAnywhere || Number(movie?.vote_count || 0) >= 10;
  const director = credits?.crew?.find((member: { job?: string }) => member.job === 'Director');
  const cast = credits?.cast?.slice(0, 6) || [];
  const genres = movie?.genres?.map((genre: { name: string }) => genre.name).join(', ') || '';

  const isPending =
    addMovieMutation.isPending ||
    updateStatusMutation.isPending ||
    deleteMovieMutation.isPending ||
    rateMutation.isPending;

  const handleToggleWatchlist = async () => {
    if (isGuest || !movie) return;
    if (userMovieDoc) {
      if (userMovieDoc.status === 'watchlist') {
        // Remove from list entirely if they click Watchlist again
        await deleteMovieMutation.mutateAsync(userMovieDoc.id);
        cineratsQuery.refetch();
      } else {
        // Change from Watched to Watchlist
        await updateStatusMutation.mutateAsync({ id: userMovieDoc.id, status: 'watchlist' });
        cineratsQuery.refetch();
      }
    } else {
      // Add to watchlist
      await addMovieMutation.mutateAsync({
        titulo: movie.title,
        ano_lancamento: releaseYear ? parseInt(releaseYear, 10) : null,
        capa_url: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
        status: 'watchlist',
        source: 'manual',
        source_movie_id: String(movie.id),
        plataforma_slug: 'stremio',
        rating: null,
        streaming_data: JSON.stringify(providers),
      });
      cineratsQuery.refetch();
    }
  };

  const handleConfirmWatched = async (isRetroactive: boolean) => {
    if (isGuest || !movie || !canMarkWatched) return;
    if (userMovieDoc) {
      await updateStatusMutation.mutateAsync({
        id: userMovieDoc.id,
        status: 'watched',
        is_retroactive: isRetroactive,
      });
    } else {
      await addMovieMutation.mutateAsync({
        titulo: movie.title,
        ano_lancamento: releaseYear ? parseInt(releaseYear, 10) : null,
        capa_url: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
        status: 'watched',
        source: 'manual',
        source_movie_id: String(movie.id),
        plataforma_slug: 'stremio',
        rating: null,
        streaming_data: JSON.stringify(providers),
        is_retroactive: isRetroactive,
      });
    }
    await cineratsQuery.refetch();
  };

  const handleToggleWatched = async () => {
    if (isGuest || !movie || !canMarkWatched) return;
    if (userMovieDoc?.status === 'watched') {
      // If watched, change to watchlist immediately.
      await updateStatusMutation.mutateAsync({ id: userMovieDoc.id, status: 'watchlist' });
      await cineratsQuery.refetch();
      return;
    }

    setIsWatchedTimingOpen(true);
  };

  const handleSaveRatingAndReview = async (stars: number, review: string) => {
    if (!canEditUserReview || !userMovieDoc || !movie) return;
    await rateMutation.mutateAsync({
      actorUserId: currentUserId!,
      movieId: userMovieDoc.id,
      movieTitle: movie.title,
      stars,
      review,
    });
    cineratsQuery.refetch();
  };

  if (movieQuery.isLoading || creditsQuery.isLoading) {
    return <DetailPageSkeleton title="Carregando filme" />;
  }

  if (movieQuery.isError || !movie) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
        <span className="text-4xl">🍿</span>
        <h2 className="text-lg uppercase tracking-widest text-red-400">Filme não encontrado</h2>
        <button
          onClick={handleBack}
          className="text-xs uppercase tracking-widest text-brand-gold hover:underline flex items-center gap-2 mt-2"
        >
          <ArrowLeft size={14} /> Voltar para o painel
        </button>
      </div>
    );
  }

  const imageSrc = generateImagePath(movie.title, movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null);
  const backdropUrl = movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : '';
  const tmdbRating = Number(movie.vote_average ?? 0) / 2;

  return (
    <div className="flex-1 min-w-0 animate-in fade-in duration-500">
      {/* 1. Backdrop Hero Banner */}
      <div className="relative -mx-4 sm:-mx-7 lg:-mx-9 -mt-4 sm:-mt-7 lg:-mt-9 h-[25vh] sm:h-[35vh] md:h-[40vh] overflow-hidden rounded-t-3xl border-b border-[#151515]">
        {backdropUrl && (
          <>
            <TmdbImage
              src={backdropUrl}
              alt={movie.title}
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
          <TmdbImage src={imageSrc} alt={movie.title} sizes="(max-width: 639px) 192px, 256px" className="w-full h-full object-cover" />
        </div>

        {/* Right Side: Information */}
        <div className="flex-1 min-w-0 flex flex-col gap-6 text-center md:text-left">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extralight tracking-wide text-brand-text break-words uppercase">
              {movie.title} {releaseYear && <span className="text-brand-gold-alt font-light text-2xl">({releaseYear})</span>}
            </h1>
            <p className="text-xs uppercase tracking-widest text-brand-text-muted font-light">
              {genres} {movie.runtime ? `• ${movie.runtime} min` : ''}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <button
              onClick={handleToggleWatchlist}
              disabled={isPending || isGuest}
              title={isGuest ? 'Entre para usar a watchlist' : undefined}
              className={clsx(
                'flex items-center gap-2 py-3 px-6 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all active:scale-95 border disabled:opacity-50 disabled:cursor-not-allowed',
                userMovieDoc?.status === 'watchlist'
                  ? 'bg-brand-gold text-brand-bg border-brand-gold font-bold'
                  : 'bg-black/45 border-[#222] text-brand-text hover:border-brand-gold/35 hover:text-brand-gold'
              )}
            >
              {isGuest ? <Lock size={14} /> : userMovieDoc?.status === 'watchlist' ? <Trash2 size={14} /> : <Plus size={14} />}
              {isGuest ? 'Watchlist' : userMovieDoc?.status === 'watchlist' ? 'Na Watchlist' : 'Watchlist'}
            </button>

            {canMarkWatched && (
              <button
                onClick={handleToggleWatched}
                disabled={isPending || isGuest}
                title={isGuest ? 'Entre para marcar como visto' : undefined}
                className={clsx(
                  'flex items-center gap-2 py-3 px-6 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all active:scale-95 border disabled:opacity-50 disabled:cursor-not-allowed',
                  userMovieDoc?.status === 'watched'
                    ? 'bg-green-600 border-green-600 text-white font-bold'
                    : 'bg-black/45 border-[#222] text-brand-text-muted hover:border-brand-gold/35 hover:text-brand-gold'
                )}
              >
                {isGuest ? <Lock size={14} /> : userMovieDoc?.status === 'watched' ? <EyeOff size={14} /> : <Eye size={14} />}
                {isGuest ? 'Marcar visto' : userMovieDoc?.status === 'watched' ? 'Visto' : 'Marcar visto'}
              </button>
            )}

            {canEditUserReview && userMovieDoc?.status === 'watched' && (
              <button
                onClick={() => setIsReviewOpen(true)}
                className="flex items-center gap-2 py-3 px-6 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all active:scale-95 border bg-black/45 border-[#222] text-brand-gold-alt hover:border-brand-gold hover:text-brand-gold"
              >
                <Edit3 size={14} />
                {userMovieDoc.review ? 'Editar Resenha' : 'Escrever Resenha'}
              </button>
            )}
          </div>

          {/* Interactive Rating Input if watched */}
          {canEditUserReview && userMovieDoc?.status === 'watched' && (
            <div className="flex items-center justify-center md:justify-start gap-4 p-4 rounded-2xl bg-black/20 border border-[#151515] w-fit">
              <span className="text-xs uppercase tracking-wider text-brand-text-muted font-light">Sua avaliação:</span>
              <StarRatingInput
                value={userMovieDoc?.rating ?? userMovieDoc?.avaliacao ?? 0}
                onChange={(val) => handleSaveRatingAndReview(val, userMovieDoc?.review || '')}
                disabled={isPending}
              />
              <span className="text-xs font-bold text-brand-gold">
                {(userMovieDoc?.rating || userMovieDoc?.avaliacao) ? `${Number(userMovieDoc.rating ?? userMovieDoc.avaliacao ?? 0).toFixed(1)} / 5.0` : 'Sem nota'}
              </span>
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
                <span className="text-[10px] uppercase tracking-widest text-brand-text-muted block">Visto Por</span>
                <span className="text-xl font-light text-brand-text mt-1">
                  {cineratsStats.watchersCount} {cineratsStats.watchersCount === 1 ? 'membro' : 'membros'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Details Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12">
        {/* Main Details (Sinopse, Elenco, Watch Providers) */}
        <div className="lg:col-span-2 space-y-10">
          {/* Synopsis */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold tracking-[0.25em] uppercase text-brand-gold">Sinopse</h3>
            <p className="text-brand-text/90 font-light leading-relaxed text-sm">
              {movie.overview || <span className="italic text-brand-text-muted">Sinopse não disponível no momento.</span>}
            </p>
          </div>

          {trailerQuery.data && (
            <a
              href={trailerQuery.data.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#222] bg-black/35 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-brand-gold-alt transition-colors hover:border-brand-gold hover:bg-brand-gold/10 hover:text-brand-gold"
              aria-label={`Abrir trailer de ${movie.title} no YouTube`}
            >
              <Video size={15} /> Link do Trailer no YouTube
            </a>
          )}

          {/* Director & Cast */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold tracking-[0.25em] uppercase text-brand-gold">Ficha Técnica & Elenco</h3>
            <div className="bg-black/10 border border-[#151515] rounded-2xl p-5 space-y-4">
              <div className="text-sm">
                <span className="font-semibold text-brand-text-muted uppercase text-xs tracking-wider">Diretor:</span>{' '}
                {director ? <button type="button" onClick={() => setLocation(`/director/${director.id}`)} className="cursor-pointer font-light text-brand-text transition hover:text-brand-gold hover:underline">{director.name}</button> : <span className="font-light text-brand-text">Desconhecido</span>}
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
                            <Film size={14} className="text-[#333]" />
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

          {/* Streaming / Watch Providers */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold tracking-[0.25em] uppercase text-brand-gold">Onde Assistir</h3>
            {providersQuery.isLoading ? (
              <p className="text-xs text-brand-text-muted">Consultando plataformas...</p>
            ) : providers.length ? (
              <div className="flex items-center gap-3 flex-wrap">
                {providers.map((p) => (
                  <div
                    key={p.provider_id}
                    className="flex items-center gap-2 bg-black/35 border border-[#151515] px-3 py-1.5 rounded-xl text-xs font-light text-brand-text shrink-0"
                  >
                    {p.logo_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w92${p.logo_path}`}
                        alt={p.provider_name}
                        className="w-5 h-5 rounded object-cover"
                      />
                    ) : (
                      <Film size={12} className="text-brand-gold-alt" />
                    )}
                    {p.provider_name}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-brand-text-muted">Nenhuma plataforma encontrada no Brasil.</p>
            )}
          </div>

          <SimilarMediaSection items={similarQuery.data || []} type="movie" isLoading={similarQuery.isLoading} />
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
                                ? 'text-yellow-400 fill-yellow-400 overflow-hidden' // Simplified half star
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
      {canEditUserReview && userMovieDoc && (
        <ReviewModal
          isOpen={isReviewOpen}
          onOpenChange={setIsReviewOpen}
          title={movie.title}
          coverUrl={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null}
          initialRating={userMovieDoc.rating ?? userMovieDoc.avaliacao ?? 0}
          initialReview={userMovieDoc.review ?? ''}
          isReadOnly={false}
          onSave={async (stars, text) => {
            await handleSaveRatingAndReview(stars, text);
          }}
          watchedAt={userMovieDoc.status === 'watched' ? userMovieDoc.created_at : null}
          isRetroactive={Boolean(userMovieDoc.is_retroactive)}
        />
      )}

      <WatchedTimingDialog
        open={isWatchedTimingOpen}
        onOpenChange={setIsWatchedTimingOpen}
        mediaTitle={movie.title}
        isPending={isPending}
        onConfirm={handleConfirmWatched}
      />
    </div>
  );
}
