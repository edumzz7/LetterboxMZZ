import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import clsx from 'clsx';
import { Loader2, Mail, Plus, Search } from 'lucide-react';
import { useCreateGroup, useGroupSearch, useMyGroups } from '../../hooks/useGroups';
import { groupPath, MAX_GROUPS_PER_USER } from '../../lib/groups';
import GroupCard from './GroupCard';
import GroupFormDialog from './GroupFormDialog';

type GroupsTab = 'mine' | 'others';

function useDebouncedValue(value: string, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function GroupsPage() {
  const [, setLocation] = useLocation();
  const [tab, setTab] = useState<GroupsTab>('mine');
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search);

  const myGroupsQuery = useMyGroups();
  const searchQuery = useGroupSearch(debouncedSearch, page, tab === 'others');
  const createGroup = useCreateGroup();

  const groups = myGroupsQuery.data?.groups ?? [];
  const invites = myGroupsQuery.data?.invites ?? [];
  const limit = myGroupsQuery.data?.limit ?? MAX_GROUPS_PER_USER;
  const reachedLimit = groups.length >= limit;
  const totalPages = searchQuery.data
    ? Math.max(1, Math.ceil(searchQuery.data.total / searchQuery.data.pageSize))
    : 1;

  const openGroup = (groupId: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setLocation(groupPath(groupId));
  };

  return (
    <div className="animate-in fade-in duration-300">
      <header className="flex flex-col gap-5 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-brand-gold-alt">Comunidade</p>
          <h1 className="mt-2 text-4xl font-light uppercase tracking-[0.08em] text-brand-text">Grupos</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-brand-text-muted">
            Aqui você visualiza não só os seus, mas todos os grupos públicos da comunidade. Junte seu
            grupo de amigos e crie seu ranking privado, competindo apenas com quem você conhece ou tem
            interesses em comum. Por enquanto, todos obedecem a regra do ranking geral, mas em breve
            serão personalizáveis.
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            disabled={reachedLimit || myGroupsQuery.isLoading}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-gold px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-brand-bg transition hover:opacity-90 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
          >
            <Plus size={14} /> Criar grupo
          </button>
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-text-muted">
            {reachedLimit
              ? `Você já está em ${limit} grupos (limite)`
              : `${groups.length}/${limit} grupos`}
          </span>
        </div>
      </header>

      <nav aria-label="Seções de grupos" className="mt-2 flex overflow-x-auto border-b border-white/10">
        {(
          [
            { id: 'mine', label: 'Meus grupos' },
            { id: 'others', label: 'Outros grupos' },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            aria-current={tab === item.id ? 'page' : undefined}
            className={clsx(
              'shrink-0 border-b-2 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] transition sm:px-5 sm:py-4 sm:text-xs sm:tracking-[0.14em]',
              tab === item.id
                ? 'border-brand-gold text-brand-gold'
                : 'border-transparent text-brand-text-muted hover:text-brand-text',
            )}
          >
            {item.label}
            {item.id === 'mine' && invites.length > 0 && (
              <span className="ml-2 rounded-full bg-brand-gold px-1.5 py-0.5 text-[9px] text-brand-bg">
                {invites.length}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="mt-6">
        {tab === 'mine' ? (
          myGroupsQuery.isLoading ? (
            <div className="flex justify-center py-20 text-brand-gold">
              <Loader2 size={24} className="animate-spin" />
            </div>
          ) : myGroupsQuery.isError ? (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              Não foi possível carregar seus grupos. {myGroupsQuery.error.message}
            </p>
          ) : (
            <div className="flex flex-col gap-8">
              {invites.length > 0 && (
                <section>
                  <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">
                    Convites pendentes
                  </h2>
                  <ul className="mt-3 flex flex-col gap-2">
                    {invites.map((invite) => (
                      <li key={invite.requestId}>
                        <button
                          type="button"
                          onClick={() => openGroup(invite.groupId)}
                          className="flex w-full items-center gap-3 rounded-2xl border border-brand-gold/30 bg-brand-gold/5 px-4 py-3 text-left transition hover:bg-brand-gold/10"
                        >
                          <Mail size={16} className="shrink-0 text-brand-gold" />
                          <span className="min-w-0 flex-1 truncate text-sm text-brand-text">
                            Convite para <span className="font-semibold">#{invite.groupName}</span>
                          </span>
                          <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-gold">
                            Ver convite
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <section>
                <h2 className="sr-only">Grupos em que você participa</h2>
                {groups.length === 0 ? (
                  <div className="py-16 text-center">
                    <p className="text-sm text-brand-text-muted">Você ainda não participa de nenhum grupo.</p>
                    <button
                      type="button"
                      onClick={() => setTab('others')}
                      className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-brand-gold hover:underline"
                    >
                      Encontrar grupos
                    </button>
                  </div>
                ) : (
                  <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {groups.map((group) => (
                      <li key={group.id} className="min-w-0">
                        <GroupCard group={group} role={group.role} onOpen={() => openGroup(group.id)} />
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          )
        ) : (
          <section className="flex flex-col gap-5">
            <label className="relative block max-w-xl">
              <span className="sr-only">Buscar grupos por nome</span>
              <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-muted" />
              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                maxLength={50}
                placeholder="Buscar grupos por nome..."
                className="w-full rounded-2xl border border-[#222] bg-[#090d18] py-3 pl-11 pr-4 text-sm text-brand-text placeholder:text-brand-text-muted/60 focus:border-brand-gold focus:outline-none"
              />
            </label>

            {searchQuery.isLoading ? (
              <div className="flex justify-center py-20 text-brand-gold">
                <Loader2 size={24} className="animate-spin" />
              </div>
            ) : searchQuery.isError ? (
              <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                Não foi possível buscar grupos. {searchQuery.error.message}
              </p>
            ) : (searchQuery.data?.items.length ?? 0) === 0 ? (
              <p className="py-16 text-center text-sm text-brand-text-muted">
                {debouncedSearch.trim()
                  ? `Nenhum grupo encontrado para "${debouncedSearch.trim()}".`
                  : 'Nenhum outro grupo por aqui ainda.'}
              </p>
            ) : (
              <>
                <ul
                  className={clsx(
                    'grid gap-3 md:grid-cols-2 xl:grid-cols-3 transition-opacity',
                    searchQuery.isFetching && 'opacity-60',
                  )}
                >
                  {searchQuery.data!.items.map((group) => (
                    <li key={group.id} className="min-w-0">
                      <GroupCard group={group} onOpen={() => openGroup(group.id)} />
                    </li>
                  ))}
                </ul>
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 text-xs font-semibold uppercase tracking-[0.14em]">
                    <button
                      type="button"
                      onClick={() => setPage((current) => Math.max(1, current - 1))}
                      disabled={page <= 1}
                      className="rounded-lg px-3 py-2 text-brand-text-muted transition hover:bg-white/5 hover:text-brand-text disabled:pointer-events-none disabled:opacity-40"
                    >
                      Anterior
                    </button>
                    <span className="text-brand-text-muted">
                      {page} / {totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                      disabled={page >= totalPages}
                      className="rounded-lg px-3 py-2 text-brand-text-muted transition hover:bg-white/5 hover:text-brand-text disabled:pointer-events-none disabled:opacity-40"
                    >
                      Próxima
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        )}
      </div>

      {createOpen && (
        <GroupFormDialog
          open
          onOpenChange={setCreateOpen}
          mode="create"
          onSubmit={async (values) => {
            const group = await createGroup.mutateAsync(values);
            openGroup(group.id);
          }}
        />
      )}
    </div>
  );
}
