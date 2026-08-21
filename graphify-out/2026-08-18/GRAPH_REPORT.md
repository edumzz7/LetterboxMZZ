# Graph Report - CineRats  (2026-07-09)

## Corpus Check
- 65 files · ~185,008 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 537 nodes · 1449 edges · 27 communities (22 shown, 5 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.6)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f5b91fa3`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- appData.ts
- localData.ts
- tmdb.ts
- dependencies
- App.tsx
- compilerOptions
- UserAchievements.tsx
- compilerOptions
- RankedUser
- OscarPredictionsSection.tsx
- AvatarDisplay.tsx
- app.ts
- UserEventBell.tsx
- ErrorBoundary
- PersonalMovie
- catalog.ts
- React + TypeScript + Vite
- PlatformSelect.tsx
- ChangePasswordModal.tsx
- useNotifications.ts
- tsconfig.json
- vercel.json

## God Nodes (most connected - your core abstractions)
1. `withFallback()` - 50 edges
2. `requireSessionUser()` - 21 edges
3. `requireSession()` - 20 edges
4. `compilerOptions` - 20 edges
5. `RankedUser` - 19 edges
6. `addActivity()` - 18 edges
7. `deleteCurrentUser()` - 18 edges
8. `compilerOptions` - 18 edges
9. `createDocument()` - 17 edges
10. `updateDocument()` - 17 edges

## Surprising Connections (you probably didn't know these)
- `DashboardTabProps` --references--> `RankedUser`  [EXTRACTED]
  src/components/layout/DashboardTab.tsx → src/types/app.ts
- `SuggestMovieModalProps` --references--> `AppUser`  [EXTRACTED]
  src/components/layout/SuggestMovieModal.tsx → src/types/app.ts
- `usePersonalMovieMutations()` --indirect_call--> `deletePersonalMovie()`  [INFERRED]
  src/hooks/usePersonalMovies.ts → src/lib/appData.ts
- `useSeriesMutations()` --indirect_call--> `deleteSeries()`  [INFERRED]
  src/hooks/useSeries.ts → src/lib/appData.ts
- `useUsers()` --indirect_call--> `listRankedUsers()`  [INFERRED]
  src/hooks/useUsers.ts → src/lib/appData.ts

## Import Cycles
- None detected.

## Communities (27 total, 5 thin omitted)

### Community 0 - "appData.ts"
Cohesion: 0.05
Nodes (113): App(), activateLocalMode(), addActivity(), addFavorite(), addOscarMovie(), addPersonalMovie(), addSeries(), adminResetPassword() (+105 more)

### Community 1 - "localData.ts"
Cohesion: 0.08
Nodes (86): encoder, hashPassword(), readLegacyMovieData(), readLegacySeriesData(), addActivity(), addFavorite(), addOscarMovie(), addPersonalMovie() (+78 more)

### Community 2 - "tmdb.ts"
Cohesion: 0.07
Nodes (54): SharedItem, ShareReviewModal(), ShareReviewModalProps, AddMovieDialog(), AddMovieDialogProps, CardMovie, isPersonalMovie(), MovieCard() (+46 more)

### Community 3 - "dependencies"
Cohesion: 0.04
Nodes (43): dependencies, appwrite, clsx, embla-carousel-react, html2canvas, lucide-react, playwright, @radix-ui/react-dialog (+35 more)

### Community 4 - "App.tsx"
Cohesion: 0.08
Nodes (36): ADMIN_USERNAME, readStoredSession(), AuthScreen(), AuthScreenProps, Mode, DashboardTab(), DashboardTabProps, formatDate() (+28 more)

### Community 5 - "compilerOptions"
Cohesion: 0.09
Nodes (21): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection, moduleResolution (+13 more)

### Community 6 - "UserAchievements.tsx"
Cohesion: 0.15
Nodes (16): LEVEL_ORDER, AchievementBadge(), AchievementBadgeProps, UserAchievements(), UserAchievementsProps, Achievement, ACHIEVEMENTS, COMEDY_MOVIES (+8 more)

### Community 7 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution, noEmit (+11 more)

### Community 8 - "RankedUser"
Cohesion: 0.16
Nodes (10): AdminPanelProps, EditProfileModal(), EditProfileModalProps, SearchItem, RankingScreenProps, UserDropdownMenuProps, linkGoogleAccount(), RankedUser (+2 more)

### Community 9 - "OscarPredictionsSection.tsx"
Cohesion: 0.23
Nodes (11): CATEGORIES, CategoryCard(), CategoryCardProps, CategoryConfig, getTmdbImageUrl(), OscarPredictionsSection(), OscarPredictionsSectionProps, useOscarPredictions() (+3 more)

### Community 10 - "AvatarDisplay.tsx"
Cohesion: 0.35
Nodes (9): AvatarDisplay(), AvatarDisplayProps, ProfileAvatarModal(), ProfileAvatarModalProps, AVATAR_OPTIONS, avatarEmoji(), createCustomAvatarId(), customAvatarSrc() (+1 more)

### Community 11 - "app.ts"
Cohesion: 0.35
Nodes (8): CineMatchModal(), CineMatchModalProps, useCineMatch(), AppUser, CineMatchMode, CineMatchSuggestion, OscarMovie, OscarMovieWithStatus

### Community 12 - "UserEventBell.tsx"
Cohesion: 0.39
Nodes (7): formatTimestamp(), readSeenTimestamp(), UserEventBell(), UserEventBellProps, writeSeenTimestamp(), useUserActivity(), listUserActivity()

### Community 14 - "PersonalMovie"
Cohesion: 0.53
Nodes (4): SuggestMovieModal(), SuggestMovieModalProps, useSuggestMovie(), PersonalMovie

### Community 15 - "catalog.ts"
Cohesion: 0.33
Nodes (5): DEFAULT_EDUMZZ_SERIES, DEFAULT_OSCAR_MOVIES, LegacyMovie, LegacySeries, SeriesEntry

### Community 16 - "React + TypeScript + Vite"
Cohesion: 0.50
Nodes (3): Expanding the ESLint configuration, React Compiler, React + TypeScript + Vite

### Community 17 - "PlatformSelect.tsx"
Cohesion: 0.67
Nodes (3): PLATFORMS, PlatformSelect(), PlatformSelectProps

## Knowledge Gaps
- **145 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+140 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What connects `name`, `private`, `version` to the rest of the system?**
  _145 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `appData.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05319776009431182 - nodes in this community are weakly interconnected._
- **Should `localData.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07601880877742946 - nodes in this community are weakly interconnected._
- **Should `tmdb.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06841046277665996 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.044444444444444446 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07676767676767676 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._