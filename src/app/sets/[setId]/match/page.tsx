import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function MatchPage({ params }: { params: Promise<{ setId: string }> }) {
  const { setId } = await params
  const supabase = await createClient()

  const { data: set } = await supabase.from('sets').select('*').eq('id', setId).single()
  if (!set) notFound()

  return (
    <div className="mx-auto max-w-lg space-y-6 p-6 text-center">
      <h1 className="text-heading-sm font-semibold text-ink">{set.title}</h1>
      <p className="text-mid-gray">Game ghép cặp</p>
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-8">
          <p className="text-mid-gray">Tính năng đang phát triển cho Phase 3</p>
          <Button variant="outline" asChild>
            <Link href={`/sets/${setId}`}>
              <ArrowLeft className="mr-1 h-4 w-4" />
              Quay lại
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
