import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Loader2, Users, X } from 'lucide-react';

const NAME_MIN = 3;
const NAME_MAX = 50;
const DESCRIPTION_MAX = 280;

interface GroupFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  initialName?: string;
  initialDescription?: string | null;
  onSubmit: (values: { name: string; description: string }) => Promise<unknown>;
}

export default function GroupFormDialog({
  open,
  onOpenChange,
  mode,
  initialName = '',
  initialDescription = '',
  onSubmit,
}: GroupFormDialogProps) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription ?? '');
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setName(initialName);
      setDescription(initialDescription ?? '');
    }
    setError(null);
    onOpenChange(nextOpen);
  };

  const trimmedName = name.trim().replace(/\s+/g, ' ');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (trimmedName.length < NAME_MIN) {
      setError(`O nome precisa ter pelo menos ${NAME_MIN} caracteres.`);
      return;
    }
    setIsPending(true);
    setError(null);
    try {
      await onSubmit({ name: trimmedName, description: description.trim() });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar o grupo.');
    } finally {
      setIsPending(false);
    }
  };

  const title = mode === 'create' ? 'Criar grupo' : 'Editar grupo';

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-[92vw] max-w-md translate-x-[-50%] translate-y-[-50%] rounded-2xl border border-[#151b28] bg-[#06080d] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.55)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-brand-gold">
                <Users size={16} /> {title}
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-brand-text-muted">
                {mode === 'create'
                  ? 'Um ranking mensal só entre você e seus amigos.'
                  : 'Atualize o nome e a descrição do grupo.'}
              </Dialog.Description>
            </div>
            <Dialog.Close
              aria-label="Fechar"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-brand-text-muted transition hover:bg-white/5 hover:text-brand-gold"
            >
              <X size={16} />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-brand-text-muted">
                Nome
                <span className="tracking-normal">{trimmedName.length}/{NAME_MAX}</span>
              </span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={NAME_MAX}
                required
                autoFocus
                placeholder="Ex.: Ratos de Cinema"
                className="rounded-2xl border border-[#222] bg-[#090d18] px-4 py-3 text-sm text-brand-text placeholder:text-brand-text-muted/60 focus:border-brand-gold focus:outline-none"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-brand-text-muted">
                Descrição
                <span className="tracking-normal">{description.length}/{DESCRIPTION_MAX}</span>
              </span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                maxLength={DESCRIPTION_MAX}
                rows={3}
                placeholder="Sobre o que é o grupo? (opcional)"
                className="resize-none rounded-2xl border border-[#222] bg-[#090d18] px-4 py-3 text-sm leading-relaxed text-brand-text placeholder:text-brand-text-muted/60 focus:border-brand-gold focus:outline-none"
              />
            </label>

            {error && (
              <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                {error}
              </p>
            )}

            <div className="mt-1 flex justify-end gap-3">
              <Dialog.Close className="px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand-text-muted transition hover:text-brand-text">
                Cancelar
              </Dialog.Close>
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-gold px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand-bg transition hover:opacity-90 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
              >
                {isPending && <Loader2 size={14} className="animate-spin" />}
                {mode === 'create' ? 'Criar' : 'Salvar'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
