# Graph Report - CineRats  (2026-08-21)

## Corpus Check
- 88 files · ~184,819 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 699 nodes · 1689 edges · 44 communities (38 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `899e2621`
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
- app.ts
- withFallback
- AvatarDisplay.tsx
- RankedUser
- UserEventBell.tsx
- ErrorBoundary
- SuggestMovieModal.tsx
- dependencies
- React + TypeScript + Vite
- PlatformSelect.tsx
- OscarPredictionsSection.tsx
- UserSidebar.tsx
- tsconfig.json
- vercel.json
- CineRats — Guia de Design
- useFavorites.ts
- HomeScreen.tsx
- tmdb.ts
- DashboardTab.tsx
- UserDropdownMenu.tsx
- useImportTvTime.ts
- getMovieDetailsWithFallback
- PersonDetailScreen.tsx
- SeriesCard.tsx
- RankingScreen.tsx
- SeriesDetailScreen.tsx
- ChangelogsScreen.tsx
- FaqScreen.tsx
- Instruções para agentes de IA
- ConfirmPasswordResetScreen.tsx
- useUsers.ts
- tmdbCache.ts
- SimilarMediaSection.tsx
- useNotifications.ts

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
- `HomeScreen()` --indirect_call--> `getTopRatedMovies()`  [INFERRED]
  src/components/home/HomeScreen.tsx → src/lib/tmdb.ts
- `HomeScreen()` --indirect_call--> `getTopRatedSeries()`  [INFERRED]
  src/components/home/HomeScreen.tsx → src/lib/tmdb.ts
- `HomeScreen()` --indirect_call--> `getWeeklyTrendingMedia()`  [INFERRED]
  src/components/home/HomeScreen.tsx → src/lib/tmdb.ts
- `AdminPanelProps` --references--> `RankedUser`  [EXTRACTED]
  src/components/layout/AdminPanel.tsx → src/types/app.ts
- `DashboardTabProps` --references--> `RankedUser`  [EXTRACTED]
  src/components/layout/DashboardTab.tsx → src/types/app.ts

## Import Cycles
- None detected.

## Communities (44 total, 6 thin omitted)

### Community 0 - "appData.ts"
Cohesion: 0.18
Nodes (17): useSeries(), useSeriesMutations(), useSeriesQuery(), apiClient, activityMessage(), addSeries(), ApiActivity, AVATAR_IDS (+9 more)

### Community 1 - "localData.ts"
Cohesion: 0.08
Nodes (87): encoder, hashPassword(), normalizeUsername(), readLegacyMovieData(), readLegacySeriesData(), addActivity(), addFavorite(), addOscarMovie() (+79 more)

### Community 2 - "MovieDetailScreen.tsx"
Cohesion: 0.08
Nodes (45): SharedItem, ShareReviewModal(), ShareReviewModalProps, AddMovieDialog(), AddMovieDialogProps, CardMovie, MovieCard(), MovieCardProps (+37 more)

### Community 3 - "devDependencies"
Cohesion: 0.06
Nodes (34): eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, devDependencies, eslint, @eslint/js (+26 more)

### Community 4 - "App.tsx"
Cohesion: 0.12
Nodes (14): ADMIN_USERNAME, readStoredSession(), AuthScreen(), AuthScreenProps, Mode, EnterCodeScreen(), EnterCodeScreenProps, RequestPasswordResetScreen() (+6 more)

### Community 5 - "compilerOptions"
Cohesion: 0.07
Nodes (26): DOM, DOM.Iterable, src, vite/client, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, jsx (+18 more)

### Community 6 - "achievements.ts"
Cohesion: 0.16
Nodes (17): LEVEL_ORDER, AchievementBadge(), ACHIEVEMENTS, COMEDY_MOVIES, countRatedMovies(), countRatedSeries(), FAMILY_MOVIES, getAchievementProgress() (+9 more)

### Community 7 - "compilerOptions"
Cohesion: 0.09
Nodes (22): node, vite.config.ts, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection (+14 more)

### Community 8 - "app.ts"
Cohesion: 0.17
Nodes (15): CineMatchModal(), CineMatchModalProps, SuggestMovieModalProps, useCineMatch(), getCineMatchSuggestion(), DEFAULT_EDUMZZ_SERIES, DEFAULT_OSCAR_MOVIES, LegacyMovie (+7 more)

### Community 9 - "withFallback"
Cohesion: 0.21
Nodes (18): App(), runBootstrap(), adminResetPassword(), changePassword(), clearAppDataCache(), confirmPasswordReset(), deleteCurrentUser(), getCurrentSessionUser() (+10 more)

### Community 10 - "AvatarDisplay.tsx"
Cohesion: 0.27
Nodes (9): AvatarDisplay(), AvatarDisplayProps, ProfileAvatarModal(), ProfileAvatarModalProps, AVATAR_OPTIONS, avatarEmoji(), CUSTOM_AVATAR_PREFIX, customAvatarSrc() (+1 more)

### Community 11 - "RankedUser"
Cohesion: 0.33
Nodes (13): HomeScreenProps, ProfileSummaryProps, RankingScreenProps, AchievementBadgeProps, UserAchievements(), UserAchievementsProps, Achievement, AchievementProgressContext (+5 more)

### Community 12 - "UserEventBell.tsx"
Cohesion: 0.27
Nodes (10): formatTimestamp(), readSeenTimestamp(), UserEventBell(), UserEventBellProps, writeSeenTimestamp(), useUserActivity(), listUserActivity(), HEADER_MENU_OPEN_EVENT (+2 more)

### Community 14 - "SuggestMovieModal.tsx"
Cohesion: 0.31
Nodes (8): GlobalSearch(), GlobalSearchProps, SuggestMovieModal(), useSuggestMovie(), suggestMovieToUser(), searchMulti(), searchPeople(), TMDBMultiResult

### Community 15 - "dependencies"
Cohesion: 0.05
Nodes (41): axios, clsx, embla-carousel-react, html2canvas, lucide-react, @microsoft/clarity, motion, dependencies (+33 more)

### Community 16 - "React + TypeScript + Vite"
Cohesion: 0.50
Nodes (3): Expanding the ESLint configuration, React Compiler, React + TypeScript + Vite

### Community 18 - "OscarPredictionsSection.tsx"
Cohesion: 0.23
Nodes (11): CATEGORIES, CategoryCard(), CategoryCardProps, CategoryConfig, getTmdbImageUrl(), OscarPredictionsSection(), OscarPredictionsSectionProps, useOscarPredictions() (+3 more)

### Community 19 - "UserSidebar.tsx"
Cohesion: 0.16
Nodes (15): createSessionVariant(), entryWeight(), getRecommendationSeeds(), normalizeTitle(), RecommendationItem, RecommendationLists, RECOMMENDATIONS_STORAGE_KEY_PREFIX, RecommendationSeed (+7 more)

### Community 22 - "CineRats — Guia de Design"
Cohesion: 0.10
Nodes (20): 10. Receita para novas telas, 11. Consistência de implementação, 1. Identidade visual, 2. Tokens de cor, 3. Tipografia, 4. Espaçamento, dimensão e proporção, 5. Bordas, raios e elevação, 6. Layout e responsividade (+12 more)

### Community 24 - "useFavorites.ts"
Cohesion: 0.31
Nodes (8): ProfileSummary(), FAVORITES_QUERY_KEY, useFavorites(), addFavorite(), listFavorites(), listUserAchievementIds(), removeFavorite(), UserFavorite

### Community 25 - "HomeScreen.tsx"
Cohesion: 0.20
Nodes (14): HomeScreen(), MediaType, toHomeMedia(), WatchedSeed, buildRecommendations(), getMovieRecommendations(), getMovieSimilar(), getRecommendationList() (+6 more)

### Community 27 - "tmdb.ts"
Cohesion: 0.13
Nodes (21): CachedHomeCatalog, FAVORITE_GENRE_MIN_RATING, getDiscoverByGenres(), getFavoriteGenreRecommendations(), getHomeCatalog(), getRandomTopRatedCatalog(), getTopRatedMovies(), getTopRatedSeries() (+13 more)

### Community 28 - "DashboardTab.tsx"
Cohesion: 0.14
Nodes (18): DashboardTab(), DashboardTabProps, formatDate(), PreferenceSearchInput(), PreferenceSearchInputProps, PreferenceSearchItem, useDeleteReviewMutation(), useMediaReviews() (+10 more)

### Community 29 - "UserDropdownMenu.tsx"
Cohesion: 0.27
Nodes (7): AdminPanel(), AdminPanelProps, ChangePasswordModal(), ChangePasswordModalProps, UserDropdownMenu(), UserDropdownMenuProps, SessionUser

### Community 30 - "useImportTvTime.ts"
Cohesion: 0.22
Nodes (12): ImportTvTimeModal(), ImportTvTimeModalProps, ImportTvTimePage(), ImportTvTimePageProps, useImportTvTime(), DataImport, downloadImportErrorsCSV(), getImportErrors() (+4 more)

### Community 31 - "getMovieDetailsWithFallback"
Cohesion: 0.33
Nodes (10): SidebarMovieItem(), SidebarRecommendationItem(), SynopsisModal(), SynopsisModalProps, getDetailsWithOverviewFallback(), getMediaDetailsMatchingTitle(), getMediaDetailsWithFallback(), getMovieDetailsWithFallback() (+2 more)

### Community 32 - "PersonDetailScreen.tsx"
Cohesion: 0.33
Nodes (8): getAge(), getCreditDate(), getCreditTitle(), PersonDetailScreen(), PersonDetailScreenProps, PersonPageMode, getPersonDetailsWithCredits(), TMDBCombinedCredit

### Community 33 - "SeriesCard.tsx"
Cohesion: 0.22
Nodes (13): AddSeriesDialog(), AddSeriesDialogProps, SeriesCard(), SeriesCardProps, SeriesSectionProps, Series, updateSeriesStreaming(), getTvSeasonEpisodes() (+5 more)

### Community 34 - "RankingScreen.tsx"
Cohesion: 0.27
Nodes (8): AchievementIcon(), getIcon(), getLongestStreak(), LEVEL_META, MCOIN_RULES, RankingScreen(), SECRET_META, getFavoriteDirector()

### Community 35 - "SeriesDetailScreen.tsx"
Cohesion: 0.31
Nodes (8): WatchedTimingDialog(), WatchedTimingDialogProps, SeriesDetailScreen(), SeriesDetailScreenProps, getTvCredits(), getTvSimilarWithFallback(), getTvWatchProviders(), getTvYouTubeTrailer()

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
Cohesion: 0.31
Nodes (8): useAvatarMutation(), useAvatarUploadMutation(), useUsers(), fallbackAvatar(), listRankedUsers(), listUsers(), updateUserAvatar(), uploadAvatarImage()

### Community 41 - "tmdbCache.ts"
Cohesion: 0.31
Nodes (5): getTvDetails(), TMDBTvDetails, CachedTvDetails, clearOldestCaches(), getTvDetailsWithCache()

### Community 42 - "SimilarMediaSection.tsx"
Cohesion: 0.40
Nodes (5): SimilarMediaSection(), SimilarMediaSectionProps, SIMILAR_MEDIA_MIN_RATING, TMDBHomeMedia, TMDBRecommendationItem

## Knowledge Gaps
- **182 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+177 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `RankedUser` connect `RankedUser` to `appData.ts`, `localData.ts`, `RankingScreen.tsx`, `App.tsx`, `achievements.ts`, `app.ts`, `SuggestMovieModal.tsx`, `UserSidebar.tsx`, `DashboardTab.tsx`, `UserDropdownMenu.tsx`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `PersonalMovie` connect `RankedUser` to `appData.ts`, `localData.ts`, `MovieDetailScreen.tsx`, `RankingScreen.tsx`, `achievements.ts`, `app.ts`, `SuggestMovieModal.tsx`, `UserSidebar.tsx`, `HomeScreen.tsx`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Why does `SeriesEntry` connect `RankedUser` to `appData.ts`, `SeriesCard.tsx`, `RankingScreen.tsx`, `localData.ts`, `achievements.ts`, `app.ts`, `UserSidebar.tsx`, `HomeScreen.tsx`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _182 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `localData.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07609805924412666 - nodes in this community are weakly interconnected._
- **Should `MovieDetailScreen.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08116883116883117 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._