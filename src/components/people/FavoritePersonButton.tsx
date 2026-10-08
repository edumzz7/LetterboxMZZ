import { Loader2, Lock, Star } from 'lucide-react';
import clsx from 'clsx';
import { MAX_FAVORITE_PEOPLE, useFavoritePeople, type FavoritePersonInput } from '../../hooks/useFavoritePeople';

interface FavoritePersonButtonProps {
  currentUserId: string | null;
  person: FavoritePersonInput;
}

export default function FavoritePersonButton({ currentUserId, person }: FavoritePersonButtonProps) {
  const { isFavorited, isLimitReached, isLoading, isToggling, toggle, error, resetError } = useFavoritePeople(currentUserId);
  const isGuest = !currentUserId;
  const favorited = isFavorited(person.tmdbPersonId);
  const blockedByLimit = !favorited && isLimitReached;
  const disabled = isGuest || isLoading || isToggling || blockedByLimit;

  const handleClick = () => {
    resetError();
    toggle({ person, isFavorite: favorited }).catch(() => undefined);
  };

  const title = isGuest
    ? 'Entre para favoritar artistas'
    : favorited
      ? 'Remover dos artistas favoritos'
      : 'Adicionar aos artistas favoritos';

  return (
    <div className="flex flex-col items-center gap-2 md:items-start">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        aria-pressed={favorited}
        aria-label={title}
        title={title}
        className={clsx(
          'flex items-center gap-2 rounded-xl border px-6 py-3 text-xs font-semibold uppercase tracking-wider transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50',
          favorited
            ? 'border-brand-gold bg-brand-gold font-bold text-brand-bg'
            : 'border-[#222] bg-black/45 text-brand-text hover:border-brand-gold/35 hover:text-brand-gold',
        )}
      >
        {isGuest ? (
          <Lock size={14} />
        ) : isToggling ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Star size={14} className={clsx(favorited && 'fill-brand-bg')} />
        )}
        {favorited ? 'Favorito' : 'Favoritar'}
      </button>

      {blockedByLimit && (
        <p role="status" className="text-xs text-brand-text-muted">
          Limite de {MAX_FAVORITE_PEOPLE} artistas favoritos atingido. Remova um para adicionar outro.
        </p>
      )}
      {error && (
        <p role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          Não foi possível atualizar seus favoritos. Tente novamente.
        </p>
      )}
    </div>
  );
}
