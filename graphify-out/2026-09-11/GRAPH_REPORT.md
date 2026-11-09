# Graph Report - CineRats  (2026-09-11)

## Corpus Check
- 95 files · ~243,342 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 733 nodes · 1787 edges · 38 communities (32 shown, 6 thin omitted)
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
- AuthScreen.tsx
- compilerOptions
- getMovieDetailsWithFallback
- compilerOptions
- CatalogPage.tsx
- App.tsx
- EnterCodeScreen.tsx
- HomeScreen.tsx
- UserEventBell.tsx
- ErrorBoundary
- app.ts
- dependencies
- React + TypeScript + Vite
- PlatformSelect.tsx
- RankingScreen.tsx
- tmdb.ts
- tsconfig.json
- vercel.json
- CineRats — Guia de Design
- UserSidebar.tsx
- PersonDetailScreen.tsx
- DashboardTab.tsx
- SimilarMediaSection.tsx
- useImportTvTime.ts
- ChangelogsScreen.tsx
- FaqScreen.tsx
- Instruções para agentes de IA
- ConfirmPasswordResetScreen.tsx
- useSeries.ts
- ProfileSummary.tsx
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
- `App()` --indirect_call--> `listPublicRanking()`  [INFERRED]
  src/App.tsx → src/lib/appData.ts
- `useUsers()` --indirect_call--> `listRankedUsers()`  [INFERRED]
  src/hooks/useUsers.ts → src/lib/appData.ts
- `useAvatarUploadMutation()` --calls--> `uploadAvatarImage()`  [EXTRACTED]
  src/hooks/useUsers.ts → src/lib/appData.ts
- `App()` --calls--> `useFavorites()`  [EXTRACTED]
  src/App.tsx → src/hooks/useFavorites.ts
- `App()` --calls--> `usePersonalMovies()`  [EXTRACTED]
  src/App.tsx → src/hooks/usePersonalMovies.ts

## Import Cycles
- None detected.

## Communities (38 total, 6 thin omitted)

### Community 0 - "appData.ts"
Cohesion: 0.13
Nodes (18): useNotifications(), useAvatarMutation(), useAvatarUploadMutation(), apiClient, activityMessage(), ApiActivity, AVATAR_IDS, categoryFromApi (+10 more)

### Community 1 - "localData.ts"
Cohesion: 0.07
Nodes (93): encoder, hashPassword(), normalizeUsername(), DEFAULT_EDUMZZ_SERIES, DEFAULT_OSCAR_MOVIES, LegacyMovie, LegacySeries, readLegacyMovieData() (+85 more)

### Community 2 - "MovieDetailScreen.tsx"
Cohesion: 0.08
Nodes (45): SharedItem, ShareReviewModal(), ShareReviewModalProps, MovieDetailScreen(), MovieDetailScreenProps, WatchedTimingDialog(), WatchedTimingDialogProps, AddSeriesDialog() (+37 more)

### Community 3 - "devDependencies"
Cohesion: 0.06
Nodes (34): eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, devDependencies, eslint, @eslint/js (+26 more)

### Community 4 - "AuthScreen.tsx"
Cohesion: 0.50
Nodes (3): AuthScreen(), AuthScreenProps, Mode

### Community 5 - "compilerOptions"
Cohesion: 0.07
Nodes (26): DOM, DOM.Iterable, src, vite/client, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, jsx (+18 more)

### Community 6 - "getMovieDetailsWithFallback"
Cohesion: 0.33
Nodes (10): SidebarMovieItem(), SidebarRecommendationItem(), SynopsisModal(), SynopsisModalProps, getDetailsWithOverviewFallback(), getMediaDetailsMatchingTitle(), getMediaDetailsWithFallback(), getMovieDetailsWithFallback() (+2 more)

### Community 7 - "compilerOptions"
Cohesion: 0.09
Nodes (22): node, vite.config.ts, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection (+14 more)

### Community 8 - "CatalogPage.tsx"
Cohesion: 0.20
Nodes (9): CatalogPage(), CatalogPageProps, LANGUAGES, MOVIE_GENRES, PROVIDERS, toggle(), TV_GENRES, CatalogFilters (+1 more)

### Community 9 - "App.tsx"
Cohesion: 0.14
Nodes (22): ADMIN_USERNAME, App(), runBootstrap(), readStoredSession(), RequestPasswordResetScreen(), RequestPasswordResetScreenProps, LatestUpdatesSection(), ProfilePageSkeleton() (+14 more)

### Community 11 - "HomeScreen.tsx"
Cohesion: 0.21
Nodes (11): HomeScreen(), MediaType, toHomeMedia(), WatchedSeed, PublicHome(), listPublicRanking(), getTopRatedMovies(), getTopRatedSeries() (+3 more)

### Community 12 - "UserEventBell.tsx"
Cohesion: 0.24
Nodes (11): UserDropdownMenu(), formatTimestamp(), readSeenTimestamp(), UserEventBell(), UserEventBellProps, writeSeenTimestamp(), useUserActivity(), listUserActivity() (+3 more)

### Community 14 - "app.ts"
Cohesion: 0.07
Nodes (39): AdminPanel(), AdminPanelProps, AvatarDisplay(), AvatarDisplayProps, ChangePasswordModal(), ChangePasswordModalProps, CineMatchModal(), CineMatchModalProps (+31 more)

### Community 15 - "dependencies"
Cohesion: 0.05
Nodes (41): axios, clsx, embla-carousel-react, html2canvas, lucide-react, @microsoft/clarity, motion, dependencies (+33 more)

### Community 16 - "React + TypeScript + Vite"
Cohesion: 0.50
Nodes (3): Expanding the ESLint configuration, React Compiler, React + TypeScript + Vite

### Community 18 - "RankingScreen.tsx"
Cohesion: 0.06
Nodes (51): HomeScreenProps, Header(), HeaderProps, AchievementIcon(), getIcon(), getLongestStreak(), LEVEL_META, MCOIN_RULES (+43 more)

### Community 19 - "tmdb.ts"
Cohesion: 0.12
Nodes (22): CachedHomeCatalog, FAVORITE_GENRE_MIN_RATING, getDiscoverByGenres(), getFavoriteGenreRecommendations(), getHomeCatalog(), getMovieYouTubeTrailer(), getRandomTopRatedCatalog(), getTvYouTubeTrailer() (+14 more)

### Community 22 - "CineRats — Guia de Design"
Cohesion: 0.10
Nodes (20): 10. Receita para novas telas, 11. Consistência de implementação, 1. Identidade visual, 2. Tokens de cor, 3. Tipografia, 4. Espaçamento, dimensão e proporção, 5. Bordas, raios e elevação, 6. Layout e responsividade (+12 more)

### Community 24 - "UserSidebar.tsx"
Cohesion: 0.15
Nodes (22): buildRecommendations(), createSessionVariant(), entryWeight(), getRecommendationSeeds(), normalizeTitle(), RecommendationItem, RecommendationLists, RECOMMENDATIONS_STORAGE_KEY_PREFIX (+14 more)

### Community 25 - "PersonDetailScreen.tsx"
Cohesion: 0.33
Nodes (8): getAge(), getCreditDate(), getCreditTitle(), PersonDetailScreen(), PersonDetailScreenProps, PersonPageMode, getPersonDetailsWithCredits(), TMDBCombinedCredit

### Community 28 - "DashboardTab.tsx"
Cohesion: 0.14
Nodes (18): DashboardTab(), formatDate(), PreferenceSearchInput(), PreferenceSearchInputProps, PreferenceSearchItem, useDeleteReviewMutation(), useMediaReviews(), useUserReviews() (+10 more)

### Community 29 - "SimilarMediaSection.tsx"
Cohesion: 0.40
Nodes (5): SimilarMediaSectionProps, SIMILAR_MEDIA_MIN_RATING, TMDBCatalogItem, TMDBHomeMedia, TMDBRecommendationItem

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
Cohesion: 0.39
Nodes (8): useSeriesMutations(), useSeriesQuery(), addSeries(), deleteSeries(), getSeriesStatus(), listSeries(), rateSeries(), updateSeries()

### Community 42 - "ProfileSummary.tsx"
Cohesion: 0.31
Nodes (8): ProfileSummary(), ProfileSummaryProps, FAVORITES_QUERY_KEY, useFavorites(), addFavorite(), listFavorites(), removeFavorite(), UserFavorite

### Community 43 - "tmdbCache.ts"
Cohesion: 0.32
Nodes (4): TMDBTvDetails, CachedTvDetails, clearOldestCaches(), getTvDetailsWithCache()

### Community 44 - "MovieCard.tsx"
Cohesion: 0.13
Nodes (26): AddMovieDialog(), AddMovieDialogProps, CardMovie, MovieCard(), MovieCardProps, parseProviders(), parseTmdbFromSource(), ProviderItem (+18 more)

## Knowledge Gaps
- **190 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+185 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `RankedUser` connect `app.ts` to `appData.ts`, `localData.ts`, `App.tsx`, `ProfileSummary.tsx`, `RankingScreen.tsx`, `UserSidebar.tsx`, `DashboardTab.tsx`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Why does `PersonalMovie` connect `MovieCard.tsx` to `appData.ts`, `localData.ts`, `ProfileSummary.tsx`, `HomeScreen.tsx`, `app.ts`, `RankingScreen.tsx`, `UserSidebar.tsx`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `SeriesEntry` connect `RankingScreen.tsx` to `appData.ts`, `localData.ts`, `MovieDetailScreen.tsx`, `useSeries.ts`, `ProfileSummary.tsx`, `HomeScreen.tsx`, `app.ts`, `UserSidebar.tsx`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _190 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `appData.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12648221343873517 - nodes in this community are weakly interconnected._
- **Should `localData.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06798245614035088 - nodes in this community are weakly interconnected._
- **Should `MovieDetailScreen.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08441558441558442 - nodes in this community are weakly interconnected._