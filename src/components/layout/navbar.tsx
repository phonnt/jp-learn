'use client'

import { useState } from 'react'
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
import { LayoutDashboard, LogOut, Plus, User, Target, Award, Settings, List, Folder } from 'lucide-react'
import { SidebarToggle } from '@/components/layout/left-sidebar'
import { CreateFolderDialog } from '@/components/folders/create-folder-dialog'

export function Navbar() {
  const router = useRouter()
  const { session, loading } = useSession()
  const user = session?.user
  const [folderDialogOpen, setFolderDialogOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-ash bg-canvas-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-screen-xl items-center justify-between px-4">
        <div className="flex items-center gap-1">
          <SidebarToggle />
          <Link href="/" className="text-lg font-semibold tracking-tight text-charcoal">
            JP-Learn
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {loading ? null : user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 rounded-small px-2 py-1 text-sm font-medium text-ink hover:bg-ash/50 outline-none data-open:bg-ash/50 cursor-default">
                  <Plus className="h-5 w-5" />
                  Tạo
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-44" align="end">
                  <DropdownMenuItem onClick={() => router.push('/sets/new')}>
                    <List className="mr-2 h-5 w-5" />
                    Bộ thẻ
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFolderDialogOpen(true)}>
                    <Folder className="mr-2 h-5 w-5" />
                    Thư mục
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <CreateFolderDialog open={folderDialogOpen} onOpenChange={setFolderDialogOpen} />
              <DropdownMenu>
                <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-full outline-none">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-charcoal text-canvas-white text-xs">
                      {user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48" align="end">
                  <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                    <LayoutDashboard className="mr-2 h-5 w-5" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/goals')}>
                    <Target className="mr-2 h-5 w-5" />
                    Mục tiêu
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/badges')}>
                    <Award className="mr-2 h-5 w-5" />
                    Thành tích
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/profile')}>
                    <User className="mr-2 h-5 w-5" />
                    Hồ sơ
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/settings')}>
                    <Settings className="mr-2 h-5 w-5" />
                    Cài đặt
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 h-5 w-5" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/auth/login">Đăng nhập</Link>
              </Button>
              <Button size="sm" asChild className="bg-primary-action-fill text-canvas-white hover:opacity-90">
                <Link href="/auth/register">Đăng ký</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
