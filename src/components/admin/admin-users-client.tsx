'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { setUserRole } from '@/actions/admin'
import { toast } from 'sonner'

interface AdminUsersClientProps {
  users: Array<{
    id: string
    username: string | null
    created_at: string
    user_roles: Array<{ role: string }>
  }>
}

export function AdminUsersClient({ users }: AdminUsersClientProps) {
  async function handleRoleChange(userId: string, role: string) {
    const result = await setUserRole(userId, role as 'user' | 'moderator' | 'admin')
    if (result.error) toast.error(result.error)
    else toast.success('Đã cập nhật role')
  }

  return (
    <div className="space-y-4">
      <h1 className="text-heading-sm font-semibold text-ink">Quản lý người dùng</h1>
      <div className="rounded-cards border border-ash bg-paper-mist">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-hairline text-left text-mid-gray">
              <th className="p-4 font-medium">Tên</th>
              <th className="p-4 font-medium">ID</th>
              <th className="p-4 font-medium">Vai trò</th>
              <th className="p-4 font-medium">Ngày tham gia</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-hairline last:border-0">
                <td className="p-4 text-ink">{u.username || '—'}</td>
                <td className="p-4 font-mono text-xs text-mid-gray">{u.id.slice(0, 8)}...</td>
                <td className="p-4">
                  <Select
                    value={u.user_roles?.[0]?.role || 'user'}
                    onValueChange={(v) => v && handleRoleChange(u.id, v)}
                  >
                    <SelectTrigger className="h-8 w-28 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="moderator">Moderator</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-4 text-mid-gray">
                  {new Date(u.created_at).toLocaleDateString('vi-VN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
