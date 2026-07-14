'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from '@/hooks/use-supabase'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Search, BookOpen, Plus, User } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, authRequired: true },
  { href: '/sets', label: 'Khám phá', icon: Search },
  { href: '/sets/new', label: 'Tạo', icon: Plus, authRequired: true },
  { href: '/sets/my', label: 'Của tôi', icon: BookOpen, authRequired: true },
  { href: '/profile', label: 'Hồ sơ', icon: User, authRequired: true },
]

export function MobileBottomNav() {
  const pathname = usePathname()
  const { session } = useSession()
  const user = session?.user

  const isAuthPage = pathname.startsWith('/auth')
  if (isAuthPage) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-hairline bg-paper md:hidden">
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => {
          if (item.authRequired && !user) return null
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 px-3 py-1 text-xs transition-colors',
                isActive ? 'text-ink' : 'text-mid-gray'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
