import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../test/renderWithProviders';
import type { WatchParty } from '../../types/app';
import WatchPartyHistory from './WatchPartyHistory';

const api = vi.hoisted(() => ({
  listWatchParties: vi.fn(),
  updateWatchPartyProgress: vi.fn(),
  completeWatchParty: vi.fn(),
}));

vi.mock('../../lib/watchParties', () => api);

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

const parties: WatchParty[] = ['a', 'b'].map((id) => ({
  id,
  createdByUserId: 'creator',
  partnerUserId: 'partner',
  mediaType: 'series',
  providerExternalId: id,
  title: `Série ${id}`,
  posterPath: null,
  genreId: null,
  status: 'planned',
  progressSeason: 2,
  progressEpisode: 3,
  creatorPoints: 10,
  partnerPoints: 10,
  createdAt: '2026-10-14T00:00:00Z',
  completedAt: null,
}));

function card(id: string) {
  return within(screen.getByRole('button', { name: `Série ${id}` }).closest('article')!);
}

function expectLocked(id: string, locked: boolean) {
  const buttons = card(id).getAllByRole('button').filter((button) => button.textContent !== `Série ${id}`);
  for (const button of buttons) {
    if (locked) expect(button).toBeDisabled();
    else expect(button).toBeEnabled();
  }
  for (const input of card(id).queryAllByRole('spinbutton')) {
    if (locked) expect(input).toBeDisabled();
    else expect(input).toBeEnabled();
  }
}

async function renderHistory() {
  const result = renderWithProviders(<WatchPartyHistory currentUserId="creator" users={[]} />);
  await screen.findByRole('button', { name: 'Série a' });
  return result;
}

async function start(id: string, operation: 'progresso' | 'conclusão') {
  const user = userEvent.setup();
  // Leave the editor open for both operations to check all mutation controls.
  await user.click(card(id).getByRole('button', { name: 'Atualizar progresso' }));
  await user.click(card(id).getByRole('button', { name: operation === 'progresso' ? 'Salvar' : 'Concluir' }));
}

describe('WatchPartyHistory: operações concorrentes', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    api.listWatchParties.mockResolvedValue(parties);
  });

  const cases = (['progresso', 'conclusão'] as const).flatMap((first) =>
    (['progresso', 'conclusão'] as const).flatMap((second) =>
      (['a', 'b'] as const).map((resolvedFirst) => ({ first, second, resolvedFirst }))),
  );

  it.each(cases)('$first em a e $second em b: resposta de $resolvedFirst chega primeiro', async ({ first, second, resolvedFirst }) => {
    const requests = { a: deferred<WatchParty>(), b: deferred<WatchParty>() };
    const request = (id: 'a' | 'b') => requests[id].promise;
    api.updateWatchPartyProgress.mockImplementation(request);
    api.completeWatchParty.mockImplementation(request);
    const { queryClient } = await renderHistory();
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');

    await start('a', first);
    expectLocked('a', true);
    expectLocked('b', false);
    await start('b', second);
    expectLocked('a', true);
    expectLocked('b', true);

    const unresolved = resolvedFirst === 'a' ? 'b' : 'a';
    await act(async () => { requests[resolvedFirst].resolve(parties[resolvedFirst === 'a' ? 0 : 1]); });
    await waitFor(() => expectLocked(resolvedFirst, false));
    expectLocked(unresolved, true);
    if (resolvedFirst === 'a') expect(card('b').getByRole('button', { name: 'Salvar' })).toBeDisabled();

    // Attempts to repeat either operation on the still-pending session do nothing.
    const user = userEvent.setup();
    await user.click(card(unresolved).getByRole('button', { name: 'Concluir' }));
    await user.click(card(unresolved).getByRole('button', { name: 'Atualizar progresso' }));
    expect(api.completeWatchParty.mock.calls.length + api.updateWatchPartyProgress.mock.calls.length).toBe(2);

    await act(async () => { requests[unresolved].resolve(parties[unresolved === 'a' ? 0 : 1]); });
    await waitFor(() => { expectLocked('a', false); expectLocked('b', false); });
    for (const [id, operation] of [['a', first], ['b', second]] as const) {
      if (operation === 'progresso') expect(api.updateWatchPartyProgress).toHaveBeenCalledWith(id, 2, 4);
      else expect(api.completeWatchParty).toHaveBeenCalledWith(id);
    }
    expect(invalidate).toHaveBeenCalledTimes(6);
    for (const key of ['watchparties', 'series', 'personal-movies']) {
      expect(invalidate).toHaveBeenCalledWith({ queryKey: [key] });
    }
  });

  it('libera somente a sessão que falhou e permite tentar novamente', async () => {
    const a = deferred<WatchParty>();
    const b = deferred<WatchParty>();
    api.updateWatchPartyProgress.mockReturnValueOnce(a.promise).mockReturnValueOnce(b.promise).mockResolvedValue(parties[1]);
    await renderHistory();
    await start('a', 'progresso');
    await start('b', 'progresso');

    await act(async () => { b.reject(new Error('Falha ao salvar')); });
    expect(await screen.findByRole('alert')).toHaveTextContent('Falha ao salvar');
    expectLocked('a', true);
    expectLocked('b', false);
    expect(card('b').getByRole('spinbutton', { name: 'Último ep.' })).toHaveValue(4);

    await userEvent.setup().click(card('b').getByRole('button', { name: 'Salvar' }));
    await waitFor(() => expect(api.updateWatchPartyProgress).toHaveBeenCalledTimes(3));
    expectLocked('a', true);
    await act(async () => { a.resolve(parties[0]); });
    await waitFor(() => expectLocked('a', false));
  });

  it('mantém o bloqueio até o refetch terminar', async () => {
    const refreshed = deferred<WatchParty[]>();
    api.updateWatchPartyProgress.mockResolvedValue(parties[0]);
    const { queryClient } = await renderHistory();
    api.listWatchParties.mockReturnValue(refreshed.promise);
    await start('a', 'progresso');
    await waitFor(() => expect(queryClient.isFetching()).toBe(1));
    expectLocked('a', true);
    expectLocked('b', false);

    await act(async () => { refreshed.resolve([{ ...parties[0], progressEpisode: 4 }, parties[1]]); });
    await waitFor(() => expectLocked('a', false));
    expect(card('a').getByText('Até T2 E4')).toBeInTheDocument();
  });

  it('bloqueia submissões repetidas e conclusão na mesma sessão antes de renderizar', async () => {
    const request = deferred<WatchParty>();
    api.updateWatchPartyProgress.mockReturnValue(request.promise);
    await renderHistory();
    await userEvent.setup().click(card('a').getByRole('button', { name: 'Atualizar progresso' }));
    const form = card('a').getByRole('button', { name: 'Salvar' }).closest('form')!;
    const finish = card('a').getByRole('button', { name: 'Concluir' });
    act(() => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      finish.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(api.updateWatchPartyProgress).toHaveBeenCalledTimes(1);
    expect(api.completeWatchParty).not.toHaveBeenCalled();
    expectLocked('a', true);
    // A programmatic submit also respects the guard after the controls are disabled.
    fireEvent.submit(form);
    expect(api.updateWatchPartyProgress).toHaveBeenCalledTimes(1);
    await act(async () => { request.resolve(parties[0]); });
    await waitFor(() => expectLocked('a', false));
  });
});
