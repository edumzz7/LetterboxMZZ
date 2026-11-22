# Graph Report - CineRats (2026-11-02)

## Corpus Check

- 135 files · ~263,360 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary

- 992 nodes · 2436 edges · 46 communities (42 shown, 4 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 22 edges (avg confidence: 0.77)
- Token cost: 0 input · 0 output

## Graph Freshness

- Built from commit: `544108e5`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)

- ImportTvTimePage.tsx
- localData.ts
- app.ts
- devDependencies
- DashboardTab.tsx
- compilerOptions
- App.tsx
- compilerOptions
- SeriesDetailScreen.tsx
- groups.ts
- AvatarDisplay.tsx
- tmdb.ts
- UserSidebar.tsx
- ErrorBoundary
- UserEventBell.tsx
- dependencies
- React + TypeScript + Vite
- PlatformSelect.tsx
- useUsers.ts
- tsconfig.json
- vercel.json
- CineRats — Guia de Design
- SeriesCard.tsx
- appData.ts
- MovieCard.tsx
- ReviewModal.tsx
- PublicHome.tsx
- cinematch.ts
- RankingScreen.tsx
- legalDocuments.ts
- useReviews.ts
- Header.tsx
- useFavorites.ts
- FaqScreen.tsx
- AuthScreen.tsx
- Instruções para agentes de IA
- ConfirmPasswordResetScreen.tsx
- getMovieDetailsWithFallback
- useSeries.ts
- usePersonalMovies.ts
- MovieDetailScreen.tsx
- HomeScreen.tsx
- CatalogPage.tsx

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
- `DashboardTabProps` --references--> `RankedUser` [EXTRACTED]
  src/components/layout/DashboardTab.tsx → src/types/app.ts
- `ProfileSummaryProps` --references--> `RankedUser` [EXTRACTED]
  src/components/layout/ProfileSummary.tsx → src/types/app.ts
- `UserSidebarProps` --references--> `RankedUser` [EXTRACTED]
  src/components/layout/UserSidebar.tsx → src/types/app.ts
- `useUsers()` --indirect_call--> `listRankedUsers()` [INFERRED]
  src/hooks/useUsers.ts → src/lib/appData.ts

## Import Cycles

- None detected.

## Communities (46 total, 4 thin omitted)

### Community 0 - "ImportTvTimePage.tsx"

Cohesion: 0.16
Nodes (19): Props, ImportTvTimePage(), download(), platforms, Props, statuses, StatusIcon(), isActiveImport() (+11 more)

### Community 1 - "localData.ts"

Cohesion: 0.07
Nodes (93): encoder, hashPassword(), normalizeUsername(), DEFAULT_EDUMZZ_SERIES, DEFAULT_OSCAR_MOVIES, LegacyMovie, LegacySeries, readLegacyMovieData() (+85 more)

### Community 2 - "app.ts"

Cohesion: 0.05
Nodes (55): GroupRankingList(), GroupRankingListProps, AdminPanel(), AdminPanelProps, ChangePasswordModal(), ChangePasswordModalProps, CineMatchModal(), CineMatchModalProps (+47 more)

### Community 3 - "devDependencies"

Cohesion: 0.04
Nodes (46): eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, jsdom, devDependencies, eslint (+38 more)

### Community 4 - "DashboardTab.tsx"

Cohesion: 0.22
Nodes (11): DashboardTab(), DashboardTabProps, formatDate(), PreferenceSearchInput(), PreferenceSearchInputProps, PreferenceSearchItem, FAVORITE_GENRE_BY_KEY, FAVORITE_GENRES (+3 more)

### Community 5 - "compilerOptions"

Cohesion: 0.07
Nodes (26): DOM, DOM.Iterable, src, vite/client, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, jsx (+18 more)

### Community 6 - "App.tsx"

Cohesion: 0.09
Nodes (30): ADMIN_USERNAME, App(), runBootstrap(), OTHER_PROFILE_TABS, PROFILE_NAV_ICONS, readStoredSession(), EnterCodeScreen(), EnterCodeScreenProps (+22 more)

### Community 7 - "compilerOptions"

Cohesion: 0.09
Nodes (22): node, vite.config.ts, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection (+14 more)

### Community 8 - "SeriesDetailScreen.tsx"

Cohesion: 0.20
Nodes (14): SeriesDetailScreen(), SeriesDetailScreenProps, DetailPageSkeleton(), Skeleton(), SimilarMediaSection(), getResponsiveSources(), TMDB_WIDTHS, TmdbImage() (+6 more)

### Community 9 - "groups.ts"

Cohesion: 0.06
Nodes (57): ConfirmDialog(), ConfirmDialogProps, GroupAdminPanel(), GroupAdminPanelProps, GroupCard(), GroupCardProps, GroupFormDialog(), GroupFormDialogProps (+49 more)

### Community 10 - "AvatarDisplay.tsx"

Cohesion: 0.23
Nodes (9): AvatarDisplay(), AvatarDisplayProps, ProfileAvatarModal(), ProfileAvatarModalProps, AVATAR_OPTIONS, avatarEmoji(), CUSTOM_AVATAR_PREFIX, customAvatarSrc() (+1 more)

### Community 11 - "tmdb.ts"

Cohesion: 0.10
Nodes (26): CachedHomeCatalog, FAVORITE_GENRE_MIN_RATING, getDiscoverByGenres(), getFavoriteGenreRecommendations(), getHomeCatalog(), getMovieYouTubeTrailer(), getRandomTopRatedCatalog(), getTvYouTubeTrailer() (+18 more)

### Community 12 - "UserSidebar.tsx"

Cohesion: 0.06
Nodes (42): InviteUserInput(), InviteUserInputProps, MIN_SUGGESTION_CHARS, appData, formatSidebarDate(), RECOMMENDATIONS_STORAGE_KEY_PREFIX, SidebarMediaItem(), SidebarMediaItemData (+34 more)

### Community 13 - "ErrorBoundary"

Cohesion: 0.25
Nodes (3): ErrorBoundary, ErrorBoundaryProps, ErrorBoundaryState

### Community 14 - "UserEventBell.tsx"

Cohesion: 0.11
Nodes (25): ActivitiesScreen(), ActivitiesScreenProps, formatTimestamp(), formatTimestamp(), SpecialNotificationsList(), SpecialNotificationsListProps, navigation, UserDropdownMenu() (+17 more)

### Community 15 - "dependencies"

Cohesion: 0.05
Nodes (41): axios, clsx, embla-carousel-react, html2canvas, lucide-react, @microsoft/clarity, motion, dependencies (+33 more)

### Community 16 - "React + TypeScript + Vite"

Cohesion: 0.50
Nodes (3): Expanding the ESLint configuration, React Compiler, React + TypeScript + Vite

### Community 19 - "useUsers.ts"

Cohesion: 0.60
Nodes (4): useAvatarMutation(), useAvatarUploadMutation(), updateUserAvatar(), uploadAvatarImage()

### Community 22 - "CineRats — Guia de Design"

Cohesion: 0.10
Nodes (20): 10. Receita para novas telas, 11. Consistência de implementação, 1. Identidade visual, 2. Tokens de cor, 3. Tipografia, 4. Espaçamento, dimensão e proporção, 5. Bordas, raios e elevação, 6. Layout e responsividade (+12 more)

### Community 24 - "SeriesCard.tsx"

Cohesion: 0.24
Nodes (13): AddSeriesDialog(), AddSeriesDialogProps, SeriesCard(), SeriesCardProps, SeriesSectionProps, Series, updateSeriesStreaming(), getTvSeasonEpisodes() (+5 more)

### Community 25 - "appData.ts"

Cohesion: 0.09
Nodes (27): useNotifications(), activityMessage(), addSeries(), ApiActivity, ApiSeriesWatchEntry, AVATAR_IDS, categoryFromApi, categoryToApi (+19 more)

### Community 27 - "MovieCard.tsx"

Cohesion: 0.24
Nodes (11): CardMovie, MovieCard(), MovieCardProps, parseProviders(), parseTmdbFromSource(), ProviderItem, updatePersonalMovieStreaming(), generateImagePath() (+3 more)

### Community 28 - "ReviewModal.tsx"

Cohesion: 0.32
Nodes (10): ReviewModal(), ReviewModalProps, StarRatingInput(), StarRatingInputProps, canEarnPointsForReview(), getReviewDeadlineHours(), getReviewDeadlineMessage(), MIN_REVIEW_LENGTH (+2 more)

### Community 29 - "PublicHome.tsx"

Cohesion: 0.32
Nodes (9): HomeScreen(), PublicHome(), listPublicRanking(), listRecentPublicReviews(), getReviewReaction(), reviewReactions, getTopRatedMovies(), getTopRatedSeries() (+1 more)

### Community 30 - "cinematch.ts"

Cohesion: 0.26
Nodes (15): listPersonalMovies(), listSeries(), CineMatchCandidate, getCineMatchPool(), getWatchedSeeds(), recentUniqueSeeds(), shuffle(), toCandidate() (+7 more)

### Community 31 - "RankingScreen.tsx"

Cohesion: 0.07
Nodes (53): HomeScreenProps, AchievementIcon(), getIcon(), getLongestStreak(), LEVEL_META, MCOIN_RULES, RankingScreen(), RankingScreenProps (+45 more)

### Community 32 - "legalDocuments.ts"

Cohesion: 0.22
Nodes (8): LegalPage(), CONTACT_ITEMS, LegalBlock, LegalDocument, LegalListItem, LegalSection, PRIVACY_POLICY, TERMS_OF_USE

### Community 33 - "useReviews.ts"

Cohesion: 0.14
Nodes (22): ReviewInteractions(), formatDate(), ReviewsScreen(), useCreateReviewCommentMutation(), useDeleteReviewMutation(), useMediaReviews(), usePublicReviews(), useReviewComments() (+14 more)

### Community 34 - "Header.tsx"

Cohesion: 0.33
Nodes (5): APP_NAVIGATION_TABS, AppTab, Header(), HeaderProps, baseProps

### Community 35 - "useFavorites.ts"

Cohesion: 0.31
Nodes (8): ProfileSummary(), ProfileSummaryProps, FAVORITES_QUERY_KEY, useFavorites(), addFavorite(), listFavorites(), removeFavorite(), UserFavorite

### Community 36 - "FaqScreen.tsx"

Cohesion: 0.16
Nodes (11): ChangelogsScreen(), formatDate(), FAQ_SECTIONS, FaqItem, FaqScreen(), FaqSection, normalizeSearchValue(), LatestUpdatesSection() (+3 more)

### Community 37 - "AuthScreen.tsx"

Cohesion: 0.50
Nodes (3): AuthScreen(), AuthScreenProps, Mode

### Community 38 - "Instruções para agentes de IA"

Cohesion: 0.50
Nodes (3): Atualização do grafo, Graphify, Instruções para agentes de IA

### Community 40 - "getMovieDetailsWithFallback"

Cohesion: 0.36
Nodes (8): SynopsisModal(), SynopsisModalProps, getDetailsWithOverviewFallback(), getMediaDetailsMatchingTitle(), getMediaDetailsWithFallback(), getMovieDetailsWithFallback(), getTvDetailsRawWithFallback(), normalizeMediaTitle()

### Community 41 - "useSeries.ts"

Cohesion: 0.21
Nodes (15): SharedItem, ShareReviewModal(), ShareReviewModalProps, waitForRenderedImages(), withTimeout(), update(), SeriesSection(), useSeries() (+7 more)

### Community 42 - "usePersonalMovies.ts"

Cohesion: 0.26
Nodes (11): PersonalMoviesSection(), PersonalMoviesSectionProps, usePersonalMovieMutations(), usePersonalMovies(), usePersonalMoviesQuery(), useSocialActions(), addPersonalMovie(), deletePersonalMovie() (+3 more)

### Community 44 - "MovieDetailScreen.tsx"

Cohesion: 0.18
Nodes (14): AddMovieDialog(), AddMovieDialogProps, MovieDetailScreen(), MovieDetailScreenProps, WatchedTimingDialog(), WatchedTimingDialogProps, useUsers(), getMovieCineratsStats() (+6 more)

### Community 47 - "HomeScreen.tsx"

Cohesion: 0.17
Nodes (9): MediaType, toHomeMedia(), WatchedSeed, SimilarMediaSectionProps, HOME_RELATED_MIN_RATING, HOME_RELATED_MIN_VOTES, TMDBCatalogItem, TMDBHomeMedia (+1 more)

### Community 48 - "CatalogPage.tsx"

Cohesion: 0.12
Nodes (15): CatalogPage(), CatalogPageProps, CERTIFICATIONS, LANGUAGES, PROVIDERS, SORT_OPTIONS, toggle(), PosterGridSkeleton() (+7 more)

## Knowledge Gaps

- **254 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+249 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **Why does `RankedUser` connect `app.ts` to `localData.ts`, `useFavorites.ts`, `DashboardTab.tsx`, `App.tsx`, `AvatarDisplay.tsx`, `UserSidebar.tsx`, `appData.ts`, `RankingScreen.tsx`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Why does `PersonalMovie` connect `RankingScreen.tsx` to `localData.ts`, `app.ts`, `usePersonalMovies.ts`, `MovieDetailScreen.tsx`, `HomeScreen.tsx`, `appData.ts`, `MovieCard.tsx`, `PublicHome.tsx`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Why does `SeriesEntry` connect `RankingScreen.tsx` to `localData.ts`, `app.ts`, `useSeries.ts`, `HomeScreen.tsx`, `SeriesCard.tsx`, `appData.ts`, `PublicHome.tsx`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _254 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `localData.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06798245614035088 - nodes in this community are weakly interconnected._
- **Should `app.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05456095481670929 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.0425531914893617 - nodes in this community are weakly interconnected._
