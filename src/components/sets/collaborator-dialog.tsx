'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { getCollaborators, addCollaborator, removeCollaborator, updateCollaboratorPermission } from '@/actions/collaborators'
import { UserPlus, Trash2, Users } from 'lucide-react'
import { toast } from 'sonner'

interface CollaboratorDialogProps {
  setId: string
  isOwner: boolean
}

interface Collaborator {
  id: string
  user_id: string
  permission: 'edit' | 'view'
  users: { username: string | null; avatar_url: string | null }
}

export function CollaboratorDialog({ setId, isOwner }: CollaboratorDialogProps) {
  const [open, setOpen] = useState(false)
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [email, setEmail] = useState('')
  const [permission, setPermission] = useState<'edit' | 'view'>('edit')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      loadCollaborators()
    }
  }, [open])

  async function loadCollaborators() {
    const result = await getCollaborators(setId)
    if (result.data) setCollaborators(result.data)
  }

  async function handleAdd() {
    if (!email.trim()) return
    setLoading(true)
    const result = await addCollaborator(setId, email.trim(), permission)
    setLoading(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Đã thêm collaborator')
      setEmail('')
      loadCollaborators()
    }
  }

  async function handleRemove(collaboratorId: string) {
    const result = await removeCollaborator(setId, collaboratorId)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Đã xoá collaborator')
      loadCollaborators()
    }
  }

  async function handlePermissionChange(collaboratorId: string, newPermission: 'edit' | 'view') {
    await updateCollaboratorPermission(setId, collaboratorId, newPermission)
    loadCollaborators()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="outline" size="sm" disabled={!isOwner} onClick={() => setOpen(true)}>
        <Users className="mr-1 h-5 w-5" />
        Cộng tác
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Quản lý cộng tác</DialogTitle>
          <DialogDescription>
            Thêm người dùng để cùng chỉnh sửa bộ thẻ này
          </DialogDescription>
        </DialogHeader>

        {isOwner && (
          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-1.5">
              <Label className="text-xs text-mid-gray" required>Tên người dùng</Label>
              <Input
                placeholder="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-mid-gray">Quyền</Label>
              <Select value={permission} onValueChange={(v) => v && setPermission(v as 'edit' | 'view')}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="edit">Sửa</SelectItem>
                  <SelectItem value="view">Xem</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAdd} disabled={loading}>
              <UserPlus className="h-5 w-5" />
            </Button>
          </div>
        )}

        <div className="space-y-2">
          {collaborators.length === 0 ? (
            <p className="py-4 text-center text-sm text-mid-gray">Chưa có cộng tác viên</p>
          ) : (
            collaborators.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-cards border border-ash p-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-ink text-paper text-xs">
                      {c.users?.username?.charAt(0).toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-ink">{c.users?.username || 'Unknown'}</p>
                    <Badge variant="secondary" className="text-xs">
                      {c.permission === 'edit' ? 'Có thể sửa' : 'Chỉ xem'}
                    </Badge>
                  </div>
                </div>
                {isOwner && (
                  <div className="flex items-center gap-2">
                    <Select
                      value={c.permission}
                      onValueChange={(v) => v && handlePermissionChange(c.id, v as 'edit' | 'view')}
                    >
                      <SelectTrigger className="h-8 w-20 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="edit">Sửa</SelectItem>
                        <SelectItem value="view">Xem</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleRemove(c.id)}>
                      <Trash2 className="h-5 w-5 text-ember" />
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
