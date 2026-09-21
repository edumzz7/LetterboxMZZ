import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import ImportDataPage from './ImportTvTimePage';

interface Props { currentUserId: string; open?: boolean; onOpenChange?: (open: boolean) => void }
export default function ImportTvTimeModal({ currentUserId, open: controlledOpen, onOpenChange }: Props) {
  const [localOpen, setLocalOpen] = useState(false);
  const open = controlledOpen ?? localOpen;
  const changeOpen = (value: boolean) => {
    if (controlledOpen === undefined) setLocalOpen(value);
    onOpenChange?.(value);
  };
  return <Dialog.Root open={open} onOpenChange={changeOpen}>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm" />
      <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[92vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-[#222] bg-brand-bg p-6 shadow-lg">
        <Dialog.Title className="mb-2 text-lg uppercase tracking-widest text-brand-gold">Importar dados</Dialog.Title>
        <Dialog.Description className="mb-6 text-sm text-brand-text-muted">Traga seus dados do Letterboxd ou TV Time para o CineRats.</Dialog.Description>
        <ImportDataPage currentUserId={currentUserId} onBack={() => changeOpen(false)} embedded />
        <Dialog.Close asChild><button aria-label="Fechar importação" className="absolute right-4 top-4 text-brand-text-muted"><X size={18} /></button></Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}
