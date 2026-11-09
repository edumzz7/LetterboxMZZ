# Graph Report - CineRats  (2026-09-26)

## Corpus Check
- 99 files · ~243,884 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 773 nodes · 1855 edges · 37 communities (33 shown, 4 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 17 edges (avg confidence: 0.78)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `28db8b0b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ImportTvTimePage.tsx
- localData.ts
- useSeries.ts
- devDependencies
- withFallback
- compilerOptions
- App.tsx
- compilerOptions
- SeriesCard.tsx
- HomeScreen.tsx
- UserSidebar.tsx
- tmdb.ts
- appData.ts
- ErrorBoundary
- app.ts
- dependencies
- React + TypeScript + Vite
- PlatformSelect.tsx
- MovieCard.tsx
- UserEventBell.tsx
- tsconfig.json
- vercel.json
- CineRats — Guia de Design
- useReviews.ts
- PersonDetailScreen.tsx
- CatalogPage.tsx
- ReviewModal.tsx
- SeriesDetailScreen.tsx
- generateImagePath
- RankingScreen.tsx
- ChangelogsScreen.tsx
- FaqScreen.tsx
- Instruções para agentes de IA
- ConfirmPasswordResetScreen.tsx
- MovieDetailScreen.tsx

## God Nodes (most connected - your core abstractions)
1. `withFallback()` - 45 edges
2. `RankedUser` - 27 edges
3. `PersonalMovie` - 23 edges
4. `App()` - 21 edges
5. `requireSession()` - 20 edges
6. `compilerOptions` - 20 edges
7. `addActivity()` - 18 edges
8. `deleteCurrentUser()` - 18 edges
9. `SeriesEntry` - 18 edges
10. `compilerOptions` - 18 edges

## Surprising Connections (you probably didn't know these)
- `App()` --indirect_call--> `listPublicRanking()`  [INFERRED]
  src/App.tsx → src/lib/appData.ts
- `DashboardTabProps` --references--> `RankedUser`  [EXTRACTED]
  src/components/layout/DashboardTab.tsx → src/types/app.ts
- `UserSidebarProps` --references--> `RankedUser`  [EXTRACTED]
  src/components/layout/UserSidebar.tsx → src/types/app.ts
- `useUsers()` --indirect_call--> `listRankedUsers()`  [INFERRED]
  src/hooks/useUsers.ts → src/lib/appData.ts
- `App()` --calls--> `useFavorites()`  [EXTRACTED]
  src/App.tsx → src/hooks/useFavorites.ts

## Import Cycles
- None detected.

## Communities (37 total, 4 thin omitted)

### Community 0 - "ImportTvTimePage.tsx"
Cohesion: 0.16
Nodes (19): Props, ImportTvTimePage(), download(), platforms, Props, statuses, StatusIcon(), isActiveImport() (+11 more)

### Community 1 - "localData.ts"
Cohesion: 0.07
Nodes (91): encoder, hashPassword(), normalizeUsername(), DEFAULT_EDUMZZ_SERIES, DEFAULT_OSCAR_MOVIES, LegacyMovie, LegacySeries, readLegacyMovieData() (+83 more)

### Community 2 - "useSeries.ts"
Cohesion: 0.18
Nodes (14): useSeriesMutations(), useSeriesQuery(), addSeries(), createSeriesWatchEntries(), deleteSeries(), getSeriesStatus(), listSeries(), rateSeries() (+6 more)

### Community 3 - "devDependencies"
Cohesion: 0.06
Nodes (34): eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, devDependencies, eslint, @eslint/js (+26 more)

### Community 4 - "withFallback"
Cohesion: 0.20
Nodes (18): App(), runBootstrap(), readStoredSession(), adminResetPassword(), changePassword(), clearAppDataCache(), confirmPasswordReset(), deleteCurrentUser() (+10 more)

### Community 5 - "compilerOptions"
Cohesion: 0.07
Nodes (26): DOM, DOM.Iterable, src, vite/client, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, jsx (+18 more)

### Community 6 - "App.tsx"
Cohesion: 0.09
Nodes (20): ADMIN_USERNAME, PROFILE_NAV_ICONS, AuthScreen(), AuthScreenProps, Mode, EnterCodeScreen(), EnterCodeScreenProps, RequestPasswordResetScreen() (+12 more)

### Community 7 - "compilerOptions"
Cohesion: 0.09
Nodes (22): node, vite.config.ts, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection (+14 more)

### Community 8 - "SeriesCard.tsx"
Cohesion: 0.24
Nodes (14): AddSeriesDialog(), AddSeriesDialogProps, SeriesCard(), SeriesCardProps, SeriesSectionProps, Series, updateSeriesStreaming(), getTvDetails() (+6 more)

### Community 9 - "HomeScreen.tsx"
Cohesion: 0.07
Nodes (41): HomeScreen(), MediaType, toHomeMedia(), WatchedSeed, DashboardTab(), DashboardTabProps, formatDate(), PreferenceSearchInput() (+33 more)

### Community 10 - "UserSidebar.tsx"
Cohesion: 0.16
Nodes (17): formatSidebarDate(), RECOMMENDATIONS_STORAGE_KEY_PREFIX, SidebarMediaItem(), SidebarMediaItemData, toSidebarMediaItems(), UserSidebar(), UserSidebarProps, MovieCardProps (+9 more)

### Community 11 - "tmdb.ts"
Cohesion: 0.10
Nodes (26): SimilarMediaSection(), SimilarMediaSectionProps, SynopsisModal(), SynopsisModalProps, CachedHomeCatalog, FAVORITE_GENRE_MIN_RATING, getDetailsWithOverviewFallback(), getMediaDetailsMatchingTitle() (+18 more)

### Community 12 - "appData.ts"
Cohesion: 0.11
Nodes (21): useNotifications(), useAvatarMutation(), apiClient, activityMessage(), ApiActivity, ApiSeriesWatchEntry, AVATAR_IDS, categoryFromApi (+13 more)

### Community 13 - "ErrorBoundary"
Cohesion: 0.25
Nodes (3): ErrorBoundary, ErrorBoundaryProps, ErrorBoundaryState

### Community 14 - "app.ts"
Cohesion: 0.06
Nodes (50): AdminPanel(), AdminPanelProps, AvatarDisplay(), AvatarDisplayProps, ChangePasswordModal(), ChangePasswordModalProps, CineMatchModal(), CineMatchModalProps (+42 more)

### Community 15 - "dependencies"
Cohesion: 0.05
Nodes (41): axios, clsx, embla-carousel-react, html2canvas, lucide-react, @microsoft/clarity, motion, dependencies (+33 more)

### Community 16 - "React + TypeScript + Vite"
Cohesion: 0.50
Nodes (3): Expanding the ESLint configuration, React Compiler, React + TypeScript + Vite

### Community 18 - "MovieCard.tsx"
Cohesion: 0.21
Nodes (13): AddMovieDialog(), AddMovieDialogProps, CardMovie, MovieCard(), parseProviders(), parseTmdbFromSource(), ProviderItem, updatePersonalMovieStreaming() (+5 more)

### Community 19 - "UserEventBell.tsx"
Cohesion: 0.19
Nodes (14): ActivitiesScreen(), ActivitiesScreenProps, formatTimestamp(), UserDropdownMenu(), formatTimestamp(), readSeenTimestamp(), UserEventBell(), UserEventBellProps (+6 more)

### Community 22 - "CineRats — Guia de Design"
Cohesion: 0.10
Nodes (20): 10. Receita para novas telas, 11. Consistência de implementação, 1. Identidade visual, 2. Tokens de cor, 3. Tipografia, 4. Espaçamento, dimensão e proporção, 5. Bordas, raios e elevação, 6. Layout e responsividade (+12 more)

### Community 24 - "useReviews.ts"
Cohesion: 0.27
Nodes (10): formatDate(), ReviewsScreen(), useDeleteReviewMutation(), useMediaReviews(), usePublicReviews(), useUserReviews(), deleteReview(), listMediaReviews() (+2 more)

### Community 25 - "PersonDetailScreen.tsx"
Cohesion: 0.33
Nodes (8): getAge(), getCreditDate(), getCreditTitle(), PersonDetailScreen(), PersonDetailScreenProps, PersonPageMode, getPersonDetailsWithCredits(), TMDBCombinedCredit

### Community 27 - "CatalogPage.tsx"
Cohesion: 0.19
Nodes (10): CatalogPage(), CatalogPageProps, CERTIFICATIONS, LANGUAGES, PROVIDERS, SORT_OPTIONS, toggle(), CatalogFilters (+2 more)

### Community 28 - "ReviewModal.tsx"
Cohesion: 0.32
Nodes (10): ReviewModal(), ReviewModalProps, StarRatingInput(), StarRatingInputProps, canEarnPointsForReview(), getReviewDeadlineHours(), getReviewDeadlineMessage(), MIN_REVIEW_LENGTH (+2 more)

### Community 29 - "SeriesDetailScreen.tsx"
Cohesion: 0.27
Nodes (10): WatchedTimingDialog(), WatchedTimingDialogProps, SeriesDetailScreen(), SeriesDetailScreenProps, getSeriesCineratsStats(), getTvCredits(), getTvSeasonEpisodes(), getTvSimilarWithFallback() (+2 more)

### Community 30 - "generateImagePath"
Cohesion: 0.36
Nodes (7): SharedItem, ShareReviewModal(), ShareReviewModalProps, waitForRenderedImages(), withTimeout(), useSeries(), generateImagePath()

### Community 34 - "RankingScreen.tsx"
Cohesion: 0.07
Nodes (53): HomeScreenProps, AchievementIcon(), getIcon(), getLongestStreak(), LEVEL_META, MCOIN_RULES, RankingScreen(), RankingScreenProps (+45 more)

### Community 36 - "ChangelogsScreen.tsx"
Cohesion: 0.31
Nodes (6): ChangelogsScreen(), formatDate(), LatestUpdatesSection(), ChangelogEntry, ChangelogLinkItem, CHANGELOGS

### Community 37 - "FaqScreen.tsx"
Cohesion: 0.40
Nodes (5): FAQ_SECTIONS, FaqItem, FaqScreen(), FaqSection, normalizeSearchValue()

### Community 38 - "Instruções para agentes de IA"
Cohesion: 0.50
Nodes (3): Atualização do grafo, Graphify, Instruções para agentes de IA

### Community 40 - "MovieDetailScreen.tsx"
Cohesion: 0.22
Nodes (14): MovieDetailScreen(), MovieDetailScreenProps, PersonalMoviesSection(), PersonalMoviesSectionProps, usePersonalMovies(), useSocialActions(), useUsers(), getMovieCineratsStats() (+6 more)

## Knowledge Gaps
- **204 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+199 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `RankedUser` connect `app.ts` to `localData.ts`, `RankingScreen.tsx`, `App.tsx`, `HomeScreen.tsx`, `UserSidebar.tsx`, `appData.ts`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Why does `PersonalMovie` connect `RankingScreen.tsx` to `localData.ts`, `MovieDetailScreen.tsx`, `HomeScreen.tsx`, `UserSidebar.tsx`, `appData.ts`, `app.ts`, `MovieCard.tsx`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Why does `SeriesEntry` connect `RankingScreen.tsx` to `localData.ts`, `useSeries.ts`, `SeriesCard.tsx`, `HomeScreen.tsx`, `appData.ts`, `app.ts`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _204 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `localData.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07000686341798215 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._