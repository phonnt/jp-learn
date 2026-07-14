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

  return <SetDetail set={set} terms={terms || []} isOwner={isOwner} />
}
