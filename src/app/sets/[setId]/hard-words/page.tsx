import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { HardWordsMode } from '@/components/study/hard-words-mode'
import { StudyHeader } from '@/components/shared/study-header'

export const dynamic = 'force-dynamic'

export default async function HardWordsPage({ params }: { params: Promise<{ setId: string }> }) {
  const { setId } = await params
  const supabase = await createClient()

  const { data: set } = await supabase
    .from('sets')
    .select('*')
    .eq('id', setId)
    .single()

  if (!set) notFound()

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <StudyHeader setId={setId} setTitle={set.title} modeLabel="Thẻ khó" />
      <HardWordsMode setId={setId} title={set.title} />
    </div>
  )
}
