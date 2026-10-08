import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../test/renderWithProviders';
import type { UserFavoritePerson } from '../../types/app';
import FavoritePersonButton from './FavoritePersonButton';

const api = vi.hoisted(() => ({
  listFavoritePeople: vi.fn(),
  addFavoritePerson: vi.fn(),
  removeFavoritePerson: vi.fn(),
}));

vi.mock('../../lib/appData', () => api);

const person = {
  tmdbPersonId: 1,
  name: 'Michael B. Jordan',
  profilePath: '/mbj.jpg',
  department: 'Acting' as const,
};

const makeFavorite = (tmdbPersonId: number): UserFavoritePerson => ({
  id: `fav-${tmdbPersonId}`,
  tmdbPersonId,
  name: `Pessoa ${tmdbPersonId}`,
  profilePath: null,
  department: 'Acting',
  createdAt: '2026-10-01T00:00:00Z',
});

describe('FavoritePersonButton', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    api.listFavoritePeople.mockResolvedValue([]);
    api.addFavoritePerson.mockResolvedValue(makeFavorite(1));
    api.removeFavoritePerson.mockResolvedValue(undefined);
  });

  it('bloqueia a ação para visitantes e não consulta a API', () => {
    renderWithProviders(<FavoritePersonButton currentUserId={null} person={person} />);

    const button = screen.getByRole('button', { name: /entre para favoritar/i });
    expect(button).toBeDisabled();
    expect(api.listFavoritePeople).not.toHaveBeenCalled();
  });

  it('favorita enviando os dados da pessoa para a API', async () => {
    const user = userEvent.setup();
    renderWithProviders(<FavoritePersonButton currentUserId="user-1" person={person} />);

    const button = await screen.findByRole('button', { name: /adicionar aos artistas favoritos/i });
    await waitFor(() => expect(button).toBeEnabled());
    // Após favoritar, o servidor passa a devolver a pessoa na lista.
    api.listFavoritePeople.mockResolvedValue([makeFavorite(1)]);
    await user.click(button);

    await waitFor(() => expect(api.addFavoritePerson).toHaveBeenCalledWith(person));
    expect(api.removeFavoritePerson).not.toHaveBeenCalled();
    expect(await screen.findByRole('button', { name: /remover dos artistas favoritos/i })).toHaveAttribute('aria-pressed', 'true');
  });

  it('desfavorita usando o ID do TMDB quando já é favorito', async () => {
    api.listFavoritePeople.mockResolvedValue([makeFavorite(1)]);
    const user = userEvent.setup();
    renderWithProviders(<FavoritePersonButton currentUserId="user-1" person={person} />);

    const button = await screen.findByRole('button', { name: /remover dos artistas favoritos/i });
    await user.click(button);

    await waitFor(() => expect(api.removeFavoritePerson).toHaveBeenCalledWith(1));
    expect(api.addFavoritePerson).not.toHaveBeenCalled();
  });

  it('impede novos favoritos ao atingir o limite de 25 e explica o motivo', async () => {
    api.listFavoritePeople.mockResolvedValue(Array.from({ length: 25 }, (_, index) => makeFavorite(100 + index)));
    renderWithProviders(<FavoritePersonButton currentUserId="user-1" person={person} />);

    expect(await screen.findByText(/limite de 25 artistas favoritos atingido/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /adicionar aos artistas favoritos/i })).toBeDisabled();
  });

  it('mantém a possibilidade de remover quando o limite foi atingido', async () => {
    const favorites = Array.from({ length: 24 }, (_, index) => makeFavorite(100 + index));
    api.listFavoritePeople.mockResolvedValue([...favorites, makeFavorite(1)]);
    renderWithProviders(<FavoritePersonButton currentUserId="user-1" person={person} />);

    expect(await screen.findByRole('button', { name: /remover dos artistas favoritos/i })).toBeEnabled();
  });

  it('reverte a tela e avisa o usuário quando a API falha', async () => {
    api.addFavoritePerson.mockRejectedValue(new Error('Favorite people limit reached (25)'));
    const user = userEvent.setup();
    renderWithProviders(<FavoritePersonButton currentUserId="user-1" person={person} />);

    const button = await screen.findByRole('button', { name: /adicionar aos artistas favoritos/i });
    await waitFor(() => expect(button).toBeEnabled());
    await user.click(button);

    expect(await screen.findByRole('alert')).toHaveTextContent(/não foi possível atualizar/i);
    expect(await screen.findByRole('button', { name: /adicionar aos artistas favoritos/i })).toHaveAttribute('aria-pressed', 'false');
  });
});
