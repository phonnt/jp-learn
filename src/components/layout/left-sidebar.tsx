'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, BookOpen, Folder, Plus, Globe, Menu,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSidebar } from '@/hooks/use-sidebar'
import { useSession } from '@/hooks/use-supabase'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { createClient } from '@/lib/supabase/client'
import { CreateFolderDialog } from '@/components/folders/create-folder-dialog'

interface TFolder { id: string; title: string }

function NavItem({ href, label, icon: Icon, collapsed, onNavigate, authRequired }: {
  href: string; label: string; icon: typeof LayoutDashboard; collapsed?: boolean; onNavigate?: () => void; authRequired?: boolean
}) {
  const pathname = usePathname()
  const { session } = useSession()
  if (authRequired && !session?.user) return null

  const isActive = pathname === href || pathname.startsWith(href + '/')
  return (
    <Button
      variant="ghost"
      size="sm"
      asChild
      className={cn(
        'justify-start gap-3 h-10 w-full',
        collapsed ? 'px-0 justify-center' : 'px-3',
        isActive && 'bg-paper-mist font-medium text-charcoal',
      )}
      onClick={onNavigate}
    >
      <Link href={href}>
        <Icon className="h-5 w-5 shrink-0" />
        {!collapsed && <span>{label}</span>}
      </Link>
    </Button>
  )
}

export function LeftSidebar() {
  const pathname = usePathname()
  const { desktopOpen } = useSidebar()
  const [folders, setFolders] = useState<TFolder[]>([])
  const [folderDialogOpen, setFolderDialogOpen] = useState(false)
  const { session } = useSession()
  const user = session?.user

  useEffect(() => {
    if (!user?.id) return
    const supabase = createClient()
    supabase.from('folders').select('id, title').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5).then(({ data }) => {
      if (data) setFolders(data)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const isAuthPage = pathname.startsWith('/auth')
  if (isAuthPage) return null

  return (
    <>
      {/* Desktop */}
      <aside
        className={cn(
          'hidden md:flex flex-col border-r border-ash bg-canvas-white transition-all duration-200 overflow-hidden shrink-0',
          desktopOpen ? 'w-56' : 'w-14',
        )}
      >
        <div className={cn('overflow-y-auto flex-1', desktopOpen ? 'w-56' : 'w-14')}>
          {/* Navigation */}
          <div className="p-2 pt-4">
            <NavItem href="/dashboard" label="Trang chủ" icon={LayoutDashboard} collapsed={!desktopOpen} />
            <NavItem href="/sets/my" label="Thư viện" icon={BookOpen} collapsed={!desktopOpen} />
          </div>

          {desktopOpen && <div className="mx-3 h-px bg-ash" />}

          {/* Folders section */}
          {desktopOpen && user && (
            <div className="p-2">
              <p className="px-3 pt-2 pb-1 text-xs font-medium text-fog uppercase tracking-wider">
                Thư mục của tôi
              </p>
              <div className="flex flex-col gap-0.5">
                {folders.map((f) => (
                  <Button key={f.id} variant="ghost" size="sm" asChild className="justify-start gap-3 px-3 h-9 w-full">
                    <Link href={`/folders/${f.id}`}>
                      <Folder className="h-4 w-4 shrink-0 text-fog" />
                      <span className="truncate">{f.title}</span>
                    </Link>
                  </Button>
                ))}
                <Button variant="ghost" size="sm" className="justify-start gap-3 px-3 h-9 w-full text-fog hover:text-charcoal" onClick={() => setFolderDialogOpen(true)}>
                  <Plus className="h-4 w-4 shrink-0" />
                  <span>Tạo thư mục</span>
                </Button>
              </div>
            </div>
          )}

          {desktopOpen && user && <div className="mx-3 h-px bg-ash" />}

          <CreateFolderDialog open={folderDialogOpen} onOpenChange={setFolderDialogOpen} />

          {/* Explore section */}
          <div className="p-2">
            {desktopOpen && (
              <p className="px-3 pt-2 pb-1 text-xs font-medium text-fog uppercase tracking-wider">
                Khám phá
              </p>
            )}
            <NavItem href="/sets" label="Khám phá" icon={Globe} collapsed={!desktopOpen} />
          </div>

          {/* Collapsed bottom folders shortcut */}
          {!desktopOpen && user && (
            <div className="mt-auto p-2">
              <Button variant="ghost" size="sm" asChild className="justify-center px-0 h-10 w-full">
                <Link href="/folders">
                  <Folder className="h-5 w-5 shrink-0" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile */}
      <MobileSheet />
    </>
  )
}

function MobileSheet() {
  const { mobileOpen, setMobileOpen } = useSidebar()
  const pathname = usePathname()
  const [folders, setFolders] = useState<TFolder[]>([])
  const [folderDialogOpen, setFolderDialogOpen] = useState(false)
  const { session } = useSession()
  const user = session?.user

  useEffect(() => {
    if (!user?.id) return
    const supabase = createClient()
    supabase.from('folders').select('id, title').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5).then(({ data }) => {
      if (data) setFolders(data)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const isAuthPage = pathname.startsWith('/auth')
  if (isAuthPage) return null

  function close() { setMobileOpen(false) }

  return (
    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
      <SheetContent side="left" className="w-56 p-0">
        <div className="p-2 pt-6">
          <NavItem href="/dashboard" label="Trang chủ" icon={LayoutDashboard} onNavigate={close} />
          <NavItem href="/sets/my" label="Thư viện" icon={BookOpen} onNavigate={close} />
        </div>

        {user && <div className="mx-3 h-px bg-ash" />}

        {user && (
          <div className="p-2">
            <p className="px-3 pt-2 pb-1 text-xs font-medium text-fog uppercase tracking-wider">
              Thư mục của tôi
            </p>
            <div className="flex flex-col gap-0.5">
              {folders.map((f) => (
                <Button key={f.id} variant="ghost" size="sm" asChild className="justify-start gap-3 px-3 h-9 w-full" onClick={close}>
                  <Link href={`/folders/${f.id}`}>
                    <Folder className="h-4 w-4 shrink-0 text-fog" />
                    <span className="truncate">{f.title}</span>
                  </Link>
                </Button>
              ))}
              <Button variant="ghost" size="sm" className="justify-start gap-3 px-3 h-9 w-full text-fog hover:text-charcoal" onClick={() => { close(); setFolderDialogOpen(true) }}>
                <Plus className="h-4 w-4 shrink-0" />
                <span>Tạo thư mục</span>
              </Button>
            </div>
          </div>
        )}

        <CreateFolderDialog open={folderDialogOpen} onOpenChange={(v) => { setFolderDialogOpen(v) }} />

        <div className="mx-3 h-px bg-ash" />

        <div className="p-2">
          <p className="px-3 pt-2 pb-1 text-xs font-medium text-fog uppercase tracking-wider">
            Khám phá
          </p>
          <NavItem href="/sets" label="Khám phá" icon={Globe} onNavigate={close} />
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function SidebarToggle() {
  const pathname = usePathname()
  const { toggleDesktop, toggleMobile } = useSidebar()

  const isAuthPage = pathname.startsWith('/auth')
  if (isAuthPage) return null

  function handleClick() {
    if (window.innerWidth < 768) toggleMobile()
    else toggleDesktop()
  }

  return (
    <Button variant="ghost" size="icon" className="h-9 w-9 -ml-1" onClick={handleClick}>
      <Menu className="h-5 w-5" />
    </Button>
  )
}
