'use client'

import { Button } from '@/components/ui/button'
import { Share2, Check } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface ShareButtonProps {
  setId: string
}

export function ShareButton({ setId }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const url = `${window.location.origin}/sets/${setId}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    toast.success('Đã sao chép link')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleShare}>
      {copied ? <Check className="mr-1 h-4 w-4" /> : <Share2 className="mr-1 h-4 w-4" />}
      {copied ? 'Đã copy' : 'Chia sẻ'}
    </Button>
  )
}
