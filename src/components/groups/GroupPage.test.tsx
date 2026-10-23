import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../test/renderWithProviders';
import type { GroupDetails, GroupRanking } from '../../types/app';
import GroupPage from './GroupPage';

const api = vi.hoisted(() => ({
  MAX_GROUPS_PER_USER: 3,
  MAX_GROUP_MEMBERS: 15,
  groupPath: (id: string) => `/grupo/${id}`,
  getGroup: vi.fn(),
  getGroupRanking: vi.fn(),
  listGroupPendingRequests: vi.fn(),
  requestToJoinGroup: vi.fn(),
  resolveGroupRequest: vi.fn(),
  inviteToGroup: vi.fn(),
  leaveGroup: vi.fn(),
  removeGroupMember: vi.fn(),
  updateGroup: vi.fn(),
  listMyGroups: vi.fn(),
  searchGroups: vi.fn(),
  createGroup: vi.fn(),
  listSpecialNotifications: vi.fn(),
  markSpecialNotificationRead: vi.fn(),
  markAllSpecialNotificationsRead: vi.fn(),
}));
const navigation = vi.hoisted(() => ({ setLocation: vi.fn() }));

vi.mock('../../lib/groups', () => api);
vi.mock('wouter', () => ({ useLocation: () => ['/grupo/g-1', navigation.setLocation] }));

const admin = { id: 'u-admin', username: 'alice', displayName: 'Alice', avatarPath: null };

function makeGroup(viewer: GroupDetails['viewer'], extra: Partial<GroupDetails> = {}): GroupDetails {
  return {
    id: 'g-1',
    name: 'Ratos de Cinema',
    description: 'Só terror',
    memberCount: 2,
    maxMembers: 15,
    isFull: false,
    createdAt: '2026-10-01T00:00:00Z',
    admin,
    viewer,
    ...extra,
  };
}

const ranking: GroupRanking = {
  groupId: 'g-1',
  periodStart: '2026-10-01T03:00:00Z',
  periodEnd: '2026-10-31T23:59:59Z',
  items: [
    { ...admin, rank: 1, totalPoints: 50, role: 'admin' },
    { id: 'u-bob', username: 'bob', displayName: null, avatarPath: null, rank: 2, totalPoints: 10, role: 'member' },
  ],
};

describe('GroupPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    api.groupPath = (id: string) => `/grupo/${id}`;
  });

  it('mostra "Grupo não encontrado" quando a API falha', async () => {
    api.getGroup.mockRejectedValue(new Error('Grupo não encontrado'));
    renderWithProviders(<GroupPage groupId="g-x" currentUserId="u-bob" />);

    expect(await screen.findByText('Grupo não encontrado.')).toBeInTheDocument();
  });

  it('para quem não participa: esconde o ranking e permite solicitar participação', async () => {
    api.getGroup.mockResolvedValue(
      makeGroup({ status: 'none', requestId: null, cooldownUntil: null, reachedGroupLimit: false, canRequest: true }),
    );
    api.requestToJoinGroup.mockResolvedValue({ id: 'r-1' });
    const user = userEvent.setup();
    renderWithProviders(<GroupPage groupId="g-1" currentUserId="u-carol" />);

    expect(await screen.findByText('Ratos de Cinema')).toBeInTheDocument();
    expect(screen.queryByText('Membros (2)')).not.toBeInTheDocument();
    expect(api.getGroupRanking).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Solicitar participação' }));
    expect(api.requestToJoinGroup).toHaveBeenCalledWith('g-1');
  });

  it('mostra o prazo de espera depois de uma recusa', async () => {
    api.getGroup.mockResolvedValue(
      makeGroup({
        status: 'none',
        requestId: null,
        cooldownUntil: '2026-10-24T15:00:00Z',
        reachedGroupLimit: false,
        canRequest: false,
      }),
    );
    renderWithProviders(<GroupPage groupId="g-1" currentUserId="u-carol" />);

    expect(await screen.findByText(/Sua última solicitação foi recusada/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Solicitar participação' })).not.toBeInTheDocument();
  });

  it('convidado pode aceitar ou recusar o convite', async () => {
    api.getGroup.mockResolvedValue(makeGroup({ status: 'invited', requestId: 'inv-1', canRequest: false }));
    api.resolveGroupRequest.mockResolvedValue({ id: 'inv-1', status: 'accepted' });
    const user = userEvent.setup();
    renderWithProviders(<GroupPage groupId="g-1" currentUserId="u-carol" />);

    expect(await screen.findByText(/@alice convidou você/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Recusar convite' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Aceitar participar' }));
    expect(api.resolveGroupRequest).toHaveBeenCalledWith('g-1', 'inv-1', 'accept');
  });

  it('quem solicitou pode cancelar a solicitação', async () => {
    api.getGroup.mockResolvedValue(makeGroup({ status: 'requested', requestId: 'req-1', canRequest: false }));
    const user = userEvent.setup();
    renderWithProviders(<GroupPage groupId="g-1" currentUserId="u-carol" />);

    await user.click(await screen.findByRole('button', { name: 'Cancelar solicitação' }));
    expect(api.resolveGroupRequest).toHaveBeenCalledWith('g-1', 'req-1', 'cancel');
  });

  it('membro vê o ranking do grupo, mas não a administração', async () => {
    api.getGroup.mockResolvedValue(
      makeGroup(
        { status: 'member', joinedAt: '2026-10-02T00:00:00Z' },
        {
          members: [
            { ...admin, role: 'admin', joinedAt: '2026-10-01T00:00:00Z' },
            { id: 'u-bob', username: 'bob', displayName: null, avatarPath: null, role: 'member', joinedAt: '2026-10-02T00:00:00Z' },
          ],
        },
      ),
    );
    api.getGroupRanking.mockResolvedValue(ranking);
    renderWithProviders(<GroupPage groupId="g-1" currentUserId="u-bob" />);

    expect(await screen.findByText('50 MC')).toBeInTheDocument();
    expect(screen.getByText('bob (Você)')).toBeInTheDocument();
    expect(screen.getByText('Membros (2)')).toBeInTheDocument();
    expect(screen.queryByText('Administração')).not.toBeInTheDocument();
  });

  it('admin convida pelo @ e responde solicitações', async () => {
    api.getGroup.mockResolvedValue(
      makeGroup(
        { status: 'admin', joinedAt: '2026-10-01T00:00:00Z' },
        { members: [{ ...admin, role: 'admin', joinedAt: '2026-10-01T00:00:00Z' }], memberCount: 1 },
      ),
    );
    api.getGroupRanking.mockResolvedValue({ ...ranking, items: [ranking.items[0]] });
    api.listGroupPendingRequests.mockResolvedValue({
      invites: [],
      requests: [
        {
          id: 'req-9',
          user: { id: 'u-dave', username: 'dave', displayName: null, avatarPath: null },
          createdAt: '2026-10-20T00:00:00Z',
        },
      ],
    });
    api.inviteToGroup.mockResolvedValue({ id: 'inv-2' });
    api.resolveGroupRequest.mockResolvedValue({ id: 'req-9', status: 'accepted' });
    const user = userEvent.setup();
    renderWithProviders(<GroupPage groupId="g-1" currentUserId="u-admin" />);

    await user.type(await screen.findByLabelText('Convidar'), '@carol');
    await user.click(screen.getByRole('button', { name: 'Enviar convite' }));
    expect(api.inviteToGroup).toHaveBeenCalledWith('g-1', 'carol');
    expect(await screen.findByText('Convite enviado para @carol.')).toBeInTheDocument();

    await user.click(await screen.findByRole('button', { name: 'Aceitar @dave' }));
    await waitFor(() => expect(api.resolveGroupRequest).toHaveBeenCalledWith('g-1', 'req-9', 'accept'));
  });

  it('mostra o erro da API ao convidar', async () => {
    api.getGroup.mockResolvedValue(
      makeGroup({ status: 'admin' }, { members: [{ ...admin, role: 'admin', joinedAt: '2026-10-01T00:00:00Z' }] }),
    );
    api.getGroupRanking.mockResolvedValue(ranking);
    api.listGroupPendingRequests.mockResolvedValue({ invites: [], requests: [] });
    api.inviteToGroup.mockRejectedValue(new Error('@carol já participa de 3 grupos'));
    const user = userEvent.setup();
    renderWithProviders(<GroupPage groupId="g-1" currentUserId="u-admin" />);

    await user.type(await screen.findByLabelText('Convidar'), 'carol');
    await user.click(screen.getByRole('button', { name: 'Enviar convite' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('@carol já participa de 3 grupos');
  });
});
