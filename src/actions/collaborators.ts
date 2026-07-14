'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

export async function getCollaborators(setId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Check access
  const { data: set } = await supabase
    .from('sets')
    .select('user_id')
    .eq('id', setId)
    .single()

  if (!set) return { error: 'Set not found' }
  if (set.user_id !== user.id) return { error: 'Forbidden' }

  const { data } = await supabase
    .from('set_collaborators')
    .select('*, users!inner(username, avatar_url)')
    .eq('set_id', setId)

  return { data }
}

export async function addCollaborator(setId: string, email: string, permission: 'edit' | 'view') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: set } = await supabase
    .from('sets')
    .select('user_id')
    .eq('id', setId)
    .single()

  if (!set || set.user_id !== user.id) return { error: 'Forbidden' }

  // Find user by email
  const { data: targetUser } = await supabase
    .from('users')
    .select('id')
    .eq('username', email)
    .single()

  if (!targetUser) return { error: 'User not found' }
  if (targetUser.id === user.id) return { error: 'Cannot add yourself' }

  // Check if already a collaborator
  const { data: existing } = await supabase
    .from('set_collaborators')
    .select('id')
    .eq('set_id', setId)
    .eq('user_id', targetUser.id)
    .single()

  if (existing) return { error: 'User is already a collaborator' }

  const { error } = await supabase
    .from('set_collaborators')
    .insert({ set_id: setId, user_id: targetUser.id, permission })

  if (error) return { error: error.message }

  revalidatePath(`/sets/${setId}`)
  return { success: true }
}

export async function removeCollaborator(setId: string, collaboratorId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: set } = await supabase
    .from('sets')
    .select('user_id')
    .eq('id', setId)
    .single()

  if (!set || set.user_id !== user.id) return { error: 'Forbidden' }

  const { error } = await supabase
    .from('set_collaborators')
    .delete()
    .eq('id', collaboratorId)
    .eq('set_id', setId)

  if (error) return { error: error.message }

  revalidatePath(`/sets/${setId}`)
  return { success: true }
}

export async function updateCollaboratorPermission(
  setId: string,
  collaboratorId: string,
  permission: 'edit' | 'view'
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: set } = await supabase
    .from('sets')
    .select('user_id')
    .eq('id', setId)
    .single()

  if (!set || set.user_id !== user.id) return { error: 'Forbidden' }

  const { error } = await supabase
    .from('set_collaborators')
    .update({ permission })
    .eq('id', collaboratorId)
    .eq('set_id', setId)

  if (error) return { error: error.message }

  revalidatePath(`/sets/${setId}`)
  return { success: true }
}
