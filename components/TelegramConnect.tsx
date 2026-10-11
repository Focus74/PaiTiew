'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'

async function authHeader() {
  const { data } = await supabase.auth.getSession()
  return { Authorization: `Bearer ${data.session?.access_token ?? ''}` }
}

export default function TelegramConnect({ userId }: { userId: string }) {
  const [linked, setLinked] = useState<boolean | null>(null)
  const [url, setUrl] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  const check = useCallback(async () => {
    const { data } = await supabase.from('telegram_links').select('user_id').eq('user_id', userId).maybeSingle()
    const ok = !!data
    setLinked(ok)
    if (ok) {
      setUrl('')
      if (timer.current) clearInterval(timer.current)
    }
    return ok
  }, [userId])

  useEffect(() => {
    check()
    return () => {
      if (timer.current) clearInterval(timer.current)
    }
  }, [check])

  const startLink = async () => {
    setBusy(true)
    setMsg('')
    try {
      const res = await fetch('/api/telegram/link', { method: 'POST', headers: await authHeader() })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'สร้างลิงก์ไม่สำเร็จ')
      setUrl(json.url)
      // เช็คทุก 3 วินาที นาน 2 นาที ว่าผู้ใช้กด Start ในบอทแล้วหรือยัง
      if (timer.current) clearInterval(timer.current)
      let n = 0
      timer.current = setInterval(async () => {
        n++
        if ((await check()) || n > 40) {
          if (timer.current) clearInterval(timer.current)
        }
      }, 3000)
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด')
    }
    setBusy(false)
  }

  const sendTest = async () => {
    setBusy(true)
    setMsg('')
    try {
      const res = await fetch('/api/telegram/test', { method: 'POST', headers: await authHeader() })
      const json = await res.json()
      setMsg(res.ok ? 'ส่งแล้ว ลองเช็ค Telegram ดูครับ' : json.error || 'ส่งไม่สำเร็จ')
    } catch {
      setMsg('ส่งไม่สำเร็จ')
    }
    setBusy(false)
  }

  const unlink = async () => {
    if (!confirm('ยกเลิกการแจ้งเตือนผ่าน Telegram ใช่ไหม')) return
    await supabase.from('telegram_links').delete().eq('user_id', userId)
    setLinked(false)
    setMsg('')
  }

  if (linked === null) return null

  return (
    <section className="mb-8 sm:mb-10 max-w-xl glass rounded-3xl p-4 sm:p-5 space-y-3">
      <h2 className="font-semibold text-ink">แจ้งเตือนผ่าน Telegram</h2>
      {linked ? (
        <>
          <p className="text-sm text-muted">
            เชื่อมต่อแล้ว ทุกเช้าประมาณ 07:00 บอทจะส่งแผนของวันนั้น (และเตือนเตรียมของ 1 วันก่อนออกเดินทาง)
            สำหรับทริปที่บันทึกพร้อมวันเริ่มเดินทาง
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={sendTest}
              disabled={busy}
              className="px-4 py-2 rounded-full bg-moss hover:bg-moss-deep text-surface text-sm font-medium cursor-pointer disabled:opacity-50"
            >
              ส่งข้อความทดสอบ
            </button>
            <button
              onClick={unlink}
              className="px-4 py-2 rounded-full text-sm text-danger hover:bg-danger/5 cursor-pointer"
            >
              ยกเลิกการเชื่อม
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="text-sm text-muted">ให้บอทส่งแผนเที่ยวของแต่ละวันมาให้ใน Telegram ทุกเช้า</p>
          {url ? (
            <div className="space-y-2">
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="inline-block px-5 py-2.5 rounded-full bg-moss hover:bg-moss-deep text-surface text-sm font-medium"
              >
                เปิดบอทใน Telegram
              </a>
              <p className="text-xs text-muted">กดลิงก์ แล้วกด Start ในแชทบอท หน้านี้จะอัปเดตเองภายในไม่กี่วินาที</p>
            </div>
          ) : (
            <button
              onClick={startLink}
              disabled={busy}
              className="px-5 py-2.5 rounded-full bg-moss hover:bg-moss-deep text-surface text-sm font-medium cursor-pointer disabled:opacity-50"
            >
              เชื่อม Telegram
            </button>
          )}
        </>
      )}
      {msg && <p className="text-sm text-muted">{msg}</p>}
    </section>
  )
}
