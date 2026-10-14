import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../test/renderWithProviders';
import type { UserFavoritePerson } from '../../types/app';
import FavoritePeopleList from './FavoritePeopleList';

const api = vi.hoisted(() => ({
  listFavoritePeople: vi.fn(),
  addFavoritePerson: vi.fn(),
  removeFavoritePerson: vi.fn(),
}));
const navigation = vi.hoisted(() => ({ setLocation: vi.fn() }));

vi.mock('../../lib/appData', () => api);
vi.mock('wouter', () => ({ useLocation: () => ['/', navigation.setLocation] }));

const actor: UserFavoritePerson = {
  id: 'fav-1',
  tmdbPersonId: 10,
  name: 'Florence Pugh',
  profilePath: '/fp.jpg',
  department: 'Acting',
  createdAt: '2026-10-01T00:00:00Z',
};
const director: UserFavoritePerson = {
  id: 'fav-2',
  tmdbPersonId: 20,
  name: 'Ryan Coogler',
  profilePath: null,
  department: 'Directing',
  createdAt: '2026-10-02T00:00:00Z',
};

describe('FavoritePeopleList', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('mostra a mensagem de vazio quando não há favoritos', async () => {
    api.listFavoritePeople.mockResolvedValue([]);
    renderWithProviders(<FavoritePeopleList userId="user-1" emptyMessage="Nenhum artista favoritado ainda." />);

    expect(await screen.findByText('Nenhum artista favoritado ainda.')).toBeInTheDocument();
  });

  it('lista os artistas do usuário informado, inclusive de outro usuário', async () => {
    api.listFavoritePeople.mockResolvedValue([actor, director]);
    renderWithProviders(<FavoritePeopleList userId="outro-usuario" emptyMessage="vazio" />);

    expect(await screen.findByText('Florence Pugh')).toBeInTheDocument();
    expect(screen.getByText('Ryan Coogler')).toBeInTheDocument();
    expect(api.listFavoritePeople).toHaveBeenCalledWith('outro-usuario');
  });

  it('abre a página de ator ou de diretor conforme o departamento', async () => {
    api.listFavoritePeople.mockResolvedValue([actor, director]);
    const user = userEvent.setup();
    renderWithProviders(<FavoritePeopleList userId="user-1" emptyMessage="vazio" />);

    await user.click(await screen.findByRole('button', { name: /florence pugh/i }));
    expect(navigation.setLocation).toHaveBeenLastCalledWith('/actor/10');

    await user.click(screen.getByRole('button', { name: /ryan coogler/i }));
    expect(navigation.setLocation).toHaveBeenLastCalledWith('/director/20');
  });

  it('avisa quando a lista não pode ser carregada', async () => {
    api.listFavoritePeople.mockRejectedValue(new Error('falha'));
    renderWithProviders(<FavoritePeopleList userId="user-1" emptyMessage="vazio" />);

    expect(await screen.findByText(/não foi possível carregar os artistas favoritos/i)).toBeInTheDocument();
  });
});
