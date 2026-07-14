import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FolderPlus, FolderOpen } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function FoldersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: folders } = await supabase
    .from('folders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="mx-auto max-w-screen-xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-sm font-semibold text-ink">Bộ sưu tập</h1>
          <p className="text-mid-gray">{folders?.length || 0} folder</p>
        </div>
        <Button asChild>
          <Link href="/folders/new">
            <FolderPlus className="mr-1 h-5 w-5" />
            Tạo folder
          </Link>
        </Button>
      </div>

      {folders && folders.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {folders.map(folder => (
            <Link key={folder.id} href={`/folders/${folder.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-4">
                  <FolderOpen className="h-8 w-8 text-mid-gray" />
                  <div>
                    <h3 className="font-medium text-ink">{folder.title}</h3>
                    {folder.description && (
                      <p className="text-sm text-mid-gray">{folder.description}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FolderOpen className="h-12 w-12 text-mid-gray" />
          <h3 className="mt-4 text-lg font-medium text-ink">Chưa có folder nào</h3>
          <p className="mt-1 text-sm text-mid-gray">Sắp xếp bộ thẻ vào folder để dễ quản lý.</p>
        </div>
      )}
    </div>
  )
}
