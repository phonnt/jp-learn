# Architecture

## 1. Layer Overview

```
┌──────────────────────────────────────────────────────────┐
│                    Browser (Client)                       │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────────┐  │
│  │  shadcn   │  │  Zustand │  │  TanStack Query       │  │
│  │  (UI)     │  │(session) │  │  (server state cache) │  │
│  └──────────┘  └──────────┘  └───────────────────────┘  │
│                      │                                    │
│         React Hook Form + Zod (forms)                    │
│                      │                                    │
├──────────────────────┼────────────────────────────────────┤
│           Next.js App Router (Server)                    │
│  ┌──────────┐  ┌─────┴──────┐  ┌──────────────────────┐ │
│  │  RSC     │  │Server      │  │API Routes            │ │
│  │(fetch)   │  │Actions     │  │(webhooks, 3rd party)  │ │
│  └──────────┘  └────────────┘  └──────────────────────┘ │
│                      │                                    │
├──────────────────────┼────────────────────────────────────┤
│               Supabase (Backend)                          │
│  ┌──────────┐  ┌─────┴──────┐  ┌──────────────────────┐ │
│  │ Auth     │  │ PostgreSQL  │  │  RLS Policies        │ │
│  │(Supabase)│  │ +RLS       │  │  (per-row security)   │ │
│  └──────────┘  └────────────┘  └──────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

## 2. Request flow

### Read (browse sets, view set detail, dashboard)

```
User → URL → Next.js → Server Component → supabase.auth.getUser()
    → supabase.from('sets').select() [RLS enforced]
    → render React Server Component → send HTML to client
```

### Mutate (create set, save quiz result)

```
User → form submit → Server Action → Zod validate
    → supabase.auth.getUser() [verify session]
    → supabase.from('sets').insert() [RLS enforced]
    → revalidatePath() / redirect()
    → response to client
```

### Interactive (flashcard flip, quiz answer)

```
User → click → Client Component → Zustand store update
    → re-render (no server round-trip)
    → [on session complete] → Server Action to save results
```

## 3. Data flow per feature

### Sets

```
BrowseSetsPage (RSC)
  → fetch sets (public + user's)
  → render SetCard[] (Client — liked state)

SetDetailPage (RSC)
  → fetch set + terms + author
  → render TermList + StudyModeSelector

SetEditorPage (Client — form)
  → React Hook Form + Zod
  → Server Action: createSet / updateSet
  → TanStack Query invalidate → redirect
```

### Study Sessions

```
FlashcardPage (Client)
  → Zustand store: { currentIndex, cards, flipped, starred }
  → flip: local state update
  → next/prev: local state update
  → session complete → Server Action: saveSession

LearnPage (Client)
  → Zustand store: { currentCard, queue (SM-2 sorted), score }
  → answer → SM-2 calculation → next card
  → session complete → Server Action: saveSession + updateReviews

QuizPage (Client)
  → Zustand store: { questions, answers, score, timer }
  → answer → next question
  → complete → Server Action: saveSession

SpellPage (Client)
  → Zustand store: { currentTerm, attempts, audio }
  → play audio → user types → check → next

MatchPage (Client)
  → Zustand store: { cards, matches, timer, moves }
  → drag → check match → complete
```

### Gamification (cross-cutting)

```
Every Server Action for study:
  → after saving session → call updateXP(userId, earnedXP)
  → checkBadges(userId) → if new badge, insert user_badges
  → updateDailyProgress(userId, date)

DashboardPage (RSC)
  → fetch user_xp + user_badges + daily_progress + streak
  → render StatsOverview + BadgeGrid + StreakCalendar
```

## 4. Supabase client usage

| Client | File | When to use |
|--------|------|-------------|
| `createClient()` | `lib/supabase/client.ts` | Browser-side (anon key only) |
| `createServerClient()` | `lib/supabase/server.ts` | RSC, Server Actions, API routes |
| `createAdminClient()` | `lib/supabase/admin.ts` | Admin-only server actions (service_role key) |

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )
}
```

## 5. Key patterns

### Optimistic update (TanStack Query)

```typescript
const { mutate } = useMutation({
  mutationFn: toggleLike,
  onMutate: async ({ setId }) => {
    await queryClient.cancelQueries({ queryKey: ['sets', setId] })
    const previous = queryClient.getQueryData(['sets', setId])
    queryClient.setQueryData(['sets', setId], (old) => ({
      ...old, liked: !old.liked, likes_count: old.liked ? old.likes_count - 1 : old.likes_count + 1
    }))
    return { previous }
  },
  onError: (err, vars, context) => {
    queryClient.setQueryData(['sets', vars.setId], context?.previous)
    toast.error('Failed to toggle like')
  },
})
```

### Role check (server-side)

```typescript
export async function requireRole(allowedRoles: ('user' | 'moderator' | 'admin')[]) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: role } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (!role || !allowedRoles.includes(role.role)) {
    throw new Error('Forbidden')
  }
  return { user, role: role.role }
}
```

## 6. Component dependency graph

```
Layout
├── Navbar (uses: useSupabase session, search command)
├── MobileBottomNav
└── {children}

SetDetailPage
├── SetInfo (uses: set data, like button → useMutation)
├── StudyModeSelector (uses: setId → links)
├── TermList
│   └── TermRow (uses: audio play, copy)
└── ActionButtons (uses: useMutation for clone/delete)

StudyPage (generic wrapper for all modes)
├── FlashcardPage (uses: useStudyStore)
├── QuizPage (uses: useQuizStore)
├── LearnPage (uses: useStudyStore + sm2)
├── MatchPage (uses: useMatchStore + useDraggable)
├── SpellPage (uses: useSpellStore + audio)
└── TestPage (uses: useTestStore)

DashboardPage
├── StatsOverview (uses: user_xp, daily_progress)
├── DailyGoalCard (uses: daily_progress, user_goals)
├── DueReviewsList (uses: reviews next_review_at)
└── StreakCalendar (uses: daily_progress, date range)

AdminPage
├── UserTable (uses: admin supabase client)
├── ReportList (uses: admin supabase client)
└── AdminSetTable (uses: admin supabase client)
```

## 7. Folder structure (key files)

```
src/app/
  (auth)/login/page.tsx                    → RSC → LoginForm (Client)
  (auth)/register/page.tsx                 → RSC → RegisterForm (Client)
  (main)/layout.tsx                        → RSC → Navbar + Sidebar
  (main)/dashboard/page.tsx                → RSC → DashboardPage
  (main)/sets/page.tsx                     → RSC → BrowseSetsPage
  (main)/sets/[id]/page.tsx                → RSC → SetDetailPage
  (main)/sets/[id]/edit/page.tsx           → RSC → SetEditorPage wrapper
  (main)/sets/[id]/flashcard/page.tsx      → RSC → FlashcardPage (Client)
  (main)/sets/[id]/learn/page.tsx          → RSC → LearnPage (Client)
  (main)/sets/[id]/quiz/page.tsx           → RSC → QuizPage (Client)
  (admin)/layout.tsx                       → RSC → RoleGuard(check: moderator+)
  (admin)/users/page.tsx                   → RSC → UserTable (Client)

src/components/
  ui/                                      → shadcn/ui (do NOT edit directly)
  layout/                                  → Navbar, MobileBottomNav, Sidebar
  sets/                                    → SetCard, SetForm, TermRow
  study/                                   → FlashCard, QuizQuestion, MatchBoard, SpellInput
  dashboard/                               → StatsCard, StreakCalendar, BadgeCard
  admin/                                   → UserTable, ReportList
  shared/                                  → RoleGuard, ErrorBoundary, LoadingSkeleton

src/hooks/
  use-sets.ts                              → TanStack Query hooks for sets
  use-quiz.ts                              → Zustand store for quiz
  use-study.ts                             → Zustand store for study session
  use-match.ts                             → Zustand store for match game
  use-spell.ts                             → Zustand store for spell mode

src/lib/
  supabase/client.ts                       → Browser supabase client
  supabase/server.ts                       → Server supabase client
  supabase/admin.ts                        → Admin supabase client (service_role)
  sm2.ts                                   → SM-2 algorithm
  validations.ts                           → All Zod schemas
  badges.ts                                → Badge definitions + check logic
  xp.ts                                    → XP calculation rules
```
