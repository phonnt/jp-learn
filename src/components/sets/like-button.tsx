'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toggleLike, getLikeCount, hasUserLiked } from '@/actions/favorites'
import { Heart } from 'lucide-react'
import { useEffect } from 'react'

interface LikeButtonProps {
  setId: string
}

export function LikeButton({ setId }: LikeButtonProps) {
  const [liked, setLiked] = useState(false)
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function init() {
      const { liked: l } = await hasUserLiked(setId)
      const { count: c } = await getLikeCount(setId)
      setLiked(l)
      setCount(c)
    }
    init()
  }, [setId])

  async function handleToggle() {
    setLoading(true)
    setLiked(!liked)
    setCount(liked ? count - 1 : count + 1)
    const result = await toggleLike(setId)
    if (result.error) {
      setLiked(liked)
      setCount(count)
    }
    setLoading(false)
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleToggle} disabled={loading}>
      <Heart className={`mr-1 h-4 w-4 ${liked ? 'fill-ember text-ember' : ''}`} />
      {count}
    </Button>
  )
}
