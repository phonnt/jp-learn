# Conventions

## 1. Naming

| Category | Convention | Example |
|----------|-----------|---------|
| Components | PascalCase | `SetCard`, `FlashCard`, `StudyModeSelector` |
| Files (component) | PascalCase | `SetCard.tsx`, `FlashCard.tsx` |
| Files (non-component) | kebab-case | `use-sets.ts`, `supabase-client.ts` |
| Functions/variables | camelCase | `getSets()`, `isPublic` |
| Types/interfaces | PascalCase prefix `T` | `TSet`, `TTerm`, `TUser` |
| Database tables | snake_case | `user_roles`, `set_collaborators` |
| Database columns | snake_case | `is_public`, `next_review_at` |
| Routes | kebab-case | `/flashcard`, `/my-sets` |
| Git branches | prefix/description | `feat/spell-mode`, `fix/auth-redirect` |

## 2. Imports order

```typescript
// 1. Framework & external libs
import { createClient } from '@supabase/supabase-js'
import { useQuery } from '@tanstack/react-query'
import { create } from 'zustand'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// 2. Components
import { Button } from '@/components/ui/button'
import { SetCard } from '@/components/sets/set-card'
import { RoleGuard } from '@/components/shared/role-guard'

// 3. Hooks
import { useSets } from '@/hooks/use-sets'
import { useSupabase } from '@/hooks/use-supabase'

// 4. Lib / utils
import { cn } from '@/lib/utils'
import { calculateNextReview } from '@/lib/sm2'
import { supabase } from '@/lib/supabase/client'

// 5. Types
import type { TSet, TTerm } from '@/types'
```

## 3. Component patterns

### Server Component (default)

```typescript
// app/sets/page.tsx - Server Component (mặc định)
export default async function SetsPage() {
  const supabase = createServerClient()
  const { data: sets } = await supabase.from('sets').select('*')
  
  return <SetList sets={sets} />
}
```

### Client Component (khi cần tương tác)

```typescript
'use client'

import { useState } from 'react'

// Chỉ dùng 'use client' khi cần: useState, useEffect, onClick, onSubmit
export function SetCard({ set }: { set: TSet }) {
  const [liked, setLiked] = useState(false)
  // ...
}
```

### Pattern: Container + Presentational

```
components/sets/
├── set-card.tsx          # Presentational (Client)
├── set-list.tsx          # Can be Server
├── set-editor.tsx        # Container (Client) — manages form state
└── set-actions.tsx       # Presentational (Client) — edit/clone/share buttons
```

## 4. File structure rules

- **1 component = 1 file** (export default)
- **1 hook = 1 file** (export named)
- **1 store = 1 file** (export named)
- Shared types in `src/types/index.ts` hoặc colocated gần component
- Zod schemas trong `src/lib/validations.ts`

## 5. Styling (Tailwind v4 + shadcn/ui)

- Dùng `cn()` từ `@/lib/utils` cho conditional classes
- **PHẢI** dùng design tokens từ `docs/DESIGN.md` — không dùng inline colors, không dùng shadcn vars trực tiếp

### 5.1 Design Tokens — Color Classes

| Token | Class | Dùng cho |
|-------|-------|----------|
| `#f5f5f5` | `bg-canvas` | Page background |
| `#ffffff` | `bg-paper` | Card surfaces, popovers |
| `#fafafa` | `bg-surface-alt` | Sidebar, subtle variant |
| `#0a0a0a` | `text-ink`, `bg-ink` | Primary text, filled buttons |
| `#171717` | `text-ink-soft`, `bg-ink-soft` | Filled button bg, secondary text |
| `#737373` | `text-mid-gray` | Muted text, placeholder, labels |
| `#e5e5e5` | `border-hairline` | Borders, card edges, inputs |
| `#e7000b` | `text-ember` | Destructive/error only |

```typescript
// ✅ Đúng — dùng design tokens
<div className="bg-canvas text-ink border-hairline" />
<Button className="bg-ink text-paper" />

// ❌ Sai — dùng màu cứng hoặc shadcn vars
<div className="bg-[#f5f5f5] text-[#0a0a0a]" />
<div className="bg-background text-foreground" />
```

### 5.2 Design Tokens — Border Radius

| Token | Value | Class | Dùng cho |
|-------|-------|-------|----------|
| `--radius-small` | 6px | `rounded-sm` | Small elements |
| `--radius-nested` | 10px | `rounded-md` | Nested cards |
| `--radius-buttons` | 18px | `rounded-xl` | Buttons, inputs, badges |
| `--radius-cards` | 24px | `rounded-2xl` | Card containers |

```typescript
// ✅ Đúng
<Card className="rounded-2xl" />  // cards = 24px
<Button className="rounded-xl" /> // buttons = 18px
<Input className="rounded-xl" />  // inputs = 18px

// ❌ Không nhất quán
<Card className="rounded-lg" />
<Button className="rounded-2xl" />
```

### 5.3 Shadows

```typescript
// ✅ Card shadow
<Card className="shadow-subtle" />
```

### 5.4 Typography Scale

| Token | Class | Size/Weight |
|-------|-------|-------------|
| `--text-caption` | `text-caption` | 12px |
| `--text-body` | `text-body` | 14px/400 |
| `--text-heading-sm` | `text-heading-sm` | 24px/600 |
| `--text-heading` | `text-heading` | 30px/600 |
| `--text-display` | `text-display` | 48px/600 |

### 5.5 shadcn/ui components

- `npx shadcn@latest add <component>` — thêm component
- KHÔNG sửa file trong `components/ui/` trực tiếp (trừ khi custom theme)
- Custom components go in `components/<feature>/`
- shadcn built-in variables (`bg-background`, `text-foreground`, `border-border`) đã được map sang design tokens trong `:root` — **không dùng trực tiếp trong app code**

## 6. State management hierarchy

```
Server Component (fetch once)
    ↕ pass data as props
TanStack Query (cache, refetch, optimistic update)
    ↕
Client Component UI
    ↕
Zustand (transient session state: quiz, flashcard progress)
    ↕
React Hook Form (form state: set editor, auth)
```

- **Server Components** dùng cho page, data fetching tĩnh
- **TanStack Query** cho data cần refetch / mutate
- **Zustand** chỉ cho state tồn tại trong phiên (không persist)
- **React Hook Form** cho tất cả form

## 7. Loading & Empty states

- Mỗi route segment có **`loading.tsx`** — dùng `<Skeleton>` grid cho list pages
- Global loading: `src/app/loading.tsx` — Skeleton mặc định cho toàn app
- **Empty state**: Luôn hiển thị message + CTA khi không có dữ liệu
- **Error state**: `error.tsx` với nút "Thử lại" cho mỗi route segment

```typescript
// app/sets/loading.tsx — skeleton grid example
export default function Loading() {
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {Array.from({ length: 8 }).map((_, i) => (
      <Skeleton key={i} className="h-32 rounded-3xl" />
    ))}
  </div>
}
```

## 8. Error handling

```typescript
// Server Actions / API routes: trả về structured response
function createSet(formData: FormData): Promise<{ data?: TSet; error?: string }>

// Client Components: dùng try/catch + toast
const { mutateAsync } = useMutation({
  mutationFn: createSet,
  onError: (err) => toast.error(err.message),
  onSuccess: () => toast.success('Set created'),
})

// Server Components: error.tsx + not-found.tsx
```

## 9. Git conventions

- Branch: `feat/<name>`, `fix/<name>`, `refactor/<name>`
- Commit: `<type>: <description>` (e.g., `feat: add spell mode`, `fix: flashcard flip animation`)
- Types: `feat`, `fix`, `refactor`, `style`, `docs`, `chore`
