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
