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
- Theme tokens defined in `docs/DESIGN.md` — use Tailwind theme values only
- Prefer Tailwind utility classes, NOT custom CSS
- Custom CSS only for animations/keyframes

### shadcn/ui components

- `npx shadcn@latest add <component>` — thêm component
- KHÔNG sửa file trong `components/ui/` trực tiếp (trừ khi custom theme)
- Custom components go in `components/<feature>/`

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

## 7. Error handling

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

## 8. Git conventions

- Branch: `feat/<name>`, `fix/<name>`, `refactor/<name>`
- Commit: `<type>: <description>` (e.g., `feat: add spell mode`, `fix: flashcard flip animation`)
- Types: `feat`, `fix`, `refactor`, `style`, `docs`, `chore`
