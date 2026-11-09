# Graph Report - CineRats  (2026-11-08)

## Corpus Check
- 135 files · ~263,656 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 994 nodes · 2440 edges · 46 communities (42 shown, 4 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 22 edges (avg confidence: 0.77)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b7f70228`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ImportTvTimePage.tsx
- localData.ts
- CineMatchModal.tsx
- devDependencies
- HomeScreen.tsx
- compilerOptions
- App.tsx
- compilerOptions
- LoadingSkeleton.tsx
- groups.ts
- app.ts
- tmdb.ts
- UserSidebar.tsx
- ErrorBoundary
- UserDropdownMenu.tsx
- dependencies
- React + TypeScript + Vite
- PlatformSelect.tsx
- tsconfig.json
- vercel.json
- CineRats — Guia de Design
- SeriesDetailScreen.tsx
- appData.ts
- MovieCard.tsx
- SeriesCard.tsx
- RankingScreen.tsx
- legalDocuments.ts
- AvatarDisplay.tsx
- useFavorites.ts
- ChangelogsScreen.tsx
- AuthScreen.tsx
- Instruções para agentes de IA
- ConfirmPasswordResetScreen.tsx
- usePersonalMovies.ts
- OscarPredictionsSection.tsx
- MovieDetailScreen.tsx
- useSeries.ts
- CatalogPage.tsx
- GroupPage.tsx
- GroupsPage.tsx
- tmdbCache.ts
- GroupAdminPanel.tsx
- FaqScreen.tsx

## God Nodes (most connected - your core abstractions)
1. `withFallback()` - 45 edges
2. `RankedUser` - 32 edges
3. `PersonalMovie` - 23 edges
4. `App()` - 20 edges
5. `AvatarDisplay()` - 20 edges
6. `requireSession()` - 20 edges
7. `compilerOptions` - 20 edges
8. `addActivity()` - 18 edges
9. `deleteCurrentUser()` - 18 edges
10. `SeriesEntry` - 18 edges

## Surprising Connections (you probably didn't know these)
- `App()` --indirect_call--> `listPublicRanking()`  [INFERRED]
  src/App.tsx → src/lib/appData.ts
- `AdminPanelProps` --references--> `RankedUser`  [EXTRACTED]
  src/components/layout/AdminPanel.tsx → src/types/app.ts
- `Props` --references--> `RankedUser`  [EXTRACTED]
  src/components/layout/CineMatchPage.tsx → src/types/app.ts
- `DashboardTabProps` --references--> `RankedUser`  [EXTRACTED]
  src/components/layout/DashboardTab.tsx → src/types/app.ts
- `GlobalSearchProps` --references--> `RankedUser`  [EXTRACTED]
  src/components/layout/GlobalSearch.tsx → src/types/app.ts

## Import Cycles
- None detected.

## Communities (46 total, 4 thin omitted)

### Community 0 - "ImportTvTimePage.tsx"
Cohesion: 0.16
Nodes (19): Props, ImportTvTimePage(), download(), platforms, Props, statuses, StatusIcon(), isActiveImport() (+11 more)

### Community 1 - "localData.ts"
Cohesion: 0.08
Nodes (87): encoder, hashPassword(), normalizeUsername(), readLegacyMovieData(), readLegacySeriesData(), addActivity(), addFavorite(), addOscarMovie() (+79 more)

### Community 2 - "CineMatchModal.tsx"
Cohesion: 0.31
Nodes (8): CineMatchModal(), CineMatchModalProps, SuggestMovieModalProps, useCineMatch(), getCineMatchSuggestion(), AppUser, CineMatchMode, CineMatchSuggestion

### Community 3 - "devDependencies"
Cohesion: 0.04
Nodes (46): eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, jsdom, devDependencies, eslint (+38 more)

### Community 4 - "HomeScreen.tsx"
Cohesion: 0.05
Nodes (61): HomeScreen(), MediaType, toHomeMedia(), WatchedSeed, CineMatchPage(), accept(), draw(), Props (+53 more)

### Community 5 - "compilerOptions"
Cohesion: 0.07
Nodes (26): DOM, DOM.Iterable, src, vite/client, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, jsx (+18 more)

### Community 6 - "App.tsx"
Cohesion: 0.08
Nodes (29): ADMIN_USERNAME, App(), runBootstrap(), OTHER_PROFILE_TABS, PROFILE_NAV_ICONS, readStoredSession(), EnterCodeScreen(), EnterCodeScreenProps (+21 more)

### Community 7 - "compilerOptions"
Cohesion: 0.09
Nodes (22): node, vite.config.ts, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection (+14 more)

### Community 8 - "LoadingSkeleton.tsx"
Cohesion: 0.14
Nodes (18): Props, getAge(), getCreditDate(), getCreditTitle(), PersonDetailScreen(), PersonDetailScreenProps, PersonPageMode, DetailPageSkeleton() (+10 more)

### Community 9 - "groups.ts"
Cohesion: 0.20
Nodes (17): GROUPS_QUERY_KEY, useGroupActions(), useInvalidateGroups(), createGroup(), inviteToGroup(), leaveGroup(), listMyGroups(), MAX_GROUP_MEMBERS (+9 more)

### Community 10 - "app.ts"
Cohesion: 0.13
Nodes (19): GroupCard(), GroupCardProps, GroupRankingList(), GroupRankingListProps, AnticipatedMovie, FavoritePersonDepartment, GroupInvite, GroupMemberRole (+11 more)

### Community 11 - "tmdb.ts"
Cohesion: 0.10
Nodes (29): SynopsisModal(), SynopsisModalProps, CachedHomeCatalog, FAVORITE_GENRE_MIN_RATING, getDetailsWithOverviewFallback(), getDiscoverByGenres(), getFavoriteGenreRecommendations(), getHomeCatalog() (+21 more)

### Community 12 - "UserSidebar.tsx"
Cohesion: 0.07
Nodes (33): InviteUserInput(), InviteUserInputProps, MIN_SUGGESTION_CHARS, appData, formatSidebarDate(), RECOMMENDATIONS_STORAGE_KEY_PREFIX, SidebarMediaItem(), SidebarMediaItemData (+25 more)

### Community 13 - "ErrorBoundary"
Cohesion: 0.25
Nodes (3): ErrorBoundary, ErrorBoundaryProps, ErrorBoundaryState

### Community 14 - "UserDropdownMenu.tsx"
Cohesion: 0.08
Nodes (34): ActivitiesScreen(), ActivitiesScreenProps, formatTimestamp(), AdminPanel(), AdminPanelProps, ChangePasswordModal(), ChangePasswordModalProps, formatTimestamp() (+26 more)

### Community 15 - "dependencies"
Cohesion: 0.05
Nodes (41): axios, clsx, embla-carousel-react, html2canvas, lucide-react, @microsoft/clarity, motion, dependencies (+33 more)

### Community 16 - "React + TypeScript + Vite"
Cohesion: 0.50
Nodes (3): Expanding the ESLint configuration, React Compiler, React + TypeScript + Vite

### Community 22 - "CineRats — Guia de Design"
Cohesion: 0.10
Nodes (20): 10. Receita para novas telas, 11. Consistência de implementação, 1. Identidade visual, 2. Tokens de cor, 3. Tipografia, 4. Espaçamento, dimensão e proporção, 5. Bordas, raios e elevação, 6. Layout e responsividade (+12 more)

### Community 24 - "SeriesDetailScreen.tsx"
Cohesion: 0.22
Nodes (11): WatchedTimingDialog(), WatchedTimingDialogProps, SeriesDetailScreen(), SeriesDetailScreenProps, formatLocalDate(), getTvCredits(), getTvSimilarWithFallback(), getTvYouTubeTrailer() (+3 more)

### Community 25 - "appData.ts"
Cohesion: 0.10
Nodes (30): useNotifications(), useMediaReviews(), useAvatarMutation(), useAvatarUploadMutation(), activityMessage(), ApiActivity, ApiSeriesWatchEntry, AVATAR_IDS (+22 more)

### Community 27 - "MovieCard.tsx"
Cohesion: 0.17
Nodes (16): SharedItem, ShareReviewModal(), ShareReviewModalProps, waitForRenderedImages(), withTimeout(), CardMovie, MovieCard(), MovieCardProps (+8 more)

### Community 28 - "SeriesCard.tsx"
Cohesion: 0.20
Nodes (16): SeriesCard(), SeriesCardProps, ReviewModal(), ReviewModalProps, StarRatingInput(), StarRatingInputProps, Series, updateSeriesStreaming() (+8 more)

### Community 31 - "RankingScreen.tsx"
Cohesion: 0.08
Nodes (50): HomeScreenProps, AchievementIcon(), getIcon(), getLongestStreak(), LEVEL_META, MCOIN_RULES, RankingScreen(), RankingScreenProps (+42 more)

### Community 32 - "legalDocuments.ts"
Cohesion: 0.22
Nodes (8): LegalPage(), CONTACT_ITEMS, LegalBlock, LegalDocument, LegalListItem, LegalSection, PRIVACY_POLICY, TERMS_OF_USE

### Community 33 - "AvatarDisplay.tsx"
Cohesion: 0.07
Nodes (35): AvatarDisplay(), AvatarDisplayProps, APP_NAVIGATION_TABS, AppTab, Header(), HeaderProps, baseProps, ProfileAvatarModal() (+27 more)

### Community 35 - "useFavorites.ts"
Cohesion: 0.31
Nodes (8): ProfileSummary(), ProfileSummaryProps, FAVORITES_QUERY_KEY, useFavorites(), addFavorite(), listFavorites(), removeFavorite(), UserFavorite

### Community 36 - "ChangelogsScreen.tsx"
Cohesion: 0.31
Nodes (6): ChangelogsScreen(), formatDate(), LatestUpdatesSection(), ChangelogEntry, ChangelogLinkItem, CHANGELOGS

### Community 37 - "AuthScreen.tsx"
Cohesion: 0.50
Nodes (3): AuthScreen(), AuthScreenProps, Mode

### Community 38 - "Instruções para agentes de IA"
Cohesion: 0.50
Nodes (3): Atualização do grafo, Graphify, Instruções para agentes de IA

### Community 42 - "usePersonalMovies.ts"
Cohesion: 0.52
Nodes (6): usePersonalMovieMutations(), addPersonalMovie(), deletePersonalMovie(), updatePersonalMovie(), completeWatchParty(), listActiveWatchParties()

### Community 43 - "OscarPredictionsSection.tsx"
Cohesion: 0.13
Nodes (21): GlobalSearch(), GlobalSearchProps, SuggestMovieModal(), AddMovieDialog(), AddMovieDialogProps, CATEGORIES, CategoryCard(), CategoryCardProps (+13 more)

### Community 44 - "MovieDetailScreen.tsx"
Cohesion: 0.27
Nodes (11): MovieDetailScreen(), MovieDetailScreenProps, PersonalMoviesSection(), PersonalMoviesSectionProps, usePersonalMovies(), useSocialActions(), rateMovie(), getMovieCredits() (+3 more)

### Community 46 - "useSeries.ts"
Cohesion: 0.28
Nodes (12): SeriesSection(), useSeries(), useSeriesMutations(), useSeriesQuery(), addSeries(), createSeriesWatchEntries(), deleteSeries(), getSeriesStatus() (+4 more)

### Community 48 - "CatalogPage.tsx"
Cohesion: 0.12
Nodes (18): CatalogPage(), CatalogPageProps, CERTIFICATIONS, LANGUAGES, PROVIDERS, SORT_OPTIONS, toggle(), AddSeriesDialog() (+10 more)

### Community 50 - "GroupPage.tsx"
Cohesion: 0.14
Nodes (15): ConfirmDialog(), ConfirmDialogProps, formatDate(), formatMonth(), GroupPage(), GroupPageProps, OutsiderActions(), admin (+7 more)

### Community 52 - "GroupsPage.tsx"
Cohesion: 0.16
Nodes (14): GroupFormDialog(), GroupFormDialogProps, GroupsPage(), GroupsTab, api, navigation, useDebouncedValue(), useCreateGroup() (+6 more)

### Community 53 - "tmdbCache.ts"
Cohesion: 0.32
Nodes (4): TMDBTvDetails, CachedTvDetails, clearOldestCaches(), getTvDetailsWithCache()

### Community 55 - "GroupAdminPanel.tsx"
Cohesion: 0.18
Nodes (11): GroupAdminPanel(), GroupAdminPanelProps, useGroupPendingRequests(), getGroup(), getGroupRanking(), listGroupPendingRequests(), normalizeProfile(), http (+3 more)

### Community 56 - "FaqScreen.tsx"
Cohesion: 0.40
Nodes (5): FAQ_SECTIONS, FaqItem, FaqScreen(), FaqSection, normalizeSearchValue()

## Knowledge Gaps
- **254 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+249 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `RankedUser` connect `RankingScreen.tsx` to `AvatarDisplay.tsx`, `localData.ts`, `useFavorites.ts`, `HomeScreen.tsx`, `CineMatchModal.tsx`, `App.tsx`, `LoadingSkeleton.tsx`, `app.ts`, `OscarPredictionsSection.tsx`, `UserSidebar.tsx`, `UserDropdownMenu.tsx`, `appData.ts`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Why does `PersonalMovie` connect `RankingScreen.tsx` to `localData.ts`, `HomeScreen.tsx`, `usePersonalMovies.ts`, `OscarPredictionsSection.tsx`, `MovieDetailScreen.tsx`, `app.ts`, `appData.ts`, `MovieCard.tsx`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Why does `SeriesEntry` connect `RankingScreen.tsx` to `localData.ts`, `HomeScreen.tsx`, `app.ts`, `useSeries.ts`, `CatalogPage.tsx`, `appData.ts`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _254 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `localData.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07609805924412666 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.0425531914893617 - nodes in this community are weakly interconnected._
- **Should `HomeScreen.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05081081081081081 - nodes in this community are weakly interconnected._