import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Loader2, Shuffle, X } from 'lucide-react';
import clsx from 'clsx';
import { useCineMatch } from '../../hooks/useCineMatch';
import type { AppUser, CineMatchMode, CineMatchSuggestion } from '../../types/app';

interface CineMatchModalProps {
  currentUserId: string;
  users: AppUser[];
}

export default function CineMatchModal({ currentUserId, users }: CineMatchModalProps) {
  const [open, setOpen] = useState(false);
  const [friendId, setFriendId] = useState('');
  const [mode, setMode] = useState<CineMatchMode>('geral');
  const [result, setResult] = useState<CineMatchSuggestion | null>(null);
  const cineMatchMutation = useCineMatch();

  const options = users.filter((user) => user.id !== currentUserId);

  const handleFind = async () => {
    if (!friendId) return;
    const suggestion = await cineMatchMutation.mutateAsync({
      currentUserId,
      friendUserId: friendId,
      mode,
    });

    setResult(suggestion);
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="inline-flex items-center gap-2 px-3 py-2 border border-brand-gold/40 rounded-lg text-xs uppercase tracking-[0.14em] text-brand-gold hover:bg-brand-gold/10 transition">
          <Shuffle size={14} /> Cine-Match
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-[92vw] max-w-lg translate-x-[-50%] translate-y-[-50%] border border-[#222] bg-brand-bg p-6 shadow-lg rounded-xl">
          <Dialog.Title className="text-lg text-brand-gold tracking-widest uppercase">Cine-Match</Dialog.Title>
          <Dialog.Description className="text-sm text-brand-text-muted mt-2">
            Escolha um amigo e descubra o que assistir juntos.
          </Dialog.Description>

          <div className="mt-4 flex flex-col gap-4">
            <select
              value={friendId}
              onChange={(event) => setFriendId(event.target.value)}
              className="w-full bg-[#0a0f1e] border border-[#222] text-brand-text p-2.5 rounded focus:outline-none focus:border-brand-gold font-light"
            >
              <option value="">Selecione um amigo</option>
              {options.map((user) => (
                <option key={user.id} value={user.id}>{user.username}</option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setMode('geral')}
                className={clsx(
                  'px-3 py-2 rounded border text-xs uppercase tracking-[0.12em] transition',
                  mode === 'geral' ? 'border-brand-gold text-brand-gold bg-brand-gold/10' : 'border-[#222] text-brand-text-muted',
                )}
              >
                Modo Geral
              </button>
              <button
                onClick={() => setMode('oscar')}
                className={clsx(
                  'px-3 py-2 rounded border text-xs uppercase tracking-[0.12em] transition',
                  mode === 'oscar' ? 'border-brand-gold text-brand-gold bg-brand-gold/10' : 'border-[#222] text-brand-text-muted',
                )}
              >
                Especial Oscar
              </button>
            </div>

            <button
              onClick={() => void handleFind()}
              disabled={!friendId || cineMatchMutation.isPending}
              className="px-4 py-2 text-xs uppercase tracking-[0.14em] bg-brand-gold text-brand-bg rounded disabled:opacity-50"
            >
              {cineMatchMutation.isPending ? 'Buscando...' : 'Sortear sugestao'}
            </button>

            {cineMatchMutation.isPending ? (
              <div className="flex items-center gap-2 text-brand-text-muted text-sm">
                <Loader2 size={14} className="animate-spin" /> Processando cine-match...
              </div>
            ) : null}

            {result ? (
              <div className="border border-brand-gold/30 rounded-lg p-4 bg-brand-gold/5">
                <p className="text-brand-gold text-sm uppercase tracking-[0.14em]">Sugestao</p>
                <p className="text-brand-text text-xl mt-2">{result.titulo}</p>
                <p className="text-brand-text-muted text-sm mt-1">{result.reason}</p>
              </div>
            ) : null}

            {!cineMatchMutation.isPending && friendId && result === null ? (
              <p className="text-sm text-brand-text-muted">Sem sugestao em comum no momento.</p>
            ) : null}
          </div>

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
