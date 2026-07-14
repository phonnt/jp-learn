'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useSession } from '@/hooks/use-supabase'
import { signOut } from '@/actions/auth'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { LayoutDashboard, LogOut, Plus, User, Target, Award, Settings } from 'lucide-react'

export function Navbar() {
  const router = useRouter()
  const { session, loading } = useSession()
  const user = session?.user

  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-screen-xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-semibold tracking-tight text-ink">
            JP-Learn
          </Link>
          <nav className="hidden items-center gap-4 md:flex">
            <Link href="/sets" className="text-sm text-mid-gray transition-colors hover:text-ink">
              Khám phá
            </Link>
            {user && (
              <Link href="/sets/my" className="text-sm text-mid-gray transition-colors hover:text-ink">
                Bộ thẻ của tôi
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {loading ? null : user ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/sets/new">
                  <Plus className="mr-1 h-4 w-4" />
                  Tạo set
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-full outline-none">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-ink text-paper text-xs">
                      {user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48" align="end">
                  <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/goals')}>
                    <Target className="mr-2 h-4 w-4" />
                    Mục tiêu
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/badges')}>
                    <Award className="mr-2 h-4 w-4" />
                    Thành tích
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    Hồ sơ
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Cài đặt
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login">Đăng nhập</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/register">Đăng ký</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
