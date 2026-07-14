export interface BadgeDef {
  key: string
  name: string
  description: string
  icon: string
  check: (stats: UserStats) => boolean
}

export interface UserStats {
  setCount: number
  totalTerms: number
  totalStudySessions: number
  streak: number
  correctRate: number
  termsLearned: number
  quizScore: number
}

export const BADGES: BadgeDef[] = [
  {
    key: 'first_set',
    name: 'Người khởi đầu',
    description: 'Tạo bộ thẻ đầu tiên',
    icon: '📚',
    check: (s) => s.setCount >= 1,
  },
  {
    key: 'five_sets',
    name: 'Nhà sưu tập',
    description: 'Tạo 5 bộ thẻ',
    icon: '📚',
    check: (s) => s.setCount >= 5,
  },
  {
    key: 'ten_sets',
    name: 'Thủ thư',
    description: 'Tạo 10 bộ thẻ',
    icon: '📚',
    check: (s) => s.setCount >= 10,
  },
  {
    key: 'study_3_days',
    name: 'Người tập trung',
    description: 'Học 3 ngày liên tiếp',
    icon: '🔥',
    check: (s) => s.streak >= 3,
  },
  {
    key: 'study_7_days',
    name: 'Người kiên trì',
    description: 'Học 7 ngày liên tiếp',
    icon: '🔥',
    check: (s) => s.streak >= 7,
  },
  {
    key: 'study_30_days',
    name: 'Bất bại',
    description: 'Học 30 ngày liên tiếp',
    icon: '🔥',
    check: (s) => s.streak >= 30,
  },
  {
    key: 'master_50_terms',
    name: 'Học viên',
    description: 'Học 50 thẻ từ vựng',
    icon: '📖',
    check: (s) => s.termsLearned >= 50,
  },
  {
    key: 'master_100_terms',
    name: 'Học giả',
    description: 'Học 100 thẻ từ vựng',
    icon: '📖',
    check: (s) => s.termsLearned >= 100,
  },
  {
    key: 'master_500_terms',
    name: 'Học sĩ',
    description: 'Học 500 thẻ từ vựng',
    icon: '📖',
    check: (s) => s.termsLearned >= 500,
  },
  {
    key: 'perfect_quiz',
    name: 'Hoàn hảo',
    description: 'Đạt 100% trong 1 bài quiz',
    icon: '⭐',
    check: (s) => s.quizScore === 100,
  },
  {
    key: 'ten_sessions',
    name: 'Chăm chỉ',
    description: 'Hoàn thành 10 buổi học',
    icon: '⏰',
    check: (s) => s.totalStudySessions >= 10,
  },
  {
    key: 'fifty_sessions',
    name: 'Miệt mài',
    description: 'Hoàn thành 50 buổi học',
    icon: '⏰',
    check: (s) => s.totalStudySessions >= 50,
  },
]

export function checkBadges(stats: UserStats, existingBadgeKeys: string[]): BadgeDef[] {
  return BADGES.filter(
    badge => !existingBadgeKeys.includes(badge.key) && badge.check(stats)
  )
}
