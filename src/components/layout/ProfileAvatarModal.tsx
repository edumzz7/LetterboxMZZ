import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import clsx from 'clsx';
import { UserRound, X } from 'lucide-react';
import { AVATAR_OPTIONS, avatarEmoji } from '../../lib/avatars';

interface ProfileAvatarModalProps {
  currentAvatarId: string;
  isSaving: boolean;
  onSave: (avatarId: string) => Promise<unknown>;
}

export default function ProfileAvatarModal({
  currentAvatarId,
  isSaving,
  onSave,
}: ProfileAvatarModalProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(currentAvatarId);
  const [error, setError] = useState<string | null>(null);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setSelected(currentAvatarId);
      setError(null);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      await onSave(selected);
      setOpen(false);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Falha ao salvar avatar.');
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <button className="inline-flex items-center gap-2 px-3 py-2 border border-brand-gold/40 rounded-lg text-xs uppercase tracking-[0.14em] text-brand-gold hover:bg-brand-gold/10 transition">
          <UserRound size={14} /> Avatar {avatarEmoji(currentAvatarId)}
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-[92vw] max-w-lg translate-x-[-50%] translate-y-[-50%] border border-[#222] bg-brand-bg p-6 shadow-lg rounded-xl">
          <Dialog.Title className="text-lg text-brand-gold tracking-widest uppercase">Escolher Avatar</Dialog.Title>
          <Dialog.Description className="text-sm text-brand-text-muted mt-2">
            Selecione seu icone para aparecer no ranking.
          </Dialog.Description>

          <form onSubmit={submit} className="mt-4">
            <div className="grid grid-cols-5 gap-2">
              {AVATAR_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelected(option.id)}
                  className={clsx(
                    'h-12 rounded-lg border text-2xl flex items-center justify-center transition',
                    selected === option.id
                      ? 'border-brand-gold bg-brand-gold/10'
                      : 'border-[#222] hover:border-brand-gold/40',
                  )}
                >
                  {option.emoji}
                </button>
              ))}
            </div>

            {error ? <p className="text-xs text-red-300 mt-3">{error}</p> : null}

            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 text-xs uppercase tracking-[0.14em] bg-brand-gold text-brand-bg rounded disabled:opacity-50"
              >
                {isSaving ? 'Salvando...' : 'Salvar avatar'}
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
