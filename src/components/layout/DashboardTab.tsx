import { useEffect, useMemo, useState } from 'react';
import { Star, Tv, Clapperboard, Heart, Film, RefreshCw, X } from 'lucide-react';
import { useLocation } from 'wouter';
import { useUserReviews } from '../../hooks/useReviews';
import { useQueryClient } from '@tanstack/react-query';
import { getReviewReaction } from '../../lib/reviewReactions';
import { searchMovies, searchSeries } from '../../lib/tmdb';
import { updateUserProfile } from '../../lib/appData';
import { FAVORITE_GENRES, getFavoriteGenre } from '../../lib/favoriteGenres';
import type { RankedUser } from '../../types/app';
import PreferenceSearchInput, { type PreferenceSearchItem } from './PreferenceSearchInput';
import { useUsers } from '../../hooks/useUsers';
import WatchPartyHistory from './WatchPartyHistory';
import FavoritePeopleList from '../people/FavoritePeopleList';

interface DashboardTabProps {
  user: RankedUser;
  isOwnDashboard?: boolean;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR');
  } catch {
    return '';
  }
}

export default function DashboardTab({ user, isOwnDashboard }: DashboardTabProps) {
  const [, setLocation] = useLocation();
  const reviewsQuery = useUserReviews(user.id);
  const usersQuery = useUsers(Boolean(isOwnDashboard));
  const queryClient = useQueryClient();
  const [isEditingPreferences, setIsEditingPreferences] = useState(false);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [preferencesError, setPreferencesError] = useState<string | null>(null);
  const [favoriteMovie, setFavoriteMovie] = useState(user.favorite_movie || '');
  const [favoriteMovie2, setFavoriteMovie2] = useState(user.favorite_movie_2 || '');
  const [favoriteSeries, setFavoriteSeries] = useState(user.favorite_series || '');
  const [favoriteGenre, setFavoriteGenre] = useState(user.favorite_genre || '');
  const [watchPreference, setWatchPreference] = useState<'home' | 'cinema' | ''>(user.watch_preference || '');

  useEffect(() => {
    setFavoriteMovie(user.favorite_movie || '');
    setFavoriteMovie2(user.favorite_movie_2 || '');
    setFavoriteSeries(user.favorite_series || '');
    setFavoriteGenre(user.favorite_genre || '');
    setWatchPreference(user.watch_preference || '');
  }, [user]);

  const beginPreferencesEdit = () => {
    setPreferencesError(null);
    setIsEditingPreferences(true);
  };

  const cancelPreferencesEdit = () => {
    setFavoriteMovie(user.favorite_movie || '');
    setFavoriteMovie2(user.favorite_movie_2 || '');
    setFavoriteSeries(user.favorite_series || '');
    setFavoriteGenre(user.favorite_genre || '');
    setWatchPreference(user.watch_preference || '');
    setPreferencesError(null);
    setIsEditingPreferences(false);
  };

  const savePreferences = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSavingPreferences(true);
    setPreferencesError(null);
    try {
      await updateUserProfile(user.id, {
        favorite_movie: favoriteMovie.trim() || undefined,
        favorite_movie_2: favoriteMovie2.trim() || undefined,
        favorite_series: favoriteSeries.trim() || undefined,
        favorite_genre: getFavoriteGenre(favoriteGenre)?.key || '',
        watch_preference: watchPreference || undefined,
      });
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsEditingPreferences(false);
    } catch (error) {
      setPreferencesError(error instanceof Error ? error.message : 'Falha ao salvar preferências.');
    } finally {
      setIsSavingPreferences(false);
    }
  };

  const movieSearchFn = async (query: string): Promise<PreferenceSearchItem[]> => {
    const results = await searchMovies(query);
    return results.map((result) => ({ id: result.id, title: result.title, release_date: result.release_date, poster_path: result.poster_path }));
  };

  const seriesSearchFn = async (query: string): Promise<PreferenceSearchItem[]> => {
    const results = await searchSeries(query);
    return results.map((result) => ({ id: result.id, title: result.name, release_date: result.first_air_date, poster_path: result.poster_path }));
  };

  const averageRating = useMemo(() => {
    const reviews = reviewsQuery.data || [];
    const validReviews = reviews.filter((r) => {
      const rating = Number(r.rating);
      return !isNaN(rating) && rating > 0;
    });

    if (validReviews.length === 0) return null;

    const totalScore = validReviews.reduce((sum, r) => sum + Number(r.rating), 0);
    return (totalScore / validReviews.length).toFixed(1);
  }, [reviewsQuery.data]);

  const latestReviews = useMemo(() => {
    const reviews = reviewsQuery.data || [];

    return reviews
      .filter((r) => r.review && r.review.trim().length > 0)
      .map((r) => ({
        id: r.id,
        providerExternalId: r.providerExternalId,
        title: r.title,
        type: r.type,
        rating: Number(r.rating) || 0,
        review: r.review!,
        date: r.createdAt,
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6);
  }, [reviewsQuery.data]);

  const EmptyStateShortcut = () => (
    isOwnDashboard ? (
      <button
        type="button"
        onClick={beginPreferencesEdit}
        className="text-brand-gold hover:underline text-sm font-medium mt-1 text-left w-fit"
      >
        + Adicionar
      </button>
    ) : (
      <span className="text-brand-text-muted text-sm mt-1">Não definido</span>
    )
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
      <div className="col-span-1 flex items-center justify-between border-b border-[#222] pb-3 md:col-span-2 lg:col-span-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-brand-text-muted">Preferências pessoais</p>
          <p className="mt-1 text-sm text-brand-text-muted/70">Seus favoritos e preferências de visualização.</p>
        </div>
        {isOwnDashboard && (
          <button
            type="button"
            onClick={beginPreferencesEdit}
            aria-label="Atualizar preferências"
            title="Atualizar preferências"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-brand-gold/40 text-brand-gold transition hover:bg-brand-gold/10"
          >
            <RefreshCw size={16} />
          </button>
        )}
      </div>

      {isEditingPreferences && (
        <form onSubmit={savePreferences} className="col-span-1 grid grid-cols-1 gap-4 rounded-2xl border border-brand-gold/25 bg-[#111] p-6 md:col-span-2 lg:col-span-3 md:grid-cols-2">
          <PreferenceSearchInput label="Filme Favorito" placeholder="Ex: O Poderoso Chefão" value={favoriteMovie} onChange={setFavoriteMovie} searchFn={movieSearchFn} />
          <PreferenceSearchInput label="Melhor Filme Que Viu" placeholder="Ex: Matrix" value={favoriteMovie2} onChange={setFavoriteMovie2} searchFn={movieSearchFn} />
          <PreferenceSearchInput label="Série Favorita" placeholder="Ex: Breaking Bad" value={favoriteSeries} onChange={setFavoriteSeries} searchFn={seriesSearchFn} />
          <div className="flex flex-col gap-2">
            <label className="mb-1 block text-xs uppercase tracking-[0.14em] text-brand-text-muted">Gênero Favorito</label>
            <select
              value={getFavoriteGenre(favoriteGenre) ? favoriteGenre : ''}
              onChange={(event) => setFavoriteGenre(event.target.value)}
              className="w-full rounded-lg border border-[#222] bg-[#151515] px-3 py-2 text-sm text-brand-text transition focus:border-brand-gold/40 focus:outline-none"
            >
              <option value="">Selecione um gênero</option>
              {FAVORITE_GENRES.map((genre) => (
                <option key={genre.key} value={genre.key}>{genre.label}</option>
              ))}
            </select>
            {favoriteGenre && !getFavoriteGenre(favoriteGenre) && (
              <p className="text-xs leading-relaxed text-amber-200/80">
                O gênero salvo anteriormente não está mais disponível. Escolha uma nova opção para atualizar.
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <span className="mb-1 block text-xs uppercase tracking-[0.14em] text-brand-text-muted">Onde prefere assistir</span>
            <div className="flex flex-wrap gap-5 text-sm text-brand-text">
              <label className="flex cursor-pointer items-center gap-2"><input type="radio" name="dashboard_watch_preference" checked={watchPreference === 'home'} onChange={() => setWatchPreference('home')} /> Em Casa</label>
              <label className="flex cursor-pointer items-center gap-2"><input type="radio" name="dashboard_watch_preference" checked={watchPreference === 'cinema'} onChange={() => setWatchPreference('cinema')} /> No Cinema</label>
            </div>
          </div>
          {preferencesError && <p className="text-xs text-red-300 md:col-span-2">{preferencesError}</p>}
          <div className="flex justify-end gap-3 md:col-span-2">
            <button type="button" onClick={cancelPreferencesEdit} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs uppercase tracking-[0.14em] text-brand-text-muted transition hover:text-brand-text"><X size={14} /> Cancelar</button>
            <button type="submit" disabled={isSavingPreferences} className="rounded-lg bg-brand-gold px-4 py-2 text-xs uppercase tracking-[0.14em] text-brand-bg transition hover:bg-brand-gold/90 disabled:opacity-50">{isSavingPreferences ? 'Salvando...' : 'Salvar preferências'}</button>
          </div>
        </form>
      )}

      {!isEditingPreferences && <>
      <div className="bg-[#111] border border-[#222] rounded-2xl p-6 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-brand-gold-alt mb-2">
          <Heart size={18} />
          <h3 className="text-xs tracking-widest uppercase">Filme Favorito</h3>
        </div>
        {user.favorite_movie ? (
          <p className="text-lg font-light text-brand-text">{user.favorite_movie}</p>
        ) : <EmptyStateShortcut />}
      </div>

      <div className="bg-[#111] border border-[#222] rounded-2xl p-6 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-brand-gold-alt mb-2">
          <Heart size={18} />
          <h3 className="text-xs tracking-widest uppercase">Melhor Filme Que Viu</h3>
        </div>
        {user.favorite_movie_2 ? (
          <p className="text-lg font-light text-brand-text">{user.favorite_movie_2}</p>
        ) : <EmptyStateShortcut />}
      </div>

      <div className="bg-[#111] border border-[#222] rounded-2xl p-6 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-brand-gold-alt mb-2">
          <Film size={18} />
          <h3 className="text-xs tracking-widest uppercase">Série Favorita</h3>
        </div>
        {user.favorite_series ? (
          <p className="text-lg font-light text-brand-text">{user.favorite_series}</p>
        ) : <EmptyStateShortcut />}
      </div>

      <div className="bg-[#111] border border-[#222] rounded-2xl p-6 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-brand-gold-alt mb-2">
          <Clapperboard size={18} />
          <h3 className="text-xs tracking-widest uppercase">Gênero Favorito</h3>
        </div>
        {user.favorite_genre ? (
          <p className="text-lg font-light text-brand-text">{getFavoriteGenre(user.favorite_genre)?.label || user.favorite_genre}</p>
        ) : <EmptyStateShortcut />}
      </div>

      <div className="bg-[#111] border border-[#222] rounded-2xl p-6 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-brand-gold-alt mb-2">
          <Tv size={18} />
          <h3 className="text-xs tracking-widest uppercase">Onde prefere Assistir</h3>
        </div>
        {user.watch_preference ? (
          <p className="text-lg font-light text-brand-text capitalize">
            {user.watch_preference === 'cinema' ? 'No Cinema' : 'Em Casa'}
          </p>
        ) : <EmptyStateShortcut />}
      </div>

      <div className="bg-[#111] border border-[#222] rounded-2xl p-6 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-brand-gold-alt mb-2">
          <Star size={18} />
          <h3 className="text-xs tracking-widest uppercase">Média de Avaliação</h3>
        </div>
        <p className="text-lg font-light text-brand-text">
          {averageRating ? `${averageRating} / 5.0` : <span className="text-brand-text-muted text-sm mt-1">Sem avaliações</span>}
        </p>
      </div>

      {/* Seção de Resenhas */}
      </>}

      <div className="col-span-1 md:col-span-2 lg:col-span-3 mt-6 flex flex-col gap-4">
        <h2 className="text-sm font-semibold tracking-[0.25em] uppercase text-brand-gold">
          Artistas favoritos
        </h2>
        <FavoritePeopleList
          userId={user.id}
          variant="grid"
          emptyMessage={isOwnDashboard
            ? 'Você ainda não favoritou nenhum artista. Use a estrela na página de um ator ou diretor.'
            : 'Nenhum artista favoritado ainda.'}
        />
      </div>

      {isOwnDashboard && <div className="col-span-1 md:col-span-2 lg:col-span-3 mt-6"><WatchPartyHistory currentUserId={user.id} users={usersQuery.data || []} compact /></div>}

      <div className="col-span-1 md:col-span-2 lg:col-span-3 mt-6 flex flex-col gap-6">
        <h2 className="text-sm font-semibold tracking-[0.25em] uppercase text-brand-gold">
          Últimas Resenhas
        </h2>

        {latestReviews.length === 0 ? (
          <div className="bg-[#111] border border-[#222] rounded-2xl p-8 text-center text-brand-text-muted text-sm font-light">
            Nenhuma resenha escrita ainda.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {latestReviews.map((item) => {
              const reaction = getReviewReaction(item.rating);
              return (
                <div key={item.id} className="flex items-start gap-4">
                  {/* Reação visual baseada na nota */}
                  <img
                    src={reaction}
                    alt={`Reação para nota ${item.rating.toFixed(1)} de 5`}
                    className="w-12 h-12 sm:w-14 sm:h-14 object-contain select-none pt-1 shrink-0 hover:scale-110 transition-transform duration-200"
                  />

                  {/* Balão de fala */}
                  <div className="flex-1 bg-[#111] border border-[#222] rounded-2xl p-5 relative min-w-0 before:content-[''] before:absolute before:top-6 before:-left-[9px] before:w-4 before:h-4 before:rotate-45 before:bg-[#111] before:border-l before:border-b before:border-[#222] transition-colors hover:border-brand-gold/20 duration-300">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <button
                        type="button"
                        onClick={() => setLocation(item.type === 'movie' ? `/filme/${item.providerExternalId}` : `/serie/${item.providerExternalId}`)}
                        disabled={!item.providerExternalId}
                        className="block max-w-full cursor-pointer truncate pr-2 text-left text-sm font-semibold text-brand-text transition hover:text-brand-gold disabled:cursor-default disabled:hover:text-brand-text sm:text-base"
                        title={`Abrir ${item.title}`}
                      >
                        {item.title}
                      </button>
                      <span className="text-[10px] text-brand-text-muted tracking-wide shrink-0">
                        {formatDate(item.date)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-brand-gold-alt mb-3">
                      <Star size={10} className="fill-brand-gold-alt text-brand-gold-alt" />
                      <span>{Number(item.rating || 0).toFixed(1)} / 5.0</span>
                      <span className="text-brand-text-muted/40 mx-1">•</span>
                      <span className="text-brand-text-muted uppercase text-[9px] tracking-wider font-semibold">
                        {item.type === 'movie' ? 'Filme' : 'Série'}
                      </span>
                    </div>

                    {/* Texto da resenha */}
                    <p className="text-sm font-light text-brand-text/90 italic leading-relaxed pl-3 border-l-2 border-brand-gold/30 break-words">
                      "{item.review}"
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
