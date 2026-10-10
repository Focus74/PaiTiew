'use client'

import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
      // ล้าง #access_token ออกจากแถบที่อยู่ ไม่ให้ค้างสะสม
      if (window.location.hash.includes('access_token')) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search)
      }
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  return { user, loading }
}

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + window.location.pathname,
      queryParams: { prompt: 'select_account' },
    },
  })
  if (error) alert('เข้าสู่ระบบไม่สำเร็จ: ' + error.message)
}

export async function signOut() {
  await supabase.auth.signOut()
}
