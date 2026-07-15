import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SetDetail } from '@/components/sets/set-detail'

export const dynamic = 'force-dynamic'

export default async function SetDetailPage({ params }: { params: Promise<{ setId: string }> }) {
  const { setId } = await params
  const supabase = await createClient()

  const { data: set } = await supabase
    .from('sets')
    .select('*')
    .eq('id', setId)
    .single()

  if (!set) notFound()

  const { data: terms } = await supabase
    .from('terms')
    .select('*')
    .eq('set_id', setId)
    .order('order', { ascending: true })

  const { data: { user } } = await supabase.auth.getUser()

  const isOwner = user?.id === set.user_id

  if (!set.is_public && !isOwner) notFound()

  const { data: creator } = await supabase
    .from('users')
    .select('username, avatar_url')
    .eq('id', set.user_id)
    .single()

  let starredTermIds: string[] = []
  if (user) {
    const { data: stars } = await supabase
      .from('term_stars')
      .select('term_id')
      .eq('user_id', user.id)
      .in('term_id', (terms || []).map(t => t.id))
    starredTermIds = stars?.map(s => s.term_id) || []
  }

  // Folders containing this set
  const { data: folderSets } = await supabase
    .from('folder_sets')
    .select('folder_id, folders!inner(id, title)')
    .eq('set_id', setId)

  const folders = folderSets?.map(fs => ({
    id: fs.folder_id,
    title: (fs.folders as unknown as { id: string; title: string }).title,
  })) || []

  // Related sets (same user, excluding current)
  const { data: relatedSets } = await supabase
    .from('sets')
    .select('id, title, created_at')
    .eq('user_id', set.user_id)
    .neq('id', setId)
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <SetDetail
      set={set}
      terms={terms || []}
      isOwner={isOwner}
      creator={creator ? { username: creator.username, avatar_url: creator.avatar_url } : undefined}
      starredTermIds={starredTermIds}
      folders={folders}
      relatedSets={relatedSets || []}
    />
  )
}
