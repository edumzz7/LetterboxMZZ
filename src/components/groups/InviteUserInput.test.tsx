import { useState } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../test/renderWithProviders';
import type { RankedUser } from '../../types/app';
import InviteUserInput from './InviteUserInput';

const appData = vi.hoisted(() => ({ listRankedUsers: vi.fn() }));
vi.mock('../../lib/appData', () => appData);

const user = (id: string, username: string, display_name?: string) =>
  ({ id, username, display_name, avatar_id: 'avatar_clapper', mcoins: 0, rank: 1, created_at: '', user_id: id }) as RankedUser;

function Harness({ excluded = [] as string[] }) {
  const [value, setValue] = useState('');
  return (
    <>
      <label htmlFor="group-invite-username">Convidar</label>
      <InviteUserInput value={value} onChange={setValue} excludedUserIds={excluded} />
      <output data-testid="value">{value}</output>
    </>
  );
}

describe('InviteUserInput', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    appData.listRankedUsers.mockResolvedValue([
      user('u-1', 'lilimorais', 'Lili'),
      user('u-2', 'etoiles', 'Giu'),
      user('u-3', 'lilian_x'),
      user('u-4', 'edumzz', 'Minuzzo'),
    ]);
  });

  it('só sugere a partir de 3 caracteres', async () => {
    const actor = userEvent.setup();
    renderWithProviders(<Harness />);

    await actor.type(screen.getByLabelText('Convidar'), '@li');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    await actor.type(screen.getByLabelText('Convidar'), 'l');
    expect(await screen.findByRole('listbox')).toBeInTheDocument();
    expect(screen.getAllByRole('option').map((option) => option.textContent?.match(/@\w+/)?.[0])).toEqual([
      '@lilimorais',
      '@lilian_x',
    ]);
  });

  it('busca também pelo nome de exibição e ignora excluídos', async () => {
    const actor = userEvent.setup();
    renderWithProviders(<Harness excluded={['u-1']} />);

    await actor.type(screen.getByLabelText('Convidar'), 'giu');
    expect(await screen.findByRole('option', { name: /@etoiles/ })).toBeInTheDocument();

    await actor.clear(screen.getByLabelText('Convidar'));
    await actor.type(screen.getByLabelText('Convidar'), 'lili');
    expect(screen.queryByRole('option', { name: /@lilimorais/ })).not.toBeInTheDocument();
    expect(screen.getByRole('option', { name: /@lilian_x/ })).toBeInTheDocument();
  });

  it('preenche o @ ao clicar na sugestão', async () => {
    const actor = userEvent.setup();
    renderWithProviders(<Harness />);

    await actor.type(screen.getByLabelText('Convidar'), 'minu');
    await actor.click(await screen.findByRole('option', { name: /@edumzz/ }));

    expect(screen.getByTestId('value')).toHaveTextContent('@edumzz');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('permite escolher pelo teclado', async () => {
    const actor = userEvent.setup();
    renderWithProviders(<Harness />);

    await actor.type(screen.getByLabelText('Convidar'), 'lil');
    await screen.findByRole('listbox');
    await actor.keyboard('{ArrowDown}{ArrowDown}{Enter}');

    expect(screen.getByTestId('value')).toHaveTextContent('@lilian_x');
  });
});
