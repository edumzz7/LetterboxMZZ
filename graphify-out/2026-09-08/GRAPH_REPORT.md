# Graph Report - CineRats  (2026-09-08)

## Corpus Check
- 94 files · ~188,533 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 726 nodes · 1760 edges · 29 communities (24 shown, 5 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 10 edges (avg confidence: 0.8)
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
- AuthScreen.tsx
- compilerOptions
- app.ts
- compilerOptions
- CatalogPage.tsx
- App.tsx
- UserDropdownMenu.tsx
- ErrorBoundary
- dependencies
- React + TypeScript + Vite
- PlatformSelect.tsx
- tmdb.ts
- tsconfig.json
- vercel.json
- CineRats — Guia de Design
- useFavorites.ts
- DashboardTab.tsx
- useImportTvTime.ts
- useSeries.ts
- ChangelogsScreen.tsx
- FaqScreen.tsx
- Instruções para agentes de IA
- ConfirmPasswordResetScreen.tsx

## God Nodes (most connected - your core abstractions)
1. `withFallback()` - 44 edges
2. `RankedUser` - 28 edges
3. `PersonalMovie` - 26 edges
4. `SeriesEntry` - 21 edges
5. `App()` - 20 edges
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
- `useUsers()` --indirect_call--> `listRankedUsers()`  [INFERRED]
  src/hooks/useUsers.ts → src/lib/appData.ts

## Import Cycles
- None detected.

## Communities (29 total, 5 thin omitted)

### Community 0 - "appData.ts"
Cohesion: 0.14
Nodes (17): useNotifications(), useAvatarMutation(), useAvatarUploadMutation(), apiClient, activityMessage(), ApiActivity, AVATAR_IDS, categoryFromApi (+9 more)

### Community 1 - "localData.ts"
Cohesion: 0.07
Nodes (93): encoder, hashPassword(), normalizeUsername(), DEFAULT_EDUMZZ_SERIES, DEFAULT_OSCAR_MOVIES, LegacyMovie, LegacySeries, readLegacyMovieData() (+85 more)

### Community 2 - "MovieDetailScreen.tsx"
Cohesion: 0.06
Nodes (61): SharedItem, ShareReviewModal(), ShareReviewModalProps, AddMovieDialog(), AddMovieDialogProps, CardMovie, MovieCard(), MovieCardProps (+53 more)

### Community 3 - "devDependencies"
Cohesion: 0.06
Nodes (34): eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, devDependencies, eslint, @eslint/js (+26 more)

### Community 4 - "AuthScreen.tsx"
Cohesion: 0.50
Nodes (3): AuthScreen(), AuthScreenProps, Mode

### Community 5 - "compilerOptions"
Cohesion: 0.07
Nodes (26): DOM, DOM.Iterable, src, vite/client, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, jsx (+18 more)

### Community 6 - "app.ts"
Cohesion: 0.07
Nodes (57): HomeScreenProps, ProfileSummaryProps, AchievementIcon(), getIcon(), getLongestStreak(), LEVEL_META, MCOIN_RULES, RankingScreen() (+49 more)

### Community 7 - "compilerOptions"
Cohesion: 0.09
Nodes (22): node, vite.config.ts, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection (+14 more)

### Community 8 - "CatalogPage.tsx"
Cohesion: 0.12
Nodes (15): CatalogPage(), CatalogPageProps, LANGUAGES, MOVIE_GENRES, PROVIDERS, toggle(), TV_GENRES, CatalogFilters (+7 more)

### Community 9 - "App.tsx"
Cohesion: 0.11
Nodes (26): ADMIN_USERNAME, App(), runBootstrap(), readStoredSession(), EnterCodeScreen(), EnterCodeScreenProps, RequestPasswordResetScreen(), RequestPasswordResetScreenProps (+18 more)

### Community 12 - "UserDropdownMenu.tsx"
Cohesion: 0.06
Nodes (41): AdminPanel(), AdminPanelProps, AvatarDisplay(), AvatarDisplayProps, ChangePasswordModal(), ChangePasswordModalProps, CineMatchModal(), CineMatchModalProps (+33 more)

### Community 15 - "dependencies"
Cohesion: 0.05
Nodes (41): axios, clsx, embla-carousel-react, html2canvas, lucide-react, @microsoft/clarity, motion, dependencies (+33 more)

### Community 16 - "React + TypeScript + Vite"
Cohesion: 0.50
Nodes (3): Expanding the ESLint configuration, React Compiler, React + TypeScript + Vite

### Community 19 - "tmdb.ts"
Cohesion: 0.05
Nodes (71): HomeScreen(), MediaType, toHomeMedia(), WatchedSeed, buildRecommendations(), entryWeight(), getRecommendationSeeds(), normalizeTitle() (+63 more)

### Community 22 - "CineRats — Guia de Design"
Cohesion: 0.10
Nodes (20): 10. Receita para novas telas, 11. Consistência de implementação, 1. Identidade visual, 2. Tokens de cor, 3. Tipografia, 4. Espaçamento, dimensão e proporção, 5. Bordas, raios e elevação, 6. Layout e responsividade (+12 more)

### Community 24 - "useFavorites.ts"
Cohesion: 0.21
Nodes (11): ProfileSummary(), createSessionVariant(), UserSidebar(), FAVORITES_QUERY_KEY, useFavorites(), addFavorite(), getAnticipatedMovies(), getTrendingMovies() (+3 more)

### Community 28 - "DashboardTab.tsx"
Cohesion: 0.13
Nodes (21): DashboardTab(), DashboardTabProps, formatDate(), PreferenceSearchInput(), PreferenceSearchInputProps, PreferenceSearchItem, useDeleteReviewMutation(), useMediaReviews() (+13 more)

### Community 30 - "useImportTvTime.ts"
Cohesion: 0.22
Nodes (12): ImportTvTimeModal(), ImportTvTimeModalProps, ImportTvTimePage(), ImportTvTimePageProps, useImportTvTime(), DataImport, downloadImportErrorsCSV(), getImportErrors() (+4 more)

### Community 33 - "useSeries.ts"
Cohesion: 0.19
Nodes (16): AddSeriesDialog(), AddSeriesDialogProps, SeriesSection(), SeriesSectionProps, useSeries(), useSeriesMutations(), useSeriesQuery(), addSeries() (+8 more)

### Community 36 - "ChangelogsScreen.tsx"
Cohesion: 0.38
Nodes (5): ChangelogsScreen(), formatDate(), ChangelogEntry, ChangelogLinkItem, CHANGELOGS

### Community 37 - "FaqScreen.tsx"
Cohesion: 0.40
Nodes (5): FAQ_SECTIONS, FaqItem, FaqScreen(), FaqSection, normalizeSearchValue()

### Community 38 - "Instruções para agentes de IA"
Cohesion: 0.50
Nodes (3): Atualização do grafo, Graphify, Instruções para agentes de IA

## Knowledge Gaps
- **188 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+183 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `RankedUser` connect `app.ts` to `appData.ts`, `localData.ts`, `App.tsx`, `UserDropdownMenu.tsx`, `tmdb.ts`, `DashboardTab.tsx`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Why does `PersonalMovie` connect `app.ts` to `appData.ts`, `localData.ts`, `MovieDetailScreen.tsx`, `UserDropdownMenu.tsx`, `tmdb.ts`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Why does `SeriesEntry` connect `app.ts` to `appData.ts`, `useSeries.ts`, `tmdb.ts`, `localData.ts`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _188 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `appData.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
- **Should `localData.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06798245614035088 - nodes in this community are weakly interconnected._
- **Should `MovieDetailScreen.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06198198198198198 - nodes in this community are weakly interconnected._