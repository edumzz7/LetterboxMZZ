import { Loader2, UserRound } from 'lucide-react';
import clsx from 'clsx';
import { useLocation } from 'wouter';
import TmdbImage from '../ui/TmdbImage';
import { useUserFavoritePeople } from '../../hooks/useFavoritePeople';
import type { UserFavoritePerson } from '../../types/app';

interface FavoritePeopleListProps {
  userId: string | null | undefined;
  /** `compact` para o drawer (lista vertical); `grid` para a aba Perfil. */
  variant?: 'compact' | 'grid';
  emptyMessage: string;
}

function getPersonPath(person: UserFavoritePerson) {
  return person.department === 'Directing' ? `/director/${person.tmdbPersonId}` : `/actor/${person.tmdbPersonId}`;
}

export default function FavoritePeopleList({ userId, variant = 'grid', emptyMessage }: FavoritePeopleListProps) {
  const [, setLocation] = useLocation();
  const { data: people = [], isLoading, isError } = useUserFavoritePeople(userId);
  const isCompact = variant === 'compact';

  if (isLoading) {
    return (
      <div className="flex justify-center py-6" role="status" aria-label="Carregando artistas favoritos">
        <Loader2 size={18} className="animate-spin text-brand-gold" />
      </div>
    );
  }

  if (isError) {
    return <p className="text-xs text-red-300">Não foi possível carregar os artistas favoritos.</p>;
  }

  if (people.length === 0) {
    return <p className="text-xs font-light leading-relaxed text-brand-text-muted">{emptyMessage}</p>;
  }

  return (
    <ul className={clsx(isCompact ? 'flex flex-col gap-1' : 'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3')}>
      {people.map((person) => (
        <li key={person.id} className="min-w-0">
          <button
            type="button"
            onClick={() => setLocation(getPersonPath(person))}
            className={clsx(
              'group flex w-full min-w-0 cursor-pointer items-center gap-3 text-left transition-colors',
              isCompact
                ? 'rounded-md px-2 py-1.5 hover:bg-brand-gold/10'
                : 'rounded-2xl border border-[#222] bg-brand-card p-3 hover:border-brand-gold/40',
            )}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#222] bg-[#050811]">
              {person.profilePath ? (
                <TmdbImage
                  src={`https://image.tmdb.org/t/p/w185${person.profilePath}`}
                  alt={person.name}
                  sizes="40px"
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserRound size={18} className="text-[#333]" />
              )}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm text-brand-text transition-colors group-hover:text-brand-gold">{person.name}</span>
              <span className="block text-[10px] uppercase tracking-wider text-brand-text-muted">
                {person.department === 'Directing' ? 'Direção' : 'Atuação'}
              </span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
