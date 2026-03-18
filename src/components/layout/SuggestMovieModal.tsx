import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Plus, X } from 'lucide-react';
import type { AppUser, PersonalMovie } from '../../types/app';
import { useSuggestMovie } from '../../hooks/useSuggestMovie';

interface SuggestMovieModalProps {
  currentUserId: string;
  users: AppUser[];
}

export default function SuggestMovieModal({ currentUserId, users }: SuggestMovieModalProps) {
  const [open, setOpen] = useState(false);
  const [friendId, setFriendId] = useState('');
  const [titulo, setTitulo] = useState('');
  const [ano, setAno] = useState('');
  const [capaUrl, setCapaUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const suggestMutation = useSuggestMovie();

  const options = users.filter((user) => user.id !== currentUserId);

  const reset = () => {
    setFriendId('');
    setTitulo('');
    setAno('');
    setCapaUrl('');
    setError(null);
    setOpen(false);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!friendId || !titulo.trim()) return;
    setError(null);

    const payload: Omit<PersonalMovie, 'id' | 'user_id' | 'created_at'> = {
      titulo: titulo.trim(),
      ano_lancamento: ano ? parseInt(ano, 10) || null : null,
      capa_url: capaUrl.trim() || null,
      plataforma_slug: 'stremio',
      status: 'watchlist',
      source: 'manual',
      source_movie_id: null,
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

            <input
              value={titulo}
              onChange={(event) => setTitulo(event.target.value)}
              placeholder="Titulo do filme"
              className="w-full bg-[#0a0f1e] border border-[#222] text-brand-text p-2.5 rounded"
              required
            />

            <div className="grid grid-cols-2 gap-2">
              <input
                value={ano}
                onChange={(event) => setAno(event.target.value)}
                type="number"
                placeholder="Ano"
                className="w-full bg-[#0a0f1e] border border-[#222] text-brand-text p-2.5 rounded"
              />
              <input
                value={capaUrl}
                onChange={(event) => setCapaUrl(event.target.value)}
                placeholder="URL da capa (opcional)"
                className="w-full bg-[#0a0f1e] border border-[#222] text-brand-text p-2.5 rounded"
              />
            </div>

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
