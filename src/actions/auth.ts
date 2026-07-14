'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { signInSchema, signUpSchema } from '@/lib/validations'

export async function signIn(formData: FormData) {
  const supabase = await createClient()

  const parsed = signInSchema.parse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  const { error } = await supabase.auth.signInWithPassword(parsed)
  if (error) return { error: error.message }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signUp(formData: FormData) {
  const supabase = await createClient()

  const parsed = signUpSchema.parse({
    email: formData.get('email'),
    password: formData.get('password'),
    username: formData.get('username'),
  })

  const { data: authData, error } = await supabase.auth.signUp({
    email: parsed.email,
    password: parsed.password,
  })
  if (error) return { error: error.message }

  if (authData.user) {
    const { error: profileError } = await supabase.from('users').insert({
      id: authData.user.id,
      username: parsed.username,
    })
    if (profileError) return { error: profileError.message }

    const { error: roleError } = await supabase.from('user_roles').insert({
      user_id: authData.user.id,
      role: 'user',
    })
    if (roleError) return { error: roleError.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/auth/login')
}

export async function signInWithGoogle() {
  const supabase = await createClient()
  const { data } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })
  if (data.url) redirect(data.url)
}

export async function signInWithGithub() {
  const supabase = await createClient()
  const { data } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })
  if (data.url) redirect(data.url)
}
