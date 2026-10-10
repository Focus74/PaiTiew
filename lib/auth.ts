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
    // กลับมาหน้าเดิมโดยตัด #access_token เก่าออก (ไม่งั้นลิงก์ยาวขึ้นทุกครั้งจน Google ตอบ 400)
    options: {
      redirectTo: window.location.origin + window.location.pathname,
      // ให้ Google ถามเลือกบัญชีทุกครั้ง
      queryParams: { prompt: 'select_account' },
    },
  })
  if (error) alert('เข้าสู่ระบบไม่สำเร็จ: ' + error.message)
}

export async function signOut() {
  await supabase.auth.signOut()
}
