import { z } from 'zod'

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  username: z.string().min(2).max(30),
})

export const setSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  is_public: z.boolean().default(true),
})

export const termSchema = z.object({
  term: z.string().min(1).max(200),
  definition: z.string().min(1).max(500),
  reading: z.string().optional(),
  example_sentence: z.string().optional(),
})

export const updateProfileSchema = z.object({
  username: z.string().min(2).max(30).optional(),
  avatar_url: z.string().url().optional(),
})
