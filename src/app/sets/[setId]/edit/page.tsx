import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { EditSetForm } from '@/components/sets/edit-set-form'

export const dynamic = 'force-dynamic'

export default async function EditSetPage({ params }: { params: Promise<{ setId: string }> }) {
  const { setId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: set } = await supabase
    .from('sets')
    .select('*')
    .eq('id', setId)
    .single()

  if (!set) notFound()
  if (set.user_id !== user.id) redirect(`/sets/${setId}`)

  const { data: terms } = await supabase
    .from('terms')
    .select('*')
    .eq('set_id', setId)
    .order('order', { ascending: true })

  return <EditSetForm set={set} terms={terms || []} />
}
