import { useState } from 'react';
import { Check, Loader2, Send, X } from 'lucide-react';
import AvatarDisplay from '../layout/AvatarDisplay';
import { useGroupActions, useGroupPendingRequests } from '../../hooks/useGroups';
import type { GroupPendingItem } from '../../types/app';

interface GroupAdminPanelProps {
  groupId: string;
  isFull: boolean;
}

function PendingRow({ item, children }: { item: GroupPendingItem; children: React.ReactNode }) {
  return (
    <li className="flex min-w-0 items-center gap-3 rounded-xl border border-[#222] bg-[#090d18] px-3 py-2">
      <AvatarDisplay avatarId={item.user.avatarPath} className="h-8 w-8" emojiClassName="text-base" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm text-brand-text">{item.user.displayName || item.user.username}</span>
        <span className="block truncate text-xs text-brand-text-muted">@{item.user.username}</span>
      </span>
      <span className="flex shrink-0 items-center gap-1">{children}</span>
    </li>
  );
}

export default function GroupAdminPanel({ groupId, isFull }: GroupAdminPanelProps) {
  const [username, setUsername] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const pendingQuery = useGroupPendingRequests(groupId, true);
  const { invite, resolve } = useGroupActions(groupId);

  const handleInvite = async (event: React.FormEvent) => {
    event.preventDefault();
    const target = username.trim().replace(/^@/, '');
    if (!target) return;
    setFeedback(null);
    try {
      await invite.mutateAsync(target);
      setFeedback({ type: 'success', text: `Convite enviado para @${target}.` });
      setUsername('');
    } catch (error) {
      setFeedback({ type: 'error', text: error instanceof Error ? error.message : 'Não foi possível convidar.' });
    }
  };

  const handleResolve = async (requestId: string, action: 'accept' | 'decline' | 'cancel') => {
    setFeedback(null);
    try {
      await resolve.mutateAsync({ requestId, action });
    } catch (error) {
      setFeedback({ type: 'error', text: error instanceof Error ? error.message : 'Não foi possível concluir.' });
    }
  };

  const busyId = resolve.isPending ? resolve.variables?.requestId : null;
  const requests = pendingQuery.data?.requests ?? [];
  const invites = pendingQuery.data?.invites ?? [];

  return (
    <section aria-labelledby="group-admin-title" className="rounded-2xl border border-[#151b28] bg-brand-card p-4 sm:p-5">
      <h2 id="group-admin-title" className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">
        Administração
      </h2>

      <form onSubmit={handleInvite} className="mt-4 flex flex-col gap-2">
        <label htmlFor="group-invite-username" className="text-xs uppercase tracking-[0.25em] text-brand-text-muted">
          Convidar
        </label>
        <div className="flex gap-2">
          <input
            id="group-invite-username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="@usuario"
            autoComplete="off"
            disabled={isFull}
            className="min-w-0 flex-1 rounded-2xl border border-[#222] bg-[#090d18] px-4 py-2.5 text-sm text-brand-text placeholder:text-brand-text-muted/60 focus:border-brand-gold focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isFull || invite.isPending || !username.trim()}
            aria-label="Enviar convite"
            title="Enviar convite"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-gold text-brand-bg transition hover:opacity-90 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
          >
            {invite.isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
        {isFull && <p className="text-xs text-brand-text-muted">O grupo está lotado.</p>}
      </form>

      {feedback && (
        <p
          role={feedback.type === 'error' ? 'alert' : 'status'}
          className={
            feedback.type === 'error'
              ? 'mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300'
              : 'mt-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300'
          }
        >
          {feedback.text}
        </p>
      )}

      <div className="mt-5 border-t border-white/10 pt-4">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-text-muted">
          Solicitações ({requests.length})
        </h3>
        {pendingQuery.isLoading ? (
          <Loader2 size={16} className="mt-3 animate-spin text-brand-gold" />
        ) : requests.length === 0 ? (
          <p className="mt-2 text-xs text-brand-text-muted">Nenhuma solicitação pendente.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {requests.map((item) => (
              <PendingRow key={item.id} item={item}>
                <button
                  type="button"
                  onClick={() => handleResolve(item.id, 'accept')}
                  disabled={busyId === item.id}
                  aria-label={`Aceitar @${item.user.username}`}
                  title="Aceitar"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-500/30 text-emerald-300 transition hover:bg-emerald-500/10 disabled:opacity-40"
                >
                  <Check size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => handleResolve(item.id, 'decline')}
                  disabled={busyId === item.id}
                  aria-label={`Recusar @${item.user.username}`}
                  title="Recusar"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-500/30 text-red-300 transition hover:bg-red-500/10 disabled:opacity-40"
                >
                  <X size={15} />
                </button>
              </PendingRow>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-5 border-t border-white/10 pt-4">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-text-muted">
          Convites enviados ({invites.length})
        </h3>
        {invites.length === 0 ? (
          <p className="mt-2 text-xs text-brand-text-muted">Nenhum convite aguardando resposta.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {invites.map((item) => (
              <PendingRow key={item.id} item={item}>
                <button
                  type="button"
                  onClick={() => handleResolve(item.id, 'cancel')}
                  disabled={busyId === item.id}
                  className="rounded-lg px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-text-muted transition hover:bg-red-500/10 hover:text-red-300 disabled:opacity-40"
                >
                  Cancelar
                </button>
              </PendingRow>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
