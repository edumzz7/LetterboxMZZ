import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SpecialNotification } from '../../types/app';
import SpecialNotificationsList from './SpecialNotificationsList';

const navigation = vi.hoisted(() => ({ setLocation: vi.fn() }));
vi.mock('wouter', () => ({ useLocation: () => ['/', navigation.setLocation] }));

const notification = (id: string, readAt: string | null): SpecialNotification => ({
  id,
  type: 'group_invite',
  message: `@alice convidou você para o grupo #Ratos ${id}`,
  link: '/grupo/g-1',
  referenceId: 'inv-1',
  actorId: 'u-alice',
  metadata: { actorUsername: 'alice', groupName: 'Ratos' },
  readAt,
  createdAt: '2026-10-20T10:00:00Z',
});

describe('SpecialNotificationsList', () => {
  beforeEach(() => vi.resetAllMocks());

  it('não renderiza nada sem notificações', () => {
    const { container } = render(
      <SpecialNotificationsList notifications={[]} unreadCount={0} onMarkRead={vi.fn()} onMarkAllRead={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('ao clicar, marca como lida e navega para o link do grupo', async () => {
    const onMarkRead = vi.fn();
    const onNavigate = vi.fn();
    const user = userEvent.setup();
    render(
      <SpecialNotificationsList
        notifications={[notification('n-1', null)]}
        unreadCount={1}
        onMarkRead={onMarkRead}
        onMarkAllRead={vi.fn()}
        onNavigate={onNavigate}
      />,
    );

    await user.click(screen.getByRole('button', { name: /convidou você/ }));

    expect(onMarkRead).toHaveBeenCalledWith('n-1');
    expect(navigation.setLocation).toHaveBeenCalledWith('/grupo/g-1');
    expect(onNavigate).toHaveBeenCalled();
  });

  it('não remarca notificação já lida e oferece "marcar todas" só com não lidas', async () => {
    const onMarkRead = vi.fn();
    const onMarkAllRead = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(
      <SpecialNotificationsList
        notifications={[notification('n-1', '2026-10-20T11:00:00Z')]}
        unreadCount={0}
        onMarkRead={onMarkRead}
        onMarkAllRead={onMarkAllRead}
      />,
    );

    expect(screen.queryByRole('button', { name: 'Marcar todas como lidas' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /convidou você/ }));
    expect(onMarkRead).not.toHaveBeenCalled();

    rerender(
      <SpecialNotificationsList
        notifications={[notification('n-2', null)]}
        unreadCount={1}
        onMarkRead={onMarkRead}
        onMarkAllRead={onMarkAllRead}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Marcar todas como lidas' }));
    expect(onMarkAllRead).toHaveBeenCalled();
  });
});
