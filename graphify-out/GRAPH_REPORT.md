# Graph Report - CineRats  (2026-11-08)

## Corpus Check
- 135 files · ~263,932 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 997 nodes · 2447 edges · 49 communities (45 shown, 4 thin omitted)
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
- PersonDetailScreen.tsx
- groups.ts
- app.ts
- tmdb.ts
- UserSidebar.tsx
- ErrorBoundary
- UserDropdownMenu.tsx
- dependencies
- React + TypeScript + Vite
- PlatformSelect.tsx
- DashboardTab.tsx
- tsconfig.json
- vercel.json
- CineRats — Guia de Design
- SeriesDetailScreen.tsx
- appData.ts
- MovieCard.tsx
- AvatarDisplay.tsx
- cinematch.ts
- PublicDashboardLite.tsx
- RankingScreen.tsx
- legalDocuments.ts
- useReviews.ts
- TmdbImage.tsx
- useFavorites.ts
- ChangelogsScreen.tsx
- useUsers
- Instruções para agentes de IA
- ConfirmPasswordResetScreen.tsx
- getMovieDetailsWithFallback
- GroupPage.test.tsx
- GroupAdminPanel.tsx
- MovieDetailScreen.tsx
- useSeries.ts
- CineMatchPage.tsx
- GroupPage.tsx
- GroupPage
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
- `ProfileSummaryProps` --references--> `RankedUser`  [EXTRACTED]
  src/components/layout/ProfileSummary.tsx → src/types/app.ts

## Import Cycles
- None detected.

## Communities (49 total, 4 thin omitted)

### Community 0 - "ImportTvTimePage.tsx"
Cohesion: 0.16
Nodes (19): Props, ImportTvTimePage(), download(), platforms, Props, statuses, StatusIcon(), isActiveImport() (+11 more)

### Community 1 - "localData.ts"
Cohesion: 0.07
Nodes (93): encoder, hashPassword(), normalizeUsername(), DEFAULT_EDUMZZ_SERIES, DEFAULT_OSCAR_MOVIES, LegacyMovie, LegacySeries, readLegacyMovieData() (+85 more)

### Community 2 - "CineMatchModal.tsx"
Cohesion: 0.31
Nodes (8): CineMatchModal(), CineMatchModalProps, SuggestMovieModalProps, useCineMatch(), getCineMatchSuggestion(), AppUser, CineMatchMode, CineMatchSuggestion

### Community 3 - "devDependencies"
Cohesion: 0.04
Nodes (46): eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, jsdom, devDependencies, eslint (+38 more)

### Community 4 - "HomeScreen.tsx"
Cohesion: 0.17
Nodes (14): HomeScreen(), MediaType, toHomeMedia(), WatchedSeed, PublicHome(), listPublicRanking(), listRecentPublicReviews(), getReviewReaction() (+6 more)

### Community 5 - "compilerOptions"
Cohesion: 0.07
Nodes (26): DOM, DOM.Iterable, src, vite/client, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, jsx (+18 more)

### Community 6 - "App.tsx"
Cohesion: 0.08
Nodes (27): ADMIN_USERNAME, App(), runBootstrap(), OTHER_PROFILE_TABS, PROFILE_NAV_ICONS, readStoredSession(), AuthScreen(), AuthScreenProps (+19 more)

### Community 7 - "compilerOptions"
Cohesion: 0.09
Nodes (22): node, vite.config.ts, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection (+14 more)

### Community 8 - "PersonDetailScreen.tsx"
Cohesion: 0.29
Nodes (9): getAge(), getCreditDate(), getCreditTitle(), PersonDetailScreen(), PersonDetailScreenProps, PersonPageMode, DetailPageSkeleton(), getPersonDetailsWithCredits() (+1 more)

### Community 9 - "groups.ts"
Cohesion: 0.16
Nodes (25): GroupsPage(), GroupsTab, useDebouncedValue(), GROUPS_QUERY_KEY, useCreateGroup(), useGroupActions(), useGroupSearch(), useInvalidateGroups() (+17 more)

### Community 10 - "app.ts"
Cohesion: 0.15
Nodes (17): GroupCard(), GroupCardProps, AnticipatedMovie, FavoritePersonDepartment, GroupDetails, GroupInvite, GroupMemberRole, GroupMemberView (+9 more)

### Community 11 - "tmdb.ts"
Cohesion: 0.11
Nodes (25): CachedHomeCatalog, FAVORITE_GENRE_MIN_RATING, formatLocalDate(), getDiscoverByGenres(), getFavoriteGenreRecommendations(), getHomeCatalog(), getRandomTopRatedCatalog(), getUpcomingCatalog() (+17 more)

### Community 12 - "UserSidebar.tsx"
Cohesion: 0.08
Nodes (30): api, navigation, formatSidebarDate(), RECOMMENDATIONS_STORAGE_KEY_PREFIX, SidebarMediaItem(), SidebarMediaItemData, toSidebarMediaItems(), UserSidebar() (+22 more)

### Community 13 - "ErrorBoundary"
Cohesion: 0.25
Nodes (3): ErrorBoundary, ErrorBoundaryProps, ErrorBoundaryState

### Community 14 - "UserDropdownMenu.tsx"
Cohesion: 0.08
Nodes (35): ActivitiesScreen(), ActivitiesScreenProps, formatTimestamp(), AdminPanel(), AdminPanelProps, ChangePasswordModal(), ChangePasswordModalProps, formatTimestamp() (+27 more)

### Community 15 - "dependencies"
Cohesion: 0.05
Nodes (41): axios, clsx, embla-carousel-react, html2canvas, lucide-react, @microsoft/clarity, motion, dependencies (+33 more)

### Community 16 - "React + TypeScript + Vite"
Cohesion: 0.50
Nodes (3): Expanding the ESLint configuration, React Compiler, React + TypeScript + Vite

### Community 19 - "DashboardTab.tsx"
Cohesion: 0.18
Nodes (14): DashboardTab(), DashboardTabProps, formatDate(), PreferenceSearchInput(), PreferenceSearchInputProps, PreferenceSearchItem, useUserReviews(), listUserReviews() (+6 more)

### Community 22 - "CineRats — Guia de Design"
Cohesion: 0.10
Nodes (20): 10. Receita para novas telas, 11. Consistência de implementação, 1. Identidade visual, 2. Tokens de cor, 3. Tipografia, 4. Espaçamento, dimensão e proporção, 5. Bordas, raios e elevação, 6. Layout e responsividade (+12 more)

### Community 24 - "SeriesDetailScreen.tsx"
Cohesion: 0.33
Nodes (10): SeriesDetailScreen(), SeriesDetailScreenProps, getSeriesCineratsStats(), fetchSeasonEpisodes(), getTvCredits(), getTvSeasonEpisodes(), getTvSimilarWithFallback(), getTvYouTubeTrailer() (+2 more)

### Community 25 - "appData.ts"
Cohesion: 0.09
Nodes (34): useNotifications(), useMediaReviews(), useAvatarMutation(), useAvatarUploadMutation(), activityMessage(), ApiActivity, ApiSeriesWatchEntry, AVATAR_IDS (+26 more)

### Community 27 - "MovieCard.tsx"
Cohesion: 0.07
Nodes (48): SharedItem, ShareReviewModal(), ShareReviewModalProps, waitForRenderedImages(), withTimeout(), AddMovieDialog(), AddMovieDialogProps, CardMovie (+40 more)

### Community 28 - "AvatarDisplay.tsx"
Cohesion: 0.23
Nodes (9): AvatarDisplay(), AvatarDisplayProps, ProfileAvatarModal(), ProfileAvatarModalProps, AVATAR_OPTIONS, avatarEmoji(), CUSTOM_AVATAR_PREFIX, customAvatarSrc() (+1 more)

### Community 29 - "cinematch.ts"
Cohesion: 0.30
Nodes (13): getCineMatchPool(), getWatchedSeeds(), recentUniqueSeeds(), shuffle(), toCandidate(), WatchedSeed, getMovieRecommendations(), getMovieSimilar() (+5 more)

### Community 30 - "PublicDashboardLite.tsx"
Cohesion: 0.20
Nodes (8): APP_NAVIGATION_TABS, AppTab, Header(), HeaderProps, baseProps, PublicDashboardLite(), PublicTab, SeriesSection()

### Community 31 - "RankingScreen.tsx"
Cohesion: 0.06
Nodes (63): HomeScreenProps, GlobalSearch(), GlobalSearchProps, AchievementIcon(), getIcon(), getLongestStreak(), LEVEL_META, MCOIN_RULES (+55 more)

### Community 32 - "legalDocuments.ts"
Cohesion: 0.22
Nodes (8): LegalPage(), CONTACT_ITEMS, LegalBlock, LegalDocument, LegalListItem, LegalSection, PRIVACY_POLICY, TERMS_OF_USE

### Community 33 - "useReviews.ts"
Cohesion: 0.17
Nodes (18): ReviewInteractions(), formatDate(), ReviewsScreen(), useCreateReviewCommentMutation(), useDeleteReviewMutation(), usePublicReviews(), useReviewComments(), useReviewReactionMutation() (+10 more)

### Community 34 - "TmdbImage.tsx"
Cohesion: 0.21
Nodes (10): SimilarMediaSection(), SimilarMediaSectionProps, getResponsiveSources(), TMDB_WIDTHS, TmdbImage(), TmdbImageProps, SIMILAR_MEDIA_MIN_RATING, TMDBCatalogItem (+2 more)

### Community 35 - "useFavorites.ts"
Cohesion: 0.31
Nodes (8): ProfileSummary(), ProfileSummaryProps, FAVORITES_QUERY_KEY, useFavorites(), addFavorite(), listFavorites(), removeFavorite(), UserFavorite

### Community 36 - "ChangelogsScreen.tsx"
Cohesion: 0.31
Nodes (6): ChangelogsScreen(), formatDate(), LatestUpdatesSection(), ChangelogEntry, ChangelogLinkItem, CHANGELOGS

### Community 37 - "useUsers"
Cohesion: 0.28
Nodes (5): InviteUserInput(), InviteUserInputProps, MIN_SUGGESTION_CHARS, appData, useUsers()

### Community 38 - "Instruções para agentes de IA"
Cohesion: 0.50
Nodes (3): Atualização do grafo, Graphify, Instruções para agentes de IA

### Community 40 - "getMovieDetailsWithFallback"
Cohesion: 0.36
Nodes (8): SynopsisModal(), SynopsisModalProps, getDetailsWithOverviewFallback(), getMediaDetailsMatchingTitle(), getMediaDetailsWithFallback(), getMovieDetailsWithFallback(), getTvDetailsRawWithFallback(), normalizeMediaTitle()

### Community 41 - "GroupPage.test.tsx"
Cohesion: 0.29
Nodes (5): admin, api, navigation, ranking, GroupRanking

### Community 42 - "GroupAdminPanel.tsx"
Cohesion: 0.40
Nodes (4): GroupAdminPanel(), GroupAdminPanelProps, useGroupPendingRequests(), GroupPendingItem

### Community 44 - "MovieDetailScreen.tsx"
Cohesion: 0.31
Nodes (8): MovieDetailScreen(), MovieDetailScreenProps, WatchedTimingDialog(), WatchedTimingDialogProps, getMovieCredits(), getMovieSimilarWithFallback(), getMovieYouTubeTrailer(), isReleaseDateOnOrBeforeToday()

### Community 46 - "useSeries.ts"
Cohesion: 0.31
Nodes (12): useSeries(), useSeriesMutations(), useSeriesQuery(), addSeries(), createSeriesWatchEntries(), deleteSeries(), getSeriesStatus(), listSeries() (+4 more)

### Community 48 - "CineMatchPage.tsx"
Cohesion: 0.06
Nodes (38): CineMatchPage(), accept(), draw(), Props, Props, WatchPartyHistory(), update(), CatalogPage() (+30 more)

### Community 50 - "GroupPage.tsx"
Cohesion: 0.18
Nodes (10): ConfirmDialog(), ConfirmDialogProps, GroupFormDialog(), GroupFormDialogProps, formatDate(), GroupPageProps, OutsiderActions(), GroupRankingList() (+2 more)

### Community 55 - "GroupPage"
Cohesion: 0.21
Nodes (11): formatMonth(), GroupPage(), useGroup(), useGroupRanking(), getGroup(), getGroupRanking(), listGroupPendingRequests(), normalizeProfile() (+3 more)

### Community 56 - "FaqScreen.tsx"
Cohesion: 0.40
Nodes (5): FAQ_SECTIONS, FaqItem, FaqScreen(), FaqSection, normalizeSearchValue()

## Knowledge Gaps
- **255 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+250 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `RankedUser` connect `RankingScreen.tsx` to `localData.ts`, `CineMatchModal.tsx`, `useFavorites.ts`, `useUsers`, `App.tsx`, `app.ts`, `UserSidebar.tsx`, `UserDropdownMenu.tsx`, `CineMatchPage.tsx`, `DashboardTab.tsx`, `appData.ts`, `AvatarDisplay.tsx`, `PublicDashboardLite.tsx`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Why does `PersonalMovie` connect `RankingScreen.tsx` to `localData.ts`, `HomeScreen.tsx`, `app.ts`, `appData.ts`, `MovieCard.tsx`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Why does `SeriesEntry` connect `RankingScreen.tsx` to `localData.ts`, `HomeScreen.tsx`, `app.ts`, `useSeries.ts`, `CineMatchPage.tsx`, `appData.ts`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _255 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `localData.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06798245614035088 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.0425531914893617 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._