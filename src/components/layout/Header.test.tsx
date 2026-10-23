import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Header from './Header';

const baseProps = {
  activeTab: 'home' as const,
  onTabChange: vi.fn(),
  canAccessOscars: true,
  canAccessHome: true,
  onGoHome: vi.fn(),
  hideTabs: true,
};

describe('Header', () => {
  it('mostra o atalho para a dashboard só no desktop e navega ao clicar', async () => {
    const onGoDashboard = vi.fn();
    render(<Header {...baseProps} onGoDashboard={onGoDashboard} />);

    const button = screen.getByRole('button', { name: 'Ir para a minha dashboard' });
    expect(button).toHaveClass('hidden', 'lg:inline-flex');

    await userEvent.setup().click(button);
    expect(onGoDashboard).toHaveBeenCalledTimes(1);
  });

  it('não renderiza o atalho sem destino (área pública)', () => {
    render(<Header {...baseProps} />);
    expect(screen.queryByRole('button', { name: 'Ir para a minha dashboard' })).not.toBeInTheDocument();
  });
});
