import { useEffect, useRef, useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import { Film, Loader2, Menu, Shuffle } from 'lucide-react';
import AppHeader from './components/layout/Header';
import DashboardTab from './components/layout/DashboardTab';
import UserSidebar, { RECOMMENDATIONS_STORAGE_KEY_PREFIX } from './components/layout/UserSidebar';
import AuthScreen from './components/auth/AuthScreen';
import RequestPasswordResetScreen from './components/auth/RequestPasswordResetScreen';
import EnterCodeScreen from './components/auth/EnterCodeScreen';
import OscarPredictionsSection from './components/movies/OscarPredictionsSection';
import PersonalMoviesSection from './components/movies/PersonalMoviesSection';
import SeriesSection from './components/series/SeriesSection';
import MovieDetailScreen from './components/movies/MovieDetailScreen';
import SeriesDetailScreen from './components/series/SeriesDetailScreen';
import PersonDetailScreen from './components/people/PersonDetailScreen';
import HomeScreen from './components/home/HomeScreen';
import UserDropdownMenu from './components/layout/UserDropdownMenu';
import UserEventBell from './components/layout/UserEventBell';
import ImportTvTimePage from './components/layout/ImportTvTimePage';
import { useAvatarMutation, useUsers } from './hooks/useUsers';
import { useFavorites } from './hooks/useFavorites';
import { usePersonalMovies } from './hooks/usePersonalMovies';
import { useSeries } from './hooks/useSeries';
import RankingScreen from './components/layout/RankingScreen';
import GlobalSearch from './components/layout/GlobalSearch';
import ProfileSummary from './components/layout/ProfileSummary';
import ProfilePageSkeleton from './components/layout/ProfilePageSkeleton';
import { HEADER_MENU_OPEN_EVENT, notifyHeaderMenuOpen } from './lib/headerMenu';
import {
  changePassword,
  adminResetPassword,
  deleteCurrentUser,
  getCurrentSessionUser,
  loginUser,
  logoutUser,
  registerUser,
  updateUserProfile,
  requestPasswordReset,
  confirmPasswordReset,
} from './lib/appData';
import type { RankedUser, SessionUser } from './types/app';

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
  const [activeTab, setActiveTab] = useState<'home' | 'dashboard' | 'oscars' | 'movies' | 'series' | 'personal'>('home');
  const storedSession = readStoredSession();
  const [session, setSession] = useState<SessionUser | null>(storedSession);
  const [location, setLocation] = useLocation();
  const [match, params] = useRoute('/:username');
  const [matchMovie, movieParams] = useRoute('/filme/:id');
  const [matchSerie, serieParams] = useRoute('/serie/:id');
  const [matchActor, actorParams] = useRoute('/actor/:id');
  const [matchDirector, directorParams] = useRoute('/director/:id');
  const [matchImportTvTime] = useRoute('/import-tvtime');
  const [matchRequestPasswordReset] = useRoute('/conta/esqueci-senha');
  const [matchConfirmPasswordReset] = useRoute('/conta/resetar-senha');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authPending, setAuthPending] = useState(false);
  const [passwordResetError, setPasswordResetError] = useState<string | null>(null);
  const [passwordResetPending, setPasswordResetPending] = useState(false);
  const [passwordResetSuccess, setPasswordResetSuccess] = useState(false);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);
  const [deleteProfilePending, setDeleteProfilePending] = useState(false);
  const [infoMenuOpen, setInfoMenuOpen] = useState(false);
  const infoMenuRef = useRef<HTMLDetailsElement>(null);
  // If we have a stored session, skip the loading screen entirely
  const [isBootstrapping, setIsBootstrapping] = useState(!storedSession);

  const { favorites } = useFavorites(session?.id || '');

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
    const closeInfoMenu = (event: MouseEvent) => {
      if (infoMenuRef.current && !infoMenuRef.current.contains(event.target as Node)) {
        setInfoMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', closeInfoMenu);
    return () => document.removeEventListener('mousedown', closeInfoMenu);
  }, []);

  useEffect(() => {
    const handleOtherHeaderMenu = (event: Event) => {
      if ((event as CustomEvent<string>).detail !== 'info') {
        setInfoMenuOpen(false);
        if (infoMenuRef.current) infoMenuRef.current.open = false;
      }
    };
    window.addEventListener(HEADER_MENU_OPEN_EVENT, handleOtherHeaderMenu);
    return () => window.removeEventListener(HEADER_MENU_OPEN_EVENT, handleOtherHeaderMenu);
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

  const users: RankedUser[] = usersQuery.data || [];
  const urlUsername = match ? params.username : null;
  const viewedUser = urlUsername
    ? (users.find((user) => user.username === urlUsername) || null)
    : (users.find((user) => user.id === session?.id) || null);

  const currentRankedUser = users.find((user) => user.id === session?.id);
  const contentUser = urlUsername === 'ranking' ? currentRankedUser : viewedUser;
  const selectedUserId = contentUser?.id || null;
  const { moviesQuery: personalMoviesQuery } = usePersonalMovies(selectedUserId);
  const { seriesQuery: userSeriesQuery } = useSeries(selectedUserId);
  const personalMovies = personalMoviesQuery.data || [];
  const userSeries = userSeriesQuery.data || [];
  const achievementsLoading = personalMoviesQuery.isLoading || userSeriesQuery.isLoading || usersQuery.isLoading;
  const isOwnDashboard = Boolean(session?.id && viewedUser?.id === session.id);
  const canAccessOscars = Boolean(viewedUser);

  useEffect(() => {
    if (!canAccessOscars && activeTab === 'oscars') {
      setActiveTab('dashboard');
    }
  }, [activeTab, canAccessOscars]);

  useEffect(() => {
    if (viewedUser && !isOwnDashboard && activeTab === 'home') {
      setActiveTab('dashboard');
    }
  }, [activeTab, isOwnDashboard, viewedUser]);

  /* Previous title block is no longer part of the persistent header.
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
  void headerCopy;
  */

  const persistSession = (nextSession: SessionUser | null) => {
    setSession(nextSession);
    if (nextSession) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
      if (location === '/') setLocation(`/${nextSession.username}`);
      return;
    }

    localStorage.removeItem(SESSION_KEY);
    Object.keys(sessionStorage)
      .filter((key) => key.startsWith(RECOMMENDATIONS_STORAGE_KEY_PREFIX))
      .forEach((key) => sessionStorage.removeItem(key));
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

  const handleRequestPasswordReset = async (email: string) => {
    setPasswordResetPending(true);
    setPasswordResetError(null);
    setPasswordResetSuccess(false);

    try {
      await requestPasswordReset(email);
      setPasswordResetSuccess(true);
      // Redireciona para a tela de código
      setTimeout(() => {
        setLocation(`/conta/resetar-senha?email=${encodeURIComponent(email)}`);
      }, 1500);
    } catch (error) {
      setPasswordResetError(error instanceof Error ? error.message : 'Falha ao solicitar reset de senha.');
    } finally {
      setPasswordResetPending(false);
    }
  };

  const handleConfirmPasswordReset = async (
    email: string,
    code: string,
    password: string,
    confirmPassword: string,
  ) => {
    setPasswordResetPending(true);
    setPasswordResetError(null);

    try {
      const nextSession = await confirmPasswordReset(email, code, password, confirmPassword);
      persistSession(nextSession);
      await refetchUsers();
      setLocation(`/${nextSession.username}`);
    } catch (error) {
      setPasswordResetError(error instanceof Error ? error.message : 'Falha ao redefinir senha.');
    } finally {
      setPasswordResetPending(false);
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
            Verifique se a API está rodando e tente novamente.
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    if (matchRequestPasswordReset) {
      return (
        <RequestPasswordResetScreen
          onSubmit={handleRequestPasswordReset}
          onBackToLogin={() => setLocation('/')}
          error={passwordResetError}
          isPending={passwordResetPending}
          success={passwordResetSuccess}
        />
      );
    }

    if (matchConfirmPasswordReset) {
      const searchParams = new URLSearchParams(window.location.search);
      const emailFromUrl = searchParams.get('email') || '';
      const codeFromUrl = searchParams.get('code') || '';

      // Se não tem email na URL, volta para tela de solicitar reset
      if (!emailFromUrl) {
        setLocation('/conta/esqueci-senha');
        return null;
      }

      return (
        <EnterCodeScreen
          onSubmit={handleConfirmPasswordReset}
          onBackToLogin={() => setLocation('/')}
          error={passwordResetError}
          isPending={passwordResetPending}
          initialEmail={emailFromUrl}
          initialCode={codeFromUrl}
        />
      );
    }

    return (
      <AuthScreen
        onLogin={handleLogin}
        onRegister={handleRegister}
        error={authError}
        isPending={authPending}
        onForgotPassword={() => setLocation('/conta/esqueci-senha')}
      />
    );
  }

  const authenticatedSession = session;

  const selectUser = (id: string) => {
    const user = users.find((candidate) => candidate.id === id);
    if (user) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setLocation(`/${user.username}`);
    }
  };
  const isPersonRoute = Boolean(matchActor || matchDirector);
  const isProfileRoute = Boolean(viewedUser && !matchMovie && !matchSerie && !isPersonRoute && !matchImportTvTime && urlUsername !== 'ranking');

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text">
      <div className="mx-auto flex w-full max-w-[1700px] flex-col gap-6 px-3 py-4 sm:px-6 lg:px-8 lg:py-6">
        <AppHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
          canAccessOscars={canAccessOscars}
          canAccessHome={isOwnDashboard}
          onGoHome={() => {
            setActiveTab('home');
            setLocation(`/${authenticatedSession.username}`);
          }}
          searchSlot={<GlobalSearch users={users} onSelectUser={selectUser} />}
          hideTabs={urlUsername === 'ranking' || Boolean(matchMovie) || Boolean(matchSerie) || isPersonRoute || Boolean(matchImportTvTime)}
          onBack={(matchMovie || matchSerie || isPersonRoute || matchImportTvTime) ? () => setLocation(`/${authenticatedSession.username}`) : undefined}
          rightSlot={<>
            <details ref={infoMenuRef} open={infoMenuOpen} onToggle={(event) => { const open = event.currentTarget.open; setInfoMenuOpen(open); if (open) notifyHeaderMenuOpen('info'); }} className="relative">
              <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-xl border border-brand-gold bg-black text-white transition hover:bg-brand-gold/10"><Menu size={18} /></summary>
              <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-52 rounded-xl border border-[#151b28] bg-[#06080d] p-3 text-xs shadow-2xl flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setInfoMenuOpen(false);
                    if (infoMenuRef.current) infoMenuRef.current.open = false;
                    setLocation('/ranking');
                  }}
                  className="w-full text-left text-brand-text hover:text-brand-gold transition-colors font-medium cursor-pointer"
                >
                  Desempenho e Conquistas
                </button>
                <p className="text-brand-text">Blog CineRats <span className="text-brand-gold-alt">(em breve)</span></p>
                <p className="text-brand-text">Grupos <span className="text-brand-gold-alt">(em breve)</span></p>
              </div>
            </details>
            <UserDropdownMenu session={authenticatedSession} currentRankedUser={currentRankedUser} users={users} favoriteUserIds={favorites?.map((favorite) => favorite.favoriteUserId) || []} onLogout={handleLogout} avatarMutationPending={avatarMutation.isPending} adminUsername={ADMIN_USERNAME} onChangePassword={handleChangePassword} onAdminReset={handleAdminReset} onSaveAvatar={async (avatarId, displayName) => { await avatarMutation.mutateAsync({ userId: authenticatedSession.id, avatarId }); if (displayName !== currentRankedUser?.display_name) { await updateUserProfile(authenticatedSession.id, { display_name: displayName }); await refetchUsers(); } }} onSaveProfile={async (data) => { await updateUserProfile(authenticatedSession.id, data); await refetchUsers(); }} onDeleteProfile={handleDeleteProfile} deleteProfilePending={deleteProfilePending} />
            <UserEventBell currentUserId={authenticatedSession.id} viewedUserId={viewedUser?.id ?? authenticatedSession.id} isOwnDashboard={isOwnDashboard} friendIds={favorites?.map((favorite) => favorite.favoriteUserId) || []} />
            <button type="button" aria-label="Abrir CineMatch" title="CineMatch" onClick={() => { notifyHeaderMenuOpen('cineMatch'); window.dispatchEvent(new Event('open-cinematch')); }} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-brand-gold bg-black text-white transition hover:bg-brand-gold/10"><Shuffle size={16} /></button>
          </>}
        />

        {usersQuery.isLoading ? <ProfilePageSkeleton /> : (
          <div className={isProfileRoute ? 'grid grid-cols-1 gap-6 xl:grid-cols-[260px_minmax(0,1fr)_260px]' : 'min-w-0'}>
            {isProfileRoute && viewedUser && <aside className="contents xl:flex xl:flex-col xl:gap-5"><div className="order-1 xl:order-none"><ProfileSummary user={viewedUser} users={users} currentUserId={authenticatedSession.id} movies={personalMovies} series={userSeries} isLoading={achievementsLoading} onSelectUser={selectUser} /></div><div className="order-3 xl:order-none"><UserSidebar users={users} currentUserId={authenticatedSession.id} selectedUserId={selectedUserId || authenticatedSession.id} onSelectUser={selectUser} isOpen={false} onClose={() => undefined} section="discover" /></div></aside>}

            <main className="order-2 min-w-0 rounded-3xl border border-[#151b28] bg-[#06080d] p-4 xl:order-none sm:p-7 lg:p-9">
              {matchMovie ? <MovieDetailScreen id={movieParams.id} currentUserId={session.id} /> : matchSerie ? <SeriesDetailScreen id={serieParams.id} currentUserId={session.id} /> : matchActor ? <PersonDetailScreen id={actorParams.id} mode="actor" /> : matchDirector ? <PersonDetailScreen id={directorParams.id} mode="director" /> : matchImportTvTime ? <ImportTvTimePage currentUserId={session.id} onBack={() => setLocation(`/${authenticatedSession.username}`)} /> : urlUsername === 'ranking' && currentRankedUser ? <RankingScreen user={currentRankedUser} users={users} movies={personalMovies} series={userSeries} currentUserId={session.id} isLoading={personalMoviesQuery.isLoading || userSeriesQuery.isLoading} /> : urlUsername && !viewedUser ? <div className="py-20 text-center text-brand-text-muted">Usuário não encontrado.</div> : viewedUser && <div className="animate-in fade-in duration-500">{activeTab === 'home' && isOwnDashboard ? <HomeScreen userId={session.id} movies={personalMovies} series={userSeries} /> : activeTab === 'dashboard' || !isOwnDashboard ? <DashboardTab user={viewedUser} isOwnDashboard={isOwnDashboard} /> : activeTab === 'oscars' ? <OscarPredictionsSection userId={viewedUser.id} canEdit={isOwnDashboard} /> : activeTab === 'movies' ? <PersonalMoviesSection userId={viewedUser.id} canEdit={isOwnDashboard} currentUserId={session.id} /> : activeTab === 'series' ? <SeriesSection userId={viewedUser.id} canEdit={isOwnDashboard} currentUserId={session.id} /> : <><PersonalMoviesSection userId={viewedUser.id} canEdit={isOwnDashboard} currentUserId={session.id} /><SeriesSection userId={viewedUser.id} canEdit={isOwnDashboard} currentUserId={session.id} /></>}</div>}
            </main>

            {isProfileRoute && <aside className="order-4 flex flex-col gap-5 xl:order-none"><section className="rounded-3xl border border-[#151b28] bg-[#06080d] p-5"><h2 className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-brand-gold">Últimas atualizações</h2><div className="mt-4 space-y-4 text-xs leading-relaxed text-brand-text-muted"><div><p className="font-semibold text-brand-text mb-2">27/07 - NEW</p><ul className="list-disc list-inside space-y-1.5 pl-1 text-brand-text-muted/90"><li>Adição da tela Home com as Tendências da Semana, sugestões baseadas no seu último título assistido e as séries e filmes mais bem avaliados</li><li>Telas dedicadas para atores, atrizes e diretores com a filmografia de cada um</li><li>Melhora significativa no algoritmo de recomendação de filmes</li><li>Ícone de adição de amigo presente no hero do usuário</li><li>Agora a tela de <button type="button" onClick={() => setLocation('/ranking')} className="cursor-pointer text-brand-text underline decoration-brand-gold/60 underline-offset-2 transition hover:text-brand-gold">Desempenho e Conquistas</button> está disponível através do acesso pelo menu superior <button type="button" aria-label="Abrir Desempenho e Conquistas" onClick={() => setLocation('/ranking')} className="cursor-pointer font-semibold text-brand-text transition hover:text-brand-gold">≡</button>.</li></ul></div><div className="border-t border-[#151b28] pt-3"><p><strong className="text-brand-text">13/07</strong> - As sessões de Blog e Grupos estão em produção no CineRats</p></div></div></section><UserSidebar users={users} currentUserId={session.id} selectedUserId={selectedUserId || session.id} onSelectUser={selectUser} isOpen={false} onClose={() => undefined} section="ranking" /></aside>}
          </div>
        )}

        <footer className="border-t border-[#151b28] py-5 text-center text-xs text-brand-text-muted">
          <div className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-4">
            <p className="flex items-center gap-2"><Film size={14} className="text-brand-gold-alt" />CineRats • edumzz</p>
            <span className="hidden text-brand-text-muted/40 sm:inline">•</span>
            <a href="mailto:contato@cinerats.com" className="transition hover:text-brand-gold">contato@cinerats.com</a>
          </div>
        </footer>
      </div>
    </div>
  );

  /* Legacy layout retained below temporarily for reference.
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
  */
}

export default App;

