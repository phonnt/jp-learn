# Rules (Hard Constraints)

> These rules MUST be followed by ALL AI agents. Breaking a rule = security vulnerability or data loss.

---

## R1. Auth & Data Access

**R1.1** — NEVER trust `auth.uid()` from client. Every server action MUST verify the session server-side via `supabase.auth.getUser()`.

```typescript
// ✅ CORRECT
const { data: { user } } = await supabase.auth.getUser()
if (!user) return { error: 'Unauthorized' }

// ❌ WRONG — never trust client-provided user_id
const { data: { user } } = await supabase.auth.getUser()  // NOT from request body
```

**R1.2** — Row Level Security (RLS) là tuyến phòng thủ CUỐI CÙNG. Code phải tự kiểm tra quyền trước.

**R1.3** — Supabase Admin client (`service_role`) chỉ được dùng trong server-side admin actions. NEVER expose `service_role` key to client.

**R1.4** — Never log or expose `supabase.auth.getSession()` access tokens in console, logs, or error messages.

## R2. Input Validation

**R2.1** — ALL user input MUST be validated with Zod schema before processing.

```typescript
// ✅ CORRECT
const schema = z.object({ title: z.string().min(1).max(100) })
const parsed = schema.parse(formData)

// ❌ WRONG — directly inserting untrusted input
await supabase.from('sets').insert({ title: formData.get('title') })
```

**R2.2** — Zod schemas must be in `src/lib/validations.ts`, NOT duplicated across files.

**R2.3** — File upload: validate type + size server-side. Max 5MB per file.

## R3. Database

**R3.1** — NEVER use raw SQL string concatenation. Use Supabase JS client or parameterized queries.

**R3.2** — ALWAYS use `ON DELETE CASCADE` for child tables (terms → sets, folder_sets → folders).

**R3.3** — ALWAYS add RLS policies for EVERY table. No table should be publicly writable.

**R3.4** — Migrations must be reversible. Always include `DROP` / rollback in comments or separate migration.

## R4. Security

**R4.1** — NEVER commit secrets, API keys, or service_role keys. Use `.env.local` + `.env.example`.

**R4.2** — Supabase URL and anon key are public (safe to commit). Service role key is NOT.

**R4.3** — Rate limit auth endpoints: max 5 OTP requests per phone/email per minute (dùng Supabase built-in rate limits).

**R4.4** — CORS: API routes chỉ accept requests từ origin của app.

**R4.5** — CSP headers must be set in `next.config.ts`.

## R5. Architecture

**R5.1** — Server Component là default. Chỉ thêm `'use client'` khi thực sự cần (state, effects, event handlers).

**R5.2** — Server Actions for mutations. API routes only for external integrations / webhooks.

**R5.3** — TanStack Query mutations phải có `onError` handler hiển thị toast.

**R5.4** — KHÔNG fetch data trong Client Component nếu có thể fetch trong Server Component.

## R6. Performance

**R6.1** — Lazy load study modes (flashcard, quiz, match, spell) với `next/dynamic`.

**R6.2** — Images: use `next/image` với remote patterns configured.

**R6.3** — Debounce search input (300ms) before sending API request.

**R6.4** — Paginate set list (20 items/page) — NEVER fetch all sets at once.

## R7. Testing

**R7.1** — Every Zod schema must have a corresponding test file.

**R7.2** — RLS policies must be tested with `supabase.auth.signIn()` as different users.

**R7.3** — Study session logic (SM-2, scoring) must be unit tested.

## R8. Accessibility

**R8.1** — All interactive elements must have keyboard support (Enter/Space for buttons, Arrow keys for navigation).

**R8.2** — All images must have `alt` text.

**R8.3** — Form inputs must have associated `<label>`.

**R8.4** — Color is NEVER the only indicator for state (add icon or text).

## R9. AI Agent Workflow

**R9.1** — BEFORE editing any file: read the file first to understand context + existing patterns.

**R9.2** — AFTER editing: run `npm run build` (or relevant command) to verify no errors.

**R9.3** — NEVER delete code without understanding what it does. If unsure, add comment `// TODO: verify before cleanup` instead.

**R9.4** — When adding a new dependency: check if similar functionality already exists in the project first.

**R9.5** — When creating a file: follow `docs/CONVENTIONS.md` for naming and structure.

---

> Violating any of these rules should be treated as a bug/security issue.
