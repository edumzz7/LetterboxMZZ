# Graph Report - CineRats (2026-10-14)

## Corpus Check

- 112 files · ~252,675 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary

- 855 nodes · 2106 edges · 37 communities (33 shown, 4 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 18 edges (avg confidence: 0.78)
- Token cost: 0 input · 0 output

## Graph Freshness

- Built from commit: `58be6940`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)

- ImportTvTimePage.tsx
- localData.ts
- CineMatchPage.tsx
- devDependencies
- withFallback
- compilerOptions
- App.tsx
- compilerOptions
- SeriesDetailScreen.tsx
- usePersonalMovies.ts
- tmdbCache.ts
- tmdb.ts
- app.ts
- ErrorBoundary
- RankedUser
- dependencies
- React + TypeScript + Vite
- PlatformSelect.tsx
- LoadingSkeleton.tsx
- tsconfig.json
- vercel.json
- CineRats — Guia de Design
- useSeries.ts
- appData.ts
- HomeScreen.tsx
- TmdbImage.tsx
- DashboardTab.tsx
- cinematch.ts
- RankingScreen.tsx
- useFavorites.ts
- ChangelogsScreen.tsx
- FaqScreen.tsx
- Instruções para agentes de IA
- ConfirmPasswordResetScreen.tsx

## God Nodes (most connected - your core abstractions)

1. `withFallback()` - 45 edges
2. `RankedUser` - 31 edges
3. `PersonalMovie` - 23 edges
4. `App()` - 20 edges
5. `requireSession()` - 20 edges
6. `compilerOptions` - 20 edges
7. `addActivity()` - 18 edges
8. `deleteCurrentUser()` - 18 edges
9. `SeriesEntry` - 18 edges
10. `compilerOptions` - 18 edges

## Surprising Connections (you probably didn't know these)

- `App()` --indirect_call--> `listPublicRanking()` [INFERRED]
  src/App.tsx → src/lib/appData.ts
- `Props` --references--> `RankedUser` [EXTRACTED]
  src/components/layout/CineMatchPage.tsx → src/types/app.ts
- `DashboardTabProps` --references--> `RankedUser` [EXTRACTED]
  src/components/layout/DashboardTab.tsx → src/types/app.ts
- `ProfileSummaryProps` --references--> `RankedUser` [EXTRACTED]
  src/components/layout/ProfileSummary.tsx → src/types/app.ts
- `UserSidebarProps` --references--> `RankedUser` [EXTRACTED]
  src/components/layout/UserSidebar.tsx → src/types/app.ts

## Import Cycles

- None detected.

## Communities (37 total, 4 thin omitted)

### Community 0 - "ImportTvTimePage.tsx"

Cohesion: 0.16
Nodes (19): Props, ImportTvTimePage(), download(), platforms, Props, statuses, StatusIcon(), isActiveImport() (+11 more)

### Community 1 - "localData.ts"

Cohesion: 0.07
Nodes (93): encoder, hashPassword(), normalizeUsername(), DEFAULT_EDUMZZ_SERIES, DEFAULT_OSCAR_MOVIES, LegacyMovie, LegacySeries, readLegacyMovieData() (+85 more)

### Community 2 - "CineMatchPage.tsx"

Cohesion: 0.16
Nodes (18): CineMatchPage(), accept(), draw(), Props, Props, WatchPartyHistory(), update(), apiClient (+10 more)

### Community 3 - "devDependencies"

Cohesion: 0.04
Nodes (46): eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, jsdom, devDependencies, eslint (+38 more)

### Community 4 - "withFallback"

Cohesion: 0.20
Nodes (18): App(), runBootstrap(), readStoredSession(), adminResetPassword(), changePassword(), clearAppDataCache(), confirmPasswordReset(), deleteCurrentUser() (+10 more)

### Community 5 - "compilerOptions"

Cohesion: 0.07
Nodes (26): DOM, DOM.Iterable, src, vite/client, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, jsx (+18 more)

### Community 6 - "App.tsx"

Cohesion: 0.08
Nodes (21): ADMIN_USERNAME, OTHER_PROFILE_TABS, PROFILE_NAV_ICONS, AuthScreen(), AuthScreenProps, Mode, EnterCodeScreen(), EnterCodeScreenProps (+13 more)

### Community 7 - "compilerOptions"

Cohesion: 0.09
Nodes (22): node, vite.config.ts, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection (+14 more)

### Community 8 - "SeriesDetailScreen.tsx"

Cohesion: 0.05
Nodes (70): SharedItem, ShareReviewModal(), ShareReviewModalProps, waitForRenderedImages(), withTimeout(), AddMovieDialog(), AddMovieDialogProps, CardMovie (+62 more)

### Community 9 - "usePersonalMovies.ts"

Cohesion: 0.43
Nodes (7): usePersonalMovieMutations(), usePersonalMoviesQuery(), addPersonalMovie(), deletePersonalMovie(), listPersonalMovies(), updatePersonalMovie(), listActiveWatchParties()

### Community 10 - "tmdbCache.ts"

Cohesion: 0.33
Nodes (3): TMDBTvDetails, CachedTvDetails, clearOldestCaches()

### Community 11 - "tmdb.ts"

Cohesion: 0.09
Nodes (32): SynopsisModal(), SynopsisModalProps, CachedHomeCatalog, FAVORITE_GENRE_MIN_RATING, getDetailsWithOverviewFallback(), getDiscoverByGenres(), getFavoriteGenreRecommendations(), getHomeCatalog() (+24 more)

### Community 12 - "app.ts"

Cohesion: 0.07
Nodes (41): CineMatchModal(), CineMatchModalProps, SuggestMovieModalProps, formatSidebarDate(), RECOMMENDATIONS_STORAGE_KEY_PREFIX, SidebarMediaItem(), SidebarMediaItemData, toSidebarMediaItems() (+33 more)

### Community 13 - "ErrorBoundary"

Cohesion: 0.25
Nodes (3): ErrorBoundary, ErrorBoundaryProps, ErrorBoundaryState

### Community 14 - "RankedUser"

Cohesion: 0.07
Nodes (39): AdminPanel(), AdminPanelProps, AvatarDisplay(), AvatarDisplayProps, ChangePasswordModal(), ChangePasswordModalProps, GlobalSearch(), GlobalSearchProps (+31 more)

### Community 15 - "dependencies"

Cohesion: 0.05
Nodes (41): axios, clsx, embla-carousel-react, html2canvas, lucide-react, @microsoft/clarity, motion, dependencies (+33 more)

### Community 16 - "React + TypeScript + Vite"

Cohesion: 0.50
Nodes (3): Expanding the ESLint configuration, React Compiler, React + TypeScript + Vite

### Community 19 - "LoadingSkeleton.tsx"

Cohesion: 0.12
Nodes (16): CatalogPage(), CatalogPageProps, CERTIFICATIONS, LANGUAGES, PROVIDERS, SORT_OPTIONS, toggle(), PosterGridSkeleton() (+8 more)

### Community 22 - "CineRats — Guia de Design"

Cohesion: 0.10
Nodes (20): 10. Receita para novas telas, 11. Consistência de implementação, 1. Identidade visual, 2. Tokens de cor, 3. Tipografia, 4. Espaçamento, dimensão e proporção, 5. Bordas, raios e elevação, 6. Layout e responsividade (+12 more)

### Community 24 - "useSeries.ts"

Cohesion: 0.32
Nodes (11): useSeriesMutations(), useSeriesQuery(), addSeries(), createSeriesWatchEntries(), deleteSeries(), getSeriesStatus(), listSeries(), rateSeries() (+3 more)

### Community 25 - "appData.ts"

Cohesion: 0.11
Nodes (22): useNotifications(), useAvatarMutation(), activityMessage(), ApiActivity, ApiSeriesWatchEntry, AVATAR_IDS, categoryFromApi, categoryToApi (+14 more)

### Community 27 - "HomeScreen.tsx"

Cohesion: 0.17
Nodes (13): HomeScreen(), MediaType, toHomeMedia(), WatchedSeed, PublicHome(), listRecentPublicReviews(), getReviewReaction(), reviewReactions (+5 more)

### Community 28 - "TmdbImage.tsx"

Cohesion: 0.21
Nodes (12): getAge(), getCreditDate(), getCreditTitle(), PersonDetailScreen(), PersonDetailScreenProps, PersonPageMode, getResponsiveSources(), TMDB_WIDTHS (+4 more)

### Community 29 - "DashboardTab.tsx"

Cohesion: 0.13
Nodes (21): DashboardTab(), DashboardTabProps, formatDate(), PreferenceSearchInput(), PreferenceSearchInputProps, PreferenceSearchItem, formatDate(), ReviewsScreen() (+13 more)

### Community 30 - "cinematch.ts"

Cohesion: 0.33
Nodes (12): getCineMatchPool(), getWatchedSeeds(), recentUniqueSeeds(), shuffle(), toCandidate(), WatchedSeed, getMovieRecommendations(), getMovieSimilar() (+4 more)

### Community 31 - "RankingScreen.tsx"

Cohesion: 0.06
Nodes (59): HomeScreenProps, ActivitiesScreen(), ActivitiesScreenProps, formatTimestamp(), AchievementIcon(), getIcon(), getLongestStreak(), LEVEL_META (+51 more)

### Community 35 - "useFavorites.ts"

Cohesion: 0.31
Nodes (8): ProfileSummary(), ProfileSummaryProps, FAVORITES_QUERY_KEY, useFavorites(), addFavorite(), listFavorites(), removeFavorite(), UserFavorite

### Community 36 - "ChangelogsScreen.tsx"

Cohesion: 0.31
Nodes (6): ChangelogsScreen(), formatDate(), LatestUpdatesSection(), ChangelogEntry, ChangelogLinkItem, CHANGELOGS

### Community 37 - "FaqScreen.tsx"

Cohesion: 0.40
Nodes (5): FAQ_SECTIONS, FaqItem, FaqScreen(), FaqSection, normalizeSearchValue()

### Community 38 - "Instruções para agentes de IA"

Cohesion: 0.50
Nodes (3): Atualização do grafo, Graphify, Instruções para agentes de IA

## Knowledge Gaps

- **224 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+219 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **Why does `RankedUser` connect `RankedUser` to `localData.ts`, `CineMatchPage.tsx`, `useFavorites.ts`, `App.tsx`, `app.ts`, `appData.ts`, `DashboardTab.tsx`, `RankingScreen.tsx`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Why does `PersonalMovie` connect `RankingScreen.tsx` to `localData.ts`, `SeriesDetailScreen.tsx`, `usePersonalMovies.ts`, `app.ts`, `RankedUser`, `appData.ts`, `HomeScreen.tsx`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Why does `SeriesEntry` connect `RankingScreen.tsx` to `localData.ts`, `SeriesDetailScreen.tsx`, `app.ts`, `useSeries.ts`, `appData.ts`, `HomeScreen.tsx`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _224 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `localData.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06798245614035088 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.0425531914893617 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
