# Graph Report - CineRats (2026-08-31)

## Corpus Check

- 88 files · ~185,476 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary

- 699 nodes · 1690 edges · 41 communities (32 shown, 9 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness

- Built from commit: `5dc64e25`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)

- appData.ts
- localData.ts
- MovieDetailScreen.tsx
- devDependencies
- AuthScreen.tsx
- compilerOptions
- RankingScreen.tsx
- compilerOptions
- UserSidebar
- App.tsx
- AvatarDisplay.tsx
- EnterCodeScreen.tsx
- app.ts
- ErrorBoundary
- GlobalSearch.tsx
- dependencies
- React + TypeScript + Vite
- PlatformSelect.tsx
- RequestPasswordResetScreen.tsx
- UserSidebar.tsx
- tsconfig.json
- vercel.json
- CineRats — Guia de Design
- useFavorites.ts
- HomeScreen.tsx
- tmdb.ts
- DashboardTab.tsx
- Header.tsx
- useImportTvTime.ts
- getMovieDetailsWithFallback
- PersonDetailScreen.tsx
- SeriesDetailScreen.tsx
- ProfilePageSkeleton.tsx
- ChangelogsScreen.tsx
- FaqScreen.tsx
- Instruções para agentes de IA
- ConfirmPasswordResetScreen.tsx
- useUsers.ts
- SimilarMediaSection.tsx

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

- `AdminPanelProps` --references--> `RankedUser` [EXTRACTED]
  src/components/layout/AdminPanel.tsx → src/types/app.ts
- `DashboardTabProps` --references--> `RankedUser` [EXTRACTED]
  src/components/layout/DashboardTab.tsx → src/types/app.ts
- `GlobalSearchProps` --references--> `RankedUser` [EXTRACTED]
  src/components/layout/GlobalSearch.tsx → src/types/app.ts
- `UserSidebarProps` --references--> `RankedUser` [EXTRACTED]
  src/components/layout/UserSidebar.tsx → src/types/app.ts
- `useMediaReviews()` --calls--> `listMediaReviews()` [EXTRACTED]
  src/hooks/useReviews.ts → src/lib/appData.ts

## Import Cycles

- None detected.

## Communities (41 total, 9 thin omitted)

### Community 0 - "appData.ts"

Cohesion: 0.15
Nodes (16): useNotifications(), apiClient, activityMessage(), ApiActivity, AVATAR_IDS, categoryFromApi, categoryToApi, fallbackAvatar() (+8 more)

### Community 1 - "localData.ts"

Cohesion: 0.07
Nodes (93): encoder, hashPassword(), normalizeUsername(), DEFAULT_EDUMZZ_SERIES, DEFAULT_OSCAR_MOVIES, LegacyMovie, LegacySeries, readLegacyMovieData() (+85 more)

### Community 2 - "MovieDetailScreen.tsx"

Cohesion: 0.12
Nodes (29): AddMovieDialog(), AddMovieDialogProps, CardMovie, MovieCard(), MovieCardProps, parseProviders(), parseTmdbFromSource(), ProviderItem (+21 more)

### Community 3 - "devDependencies"

Cohesion: 0.06
Nodes (34): eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, devDependencies, eslint, @eslint/js (+26 more)

### Community 4 - "AuthScreen.tsx"

Cohesion: 0.50
Nodes (3): AuthScreen(), AuthScreenProps, Mode

### Community 5 - "compilerOptions"

Cohesion: 0.07
Nodes (26): DOM, DOM.Iterable, src, vite/client, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, jsx (+18 more)

### Community 6 - "RankingScreen.tsx"

Cohesion: 0.08
Nodes (49): HomeScreenProps, ProfileSummaryProps, AchievementIcon(), getIcon(), getLongestStreak(), LEVEL_META, MCOIN_RULES, RankingScreen() (+41 more)

### Community 7 - "compilerOptions"

Cohesion: 0.09
Nodes (22): node, vite.config.ts, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection (+14 more)

### Community 8 - "UserSidebar"

Cohesion: 0.40
Nodes (5): UserSidebar(), usePersonalMoviesQuery(), getAnticipatedMovies(), getTrendingMovies(), listPersonalMovies()

### Community 9 - "App.tsx"

Cohesion: 0.22
Nodes (19): ADMIN_USERNAME, App(), runBootstrap(), readStoredSession(), LatestUpdatesSection(), useUsers(), adminResetPassword(), changePassword() (+11 more)

### Community 10 - "AvatarDisplay.tsx"

Cohesion: 0.27
Nodes (9): AvatarDisplay(), AvatarDisplayProps, ProfileAvatarModal(), ProfileAvatarModalProps, AVATAR_OPTIONS, avatarEmoji(), CUSTOM_AVATAR_PREFIX, customAvatarSrc() (+1 more)

### Community 12 - "app.ts"

Cohesion: 0.10
Nodes (29): AdminPanel(), AdminPanelProps, ChangePasswordModal(), ChangePasswordModalProps, CineMatchModal(), CineMatchModalProps, SuggestMovieModal(), SuggestMovieModalProps (+21 more)

### Community 14 - "GlobalSearch.tsx"

Cohesion: 0.47
Nodes (5): GlobalSearch(), GlobalSearchProps, searchMulti(), searchPeople(), TMDBMultiResult

### Community 15 - "dependencies"

Cohesion: 0.05
Nodes (41): axios, clsx, embla-carousel-react, html2canvas, lucide-react, @microsoft/clarity, motion, dependencies (+33 more)

### Community 16 - "React + TypeScript + Vite"

Cohesion: 0.50
Nodes (3): Expanding the ESLint configuration, React Compiler, React + TypeScript + Vite

### Community 19 - "UserSidebar.tsx"

Cohesion: 0.15
Nodes (21): buildRecommendations(), createSessionVariant(), entryWeight(), getRecommendationSeeds(), normalizeTitle(), RecommendationItem, RecommendationLists, RECOMMENDATIONS_STORAGE_KEY_PREFIX (+13 more)

### Community 22 - "CineRats — Guia de Design"

Cohesion: 0.10
Nodes (20): 10. Receita para novas telas, 11. Consistência de implementação, 1. Identidade visual, 2. Tokens de cor, 3. Tipografia, 4. Espaçamento, dimensão e proporção, 5. Bordas, raios e elevação, 6. Layout e responsividade (+12 more)

### Community 24 - "useFavorites.ts"

Cohesion: 0.31
Nodes (8): ProfileSummary(), FAVORITES_QUERY_KEY, useFavorites(), addFavorite(), listFavorites(), listUserAchievementIds(), removeFavorite(), UserFavorite

### Community 25 - "HomeScreen.tsx"

Cohesion: 0.17
Nodes (12): HomeScreen(), MediaType, toHomeMedia(), WatchedSeed, getHomeCatalog(), getRandomTopRatedCatalog(), getTopRatedMovies(), getTopRatedSeries() (+4 more)

### Community 27 - "tmdb.ts"

Cohesion: 0.14
Nodes (16): CachedHomeCatalog, FAVORITE_GENRE_MIN_RATING, getFavoriteGenreRecommendations(), getYouTubeTrailer(), HOME_TOP_RATED_REQUIREMENTS, randomGenrePage(), readCachedHomeCatalog(), selectYouTubeTrailer() (+8 more)

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

### Community 33 - "SeriesDetailScreen.tsx"

Cohesion: 0.07
Nodes (48): SharedItem, ShareReviewModal(), ShareReviewModalProps, WatchedTimingDialog(), WatchedTimingDialogProps, AddSeriesDialog(), AddSeriesDialogProps, SeriesCard() (+40 more)

### Community 36 - "ChangelogsScreen.tsx"

Cohesion: 0.38
Nodes (5): ChangelogsScreen(), formatDate(), ChangelogEntry, ChangelogLinkItem, CHANGELOGS

### Community 37 - "FaqScreen.tsx"

Cohesion: 0.40
Nodes (5): FAQ_SECTIONS, FaqItem, FaqScreen(), FaqSection, normalizeSearchValue()

### Community 38 - "Instruções para agentes de IA"

Cohesion: 0.50
Nodes (3): Atualização do grafo, Graphify, Instruções para agentes de IA

### Community 40 - "useUsers.ts"

Cohesion: 0.60
Nodes (4): useAvatarMutation(), useAvatarUploadMutation(), updateUserAvatar(), uploadAvatarImage()

### Community 42 - "SimilarMediaSection.tsx"

Cohesion: 0.40
Nodes (5): SimilarMediaSection(), SimilarMediaSectionProps, SIMILAR_MEDIA_MIN_RATING, TMDBHomeMedia, TMDBRecommendationItem

## Knowledge Gaps

- **182 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+177 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **Why does `RankedUser` connect `RankingScreen.tsx` to `appData.ts`, `localData.ts`, `App.tsx`, `app.ts`, `GlobalSearch.tsx`, `UserSidebar.tsx`, `DashboardTab.tsx`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `PersonalMovie` connect `RankingScreen.tsx` to `appData.ts`, `localData.ts`, `MovieDetailScreen.tsx`, `app.ts`, `UserSidebar.tsx`, `HomeScreen.tsx`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Why does `SeriesEntry` connect `RankingScreen.tsx` to `appData.ts`, `localData.ts`, `SeriesDetailScreen.tsx`, `app.ts`, `UserSidebar.tsx`, `HomeScreen.tsx`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _182 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `appData.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.14736842105263157 - nodes in this community are weakly interconnected._
- **Should `localData.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06798245614035088 - nodes in this community are weakly interconnected._
- **Should `MovieDetailScreen.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11596638655462185 - nodes in this community are weakly interconnected._
