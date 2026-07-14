import { createClient } from '@/lib/supabase/server'
import { SetCard } from '@/components/sets/set-card'
import { Input } from '@/components/ui/input'
import { BookOpen, Search } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function BrowseSetsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('sets')
    .select('*')
    .eq('is_public', true)

  if (q?.trim()) {
    query = query.or(`title.ilike.%${q.trim()}%,description.ilike.%${q.trim()}%`)
  }

  const { data: sets } = await query
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="mx-auto max-w-screen-xl space-y-6 p-6">
      <div>
        <h1 className="text-heading-sm font-medium text-charcoal">Khám phá</h1>
        <p className="text-fog text-body">Các bộ thẻ công khai từ cộng đồng</p>
      </div>

      <form className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-fog" />
        <Input
          name="q"
          placeholder="Tìm kiếm bộ thẻ..."
          className="pl-9"
          defaultValue={q || ''}
        />
      </form>

      {sets && sets.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sets.map((set) => (
            <SetCard key={set.id} set={set} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BookOpen className="h-12 w-12 text-fog" />
          <h3 className="mt-4 text-subheading font-medium text-charcoal">
            {q ? 'Không tìm thấy kết quả' : 'Chưa có bộ thẻ nào'}
          </h3>
          <p className="mt-1 text-body text-fog">
            {q ? 'Thử tìm kiếm với từ khoá khác' : 'Hãy là người đầu tiên tạo bộ thẻ!'}
          </p>
        </div>
      )}
    </div>
  )
}
