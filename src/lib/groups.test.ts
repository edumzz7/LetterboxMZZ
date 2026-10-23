import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getGroup, getGroupRanking, listGroupPendingRequests } from './groups';

const http = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('./apiClient', () => ({ default: http }));

const legacy = {
  id: 'u-giu',
  username: 'eto1les',
  displayName: null,
  avatarPath: JSON.stringify({ avatarId: 'avatar_image:data:image/webp;base64,UklGR', displayName: 'Giu' }),
};
const modern = { id: 'u-gus', username: 'gus-messagi', displayName: 'Gus', avatarPath: 'avatar_clapper' };

describe('groups api normalization', () => {
  beforeEach(() => vi.resetAllMocks());

  it('unpacks legacy JSON avatars in group members and admin', async () => {
    http.get.mockResolvedValue({
      data: {
        id: 'g-1',
        admin: legacy,
        members: [
          { ...legacy, role: 'admin', joinedAt: '' },
          { ...modern, role: 'member', joinedAt: '' },
        ],
        viewer: { status: 'member' },
      },
    });

    const group = await getGroup('g-1');

    expect(group.admin).toMatchObject({ avatarPath: 'avatar_image:data:image/webp;base64,UklGR', displayName: 'Giu' });
    expect(group.members?.map((member) => member.avatarPath)).toEqual(['avatar_image:data:image/webp;base64,UklGR', 'avatar_clapper']);
  });

  it('normalizes ranking rows and pending requests', async () => {
    http.get.mockResolvedValueOnce({
      data: { groupId: 'g-1', periodStart: '', periodEnd: '', items: [{ ...legacy, rank: 1, totalPoints: 568, role: 'member' }] },
    });
    const ranking = await getGroupRanking('g-1');
    expect(ranking.items[0]).toMatchObject({ avatarPath: 'avatar_image:data:image/webp;base64,UklGR', displayName: 'Giu', totalPoints: 568 });

    http.get.mockResolvedValueOnce({
      data: { invites: [{ id: 'i-1', user: legacy, createdAt: '' }], requests: [] },
    });
    const pending = await listGroupPendingRequests('g-1');
    expect(pending.invites[0].user.avatarPath).toBe('avatar_image:data:image/webp;base64,UklGR');
  });

  it('gives users without avatar the same fallback avatar as the user lists', async () => {
    http.get.mockResolvedValue({
      data: { id: 'g-1', admin: { ...modern, avatarPath: null }, viewer: { status: 'none' } },
    });

    const group = await getGroup('g-1');

    expect(group.admin?.avatarPath).toEqual(expect.any(String));
    expect(group.admin?.avatarPath).not.toBe('');
  });
});
