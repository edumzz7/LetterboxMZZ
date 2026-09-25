import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import {
  Award,
  BookOpen,
  CircleHelp,
  Film,
  History,
  House,
  Loader2,
  Menu,
  Shuffle,
  Tv,
  UserRound,
  Users,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import AppHeader, { APP_NAVIGATION_TABS, type AppTab } from "./components/layout/Header";
import DashboardTab from "./components/layout/DashboardTab";
import UserSidebar, {
  RECOMMENDATIONS_STORAGE_KEY_PREFIX,
} from "./components/layout/UserSidebar";
import AuthScreen from "./components/auth/AuthScreen";
import RequestPasswordResetScreen from "./components/auth/RequestPasswordResetScreen";
import EnterCodeScreen from "./components/auth/EnterCodeScreen";
import OscarPredictionsSection from "./components/movies/OscarPredictionsSection";
import PersonalMoviesSection from "./components/movies/PersonalMoviesSection";
import SeriesSection from "./components/series/SeriesSection";
import MovieDetailScreen from "./components/movies/MovieDetailScreen";
import SeriesDetailScreen from "./components/series/SeriesDetailScreen";
import PersonDetailScreen from "./components/people/PersonDetailScreen";
import HomeScreen from "./components/home/HomeScreen";
import UserDropdownMenu from "./components/layout/UserDropdownMenu";
import UserEventBell from "./components/layout/UserEventBell";
import ActivitiesScreen from "./components/layout/ActivitiesScreen";
import ImportTvTimePage from "./components/layout/ImportTvTimePage";
import { useAvatarMutation, useUsers } from "./hooks/useUsers";
import { useFavorites } from "./hooks/useFavorites";
import { usePersonalMovies } from "./hooks/usePersonalMovies";
import { useSeries } from "./hooks/useSeries";
import RankingScreen from "./components/layout/RankingScreen";
import GlobalSearch from "./components/layout/GlobalSearch";
import ProfileSummary from "./components/layout/ProfileSummary";
import AvatarDisplay from "./components/layout/AvatarDisplay";
import ProfilePageSkeleton from "./components/layout/ProfilePageSkeleton";
import ChangelogsScreen from "./components/layout/ChangelogsScreen";
import FaqScreen from "./components/layout/FaqScreen";
import LatestUpdatesSection from "./components/layout/LatestUpdatesSection";
import SmartStickySidebar from "./components/layout/SmartStickySidebar";
import ReviewsScreen from "./components/layout/ReviewsScreen";
import PublicHeader from "./components/public/PublicHeader";
import PublicFooter from "./components/public/PublicFooter";
import PublicHome from "./components/public/PublicHome";
import CatalogPage from "./components/public/CatalogPage";
import ProposalPage from "./components/public/ProposalPage";
import PublicDashboardLite from "./components/public/PublicDashboardLite";
import { notifyHeaderMenuOpen } from "./lib/headerMenu";
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
  listPublicRanking,
} from "./lib/appData";
import type { RankedUser, SessionUser } from "./types/app";

const SESSION_KEY = "letterboxmzz_session_v1";
const ADMIN_USERNAME = import.meta.env.VITE_OSCAR_ADMIN_USERNAME as
  string | undefined;

const PROFILE_NAV_ICONS: Record<AppTab, LucideIcon> = {
  home: House,
  movies: Film,
  series: Tv,
  reviews: Users,
  oscars: Award,
  dashboard: UserRound,
  personal: UserRound,
};

function readStoredSession(): SessionUser | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}

function App() {
  const [activeTab, setActiveTab] = useState<
    "home" | "dashboard" | "oscars" | "movies" | "series" | "reviews" | "personal"
  >("home");
  const storedSession = readStoredSession();
  const [session, setSession] = useState<SessionUser | null>(storedSession);
  const [location, setLocation] = useLocation();
  const [match, params] = useRoute("/:username");
  const [matchMovie, movieParams] = useRoute("/filme/:id");
  const [matchSerie, serieParams] = useRoute("/serie/:id");
  const [matchActor, actorParams] = useRoute("/actor/:id");
  const [matchDirector, directorParams] = useRoute("/director/:id");
  const [matchLegacyImport] = useRoute("/import-tvtime");
  const [matchImports] = useRoute("/imports");
  const matchImportTvTime = matchLegacyImport || matchImports;
  const [matchChangelogs] = useRoute("/changelogs");
  const [matchFaq] = useRoute("/faq");
  const [matchActivities] = useRoute("/atividades");
  const [matchRequestPasswordReset] = useRoute("/conta/esqueci-senha");
  const [matchMovies] = useRoute("/movies");
  const [matchMoviesPage, moviesPageParams] = useRoute("/movies/page/:page");
  const [matchSeriesCatalog] = useRoute("/series");
  const [matchSeriesPage, seriesPageParams] = useRoute("/series/page/:page");
  const [matchProposal] = useRoute("/proposta");
  const [matchContact] = useRoute("/contato");
  const [matchRegister] = useRoute("/cadastro");
  const [matchConfirmPasswordReset] = useRoute("/conta/resetar-senha");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authPending, setAuthPending] = useState(false);
  const [passwordResetError, setPasswordResetError] = useState<string | null>(
    null,
  );
  const [passwordResetPending, setPasswordResetPending] = useState(false);
  const [passwordResetSuccess, setPasswordResetSuccess] = useState(false);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);
  const [deleteProfilePending, setDeleteProfilePending] = useState(false);
  const [isMobileLayout, setIsMobileLayout] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 1024,
  );
  const [isNavigationDrawerOpen, setIsNavigationDrawerOpen] = useState(false);
  // If we have a stored session, skip the loading screen entirely
  const [isBootstrapping, setIsBootstrapping] = useState(!storedSession);

  const { favorites } = useFavorites(session?.id || "");

  const usersQuery = useUsers(Boolean(session));
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
              : "Nao foi possivel iniciar a aplicacao.";
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
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1023px)");
    const updateLayout = () => {
      setIsMobileLayout(mediaQuery.matches);
      if (!mediaQuery.matches) setIsNavigationDrawerOpen(false);
    };

    updateLayout();
    mediaQuery.addEventListener("change", updateLayout);
    return () => mediaQuery.removeEventListener("change", updateLayout);
  }, []);

  // Fix Radix UI overlay lock issues globally when Dialogs or Menus close
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "style") {
          const pointerEvents = document.body.style.pointerEvents;
          if (pointerEvents === "none") {
            const hasOpenModal = document.querySelector(
              '[role="dialog"], [role="menu"], [data-state="open"], .fixed.inset-0.bg-black\\/80',
            );
            if (!hasOpenModal) {
              document.body.style.pointerEvents = "";
            }
          }
        }
      });
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["style"],
    });
    return () => observer.disconnect();
  }, []);

  const users: RankedUser[] = usersQuery.data || [];
  const urlUsername = match ? params.username : null;
  const publicRankingQuery = useQuery({
    queryKey: ["public-ranking"],
    queryFn: listPublicRanking,
    staleTime: 30_000,
    enabled: location === "/" || (!session && Boolean(urlUsername)),
  });
  const publicRankingUsers: RankedUser[] = (publicRankingQuery.data || []).map(
    (user) => ({
      id: user.id,
      username: user.username,
      created_at: "",
      user_id: user.id,
      mcoins: user.totalPoints,
      rank: user.rank,
      avatar_id: user.avatarPath || "avatar_clapper",
      display_name: user.displayName || undefined,
    }),
  );
  const isAchievementsRoute =
    urlUsername === "conquistas" || urlUsername === "ranking";
  const viewedUser =
    matchChangelogs || matchFaq || matchActivities || isAchievementsRoute
      ? null
      : urlUsername
        ? users.find((user) => user.username === urlUsername) ||
          publicRankingUsers.find((user) => user.username === urlUsername) ||
          null
        : users.find((user) => user.id === session?.id) || null;

  const currentRankedUser = users.find((user) => user.id === session?.id);
  const contentUser = isAchievementsRoute ? currentRankedUser : viewedUser;
  const selectedUserId = session ? contentUser?.id || null : null;
  const { moviesQuery: personalMoviesQuery } =
    usePersonalMovies(selectedUserId);
  const { seriesQuery: userSeriesQuery } = useSeries(selectedUserId);
  const personalMovies = personalMoviesQuery.data || [];
  const userSeries = userSeriesQuery.data || [];
  const navigationUser = viewedUser ?? currentRankedUser;
  const isOwnDashboard = Boolean(
    session?.id && navigationUser?.id === session.id,
  );
  const canAccessOscars = Boolean(navigationUser);
  const isPersonRoute = Boolean(matchActor || matchDirector);
  const isProfileRoute = Boolean(
    viewedUser &&
    !matchMovie &&
    !matchSerie &&
    !isPersonRoute &&
    !matchImportTvTime &&
    !matchChangelogs &&
    !matchFaq &&
    !matchActivities &&
    !isAchievementsRoute,
  );

  useEffect(() => {
    if (urlUsername === "ranking") setLocation("/conquistas");
  }, [urlUsername, setLocation]);

  useEffect(() => {
    if (!canAccessOscars && activeTab === "oscars") {
      setActiveTab("dashboard");
    }
  }, [activeTab, canAccessOscars]);

  useEffect(() => {
    if (viewedUser && !isOwnDashboard && activeTab === "home") {
      setActiveTab("dashboard");
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
      setLocation(`/${nextSession.username}`);
      return;
    }

    localStorage.removeItem(SESSION_KEY);
    Object.keys(sessionStorage)
      .filter((key) => key.startsWith(RECOMMENDATIONS_STORAGE_KEY_PREFIX))
      .forEach((key) => sessionStorage.removeItem(key));
    setLocation("/");
  };

  const handleLogin = async (username: string, password: string) => {
    setAuthPending(true);
    setAuthError(null);

    try {
      const nextSession = await loginUser(username, password);
      persistSession(nextSession);
      await refetchUsers();
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Falha no login.");
    } finally {
      setAuthPending(false);
    }
  };

  const handleRegister = async (
    username: string,
    email: string,
    password: string,
  ) => {
    setAuthPending(true);
    setAuthError(null);

    try {
      const nextSession = await registerUser(username, email, password);
      persistSession(nextSession);
      await refetchUsers();
    } catch (error) {
      setAuthError(
        error instanceof Error ? error.message : "Falha no cadastro.",
      );
    } finally {
      setAuthPending(false);
    }
  };

  const handleLogout = () => {
    void logoutUser();
    persistSession(null);
    setActiveTab("dashboard");
    setAuthError(null);
  };

  const handleChangePassword = async (
    userId: string,
    current: string,
    next: string,
  ) => {
    await changePassword(userId, current, next);
  };

  const handleAdminReset = async (
    targetUsername: string,
    newPassword: string,
  ) => {
    await adminResetPassword(targetUsername, newPassword);
  };

  const handleDeleteProfile = async (currentPassword: string) => {
    if (!session?.id) {
      throw new Error("Nenhuma sessao ativa.");
    }

    setDeleteProfilePending(true);
    try {
      await deleteCurrentUser(session.id, currentPassword);
      persistSession(null);
      if (typeof window !== "undefined") {
        window.location.assign(
          import.meta.env.VITE_PUBLIC_APP_URL ?? "https://cinerats.vercel.app",
        );
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
      setPasswordResetError(
        error instanceof Error
          ? error.message
          : "Falha ao solicitar reset de senha.",
      );
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
      const nextSession = await confirmPasswordReset(
        email,
        code,
        password,
        confirmPassword,
      );
      persistSession(nextSession);
      await refetchUsers();
      setLocation(`/${nextSession.username}`);
    } catch (error) {
      setPasswordResetError(
        error instanceof Error ? error.message : "Falha ao redefinir senha.",
      );
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
          <h1 className="text-2xl uppercase tracking-[0.15em] text-red-200">
            Bootstrap falhou
          </h1>
          <p className="text-red-100/90 leading-relaxed">{bootstrapError}</p>
          <p className="text-sm text-red-100/70">
            Verifique se a API está rodando e tente novamente.
          </p>
        </div>
      </div>
    );
  }

  const isPublicRoute =
    location === "/" ||
    matchMovies ||
    matchMoviesPage ||
    matchSeriesCatalog ||
    matchSeriesPage ||
    matchProposal ||
    matchContact ||
    matchFaq ||
    matchRegister ||
    (!session && (matchMovie || matchSerie)) ||
    (!session && Boolean(viewedUser));

  if (isPublicRoute) {
    const publicContent =
      location === "/" ? (
        <PublicHome
          session={session}
          movies={personalMovies}
          series={userSeries}
          favoriteGenre={viewedUser?.favorite_genre}
        />
      ) : matchRegister ? (
        <AuthScreen
          onLogin={handleLogin}
          onRegister={handleRegister}
          error={authError}
          isPending={authPending}
          onForgotPassword={() => setLocation('/conta/esqueci-senha')}
          initialMode='register'
        />
      ) : matchMovies || matchMoviesPage ? (
        <CatalogPage
          type="movie"
          page={Math.max(1, Number(moviesPageParams?.page || 1))}
        />
      ) : matchSeriesCatalog || matchSeriesPage ? (
        <CatalogPage
          type="tv"
          page={Math.max(1, Number(seriesPageParams?.page || 1))}
        />
      ) : matchMovie ? (
        <main className="mx-auto w-full max-w-[1700px] px-3 py-8 sm:px-6 lg:py-12">
          <section className="overflow-hidden rounded-3xl border border-[#151b28] bg-[#06080d] p-4 sm:p-7 lg:p-9">
            <MovieDetailScreen
              id={movieParams.id}
              currentUserId={session?.id ?? null}
            />
          </section>
        </main>
      ) : matchSerie ? (
        <main className="mx-auto w-full max-w-[1700px] px-3 py-8 sm:px-6 lg:py-12">
          <section className="overflow-hidden rounded-3xl border border-[#151b28] bg-[#06080d] p-4 sm:p-7 lg:p-9">
            <SeriesDetailScreen
              id={serieParams.id}
              currentUserId={session?.id ?? null}
            />
          </section>
        </main>
      ) : matchProposal ? (
        <ProposalPage />
      ) : matchContact ? (
        <main className="mx-auto w-full max-w-4xl px-3 py-8 sm:px-6 lg:py-12">
          <section className="rounded-3xl border border-[#151b28] bg-[#06080d] p-7 sm:p-10">
            <p className="text-xs uppercase tracking-[0.25em] text-brand-gold-alt">
              Contato
            </p>
            <h1 className="mt-3 text-3xl font-light uppercase tracking-[0.08em]">
              Vamos conversar.
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-brand-text-muted">
              Dúvidas, ideias ou parcerias: escreva para{" "}
              <a
                className="text-brand-gold hover:underline"
                href="mailto:contato@cinerats.com"
              >
                contato@cinerats.com
              </a>
              .
            </p>
          </section>
        </main>
      ) : matchFaq ? (
        <main className="mx-auto w-full max-w-[1700px] px-3 py-8 sm:px-6">
          <section className="rounded-3xl border border-[#151b28] bg-[#06080d] p-4 sm:p-7">
            <FaqScreen />
          </section>
        </main>
      ) : viewedUser ? (
        <PublicDashboardLite user={viewedUser} />
      ) : null;
    if (!session && viewedUser) {
      return (
        <div className="min-h-screen bg-brand-bg text-brand-text">
          <PublicDashboardLite user={viewedUser} />
          <PublicFooter />
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-brand-bg text-brand-text">
        <PublicHeader
          session={session}
          searchSlot={
            <GlobalSearch
              users={users}
              onSelectUser={(id) => {
                const user = users.find((candidate) => candidate.id === id);
                if (user) setLocation(`/${user.username}`);
              }}
            />
          }
          onLogin={handleLogin}
          loginError={authError}
          loginPending={authPending}
        />
        {publicContent}
        <PublicFooter />
      </div>
    );
  }
  if (!session) {
    if (matchRequestPasswordReset) {
      return (
        <RequestPasswordResetScreen
          onSubmit={handleRequestPasswordReset}
          onBackToLogin={() => setLocation("/")}
          error={passwordResetError}
          isPending={passwordResetPending}
          success={passwordResetSuccess}
        />
      );
    }

    if (matchConfirmPasswordReset) {
      const searchParams = new URLSearchParams(window.location.search);
      const emailFromUrl = searchParams.get("email") || "";
      const codeFromUrl = searchParams.get("code") || "";

      // Se não tem email na URL, volta para tela de solicitar reset
      if (!emailFromUrl) {
        setLocation("/conta/esqueci-senha");
        return null;
      }

      return (
        <EnterCodeScreen
          onSubmit={handleConfirmPasswordReset}
          onBackToLogin={() => setLocation("/")}
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
        onForgotPassword={() => setLocation("/conta/esqueci-senha")}
        initialMode={matchRegister ? "register" : "login"}
      />
    );
  }

  const authenticatedSession = session;

  const selectUser = (id: string) => {
    const user = users.find((candidate) => candidate.id === id);
    if (user) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setLocation(`/${user.username}`);
    }
  };
  return (
    <div className="min-h-screen overflow-x-clip bg-brand-bg text-brand-text">
      <div className="mx-auto flex w-full max-w-[1700px] flex-col gap-6 px-3 pb-24 pt-0 sm:px-6 lg:px-8 lg:pb-6 lg:pt-0">
        <AppHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
          canAccessOscars={canAccessOscars}
          canAccessHome={isOwnDashboard}
          onGoHome={() => {
            setLocation("/");
          }}
          searchSlot={<GlobalSearch users={users} onSelectUser={selectUser} />}
          hideTabs
          rightSlot={
            !isMobileLayout && (
              <>
                <UserDropdownMenu
                  session={authenticatedSession}
                  currentRankedUser={currentRankedUser}
                  users={users}
                  favoriteUserIds={
                    favorites?.map((favorite) => favorite.favoriteUserId) || []
                  }
                  onLogout={handleLogout}
                  avatarMutationPending={avatarMutation.isPending}
                  adminUsername={ADMIN_USERNAME}
                  onChangePassword={handleChangePassword}
                  onAdminReset={handleAdminReset}
                  onSaveAvatar={async (avatarId, displayName) => {
                    await avatarMutation.mutateAsync({
                      userId: authenticatedSession.id,
                      avatarId,
                    });
                    if (displayName !== currentRankedUser?.display_name) {
                      await updateUserProfile(authenticatedSession.id, {
                        display_name: displayName,
                      });
                      await refetchUsers();
                    }
                  }}
                  onOpenPreferences={() => {
                    setActiveTab("dashboard");
                    setLocation(`/${authenticatedSession.username}`);
                  }}
                  onDeleteProfile={handleDeleteProfile}
                  deleteProfilePending={deleteProfilePending}
                />
                <UserEventBell
                  currentUserId={authenticatedSession.id}
                  viewedUserId={viewedUser?.id ?? authenticatedSession.id}
                  isOwnDashboard={isOwnDashboard}
                  friendIds={
                    favorites?.map((favorite) => favorite.favoriteUserId) || []
                  }
                />
                <button
                  type="button"
                  aria-label="Abrir CineMatch"
                  title="CineMatch"
                  onClick={() => {
                    notifyHeaderMenuOpen("cineMatch");
                    window.dispatchEvent(new Event("open-cinematch"));
                  }}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full text-white transition hover:bg-white/5 hover:text-brand-gold"
                >
                  <Shuffle size={20} />
                </button>
              </>
            )
          }
        />

        {usersQuery.isLoading ? (
          <ProfilePageSkeleton />
        ) : (
          <div
            className={
              isProfileRoute
                ? "grid grid-cols-1 gap-6 lg:grid-cols-[260px_minmax(0,1fr)_260px]"
                : "min-w-0"
            }
          >
            {isProfileRoute && viewedUser && (
              <aside className="contents lg:block lg:self-stretch">
                <SmartStickySidebar topGap={136} bottomGap={16} className="order-3 flex flex-col gap-5 lg:w-[260px]">
                  <div className="hidden lg:block">
                    <ProfileSummary
                      user={viewedUser}
                      currentUserId={authenticatedSession.id}
                      onSelectUser={selectUser}
                    />
                  </div>
                  <nav aria-label="Navegação do perfil" className="hidden flex-col rounded-2xl border border-[#151b28] bg-[#06080d] p-2 lg:flex">
                    {APP_NAVIGATION_TABS.filter((tab) => {
                      if (tab.id === "home") return isOwnDashboard;
                      if (tab.id === "oscars") return canAccessOscars;
                      return true;
                    }).map((tab) => {
                      const Icon = PROFILE_NAV_ICONS[tab.id];
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setActiveTab(tab.id)}
                          aria-current={activeTab === tab.id ? "page" : undefined}
                          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.14em] transition ${activeTab === tab.id ? "bg-brand-gold/12 text-brand-gold" : "text-brand-text-muted hover:bg-white/5 hover:text-brand-text"}`}
                        >
                          <Icon size={16} strokeWidth={1.8} />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => setLocation("/conquistas")}
                      className="mt-1 flex items-center gap-3 border-t border-white/10 px-3 pt-3 pb-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-text-muted transition hover:bg-white/5 hover:text-brand-text"
                    >
                      <Award size={16} strokeWidth={1.8} />
                      <span>Minhas Conquistas</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLocation("/changelogs")}
                      className="flex items-center gap-3 px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-text-muted transition hover:bg-white/5 hover:text-brand-text"
                    >
                      <History size={16} strokeWidth={1.8} />
                      <span>Changelogs</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLocation("/faq")}
                      className="flex items-center gap-3 px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-text-muted transition hover:bg-white/5 hover:text-brand-text"
                    >
                      <CircleHelp size={16} strokeWidth={1.8} />
                      <span>F.A.Q.</span>
                    </button>
                    <div className="mt-1 border-t border-white/10 pt-1">
                      <span className="flex items-center gap-3 px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-text-muted/70">
                        <BookOpen size={16} strokeWidth={1.8} />
                        <span>Blog CineRats (em breve)</span>
                      </span>
                      <span className="flex items-center gap-3 px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-text-muted/70">
                        <Users size={16} strokeWidth={1.8} />
                        <span>Grupos (em breve)</span>
                      </span>
                    </div>
                  </nav>
                  <div>
                  <UserSidebar
                    users={users}
                    currentUserId={authenticatedSession.id}
                    selectedUserId={selectedUserId || authenticatedSession.id}
                    onSelectUser={selectUser}
                    isOpen={false}
                    onClose={() => undefined}
                    section="discover"
                  />
                  </div>
                  <div className="hidden rounded-2xl border border-[#151b28] bg-[#06080d] px-4 py-4 text-xs text-brand-text-muted lg:block">
                  <p className="flex items-center gap-2">
                    <Film size={14} className="text-brand-gold-alt" />
                    CineRats • edumzz
                  </p>
                  <a
                    href="mailto:contato@cinerats.com"
                    className="mt-2 block transition hover:text-brand-gold"
                  >
                    contato@cinerats.com
                  </a>
                  </div>
                </SmartStickySidebar>
              </aside>
            )}

            <main
              className={`order-2 min-w-0 rounded-3xl border border-[#151b28] bg-[#06080d] p-4 lg:order-none sm:p-7 lg:p-9 ${matchMovie || matchSerie || isPersonRoute ? "overflow-hidden" : ""}`}
            >
              {matchActivities ? (
                <ActivitiesScreen
                  currentUserId={authenticatedSession.id}
                  viewedUserId={viewedUser?.id ?? authenticatedSession.id}
                  isOwnDashboard={isOwnDashboard}
                  friendIds={
                    favorites?.map((favorite) => favorite.favoriteUserId) || []
                  }
                />
              ) : matchFaq ? (
                <FaqScreen />
              ) : matchChangelogs ? (
                <ChangelogsScreen />
              ) : matchMovie ? (
                <MovieDetailScreen
                  id={movieParams.id}
                  currentUserId={session.id}
                />
              ) : matchSerie ? (
                <SeriesDetailScreen
                  id={serieParams.id}
                  currentUserId={session.id}
                />
              ) : matchActor ? (
                <PersonDetailScreen id={actorParams.id} mode="actor" />
              ) : matchDirector ? (
                <PersonDetailScreen id={directorParams.id} mode="director" />
              ) : matchImportTvTime ? (
                <ImportTvTimePage
                  currentUserId={session.id}
                  onBack={() =>
                    setLocation(`/${authenticatedSession.username}`)
                  }
                />
              ) : isAchievementsRoute && currentRankedUser ? (
                <RankingScreen
                  user={currentRankedUser}
                  users={users}
                  movies={personalMovies}
                  series={userSeries}
                  currentUserId={session.id}
                  isLoading={
                    personalMoviesQuery.isLoading || userSeriesQuery.isLoading
                  }
                />
              ) : urlUsername && !viewedUser ? (
                <div className="py-20 text-center text-brand-text-muted">
                  Usuário não encontrado.
                </div>
              ) : (
                viewedUser && (
                  <div className="animate-in fade-in duration-500">
                    {activeTab === "home" && isOwnDashboard ? (
                      <HomeScreen
                        userId={session.id}
                        movies={personalMovies}
                        series={userSeries}
                        favoriteGenre={viewedUser.favorite_genre}
                      />
                    ) : activeTab === "dashboard" ? (
                      <DashboardTab
                        user={viewedUser}
                        isOwnDashboard={isOwnDashboard}
                      />
                    ) : activeTab === "oscars" ? (
                      <OscarPredictionsSection
                        userId={viewedUser.id}
                        canEdit={isOwnDashboard}
                      />
                    ) : activeTab === "movies" ? (
                      <PersonalMoviesSection
                        userId={viewedUser.id}
                        canEdit={isOwnDashboard}
                        currentUserId={session.id}
                      />
                    ) : activeTab === "series" ? (
                      <SeriesSection
                        userId={viewedUser.id}
                        canEdit={isOwnDashboard}
                        currentUserId={session.id}
                      />
                    ) : activeTab === "reviews" ? (
                      <ReviewsScreen />
                    ) : (
                      <>
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
                      </>
                    )}
                  </div>
                )
              )}
            </main>

            {isProfileRoute && viewedUser && (
              <aside className="order-4 min-w-0 lg:self-stretch">
                <SmartStickySidebar topGap={136} bottomGap={16} className="flex flex-col gap-5">
                  <LatestUpdatesSection />
                  <UserSidebar
                    users={users}
                    currentUserId={session.id}
                    selectedUserId={selectedUserId || session.id}
                    onSelectUser={selectUser}
                    isOpen={false}
                    onClose={() => undefined}
                    section="ranking"
                  />
                </SmartStickySidebar>
              </aside>
            )}
          </div>
        )}

        <footer className="rounded-2xl border border-[#151b28] bg-[#06080d] px-4 py-4 text-center text-xs text-brand-text-muted lg:hidden">
          <p className="flex items-center justify-center gap-2">
            <Film size={14} className="text-brand-gold-alt" />
            CineRats • edumzz
          </p>
          <a
            href="mailto:contato@cinerats.com"
            className="mt-2 inline-block transition hover:text-brand-gold"
          >
            contato@cinerats.com
          </a>
        </footer>

      </div>
      {isMobileLayout && isNavigationDrawerOpen && (
        <div className="fixed inset-0 z-[60]">
          <button
            type="button"
            aria-label="Fechar navegação"
            className="absolute inset-0 bg-black/65 backdrop-blur-sm"
            onClick={() => setIsNavigationDrawerOpen(false)}
          />
          <aside
            aria-label="Navegação principal"
            role="dialog"
            aria-modal="true"
            className="relative flex h-full w-[min(26rem,calc(100vw-1rem))] flex-col overflow-y-auto overscroll-contain border-r border-[#151b28] bg-[#06080d] px-3 py-4 shadow-[20px_0_60px_rgba(0,0,0,0.4)]"
          >
            <div className="mb-4 flex items-center justify-between px-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-gold">Navegação</span>
              <button
                type="button"
                aria-label="Fechar navegação"
                onClick={() => setIsNavigationDrawerOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-brand-text-muted transition hover:bg-white/5 hover:text-brand-text"
              >
                <X size={18} />
              </button>
            </div>
            {currentRankedUser && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab("dashboard");
                  setLocation(`/${authenticatedSession.username}`);
                  setIsNavigationDrawerOpen(false);
                }}
                className="mb-4 flex items-center gap-3 rounded-2xl border border-[#151b28] bg-white/[0.03] p-3 text-left transition hover:bg-white/[0.06]"
              >
                <AvatarDisplay
                  avatarId={currentRankedUser.avatar_id}
                  className="h-14 w-14 border-2 border-brand-gold"
                  emojiClassName="text-2xl"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-brand-text">
                    {currentRankedUser.display_name || authenticatedSession.username}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-brand-text-muted">
                    @{authenticatedSession.username}
                  </span>
                  <span className="mt-1.5 inline-block text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-gold">
                    {currentRankedUser.mcoins} MC
                  </span>
                </span>
              </button>
            )}
            <nav className="flex flex-col gap-1">
              {APP_NAVIGATION_TABS.filter((tab) => {
                if (tab.id === "home") return isOwnDashboard;
                if (tab.id === "oscars") return canAccessOscars;
                return true;
              }).map((tab) => {
                const Icon = PROFILE_NAV_ICONS[tab.id];
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id);
                      setLocation(`/${authenticatedSession.username}`);
                      setIsNavigationDrawerOpen(false);
                    }}
                    aria-current={activeTab === tab.id ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] transition ${activeTab === tab.id ? "bg-brand-gold/12 text-brand-gold" : "text-brand-text-muted hover:bg-white/5 hover:text-brand-text"}`}
                  >
                    <Icon size={17} strokeWidth={1.8} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => {
                  setLocation("/conquistas");
                  setIsNavigationDrawerOpen(false);
                }}
                className="mt-2 flex items-center gap-3 border-t border-white/10 px-3 pt-4 pb-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-text-muted transition hover:bg-white/5 hover:text-brand-text"
              >
                <Award size={17} strokeWidth={1.8} />
                <span>Minhas Conquistas</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setLocation("/changelogs");
                  setIsNavigationDrawerOpen(false);
                }}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-text-muted transition hover:bg-white/5 hover:text-brand-text"
              >
                <History size={17} strokeWidth={1.8} />
                <span>Changelogs</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setLocation("/faq");
                  setIsNavigationDrawerOpen(false);
                }}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-text-muted transition hover:bg-white/5 hover:text-brand-text"
              >
                <CircleHelp size={17} strokeWidth={1.8} />
                <span>F.A.Q.</span>
              </button>
              <div className="mt-2 border-t border-white/10 pt-2">
                <span className="flex items-center gap-3 px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-text-muted/70">
                  <BookOpen size={17} strokeWidth={1.8} />
                  <span>Blog CineRats (em breve)</span>
                </span>
                <span className="flex items-center gap-3 px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-text-muted/70">
                  <Users size={17} strokeWidth={1.8} />
                  <span>Grupos (em breve)</span>
                </span>
              </div>
            </nav>
          </aside>
        </div>
      )}
      {isMobileLayout && (
        <nav
          aria-label="Ações rápidas"
          className="fixed inset-x-0 bottom-0 z-40 border-t border-[#151b28] bg-[#06080d]/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_36px_rgba(0,0,0,0.25)] backdrop-blur"
        >
          <div className="mx-auto flex max-w-md items-center justify-around">
            <button
              type="button"
              onClick={() => setIsNavigationDrawerOpen(true)}
              aria-label="Abrir navegação"
              title="Navegação"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full text-white transition hover:bg-white/5 hover:text-brand-gold"
            >
              <Menu size={20} />
            </button>
            <UserDropdownMenu
              session={authenticatedSession}
              currentRankedUser={currentRankedUser}
              users={users}
              favoriteUserIds={
                favorites?.map((favorite) => favorite.favoriteUserId) || []
              }
              onLogout={handleLogout}
              avatarMutationPending={avatarMutation.isPending}
              adminUsername={ADMIN_USERNAME}
              onChangePassword={handleChangePassword}
              onAdminReset={handleAdminReset}
              onSaveAvatar={async (avatarId, displayName) => {
                await avatarMutation.mutateAsync({
                  userId: authenticatedSession.id,
                  avatarId,
                });
                if (displayName !== currentRankedUser?.display_name) {
                  await updateUserProfile(authenticatedSession.id, {
                    display_name: displayName,
                  });
                  await refetchUsers();
                }
              }}
              onOpenPreferences={() => {
                setActiveTab("dashboard");
                setLocation(`/${authenticatedSession.username}`);
              }}
              onDeleteProfile={handleDeleteProfile}
              deleteProfilePending={deleteProfilePending}
            />
            <UserEventBell
              currentUserId={authenticatedSession.id}
              viewedUserId={viewedUser?.id ?? authenticatedSession.id}
              isOwnDashboard={isOwnDashboard}
              friendIds={
                favorites?.map((favorite) => favorite.favoriteUserId) || []
              }
            />
            <button
              type="button"
              aria-label="Abrir CineMatch"
              title="CineMatch"
              onClick={() => {
                notifyHeaderMenuOpen("cineMatch");
                window.dispatchEvent(new Event("open-cinematch"));
              }}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full text-white transition hover:bg-white/5 hover:text-brand-gold"
            >
              <Shuffle size={20} />
            </button>
          </div>
        </nav>
      )}
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
