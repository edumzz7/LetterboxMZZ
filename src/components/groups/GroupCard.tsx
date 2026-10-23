import { ChevronRight, Crown, Users } from 'lucide-react';
import clsx from 'clsx';
import type { GroupSummary, GroupMemberRole } from '../../types/app';

interface GroupCardProps {
  group: GroupSummary;
  role?: GroupMemberRole;
  onOpen: () => void;
}

export default function GroupCard({ group, role, onOpen }: GroupCardProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex w-full min-w-0 items-center gap-4 rounded-2xl border border-[#151b28] bg-brand-card p-4 text-left transition hover:border-brand-gold/40 focus-visible:border-brand-gold focus-visible:outline-none sm:p-5"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-brand-gold/30 bg-brand-gold/10 text-brand-gold">
        <Users size={18} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate text-sm font-semibold text-brand-text">{group.name}</span>
          {role === 'admin' && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-brand-gold/30 bg-brand-gold/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-brand-gold">
              <Crown size={10} /> Admin
            </span>
          )}
          {!role && group.isFull && (
            <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-brand-text-muted">
              Lotado
            </span>
          )}
        </span>
        {group.description && (
          <span className="mt-1 line-clamp-2 block text-xs leading-relaxed text-brand-text-muted">
            {group.description}
          </span>
        )}
        <span
          className={clsx(
            'mt-2 block text-[10px] font-semibold uppercase tracking-[0.14em]',
            group.isFull ? 'text-brand-text-muted' : 'text-brand-gold-alt',
          )}
        >
          {group.memberCount}/{group.maxMembers} membros
        </span>
      </span>
      <ChevronRight size={16} className="shrink-0 text-brand-text-muted transition group-hover:text-brand-gold" />
    </button>
  );
}
