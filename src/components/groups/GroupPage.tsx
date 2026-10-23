import { useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Crown, Loader2, LogOut, Pencil, UserMinus, Users } from 'lucide-react';
import AvatarDisplay from '../layout/AvatarDisplay';
import { useGroup, useGroupActions, useGroupRanking } from '../../hooks/useGroups';
import type { GroupDetails } from '../../types/app';
import ConfirmDialog from './ConfirmDialog';
import GroupAdminPanel from './GroupAdminPanel';
import GroupFormDialog from './GroupFormDialog';
import GroupRankingList from './GroupRankingList';

interface GroupPageProps {
  groupId: string;
  currentUserId: string;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatMonth(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date(value));
}

function ActionError({ error }: { error: Error | null }) {
  if (!error) return null;
  return (
    <p role="alert" className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
      {error.message}
    </p>
  );
}

/** What a non-member can do on the group page: answer an invite, request to join or wait. */
function OutsiderActions({ group }: { group: GroupDetails }) {
  const { requestToJoin, resolve } = useGroupActions(group.id);
  const { viewer } = group;
  const pendingButton = 'inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] transition active:scale-95 disabled:pointer-events-none disabled:opacity-50';
  const isResolving = resolve.isPending;

  if (viewer.status === 'invited' && viewer.requestId) {
    const requestId = viewer.requestId;
    return (
      <div className="rounded-2xl border border-brand-gold/30 bg-brand-gold/5 p-5">
        <p className="text-sm text-brand-text">
          {group.admin ? `@${group.admin.username} convidou você` : 'Você foi convidado'} para participar deste grupo.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => resolve.mutate({ requestId, action: 'accept' })}
            disabled={isResolving}
            className={`${pendingButton} bg-brand-gold text-brand-bg hover:opacity-90`}
          >
            {isResolving && resolve.variables?.action === 'accept' && <Loader2 size={14} className="animate-spin" />}
            Aceitar participar
          </button>
          <button
            type="button"
            onClick={() => resolve.mutate({ requestId, action: 'decline' })}
            disabled={isResolving}
            className={`${pendingButton} text-brand-text-muted hover:bg-red-500/10 hover:text-red-300`}
          >
            Recusar convite
          </button>
        </div>
        <ActionError error={resolve.error} />
      </div>
    );
  }

  if (viewer.status === 'requested' && viewer.requestId) {
    const requestId = viewer.requestId;
    return (
      <div className="rounded-2xl border border-[#151b28] bg-brand-card p-5">
        <p className="text-sm text-brand-text">Solicitação enviada. Aguarde a resposta do administrador.</p>
        <button
          type="button"
          onClick={() => resolve.mutate({ requestId, action: 'cancel' })}
          disabled={isResolving}
          className={`${pendingButton} mt-4 text-brand-text-muted hover:bg-white/5 hover:text-brand-text`}
        >
          {isResolving && <Loader2 size={14} className="animate-spin" />}
          Cancelar solicitação
        </button>
        <ActionError error={resolve.error} />
      </div>
    );
  }

  const blockedReason = viewer.cooldownUntil
    ? `Sua última solicitação foi recusada. Você poderá solicitar novamente a partir de ${formatDate(viewer.cooldownUntil)}.`
    : viewer.reachedGroupLimit
      ? 'Você já participa de 3 grupos. Saia de um para solicitar entrada.'
      : group.isFull
        ? 'Este grupo está lotado.'
        : null;

  return (
    <div className="rounded-2xl border border-[#151b28] bg-brand-card p-5">
      <p className="text-sm leading-relaxed text-brand-text-muted">
        O ranking e os membros são visíveis apenas para quem participa do grupo.
      </p>
      {blockedReason ? (
        <p className="mt-3 text-sm text-brand-text">{blockedReason}</p>
      ) : (
        <button
          type="button"
          onClick={() => requestToJoin.mutate()}
          disabled={requestToJoin.isPending || !viewer.canRequest}
          className={`${pendingButton} mt-4 bg-brand-gold text-brand-bg hover:opacity-90`}
        >
          {requestToJoin.isPending && <Loader2 size={14} className="animate-spin" />}
          Solicitar participação
        </button>
      )}
      <ActionError error={requestToJoin.error} />
    </div>
  );
}

export default function GroupPage({ groupId, currentUserId }: GroupPageProps) {
  const [, setLocation] = useLocation();
  const groupQuery = useGroup(groupId);
  const group = groupQuery.data;
  const isMember = group?.viewer.status === 'admin' || group?.viewer.status === 'member';
  const isAdmin = group?.viewer.status === 'admin';
  const rankingQuery = useGroupRanking(groupId, Boolean(isMember));
  const { update, leave, removeMember } = useGroupActions(groupId);
  const [editOpen, setEditOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<{ id: string; username: string } | null>(null);

  const goToGroups = () => setLocation('/grupos');
  const goToUser = (username: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setLocation(`/${username}`);
  };

  if (groupQuery.isLoading) {
    return (
      <div className="flex justify-center py-20 text-brand-gold">
        <Loader2 size={24} className="animate-spin" />
      </div>
    );
  }

  if (groupQuery.isError || !group) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-brand-text-muted">Grupo não encontrado.</p>
        <button
          type="button"
          onClick={goToGroups}
          className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-brand-gold hover:underline"
        >
          Ver grupos
        </button>
      </div>
    );
  }

  const otherMembers = (group.members ?? []).length - 1;

  return (
    <div className="animate-in fade-in duration-300">
      <button
        type="button"
        onClick={goToGroups}
        className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-text-muted transition hover:text-brand-gold"
      >
        <ArrowLeft size={14} /> Grupos
      </button>

      <header className="mt-5 flex flex-col gap-5 border-b border-white/10 pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.25em] text-brand-gold-alt">Grupo</p>
          <h1 className="mt-2 break-words text-3xl font-light text-brand-text sm:text-4xl">{group.name}</h1>
          {group.description && (
            <p className="mt-3 max-w-2xl whitespace-pre-line text-sm leading-relaxed text-brand-text-muted">
              {group.description}
            </p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-text-muted">
            <span className="inline-flex items-center gap-1.5">
              <Users size={13} className="text-brand-gold-alt" />
              {group.memberCount}/{group.maxMembers} membros
            </span>
            {group.admin && (
              <span className="inline-flex items-center gap-1.5 normal-case tracking-normal">
                <Crown size={13} className="text-brand-gold" />
                <span className="text-xs">@{group.admin.username}</span>
              </span>
            )}
          </div>
        </div>
        {isMember && (
          <div className="flex shrink-0 gap-2">
            {isAdmin && (
              <button
                type="button"
                onClick={() => setEditOpen(true)}
                aria-label="Editar grupo"
                title="Editar grupo"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#151b28] text-brand-text-muted transition hover:border-brand-gold/40 hover:text-brand-gold"
              >
                <Pencil size={16} />
              </button>
            )}
            <button
              type="button"
              onClick={() => setLeaveOpen(true)}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#151b28] px-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-text-muted transition hover:border-red-500/40 hover:text-red-300"
            >
              <LogOut size={14} /> Sair
            </button>
          </div>
        )}
      </header>

      {!isMember ? (
        <div className="mt-6 max-w-2xl">
          <OutsiderActions group={group} />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <section aria-labelledby="group-ranking-title" className="min-w-0">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-brand-text-muted">Ranking</p>
                <h2 id="group-ranking-title" className="mt-1 text-lg uppercase tracking-[0.15em] text-brand-gold">
                  MCoins
                </h2>
              </div>
              {rankingQuery.data && (
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-text-muted">
                  {formatMonth(rankingQuery.data.periodStart)}
                </span>
              )}
            </div>
            <div className="mt-4">
              {rankingQuery.isLoading ? (
                <div className="flex justify-center py-12 text-brand-gold">
                  <Loader2 size={20} className="animate-spin" />
                </div>
              ) : rankingQuery.isError ? (
                <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                  Não foi possível carregar o ranking. {rankingQuery.error.message}
                </p>
              ) : (
                <GroupRankingList
                  items={rankingQuery.data?.items ?? []}
                  currentUserId={currentUserId}
                  onSelectUser={goToUser}
                />
              )}
            </div>
            <p className="mt-3 text-xs text-brand-text-muted">
              Mesmas regras do ranking geral. A pontuação zera na virada de cada mês.
            </p>
          </section>

          <aside className="flex min-w-0 flex-col gap-6">
            {isAdmin && <GroupAdminPanel groupId={group.id} isFull={group.isFull} />}

            <section aria-labelledby="group-members-title" className="rounded-2xl border border-[#151b28] bg-brand-card p-4 sm:p-5">
              <h2 id="group-members-title" className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">
                Membros ({group.memberCount})
              </h2>
              <ul className="mt-4 flex flex-col gap-2">
                {(group.members ?? []).map((member) => (
                  <li key={member.id} className="flex min-w-0 items-center gap-3">
                    <button
                      type="button"
                      onClick={() => goToUser(member.username)}
                      className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-1 py-1 text-left transition hover:bg-white/5"
                    >
                      <AvatarDisplay avatarId={member.avatarPath} className="h-8 w-8" emojiClassName="text-base" />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5 truncate text-sm text-brand-text">
                          <span className="truncate">{member.displayName || member.username}</span>
                          {member.role === 'admin' && <Crown size={12} className="shrink-0 text-brand-gold" aria-label="Administrador" />}
                        </span>
                        <span className="block truncate text-xs text-brand-text-muted">@{member.username}</span>
                      </span>
                    </button>
                    {isAdmin && member.id !== currentUserId && (
                      <button
                        type="button"
                        onClick={() => setMemberToRemove({ id: member.id, username: member.username })}
                        aria-label={`Remover @${member.username}`}
                        title="Remover do grupo"
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-brand-text-muted transition hover:bg-red-500/10 hover:text-red-300"
                      >
                        <UserMinus size={15} />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      )}

      {editOpen && (
        <GroupFormDialog
          open
          onOpenChange={setEditOpen}
          mode="edit"
          initialName={group.name}
          initialDescription={group.description}
          onSubmit={(values) => update.mutateAsync(values)}
        />
      )}

      <ConfirmDialog
        open={leaveOpen}
        onOpenChange={setLeaveOpen}
        title="Sair do grupo"
        description={
          isAdmin
            ? otherMembers > 0
              ? 'Você é o administrador. Ao sair, o membro mais antigo passa a administrar o grupo.'
              : 'Você é o único membro. Ao sair, o grupo será excluído.'
            : 'Você deixará de aparecer no ranking deste grupo. Para voltar, será preciso um novo convite ou solicitação.'
        }
        confirmLabel="Sair"
        onConfirm={async () => {
          await leave.mutateAsync();
          goToGroups();
        }}
      />

      <ConfirmDialog
        open={Boolean(memberToRemove)}
        onOpenChange={(open) => !open && setMemberToRemove(null)}
        title="Remover membro"
        description={`@${memberToRemove?.username ?? ''} será removido do grupo.`}
        confirmLabel="Remover"
        onConfirm={() => removeMember.mutateAsync(memberToRemove!.id)}
      />
    </div>
  );
}
