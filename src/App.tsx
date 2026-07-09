import { useEffect, useMemo, useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import { Film, Loader2, Star } from 'lucide-react';
import AppHeader from './components/layout/Header';
import DashboardTab from './components/layout/DashboardTab';
import UserSidebar from './components/layout/UserSidebar';
import AuthScreen from './components/auth/AuthScreen';
import OscarPredictionsSection from './components/movies/OscarPredictionsSection';
import PersonalMoviesSection from './components/movies/PersonalMoviesSection';
import SeriesSection from './components/series/SeriesSection';
import MovieDetailScreen from './components/movies/MovieDetailScreen';
import SeriesDetailScreen from './components/series/SeriesDetailScreen';
import UserDropdownMenu from './components/layout/UserDropdownMenu';
import UserEventBell from './components/layout/UserEventBell';
import { useAvatarMutation, useUsers } from './hooks/useUsers';
import { useFavorites } from './hooks/useFavorites';
import { usePersonalMovies } from './hooks/usePersonalMovies';
import { useSeries } from './hooks/useSeries';
import UserAchievements from './components/ui/UserAchievements';
import AllAchievements from './components/ui/AllAchievements';
import RankingScreen from './components/layout/RankingScreen';
import clsx from 'clsx';
import {
  changePassword,
  adminResetPassword,
  deleteCurrentUser,
  getCurrentSessionUser,
  loginUser,
  logoutUser,
  registerUser,
  updateUserProfile,
} from './lib/appData';
import type { SessionUser } from './types/app';

const SESSION_KEY = 'letterboxmzz_session_v1';
const ADMIN_USERNAME = import.meta.env.VITE_OSCAR_ADMIN_USERNAME as string | undefined;

function readStoredSession(): SessionUser | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'oscars' | 'personal'>('dashboard');
  const storedSession = readStoredSession();
  const [session, setSession] = useState<SessionUser | null>(storedSession);
  const [location, setLocation] = useLocation();
  const [match, params] = useRoute('/:username');
  const [matchMovie, movieParams] = useRoute('/filme/:id');
  const [matchSerie, serieParams] = useRoute('/serie/:id');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authPending, setAuthPending] = useState(false);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);
  const [deleteProfilePending, setDeleteProfilePending] = useState(false);
  // If we have a stored session, skip the loading screen entirely
  const [isBootstrapping, setIsBootstrapping] = useState(!storedSession);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { favorites, isUserFavorited, toggleFavorite } = useFavorites(session?.id || '');

  const usersQuery = useUsers(Boolean(session?.id));
  const avatarMutation = useAvatarMutation();
  const { refetch: refetchUsers } = usersQuery;

  useEffect(() => {
    let isMounted = true;

    async function runBootstrap() {
      try {
        const currentSession = await getCurrentSessionUser();
        if (!isMounted) return;

        if (currentSession) {
          setSession(currentSession);
          if (location === '/') setLocation(`/${currentSession.username}`);
          localStorage.setItem(SESSION_KEY, JSON.stringify(currentSession));
        } else {
          setSession(null);
          localStorage.removeItem(SESSION_KEY);
        }
      } catch (error) {
        if (isMounted) {
          const message =
            error instanceof Error
              ? error.message
              : 'Nao foi possivel iniciar a aplicacao.';
          setBootstrapError(message);
        }
      } finally {
        if (isMounted) setIsBootstrapping(false);
      }
    }

    void runBootstrap();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!session?.id) return;
    if (location === '/') setLocation(`/${session.username}`);
  }, [session, location, setLocation]);

  // Fix Radix UI overlay lock issues globally when Dialogs or Menus close
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'style') {
          const pointerEvents = document.body.style.pointerEvents;
          if (pointerEvents === 'none') {
            const hasOpenModal = document.querySelector(
              '[role="dialog"], [role="menu"], [data-state="open"], .fixed.inset-0.bg-black\\/80'
            );
            if (!hasOpenModal) {
              document.body.style.pointerEvents = '';
            }
          }
        }
      });
    });

    observer.observe(document.body, { attributes: true, attributeFilter: ['style'] });
    return () => observer.disconnect();
  }, []);

  const users = usersQuery.data || [];
  const urlUsername = match ? params.username : null;
  const viewedUser = urlUsername
    ? (users.find((user) => user.username === urlUsername) || null)
    : (users.find((user) => user.id === session?.id) || null);

  const selectedUserId = viewedUser?.id || null;
  const { moviesQuery: personalMoviesQuery } = usePersonalMovies(selectedUserId);
  const { seriesQuery: userSeriesQuery } = useSeries(selectedUserId);
  const personalMovies = personalMoviesQuery.data || [];
  const userSeries = userSeriesQuery.data || [];
  const achievementsLoading = personalMoviesQuery.isLoading || userSeriesQuery.isLoading || usersQuery.isLoading;
  const currentUser = users.find((user) => user.id === session?.id) || session || null;
  const currentRankedUser = users.find((user) => user.id === session?.id);
  const isOwnDashboard = Boolean(session?.id && viewedUser?.id === session.id);
  const canAccessOscars = Boolean(viewedUser);

  useEffect(() => {
    if (!canAccessOscars && activeTab === 'oscars') {
      setActiveTab('dashboard');
    }
  }, [activeTab, canAccessOscars]);

  const headerCopy = useMemo(() => {
    if (matchMovie) {
      return {
        title: 'Cinema',
      };
    }

    if (matchSerie) {
      return {
        title: 'Televisão',
      };
    }

    if (urlUsername === 'ranking') {
      return {
        title: 'Conquistas Disponíveis',
      };
    }


    if (urlUsername && !viewedUser) {
      return {
        title: 'Usuário não encontrado',
      };
    }

    if (!viewedUser) {
      return {
        title: 'Cinerats',
      };
    }

    if (isOwnDashboard) {
      return {
        title: `Dashboard de ${viewedUser.display_name || viewedUser.username}`,
      };
    }

    const isFavorited = isUserFavorited(viewedUser.id);

    return {
      title: (
        <span className="flex items-center gap-4">
          Perfil de {viewedUser.display_name || viewedUser.username}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(viewedUser.id);
            }}
            className="p-1 hover:bg-white/5 rounded-full transition-colors shrink-0"
            title={isFavorited ? "Remover dos amigos" : "Adicionar aos amigos"}
          >
            <Star
              size={32}
              className={clsx(
                isFavorited ? 'fill-brand-gold text-brand-gold' : 'text-[#444] hover:text-white transition-colors'
              )}
            />
          </button>
        </span>
      ),
    };
  }, [viewedUser, urlUsername, isOwnDashboard, isUserFavorited, toggleFavorite]);

  const persistSession = (nextSession: SessionUser | null) => {
    setSession(nextSession);
    if (nextSession) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
      if (location === '/') setLocation(`/${nextSession.username}`);
      return;
    }

    localStorage.removeItem(SESSION_KEY);
    setLocation('/');
  };

  const handleLogin = async (username: string, password: string) => {
    setAuthPending(true);
    setAuthError(null);

    try {
      const nextSession = await loginUser(username, password);
      persistSession(nextSession);
      await refetchUsers();
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Falha no login.');
    } finally {
      setAuthPending(false);
    }
  };

  const handleRegister = async (username: string, email: string, password: string) => {
    setAuthPending(true);
    setAuthError(null);

    try {
      const nextSession = await registerUser(username, email, password);
      persistSession(nextSession);
      await refetchUsers();
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Falha no cadastro.');
    } finally {
      setAuthPending(false);
    }
  };

  const handleLogout = () => {
    void logoutUser();
    persistSession(null);
    setActiveTab('dashboard');
    setAuthError(null);
  };

  const handleChangePassword = async (userId: string, current: string, next: string) => {
    await changePassword(userId, current, next);
  };

  const handleAdminReset = async (targetUsername: string, newPassword: string) => {
    await adminResetPassword(targetUsername, newPassword);
  };

  const handleDeleteProfile = async (currentPassword: string) => {
    if (!session?.id) {
      throw new Error('Nenhuma sessao ativa.');
    }

    setDeleteProfilePending(true);
    try {
      await deleteCurrentUser(session.id, currentPassword);
      persistSession(null);
      if (typeof window !== 'undefined') {
        window.location.assign(import.meta.env.VITE_PUBLIC_APP_URL ?? 'https://cinerats.vercel.app');
      }
    } finally {
      setDeleteProfilePending(false);
    }
  };

  if (isBootstrapping) {
    return (
      <div className="min-h-screen bg-brand-bg text-brand-text flex items-center justify-center">
        <div className="inline-flex items-center gap-3 text-brand-gold tracking-[0.25em] uppercase text-sm">
          <Loader2 size={18} className="animate-spin" />
          Inicializando catalogo
        </div>
      </div>
    );
  }

  if (bootstrapError) {
    return (
      <div className="min-h-screen bg-brand-bg text-brand-text flex items-center justify-center px-4">
        <div className="max-w-xl border border-red-500/30 rounded-3xl p-8 bg-red-500/10 space-y-4">
          <h1 className="text-2xl uppercase tracking-[0.15em] text-red-200">Bootstrap falhou</h1>
          <p className="text-red-100/90 leading-relaxed">{bootstrapError}</p>
          <p className="text-sm text-red-100/70">
            Revise as variaveis de ambiente e permissoes das colecoes no Appwrite, depois recarregue.
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <AuthScreen
        onLogin={handleLogin}
        onRegister={handleRegister}
        error={authError}
        isPending={authPending}
      />
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text">
      <div className="max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-12">
        <div className="flex flex-col xl:flex-row gap-8">
          <UserSidebar
            users={users}
            currentUserId={session.id}
            selectedUserId={selectedUserId || session.id}
            onSelectUser={(id) => {
              const u = users.find((x) => x.id === id);
              if (u) setLocation(`/${u.username}`);
            }}
            onViewAll={() => setLocation('/ranking')}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />

          <div className="flex-1 border border-[#151515] rounded-[32px] bg-[radial-gradient(circle_at_top_right,_rgba(212,175,55,0.08),_transparent_22%),linear-gradient(180deg,_rgba(9,12,18,0.96),_rgba(0,0,0,0.98))] px-5 sm:px-8 lg:px-10 py-8 flex flex-col gap-12 min-w-0">
            <AppHeader
              activeTab={activeTab}
              onTabChange={setActiveTab}
              title={headerCopy.title}
              canAccessOscars={canAccessOscars}
              onToggleSidebar={() => setSidebarOpen(true)}
              rightSlot={(
                <div className="flex items-center gap-2">
                  <UserEventBell
                    currentUserId={session.id}
                    viewedUserId={viewedUser?.id ?? session.id}
                    isOwnDashboard={isOwnDashboard}
                    friendIds={favorites?.map((f) => f.favoriteUserId) || []}
                  />
                  <UserDropdownMenu
                    session={session}
                    currentRankedUser={currentRankedUser}
                    users={users}
                    onLogout={handleLogout}
                    avatarMutationPending={avatarMutation.isPending}
                    adminUsername={ADMIN_USERNAME}
                    onChangePassword={handleChangePassword}
                    onAdminReset={handleAdminReset}
                    onSaveAvatar={async (avatarId, displayName) => {
                      await avatarMutation.mutateAsync({ userId: session.id, avatarId });
                      if (displayName !== currentRankedUser?.display_name) {
                        await updateUserProfile(session.id, { display_name: displayName });
                        await refetchUsers();
                      }
                    }}
                    onSaveProfile={async (data) => {
                      await updateUserProfile(session.id, data);
                      await refetchUsers();
                    }}
                    onDeleteProfile={handleDeleteProfile}
                    deleteProfilePending={deleteProfilePending}
                  />
                </div>
              )}
              subSlot={
                urlUsername === 'ranking' ? (
                  <AllAchievements />
                ) : (matchMovie || matchSerie) ? null : selectedUserId ? (
                  <UserAchievements
                    movies={personalMovies}
                    series={userSeries}
                    users={users}
                    userId={selectedUserId}
                    isLoading={achievementsLoading}
                  />
                ) : null
              }
              hideTabs={urlUsername === 'ranking' || Boolean(matchMovie) || Boolean(matchSerie)}
              onBack={
                (matchMovie || matchSerie)
                  ? () => setLocation('/')
                  : !isOwnDashboard && viewedUser && urlUsername !== 'ranking'
                  ? () => setLocation(`/${session.username}`)
                  : undefined
              }
            />

            {usersQuery.isLoading ? (
              <div className="flex justify-center items-center py-20 text-brand-gold-alt opacity-50">
                <Loader2 className="animate-spin" size={32} />
              </div>
            ) : matchMovie ? (
              <MovieDetailScreen id={movieParams.id} currentUserId={session.id} />
            ) : matchSerie ? (
              <SeriesDetailScreen id={serieParams.id} currentUserId={session.id} />
            ) : urlUsername === 'ranking' ? (
              <RankingScreen
                users={users}
                currentUserId={session.id}
                favorites={favorites?.map(f => f.favoriteUserId) || []}
                onToggleFavorite={toggleFavorite}
                onSelectUser={(id) => {
                  const u = users.find(x => x.id === id);
                  if (u) setLocation(`/${u.username}`);
                }}
                onBack={() => setLocation('/')}
              />
            ) : urlUsername && !viewedUser ? (
              <div className="flex justify-center items-center py-20 text-brand-text-muted">
                <p>Usuário "{urlUsername}" não encontrado.</p>
              </div>
            ) : !viewedUser ? null : (
              <main className="flex flex-col gap-16 min-h-[50vh]">
                {activeTab === 'dashboard' ? (
                  <DashboardTab user={viewedUser!} isOwnDashboard={isOwnDashboard} />
                ) : activeTab === 'oscars' ? (
                  <div className="animate-in fade-in duration-500">
                    <OscarPredictionsSection
                      userId={viewedUser.id}
                      canEdit={isOwnDashboard}
                    />
                  </div>
                ) : (
                  <div className="animate-in fade-in duration-500 flex flex-col gap-16">
                    <PersonalMoviesSection
                      userId={viewedUser.id}
                      canEdit={isOwnDashboard}
                      currentUserId={session.id}
                    />
                    <SeriesSection
                      userId={viewedUser.id}
                      canEdit={isOwnDashboard}
                      currentUserId={session.id}
                    />
                  </div>
                )}
              </main>
            )}
          </div>
        </div>

        <footer className="mt-auto py-8 text-center text-sm text-brand-text-muted border-t border-[#111] border-opacity-50">
          <p className="flex items-center justify-center gap-2">
            <Film size={16} className="text-brand-gold-alt" />
            Cinerats • {currentUser?.username || 'Sessao ativa'}
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;

