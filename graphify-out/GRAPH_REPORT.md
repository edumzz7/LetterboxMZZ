# Graph Report - CineRats  (2026-08-19)

## Corpus Check
- 88 files · ~184,696 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 698 nodes · 1688 edges · 35 communities (30 shown, 5 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d5b801cc`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- appData.ts
- localData.ts
- MovieDetailScreen.tsx
- devDependencies
- App.tsx
- compilerOptions
- app.ts
- compilerOptions
- usePersonalMovies.ts
- AvatarDisplay.tsx
- UserDropdownMenu.tsx
- ErrorBoundary
- SuggestMovieModal.tsx
- dependencies
- React + TypeScript + Vite
- PlatformSelect.tsx
- MovieCard.tsx
- UserSidebar.tsx
- tsconfig.json
- vercel.json
- CineRats — Guia de Design
- withFallback
- HomeScreen.tsx
- tmdb.ts
- DashboardTab.tsx
- useImportTvTime.ts
- getMovieDetailsWithFallback
- PersonDetailScreen.tsx
- useSeries.ts
- ChangelogsScreen.tsx
- FaqScreen.tsx
- Instruções para agentes de IA
- ConfirmPasswordResetScreen.tsx

## God Nodes (most connected - your core abstractions)
1. `withFallback()` - 44 edges
2. `RankedUser` - 25 edges
3. `PersonalMovie` - 24 edges
4. `App()` - 20 edges
5. `requireSession()` - 20 edges
6. `compilerOptions` - 20 edges
7. `SeriesEntry` - 19 edges
8. `addActivity()` - 18 edges
9. `deleteCurrentUser()` - 18 edges
10. `compilerOptions` - 18 edges

## Surprising Connections (you probably didn't know these)
- `DashboardTabProps` --references--> `RankedUser`  [EXTRACTED]
  src/components/layout/DashboardTab.tsx → src/types/app.ts
- `GlobalSearchProps` --references--> `RankedUser`  [EXTRACTED]
  src/components/layout/GlobalSearch.tsx → src/types/app.ts
- `UserSidebarProps` --references--> `RankedUser`  [EXTRACTED]
  src/components/layout/UserSidebar.tsx → src/types/app.ts
- `useMediaReviews()` --calls--> `listMediaReviews()`  [EXTRACTED]
  src/hooks/useReviews.ts → src/lib/appData.ts
- `useUsers()` --indirect_call--> `listRankedUsers()`  [INFERRED]
  src/hooks/useUsers.ts → src/lib/appData.ts

## Import Cycles
- None detected.

## Communities (35 total, 5 thin omitted)

### Community 0 - "appData.ts"
Cohesion: 0.15
Nodes (15): useNotifications(), useAvatarMutation(), apiClient, activityMessage(), ApiActivity, AVATAR_IDS, categoryFromApi, categoryToApi (+7 more)

### Community 1 - "localData.ts"
Cohesion: 0.07
Nodes (93): encoder, hashPassword(), normalizeUsername(), DEFAULT_EDUMZZ_SERIES, DEFAULT_OSCAR_MOVIES, LegacyMovie, LegacySeries, readLegacyMovieData() (+85 more)

### Community 2 - "MovieDetailScreen.tsx"
Cohesion: 0.08
Nodes (40): MovieDetailScreen(), MovieDetailScreenProps, WatchedTimingDialog(), WatchedTimingDialogProps, AddSeriesDialog(), SeriesCard(), SeriesCardProps, SeriesDetailScreen() (+32 more)

### Community 3 - "devDependencies"
Cohesion: 0.06
Nodes (34): eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, devDependencies, eslint, @eslint/js (+26 more)

### Community 4 - "App.tsx"
Cohesion: 0.09
Nodes (27): ADMIN_USERNAME, App(), runBootstrap(), readStoredSession(), AuthScreen(), AuthScreenProps, Mode, EnterCodeScreen() (+19 more)

### Community 5 - "compilerOptions"
Cohesion: 0.07
Nodes (26): DOM, DOM.Iterable, src, vite/client, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, jsx (+18 more)

### Community 6 - "app.ts"
Cohesion: 0.08
Nodes (52): HomeScreenProps, AdminPanel(), AdminPanelProps, ProfileSummaryProps, AchievementIcon(), getIcon(), getLongestStreak(), LEVEL_META (+44 more)

### Community 7 - "compilerOptions"
Cohesion: 0.09
Nodes (22): node, vite.config.ts, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection (+14 more)

### Community 8 - "usePersonalMovies.ts"
Cohesion: 0.20
Nodes (14): SharedItem, ShareReviewModal(), ShareReviewModalProps, PersonalMoviesSection(), PersonalMoviesSectionProps, usePersonalMovieMutations(), usePersonalMovies(), usePersonalMoviesQuery() (+6 more)

### Community 10 - "AvatarDisplay.tsx"
Cohesion: 0.23
Nodes (11): AvatarDisplay(), AvatarDisplayProps, ProfileAvatarModal(), ProfileAvatarModalProps, useAvatarUploadMutation(), uploadAvatarImage(), AVATAR_OPTIONS, avatarEmoji() (+3 more)

### Community 12 - "UserDropdownMenu.tsx"
Cohesion: 0.12
Nodes (22): ChangePasswordModal(), ChangePasswordModalProps, CineMatchModal(), CineMatchModalProps, SuggestMovieModalProps, UserDropdownMenu(), UserDropdownMenuProps, formatTimestamp() (+14 more)

### Community 14 - "SuggestMovieModal.tsx"
Cohesion: 0.24
Nodes (10): GlobalSearch(), GlobalSearchProps, SuggestMovieModal(), CategoryCard(), getTmdbImageUrl(), useSuggestMovie(), suggestMovieToUser(), searchMulti() (+2 more)

### Community 15 - "dependencies"
Cohesion: 0.05
Nodes (41): axios, clsx, embla-carousel-react, html2canvas, lucide-react, @microsoft/clarity, motion, dependencies (+33 more)

### Community 16 - "React + TypeScript + Vite"
Cohesion: 0.50
Nodes (3): Expanding the ESLint configuration, React Compiler, React + TypeScript + Vite

### Community 18 - "MovieCard.tsx"
Cohesion: 0.18
Nodes (15): AddMovieDialog(), AddMovieDialogProps, CardMovie, MovieCard(), MovieCardProps, parseProviders(), parseTmdbFromSource(), ProviderItem (+7 more)

### Community 19 - "UserSidebar.tsx"
Cohesion: 0.16
Nodes (20): buildRecommendations(), entryWeight(), getRecommendationSeeds(), normalizeTitle(), RecommendationItem, RecommendationLists, RECOMMENDATIONS_STORAGE_KEY_PREFIX, RecommendationSeed (+12 more)

### Community 22 - "CineRats — Guia de Design"
Cohesion: 0.10
Nodes (20): 10. Receita para novas telas, 11. Consistência de implementação, 1. Identidade visual, 2. Tokens de cor, 3. Tipografia, 4. Espaçamento, dimensão e proporção, 5. Bordas, raios e elevação, 6. Layout e responsividade (+12 more)

### Community 24 - "withFallback"
Cohesion: 0.18
Nodes (16): ProfileSummary(), createSessionVariant(), UserSidebar(), FAVORITES_QUERY_KEY, useFavorites(), addFavorite(), getAnticipatedMovies(), getMovieCineratsStats() (+8 more)

### Community 25 - "HomeScreen.tsx"
Cohesion: 0.15
Nodes (15): HomeScreen(), MediaType, toHomeMedia(), WatchedSeed, SimilarMediaSectionProps, getHomeCatalog(), getRandomTopRatedCatalog(), getTopRatedMovies() (+7 more)

### Community 27 - "tmdb.ts"
Cohesion: 0.16
Nodes (15): CachedHomeCatalog, FAVORITE_GENRE_MIN_RATING, getFavoriteGenreRecommendations(), getMovieYouTubeTrailer(), getYouTubeTrailer(), HOME_TOP_RATED_REQUIREMENTS, randomGenrePage(), readCachedHomeCatalog() (+7 more)

### Community 28 - "DashboardTab.tsx"
Cohesion: 0.14
Nodes (18): DashboardTab(), DashboardTabProps, formatDate(), PreferenceSearchInput(), PreferenceSearchInputProps, PreferenceSearchItem, useDeleteReviewMutation(), useMediaReviews() (+10 more)

### Community 30 - "useImportTvTime.ts"
Cohesion: 0.22
Nodes (12): ImportTvTimeModal(), ImportTvTimeModalProps, ImportTvTimePage(), ImportTvTimePageProps, useImportTvTime(), DataImport, downloadImportErrorsCSV(), getImportErrors() (+4 more)

### Community 31 - "getMovieDetailsWithFallback"
Cohesion: 0.33
Nodes (10): SidebarMovieItem(), SidebarRecommendationItem(), SynopsisModal(), SynopsisModalProps, getDetailsWithOverviewFallback(), getMediaDetailsMatchingTitle(), getMediaDetailsWithFallback(), getMovieDetailsWithFallback() (+2 more)

### Community 32 - "PersonDetailScreen.tsx"
Cohesion: 0.33
Nodes (8): getAge(), getCreditDate(), getCreditTitle(), PersonDetailScreen(), PersonDetailScreenProps, PersonPageMode, getPersonDetailsWithCredits(), TMDBCombinedCredit

### Community 33 - "useSeries.ts"
Cohesion: 0.24
Nodes (13): AddSeriesDialogProps, SeriesSection(), SeriesSectionProps, useSeries(), useSeriesMutations(), useSeriesQuery(), addSeries(), deleteSeries() (+5 more)

### Community 36 - "ChangelogsScreen.tsx"
Cohesion: 0.47
Nodes (4): ChangelogsScreen(), formatDate(), ChangelogEntry, CHANGELOGS

### Community 37 - "FaqScreen.tsx"
Cohesion: 0.40
Nodes (5): FAQ_SECTIONS, FaqItem, FaqScreen(), FaqSection, normalizeSearchValue()

### Community 38 - "Instruções para agentes de IA"
Cohesion: 0.50
Nodes (3): Atualização do grafo, Graphify, Instruções para agentes de IA

## Knowledge Gaps
- **181 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+176 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `RankedUser` connect `app.ts` to `appData.ts`, `localData.ts`, `App.tsx`, `UserDropdownMenu.tsx`, `SuggestMovieModal.tsx`, `UserSidebar.tsx`, `DashboardTab.tsx`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `PersonalMovie` connect `app.ts` to `appData.ts`, `localData.ts`, `usePersonalMovies.ts`, `SuggestMovieModal.tsx`, `MovieCard.tsx`, `UserSidebar.tsx`, `HomeScreen.tsx`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Why does `SeriesEntry` connect `app.ts` to `appData.ts`, `useSeries.ts`, `MovieDetailScreen.tsx`, `localData.ts`, `UserSidebar.tsx`, `HomeScreen.tsx`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _181 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `localData.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06798245614035088 - nodes in this community are weakly interconnected._
- **Should `MovieDetailScreen.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08176100628930817 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._