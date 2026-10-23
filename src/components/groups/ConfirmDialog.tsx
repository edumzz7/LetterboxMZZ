import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Loader2 } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => Promise<unknown>;
}

/** Destructive confirmation (leave group, remove member). */
export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
}: ConfirmDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleConfirm = async () => {
    setIsPending(true);
    setError(null);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível concluir a ação.');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        setError(null);
        onOpenChange(nextOpen);
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-[92vw] max-w-sm translate-x-[-50%] translate-y-[-50%] rounded-2xl border border-[#151b28] bg-[#06080d] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.55)]">
          <Dialog.Title className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-text">
            {title}
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm leading-relaxed text-brand-text-muted">
            {description}
          </Dialog.Description>
          {error && (
            <p role="alert" className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {error}
            </p>
          )}
          <div className="mt-6 flex justify-end gap-3">
            <Dialog.Close className="px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand-text-muted transition hover:text-brand-text">
              Cancelar
            </Dialog.Close>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-red-300 transition hover:bg-red-500/20 disabled:pointer-events-none disabled:opacity-50"
            >
              {isPending && <Loader2 size={14} className="animate-spin" />}
              {confirmLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
