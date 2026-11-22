# Graph Report - CineRats (2026-11-02)

## Corpus Check

- 135 files · ~263,404 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary

- 993 nodes · 2436 edges · 61 communities (53 shown, 8 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 22 edges (avg confidence: 0.77)
- Token cost: 0 input · 0 output

## Graph Freshness

- Built from commit: `544108e5`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)

- ImportTvTimePage.tsx
- localData.ts
- SuggestMovieModal.tsx
- devDependencies
- DashboardTab.tsx
- compilerOptions
- App.tsx
- compilerOptions
- TmdbImage.tsx
- groups.ts
- app.ts
- tmdb.ts
- UserSidebar.tsx
- ErrorBoundary
- UserDropdownMenu.tsx
- dependencies
- React + TypeScript + Vite
- PlatformSelect.tsx
- useUsers.ts
- tsconfig.json
- vercel.json
- CineRats — Guia de Design
- SeriesDetailScreen.tsx
- appData.ts
- MovieCard.tsx
- ReviewModal.tsx
- HomeScreen.tsx
- cinematch.ts
- RankingScreen.tsx
- legalDocuments.ts
- AvatarDisplay.tsx
- Header.tsx
- useFavorites.ts
- ChangelogsScreen.tsx
- AuthScreen.tsx
- Instruções para agentes de IA
- ConfirmPasswordResetScreen.tsx
- getMovieDetailsWithFallback
- generateImagePath
- usePersonalMovies.ts
- OscarPredictionsSection.tsx
- MovieDetailScreen.tsx
- GroupPage.test.tsx
- LoadingSkeleton.tsx
- Skeleton
- CineMatchPage.tsx
- achievements.ts
- GroupPage.tsx
- UserAchievements.tsx
- GroupsPage.tsx
- tmdbCache.ts
- SeriesCard.tsx
- GroupAdminPanel.tsx
- FaqScreen.tsx
- EnterCodeScreen.tsx
- RequestPasswordResetScreen.tsx
- ProposalPage.tsx
- PublicFooter.tsx

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

- `App()` --indirect_call--> `listPublicRanking()` [INFERRED]
  src/App.tsx → src/lib/appData.ts
- `AdminPanelProps` --references--> `RankedUser` [EXTRACTED]
  src/components/layout/AdminPanel.tsx → src/types/app.ts
- `Props` --references--> `RankedUser` [EXTRACTED]
  src/components/layout/CineMatchPage.tsx → src/types/app.ts
- `DashboardTabProps` --references--> `RankedUser` [EXTRACTED]
  src/components/layout/DashboardTab.tsx → src/types/app.ts
- `GlobalSearchProps` --references--> `RankedUser` [EXTRACTED]
  src/components/layout/GlobalSearch.tsx → src/types/app.ts

## Import Cycles

- None detected.

## Communities (61 total, 8 thin omitted)

### Community 0 - "ImportTvTimePage.tsx"

Cohesion: 0.16
Nodes (19): Props, ImportTvTimePage(), download(), platforms, Props, statuses, StatusIcon(), isActiveImport() (+11 more)

### Community 1 - "localData.ts"

Cohesion: 0.07
Nodes (93): encoder, hashPassword(), normalizeUsername(), DEFAULT_EDUMZZ_SERIES, DEFAULT_OSCAR_MOVIES, LegacyMovie, LegacySeries, readLegacyMovieData() (+85 more)

### Community 2 - "SuggestMovieModal.tsx"

Cohesion: 0.16
Nodes (16): CineMatchModal(), CineMatchModalProps, GlobalSearch(), GlobalSearchProps, SuggestMovieModal(), SuggestMovieModalProps, useCineMatch(), useSuggestMovie() (+8 more)

### Community 3 - "devDependencies"

Cohesion: 0.04
Nodes (46): eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, jsdom, devDependencies, eslint (+38 more)

### Community 4 - "DashboardTab.tsx"

Cohesion: 0.16
Nodes (15): DashboardTab(), DashboardTabProps, formatDate(), PreferenceSearchInput(), PreferenceSearchInputProps, PreferenceSearchItem, useUserReviews(), listUserReviews() (+7 more)

### Community 5 - "compilerOptions"

Cohesion: 0.07
Nodes (26): DOM, DOM.Iterable, src, vite/client, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, jsx (+18 more)

### Community 6 - "App.tsx"

Cohesion: 0.13
Nodes (25): ADMIN_USERNAME, App(), runBootstrap(), OTHER_PROFILE_TABS, PROFILE_NAV_ICONS, readStoredSession(), ProfilePageSkeleton(), SmartStickySidebar() (+17 more)

### Community 7 - "compilerOptions"

Cohesion: 0.09
Nodes (22): node, vite.config.ts, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection (+14 more)

### Community 8 - "TmdbImage.tsx"

Cohesion: 0.21
Nodes (12): getAge(), getCreditDate(), getCreditTitle(), PersonDetailScreen(), PersonDetailScreenProps, PersonPageMode, getResponsiveSources(), TMDB_WIDTHS (+4 more)

### Community 9 - "groups.ts"

Cohesion: 0.22
Nodes (17): GROUPS_QUERY_KEY, useGroupActions(), useInvalidateGroups(), getGroup(), getGroupRanking(), inviteToGroup(), leaveGroup(), listGroupPendingRequests() (+9 more)

### Community 10 - "app.ts"

Cohesion: 0.10
Nodes (24): GroupCard(), GroupCardProps, GroupRankingList(), GroupRankingListProps, AnticipatedMovie, FavoritePersonDepartment, GroupDetails, GroupInvite (+16 more)

### Community 11 - "tmdb.ts"

Cohesion: 0.10
Nodes (26): CachedHomeCatalog, FAVORITE_GENRE_MIN_RATING, formatLocalDate(), getDiscoverByGenres(), getFavoriteGenreRecommendations(), getHomeCatalog(), getRandomTopRatedCatalog(), getUpcomingCatalog() (+18 more)

### Community 12 - "UserSidebar.tsx"

Cohesion: 0.11
Nodes (25): RECOMMENDATIONS_STORAGE_KEY_PREFIX, SidebarMediaItemData, toSidebarMediaItems(), UserSidebar(), UserSidebarProps, FavoritePeopleList(), FavoritePeopleListProps, getPersonPath() (+17 more)

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

### Community 19 - "useUsers.ts"

Cohesion: 0.24
Nodes (10): InviteUserInput(), InviteUserInputProps, MIN_SUGGESTION_CHARS, useAvatarMutation(), useAvatarUploadMutation(), useUsers(), listRankedUsers(), listUsers() (+2 more)

### Community 22 - "CineRats — Guia de Design"

Cohesion: 0.10
Nodes (20): 10. Receita para novas telas, 11. Consistência de implementação, 1. Identidade visual, 2. Tokens de cor, 3. Tipografia, 4. Espaçamento, dimensão e proporção, 5. Bordas, raios e elevação, 6. Layout e responsividade (+12 more)

### Community 24 - "SeriesDetailScreen.tsx"

Cohesion: 0.20
Nodes (15): AddSeriesDialog(), AddSeriesDialogProps, SeriesDetailScreen(), SeriesDetailScreenProps, getSeriesCineratsStats(), getTvCredits(), getTvSeasonEpisodes(), getTvSimilarWithFallback() (+7 more)

### Community 25 - "appData.ts"

Cohesion: 0.11
Nodes (26): useNotifications(), useSeries(), useSeriesMutations(), useSeriesQuery(), activityMessage(), addSeries(), ApiActivity, ApiSeriesWatchEntry (+18 more)

### Community 27 - "MovieCard.tsx"

Cohesion: 0.29
Nodes (10): CardMovie, MovieCard(), MovieCardProps, parseProviders(), parseTmdbFromSource(), ProviderItem, updatePersonalMovieStreaming(), findMovieIdByTitle() (+2 more)

### Community 28 - "ReviewModal.tsx"

Cohesion: 0.47
Nodes (8): ReviewModal(), ReviewModalProps, canEarnPointsForReview(), getReviewDeadlineHours(), getReviewDeadlineMessage(), MIN_REVIEW_LENGTH, sanitizeReviewText(), validateReviewText()

### Community 29 - "HomeScreen.tsx"

Cohesion: 0.20
Nodes (12): HomeScreen(), MediaType, toHomeMedia(), WatchedSeed, PublicHome(), listPublicRanking(), listRecentPublicReviews(), getTopRatedMovies() (+4 more)

### Community 30 - "cinematch.ts"

Cohesion: 0.26
Nodes (15): listPersonalMovies(), listSeries(), getCineMatchPool(), getWatchedSeeds(), recentUniqueSeeds(), shuffle(), toCandidate(), WatchedSeed (+7 more)

### Community 31 - "RankingScreen.tsx"

Cohesion: 0.24
Nodes (15): HomeScreenProps, AchievementIcon(), getIcon(), LEVEL_META, MCOIN_RULES, RankingScreenProps, SECRET_META, PublicHomeProps (+7 more)

### Community 32 - "legalDocuments.ts"

Cohesion: 0.22
Nodes (8): LegalPage(), CONTACT_ITEMS, LegalBlock, LegalDocument, LegalListItem, LegalSection, PRIVACY_POLICY, TERMS_OF_USE

### Community 33 - "AvatarDisplay.tsx"

Cohesion: 0.10
Nodes (29): AvatarDisplay(), AvatarDisplayProps, ProfileAvatarModal(), ProfileAvatarModalProps, ReviewInteractions(), formatDate(), ReviewsScreen(), useCreateReviewCommentMutation() (+21 more)

### Community 34 - "Header.tsx"

Cohesion: 0.33
Nodes (5): APP_NAVIGATION_TABS, AppTab, Header(), HeaderProps, baseProps

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

### Community 40 - "getMovieDetailsWithFallback"

Cohesion: 0.29
Nodes (10): formatSidebarDate(), SidebarMediaItem(), SynopsisModal(), SynopsisModalProps, getDetailsWithOverviewFallback(), getMediaDetailsMatchingTitle(), getMediaDetailsWithFallback(), getMovieDetailsWithFallback() (+2 more)

### Community 41 - "generateImagePath"

Cohesion: 0.39
Nodes (6): SharedItem, ShareReviewModal(), ShareReviewModalProps, waitForRenderedImages(), withTimeout(), generateImagePath()

### Community 42 - "usePersonalMovies.ts"

Cohesion: 0.46
Nodes (7): usePersonalMovieMutations(), usePersonalMovies(), usePersonalMoviesQuery(), addPersonalMovie(), deletePersonalMovie(), updatePersonalMovie(), listActiveWatchParties()

### Community 43 - "OscarPredictionsSection.tsx"

Cohesion: 0.16
Nodes (16): AddMovieDialog(), AddMovieDialogProps, CATEGORIES, CategoryCard(), CategoryCardProps, CategoryConfig, getTmdbImageUrl(), OscarPredictionsSection() (+8 more)

### Community 44 - "MovieDetailScreen.tsx"

Cohesion: 0.29
Nodes (9): MovieDetailScreen(), MovieDetailScreenProps, WatchedTimingDialog(), WatchedTimingDialogProps, getMovieCineratsStats(), getMovieCredits(), getMovieSimilarWithFallback(), getMovieYouTubeTrailer() (+1 more)

### Community 45 - "GroupPage.test.tsx"

Cohesion: 0.13
Nodes (9): admin, api, navigation, ranking, api, navigation, appData, renderWithProviders() (+1 more)

### Community 46 - "LoadingSkeleton.tsx"

Cohesion: 0.18
Nodes (11): PersonalMoviesSection(), PersonalMoviesSectionProps, PublicDashboardLite(), PublicTab, SeriesSection(), SeriesSectionProps, DetailPageSkeleton(), ListSkeleton() (+3 more)

### Community 47 - "Skeleton"

Cohesion: 0.29
Nodes (7): Skeleton(), SimilarMediaSection(), SimilarMediaSectionProps, SIMILAR_MEDIA_MIN_RATING, TMDBCatalogItem, TMDBHomeMedia, TMDBRecommendationItem

### Community 48 - "CineMatchPage.tsx"

Cohesion: 0.09
Nodes (27): CineMatchPage(), accept(), draw(), Props, Props, WatchPartyHistory(), update(), CatalogPage() (+19 more)

### Community 49 - "achievements.ts"

Cohesion: 0.22
Nodes (15): COMEDY_MOVIES, countRatedMovies(), countRatedSeries(), FAMILY_MOVIES, getAchievementProgress(), getFavoriteDirector(), HORROR_SERIES, maxSevenDayMovieCount() (+7 more)

### Community 50 - "GroupPage.tsx"

Cohesion: 0.19
Nodes (11): ConfirmDialog(), ConfirmDialogProps, GroupFormDialog(), GroupFormDialogProps, formatDate(), formatMonth(), GroupPage(), GroupPageProps (+3 more)

### Community 51 - "UserAchievements.tsx"

Cohesion: 0.22
Nodes (11): getLongestStreak(), RankingScreen(), LEVEL_ORDER, AchievementBadge(), AchievementBadgeProps, StoredAchievementBadges(), UserAchievements(), ACHIEVEMENTS (+3 more)

### Community 52 - "GroupsPage.tsx"

Cohesion: 0.24
Nodes (11): GroupsPage(), GroupsTab, useDebouncedValue(), useCreateGroup(), useGroupSearch(), useMyGroups(), createGroup(), groupPath() (+3 more)

### Community 53 - "tmdbCache.ts"

Cohesion: 0.31
Nodes (5): getTvDetails(), TMDBTvDetails, CachedTvDetails, clearOldestCaches(), getTvDetailsWithCache()

### Community 54 - "SeriesCard.tsx"

Cohesion: 0.36
Nodes (6): SeriesCard(), SeriesCardProps, StarRatingInput(), StarRatingInputProps, Series, updateSeriesStreaming()

### Community 55 - "GroupAdminPanel.tsx"

Cohesion: 0.40
Nodes (4): GroupAdminPanel(), GroupAdminPanelProps, useGroupPendingRequests(), GroupPendingItem

### Community 56 - "FaqScreen.tsx"

Cohesion: 0.40
Nodes (5): FAQ_SECTIONS, FaqItem, FaqScreen(), FaqSection, normalizeSearchValue()

## Knowledge Gaps

- **254 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+249 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **Why does `RankedUser` connect `RankingScreen.tsx` to `AvatarDisplay.tsx`, `SuggestMovieModal.tsx`, `useFavorites.ts`, `DashboardTab.tsx`, `localData.ts`, `App.tsx`, `app.ts`, `UserSidebar.tsx`, `GroupPage.test.tsx`, `UserDropdownMenu.tsx`, `LoadingSkeleton.tsx`, `CineMatchPage.tsx`, `achievements.ts`, `UserAchievements.tsx`, `appData.ts`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Why does `PersonalMovie` connect `RankingScreen.tsx` to `localData.ts`, `SuggestMovieModal.tsx`, `usePersonalMovies.ts`, `OscarPredictionsSection.tsx`, `app.ts`, `LoadingSkeleton.tsx`, `achievements.ts`, `UserAchievements.tsx`, `appData.ts`, `MovieCard.tsx`, `HomeScreen.tsx`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Why does `SeriesEntry` connect `RankingScreen.tsx` to `localData.ts`, `app.ts`, `achievements.ts`, `UserAchievements.tsx`, `SeriesDetailScreen.tsx`, `appData.ts`, `HomeScreen.tsx`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _254 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `localData.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06798245614035088 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.0425531914893617 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
