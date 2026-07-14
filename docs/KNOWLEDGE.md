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

## 2026-07-14 — Phase 2 hoàn thành

- Hard words focus: `actions/hard-words.ts` (query study_results wrong terms + reviews low EF), `components/study/hard-words-mode.tsx` (learn mode chỉ dành cho thẻ khó), route `/sets/[setId]/hard-words`
- Export CSV: `components/sets/export-csv-button.tsx` — tải CSV từ action, button ở set-detail
- Daily goals: `actions/goals.ts` (get/set daily goal, weekly progress), `components/dashboard/goals-page.tsx` (UI mục tiêu + thanh tiến độ + calendar tuần), route `/goals`
- Thêm link Hard words + Export CSV vào set-detail, link Goals vào navbar dropdown
- Tổng số: 76 file TypeScript, build pass
