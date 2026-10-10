'use client'

import { useCallback, useEffect, useState } from 'react'
import AuthBar from '@/components/AuthBar'
import TripView from '@/components/TripView'
import TelegramConnect from '@/components/TelegramConnect'
import { supabase } from '@/lib/supabase'
import { useUser, signInWithGoogle } from '@/lib/auth'
import type { SavedTrip } from '@/lib/types'

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })

export default function TripsPage() {
  const { user, loading: authLoading } = useUser()
  const [trips, setTrips] = useState<SavedTrip[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const { data, error } = await supabase.from('trips').select('*').order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setTrips((data ?? []) as SavedTrip[])
    setLoading(false)
  }, [])

  useEffect(() => {
    if (user) load()
    else setTrips([])
  }, [user, load])

  const handleDelete = async (id: string) => {
    if (!confirm('ลบทริปนี้ใช่ไหม ลบแล้วกู้คืนไม่ได้')) return
    const { error } = await supabase.from('trips').delete().eq('id', id)
    if (error) {
      alert('ลบไม่สำเร็จ: ' + error.message)
      return
    }
    setTrips((prev) => prev.filter((t) => t.id !== id))
    if (openId === id) setOpenId(null)
  }

  const opened = trips.find((t) => t.id === openId)

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 pb-24">
        <AuthBar />
        <h1 className="pt-6 sm:pt-10 pb-8 text-4xl font-semibold tracking-tight text-ink">ทริปของฉัน</h1>

        {authLoading ? null : !user ? (
          <div className="max-w-md space-y-4">
            <p className="text-muted">เข้าสู่ระบบเพื่อดูทริปที่เคยบันทึกไว้</p>
            <button
              onClick={signInWithGoogle}
              className="px-5 py-2.5 rounded-full bg-moss hover:bg-moss-deep text-surface text-sm font-medium cursor-pointer"
            >
              เข้าสู่ระบบด้วย Google
            </button>
          </div>
        ) : (
          <>
            <TelegramConnect userId={user.id} />
            {loading && <p className="text-muted">กำลังโหลด</p>}
            {error && <p className="text-danger">โหลดไม่สำเร็จ: {error}</p>}
            {!loading && !error && trips.length === 0 && (
              <p className="text-muted max-w-md">
                ยังไม่มีทริปที่บันทึกไว้ สร้างทริปที่หน้าแรก แล้วกด &quot;บันทึกทริปนี้&quot;
              </p>
            )}

            <ul className="divide-y divide-line border-y border-line mb-12">
              {trips.map((t) => (
                <li key={t.id} className={`py-4 flex flex-wrap items-center justify-between gap-3 ${openId === t.id ? 'bg-moss-soft/40 -mx-3 px-3 rounded-xl' : ''}`}>
                  <div className="min-w-0">
                    <p className="font-medium text-ink">{t.title}</p>
                    <p className="text-sm text-muted">
                      {t.origin ? `${t.origin} ไป ` : ''}{t.destination} {t.days} วัน
                    </p>
                    <p className="text-xs text-muted">
                      {t.start_date ? `เริ่มเดินทาง ${fmtDate(t.start_date)} บันทึกเมื่อ ${fmtDate(t.created_at)}` : `บันทึกเมื่อ ${fmtDate(t.created_at)}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setOpenId(openId === t.id ? null : t.id)}
                      className="px-4 py-1.5 rounded-full border border-line text-sm text-ink hover:bg-surface cursor-pointer"
                    >
                      {openId === t.id ? 'ซ่อนแผน' : 'ดูแผน'}
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="px-4 py-1.5 rounded-full text-sm text-danger hover:bg-danger/5 cursor-pointer"
                    >
                      ลบ
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            {opened && (
              <TripView
                key={opened.id}
                plan={opened.plan}
                guide={opened.guide}
                area={opened.destination}
                origin={opened.origin}
                days={opened.days}
              />
            )}
          </>
        )}
      </div>
    </main>
  )
}
