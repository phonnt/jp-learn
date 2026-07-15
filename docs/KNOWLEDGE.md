# Session Log

> Ghi lại những thay đổi đã thực hiện để AI biết tiền đề khi xử lý task tiếp theo.

---

## 2026-07-14 — Khởi tạo project structure

- Chuyển từ pnpm → npm: xóa `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `node_modules/`, chạy `npm install`
- Tạo `PLAN.md` đầy đủ: features, DB schema (6 tables + 9 bảng mở rộng), routes, phases (4 phases, 36 features)
- Bổ sung tech stack: shadcn/ui, TanStack Query, Zustand, React Hook Form + Zod, Motion, @dnd-kit, Sonner, next-themes
- Tạo `docs/` files: CONVENTIONS.md (coding standards), RULES.md (9 hard rules), ARCHITECTURE.md (data flow, layers), AI_AGENTS.md (workflow, checklist)
- Tạo `AGENTS.md` ở root — entry point cho AI
- Thêm phân quyền user: 3 roles (user/moderator/admin), RLS policies, permission matrix
- Thêm toàn bộ đề xuất Quizlet-like vào PLAN.md: Spell mode, Auto-play, Folder, Hard words, Daily goals, XP/Badges, Favorites, Comments, Test generator
- Tạo `KNOWLEDGE.md` — session log

## 2026-07-14 — Phase 1: Core MVP Implementation

- Cài dependencies: shadcn/ui (button, input, card, label, dialog, dropdown-menu, select, avatar, skeleton, badge, separator, tooltip, sonner, progress, textarea, switch), @supabase/supabase-js, @supabase/ssr, @tanstack/react-query, zustand, react-hook-form, @hookform/resolvers, zod, sonner, next-themes, motion, @dnd-kit, lucide-react, cva, clsx, tailwind-merge, @radix-ui/react-slot
- Tạo folder structure: components/{ui,layout,sets,study,dashboard,admin,shared}, hooks/, lib/supabase/, types/, actions/
- Core infrastructure: Supabase clients (client/server/admin), middleware (auth + role check), Providers (TanStack Query + Theme + Tooltip + Toaster), Zod schemas, TypeScript types
- Auth: Login/Register forms (RHF + Zod), OAuth (Google/GitHub), callback handler, sign out
- User profile: Profile page, user_roles auto-create, role display
- CRUD Sets/Terms: server actions (create/update/delete/clone), TermEditor, SetEditor, EditSetForm
- Browse: public sets grid, My Sets page, SetCard component
- Flashcard: flip animation, keyboard shortcuts, shuffle, progress bar, Zustand store
- Quiz: multiple choice 4 options, scoring, result screen, Zustand store
- Role UI: RoleGuard, admin layout, admin dashboard
- Layout: Navbar (auth state, avatar dropdown), design tokens, homepage hero
- Placeholder pages for Learn mode + Match game (tránh 404 từ link set-detail)
- Build passes (TypeScript OK)

## 2026-07-14 — Phase 1 nốt + Phase 2: Học & Ôn tập

- Feature 4: Set collaborators UI — CollaboratorDialog (thêm/xoá/sửa quyền collaborator), server actions (getCollaborators, addCollaborator, removeCollaborator, updateCollaboratorPermission)
- SM-2 algorithm: `lib/sm2.ts` — SM-2 spacing calculation (easiness factor, interval, repetitions, nextReviewAt)
- Study session: `actions/study.ts` — startSession, completeSession, saveStudyResults (kèm XP + daily_progress update), saveReview (SM-2), getDueReviews
- Learn mode: `components/study/learn-mode.tsx` — spaced repetition học với gõ đáp án, tự chấm đúng/sai, lưu kết quả, hiển thị due reviews
- Dashboard cải tiến: streak count, daily progress, XP/level, due reviews list with links
- Import CSV: `actions/import-export.ts`, `components/sets/import-csv-dialog.tsx` — parse CSV, tạo set + terms từ file
- Search: browse sets page có search form với ilike filter
- Folders: `actions/folders.ts`, pages (list, create, detail), folder_sets CRUD
- Build passes (Phase 1 + Phase 2 core features)

## 2026-07-14 — Phase 3: Nâng cao

- Match game: `hooks/use-match.ts` (Zustand, timer, scoring, best score), `components/study/match-game.tsx` (click-to-match grid, animation), route `/sets/[id]/match`
- Spell mode: `hooks/use-spell.ts` (Web Speech API TTS, speed control), `components/study/spell-mode.tsx` (nghe + gõ, hint, feedback), route `/sets/[id]/spell`
- Test generator: `components/study/test-generator.tsx` (3 dạng: multiple-choice, written, true/false, trộn ngẫu nhiên, chấm điểm), route `/sets/[id]/test`
- Auto-play flashcard: `components/study/auto-play-flashcard.tsx` (slideshow auto, điều chỉnh tốc độ 2-10s, pause/play, shuffle), route `/sets/[id]/auto-play`
- Badges system: `lib/badges.ts` (12 badges definitions, check logic), `actions/badges.ts` (server-side checkAndAwardBadges), `components/dashboard/badges-page-client.tsx` (grid badges earned/locked), route `/badges`
- Tích hợp badge check vào `saveStudyResults` — tự động kiểm tra và award sau mỗi buổi học
- Thêm link Spell, Test, Auto-play, Match, Hard words, Badges vào set-detail + navbar
- ~89 file TypeScript, build pass

## 2026-07-14 — Phase 4: Xã hội & Hoàn thiện

- Favorites/Likes: `actions/favorites.ts`, `components/sets/like-button.tsx` (tim, count, toggle), tích hợp vào set-detail
- Comments: `actions/comments.ts`, `components/sets/comment-section.tsx` (view, add, delete), tích hợp vào set-detail
- Share button: `components/sets/share-button.tsx` (copy link ra clipboard)
- Reports & moderation: `actions/reports.ts`, admin reports page (duyệt/dismiss/xoá set)
- Admin users: `actions/admin.ts`, admin users page (bảng user, gán role)
- Settings: `/settings` page (dark mode toggle, profile link, logout)
- Dark mode: toggle trong settings page, `next-themes` đã setup từ đầu

## 2026-07-14 — Phase 4 hoàn thành (còn lại bottom nav, PWA, i18n)

- Mobile bottom nav: `components/layout/mobile-bottom-nav.tsx` (5 tabs: Dashboard, Khám phá, Tạo, Của tôi, Hồ sơ — chỉ hiện trên mobile, ẩn trên auth pages)
- PWA: `public/manifest.json`, `public/sw.js`, `public/icon-192.svg`, `public/icon-512.svg`, `components/shared/sw-register.tsx` (register service worker)
- i18n: `lib/i18n.ts` (vi/en dictionary + 60+ keys, setLocale/getLocale, persist to localStorage), locale switcher trong settings page
- 103 file TypeScript + 9 public files, build pass

## 2026-07-14 — Deploy lên Supabase + Vercel

- Tạo Supabase project `jp-learn` (region ap-southeast-1): https://lqegplpngdodkmxzrpdi.supabase.co
- Apply migrations: 18 tables (users, sets, terms, study_sessions, study_results, reviews, folders, folder_sets, favorites, comments, reports, set_collaborators, user_roles, user_goals, daily_progress, user_xp, badges, user_badges)
- Apply RLS policies cho tất cả tables, seed 12 badges, tạo function increment_daily_progress
- Thêm env vars lên Vercel (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
- Deploy thành công: https://jp-learn-phonnts-projects.vercel.app

## 2026-07-14 — Icon, Loading, UI fixes

- Icon mới: favicon.svg (huy hiệu "日" trên nền đen), icon-192.svg, icon-512.svg, cập nhật manifest.json, metadata layout icons
- Global loading: `src/app/loading.tsx` (skeleton grid 8 cards)
- Cập nhật CONVENTIONS.md section 7: Loading & Empty states rules
- Cập nhật AI_AGENTS.md edge cases: loading.tsx per route segment
- Fix high-priority UI issues:
  - Dark mode: thêm custom color tokens (.dark override cho canvas, paper, ink, hairline, mid-gray, ember)
  - `--font-sans` circular reference → sửa thành `var(--font-geist)`
  - Radius tokens: thay calc(...) bằng fixed values (6/10/14/18/24/32px), thêm named radii
  - `useSession()`: useState(() => createClient()) để cache supabase client, tránh effect loop
  - `RoleGuard`: same fix + useState lazy init
  - Xoá unused imports `Users`, `FolderPlus`, `Download` trong set-detail
  - Navbar icons: Mục tiêu (Target), Thành tích (Award), Cài đặt (Settings) — distinct icons
   - Xoá favicon.ico cũ (thay bằng favicon.svg)
- Align shadcn CSS vars với design tokens: `:root` dùng hex values từ DESIGN.md thay vì OKLCH
- Add design token rules vào CONVENTIONS.md section 5 (color classes, radius, typography, shadows)
- Add design check step vào AI_AGENTS.md checklist
- Build pass và `/// <reference types="@types/react-dom" />` vào next-env.d.ts, xoá import `.next/types/routes.d.ts`. Tạo `.vscode/settings.json` + `extensions.json`
- Build pass (tsc --noEmit + next build đều OK)

## 2026-07-14 — Phase 2 hoàn thành

- Hard words focus: `actions/hard-words.ts` (query study_results wrong terms + reviews low EF), `components/study/hard-words-mode.tsx` (learn mode chỉ dành cho thẻ khó), route `/sets/[setId]/hard-words`
- Export CSV: `components/sets/export-csv-button.tsx` — tải CSV từ action, button ở set-detail
- Daily goals: `actions/goals.ts` (get/set daily goal, weekly progress), `components/dashboard/goals-page.tsx` (UI mục tiêu + thanh tiến độ + calendar tuần), route `/goals`
- Thêm link Hard words + Export CSV vào set-detail, link Goals vào navbar dropdown
- Tổng số: 76 file TypeScript, build pass

## 2026-07-14 — Dub Design System migration

- Thay toàn bộ design tokens từ custom JP-Learn → Dub design system (editorial SaaS, border-first, monochrome + blue accent)
- globals.css: colors (canvas=#ffffff, paper=#f5f5f5, charcoal=#171717), typography (Inter body, Satoshi display), radius (tags=9999px, cards=12px, inputs=6px, buttons=8px), shadows (Dub's border-first philosophy), thêm Dub color tokens (electric-blue, deep-sapphire, soft-mint, vivid-green, tangerine, lavender)
- Card: bỏ shadow-subtle, chuyển sang border-first (#e5e5e5), dùng border-ash
- Button: dùng rounded-buttons (8px), primary CTA dùng rounded-tags (9999px) + bg-primary-action-fill
- Badge: radius 9999px từ rounded-badges → rounded-tags
- Navbar: Dub ghost style buttons (rounded-tags hover), primary CTA đăng ký pill-shaped
- Landing page: canva trắng (#ffffff), section alt dùng bg-paper-mist (#f5f5f5), heading weight 500 (medium), text charcoal
- Auth pages: fix min-h-screen scrollbar (h-full), bg-paper-mist cho section nền, aria-invalid trên inputs
- Browse sets + SetCard: tokens mới, body-lg/fog cho text
- Mobile bottom nav: tokens mới (border-ash, text-charcoal, text-fog)
- CONVENTIONS.md: section 5 update với Dub design tokens (colors, radii, typography)
- Deprecated tokens kept for backward compat (bg-canvas=#ffffff, text-ink=#171717, border-hairline=#e5e5e5, text-mid-gray=#737373)

## 2026-07-14 — Dub Design audit & Button/Icon alignment

- Button audit toàn diện: check tất cả buttons trên landing, auth, browse sets
- `--color-primary-action-fill: #000000` → `#2563eb` → `#000000` (fix sai màu xanh, revert về đen)
- Ghost variant: xoá `rounded-tags`, giờ dùng `rounded-buttons` (8px) — tất cả buttons đồng bộ 8px
- Thêm `cursor-pointer` vào button base class
- Nav "Đăng nhập": ghost → outline variant (white bg + #e5e5e5 border)
- DESIGN.md line 287: primary action button sửa 9999px → 8px, bỏ "compact pill padding"
- Icon sizing: `h-4 w-4` → `h-5 w-5` (16px → 20px) qua 40+ file, button base SVG default `size-4` → `size-5`
- Dọn sạch icon nhỏ residual: `h-3 w-3` → `h-5 w-5` ở flashcard, spell-mode, term-editor, set-card, hard-words-mode
- Xoá `--spacing-*` overrides sai (4–112px) — phá hỏng Tailwind v4 spacing scale (h-12 thành 12px thay vì 48px)
- Auth page whitespace: `h-full` → `min-h-[calc(100dvh-3.5rem)]` (fill viewport trừ navbar)

## 2026-07-15 — Set detail alignment with Quizlet

- Embedded Flashcard as default view in set-detail.tsx (always visible, term list collapsed by default)
- Redirected `/sets/[setId]/flashcard` → `/sets/[setId]`
- Created `docs/plans/set-detail-comparison.md` — 35-item table with Quizlet vs JP-Learn status + test pass column
- Implemented all 11 pending features: Sound (flashcard + term list), Hint, Star, Edit, Fullscreen, Breadcrumb folder, Studiers today stats, Track progress toggle, Term section heading, Mastery filter chips, Your stats dropdown, Audio per term row, keyboard shortcuts (←→ S H F)
- Added `onCreated` callback to `CreateFolderDialog` — sidebar updates immediately
- Added folder selector dropdown in `SetEditor` — passes `folderId` to `createSet`
- Added `folderId` param to `createSet` action
- Added "Tạo bộ thẻ" button on folder detail page → `/sets/new?folderId=...`
- Deleted `/folders/new` page — `/folders` page now uses modal
- Cleaned up temp files: `quizlet-home.txt`, `quizlet-set-page.md`
- Tested all study modes (Flashcards, Learn, Quiz, Test, Match, Spell) via Playwright — no errors
- Added Created time ("X ngày trước") in header + sidebar — uses `timeAgo()` helper
- Moved Auto-play button into flashcard bottom nav bar (Play icon)
- Added Print option to More dropdown
- Updated comparison file: 32 done, 3 partial (Saved/Calendar, StudyPlan, Blocks/Blast)
