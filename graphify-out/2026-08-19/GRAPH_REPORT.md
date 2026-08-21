# Graph Report - CineRats  (2026-08-18)

## Corpus Check
- 88 files · ~184,702 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 695 nodes · 1687 edges · 40 communities (35 shown, 5 thin omitted)
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
- achievements.ts
- compilerOptions
- RankedUser
- OscarPredictionsSection.tsx
- AvatarDisplay.tsx
- app.ts
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
- RankingScreen.tsx
- useImportTvTime.ts
- getMovieDetailsWithFallback
- PersonDetailScreen.tsx
- useSeries.ts
- tmdbCache.ts
- useFavorites.ts
- ChangelogsScreen.tsx
- FaqScreen.tsx
- Instruções para agentes de IA
- ConfirmPasswordResetScreen.tsx

## God Nodes (most connected - your core abstractions)
1. `withFallback()` - 43 edges
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
- `SuggestMovieModalProps` --references--> `AppUser`  [EXTRACTED]
  src/components/layout/SuggestMovieModal.tsx → src/types/app.ts
- `UserSidebarProps` --references--> `RankedUser`  [EXTRACTED]
  src/components/layout/UserSidebar.tsx → src/types/app.ts
- `AchievementBadgeProps` --references--> `Achievement`  [EXTRACTED]
  src/components/ui/UserAchievements.tsx → src/lib/achievements.ts

## Import Cycles
- None detected.

## Communities (40 total, 5 thin omitted)

### Community 0 - "appData.ts"
Cohesion: 0.14
Nodes (16): useNotifications(), useAvatarMutation(), useAvatarUploadMutation(), apiClient, activityMessage(), ApiActivity, AVATAR_IDS, categoryFromApi (+8 more)

### Community 1 - "localData.ts"
Cohesion: 0.08
Nodes (86): encoder, hashPassword(), normalizeUsername(), readLegacyMovieData(), readLegacySeriesData(), addActivity(), addFavorite(), addOscarMovie() (+78 more)

### Community 2 - "MovieDetailScreen.tsx"
Cohesion: 0.09
Nodes (45): SharedItem, ShareReviewModal(), ShareReviewModalProps, MovieDetailScreen(), MovieDetailScreenProps, WatchedTimingDialog(), WatchedTimingDialogProps, AddSeriesDialog() (+37 more)

### Community 3 - "devDependencies"
Cohesion: 0.06
Nodes (34): eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, devDependencies, eslint, @eslint/js (+26 more)

### Community 4 - "App.tsx"
Cohesion: 0.10
Nodes (25): ADMIN_USERNAME, App(), runBootstrap(), readStoredSession(), AuthScreen(), AuthScreenProps, Mode, EnterCodeScreen() (+17 more)

### Community 5 - "compilerOptions"
Cohesion: 0.07
Nodes (26): DOM, DOM.Iterable, src, vite/client, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, jsx (+18 more)

### Community 6 - "achievements.ts"
Cohesion: 0.17
Nodes (15): LEVEL_ORDER, AchievementBadge(), ACHIEVEMENTS, COMEDY_MOVIES, FAMILY_MOVIES, getAchievementProgress(), HORROR_SERIES, maxSevenDayMovieCount() (+7 more)

### Community 7 - "compilerOptions"
Cohesion: 0.09
Nodes (22): node, vite.config.ts, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection (+14 more)

### Community 8 - "RankedUser"
Cohesion: 0.30
Nodes (12): HomeScreenProps, AdminPanel(), AdminPanelProps, ProfileSummaryProps, RankingScreenProps, UserAchievementsProps, Achievement, AchievementProgressContext (+4 more)

### Community 9 - "OscarPredictionsSection.tsx"
Cohesion: 0.23
Nodes (11): CATEGORIES, CategoryCard(), CategoryCardProps, CategoryConfig, getTmdbImageUrl(), OscarPredictionsSection(), OscarPredictionsSectionProps, useOscarPredictions() (+3 more)

### Community 10 - "AvatarDisplay.tsx"
Cohesion: 0.25
Nodes (10): AvatarDisplay(), AvatarDisplayProps, ProfileAvatarModal(), ProfileAvatarModalProps, uploadAvatarImage(), AVATAR_OPTIONS, avatarEmoji(), CUSTOM_AVATAR_PREFIX (+2 more)

### Community 11 - "app.ts"
Cohesion: 0.18
Nodes (14): CineMatchModal(), CineMatchModalProps, useCineMatch(), getCineMatchSuggestion(), DEFAULT_EDUMZZ_SERIES, DEFAULT_OSCAR_MOVIES, LegacyMovie, LegacySeries (+6 more)

### Community 12 - "UserDropdownMenu.tsx"
Cohesion: 0.18
Nodes (14): ChangePasswordModal(), ChangePasswordModalProps, UserDropdownMenu(), UserDropdownMenuProps, formatTimestamp(), readSeenTimestamp(), UserEventBell(), UserEventBellProps (+6 more)

### Community 14 - "SuggestMovieModal.tsx"
Cohesion: 0.27
Nodes (9): GlobalSearch(), GlobalSearchProps, SuggestMovieModal(), SuggestMovieModalProps, useSuggestMovie(), suggestMovieToUser(), searchMulti(), searchPeople() (+1 more)

### Community 15 - "dependencies"
Cohesion: 0.05
Nodes (41): axios, clsx, embla-carousel-react, html2canvas, lucide-react, @microsoft/clarity, motion, dependencies (+33 more)

### Community 16 - "React + TypeScript + Vite"
Cohesion: 0.50
Nodes (3): Expanding the ESLint configuration, React Compiler, React + TypeScript + Vite

### Community 18 - "MovieCard.tsx"
Cohesion: 0.15
Nodes (19): AddMovieDialog(), AddMovieDialogProps, CardMovie, MovieCard(), MovieCardProps, parseProviders(), parseTmdbFromSource(), ProviderItem (+11 more)

### Community 19 - "UserSidebar.tsx"
Cohesion: 0.15
Nodes (21): buildRecommendations(), createSessionVariant(), entryWeight(), getRecommendationSeeds(), normalizeTitle(), RecommendationItem, RecommendationLists, RECOMMENDATIONS_STORAGE_KEY_PREFIX (+13 more)

### Community 22 - "CineRats — Guia de Design"
Cohesion: 0.10
Nodes (20): 10. Receita para novas telas, 11. Consistência de implementação, 1. Identidade visual, 2. Tokens de cor, 3. Tipografia, 4. Espaçamento, dimensão e proporção, 5. Bordas, raios e elevação, 6. Layout e responsividade (+12 more)

### Community 24 - "withFallback"
Cohesion: 0.18
Nodes (18): UserSidebar(), usePersonalMovieMutations(), usePersonalMoviesQuery(), useDeleteReviewMutation(), useMediaReviews(), addPersonalMovie(), deletePersonalMovie(), deleteReview() (+10 more)

### Community 25 - "HomeScreen.tsx"
Cohesion: 0.15
Nodes (15): HomeScreen(), MediaType, toHomeMedia(), WatchedSeed, SimilarMediaSectionProps, getHomeCatalog(), getRandomTopRatedCatalog(), getTopRatedMovies() (+7 more)

### Community 27 - "tmdb.ts"
Cohesion: 0.14
Nodes (16): CachedHomeCatalog, FAVORITE_GENRE_MIN_RATING, getFavoriteGenreRecommendations(), getYouTubeTrailer(), HOME_TOP_RATED_REQUIREMENTS, randomGenrePage(), readCachedHomeCatalog(), selectYouTubeTrailer() (+8 more)

### Community 28 - "DashboardTab.tsx"
Cohesion: 0.18
Nodes (14): DashboardTab(), DashboardTabProps, formatDate(), PreferenceSearchInput(), PreferenceSearchInputProps, PreferenceSearchItem, useUserReviews(), updateUserProfile() (+6 more)

### Community 29 - "RankingScreen.tsx"
Cohesion: 0.20
Nodes (15): AchievementIcon(), getIcon(), getLongestStreak(), LEVEL_META, MCOIN_RULES, RankingScreen(), SECRET_META, AchievementBadgeProps (+7 more)

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
Cohesion: 0.39
Nodes (8): useSeriesMutations(), useSeriesQuery(), addSeries(), deleteSeries(), getSeriesStatus(), listSeries(), rateSeries(), updateSeries()

### Community 34 - "tmdbCache.ts"
Cohesion: 0.32
Nodes (4): TMDBTvDetails, CachedTvDetails, clearOldestCaches(), getTvDetailsWithCache()

### Community 35 - "useFavorites.ts"
Cohesion: 0.38
Nodes (6): ProfileSummary(), FAVORITES_QUERY_KEY, useFavorites(), addFavorite(), removeFavorite(), UserFavorite

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

- **Why does `RankedUser` connect `RankedUser` to `appData.ts`, `localData.ts`, `App.tsx`, `achievements.ts`, `app.ts`, `UserDropdownMenu.tsx`, `SuggestMovieModal.tsx`, `UserSidebar.tsx`, `DashboardTab.tsx`, `RankingScreen.tsx`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `PersonalMovie` connect `RankedUser` to `appData.ts`, `localData.ts`, `achievements.ts`, `app.ts`, `SuggestMovieModal.tsx`, `MovieCard.tsx`, `UserSidebar.tsx`, `withFallback`, `HomeScreen.tsx`, `RankingScreen.tsx`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Why does `SeriesEntry` connect `RankedUser` to `appData.ts`, `useSeries.ts`, `MovieDetailScreen.tsx`, `localData.ts`, `achievements.ts`, `app.ts`, `UserSidebar.tsx`, `HomeScreen.tsx`, `RankingScreen.tsx`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _181 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `appData.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
- **Should `localData.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07732497387669801 - nodes in this community are weakly interconnected._
- **Should `MovieDetailScreen.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08521303258145363 - nodes in this community are weakly interconnected._