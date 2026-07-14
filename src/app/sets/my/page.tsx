import { createClient } from '@/lib/supabase/server'
import { SetCard } from '@/components/sets/set-card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { BookOpen, Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function MySetsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: sets } = await supabase
    .from('sets')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  return (
    <div className="mx-auto max-w-screen-xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-sm font-semibold text-ink">Bộ thẻ của tôi</h1>
          <p className="text-mid-gray">{sets?.length || 0} bộ thẻ</p>
        </div>
        <Button asChild>
          <Link href="/sets/new">
            <Plus className="mr-1 h-5 w-5" />
            Tạo set
          </Link>
        </Button>
      </div>

      {sets && sets.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sets.map((set) => (
            <SetCard key={set.id} set={set} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <BookOpen className="h-12 w-12 text-mid-gray" />
          <h3 className="mt-4 text-lg font-medium text-ink">Chưa có bộ thẻ nào</h3>
          <p className="mt-1 text-sm text-mid-gray">Tạo bộ thẻ đầu tiên của bạn!</p>
          <Button className="mt-4" asChild>
            <Link href="/sets/new">Tạo bộ thẻ</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
