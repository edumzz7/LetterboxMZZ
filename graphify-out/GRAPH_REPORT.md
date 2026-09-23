# Graph Report - CineRats  (2026-09-23)

## Corpus Check
- 96 files · ~241,562 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 754 nodes · 1814 edges · 36 communities (32 shown, 4 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 16 edges (avg confidence: 0.78)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9f97958a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ImportTvTimePage.tsx
- localData.ts
- useSeries.ts
- devDependencies
- AuthScreen.tsx
- compilerOptions
- App.tsx
- compilerOptions
- SeriesDetailScreen.tsx
- HomeScreen.tsx
- UserSidebar.tsx
- tmdb.ts
- appData.ts
- ErrorBoundary
- UserDropdownMenu.tsx
- dependencies
- React + TypeScript + Vite
- PlatformSelect.tsx
- UserEventBell.tsx
- CatalogPage.tsx
- tsconfig.json
- vercel.json
- CineRats — Guia de Design
- withFallback
- PersonDetailScreen.tsx
- SimilarMediaSection.tsx
- DashboardTab.tsx
- app.ts
- ChangelogsScreen.tsx
- FaqScreen.tsx
- Instruções para agentes de IA
- ConfirmPasswordResetScreen.tsx
- MovieDetailScreen.tsx
- useFavorites.ts

## God Nodes (most connected - your core abstractions)
1. `withFallback()` - 44 edges
2. `RankedUser` - 27 edges
3. `PersonalMovie` - 25 edges
4. `App()` - 21 edges
5. `requireSession()` - 20 edges
6. `SeriesEntry` - 20 edges
7. `compilerOptions` - 20 edges
8. `addActivity()` - 18 edges
9. `deleteCurrentUser()` - 18 edges
10. `compilerOptions` - 18 edges

## Surprising Connections (you probably didn't know these)
- `App()` --indirect_call--> `listPublicRanking()`  [INFERRED]
  src/App.tsx → src/lib/appData.ts
- `AdminPanelProps` --references--> `RankedUser`  [EXTRACTED]
  src/components/layout/AdminPanel.tsx → src/types/app.ts
- `DashboardTabProps` --references--> `RankedUser`  [EXTRACTED]
  src/components/layout/DashboardTab.tsx → src/types/app.ts
- `GlobalSearchProps` --references--> `RankedUser`  [EXTRACTED]
  src/components/layout/GlobalSearch.tsx → src/types/app.ts
- `UserSidebarProps` --references--> `RankedUser`  [EXTRACTED]
  src/components/layout/UserSidebar.tsx → src/types/app.ts

## Import Cycles
- None detected.

## Communities (36 total, 4 thin omitted)

### Community 0 - "ImportTvTimePage.tsx"
Cohesion: 0.16
Nodes (19): Props, ImportTvTimePage(), download(), platforms, Props, statuses, StatusIcon(), isActiveImport() (+11 more)

### Community 1 - "localData.ts"
Cohesion: 0.08
Nodes (87): encoder, hashPassword(), normalizeUsername(), readLegacyMovieData(), readLegacySeriesData(), addActivity(), addFavorite(), addOscarMovie() (+79 more)

### Community 2 - "useSeries.ts"
Cohesion: 0.25
Nodes (13): SeriesSection(), SeriesSectionProps, useSeries(), useSeriesMutations(), useSeriesQuery(), addSeries(), createSeriesWatchEntries(), deleteSeries() (+5 more)

### Community 3 - "devDependencies"
Cohesion: 0.06
Nodes (34): eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, devDependencies, eslint, @eslint/js (+26 more)

### Community 4 - "AuthScreen.tsx"
Cohesion: 0.50
Nodes (3): AuthScreen(), AuthScreenProps, Mode

### Community 5 - "compilerOptions"
Cohesion: 0.07
Nodes (26): DOM, DOM.Iterable, src, vite/client, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, jsx (+18 more)

### Community 6 - "App.tsx"
Cohesion: 0.10
Nodes (22): ADMIN_USERNAME, App(), runBootstrap(), readStoredSession(), EnterCodeScreen(), EnterCodeScreenProps, RequestPasswordResetScreen(), RequestPasswordResetScreenProps (+14 more)

### Community 7 - "compilerOptions"
Cohesion: 0.09
Nodes (22): node, vite.config.ts, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection (+14 more)

### Community 8 - "SeriesDetailScreen.tsx"
Cohesion: 0.09
Nodes (33): WatchedTimingDialog(), WatchedTimingDialogProps, AddSeriesDialog(), AddSeriesDialogProps, SeriesCard(), SeriesCardProps, SeriesDetailScreenProps, ReviewModal() (+25 more)

### Community 9 - "HomeScreen.tsx"
Cohesion: 0.16
Nodes (18): HomeScreen(), MediaType, toHomeMedia(), WatchedSeed, PublicHome(), listPublicRanking(), getMovieRecommendations(), getMovieSimilar() (+10 more)

### Community 10 - "UserSidebar.tsx"
Cohesion: 0.19
Nodes (15): formatSidebarDate(), RECOMMENDATIONS_STORAGE_KEY_PREFIX, SidebarMediaItem(), SidebarMediaItemData, toSidebarMediaItems(), UserSidebar(), UserSidebarProps, SynopsisModal() (+7 more)

### Community 11 - "tmdb.ts"
Cohesion: 0.11
Nodes (26): CachedHomeCatalog, FAVORITE_GENRE_MIN_RATING, formatLocalDate(), getDiscoverByGenres(), getFavoriteGenreRecommendations(), getHomeCatalog(), getRandomTopRatedCatalog(), getTvYouTubeTrailer() (+18 more)

### Community 12 - "appData.ts"
Cohesion: 0.12
Nodes (19): useNotifications(), useAvatarMutation(), useAvatarUploadMutation(), apiClient, activityMessage(), ApiActivity, ApiSeriesWatchEntry, AVATAR_IDS (+11 more)

### Community 13 - "ErrorBoundary"
Cohesion: 0.25
Nodes (3): ErrorBoundary, ErrorBoundaryProps, ErrorBoundaryState

### Community 14 - "UserDropdownMenu.tsx"
Cohesion: 0.07
Nodes (35): AdminPanel(), AdminPanelProps, AvatarDisplay(), AvatarDisplayProps, ChangePasswordModal(), ChangePasswordModalProps, CineMatchModal(), CineMatchModalProps (+27 more)

### Community 15 - "dependencies"
Cohesion: 0.05
Nodes (41): axios, clsx, embla-carousel-react, html2canvas, lucide-react, @microsoft/clarity, motion, dependencies (+33 more)

### Community 16 - "React + TypeScript + Vite"
Cohesion: 0.50
Nodes (3): Expanding the ESLint configuration, React Compiler, React + TypeScript + Vite

### Community 18 - "UserEventBell.tsx"
Cohesion: 0.26
Nodes (10): UserDropdownMenu(), formatTimestamp(), readSeenTimestamp(), UserEventBell(), UserEventBellProps, writeSeenTimestamp(), useUserActivity(), HEADER_MENU_OPEN_EVENT (+2 more)

### Community 19 - "CatalogPage.tsx"
Cohesion: 0.19
Nodes (10): CatalogPage(), CatalogPageProps, CERTIFICATIONS, LANGUAGES, PROVIDERS, SORT_OPTIONS, toggle(), CatalogFilters (+2 more)

### Community 22 - "CineRats — Guia de Design"
Cohesion: 0.10
Nodes (20): 10. Receita para novas telas, 11. Consistência de implementação, 1. Identidade visual, 2. Tokens de cor, 3. Tipografia, 4. Espaçamento, dimensão e proporção, 5. Bordas, raios e elevação, 6. Layout e responsividade (+12 more)

### Community 24 - "withFallback"
Cohesion: 0.18
Nodes (16): useDeleteReviewMutation(), useMediaReviews(), useUserReviews(), clearAppDataCache(), confirmPasswordReset(), deleteCurrentUser(), deleteReview(), getAnticipatedMovies() (+8 more)

### Community 25 - "PersonDetailScreen.tsx"
Cohesion: 0.33
Nodes (8): getAge(), getCreditDate(), getCreditTitle(), PersonDetailScreen(), PersonDetailScreenProps, PersonPageMode, getPersonDetailsWithCredits(), TMDBCombinedCredit

### Community 27 - "SimilarMediaSection.tsx"
Cohesion: 0.33
Nodes (6): SimilarMediaSection(), SimilarMediaSectionProps, SIMILAR_MEDIA_MIN_RATING, TMDBCatalogItem, TMDBHomeMedia, TMDBRecommendationItem

### Community 28 - "DashboardTab.tsx"
Cohesion: 0.18
Nodes (13): DashboardTab(), DashboardTabProps, formatDate(), PreferenceSearchInput(), PreferenceSearchInputProps, PreferenceSearchItem, FAVORITE_GENRE_BY_KEY, FAVORITE_GENRES (+5 more)

### Community 34 - "app.ts"
Cohesion: 0.06
Nodes (66): HomeScreenProps, Header(), HeaderProps, ProfileSummaryProps, AchievementIcon(), getIcon(), getLongestStreak(), LEVEL_META (+58 more)

### Community 36 - "ChangelogsScreen.tsx"
Cohesion: 0.38
Nodes (5): ChangelogsScreen(), formatDate(), ChangelogEntry, ChangelogLinkItem, CHANGELOGS

### Community 37 - "FaqScreen.tsx"
Cohesion: 0.40
Nodes (5): FAQ_SECTIONS, FaqItem, FaqScreen(), FaqSection, normalizeSearchValue()

### Community 38 - "Instruções para agentes de IA"
Cohesion: 0.50
Nodes (3): Atualização do grafo, Graphify, Instruções para agentes de IA

### Community 40 - "MovieDetailScreen.tsx"
Cohesion: 0.09
Nodes (39): SharedItem, ShareReviewModal(), ShareReviewModalProps, waitForRenderedImages(), withTimeout(), AddMovieDialog(), AddMovieDialogProps, CardMovie (+31 more)

### Community 42 - "useFavorites.ts"
Cohesion: 0.36
Nodes (7): ProfileSummary(), FAVORITES_QUERY_KEY, useFavorites(), addFavorite(), listFavorites(), removeFavorite(), UserFavorite

## Knowledge Gaps
- **198 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+193 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `RankedUser` connect `app.ts` to `localData.ts`, `App.tsx`, `UserSidebar.tsx`, `appData.ts`, `UserDropdownMenu.tsx`, `DashboardTab.tsx`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `PersonalMovie` connect `app.ts` to `localData.ts`, `MovieDetailScreen.tsx`, `HomeScreen.tsx`, `appData.ts`, `UserDropdownMenu.tsx`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Why does `SeriesEntry` connect `app.ts` to `localData.ts`, `useSeries.ts`, `SeriesDetailScreen.tsx`, `HomeScreen.tsx`, `appData.ts`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _198 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `localData.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07609805924412666 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._