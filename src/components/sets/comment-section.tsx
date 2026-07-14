'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getComments, addComment } from '@/actions/comments'
import { MessageSquare, Send } from 'lucide-react'
import { toast } from 'sonner'

interface Comment {
  id: string
  user_id: string
  content: string
  created_at: string
  users: { username: string | null; avatar_url: string | null }
}

interface CommentSectionProps {
  setId: string
}

export function CommentSection({ setId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getComments(setId).then(r => {
      if (r.data) setComments(r.data as Comment[])
    })
  }, [setId])

  async function handleSubmit() {
    if (!content.trim()) return
    setLoading(true)
    const result = await addComment(setId, content.trim())
    setLoading(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      setContent('')
      const r = await getComments(setId)
      if (r.data) setComments(r.data as Comment[])
      toast.success('Đã thêm bình luận')
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="flex items-center gap-2 text-sm font-medium text-ink">
        <MessageSquare className="h-4 w-4" />
        Bình luận ({comments.length})
      </h3>

      <div className="flex gap-2">
        <Input
          placeholder="Viết bình luận..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
        <Button size="icon" onClick={handleSubmit} disabled={loading}>
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {comments.length === 0 ? (
        <p className="py-4 text-center text-sm text-mid-gray">Chưa có bình luận nào.</p>
      ) : (
        <div className="space-y-3">
          {comments.map(c => (
            <div key={c.id} className="flex gap-3 rounded-lg border border-hairline p-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-ink text-paper text-xs">
                  {c.users?.username?.charAt(0).toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-ink">{c.users?.username || 'Unknown'}</span>
                  <span className="text-xs text-mid-gray">
                    {new Date(c.created_at).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <p className="mt-1 text-sm text-ink">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
