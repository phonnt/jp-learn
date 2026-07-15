# So sánh trang chi tiết bộ thẻ — Quizlet vs JP-Learn

> Mục tiêu: Đối chiếu từng thành phần trên trang `/sets/[setId]` của Quizlet với JP-Learn để xác định khoảng cách và lên kế hoạch bổ sung.

| # | Thành phần | Quizlet | JP-Learn | Trạng thái | Test pass |
|---|-----------|---------|----------|:----------:|:---------:|
| 1 | **Breadcrumb folder** — link đến folder chứa set (nếu có), hiển thị phía trên title | ✅ Có, dạng link `folder Bim_N4` | ✅ Có, dạng icon Folder + link | done | ❓ |
| 2 | **Set title** — heading h1 | ✅ `N4 - Từ vựng 1` | ✅ Có | done | ❓ |
| 3 | **Stats** — số người học hôm nay ("N studiers today") | ✅ Có | ✅ Có, query `study_sessions` today | done | ❓ |
| 4 | **Privacy badge** — Globe / Lock | ❌ (không hiển thị trên public set) | ✅ Có | done | ❓ |
| 5 | **Action buttons row** — Bookmark/Saved, Add to calendar, Share, More | ✅ Có (4 nút) | ✅ Có like + share + more dropdown — thiếu Saved (bookmark), Add to calendar | partial | ❓ |
| 6 | **More dropdown** — Edit, Export, Copy, Delete, etc. | ✅ Có Edit, Export, Copy, Delete, Add to study plan, Print, etc. | ✅ Có Edit (owner), Export CSV, Copy, Delete (owner) — thiếu Print, Add to study plan | partial | ❓ |
| 7 | **Study modes navigation** — Flashcards, Learn, Test, Blocks, Blast, Match | ✅ Dạng navigation list | ✅ Có buttons row — thiếu Blocks và Blast | partial | ❓ |
| 8 | **Flashcard carousel** (nội dung chính khi vào trang) | | | | |
| 8a | — Flashcard là default view | ✅ | ✅ | done | ✅ |
| 8b | — Progress "current / total" | ✅ `29 / 310` | ✅ Có | done | ✅ |
| 8c | — Progress bar | ✅ | ✅ Có | done | ✅ |
| 8d | — Hint (lightbulb) | ✅ | ✅ Có, hiển thị gợi ý (reading hoặc 3 ký tự đầu) | done | ❓ |
| 8e | — Sound (phát âm) trên flashcard | ✅ | ✅ Có, dùng Web Speech API (ja-JP) | done | ❓ |
| 8f | — Star trên flashcard | ✅ | ✅ Có, tích hợp `toggleTermStar` | done | ❓ |
| 8g | — Edit button trên flashcard | ✅ | ✅ Có, scroll xuống term list + mở inline edit | done | ❓ |
| 8h | — Play (auto-play) | ✅ Nút Play trong flashcard nav | ✅ Có Play button trong flashcard nav bar | done | ❓ |
| 8i | — Shuffle toggle | ✅ Bấm để shuffle / sort lại | ✅ Có nút Shuffle trong flashcard nav | done | ✅ |
| 8j | — Options (settings) | ✅ Cho phép cấu hình chế độ hiển thị | ✅ Có StudySettingsInline | done | ✅ |
| 8k | — Fullscreen | ✅ | ✅ Có, dùng Fullscreen API (Maximize2/Minimize2) | done | ❓ |
| 8l | — Track progress toggle | ✅ Switch "Track progress" | ✅ Có, gọi `startStudySession` / `completeStudySession` | done | ❓ |
| 8m | — Prev / Next arrows | ✅ | ✅ Có | done | ✅ |
| 8n | — Hover/click to flip card | ✅ | ✅ Có | done | ✅ |
| 9 | **Right sidebar** — "Set info" | | | | |
| 9a | — Creator avatar + username + created time | ✅ | ✅ Có avatar, username, và "X ngày trước" | done | ❓ |
| 9b | — Related sets | ❌ (có links tới created by user nhưng không có danh sách riêng) | ✅ Có "Bộ thẻ khác" | done | ❓ |
| 10 | **Terms list** — "Thuật ngữ trong bộ thẻ này (N)" | | | | |
| 10a | — Section heading | ✅ "Terms in this set (N)" | ✅ Có, toggle "Thuật ngữ trong bộ thẻ này (N)" | done | ❓ |
| 10b | — "Your stats" dropdown | ✅ Button hiển thị thống kê mastery | ✅ Có dropdown "Thống kê của bạn" (mastered/learning/not-studied) | done | ❓ |
| 10c | — Terms grouped by mastery | ✅ Ba group: Still learning (N), Mastered (N), Not studied (N) | ✅ Có filter buttons dạng chip (dựa vào `reviews.repetitions`) | done | ❓ |
| 10d | — "Select these N" button mỗi nhóm | ✅ | ✅ Có filter buttons dạng chip, lọc term list | done | ❓ |
| 10e | — Term rows: Star | ✅ | ✅ Có | done | ❓ |
| 10f | — Term rows: Audio | ✅ | ✅ Có, dùng speak() từ lib/tts | done | ❓ |
| 10g | — Term rows: Edit | ✅ | ✅ Có (inline edit click) | done | ❓ |
| 10h | — Term + definition hiển thị | ✅ Song song | ✅ Song song | done | ❓ |
| 10i | — Hàng kẻ xen kẽ | ✅ | ✅ Đã làm | done | ✅ |
| 11 | **Inline add term** (owner) | ✅ Có nút "Add card" | ✅ Có | done | ❓ |
| 12 | **Folder badges** | ✅ Hiển thị breadcrumb folder | ✅ Badges ở header | done | ❓ |
| 13 | **Comments** | ❌ (không có trên set page) | ✅ Có | done | ❓ |
| 14 | **Like / Rating** | ❌ (không có) | ✅ Có | done | ❓ |
| 15 | **Share** | ✅ Nút Share riêng | ✅ Có ShareButton | done | ❓ |

## Tổng quan

- **Đã hoàn thành (done)**: 32 mục
- **Làm một phần (partial)**: 3 mục (action buttons thiếu Saved/Calendar; more dropdown thiếu StudyPlan; study modes thiếu Blocks/Blast)
- **Chưa làm (pending)**: 0 mục

## Các mục còn lại cần cải thiện

### Partial — cần hoàn thiện
| # | Mục | Ghi chú |
|---|-----|---------|
| 5 | Action buttons | Thiếu Saved (bookmark), Add to calendar |
| 6 | More dropdown | Thiếu Add to study plan |
| 7 | Study modes | Thiếu Blocks, Blast (nếu cần) |
