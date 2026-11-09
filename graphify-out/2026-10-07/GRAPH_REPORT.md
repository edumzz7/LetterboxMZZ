# Graph Report - CineRats  (2026-10-07)

## Corpus Check
- 105 files · ~250,715 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 812 nodes · 2021 edges · 44 communities (40 shown, 4 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 18 edges (avg confidence: 0.78)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `566c03c9`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ImportTvTimePage.tsx
- localData.ts
- useSeries.ts
- devDependencies
- withFallback
- compilerOptions
- App.tsx
- compilerOptions
- SeriesDetailScreen.tsx
- HomeScreen.tsx
- tmdbCache.ts
- tmdb.ts
- app.ts
- ErrorBoundary
- AvatarDisplay.tsx
- dependencies
- React + TypeScript + Vite
- PlatformSelect.tsx
- getMovieDetailsWithFallback
- LoadingSkeleton.tsx
- tsconfig.json
- vercel.json
- CineRats — Guia de Design
- cinematch.ts
- appData.ts
- PublicDashboardLite.tsx
- SimilarMediaSection.tsx
- DashboardTab.tsx
- achievements.ts
- RankingScreen.tsx
- UserSidebar.tsx
- GlobalSearch.tsx
- OscarPredictionsSection.tsx
- useFavorites.ts
- ChangelogsScreen.tsx
- FaqScreen.tsx
- Instruções para agentes de IA
- ConfirmPasswordResetScreen.tsx
- SuggestMovieModal.tsx
- useUsers.ts
- SessionUser
- DashboardTab

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
- `App()` --indirect_call--> `listPublicRanking()`  [INFERRED]
  src/App.tsx → src/lib/appData.ts
- `Props` --references--> `RankedUser`  [EXTRACTED]
  src/components/layout/CineMatchPage.tsx → src/types/app.ts
- `DashboardTabProps` --references--> `RankedUser`  [EXTRACTED]
  src/components/layout/DashboardTab.tsx → src/types/app.ts
- `GlobalSearchProps` --references--> `RankedUser`  [EXTRACTED]
  src/components/layout/GlobalSearch.tsx → src/types/app.ts
- `ProfileSummaryProps` --references--> `RankedUser`  [EXTRACTED]
  src/components/layout/ProfileSummary.tsx → src/types/app.ts

## Import Cycles
- None detected.

## Communities (44 total, 4 thin omitted)

### Community 0 - "ImportTvTimePage.tsx"
Cohesion: 0.16
Nodes (19): Props, ImportTvTimePage(), download(), platforms, Props, statuses, StatusIcon(), isActiveImport() (+11 more)

### Community 1 - "localData.ts"
Cohesion: 0.08
Nodes (87): encoder, hashPassword(), normalizeUsername(), readLegacyMovieData(), readLegacySeriesData(), addActivity(), addFavorite(), addOscarMovie() (+79 more)

### Community 2 - "useSeries.ts"
Cohesion: 0.09
Nodes (38): CineMatchPage(), accept(), draw(), Props, SharedItem, ShareReviewModal(), ShareReviewModalProps, waitForRenderedImages() (+30 more)

### Community 3 - "devDependencies"
Cohesion: 0.06
Nodes (34): eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, devDependencies, eslint, @eslint/js (+26 more)

### Community 4 - "withFallback"
Cohesion: 0.18
Nodes (18): App(), runBootstrap(), readStoredSession(), adminResetPassword(), changePassword(), clearAppDataCache(), confirmPasswordReset(), deleteCurrentUser() (+10 more)

### Community 5 - "compilerOptions"
Cohesion: 0.07
Nodes (26): DOM, DOM.Iterable, src, vite/client, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, jsx (+18 more)

### Community 6 - "App.tsx"
Cohesion: 0.09
Nodes (20): ADMIN_USERNAME, OTHER_PROFILE_TABS, PROFILE_NAV_ICONS, AuthScreen(), AuthScreenProps, Mode, EnterCodeScreen(), EnterCodeScreenProps (+12 more)

### Community 7 - "compilerOptions"
Cohesion: 0.09
Nodes (22): node, vite.config.ts, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection (+14 more)

### Community 8 - "SeriesDetailScreen.tsx"
Cohesion: 0.06
Nodes (62): AddMovieDialog(), AddMovieDialogProps, CardMovie, MovieCard(), MovieCardProps, parseProviders(), parseTmdbFromSource(), ProviderItem (+54 more)

### Community 9 - "HomeScreen.tsx"
Cohesion: 0.17
Nodes (14): HomeScreen(), MediaType, toHomeMedia(), WatchedSeed, PublicHome(), listPublicRanking(), listRecentPublicReviews(), getReviewReaction() (+6 more)

### Community 10 - "tmdbCache.ts"
Cohesion: 0.32
Nodes (4): TMDBTvDetails, CachedTvDetails, clearOldestCaches(), getTvDetailsWithCache()

### Community 11 - "tmdb.ts"
Cohesion: 0.12
Nodes (21): CachedHomeCatalog, FAVORITE_GENRE_MIN_RATING, getDiscoverByGenres(), getFavoriteGenreRecommendations(), getHomeCatalog(), getRandomTopRatedCatalog(), getYouTubeTrailer(), HOME_TOP_RATED_REQUIREMENTS (+13 more)

### Community 12 - "app.ts"
Cohesion: 0.16
Nodes (15): CineMatchModal(), useCineMatch(), getCineMatchSuggestion(), DEFAULT_EDUMZZ_SERIES, DEFAULT_OSCAR_MOVIES, LegacyMovie, LegacySeries, AnticipatedMovie (+7 more)

### Community 13 - "ErrorBoundary"
Cohesion: 0.25
Nodes (3): ErrorBoundary, ErrorBoundaryProps, ErrorBoundaryState

### Community 14 - "AvatarDisplay.tsx"
Cohesion: 0.13
Nodes (18): AvatarDisplay(), AvatarDisplayProps, ProfileAvatarModal(), ProfileAvatarModalProps, formatDate(), ReviewsScreen(), Skeleton(), useDeleteReviewMutation() (+10 more)

### Community 15 - "dependencies"
Cohesion: 0.05
Nodes (41): axios, clsx, embla-carousel-react, html2canvas, lucide-react, @microsoft/clarity, motion, dependencies (+33 more)

### Community 16 - "React + TypeScript + Vite"
Cohesion: 0.50
Nodes (3): Expanding the ESLint configuration, React Compiler, React + TypeScript + Vite

### Community 18 - "getMovieDetailsWithFallback"
Cohesion: 0.36
Nodes (8): SynopsisModal(), SynopsisModalProps, getDetailsWithOverviewFallback(), getMediaDetailsMatchingTitle(), getMediaDetailsWithFallback(), getMovieDetailsWithFallback(), getTvDetailsRawWithFallback(), normalizeMediaTitle()

### Community 19 - "LoadingSkeleton.tsx"
Cohesion: 0.07
Nodes (35): ActivitiesScreen(), ActivitiesScreenProps, formatTimestamp(), ChangePasswordModal(), ChangePasswordModalProps, UserDropdownMenu(), formatTimestamp(), readSeenTimestamp() (+27 more)

### Community 22 - "CineRats — Guia de Design"
Cohesion: 0.10
Nodes (20): 10. Receita para novas telas, 11. Consistência de implementação, 1. Identidade visual, 2. Tokens de cor, 3. Tipografia, 4. Espaçamento, dimensão e proporção, 5. Bordas, raios e elevação, 6. Layout e responsividade (+12 more)

### Community 24 - "cinematch.ts"
Cohesion: 0.28
Nodes (14): listSeries(), getCineMatchPool(), getWatchedSeeds(), recentUniqueSeeds(), shuffle(), toCandidate(), WatchedSeed, getMovieRecommendations() (+6 more)

### Community 25 - "appData.ts"
Cohesion: 0.12
Nodes (21): useNotifications(), activityMessage(), addSeries(), ApiActivity, ApiSeriesWatchEntry, AVATAR_IDS, categoryFromApi, categoryToApi (+13 more)

### Community 27 - "PublicDashboardLite.tsx"
Cohesion: 0.18
Nodes (12): getLongestStreak(), RankingScreen(), PublicDashboardLite(), PublicTab, LEVEL_ORDER, AchievementBadge(), AchievementBadgeProps, UserAchievements() (+4 more)

### Community 28 - "SimilarMediaSection.tsx"
Cohesion: 0.40
Nodes (5): SimilarMediaSection(), SimilarMediaSectionProps, SIMILAR_MEDIA_MIN_RATING, TMDBCatalogItem, TMDBRecommendationItem

### Community 29 - "DashboardTab.tsx"
Cohesion: 0.22
Nodes (10): DashboardTabProps, formatDate(), PreferenceSearchInput(), PreferenceSearchInputProps, PreferenceSearchItem, FAVORITE_GENRE_BY_KEY, FAVORITE_GENRES, FavoriteGenreOption (+2 more)

### Community 30 - "achievements.ts"
Cohesion: 0.22
Nodes (15): COMEDY_MOVIES, countRatedMovies(), countRatedSeries(), FAMILY_MOVIES, getAchievementProgress(), getFavoriteDirector(), HORROR_SERIES, maxSevenDayMovieCount() (+7 more)

### Community 31 - "RankingScreen.tsx"
Cohesion: 0.19
Nodes (17): HomeScreenProps, AdminPanel(), AdminPanelProps, AchievementIcon(), getIcon(), LEVEL_META, MCOIN_RULES, RankingScreenProps (+9 more)

### Community 32 - "UserSidebar.tsx"
Cohesion: 0.21
Nodes (11): formatSidebarDate(), RECOMMENDATIONS_STORAGE_KEY_PREFIX, SidebarMediaItem(), SidebarMediaItemData, toSidebarMediaItems(), UserSidebar(), UserSidebarProps, formatLocalDate() (+3 more)

### Community 33 - "GlobalSearch.tsx"
Cohesion: 0.32
Nodes (7): GlobalSearch(), GlobalSearchProps, searchMulti(), searchPeople(), TMDBMultiResult, TMDBPerson, TMDBPersonDetails

### Community 34 - "OscarPredictionsSection.tsx"
Cohesion: 0.21
Nodes (12): CATEGORIES, CategoryCard(), CategoryCardProps, CategoryConfig, getTmdbImageUrl(), OscarPredictionsSection(), OscarPredictionsSectionProps, PredictionSearchResult (+4 more)

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

### Community 40 - "SuggestMovieModal.tsx"
Cohesion: 0.39
Nodes (6): CineMatchModalProps, SuggestMovieModal(), SuggestMovieModalProps, useSuggestMovie(), suggestMovieToUser(), AppUser

### Community 41 - "useUsers.ts"
Cohesion: 0.36
Nodes (7): useAvatarMutation(), useAvatarUploadMutation(), useUsers(), listRankedUsers(), listUsers(), updateUserAvatar(), uploadAvatarImage()

### Community 42 - "SessionUser"
Cohesion: 0.40
Nodes (5): UserDropdownMenuProps, PublicHeader(), PublicHeaderProps, SearchSlotProps, SessionUser

### Community 43 - "DashboardTab"
Cohesion: 0.50
Nodes (4): DashboardTab(), useUserReviews(), listUserReviews(), updateUserProfile()

## Knowledge Gaps
- **208 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+203 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `RankedUser` connect `RankingScreen.tsx` to `UserSidebar.tsx`, `GlobalSearch.tsx`, `useSeries.ts`, `useFavorites.ts`, `localData.ts`, `App.tsx`, `SuggestMovieModal.tsx`, `SessionUser`, `app.ts`, `AvatarDisplay.tsx`, `LoadingSkeleton.tsx`, `appData.ts`, `PublicDashboardLite.tsx`, `DashboardTab.tsx`, `achievements.ts`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Why does `PersonalMovie` connect `RankingScreen.tsx` to `localData.ts`, `useSeries.ts`, `SuggestMovieModal.tsx`, `HomeScreen.tsx`, `SeriesDetailScreen.tsx`, `app.ts`, `appData.ts`, `PublicDashboardLite.tsx`, `achievements.ts`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Why does `SeriesEntry` connect `RankingScreen.tsx` to `localData.ts`, `useSeries.ts`, `SeriesDetailScreen.tsx`, `HomeScreen.tsx`, `app.ts`, `appData.ts`, `PublicDashboardLite.tsx`, `achievements.ts`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _208 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `localData.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07609805924412666 - nodes in this community are weakly interconnected._
- **Should `useSeries.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._