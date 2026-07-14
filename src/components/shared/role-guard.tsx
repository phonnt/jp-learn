'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { TUserRole } from '@/types'

interface RoleGuardProps {
  allowedRoles: TUserRole['role'][]
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function RoleGuard({ allowedRoles, children, fallback }: RoleGuardProps) {
  const router = useRouter()
  const [role, setRole] = useState<TUserRole['role'] | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single()

      setRole(data?.role || 'user')
      setLoading(false)
    }
    check()
  }, [supabase, router])

  if (loading) return null

  if (!role || !allowedRoles.includes(role)) {
    if (fallback) return <>{fallback}</>
    router.push('/dashboard')
    return null
  }

  return <>{children}</>
}
