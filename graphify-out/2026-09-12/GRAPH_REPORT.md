# Graph Report - CineRats  (2026-09-12)

## Corpus Check
- 95 files · ~243,834 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 740 nodes · 1801 edges · 35 communities (31 shown, 4 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9ff2a4b2`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- appData.ts
- localData.ts
- MovieDetailScreen.tsx
- devDependencies
- AvatarDisplay.tsx
- compilerOptions
- MovieDetailScreen
- compilerOptions
- CatalogPage.tsx
- App.tsx
- usePersonalMovies.ts
- ErrorBoundary
- UserDropdownMenu.tsx
- dependencies
- React + TypeScript + Vite
- PlatformSelect.tsx
- app.ts
- tmdb.ts
- tsconfig.json
- vercel.json
- CineRats — Guia de Design
- withFallback
- PersonDetailScreen.tsx
- DashboardTab.tsx
- useImportTvTime.ts
- ChangelogsScreen.tsx
- FaqScreen.tsx
- Instruções para agentes de IA
- ConfirmPasswordResetScreen.tsx
- useSeries.ts
- useFavorites.ts
- tmdbCache.ts
- MovieCard.tsx

## God Nodes (most connected - your core abstractions)
1. `withFallback()` - 44 edges
2. `RankedUser` - 27 edges
3. `PersonalMovie` - 26 edges
4. `App()` - 21 edges
5. `SeriesEntry` - 21 edges
6. `requireSession()` - 20 edges
7. `compilerOptions` - 20 edges
8. `addActivity()` - 18 edges
9. `deleteCurrentUser()` - 18 edges
10. `compilerOptions` - 18 edges

## Surprising Connections (you probably didn't know these)
- `AdminPanelProps` --references--> `RankedUser`  [EXTRACTED]
  src/components/layout/AdminPanel.tsx → src/types/app.ts
- `DashboardTabProps` --references--> `RankedUser`  [EXTRACTED]
  src/components/layout/DashboardTab.tsx → src/types/app.ts
- `GlobalSearchProps` --references--> `RankedUser`  [EXTRACTED]
  src/components/layout/GlobalSearch.tsx → src/types/app.ts
- `UserSidebarProps` --references--> `RankedUser`  [EXTRACTED]
  src/components/layout/UserSidebar.tsx → src/types/app.ts
- `PublicHome()` --indirect_call--> `listPublicRanking()`  [INFERRED]
  src/components/public/PublicHome.tsx → src/lib/appData.ts

## Import Cycles
- None detected.

## Communities (35 total, 4 thin omitted)

### Community 0 - "appData.ts"
Cohesion: 0.14
Nodes (16): useNotifications(), apiClient, activityMessage(), ApiActivity, ApiSeriesWatchEntry, AVATAR_IDS, categoryFromApi, categoryToApi (+8 more)

### Community 1 - "localData.ts"
Cohesion: 0.08
Nodes (87): encoder, hashPassword(), normalizeUsername(), readLegacyMovieData(), readLegacySeriesData(), addActivity(), addFavorite(), addOscarMovie() (+79 more)

### Community 2 - "MovieDetailScreen.tsx"
Cohesion: 0.09
Nodes (38): SharedItem, ShareReviewModal(), ShareReviewModalProps, MovieDetailScreenProps, WatchedTimingDialog(), WatchedTimingDialogProps, AddSeriesDialog(), AddSeriesDialogProps (+30 more)

### Community 3 - "devDependencies"
Cohesion: 0.06
Nodes (34): eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, devDependencies, eslint, @eslint/js (+26 more)

### Community 4 - "AvatarDisplay.tsx"
Cohesion: 0.22
Nodes (10): AvatarDisplay(), AvatarDisplayProps, ProfileAvatarModal(), ProfileAvatarModalProps, uploadAvatarImage(), AVATAR_OPTIONS, avatarEmoji(), CUSTOM_AVATAR_PREFIX (+2 more)

### Community 5 - "compilerOptions"
Cohesion: 0.07
Nodes (26): DOM, DOM.Iterable, src, vite/client, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, jsx (+18 more)

### Community 6 - "MovieDetailScreen"
Cohesion: 0.24
Nodes (9): MovieDetailScreen(), SeriesDetailScreen(), useAvatarMutation(), useAvatarUploadMutation(), useUsers(), getMovieCineratsStats(), getSeriesCineratsStats(), listMediaReviews() (+1 more)

### Community 7 - "compilerOptions"
Cohesion: 0.09
Nodes (22): node, vite.config.ts, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection (+14 more)

### Community 8 - "CatalogPage.tsx"
Cohesion: 0.20
Nodes (9): CatalogPage(), CatalogPageProps, LANGUAGES, MOVIE_GENRES, PROVIDERS, toggle(), TV_GENRES, CatalogFilters (+1 more)

### Community 9 - "App.tsx"
Cohesion: 0.09
Nodes (25): ADMIN_USERNAME, App(), runBootstrap(), readStoredSession(), AuthScreen(), AuthScreenProps, Mode, EnterCodeScreen() (+17 more)

### Community 10 - "usePersonalMovies.ts"
Cohesion: 0.46
Nodes (7): usePersonalMovieMutations(), usePersonalMovies(), usePersonalMoviesQuery(), addPersonalMovie(), deletePersonalMovie(), listPersonalMovies(), updatePersonalMovie()

### Community 13 - "ErrorBoundary"
Cohesion: 0.25
Nodes (3): ErrorBoundary, ErrorBoundaryProps, ErrorBoundaryState

### Community 14 - "UserDropdownMenu.tsx"
Cohesion: 0.09
Nodes (24): AdminPanel(), AdminPanelProps, ChangePasswordModal(), ChangePasswordModalProps, CineMatchModal(), CineMatchModalProps, SuggestMovieModalProps, UserDropdownMenuProps (+16 more)

### Community 15 - "dependencies"
Cohesion: 0.05
Nodes (41): axios, clsx, embla-carousel-react, html2canvas, lucide-react, @microsoft/clarity, motion, dependencies (+33 more)

### Community 16 - "React + TypeScript + Vite"
Cohesion: 0.50
Nodes (3): Expanding the ESLint configuration, React Compiler, React + TypeScript + Vite

### Community 18 - "app.ts"
Cohesion: 0.06
Nodes (65): HomeScreenProps, Header(), HeaderProps, ProfileSummaryProps, AchievementIcon(), getIcon(), getLongestStreak(), LEVEL_META (+57 more)

### Community 19 - "tmdb.ts"
Cohesion: 0.06
Nodes (65): HomeScreen(), MediaType, toHomeMedia(), WatchedSeed, buildRecommendations(), entryWeight(), getRecommendationSeeds(), normalizeTitle() (+57 more)

### Community 22 - "CineRats — Guia de Design"
Cohesion: 0.10
Nodes (20): 10. Receita para novas telas, 11. Consistência de implementação, 1. Identidade visual, 2. Tokens de cor, 3. Tipografia, 4. Espaçamento, dimensão e proporção, 5. Bordas, raios e elevação, 6. Layout e responsividade (+12 more)

### Community 24 - "withFallback"
Cohesion: 0.25
Nodes (11): createSessionVariant(), UserSidebar(), clearAppDataCache(), confirmPasswordReset(), deleteCurrentUser(), getAnticipatedMovies(), getTrendingMovies(), isBackendUnavailable() (+3 more)

### Community 25 - "PersonDetailScreen.tsx"
Cohesion: 0.33
Nodes (8): getAge(), getCreditDate(), getCreditTitle(), PersonDetailScreen(), PersonDetailScreenProps, PersonPageMode, getPersonDetailsWithCredits(), TMDBCombinedCredit

### Community 28 - "DashboardTab.tsx"
Cohesion: 0.14
Nodes (17): DashboardTab(), DashboardTabProps, formatDate(), PreferenceSearchInput(), PreferenceSearchInputProps, PreferenceSearchItem, useDeleteReviewMutation(), useMediaReviews() (+9 more)

### Community 30 - "useImportTvTime.ts"
Cohesion: 0.22
Nodes (12): ImportTvTimeModal(), ImportTvTimeModalProps, ImportTvTimePage(), ImportTvTimePageProps, useImportTvTime(), DataImport, downloadImportErrorsCSV(), getImportErrors() (+4 more)

### Community 36 - "ChangelogsScreen.tsx"
Cohesion: 0.38
Nodes (5): ChangelogsScreen(), formatDate(), ChangelogEntry, ChangelogLinkItem, CHANGELOGS

### Community 37 - "FaqScreen.tsx"
Cohesion: 0.40
Nodes (5): FAQ_SECTIONS, FaqItem, FaqScreen(), FaqSection, normalizeSearchValue()

### Community 38 - "Instruções para agentes de IA"
Cohesion: 0.50
Nodes (3): Atualização do grafo, Graphify, Instruções para agentes de IA

### Community 41 - "useSeries.ts"
Cohesion: 0.27
Nodes (13): SeriesSection(), useSeries(), useSeriesMutations(), useSeriesQuery(), addSeries(), createSeriesWatchEntries(), deleteSeries(), getSeriesStatus() (+5 more)

### Community 42 - "useFavorites.ts"
Cohesion: 0.36
Nodes (7): ProfileSummary(), FAVORITES_QUERY_KEY, useFavorites(), addFavorite(), listFavorites(), removeFavorite(), UserFavorite

### Community 43 - "tmdbCache.ts"
Cohesion: 0.33
Nodes (3): TMDBTvDetails, CachedTvDetails, clearOldestCaches()

### Community 44 - "MovieCard.tsx"
Cohesion: 0.10
Nodes (27): GlobalSearch(), GlobalSearchProps, SuggestMovieModal(), AddMovieDialog(), AddMovieDialogProps, CardMovie, MovieCard(), MovieCardProps (+19 more)

## Knowledge Gaps
- **195 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+190 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `RankedUser` connect `app.ts` to `appData.ts`, `localData.ts`, `AvatarDisplay.tsx`, `App.tsx`, `MovieCard.tsx`, `UserDropdownMenu.tsx`, `tmdb.ts`, `DashboardTab.tsx`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Why does `PersonalMovie` connect `app.ts` to `appData.ts`, `localData.ts`, `usePersonalMovies.ts`, `MovieCard.tsx`, `tmdb.ts`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Why does `SeriesEntry` connect `app.ts` to `appData.ts`, `localData.ts`, `MovieDetailScreen.tsx`, `useSeries.ts`, `tmdb.ts`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _195 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `appData.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1368421052631579 - nodes in this community are weakly interconnected._
- **Should `localData.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07609805924412666 - nodes in this community are weakly interconnected._
- **Should `MovieDetailScreen.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08816326530612245 - nodes in this community are weakly interconnected._