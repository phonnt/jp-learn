import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { HardWordsMode } from '@/components/study/hard-words-mode'

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
      <div className="text-center">
        <h1 className="text-heading-sm font-semibold text-ink">{set.title}</h1>
        <p className="text-mid-gray">Ôn tập thẻ hay sai</p>
      </div>
      <HardWordsMode setId={setId} title={set.title} />
    </div>
  )
}
