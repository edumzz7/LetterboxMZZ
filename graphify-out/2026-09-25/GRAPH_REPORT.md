# Graph Report - CineRats  (2026-09-24)

## Corpus Check
- 96 files · ~242,130 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 756 nodes · 1821 edges · 38 communities (34 shown, 4 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 17 edges (avg confidence: 0.78)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b579b32f`
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
- SeriesCard.tsx
- HomeScreen.tsx
- UserSidebar.tsx
- tmdb.ts
- appData.ts
- ErrorBoundary
- UserDropdownMenu.tsx
- dependencies
- React + TypeScript + Vite
- PlatformSelect.tsx
- OscarPredictionsSection.tsx
- AvatarDisplay.tsx
- tsconfig.json
- vercel.json
- CineRats — Guia de Design
- withFallback
- PersonDetailScreen.tsx
- SimilarMediaSection.tsx
- DashboardTab.tsx
- SeriesDetailScreen
- PublicHome.tsx
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
- `HomeScreen()` --indirect_call--> `getTopRatedMovies()`  [INFERRED]
  src/components/home/HomeScreen.tsx → src/lib/tmdb.ts
- `HomeScreen()` --indirect_call--> `getTopRatedSeries()`  [INFERRED]
  src/components/home/HomeScreen.tsx → src/lib/tmdb.ts
- `HomeScreen()` --indirect_call--> `getWeeklyTrendingMedia()`  [INFERRED]
  src/components/home/HomeScreen.tsx → src/lib/tmdb.ts
- `DashboardTabProps` --references--> `RankedUser`  [EXTRACTED]
  src/components/layout/DashboardTab.tsx → src/types/app.ts

## Import Cycles
- None detected.

## Communities (38 total, 4 thin omitted)

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
Nodes (25): ADMIN_USERNAME, App(), runBootstrap(), readStoredSession(), EnterCodeScreen(), EnterCodeScreenProps, RequestPasswordResetScreen(), RequestPasswordResetScreenProps (+17 more)

### Community 7 - "compilerOptions"
Cohesion: 0.09
Nodes (22): node, vite.config.ts, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection (+14 more)

### Community 8 - "SeriesCard.tsx"
Cohesion: 0.08
Nodes (28): CatalogPage(), CatalogPageProps, CERTIFICATIONS, LANGUAGES, PROVIDERS, SORT_OPTIONS, toggle(), AddSeriesDialog() (+20 more)

### Community 9 - "HomeScreen.tsx"
Cohesion: 0.20
Nodes (13): HomeScreen(), MediaType, toHomeMedia(), WatchedSeed, getMovieRecommendations(), getMovieSimilar(), getRecommendationList(), getSimilarWithFallback() (+5 more)

### Community 10 - "UserSidebar.tsx"
Cohesion: 0.17
Nodes (17): formatSidebarDate(), RECOMMENDATIONS_STORAGE_KEY_PREFIX, SidebarMediaItem(), SidebarMediaItemData, toSidebarMediaItems(), UserSidebar(), UserSidebarProps, SynopsisModal() (+9 more)

### Community 11 - "tmdb.ts"
Cohesion: 0.13
Nodes (20): CachedHomeCatalog, FAVORITE_GENRE_MIN_RATING, getDiscoverByGenres(), getFavoriteGenreRecommendations(), getHomeCatalog(), getRandomTopRatedCatalog(), getTvYouTubeTrailer(), getYouTubeTrailer() (+12 more)

### Community 12 - "appData.ts"
Cohesion: 0.13
Nodes (16): useNotifications(), apiClient, activityMessage(), ApiActivity, ApiSeriesWatchEntry, AVATAR_IDS, categoryFromApi, categoryToApi (+8 more)

### Community 13 - "ErrorBoundary"
Cohesion: 0.25
Nodes (3): ErrorBoundary, ErrorBoundaryProps, ErrorBoundaryState

### Community 14 - "UserDropdownMenu.tsx"
Cohesion: 0.10
Nodes (25): ChangePasswordModal(), ChangePasswordModalProps, CineMatchModal(), CineMatchModalProps, SuggestMovieModalProps, UserDropdownMenu(), UserDropdownMenuProps, formatTimestamp() (+17 more)

### Community 15 - "dependencies"
Cohesion: 0.05
Nodes (41): axios, clsx, embla-carousel-react, html2canvas, lucide-react, @microsoft/clarity, motion, dependencies (+33 more)

### Community 16 - "React + TypeScript + Vite"
Cohesion: 0.50
Nodes (3): Expanding the ESLint configuration, React Compiler, React + TypeScript + Vite

### Community 18 - "OscarPredictionsSection.tsx"
Cohesion: 0.11
Nodes (24): GlobalSearch(), GlobalSearchProps, SuggestMovieModal(), AddMovieDialog(), AddMovieDialogProps, CATEGORIES, CategoryCard(), CategoryCardProps (+16 more)

### Community 19 - "AvatarDisplay.tsx"
Cohesion: 0.22
Nodes (10): AvatarDisplay(), AvatarDisplayProps, ProfileAvatarModal(), ProfileAvatarModalProps, uploadAvatarImage(), AVATAR_OPTIONS, avatarEmoji(), CUSTOM_AVATAR_PREFIX (+2 more)

### Community 22 - "CineRats — Guia de Design"
Cohesion: 0.10
Nodes (20): 10. Receita para novas telas, 11. Consistência de implementação, 1. Identidade visual, 2. Tokens de cor, 3. Tipografia, 4. Espaçamento, dimensão e proporção, 5. Bordas, raios e elevação, 6. Layout e responsividade (+12 more)

### Community 24 - "withFallback"
Cohesion: 0.26
Nodes (11): useDeleteReviewMutation(), useMediaReviews(), useUserReviews(), deleteReview(), getAnticipatedMovies(), getSeriesCineratsStats(), getTrendingMovies(), isBackendUnavailable() (+3 more)

### Community 25 - "PersonDetailScreen.tsx"
Cohesion: 0.33
Nodes (8): getAge(), getCreditDate(), getCreditTitle(), PersonDetailScreen(), PersonDetailScreenProps, PersonPageMode, getPersonDetailsWithCredits(), TMDBCombinedCredit

### Community 27 - "SimilarMediaSection.tsx"
Cohesion: 0.33
Nodes (6): SimilarMediaSection(), SimilarMediaSectionProps, SIMILAR_MEDIA_MIN_RATING, TMDBCatalogItem, TMDBHomeMedia, TMDBRecommendationItem

### Community 28 - "DashboardTab.tsx"
Cohesion: 0.19
Nodes (12): DashboardTab(), DashboardTabProps, formatDate(), PreferenceSearchInput(), PreferenceSearchInputProps, PreferenceSearchItem, FAVORITE_GENRE_BY_KEY, FAVORITE_GENRES (+4 more)

### Community 29 - "SeriesDetailScreen"
Cohesion: 0.28
Nodes (8): SeriesDetailScreen(), useAvatarMutation(), useAvatarUploadMutation(), useUsers(), fallbackAvatar(), listRankedUsers(), listUsers(), updateUserAvatar()

### Community 30 - "PublicHome.tsx"
Cohesion: 0.43
Nodes (6): PublicHome(), listPublicRanking(), listRecentPublicReviews(), getTopRatedMovies(), getTopRatedSeries(), getWeeklyTrendingMedia()

### Community 34 - "app.ts"
Cohesion: 0.06
Nodes (59): HomeScreenProps, AdminPanel(), AdminPanelProps, Header(), HeaderProps, ProfileSummaryProps, AchievementIcon(), getIcon() (+51 more)

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
Cohesion: 0.07
Nodes (50): SharedItem, ShareReviewModal(), ShareReviewModalProps, waitForRenderedImages(), withTimeout(), CardMovie, MovieCard(), MovieCardProps (+42 more)

### Community 42 - "useFavorites.ts"
Cohesion: 0.36
Nodes (7): ProfileSummary(), FAVORITES_QUERY_KEY, useFavorites(), addFavorite(), listFavorites(), removeFavorite(), UserFavorite

## Knowledge Gaps
- **199 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+194 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `RankedUser` connect `app.ts` to `localData.ts`, `App.tsx`, `UserSidebar.tsx`, `appData.ts`, `UserDropdownMenu.tsx`, `OscarPredictionsSection.tsx`, `AvatarDisplay.tsx`, `DashboardTab.tsx`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `PersonalMovie` connect `app.ts` to `localData.ts`, `MovieDetailScreen.tsx`, `HomeScreen.tsx`, `appData.ts`, `OscarPredictionsSection.tsx`, `PublicHome.tsx`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Why does `SeriesEntry` connect `app.ts` to `localData.ts`, `useSeries.ts`, `SeriesCard.tsx`, `HomeScreen.tsx`, `appData.ts`, `PublicHome.tsx`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _199 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `localData.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07609805924412666 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._