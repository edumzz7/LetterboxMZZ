# Graph Report - CineRats (2026-09-22)

## Corpus Check

- 96 files · ~243,717 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary

- 757 nodes · 1841 edges · 42 communities (38 shown, 4 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 15 edges (avg confidence: 0.78)
- Token cost: 0 input · 0 output

## Graph Freshness

- Built from commit: `9f97958a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)

- appData.ts
- localData.ts
- MovieDetailScreen.tsx
- devDependencies
- AvatarDisplay.tsx
- compilerOptions
- withFallback
- compilerOptions
- CatalogPage.tsx
- App.tsx
- UserSidebar.tsx
- HomeScreen.tsx
- getMovieDetailsWithFallback
- ErrorBoundary
- UserDropdownMenu.tsx
- dependencies
- React + TypeScript + Vite
- PlatformSelect.tsx
- RankedUser
- tmdb.ts
- tsconfig.json
- vercel.json
- CineRats — Guia de Design
- app.ts
- PersonDetailScreen.tsx
- UserEventBell.tsx
- DashboardTab.tsx
- AuthScreen.tsx
- achievements.ts
- SuggestMovieModal.tsx
- useUsers.ts
- PublicDashboardLite.tsx
- RankingScreen.tsx
- ChangelogsScreen.tsx
- FaqScreen.tsx
- Instruções para agentes de IA
- ConfirmPasswordResetScreen.tsx
- SeriesCard.tsx
- useFavorites.ts
- OscarPredictionsSection.tsx

## God Nodes (most connected - your core abstractions)

1. `withFallback()` - 44 edges
2. `RankedUser` - 27 edges
3. `PersonalMovie` - 26 edges
4. `App()` - 21 edges
5. `SeriesEntry` - 21 edges
6. `requireSession()` - 20 edges
7. `compilerOptions` - 20 edges
8. `addActivity()` - 18 edges
9. `deleteCurrentUser()` - 18 edges
10. `compilerOptions` - 18 edges

## Surprising Connections (you probably didn't know these)

- `App()` --indirect_call--> `listPublicRanking()` [INFERRED]
  src/App.tsx → src/lib/appData.ts
- `AdminPanelProps` --references--> `RankedUser` [EXTRACTED]
  src/components/layout/AdminPanel.tsx → src/types/app.ts
- `DashboardTabProps` --references--> `RankedUser` [EXTRACTED]
  src/components/layout/DashboardTab.tsx → src/types/app.ts
- `GlobalSearchProps` --references--> `RankedUser` [EXTRACTED]
  src/components/layout/GlobalSearch.tsx → src/types/app.ts
- `UserSidebarProps` --references--> `RankedUser` [EXTRACTED]
  src/components/layout/UserSidebar.tsx → src/types/app.ts

## Import Cycles

- None detected.

## Communities (42 total, 4 thin omitted)

### Community 0 - "appData.ts"

Cohesion: 0.06
Nodes (56): CineMatchModal(), Props, ImportTvTimePage(), download(), platforms, Props, statuses, StatusIcon() (+48 more)

### Community 1 - "localData.ts"

Cohesion: 0.07
Nodes (91): encoder, hashPassword(), normalizeUsername(), DEFAULT_EDUMZZ_SERIES, DEFAULT_OSCAR_MOVIES, LegacyMovie, LegacySeries, readLegacyMovieData() (+83 more)

### Community 2 - "MovieDetailScreen.tsx"

Cohesion: 0.06
Nodes (58): SharedItem, ShareReviewModal(), ShareReviewModalProps, waitForRenderedImages(), withTimeout(), AddMovieDialog(), AddMovieDialogProps, CardMovie (+50 more)

### Community 3 - "devDependencies"

Cohesion: 0.06
Nodes (34): eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, devDependencies, eslint, @eslint/js (+26 more)

### Community 4 - "AvatarDisplay.tsx"

Cohesion: 0.22
Nodes (10): AvatarDisplay(), AvatarDisplayProps, ProfileAvatarModal(), ProfileAvatarModalProps, uploadAvatarImage(), AVATAR_OPTIONS, avatarEmoji(), CUSTOM_AVATAR_PREFIX (+2 more)

### Community 5 - "compilerOptions"

Cohesion: 0.07
Nodes (26): DOM, DOM.Iterable, src, vite/client, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, jsx (+18 more)

### Community 6 - "withFallback"

Cohesion: 0.21
Nodes (16): App(), runBootstrap(), readStoredSession(), adminResetPassword(), changePassword(), clearAppDataCache(), confirmPasswordReset(), deleteCurrentUser() (+8 more)

### Community 7 - "compilerOptions"

Cohesion: 0.09
Nodes (22): node, vite.config.ts, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection (+14 more)

### Community 8 - "CatalogPage.tsx"

Cohesion: 0.19
Nodes (10): CatalogPage(), CatalogPageProps, CERTIFICATIONS, LANGUAGES, PROVIDERS, SORT_OPTIONS, toggle(), CatalogFilters (+2 more)

### Community 9 - "App.tsx"

Cohesion: 0.13
Nodes (12): ADMIN_USERNAME, EnterCodeScreen(), EnterCodeScreenProps, RequestPasswordResetScreen(), RequestPasswordResetScreenProps, Header(), HeaderProps, LatestUpdatesSection() (+4 more)

### Community 10 - "UserSidebar.tsx"

Cohesion: 0.18
Nodes (20): buildRecommendations(), createSessionVariant(), entryWeight(), getRecommendationSeeds(), normalizeTitle(), RecommendationItem, RecommendationLists, RECOMMENDATIONS_STORAGE_KEY_PREFIX (+12 more)

### Community 11 - "HomeScreen.tsx"

Cohesion: 0.16
Nodes (15): HomeScreen(), MediaType, toHomeMedia(), WatchedSeed, PublicHome(), SimilarMediaSectionProps, listPublicRanking(), getTopRatedMovies() (+7 more)

### Community 12 - "getMovieDetailsWithFallback"

Cohesion: 0.33
Nodes (10): SidebarMovieItem(), SidebarRecommendationItem(), SynopsisModal(), SynopsisModalProps, getDetailsWithOverviewFallback(), getMediaDetailsMatchingTitle(), getMediaDetailsWithFallback(), getMovieDetailsWithFallback() (+2 more)

### Community 13 - "ErrorBoundary"

Cohesion: 0.25
Nodes (3): ErrorBoundary, ErrorBoundaryProps, ErrorBoundaryState

### Community 14 - "UserDropdownMenu.tsx"

Cohesion: 0.19
Nodes (11): ChangePasswordModal(), ChangePasswordModalProps, UserDropdownMenu(), UserDropdownMenuProps, PublicHeader(), PublicHeaderProps, SearchSlotProps, HEADER_MENU_OPEN_EVENT (+3 more)

### Community 15 - "dependencies"

Cohesion: 0.05
Nodes (41): axios, clsx, embla-carousel-react, html2canvas, lucide-react, @microsoft/clarity, motion, dependencies (+33 more)

### Community 16 - "React + TypeScript + Vite"

Cohesion: 0.50
Nodes (3): Expanding the ESLint configuration, React Compiler, React + TypeScript + Vite

### Community 18 - "RankedUser"

Cohesion: 0.31
Nodes (14): HomeScreenProps, ProfileSummaryProps, RankingScreenProps, PublicHomeProps, AchievementBadgeProps, UserAchievements(), UserAchievementsProps, Achievement (+6 more)

### Community 19 - "tmdb.ts"

Cohesion: 0.11
Nodes (24): CachedHomeCatalog, FAVORITE_GENRE_MIN_RATING, getDiscoverByGenres(), getFavoriteGenreRecommendations(), getHomeCatalog(), getMovieYouTubeTrailer(), getRandomTopRatedCatalog(), getTvYouTubeTrailer() (+16 more)

### Community 22 - "CineRats — Guia de Design"

Cohesion: 0.10
Nodes (20): 10. Receita para novas telas, 11. Consistência de implementação, 1. Identidade visual, 2. Tokens de cor, 3. Tipografia, 4. Espaçamento, dimensão e proporção, 5. Bordas, raios e elevação, 6. Layout e responsividade (+12 more)

### Community 24 - "app.ts"

Cohesion: 0.25
Nodes (7): AdminPanel(), AdminPanelProps, AnticipatedMovie, OscarMovie, OscarMovieWithStatus, TrendingMovie, UserMetadata

### Community 25 - "PersonDetailScreen.tsx"

Cohesion: 0.33
Nodes (8): getAge(), getCreditDate(), getCreditTitle(), PersonDetailScreen(), PersonDetailScreenProps, PersonPageMode, getPersonDetailsWithCredits(), TMDBCombinedCredit

### Community 27 - "UserEventBell.tsx"

Cohesion: 0.39
Nodes (7): formatTimestamp(), readSeenTimestamp(), UserEventBell(), UserEventBellProps, writeSeenTimestamp(), useUserActivity(), listUserActivity()

### Community 28 - "DashboardTab.tsx"

Cohesion: 0.15
Nodes (16): DashboardTab(), DashboardTabProps, formatDate(), PreferenceSearchInput(), PreferenceSearchInputProps, PreferenceSearchItem, useDeleteReviewMutation(), useUserReviews() (+8 more)

### Community 29 - "AuthScreen.tsx"

Cohesion: 0.50
Nodes (3): AuthScreen(), AuthScreenProps, Mode

### Community 31 - "achievements.ts"

Cohesion: 0.22
Nodes (15): COMEDY_MOVIES, countRatedMovies(), countRatedSeries(), FAMILY_MOVIES, getAchievementProgress(), getFavoriteDirector(), HORROR_SERIES, maxSevenDayMovieCount() (+7 more)

### Community 32 - "SuggestMovieModal.tsx"

Cohesion: 0.24
Nodes (10): CineMatchModalProps, GlobalSearch(), GlobalSearchProps, SuggestMovieModal(), SuggestMovieModalProps, useSuggestMovie(), suggestMovieToUser(), searchMulti() (+2 more)

### Community 33 - "useUsers.ts"

Cohesion: 0.50
Nodes (4): useAvatarMutation(), useAvatarUploadMutation(), useUsers(), updateUserAvatar()

### Community 34 - "PublicDashboardLite.tsx"

Cohesion: 0.18
Nodes (7): PublicDashboardLite(), PublicTab, SeriesSection(), LEVEL_ORDER, AchievementBadge(), ACHIEVEMENTS, listUserAchievementIds()

### Community 35 - "RankingScreen.tsx"

Cohesion: 0.27
Nodes (8): AchievementIcon(), getIcon(), getLongestStreak(), LEVEL_META, MCOIN_RULES, RankingScreen(), SECRET_META, getFavoriteGenreLabel()

### Community 36 - "ChangelogsScreen.tsx"

Cohesion: 0.38
Nodes (5): ChangelogsScreen(), formatDate(), ChangelogEntry, ChangelogLinkItem, CHANGELOGS

### Community 37 - "FaqScreen.tsx"

Cohesion: 0.40
Nodes (5): FAQ_SECTIONS, FaqItem, FaqScreen(), FaqSection, normalizeSearchValue()

### Community 38 - "Instruções para agentes de IA"

Cohesion: 0.50
Nodes (3): Atualização do grafo, Graphify, Instruções para agentes de IA

### Community 40 - "SeriesCard.tsx"

Cohesion: 0.22
Nodes (15): AddSeriesDialog(), AddSeriesDialogProps, SeriesCard(), SeriesCardProps, SeriesSectionProps, Series, updateSeriesStreaming(), getTvDetails() (+7 more)

### Community 42 - "useFavorites.ts"

Cohesion: 0.36
Nodes (7): ProfileSummary(), FAVORITES_QUERY_KEY, useFavorites(), addFavorite(), listFavorites(), removeFavorite(), UserFavorite

### Community 44 - "OscarPredictionsSection.tsx"

Cohesion: 0.20
Nodes (13): CATEGORIES, CategoryCard(), CategoryCardProps, CategoryConfig, getTmdbImageUrl(), OscarPredictionsSection(), OscarPredictionsSectionProps, PredictionSearchResult (+5 more)

## Knowledge Gaps

- **201 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+196 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **Why does `RankedUser` connect `RankedUser` to `SuggestMovieModal.tsx`, `appData.ts`, `PublicDashboardLite.tsx`, `RankingScreen.tsx`, `AvatarDisplay.tsx`, `localData.ts`, `App.tsx`, `UserSidebar.tsx`, `UserDropdownMenu.tsx`, `app.ts`, `DashboardTab.tsx`, `achievements.ts`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `PersonalMovie` connect `RankedUser` to `SuggestMovieModal.tsx`, `appData.ts`, `MovieDetailScreen.tsx`, `RankingScreen.tsx`, `localData.ts`, `UserSidebar.tsx`, `HomeScreen.tsx`, `app.ts`, `achievements.ts`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Why does `SeriesEntry` connect `RankedUser` to `appData.ts`, `localData.ts`, `RankingScreen.tsx`, `SeriesCard.tsx`, `UserSidebar.tsx`, `HomeScreen.tsx`, `app.ts`, `achievements.ts`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _201 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `appData.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05517503805175038 - nodes in this community are weakly interconnected._
- **Should `localData.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07000686341798215 - nodes in this community are weakly interconnected._
- **Should `MovieDetailScreen.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.062206572769953054 - nodes in this community are weakly interconnected._
