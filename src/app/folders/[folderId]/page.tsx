import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { SetCard } from '@/components/sets/set-card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function FolderDetailPage({ params }: { params: Promise<{ folderId: string }> }) {
  const { folderId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: folder } = await supabase
    .from('folders')
    .select('*')
    .eq('id', folderId)
    .single()

  if (!folder || folder.user_id !== user.id) notFound()

  const { data: folderSets } = await supabase
    .from('folder_sets')
    .select('set_id')
    .eq('folder_id', folderId)

  let sets: any[] = []
  if (folderSets && folderSets.length > 0) {
    const { data: s } = await supabase
      .from('sets')
      .select('*')
      .in('id', folderSets.map(fs => fs.set_id))
    sets = s || []
  }

  return (
    <div className="mx-auto max-w-screen-xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-sm font-semibold text-ink">{folder.title}</h1>
          {folder.description && <p className="text-mid-gray">{folder.description}</p>}
          <p className="text-sm text-mid-gray">{sets.length} bộ thẻ</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/folders">Quay lại</Link>
        </Button>
      </div>

      {sets.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sets.map(set => (
            <SetCard key={set.id} set={set} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-mid-gray">Folder chưa có bộ thẻ nào. Thêm từ trang chi tiết bộ thẻ.</p>
        </div>
      )}
    </div>
  )
}
