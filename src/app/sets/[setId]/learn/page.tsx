import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { LearnMode } from '@/components/study/learn-mode'
import { StudyHeader } from '@/components/shared/study-header'

export const dynamic = 'force-dynamic'

export default async function LearnPage({ params }: { params: Promise<{ setId: string }> }) {
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
      <StudyHeader setId={setId} setTitle={set.title} modeLabel="Học với spaced repetition" />
      <LearnMode setId={setId} title={set.title} />
    </div>
  )
}
