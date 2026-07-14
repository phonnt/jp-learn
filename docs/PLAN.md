# JP-Learn - Web học tiếng Nhật (Quizlet-like)

## 1. Mục tiêu

Web app học tiếng Nhật với các chức năng tương tự Quizlet: người dùng tự tạo bộ thẻ từ vựng, học flashcard, kiểm tra, và ghi nhớ qua lặp lại ngắt quãng (Spaced Repetition).

---

## 2. Tech Stack

| Layer | Công nghệ |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + PostCSS |
| UI Library | shadcn/ui (Radix primitives + Lucide icons) |
| Forms | React Hook Form + Zod |
| Client State | Zustand |
| Server State | TanStack Query (React Query) |
| Animation | Motion (Framer Motion API) |
| Drag & Drop | @dnd-kit |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth (email/password + OAuth) |
| Toast | Sonner |
| Themes | next-themes |
| Deployment | Vercel |

---

## 3. Database Schema (Supabase PostgreSQL)

### Tables

#### `users`
- `id` uuid PK (sync từ Supabase Auth)
- `username` text
- `avatar_url` text
- `created_at` timestamptz

#### `sets`
- `id` uuid PK default uuid()
- `user_id` uuid FK → users.id
- `title` text
- `description` text
- `lang_term` text (mặc định 'ja')
- `lang_definition` text (mặc định 'vi')
- `is_public` boolean (mặc định true)
- `created_at` timestamptz
- `updated_at` timestamptz

#### `terms`
- `id` uuid PK default uuid()
- `set_id` uuid FK → sets.id ON DELETE CASCADE
- `term` text (từ vựng tiếng Nhật)
- `definition` text (nghĩa tiếng Việt)
- `reading` text (cách đọc furigana - optional)
- `example_sentence` text (ví dụ - optional)
- `image_url` text (optional)
- `order` integer (thứ tự trong set)

#### `study_sessions`
- `id` uuid PK default uuid()
- `user_id` uuid FK → users.id
- `set_id` uuid FK → sets.id
- `started_at` timestamptz
- `completed_at` timestamptz
- `mode` text ('flashcard' | 'quiz' | 'match' | 'learn')

#### `study_results`
- `id` uuid PK default uuid()
- `session_id` uuid FK → study_sessions.id
- `term_id` uuid FK → terms.id
- `correct` boolean
- `time_spent_ms` integer
- `created_at` timestamptz

#### `reviews` (Spaced Repetition)
- `id` uuid PK default uuid()
- `user_id` uuid FK → users.id
- `term_id` uuid FK → terms.id
- `easiness_factor` real (mặc định 2.5)
- `interval` integer (ngày, mặc định 0)
- `repetitions` integer (mặc định 0)
- `next_review_at` timestamptz
- `last_reviewed_at` timestamptz

#### `folders` (Bộ sưu tập)
- `id` uuid PK default uuid()
- `user_id` uuid FK → users.id
- `title` text
- `description` text
- `created_at` timestamptz
- `updated_at` timestamptz

#### `folder_sets`
- `id` uuid PK default uuid()
- `folder_id` uuid FK → folders.id ON DELETE CASCADE
- `set_id` uuid FK → sets.id ON DELETE CASCADE
- `order` integer
- `created_at` timestamptz
- UNIQUE(folder_id, set_id)

#### `favorites` (Likes)
- `id` uuid PK default uuid()
- `user_id` uuid FK → users.id
- `set_id` uuid FK → sets.id ON DELETE CASCADE
- `created_at` timestamptz
- UNIQUE(user_id, set_id)

#### `comments`
- `id` uuid PK default uuid()
- `user_id` uuid FK → users.id
- `set_id` uuid FK → sets.id ON DELETE CASCADE
- `content` text
- `created_at` timestamptz

#### `user_goals`
- `id` uuid PK default uuid()
- `user_id` uuid FK → users.id UNIQUE
- `daily_goal` integer (số thẻ mỗi ngày, mặc định 20)
- `reminder_time` time (giờ gửi notification)
- `reminder_enabled` boolean DEFAULT true
- `created_at` timestamptz

#### `daily_progress`
- `id` uuid PK default uuid()
- `user_id` uuid FK → users.id
- `date` date
- `terms_studied` integer DEFAULT 0
- `quiz_completed` integer DEFAULT 0
- `xp_earned` integer DEFAULT 0
- UNIQUE(user_id, date)

#### `user_xp`
- `user_id` uuid PK FK → users.id
- `xp` integer DEFAULT 0
- `level` integer DEFAULT 1

#### `badges`
- `id` uuid PK default uuid()
- `key` text UNIQUE (ví dụ: 'study_7_days', 'create_10_sets', 'master_100_terms')
- `name` text
- `description` text
- `icon` text
- `criteria` jsonb (điều kiện đạt badge)

#### `user_badges`
- `id` uuid PK default uuid()
- `user_id` uuid FK → users.id
- `badge_id` uuid FK → badges.id
- `achieved_at` timestamptz
- UNIQUE(user_id, badge_id)

### Indexes
- `sets.user_id` index
- `terms.set_id` index
- `study_sessions.user_id` + `set_id` index
- `reviews.user_id` + `next_review_at` index (query bài cần ôn)
- `folders.user_id` index
- `folder_sets.folder_id` + `set_id` index
- `favorites.user_id` + `set_id` index
- `comments.set_id` index
- `daily_progress.user_id` + `date` index
- `user_badges.user_id` index

### Row Level Security (RLS)
- Sets: user chỉ xoá/sửa set của mình, đọc được set public + set của mình
- Terms: cascade theo set
- Study sessions/results: chỉ user sở hữu
- Reviews: chỉ user sở hữu
- Folders: chỉ user sở hữu + collaborator trong set được thêm vào folder
- Favorites: insert/delete bởi user sở hữu, select public
- Comments: insert bởi user đã đăng nhập, select public
- Daily progress / user_xp / user_badges: chỉ user sở hữu

---

## 4. Tính năng chi tiết

### 4.1 Authentication
- [ ] Đăng ký / đăng nhập (email + password) qua Supabase Auth
- [ ] Đăng nhập bằng Google/GitHub (OAuth)
- [ ] Quên mật khẩu
- [ ] Profile page (username, avatar)

### 4.2 Set Management (Bộ thẻ)
- [ ] Tạo bộ thẻ mới (title, description)
- [ ] Thêm/sửa/xoá term (từ vựng, nghĩa, reading, ví dụ)
- [ ] Import từ file CSV/Excel
- [ ] Export ra CSV
- [ ] Chỉnh sửa thông tin set
- [ ] Xoá set
- [ ] Clone set (copy set public của người khác)
- [ ] Set public / private
- [ ] Folder / Collection: gom nhiều set theo chủ đề (JLPT N5, Từ vựng bài 1-10...)
- [ ] Favorites / Likes: thả tim set, set nổi bật theo lượt thích

### 4.3 Browse & Search
- [ ] Trang chủ: danh sách bộ thẻ public nổi bật
- [ ] Search theo title, term, creator
- [ ] Advanced filter: ngôn ngữ, ngày tạo, số lượng term, lượt thích
- [ ] Sort: mới nhất, phổ biến nhất, nhiều thẻ nhất
- [ ] My Sets (bộ thẻ của tôi)
- [ ] My Folders (bộ sưu tập của tôi)

### 4.4 Chế độ học

#### Flashcard
- [ ] Lật thẻ (click/tap để hiện definition)
- [ ] Swipe/touch hỗ trợ mobile
- [ ] Keyboard shortcuts (← → để chuyển thẻ)
- [ ] Shuffle thẻ
- [ ] Star/Bookmark thẻ để ôn riêng
- [ ] Auto-play: chạy slideshow tự động, tuỳ chỉnh tốc độ, lặp lại

#### Learn (Học)
- [ ] Học theo spaced repetition (SM-2 algorithm)
- [ ] Nhập câu trả lời (tự luận) hoặc chọn đáp án
- [ ] Hiển thị kết quả đúng/sai sau mỗi câu
- [ ] Progress bar
- [ ] Tiếp tục học từ chỗ dang dở
- [ ] Hard words focus: tự động gom thẻ hay sai → ôn tập riêng

#### Quiz (Kiểm tra)
- [ ] Multiple choice (4 đáp án)
- [ ] True/False
- [ ] Written (gõ nghĩa hoặc từ)
- [ ] Tuỳ chọn: số câu, chế độ (term→definition / definition→term)
- [ ] Kết quả sau khi hoàn thành (điểm, thời gian, câu sai)
- [ ] Test generator: kết hợp nhiều dạng câu hỏi trong 1 bài kiểm tra

#### Match (Ghép cặp)
- [ ] Kéo-thả ghép term với definition
- [ ] Timer, tính điểm theo thời gian
- [ ] Best score lưu lại

#### Spell (Chính tả)
- [ ] Nghe audio phát âm -> gõ lại từ tiếng Nhật
- [ ] Hiển thị gợi ý (số ký tự, chữ cái đầu) — optional
- [ ] Kết quả: highlight lỗi sai, so sánh đáp án
- [ ] Điều chỉnh tốc độ phát âm, lặp lại

### 4.5 Gamification
- [ ] Badges / huy hiệu: "Học 7 ngày liên tiếp", "Thuộc 100 thẻ", "Tạo 10 set", "Đạt 100% quiz"
- [ ] XP / điểm kinh nghiệm: kiếm điểm khi học, tạo set, hoàn thành quiz
- [ ] Level system: tăng cấp theo XP
- [ ] Bảng thành tích cá nhân

### 4.6 Dashboard / Thống kê
- [ ] Tổng số set, số thẻ đã học
- [ ] Streak học (ngày liên tiếp)
- [ ] Biểu đồ tiến độ (số thẻ ôn mỗi ngày / tuần / tháng)
- [ ] Danh sách bài cần ôn hôm nay (due reviews)
- [ ] Daily goals: đặt mục tiêu thẻ/ngày, theo dõi hoàn thành
- [ ] Thông báo / reminder: email hoặc push nhắc học

---

## 5. Route Design (Next.js App Router)

```
/                          → Landing / Trang chủ
/auth
  /login                   → Đăng nhập
  /register                → Đăng ký
/dashboard                 → Dashboard cá nhân

/sets
  /                        → Browse sets (public)
  /my                      → My sets
  /new                     → Tạo set mới
  /[setId]                 → Chi tiết set
  /[setId]/edit            → Chỉnh sửa set
  /[setId]/flashcard       → Học flashcard
  /[setId]/learn           → Học (spaced repetition)
  /[setId]/quiz            → Làm quiz
  /[setId]/match           → Game ghép cặp
  /[setId]/spell           → Spell (chính tả)
  /[setId]/test            → Test generator (mix nhiều dạng)

/folders
  /                        → My folders
  /new                     → Tạo folder mới
  /[folderId]              → Chi tiết folder (danh sách sets trong folder)

/profile                   → Trang cá nhân
/goals                     → Daily goals & thống kê
/badges                    → Thành tích / huy hiệu
/settings                  → Cài đặt tài khoản

/admin
  /                        → Admin dashboard
  /users                   → Quản lý user + gán role
  /reports                 → Duyệt reports
  /sets                    → Tất cả sets (moderator/admin)

/api
  /sets                    → CRUD sets
  /terms                   → CRUD terms
  /study                   → Log kết quả học
  /reviews                 → Spaced repetition data
  /auth/callback           → Supabase auth callback
```

---

## 6. Component Tree (sơ bộ)

```
Layout
├── Navbar (logo, search, auth status, avatar)
├── MobileBottomNav (trên mobile)
└── MainContent

Pages:
├── HomePage
│   ├── HeroSection
│   ├── FeaturedSets (sets public nổi bật, nhiều likes)
│   ├── RecentSets
│   └── DailyGoalCard (tiến độ hôm nay)
│
├── BrowseSetsPage
│   ├── SearchBar
│   ├── FilterChips (language, date, likes, term count)
│   ├── SortSelect (newest, popular, most terms)
│   └── SetCardGrid
│       └── SetCard (title, term count, author, avatar, like button)
│
├── SetDetailPage
│   ├── SetInfo (title, desc, author, stats, like button)
│   ├── StudyModeSelector (Flashcard | Learn | Quiz | Match | Spell | Test)
│   ├── TermList
│   │   └── TermRow (term, reading, definition, audio)
│   └── ActionButtons (edit, clone, share, export, add to folder)
│
├── FlashcardPage
│   ├── FlashCard (flip animation)
│   ├── ProgressBar
│   ├── Navigation (← →, shuffle, star)
│   └── CardCounter
│
├── LearnPage
│   ├── QuestionCard
│   │   ├── PromptDisplay
│   │   ├── AnswerInput (text input / choice buttons)
│   │   └── FeedbackOverlay (correct/wrong + explanation)
│   ├── ProgressIndicator
│   └── SessionComplete
│       ├── ScoreSummary
│       └── ReviewMistakes
│
├── QuizPage
│   ├── QuizQuestion
│   │   ├── QuestionDisplay
│   │   ├── OptionList (4 options / true-false / written)
│   │   └── Timer (optional)
│   ├── QuizProgressBar
│   └── QuizResult
│       ├── Score
│       ├── TimeTaken
│       ├── CorrectList
│       └── IncorrectList
│
├── MatchPage
│   ├── MatchGameBoard
│   │   ├── TermCards (draggable)
│   │   └── DefinitionCards (drop targets)
│   ├── Timer
│   ├── MoveCounter
│   └── MatchResult (score, time, best score)
│
├── SpellPage
│   ├── AudioPlayer (phát âm, điều chỉnh tốc độ)
│   ├── SpellingInput (gõ từ, hint)
│   ├── FeedbackOverlay (đúng/sai, highlight lỗi)
│   ├── ProgressBar
│   └── SpellResult (score, mistakes list)
│
├── TestPage
│   ├── TestConfig (số câu, mix dạng: MC, written, true/false, match)
│   ├── TestQuestion (dạng câu hỏi thay đổi theo config)
│   │   ├── MCQQuestion
│   │   ├── WrittenQuestion
│   │   ├── TrueFalseQuestion
│   │   └── MatchQuestion
│   ├── TestProgressBar
│   └── TestResult (điểm tổng, chi tiết từng dạng)
│
├── FolderPage
│   ├── FolderInfo (title, desc, set count)
│   ├── SetListInFolder (danh sách set, sắp xếp, xoá khỏi folder)
│   └── AddSetToFolderDialog
│
├── GoalsPage
│   ├── DailyGoalCard (mục tiêu hôm nay: X/Y thẻ)
│   ├── GoalForm (đặt mục tiêu mới)
│   ├── StreakCalendar
│   └── WeeklyStats (biểu đồ cột theo ngày)
│
├── BadgesPage
│   ├── BadgeGrid (tất cả huy hiệu)
│   │   └── BadgeCard (icon, tên, mô tả, đã đạt/chưa)
│   └── XPProgress (thanh XP, level hiện tại, XP cần cho level tiếp)
│
├── SetEditorPage
│   ├── SetMetadataForm (title, desc, lang, visibility)
│   ├── TermEditor
│   │   ├── TermRow (term, reading, definition, example)
│   │   └── AddTermButton
│   ├── ImportButton (CSV)
│   └── SaveButton
│
├── DashboardPage
│   ├── StatsOverview (sets count, terms learned, streak, total XP)
│   ├── DailyGoalCard (mục tiêu hôm nay)
│   ├── DueReviewsList (bài cần ôn hôm nay)
│   ├── RecentActivity
│   └── StreakCalendar
│
├── SettingsPage
│   ├── ProfileForm (username, avatar)
│   ├── NotificationPrefs (email/push reminders)
│   ├── ThemeToggle (dark mode)
│   └── DangerZone (xoá tài khoản)
│
└── AdminPage (role: moderator+)
    ├── AdminDashboard (total users, sets, reports pending, top sets)
    ├── UserTable (search user, gán role, suspend)
    ├── ReportList (duyệt/dismiss report, xoá set vi phạm)
    └── AdminSetTable (tất cả sets, bulk delete, feature)
```

---

## 7. Thứ tự ưu tiên phát triển

### Phase 1 - Core (MVP)

Mục tiêu: có app chạy được, người dùng tạo/học được cơ bản.

| # | Tính năng | Ghi chú |
|---|-----------|---------|
| 1 | Auth: email/password + OAuth (Google/GitHub) | Supabase Auth |
| 2 | User profile + User roles | `users` + `user_roles` |
| 3 | CRUD Sets + Terms | Set metadata + term list editor |
| 4 | Set collaborators | `set_collaborators` table |
| 5 | Browse sets public + My sets | Grid + SetCard |
| 6 | Flashcard mode | Lật thẻ, shuffle, keyboard nav |
| 7 | Quiz mode (multiple choice) | 4 đáp án, tính điểm |
| 8 | Role-based UI | RoleGuard component, admin layout sơ bộ |

### Phase 2 - Học & Ôn tập

Mục tiêu: thêm các chế độ học, theo dõi tiến độ, dashboard.

| # | Tính năng | Ghi chú |
|---|-----------|---------|
| 9 | Learn mode (spaced repetition SM-2) | Thuật toán SM-2 |
| 10 | Study session logging | Ghi lại kết quả từng phiên |
| 11 | Dashboard + Streak calendar | Thống kê cơ bản, chuỗi ngày học |
| 12 | Import/export CSV | Bulk add terms |
| 13 | Search + filter | Search theo title/term, filter |
| 14 | Clone set | Copy set public |
| 15 | Hard words focus | GOM thẻ hay sai → ôn riêng |
| 16 | Folder / Collection | `folders` + `folder_sets` |
| 17 | Daily goals | `user_goals` + `daily_progress` |

### Phase 3 - Trải nghiệm & Gamification

Mục tiêu: tăng tính tương tác, giữ chân người dùng.

| # | Tính năng | Ghi chú |
|---|-----------|---------|
| 18 | Spell mode (chính tả) | Nghe audio + gõ từ |
| 19 | Match game | Kéo-thả ghép cặp, timer, best score |
| 20 | Advanced quiz | Written, true/false, mix dạng |
| 21 | Test generator | Kết hợp nhiều dạng trong 1 bài |
| 22 | Audio phát âm (TTS) | Text-to-speech cho term/reading |
| 23 | Auto-play flashcard | Slideshow tự động |
| 24 | Gamification: XP + Level | `user_xp` table, tính XP cho mọi hành động |
| 25 | Gamification: Badges | `badges` + `user_badges`, 10+ huy hiệu |
| 26 | Streak notifications | Email/push reminder khi sắp mất streak |

### Phase 4 - Xã hội & Hoàn thiện

Mục tiêu: social features, chất lượng cao.

| # | Tính năng | Ghi chú |
|---|-----------|---------|
| 27 | Favorites / Likes | `favorites` table, sort by popular |
| 28 | Comments trên set public | `comments` table |
| 29 | Share set (link) | Share URL ra ngoài |
| 30 | Admin page đầy đủ | Quản lý users, reports, sets |
| 31 | Reports & moderation | `reports` table, moderator duyệt |
| 32 | Dark mode | next-themes + shadcn |
| 33 | Responsive mobile | Mobile-first, bottom nav |
| 34 | Settings page | Profile, notification prefs, xoá tài khoản |
| 35 | PWA (offline mode) | Service worker, cache sets đã học |
| 36 | i18n (UI tiếng Việt / tiếng Anh) | next-intl hoặc similar |

---

## 8. Phân quyền & Authorization

### 8.1 Hệ thống vai trò

3 cấp role, lưu trong bảng `user_roles`:

| Role | Mô tả |
|------|-------|
| `user` | Mặc định. Tạo/quản lý set của mình, học, clone set public |
| `moderator` | Xoá/sửa set vi phạm, quản lý reports, suspend user |
| `admin` | Full quyền. Gán role, xoá user, quản lý tất cả dữ liệu |

### 8.2 Bảng bổ sung

#### `user_roles`
- `user_id` uuid PK FK → users.id
- `role` text (mặc định 'user') CHECK (role IN ('user', 'moderator', 'admin'))
- `updated_at` timestamptz

#### `set_collaborators`
- `id` uuid PK default uuid()
- `set_id` uuid FK → sets.id ON DELETE CASCADE
- `user_id` uuid FK → users.id
- `permission` text CHECK (permission IN ('edit', 'view'))
- `created_at` timestamptz
- UNIQUE(set_id, user_id)

#### `reports` (báo cáo set vi phạm)
- `id` uuid PK default uuid()
- `set_id` uuid FK → sets.id
- `reported_by` uuid FK → users.id
- `reason` text
- `status` text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed'))
- `created_at` timestamptz

### 8.3 Permission Matrix

| Hành động | user (chủ set) | user (khác) | moderator | admin |
|-----------|:---:|:---:|:---:|:---:|
| Tạo set | ✅ | ✅ | ✅ | ✅ |
| Sửa set của mình | ✅ | ❌ | ❌ | ✅ |
| Xoá set của mình | ✅ | ❌ | ❌ | ✅ |
| Xoá bất kỳ set | ❌ | ❌ | ✅ | ✅ |
| Sửa bất kỳ set | ❌ | ❌ | ✅ | ✅ |
| Xem set public | ✅ | ✅ | ✅ | ✅ |
| Xem set private (chủ) | ✅ | ❌ | ❌ | ✅ |
| Clone set public | ✅ | ✅ | ✅ | ✅ |
| Thêm collaborator | ✅ (chủ) | ❌ | ❌ | ✅ |
| Học / quiz / match | ✅ | ✅ (public) | ✅ | ✅ |
| Xem dashboard người khác | ❌ | ❌ | ❌ | ✅ |
| Báo cáo set vi phạm | ✅ | ✅ | ✅ | ❌ |
| Xử lý report | ❌ | ❌ | ✅ | ✅ |
| Gán role moderator | ❌ | ❌ | ❌ | ✅ |
| Xoá user | ❌ | ❌ | ❌ | ✅ |

### 8.4 Row Level Security (RLS) — cập nhật

```sql
-- sets: chủ sở hữu + moderator + admin có thể xoá/sửa
CREATE POLICY "set_update" ON sets FOR UPDATE
  USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('moderator', 'admin'))
  );

-- sets: chỉ set public hoặc set của mình mới xem được
CREATE POLICY "set_select" ON sets FOR SELECT
  USING (
    is_public = true
    OR auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('moderator', 'admin'))
    OR EXISTS (SELECT 1 FROM set_collaborators WHERE set_id = sets.id AND user_id = auth.uid())
  );

-- set_collaborators: chủ set quản lý
CREATE POLICY "collaborator_insert" ON set_collaborators FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM sets WHERE id = set_id AND user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('moderator', 'admin'))
  );

-- reports: người dùng thường chỉ xem report của mình
CREATE POLICY "report_select" ON reports FOR SELECT
  USING (
    reported_by = auth.uid()
    OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('moderator', 'admin'))
  );
```

### 8.5 Route bổ sung

```
/admin
  /                        → Admin dashboard (users, reports, stats)
  /users                   → Danh sách user, quản lý role
  /reports                 → Danh sách report, duyệt/xoá
  /sets                    → Tất cả sets (moderator+admin)

/sets/[setId]/collaborators → Quản lý collaborator (chủ set)
```

### 8.6 Component bổ sung

```
├── admin/
│   ├── AdminLayout         → Layout trang admin (check role)
│   ├── UserTable           → Bảng user + gán role
│   ├── ReportList          → Danh sách report
│   │   └── ReportCard      → Mỗi report (reason, set, reported_by, actions)
│   └── AdminSetTable       → Tất cả sets + bulk actions
│
├── sets/
│   ├── CollaboratorDialog  → Modal thêm/xoá collaborator
│   └── PermissionBadge     → Hiển thị quyền trên set (owner/editor)
│
└── shared/
    └── RoleGuard           → Component wrap, check role trước khi render children
```

### 8.7 Triển khai

- **RoleGuard**: Higher-order component check role, redirect nếu không đủ quyền
- **Middleware** (`src/middleware.ts`): check role ở edge, redirect trang admin nếu không phải moderator/admin
- **Server-side check**: mỗi Server Action / API route kiểm tra `user_roles` trước khi xử lý
- **Client-side**: TanStack Query fetch `user_roles` sau khi login, cache trong Zustand
- **Seed script**: tạo tài khoản admin đầu tiên qua `supabase.auth.admin.createUser()`

---

## 9. Đề xuất bổ sung

### 9.1 State Management Pattern

```
Supabase DB
    ↕ (Server Components + Server Actions)
TanStack Query (cache + sync)
    ↕
Client Components
    ↕ (Zustand cho session state)
React Hook Form (form state)
```

- **Server Components**: fetch sets, terms, dashboard data — không bundle JS
- **TanStack Query**: cache dữ liệu, auto refetch, optimistic update khi CRUD
- **Zustand**: quản lý state trong phiên học (flashcard progress, quiz answers) — nhẹ, không cần boilerplate
- **React Hook Form + Zod**: validate form tạo/sửa set, term, auth — Zod schema tự sinh type

### 9.2 shadcn/ui components gợi ý

| Component | Dùng cho |
|-----------|----------|
| `Button` | Mọi nút |
| `Input` | Form nhập liệu |
| `Textarea` | Mô tả set, ví dụ term |
| `Card` | Set card, flashcard, kết quả |
| `Dialog` | Confirm xoá, modal thêm term nhanh |
| `Sheet` | Sidebar mobile, term editor |
| `DropdownMenu` | Avatar menu, action trên set |
| `Select` | Chọn ngôn ngữ, chế độ quiz |
| `Tabs` | Chuyển tab trong set detail |
| `Command` (cmdk) | Search sets/terms |
| `Progress` | Progress bar học |
| `Badge` | Tag public/private, level JLPT |
| `Avatar` | Avatar người dùng |
| `Toast` (Sonner) | Thông báo CRUD thành công/lỗi |
| `Skeleton` | Loading state |
| `Label` | Form label |
| `Separator` | Phân cách section |
| `Tooltip` | Hint cho icon button |

### 9.3 Tổ chức thư mục

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Auth layout group
│   ├── (dashboard)/        # Dashboard layout group
│   ├── sets/               # Set pages
│   └── api/                # API routes
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── layout/             # Navbar, Footer, Sidebar
│   ├── sets/               # SetCard, SetForm, TermRow...
│   ├── study/              # FlashCard, QuizQuestion, MatchBoard...
│   ├── dashboard/          # StatsCard, StreakCalendar...
│   └── shared/             # LoadingState, EmptyState, ErrorBoundary...
├── hooks/
│   ├── use-sets.ts         # TanStack Query hooks cho sets
│   ├── use-terms.ts        # TanStack Query hooks cho terms
│   ├── use-study.ts        # Zustand store cho study session
│   ├── use-quiz.ts         # Zustand store cho quiz
│   ├── use-supabase.ts     # Supabase client hook
│   └── use-keyboard.ts     # Keyboard shortcuts
├── lib/
│   ├── supabase/
│   │   ├── client.ts       # Supabase client
│   │   ├── server.ts       # Supabase server client
│   │   └── admin.ts        # Supabase admin (service_role)
│   ├── sm2.ts              # SM-2 algorithm
│   ├── utils.ts            # cn() helper, etc.
│   └── validations.ts      # Zod schemas
├── types/
│   └── index.ts            # TypeScript types / Zod inferred types
└── styles/
    └── globals.css         # Tailwind + shadcn theme
```

### 9.4 Validation schemas (Zod)

```typescript
const setSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  is_public: z.boolean().default(true),
})

const termSchema = z.object({
  term: z.string().min(1).max(200),
  definition: z.string().min(1).max(500),
  reading: z.string().optional(),
  example_sentence: z.string().optional(),
})

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  username: z.string().min(2).max(30),
})
```

### 9.5 Lợi ích của stack này

1. **shadcn/ui** — components copy vào project, tuỳ biến thoải mái, không dependency bloat
2. **TanStack Query** — tự động cache + refetch, optimistic update giúp CRUD sets/terms mượt
3. **Zustand** — viết ít code hơn Redux, đủ dùng cho study session state
4. **React Hook Form + Zod** — type-safe từ form → database, giảm bug
5. **Motion** — 3kB cho animation, đủ xử lý flip card, match game
6. **@dnd-kit** — accessible drag-and-drop, cần cho match game + reorder term

---

## 10. Spaced Repetition (SM-2 Algorithm)

Dựa trên thuật toán SM-2 của SuperMemo:

```
quality: 0-5 (0: sai hoàn toàn, 5: đúng hoàn hảo)

Nếu quality < 3:
  repetitions = 0
  interval = 1

Nếu quality >= 3:
  Nếu repetitions == 0: interval = 1
  Nếu repetitions == 1: interval = 6
  Nếu repetitions >= 2: interval = round(interval * easiness_factor)
  repetitions += 1

easiness_factor = max(1.3, easiness_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)))

next_review_at = now + interval days
```

---

## 11. Lưu ý kỹ thuật

- **Dùng Supabase Client (`@supabase/supabase-js`)** cho database + auth
- **RLS (Row Level Security)** bảo vệ dữ liệu ở cấp database
- **React Server Components** cho trang đọc (browse sets, set detail), Client Components cho trang tương tác (flashcard, quiz)
- **Optimistic updates** cho CRUD sets/terms
- **Local state** cho study session (không gọi DB mỗi lần chuyển thẻ)
- **Accessibility**: keyboard navigation, ARIA labels, focus management
- **Mobile-first responsive** với Tailwind breakpoints
