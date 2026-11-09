# Graph Report - CineRats  (2026-10-23)

## Corpus Check
- 129 files · ~260,235 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 963 nodes · 2366 edges · 51 communities (47 shown, 4 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 22 edges (avg confidence: 0.77)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `bd4c7e69`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ImportTvTimePage.tsx
- localData.ts
- useSeries.ts
- devDependencies
- GroupPage.test.tsx
- compilerOptions
- App.tsx
- compilerOptions
- ReviewModal.tsx
- groups.ts
- app.ts
- tmdb.ts
- UserSidebar.tsx
- ErrorBoundary
- UserDropdownMenu.tsx
- dependencies
- React + TypeScript + Vite
- PlatformSelect.tsx
- CatalogPage.tsx
- tsconfig.json
- vercel.json
- CineRats — Guia de Design
- GroupPage.tsx
- appData.ts
- PublicHome.tsx
- TmdbImage.tsx
- DashboardTab.tsx
- cinematch.ts
- RankingScreen.tsx
- GroupsPage.tsx
- AvatarDisplay.tsx
- SeriesDetailScreen.tsx
- useFavorites.ts
- ChangelogsScreen.tsx
- FaqScreen.tsx
- Instruções para agentes de IA
- ConfirmPasswordResetScreen.tsx
- getMovieDetailsWithFallback
- SeriesSection.tsx
- MovieDetailScreen.tsx
- GroupPage
- OscarPredictionsSection.tsx
- GroupAdminPanel.tsx
- MovieCard.tsx
- HomeScreen.tsx
- tmdbCache.ts
- favoriteGenres.ts
- useUsers.ts

## God Nodes (most connected - your core abstractions)
1. `withFallback()` - 45 edges
2. `RankedUser` - 32 edges
3. `PersonalMovie` - 23 edges
4. `App()` - 20 edges
5. `requireSession()` - 20 edges
6. `compilerOptions` - 20 edges
7. `AvatarDisplay()` - 19 edges
8. `addActivity()` - 18 edges
9. `deleteCurrentUser()` - 18 edges
10. `SeriesEntry` - 18 edges

## Surprising Connections (you probably didn't know these)
- `App()` --indirect_call--> `listPublicRanking()`  [INFERRED]
  src/App.tsx → src/lib/appData.ts
- `AdminPanelProps` --references--> `RankedUser`  [EXTRACTED]
  src/components/layout/AdminPanel.tsx → src/types/app.ts
- `DashboardTabProps` --references--> `RankedUser`  [EXTRACTED]
  src/components/layout/DashboardTab.tsx → src/types/app.ts
- `GlobalSearchProps` --references--> `RankedUser`  [EXTRACTED]
  src/components/layout/GlobalSearch.tsx → src/types/app.ts
- `ProfileSummaryProps` --references--> `RankedUser`  [EXTRACTED]
  src/components/layout/ProfileSummary.tsx → src/types/app.ts

## Import Cycles
- None detected.

## Communities (51 total, 4 thin omitted)

### Community 0 - "ImportTvTimePage.tsx"
Cohesion: 0.16
Nodes (19): Props, ImportTvTimePage(), download(), platforms, Props, statuses, StatusIcon(), isActiveImport() (+11 more)

### Community 1 - "localData.ts"
Cohesion: 0.07
Nodes (93): encoder, hashPassword(), normalizeUsername(), DEFAULT_EDUMZZ_SERIES, DEFAULT_OSCAR_MOVIES, LegacyMovie, LegacySeries, readLegacyMovieData() (+85 more)

### Community 2 - "useSeries.ts"
Cohesion: 0.15
Nodes (21): CineMatchPage(), accept(), draw(), WatchPartyHistory(), update(), useSeriesMutations(), apiClient, deleteSeries() (+13 more)

### Community 3 - "devDependencies"
Cohesion: 0.04
Nodes (46): eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, jsdom, devDependencies, eslint (+38 more)

### Community 4 - "GroupPage.test.tsx"
Cohesion: 0.16
Nodes (8): admin, api, navigation, ranking, api, navigation, renderWithProviders(), GroupRanking

### Community 5 - "compilerOptions"
Cohesion: 0.07
Nodes (26): DOM, DOM.Iterable, src, vite/client, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, jsx (+18 more)

### Community 6 - "App.tsx"
Cohesion: 0.07
Nodes (32): ADMIN_USERNAME, App(), runBootstrap(), OTHER_PROFILE_TABS, PROFILE_NAV_ICONS, readStoredSession(), AuthScreen(), AuthScreenProps (+24 more)

### Community 7 - "compilerOptions"
Cohesion: 0.09
Nodes (22): node, vite.config.ts, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection (+14 more)

### Community 8 - "ReviewModal.tsx"
Cohesion: 0.47
Nodes (8): ReviewModal(), ReviewModalProps, canEarnPointsForReview(), getReviewDeadlineHours(), getReviewDeadlineMessage(), MIN_REVIEW_LENGTH, sanitizeReviewText(), validateReviewText()

### Community 9 - "groups.ts"
Cohesion: 0.25
Nodes (15): GROUPS_QUERY_KEY, useGroupActions(), useInvalidateGroups(), SPECIAL_NOTIFICATIONS_QUERY_KEY, useSpecialNotifications(), inviteToGroup(), leaveGroup(), listSpecialNotifications() (+7 more)

### Community 10 - "app.ts"
Cohesion: 0.12
Nodes (20): GroupCard(), GroupCardProps, AnticipatedMovie, FavoritePersonDepartment, GroupDetails, GroupInvite, GroupMemberRole, GroupMemberView (+12 more)

### Community 11 - "tmdb.ts"
Cohesion: 0.09
Nodes (33): MovieDetailScreen(), CachedHomeCatalog, FAVORITE_GENRE_MIN_RATING, formatLocalDate(), getDiscoverByGenres(), getFavoriteGenreRecommendations(), getHomeCatalog(), getMovieCredits() (+25 more)

### Community 12 - "UserSidebar.tsx"
Cohesion: 0.11
Nodes (26): formatSidebarDate(), RECOMMENDATIONS_STORAGE_KEY_PREFIX, SidebarMediaItem(), SidebarMediaItemData, toSidebarMediaItems(), UserSidebar(), FavoritePeopleList(), FavoritePeopleListProps (+18 more)

### Community 13 - "ErrorBoundary"
Cohesion: 0.25
Nodes (3): ErrorBoundary, ErrorBoundaryProps, ErrorBoundaryState

### Community 14 - "UserDropdownMenu.tsx"
Cohesion: 0.09
Nodes (28): ActivitiesScreen(), ActivitiesScreenProps, formatTimestamp(), AdminPanel(), AdminPanelProps, ChangePasswordModal(), ChangePasswordModalProps, formatTimestamp() (+20 more)

### Community 15 - "dependencies"
Cohesion: 0.05
Nodes (41): axios, clsx, embla-carousel-react, html2canvas, lucide-react, @microsoft/clarity, motion, dependencies (+33 more)

### Community 16 - "React + TypeScript + Vite"
Cohesion: 0.50
Nodes (3): Expanding the ESLint configuration, React Compiler, React + TypeScript + Vite

### Community 19 - "CatalogPage.tsx"
Cohesion: 0.19
Nodes (10): CatalogPage(), CatalogPageProps, CERTIFICATIONS, LANGUAGES, PROVIDERS, SORT_OPTIONS, toggle(), CatalogFilters (+2 more)

### Community 22 - "CineRats — Guia de Design"
Cohesion: 0.10
Nodes (20): 10. Receita para novas telas, 11. Consistência de implementação, 1. Identidade visual, 2. Tokens de cor, 3. Tipografia, 4. Espaçamento, dimensão e proporção, 5. Bordas, raios e elevação, 6. Layout e responsividade (+12 more)

### Community 24 - "GroupPage.tsx"
Cohesion: 0.18
Nodes (10): ConfirmDialog(), ConfirmDialogProps, GroupFormDialog(), GroupFormDialogProps, formatDate(), GroupPageProps, OutsiderActions(), GroupRankingList() (+2 more)

### Community 25 - "appData.ts"
Cohesion: 0.09
Nodes (37): useNotifications(), useMediaReviews(), activityMessage(), addSeries(), ApiActivity, ApiSeriesWatchEntry, AVATAR_IDS, categoryFromApi (+29 more)

### Community 27 - "PublicHome.tsx"
Cohesion: 0.32
Nodes (9): HomeScreen(), PublicHome(), listPublicRanking(), listRecentPublicReviews(), getReviewReaction(), reviewReactions, getTopRatedMovies(), getTopRatedSeries() (+1 more)

### Community 28 - "TmdbImage.tsx"
Cohesion: 0.23
Nodes (11): getAge(), getCreditDate(), getCreditTitle(), PersonDetailScreen(), PersonDetailScreenProps, PersonPageMode, getResponsiveSources(), TMDB_WIDTHS (+3 more)

### Community 29 - "DashboardTab.tsx"
Cohesion: 0.21
Nodes (11): DashboardTabProps, formatDate(), PreferenceSearchInput(), PreferenceSearchInputProps, PreferenceSearchItem, useDeleteReviewMutation(), usePublicReviews(), useUserReviews() (+3 more)

### Community 30 - "cinematch.ts"
Cohesion: 0.28
Nodes (14): listSeries(), getCineMatchPool(), getWatchedSeeds(), recentUniqueSeeds(), shuffle(), toCandidate(), WatchedSeed, getMovieRecommendations() (+6 more)

### Community 31 - "RankingScreen.tsx"
Cohesion: 0.07
Nodes (49): HomeScreenProps, Props, AchievementIcon(), getIcon(), getLongestStreak(), LEVEL_META, MCOIN_RULES, RankingScreen() (+41 more)

### Community 32 - "GroupsPage.tsx"
Cohesion: 0.24
Nodes (11): GroupsPage(), GroupsTab, useDebouncedValue(), useCreateGroup(), useGroupSearch(), useMyGroups(), createGroup(), groupPath() (+3 more)

### Community 33 - "AvatarDisplay.tsx"
Cohesion: 0.23
Nodes (9): AvatarDisplay(), AvatarDisplayProps, ProfileAvatarModal(), ProfileAvatarModalProps, AVATAR_OPTIONS, avatarEmoji(), CUSTOM_AVATAR_PREFIX, customAvatarSrc() (+1 more)

### Community 34 - "SeriesDetailScreen.tsx"
Cohesion: 0.22
Nodes (14): SeriesCard(), SeriesCardProps, SeriesDetailScreen(), SeriesDetailScreenProps, StarRatingInput(), StarRatingInputProps, Series, updateSeriesStreaming() (+6 more)

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

### Community 40 - "getMovieDetailsWithFallback"
Cohesion: 0.36
Nodes (8): SynopsisModal(), SynopsisModalProps, getDetailsWithOverviewFallback(), getMediaDetailsMatchingTitle(), getMediaDetailsWithFallback(), getMovieDetailsWithFallback(), getTvDetailsRawWithFallback(), normalizeMediaTitle()

### Community 41 - "SeriesSection.tsx"
Cohesion: 0.16
Nodes (15): SharedItem, ShareReviewModal(), ShareReviewModalProps, waitForRenderedImages(), withTimeout(), AddSeriesDialog(), AddSeriesDialogProps, SeriesSection() (+7 more)

### Community 42 - "MovieDetailScreen.tsx"
Cohesion: 0.21
Nodes (10): formatDate(), ReviewsScreen(), MovieDetailScreenProps, WatchedTimingDialog(), WatchedTimingDialogProps, DetailPageSkeleton(), ListSkeleton(), PosterGridSkeleton() (+2 more)

### Community 43 - "GroupPage"
Cohesion: 0.21
Nodes (11): formatMonth(), GroupPage(), useGroup(), useGroupRanking(), getGroup(), getGroupRanking(), listGroupPendingRequests(), normalizeProfile() (+3 more)

### Community 44 - "OscarPredictionsSection.tsx"
Cohesion: 0.09
Nodes (29): CineMatchModal(), CineMatchModalProps, GlobalSearch(), GlobalSearchProps, SuggestMovieModal(), SuggestMovieModalProps, AddMovieDialog(), AddMovieDialogProps (+21 more)

### Community 45 - "GroupAdminPanel.tsx"
Cohesion: 0.18
Nodes (8): GroupAdminPanel(), GroupAdminPanelProps, InviteUserInput(), InviteUserInputProps, MIN_SUGGESTION_CHARS, appData, useGroupPendingRequests(), GroupPendingItem

### Community 46 - "MovieCard.tsx"
Cohesion: 0.15
Nodes (21): CardMovie, MovieCard(), MovieCardProps, parseProviders(), parseTmdbFromSource(), ProviderItem, PersonalMoviesSection(), PersonalMoviesSectionProps (+13 more)

### Community 47 - "HomeScreen.tsx"
Cohesion: 0.17
Nodes (9): MediaType, toHomeMedia(), WatchedSeed, SimilarMediaSectionProps, HOME_RELATED_MIN_RATING, HOME_RELATED_MIN_VOTES, TMDBCatalogItem, TMDBHomeMedia (+1 more)

### Community 48 - "tmdbCache.ts"
Cohesion: 0.33
Nodes (3): TMDBTvDetails, CachedTvDetails, clearOldestCaches()

### Community 49 - "favoriteGenres.ts"
Cohesion: 0.40
Nodes (5): FAVORITE_GENRE_BY_KEY, FAVORITE_GENRES, FavoriteGenreOption, getFavoriteGenre(), getFavoriteGenreLabel()

### Community 50 - "useUsers.ts"
Cohesion: 0.60
Nodes (4): useAvatarMutation(), useAvatarUploadMutation(), updateUserAvatar(), uploadAvatarImage()

## Knowledge Gaps
- **248 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+243 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `RankedUser` connect `RankingScreen.tsx` to `AvatarDisplay.tsx`, `useSeries.ts`, `useFavorites.ts`, `localData.ts`, `App.tsx`, `app.ts`, `OscarPredictionsSection.tsx`, `GroupAdminPanel.tsx`, `UserDropdownMenu.tsx`, `UserSidebar.tsx`, `appData.ts`, `DashboardTab.tsx`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Why does `PersonalMovie` connect `RankingScreen.tsx` to `localData.ts`, `app.ts`, `OscarPredictionsSection.tsx`, `MovieCard.tsx`, `HomeScreen.tsx`, `appData.ts`, `PublicHome.tsx`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Why does `SeriesEntry` connect `RankingScreen.tsx` to `localData.ts`, `useSeries.ts`, `SeriesSection.tsx`, `app.ts`, `HomeScreen.tsx`, `appData.ts`, `PublicHome.tsx`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _248 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `localData.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06798245614035088 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.0425531914893617 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._