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

## 2026-07-14 — Phase 2 hoàn thành

- Hard words focus: `actions/hard-words.ts` (query study_results wrong terms + reviews low EF), `components/study/hard-words-mode.tsx` (learn mode chỉ dành cho thẻ khó), route `/sets/[setId]/hard-words`
- Export CSV: `components/sets/export-csv-button.tsx` — tải CSV từ action, button ở set-detail
- Daily goals: `actions/goals.ts` (get/set daily goal, weekly progress), `components/dashboard/goals-page.tsx` (UI mục tiêu + thanh tiến độ + calendar tuần), route `/goals`
- Thêm link Hard words + Export CSV vào set-detail, link Goals vào navbar dropdown
- Tổng số: 76 file TypeScript, build pass
