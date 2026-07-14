'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTheme } from 'next-themes'
import { signOut } from '@/actions/auth'
import { useRouter } from 'next/navigation'
import { Sun, Moon, LogOut, Globe } from 'lucide-react'
import { setLocale, getLocale, type Locale } from '@/lib/i18n'
import { toast } from 'sonner'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [locale, setLocaleState] = useState(getLocale())

  function handleLocaleChange(v: string | null) {
    if (!v) return
    setLocale(v as Locale)
    setLocaleState(v as Locale)
    toast.success('Đã đổi ngôn ngữ')
    router.refresh()
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 p-6">
      <h1 className="text-heading-sm font-semibold text-ink">Cài đặt</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Giao diện</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              <span className="text-sm text-ink">Chế độ tối</span>
            </div>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={(c) => setTheme(c ? 'dark' : 'light')}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className="text-sm text-ink">Ngôn ngữ</span>
            </div>
            <Select value={locale} onValueChange={handleLocaleChange}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vi">Tiếng Việt</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Tài khoản</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/profile')}>
            Xem hồ sơ
          </Button>
          <Button variant="outline" className="w-full justify-start" onClick={() => signOut()}>
            <LogOut className="mr-2 h-4 w-4" />
            Đăng xuất
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
