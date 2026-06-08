import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import clsx from 'clsx';
import { X } from 'lucide-react';
import type { RankedUser } from '../../types/app';

interface EditProfileModalProps {
  user: RankedUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSaving: boolean;
  onSave: (data: {
    display_name?: string;
    favorite_movie?: string;
    favorite_genre?: string;
    watch_preference?: 'home' | 'cinema';
  }) => Promise<unknown>;
}

export default function EditProfileModal({
  user,
  open,
  onOpenChange,
  isSaving,
  onSave,
}: EditProfileModalProps) {
  const [displayName, setDisplayName] = useState(user.display_name || '');
  const [favoriteMovie, setFavoriteMovie] = useState(user.favorite_movie || '');
  const [favoriteGenre, setFavoriteGenre] = useState(user.favorite_genre || '');
  const [watchPref, setWatchPref] = useState<'home' | 'cinema' | ''>(
    user.watch_preference || ''
  );
  const [error, setError] = useState<string | null>(null);
  const [internalSaving, setInternalSaving] = useState(false);

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (nextOpen) {
      setDisplayName(user.display_name || '');
      setFavoriteMovie(user.favorite_movie || '');
      setFavoriteGenre(user.favorite_genre || '');
      setWatchPref(user.watch_preference || '');
      setError(null);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setInternalSaving(true);
    try {
      await onSave({
        display_name: displayName.trim() || undefined,
        favorite_movie: favoriteMovie.trim() || undefined,
        favorite_genre: favoriteGenre.trim() || undefined,
        watch_preference: (watchPref as 'home' | 'cinema') || undefined,
      });
      onOpenChange(false);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Falha ao salvar perfil.');
    } finally {
      setInternalSaving(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-[92vw] max-w-lg translate-x-[-50%] translate-y-[-50%] border border-[#222] bg-brand-bg p-6 shadow-lg rounded-xl">
          <Dialog.Title className="text-lg text-brand-gold tracking-widest uppercase">
            Editar Perfil
          </Dialog.Title>
          <Dialog.Description className="text-sm text-brand-text-muted mt-2">
            Atualize suas preferências e informações do perfil.
          </Dialog.Description>

          <form onSubmit={submit} className="mt-4 flex flex-col gap-4">
            <div>
              <label className="block text-xs uppercase tracking-[0.14em] text-brand-text-muted mb-1">
                Nome de Exibição
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Como quer ser chamado?"
                className="w-full bg-[#151515] border border-[#222] rounded-lg px-3 py-2 text-sm text-brand-text placeholder-brand-text-muted/50 focus:border-brand-gold/40 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.14em] text-brand-text-muted mb-1">
                Filme Favorito da Vida
              </label>
              <input
                type="text"
                value={favoriteMovie}
                onChange={(e) => setFavoriteMovie(e.target.value)}
                placeholder="Ex: O Poderoso Chefão"
                className="w-full bg-[#151515] border border-[#222] rounded-lg px-3 py-2 text-sm text-brand-text placeholder-brand-text-muted/50 focus:border-brand-gold/40 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.14em] text-brand-text-muted mb-1">
                Gênero Favorito
              </label>
              <input
                type="text"
                value={favoriteGenre}
                onChange={(e) => setFavoriteGenre(e.target.value)}
                placeholder="Ex: Ficção Científica"
                className="w-full bg-[#151515] border border-[#222] rounded-lg px-3 py-2 text-sm text-brand-text placeholder-brand-text-muted/50 focus:border-brand-gold/40 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.14em] text-brand-text-muted mb-2">
                Prefere assistir onde?
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div
                    className={clsx(
                      'w-4 h-4 rounded-full border flex items-center justify-center transition',
                      watchPref === 'home'
                        ? 'border-brand-gold'
                        : 'border-[#444] group-hover:border-brand-gold/50'
                    )}
                  >
                    {watchPref === 'home' && <div className="w-2 h-2 rounded-full bg-brand-gold" />}
                  </div>
                  <span className="text-sm text-brand-text">Em casa</span>
                  <input
                    type="radio"
                    name="watch_preference"
                    value="home"
                    checked={watchPref === 'home'}
                    onChange={() => setWatchPref('home')}
                    className="sr-only"
                  />
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div
                    className={clsx(
                      'w-4 h-4 rounded-full border flex items-center justify-center transition',
                      watchPref === 'cinema'
                        ? 'border-brand-gold'
                        : 'border-[#444] group-hover:border-brand-gold/50'
                    )}
                  >
                    {watchPref === 'cinema' && <div className="w-2 h-2 rounded-full bg-brand-gold" />}
                  </div>
                  <span className="text-sm text-brand-text">No Cinema</span>
                  <input
                    type="radio"
                    name="watch_preference"
                    value="cinema"
                    checked={watchPref === 'cinema'}
                    onChange={() => setWatchPref('cinema')}
                    className="sr-only"
                  />
                </label>
              </div>
            </div>

            {error && <p className="text-xs text-red-300 mt-1">{error}</p>}

            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSaving || internalSaving}
                className="px-4 py-2 text-xs uppercase tracking-[0.14em] bg-brand-gold text-brand-bg rounded disabled:opacity-50 transition hover:bg-brand-gold/90"
              >
                {isSaving || internalSaving ? 'Salvando...' : 'Salvar perfil'}
              </button>
            </div>
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
