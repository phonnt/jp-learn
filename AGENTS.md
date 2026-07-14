# JP-Learn — Project Guide

## Quick context

Next.js 16 + Supabase app học tiếng Nhật kiểu Quizlet. User tạo bộ thẻ từ vựng, học flashcard, quiz, match, spell, spaced repetition.

## First read

- `docs/PLAN.md` — full feature plan, DB schema, routes, phases
- `docs/ARCHITECTURE.md` — data flow, component tree, supabase clients
- `docs/CONVENTIONS.md` — naming, imports, component patterns
- `docs/RULES.md` — hard constraints (READ BEFORE CODING)
- `docs/DESIGN.md` — UI tokens, colors, spacing, radii
- `docs/AI_AGENTS.md` — task workflow, checklist
- `docs/KNOWLEDGE.md` — session log (đọc trước khi làm task để biết tiền đề)

## Key commands

```bash
npm run dev      # dev server
npm run build    # build + type check
npm run lint     # eslint
npx shadcn@latest add <component>  # add shadcn/ui
```

## Stack

Next.js 16, TypeScript, Tailwind v4, shadcn/ui, Supabase (Auth + PostgreSQL), TanStack Query, Zustand, React Hook Form + Zod

## Code quick ref

- `@/` maps to `src/`
- Server component mặc định, `'use client'` only when needed
- ALL mutations → Server Action + Zod validate
- ALL data access → RLS enforced
- Zustand for session state (quiz, flashcard) only
- Never trust client `auth.uid()` — verify server-side
