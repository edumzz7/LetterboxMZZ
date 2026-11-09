# Graph Report - CineRats  (2026-09-27)

## Corpus Check
- 103 files · ~246,137 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 801 nodes · 1949 edges · 37 communities (33 shown, 4 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 18 edges (avg confidence: 0.78)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `fd932819`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ImportTvTimePage.tsx
- localData.ts
- app.ts
- devDependencies
- withFallback
- compilerOptions
- App.tsx
- compilerOptions
- MovieDetailScreen.tsx
- HomeScreen.tsx
- useSeries.ts
- tmdb.ts
- appData.ts
- ErrorBoundary
- AvatarDisplay.tsx
- dependencies
- React + TypeScript + Vite
- PlatformSelect.tsx
- UserSidebar.tsx
- UserDropdownMenu.tsx
- tsconfig.json
- vercel.json
- CineRats — Guia de Design
- cinematch.ts
- PersonDetailScreen.tsx
- CatalogPage.tsx
- SimilarMediaSection.tsx
- DashboardTab
- SuggestMovieModal.tsx
- RankedUser
- useFavorites.ts
- ChangelogsScreen.tsx
- FaqScreen.tsx
- Instruções para agentes de IA
- ConfirmPasswordResetScreen.tsx

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
- `AdminPanelProps` --references--> `RankedUser`  [EXTRACTED]
  src/components/layout/AdminPanel.tsx → src/types/app.ts
- `Props` --references--> `RankedUser`  [EXTRACTED]
  src/components/layout/CineMatchPage.tsx → src/types/app.ts
- `GlobalSearchProps` --references--> `RankedUser`  [EXTRACTED]
  src/components/layout/GlobalSearch.tsx → src/types/app.ts
- `ProfileSummaryProps` --references--> `RankedUser`  [EXTRACTED]
  src/components/layout/ProfileSummary.tsx → src/types/app.ts

## Import Cycles
- None detected.

## Communities (37 total, 4 thin omitted)

### Community 0 - "ImportTvTimePage.tsx"
Cohesion: 0.16
Nodes (19): Props, ImportTvTimePage(), download(), platforms, Props, statuses, StatusIcon(), isActiveImport() (+11 more)

### Community 1 - "localData.ts"
Cohesion: 0.07
Nodes (93): encoder, hashPassword(), normalizeUsername(), DEFAULT_EDUMZZ_SERIES, DEFAULT_OSCAR_MOVIES, LegacyMovie, LegacySeries, readLegacyMovieData() (+85 more)

### Community 2 - "app.ts"
Cohesion: 0.11
Nodes (27): CineMatchModal(), CineMatchModalProps, CineMatchPage(), accept(), draw(), Props, SuggestMovieModalProps, Props (+19 more)

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

### Community 8 - "MovieDetailScreen.tsx"
Cohesion: 0.06
Nodes (59): SharedItem, ShareReviewModal(), ShareReviewModalProps, waitForRenderedImages(), withTimeout(), CardMovie, MovieCard(), MovieCardProps (+51 more)

### Community 9 - "HomeScreen.tsx"
Cohesion: 0.17
Nodes (14): HomeScreen(), MediaType, toHomeMedia(), WatchedSeed, PublicHome(), listPublicRanking(), listRecentPublicReviews(), getReviewReaction() (+6 more)

### Community 10 - "useSeries.ts"
Cohesion: 0.21
Nodes (15): AddSeriesDialogProps, SeriesSection(), SeriesSectionProps, useSeries(), useSeriesMutations(), useSeriesQuery(), addSeries(), createSeriesWatchEntries() (+7 more)

### Community 11 - "tmdb.ts"
Cohesion: 0.11
Nodes (24): CachedHomeCatalog, FAVORITE_GENRE_MIN_RATING, formatLocalDate(), getDiscoverByGenres(), getFavoriteGenreRecommendations(), getHomeCatalog(), getRandomTopRatedCatalog(), getUpcomingCatalog() (+16 more)

### Community 12 - "appData.ts"
Cohesion: 0.13
Nodes (16): useNotifications(), activityMessage(), ApiActivity, ApiSeriesWatchEntry, AVATAR_IDS, categoryFromApi, categoryToApi, listActivities() (+8 more)

### Community 13 - "ErrorBoundary"
Cohesion: 0.25
Nodes (3): ErrorBoundary, ErrorBoundaryProps, ErrorBoundaryState

### Community 14 - "AvatarDisplay.tsx"
Cohesion: 0.13
Nodes (19): AvatarDisplay(), AvatarDisplayProps, ProfileAvatarModal(), ProfileAvatarModalProps, formatDate(), ReviewsScreen(), useDeleteReviewMutation(), useMediaReviews() (+11 more)

### Community 15 - "dependencies"
Cohesion: 0.05
Nodes (41): axios, clsx, embla-carousel-react, html2canvas, lucide-react, @microsoft/clarity, motion, dependencies (+33 more)

### Community 16 - "React + TypeScript + Vite"
Cohesion: 0.50
Nodes (3): Expanding the ESLint configuration, React Compiler, React + TypeScript + Vite

### Community 18 - "UserSidebar.tsx"
Cohesion: 0.19
Nodes (15): formatSidebarDate(), RECOMMENDATIONS_STORAGE_KEY_PREFIX, SidebarMediaItem(), SidebarMediaItemData, toSidebarMediaItems(), UserSidebar(), UserSidebarProps, SynopsisModal() (+7 more)

### Community 19 - "UserDropdownMenu.tsx"
Cohesion: 0.11
Nodes (22): ActivitiesScreen(), ActivitiesScreenProps, formatTimestamp(), AdminPanel(), AdminPanelProps, ChangePasswordModal(), ChangePasswordModalProps, UserDropdownMenu() (+14 more)

### Community 22 - "CineRats — Guia de Design"
Cohesion: 0.10
Nodes (20): 10. Receita para novas telas, 11. Consistência de implementação, 1. Identidade visual, 2. Tokens de cor, 3. Tipografia, 4. Espaçamento, dimensão e proporção, 5. Bordas, raios e elevação, 6. Layout e responsividade (+12 more)

### Community 24 - "cinematch.ts"
Cohesion: 0.25
Nodes (15): listSeries(), CineMatchCandidate, getCineMatchPool(), getWatchedSeeds(), recentUniqueSeeds(), shuffle(), toCandidate(), WatchedSeed (+7 more)

### Community 25 - "PersonDetailScreen.tsx"
Cohesion: 0.33
Nodes (8): getAge(), getCreditDate(), getCreditTitle(), PersonDetailScreen(), PersonDetailScreenProps, PersonPageMode, getPersonDetailsWithCredits(), TMDBCombinedCredit

### Community 27 - "CatalogPage.tsx"
Cohesion: 0.12
Nodes (15): CatalogPage(), CatalogPageProps, CERTIFICATIONS, LANGUAGES, PROVIDERS, SORT_OPTIONS, toggle(), CatalogFilters (+7 more)

### Community 28 - "SimilarMediaSection.tsx"
Cohesion: 0.40
Nodes (5): SimilarMediaSection(), SimilarMediaSectionProps, SIMILAR_MEDIA_MIN_RATING, TMDBHomeMedia, TMDBRecommendationItem

### Community 29 - "DashboardTab"
Cohesion: 0.24
Nodes (10): DashboardTab(), useAvatarMutation(), useAvatarUploadMutation(), useUsers(), fallbackAvatar(), listRankedUsers(), listUsers(), updateUserAvatar() (+2 more)

### Community 33 - "SuggestMovieModal.tsx"
Cohesion: 0.18
Nodes (14): GlobalSearch(), GlobalSearchProps, SuggestMovieModal(), AddSeriesDialog(), useSuggestMovie(), suggestMovieToUser(), getMovieWatchProviders(), getTvWatchProviders() (+6 more)

### Community 34 - "RankedUser"
Cohesion: 0.05
Nodes (68): HomeScreenProps, DashboardTabProps, formatDate(), PreferenceSearchInput(), PreferenceSearchInputProps, PreferenceSearchItem, AchievementIcon(), getIcon() (+60 more)

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

## Knowledge Gaps
- **206 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+201 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `RankedUser` connect `RankedUser` to `SuggestMovieModal.tsx`, `app.ts`, `useFavorites.ts`, `localData.ts`, `App.tsx`, `appData.ts`, `AvatarDisplay.tsx`, `UserSidebar.tsx`, `UserDropdownMenu.tsx`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Why does `PersonalMovie` connect `RankedUser` to `localData.ts`, `SuggestMovieModal.tsx`, `app.ts`, `MovieDetailScreen.tsx`, `HomeScreen.tsx`, `appData.ts`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Why does `SeriesEntry` connect `RankedUser` to `localData.ts`, `SuggestMovieModal.tsx`, `app.ts`, `HomeScreen.tsx`, `useSeries.ts`, `appData.ts`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _206 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `localData.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06798245614035088 - nodes in this community are weakly interconnected._
- **Should `app.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11051693404634581 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._