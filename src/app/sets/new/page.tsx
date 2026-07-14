import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SetEditor } from '@/components/sets/set-editor'

export default async function NewSetPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/sets/new')

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="text-heading-sm font-semibold text-ink">Tạo bộ thẻ mới</h1>
        <p className="text-mid-gray">Nhập từ vựng tiếng Nhật và nghĩa tiếng Việt</p>
      </div>
      <SetEditor />
    </div>
  )
}
