'use client'

import { createClient } from '@/lib/supabase/client'
import { useCallback, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import type { Session, SupabaseClient } from '@supabase/supabase-js'

export function useSupabase() {
  const [supabase] = useState<SupabaseClient>(createClient)

  return { supabase }
}

export function useSession() {
  const pathname = usePathname()
  const [supabase] = useState(() => createClient())
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [supabase, pathname])

  return { session, loading }
}
