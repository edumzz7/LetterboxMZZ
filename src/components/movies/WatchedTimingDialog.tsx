import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Clock3, Loader2, X } from 'lucide-react';

interface WatchedTimingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mediaTitle: string;
  mediaType?: 'movie' | 'series';
  isPending: boolean;
  onConfirm: (isRetroactive: boolean) => Promise<void>;
}

export default function WatchedTimingDialog({
  open,
  onOpenChange,
  mediaTitle,
  mediaType = 'movie',
  isPending,
  onConfirm,
}: WatchedTimingDialogProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleConfirm = async (isRetroactive: boolean) => {
    setSubmitError(null);

    try {
      await onConfirm(isRetroactive);
      onOpenChange(false);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Falha ao marcar mídia como vista.');
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-[92vw] max-w-sm translate-x-[-50%] translate-y-[-50%] rounded-xl border border-[#222] bg-brand-bg p-6 shadow-lg">
          <div className="flex flex-col gap-2 text-center">
            <Dialog.Title className="flex items-center justify-center gap-2 text-lg font-light tracking-wider text-brand-gold">
              <Clock3 size={18} /> {mediaType === 'series' ? 'SÉRIE VISTA' : 'FILME VISTO'}
            </Dialog.Title>
            <Dialog.Description className="text-sm font-light text-brand-text-muted">
              Quando você assistiu a <span className="text-brand-text">{mediaTitle}</span>?
            </Dialog.Description>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              disabled={isPending}
              onClick={() => void handleConfirm(false)}
              className="rounded-xl border border-brand-gold bg-brand-gold px-4 py-3 text-xs font-semibold uppercase tracking-widest text-brand-bg transition hover:bg-opacity-90 disabled:pointer-events-none disabled:opacity-50"
            >
              {isPending ? <Loader2 size={15} className="mx-auto animate-spin" /> : 'Visto recentemente (Ganha pontos)'}
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => void handleConfirm(true)}
              className="rounded-xl border border-[#333] bg-black/30 px-4 py-3 text-xs font-semibold uppercase tracking-widest text-brand-text transition hover:border-brand-gold/50 hover:text-brand-gold disabled:pointer-events-none disabled:opacity-50"
            >
              Visto há mais tempo (Sem pontos)
            </button>
          </div>

          {submitError ? (
            <div className="mt-4 rounded border border-red-500/40 bg-red-500/10 p-2 text-xs text-red-300">
              {submitError}
            </div>
          ) : null}

          <Dialog.Close asChild>
            <button
              type="button"
              className="absolute right-4 top-4 rounded-sm text-brand-text-muted opacity-70 transition-opacity hover:text-brand-gold hover:opacity-100"
            >
              <X size={16} />
              <span className="sr-only">Fechar</span>
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
