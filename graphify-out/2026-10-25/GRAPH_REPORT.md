# Graph Report - CineRats  (2026-10-23)

## Corpus Check
- 130 files · ~260,417 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 965 nodes · 2369 edges · 47 communities (43 shown, 4 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 22 edges (avg confidence: 0.77)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `bd4c7e69`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ImportTvTimePage.tsx
- localData.ts
- RankedUser
- devDependencies
- GroupPage.test.tsx
- compilerOptions
- App.tsx
- compilerOptions
- withFallback
- groups.ts
- app.ts
- tmdb.ts
- useFavoritePeople.ts
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
- PersonDetailScreen.tsx
- cinematch.ts
- RankingScreen.tsx
- GroupsPage.tsx
- DashboardTab.tsx
- SeriesDetailScreen.tsx
- useFavorites.ts
- ChangelogsScreen.tsx
- FaqScreen.tsx
- Instruções para agentes de IA
- ConfirmPasswordResetScreen.tsx
- UserSidebar.tsx
- MovieCard.tsx
- MovieDetailScreen.tsx
- GroupPage
- OscarPredictionsSection.tsx
- GroupAdminPanel.tsx
- usePersonalMovies.ts
- HomeScreen.tsx
- useSeries.ts

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

## Communities (47 total, 4 thin omitted)

### Community 0 - "ImportTvTimePage.tsx"
Cohesion: 0.16
Nodes (19): Props, ImportTvTimePage(), download(), platforms, Props, statuses, StatusIcon(), isActiveImport() (+11 more)

### Community 1 - "localData.ts"
Cohesion: 0.07
Nodes (93): encoder, hashPassword(), normalizeUsername(), DEFAULT_EDUMZZ_SERIES, DEFAULT_OSCAR_MOVIES, LegacyMovie, LegacySeries, readLegacyMovieData() (+85 more)

### Community 2 - "RankedUser"
Cohesion: 0.18
Nodes (17): CineMatchPage(), accept(), draw(), Props, Props, WatchPartyHistory(), update(), apiClient (+9 more)

### Community 3 - "devDependencies"
Cohesion: 0.04
Nodes (46): eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, jsdom, devDependencies, eslint (+38 more)

### Community 4 - "GroupPage.test.tsx"
Cohesion: 0.29
Nodes (5): admin, api, navigation, ranking, GroupRanking

### Community 5 - "compilerOptions"
Cohesion: 0.07
Nodes (26): DOM, DOM.Iterable, src, vite/client, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, jsx (+18 more)

### Community 6 - "App.tsx"
Cohesion: 0.08
Nodes (21): ADMIN_USERNAME, OTHER_PROFILE_TABS, PROFILE_NAV_ICONS, AuthScreen(), AuthScreenProps, Mode, EnterCodeScreen(), EnterCodeScreenProps (+13 more)

### Community 7 - "compilerOptions"
Cohesion: 0.09
Nodes (22): node, vite.config.ts, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection (+14 more)

### Community 8 - "withFallback"
Cohesion: 0.18
Nodes (18): App(), runBootstrap(), readStoredSession(), adminResetPassword(), changePassword(), clearAppDataCache(), confirmPasswordReset(), deleteCurrentUser() (+10 more)

### Community 9 - "groups.ts"
Cohesion: 0.21
Nodes (16): GROUPS_QUERY_KEY, useGroupActions(), useInvalidateGroups(), createGroup(), inviteToGroup(), leaveGroup(), MAX_GROUP_MEMBERS, removeGroupMember() (+8 more)

### Community 10 - "app.ts"
Cohesion: 0.14
Nodes (18): GroupCard(), GroupCardProps, AnticipatedMovie, CreateWatchPartyInput, FavoritePersonDepartment, GroupDetails, GroupInvite, GroupMemberRole (+10 more)

### Community 11 - "tmdb.ts"
Cohesion: 0.11
Nodes (24): CachedHomeCatalog, FAVORITE_GENRE_MIN_RATING, formatLocalDate(), getDiscoverByGenres(), getFavoriteGenreRecommendations(), getHomeCatalog(), getRandomTopRatedCatalog(), getUpcomingCatalog() (+16 more)

### Community 12 - "useFavoritePeople.ts"
Cohesion: 0.10
Nodes (23): api, navigation, FavoritePeopleList(), FavoritePeopleListProps, getPersonPath(), actor, api, director (+15 more)

### Community 13 - "ErrorBoundary"
Cohesion: 0.25
Nodes (3): ErrorBoundary, ErrorBoundaryProps, ErrorBoundaryState

### Community 14 - "UserDropdownMenu.tsx"
Cohesion: 0.08
Nodes (33): ActivitiesScreen(), ActivitiesScreenProps, formatTimestamp(), AdminPanel(), AdminPanelProps, ChangePasswordModal(), ChangePasswordModalProps, formatTimestamp() (+25 more)

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
Cohesion: 0.23
Nodes (8): ConfirmDialog(), ConfirmDialogProps, formatDate(), GroupPageProps, OutsiderActions(), GroupRankingList(), GroupRankingListProps, GroupRankingItem

### Community 25 - "appData.ts"
Cohesion: 0.11
Nodes (23): useNotifications(), useAvatarMutation(), useAvatarUploadMutation(), activityMessage(), ApiActivity, ApiSeriesWatchEntry, AVATAR_IDS, categoryFromApi (+15 more)

### Community 28 - "PersonDetailScreen.tsx"
Cohesion: 0.29
Nodes (9): getAge(), getCreditDate(), getCreditTitle(), PersonDetailScreen(), PersonDetailScreenProps, PersonPageMode, DetailPageSkeleton(), getPersonDetailsWithCredits() (+1 more)

### Community 30 - "cinematch.ts"
Cohesion: 0.30
Nodes (13): getCineMatchPool(), getWatchedSeeds(), recentUniqueSeeds(), shuffle(), toCandidate(), WatchedSeed, getMovieRecommendations(), getMovieSimilar() (+5 more)

### Community 31 - "RankingScreen.tsx"
Cohesion: 0.08
Nodes (47): HomeScreenProps, AchievementIcon(), getIcon(), getLongestStreak(), LEVEL_META, MCOIN_RULES, RankingScreen(), RankingScreenProps (+39 more)

### Community 32 - "GroupsPage.tsx"
Cohesion: 0.23
Nodes (11): GroupFormDialog(), GroupFormDialogProps, GroupsPage(), GroupsTab, useDebouncedValue(), useCreateGroup(), useGroupSearch(), useMyGroups() (+3 more)

### Community 33 - "DashboardTab.tsx"
Cohesion: 0.06
Nodes (36): InviteUserInput(), InviteUserInputProps, MIN_SUGGESTION_CHARS, appData, AvatarDisplay(), AvatarDisplayProps, DashboardTab(), DashboardTabProps (+28 more)

### Community 34 - "SeriesDetailScreen.tsx"
Cohesion: 0.20
Nodes (14): SeriesDetailScreen(), SeriesDetailScreenProps, Skeleton(), SimilarMediaSection(), getResponsiveSources(), TMDB_WIDTHS, TmdbImage(), TmdbImageProps (+6 more)

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

### Community 40 - "UserSidebar.tsx"
Cohesion: 0.19
Nodes (15): formatSidebarDate(), RECOMMENDATIONS_STORAGE_KEY_PREFIX, SidebarMediaItem(), SidebarMediaItemData, toSidebarMediaItems(), UserSidebar(), UserSidebarProps, SynopsisModal() (+7 more)

### Community 41 - "MovieCard.tsx"
Cohesion: 0.08
Nodes (43): SharedItem, ShareReviewModal(), ShareReviewModalProps, waitForRenderedImages(), withTimeout(), CardMovie, MovieCard(), MovieCardProps (+35 more)

### Community 42 - "MovieDetailScreen.tsx"
Cohesion: 0.29
Nodes (9): MovieDetailScreen(), MovieDetailScreenProps, WatchedTimingDialog(), WatchedTimingDialogProps, getMovieCineratsStats(), getMovieCredits(), getMovieSimilarWithFallback(), getMovieYouTubeTrailer() (+1 more)

### Community 43 - "GroupPage"
Cohesion: 0.21
Nodes (11): formatMonth(), GroupPage(), useGroup(), useGroupRanking(), getGroup(), getGroupRanking(), listGroupPendingRequests(), normalizeProfile() (+3 more)

### Community 44 - "OscarPredictionsSection.tsx"
Cohesion: 0.10
Nodes (27): CineMatchModal(), CineMatchModalProps, GlobalSearch(), GlobalSearchProps, SuggestMovieModal(), SuggestMovieModalProps, AddMovieDialog(), AddMovieDialogProps (+19 more)

### Community 45 - "GroupAdminPanel.tsx"
Cohesion: 0.40
Nodes (4): GroupAdminPanel(), GroupAdminPanelProps, useGroupPendingRequests(), GroupPendingItem

### Community 46 - "usePersonalMovies.ts"
Cohesion: 0.25
Nodes (12): PersonalMoviesSection(), PersonalMoviesSectionProps, usePersonalMovieMutations(), usePersonalMovies(), usePersonalMoviesQuery(), useSocialActions(), addPersonalMovie(), deletePersonalMovie() (+4 more)

### Community 47 - "HomeScreen.tsx"
Cohesion: 0.14
Nodes (18): HomeScreen(), MediaType, toHomeMedia(), WatchedSeed, PublicHome(), SimilarMediaSectionProps, listPublicRanking(), listRecentPublicReviews() (+10 more)

### Community 48 - "useSeries.ts"
Cohesion: 0.17
Nodes (15): useSeries(), useSeriesMutations(), useSeriesQuery(), addSeries(), createSeriesWatchEntries(), deleteSeries(), getSeriesStatus(), listSeries() (+7 more)

## Knowledge Gaps
- **249 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+244 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `RankedUser` connect `RankedUser` to `DashboardTab.tsx`, `localData.ts`, `useFavorites.ts`, `App.tsx`, `UserSidebar.tsx`, `app.ts`, `OscarPredictionsSection.tsx`, `UserDropdownMenu.tsx`, `appData.ts`, `RankingScreen.tsx`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Why does `PersonalMovie` connect `RankingScreen.tsx` to `localData.ts`, `MovieCard.tsx`, `app.ts`, `OscarPredictionsSection.tsx`, `usePersonalMovies.ts`, `HomeScreen.tsx`, `appData.ts`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Why does `SeriesEntry` connect `RankingScreen.tsx` to `localData.ts`, `MovieCard.tsx`, `app.ts`, `HomeScreen.tsx`, `useSeries.ts`, `appData.ts`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _249 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `localData.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06798245614035088 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.0425531914893617 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._