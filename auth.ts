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
    // ล็อกอินเสร็จให้กลับมาหน้าเดิม
    options: {
      redirectTo: window.location.href,
      // ให้ Google ถามเลือกบัญชีทุกครั้ง ไม่เข้าบัญชีเดิมอัตโนมัติ
      queryParams: { prompt: 'select_account' },
    },
  })
  if (error) alert('เข้าสู่ระบบไม่สำเร็จ: ' + error.message)
}

export async function signOut() {
  await supabase.auth.signOut()
}
