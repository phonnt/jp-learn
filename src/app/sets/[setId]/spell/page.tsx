import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { SpellMode } from '@/components/study/spell-mode'

export const dynamic = 'force-dynamic'

export default async function SpellPage({ params }: { params: Promise<{ setId: string }> }) {
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

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="text-center">
        <h1 className="text-heading-sm font-semibold text-ink">{set.title}</h1>
        <p className="text-mid-gray">Nghe và gõ chính tả</p>
      </div>
      <SpellMode
        terms={(terms || []).map(t => ({ id: t.id, term: t.term, definition: t.definition, reading: t.reading }))}
      />
    </div>
  )
}
