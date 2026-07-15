'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

export async function createFolder(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const title = formData.get('title') as string
  if (!title?.trim()) return { error: 'Title is required' }

  const { data: folder, error } = await supabase
    .from('folders')
    .insert({ user_id: user.id, title: title.trim(), description: formData.get('description') as string || null })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/folders')
  redirect(`/folders/${folder.id}`)
}

export async function createFolderQuick(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const title = formData.get('title') as string
  if (!title?.trim()) return { error: 'Title is required' }

  const { data: folder, error } = await supabase
    .from('folders')
    .insert({ user_id: user.id, title: title.trim() })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/folders')
  revalidatePath('/')
  return { id: folder.id }
}

export async function deleteFolder(folderId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: folder } = await supabase
    .from('folders')
    .select('user_id')
    .eq('id', folderId)
    .single()

  if (!folder || folder.user_id !== user.id) return { error: 'Forbidden' }

  await supabase.from('folders').delete().eq('id', folderId)
  revalidatePath('/folders')
  redirect('/folders')
}

export async function addSetToFolder(folderId: string, setId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: folder } = await supabase
    .from('folders')
    .select('user_id')
    .eq('id', folderId)
    .single()

  if (!folder || folder.user_id !== user.id) return { error: 'Forbidden' }

  const { error } = await supabase
    .from('folder_sets')
    .insert({ folder_id: folderId, set_id: setId })

  if (error) return { error: error.message }

  revalidatePath(`/folders/${folderId}`)
  return { success: true }
}

export async function removeSetFromFolder(folderId: string, setId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  await supabase
    .from('folder_sets')
    .delete()
    .eq('folder_id', folderId)
    .eq('set_id', setId)

  revalidatePath(`/folders/${folderId}`)
  return { success: true }
}
