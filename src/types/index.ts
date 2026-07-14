export type TSet = {
  id: string
  user_id: string
  title: string
  description: string | null
  lang_term: string
  lang_definition: string
  is_public: boolean
  created_at: string
  updated_at: string
}

export type TTerm = {
  id: string
  set_id: string
  term: string
  definition: string
  reading: string | null
  example_sentence: string | null
  image_url: string | null
  order: number
}

export type TUser = {
  id: string
  username: string | null
  avatar_url: string | null
  created_at: string
}

export type TUserRole = {
  user_id: string
  role: 'user' | 'moderator' | 'admin'
}

export type TSetCollaborator = {
  id: string
  set_id: string
  user_id: string
  permission: 'edit' | 'view'
}

export type TStudySession = {
  id: string
  user_id: string
  set_id: string
  started_at: string
  completed_at: string | null
  mode: 'flashcard' | 'quiz' | 'match' | 'learn' | 'spell'
}

export type TStudyResult = {
  id: string
  session_id: string
  term_id: string
  correct: boolean
  time_spent_ms: number | null
}

export type TReview = {
  id: string
  user_id: string
  term_id: string
  easiness_factor: number
  interval: number
  repetitions: number
  next_review_at: string
  last_reviewed_at: string | null
}
