import { useEffect, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Loader2, Plus, X } from 'lucide-react';
import type { AppUser, PersonalMovie } from '../../types/app';
import { useSuggestMovie } from '../../hooks/useSuggestMovie';
import { searchMovies, type TMDBMovie } from '../../lib/tmdb';

interface SuggestMovieModalProps {
  currentUserId: string;
  users: AppUser[];
}

export default function SuggestMovieModal({ currentUserId, users }: SuggestMovieModalProps) {
  const [open, setOpen] = useState(false);
  const [friendId, setFriendId] = useState('');
  const [query, setQuery] = useState('');
  const [selectedMovie, setSelectedMovie] = useState<TMDBMovie | null>(null);
  const [searchResults, setSearchResults] = useState<TMDBMovie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [capaUrl, setCapaUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const searchTimeout = useRef<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const suggestMutation = useSuggestMovie();

  const options = users.filter((user) => user.id !== currentUserId);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const reset = () => {
    setFriendId('');
    setQuery('');
    setSelectedMovie(null);
    setSearchResults([]);
    setIsSearching(false);
    setShowDropdown(false);
    setCapaUrl('');
    setError(null);
    setOpen(false);
  };

  const handleTitleChange = (value: string) => {
    setQuery(value);
    setSelectedMovie(null);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (!value.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    setShowDropdown(true);
    searchTimeout.current = window.setTimeout(async () => {
      const results = await searchMovies(value);
      setSearchResults(results);
      setIsSearching(false);
    }, 400);
  };

  const selectMovie = (movie: TMDBMovie) => {
    setSelectedMovie(movie);
    setQuery(movie.title);
    if (movie.poster_path) {
      setCapaUrl(`https://image.tmdb.org/t/p/w500${movie.poster_path}`);
    } else {
      setCapaUrl('');
    }
    setShowDropdown(false);
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!friendId || !selectedMovie) {
      setError('Selecione um filme da busca TMDB para indicar.');
      return;
    }
    setError(null);

    const payload: Omit<PersonalMovie, 'id' | 'user_id' | 'created_at'> = {
      titulo: selectedMovie.title.trim(),
      ano_lancamento: selectedMovie.release_date
        ? parseInt(selectedMovie.release_date.split('-')[0], 10) || null
        : null,
      capa_url: capaUrl.trim() || null,
      plataforma_slug: 'stremio',
      status: 'watchlist',
      source: 'manual',
      source_movie_id: String(selectedMovie.id),
    };

    try {
      await suggestMutation.mutateAsync({
        fromUserId: currentUserId,
        toUserId: friendId,
        movie: payload,
      });
      reset();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Falha ao indicar filme.');
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="inline-flex items-center gap-2 px-3 py-2 border border-brand-gold/40 rounded-lg text-xs uppercase tracking-[0.14em] text-brand-gold hover:bg-brand-gold/10 transition">
          <Plus size={14} /> Indicar Filme
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-[92vw] max-w-lg translate-x-[-50%] translate-y-[-50%] border border-[#222] bg-brand-bg p-6 shadow-lg rounded-xl">
          <Dialog.Title className="text-lg text-brand-gold tracking-widest uppercase">Indicar Filme</Dialog.Title>
          <Dialog.Description className="text-sm text-brand-text-muted mt-2">
            Escolha um amigo e envie um filme para a watchlist dele.
          </Dialog.Description>

          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
            <select
              value={friendId}
              onChange={(event) => setFriendId(event.target.value)}
              className="w-full bg-[#0a0f1e] border border-[#222] text-brand-text p-2.5 rounded"
              required
            >
              <option value="">Selecione um amigo</option>
              {options.map((user) => (
                <option key={user.id} value={user.id}>{user.username}</option>
              ))}
            </select>

            <div className="relative" ref={dropdownRef}>
              <input
                value={query}
                onChange={(event) => handleTitleChange(event.target.value)}
                onFocus={() => {
                  if (query.trim() && searchResults.length > 0) setShowDropdown(true);
                }}
                placeholder="Buscar filme no TMDB"
                className="w-full bg-[#0a0f1e] border border-[#222] text-brand-text p-2.5 rounded pr-10"
                required
              />
              {isSearching ? (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gold">
                  <Loader2 size={16} className="animate-spin" />
                </div>
              ) : null}

              {showDropdown ? (
                <div className="absolute top-[100%] left-0 w-full mt-1 bg-[#0a0f1e] border border-[#222] rounded-md shadow-[0_10px_30px_rgba(0,0,0,0.8)] z-50 max-h-60 overflow-y-auto">
                  {searchResults.length > 0 ? (
                    <ul className="flex flex-col">
                      {searchResults.map((movie) => (
                        <li
                          key={movie.id}
                          onClick={() => selectMovie(movie)}
                          className="flex items-center gap-3 p-2 hover:bg-[#1a2235] cursor-pointer transition-colors border-b border-[#222] last:border-none"
                        >
                          {movie.poster_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                              alt={movie.title}
                              className="w-8 h-12 object-cover rounded shadow-sm"
                            />
                          ) : (
                            <div className="w-8 h-12 bg-black flex items-center justify-center rounded border border-[#222]">
                              <span className="text-[10px] text-brand-text-muted">N/A</span>
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="text-sm text-brand-text line-clamp-1">{movie.title}</span>
                            <span className="text-xs text-brand-gold-alt">
                              {movie.release_date ? movie.release_date.split('-')[0] : 'N/D'}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : query.trim() !== '' && !isSearching ? (
                    <div className="p-4 text-center text-sm text-brand-text-muted font-light">
                      Nenhum filme encontrado no TMDB.
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            <input
                value={capaUrl}
                onChange={(event) => setCapaUrl(event.target.value)}
                placeholder="URL da capa (opcional)"
                className="w-full bg-[#0a0f1e] border border-[#222] text-brand-text p-2.5 rounded"
              />

            {selectedMovie ? (
              <p className="text-[11px] text-brand-gold-alt">
                Selecionado: {selectedMovie.title}
                {selectedMovie.release_date ? ` (${selectedMovie.release_date.split('-')[0]})` : ''}
              </p>
            ) : null}

            {error ? <p className="text-xs text-red-300">{error}</p> : null}

            <button
              type="submit"
              disabled={suggestMutation.isPending}
              className="px-4 py-2 text-xs uppercase tracking-[0.14em] bg-brand-gold text-brand-bg rounded disabled:opacity-50"
            >
              {suggestMutation.isPending ? 'Enviando...' : 'Enviar indicacao'}
            </button>
          </form>

          <Dialog.Close asChild>
            <button className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 hover:text-brand-gold">
              <X size={16} />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
