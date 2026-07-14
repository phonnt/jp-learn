'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useSession } from '@/hooks/use-supabase'

export function GlobalLoadingOverlay() {
  const pathname = usePathname()
  const { loading: sessionLoading } = useSession()
  const [navLoading, setNavLoading] = useState(false)
  const prevPathname = useRef(pathname)

  useEffect(() => {
    if (pathname !== prevPathname.current) {
      prevPathname.current = pathname
      setNavLoading(true)
    }
  }, [pathname])

  useEffect(() => {
    if (!navLoading) return
    const timer = setTimeout(() => setNavLoading(false), 400)
    return () => clearTimeout(timer)
  }, [navLoading])

  if (!sessionLoading && !navLoading) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-canvas/60 backdrop-blur-sm">
      <Loader2 className="h-10 w-10 animate-spin text-ink" />
    </div>
  )
}
