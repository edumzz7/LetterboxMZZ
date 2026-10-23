import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../test/renderWithProviders';
import type { MyGroup } from '../../types/app';
import GroupsPage from './GroupsPage';

const api = vi.hoisted(() => ({
  MAX_GROUPS_PER_USER: 3,
  MAX_GROUP_MEMBERS: 15,
  groupPath: (id: string) => `/grupo/${id}`,
  listMyGroups: vi.fn(),
  searchGroups: vi.fn(),
  createGroup: vi.fn(),
  getGroup: vi.fn(),
  getGroupRanking: vi.fn(),
  listGroupPendingRequests: vi.fn(),
  requestToJoinGroup: vi.fn(),
  resolveGroupRequest: vi.fn(),
  inviteToGroup: vi.fn(),
  leaveGroup: vi.fn(),
  removeGroupMember: vi.fn(),
  updateGroup: vi.fn(),
  listSpecialNotifications: vi.fn(),
  markSpecialNotificationRead: vi.fn(),
  markAllSpecialNotificationsRead: vi.fn(),
}));
const navigation = vi.hoisted(() => ({ setLocation: vi.fn() }));

vi.mock('../../lib/groups', () => api);
vi.mock('wouter', () => ({ useLocation: () => ['/grupos', navigation.setLocation] }));

const myGroup = (id: string, name: string, role: MyGroup['role'] = 'member'): MyGroup => ({
  id,
  name,
  description: null,
  memberCount: 4,
  maxMembers: 15,
  isFull: false,
  createdAt: '2026-10-01T00:00:00Z',
  role,
  joinedAt: '2026-10-01T00:00:00Z',
});

describe('GroupsPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    api.groupPath = (id: string) => `/grupo/${id}`;
    window.scrollTo = vi.fn();
  });

  it('lista meus grupos e os convites pendentes', async () => {
    api.listMyGroups.mockResolvedValue({
      limit: 3,
      groups: [myGroup('g-1', 'Ratos de Cinema', 'admin')],
      invites: [{ requestId: 'inv-1', groupId: 'g-2', groupName: 'Terror Club', link: '/grupo/g-2', createdAt: '' }],
    });
    const user = userEvent.setup();
    renderWithProviders(<GroupsPage />);

    expect(await screen.findByText('Ratos de Cinema')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('1/3 grupos')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Convite para #Terror Club/ }));
    expect(navigation.setLocation).toHaveBeenCalledWith('/grupo/g-2');
  });

  it('bloqueia a criação ao atingir o limite de 3 grupos', async () => {
    api.listMyGroups.mockResolvedValue({
      limit: 3,
      groups: [myGroup('g-1', 'A'), myGroup('g-2', 'B'), myGroup('g-3', 'C')],
      invites: [],
    });
    renderWithProviders(<GroupsPage />);

    expect(await screen.findByText('Você já está em 3 grupos (limite)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Criar grupo/ })).toBeDisabled();
  });

  it('cria um grupo e abre a página dele', async () => {
    api.listMyGroups.mockResolvedValue({ limit: 3, groups: [], invites: [] });
    api.createGroup.mockResolvedValue(myGroup('g-new', 'Novo grupo', 'admin'));
    const user = userEvent.setup();
    renderWithProviders(<GroupsPage />);

    await user.click(await screen.findByRole('button', { name: /Criar grupo/ }));
    await user.type(screen.getByPlaceholderText('Ex.: Ratos de Cinema'), '  Novo   grupo ');
    await user.click(screen.getByRole('button', { name: 'Criar' }));

    expect(api.createGroup).toHaveBeenCalledWith({ name: 'Novo grupo', description: '' });
    expect(navigation.setLocation).toHaveBeenCalledWith('/grupo/g-new');
  });

  it('busca outros grupos pelo nome e marca os lotados', async () => {
    api.listMyGroups.mockResolvedValue({ limit: 3, groups: [], invites: [] });
    api.searchGroups.mockImplementation(async (search: string) => ({
      items: search
        ? [{ ...myGroup('g-9', 'Terror Club'), memberCount: 15, isFull: true }]
        : [myGroup('g-8', 'Drama'), myGroup('g-9', 'Terror Club')],
      total: search ? 1 : 2,
      page: 1,
      pageSize: 20,
    }));
    const user = userEvent.setup();
    renderWithProviders(<GroupsPage />);

    await user.click(await screen.findByRole('button', { name: 'Outros grupos' }));
    expect(await screen.findByText('Drama')).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('Buscar grupos por nome...'), 'terror');

    expect(await screen.findByText('Lotado')).toBeInTheDocument();
    expect(screen.queryByText('Drama')).not.toBeInTheDocument();
    expect(api.searchGroups).toHaveBeenLastCalledWith('terror', 1);
  });
});
