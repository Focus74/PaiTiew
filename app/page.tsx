'use client'

import { useEffect, useRef, useState } from 'react'
import AuthBar from '@/components/AuthBar'
import TripForm, { defaultForm, styleString, type FormValues } from '@/components/TripForm'
import TripView from '@/components/TripView'
import RefinePanel from '@/components/RefinePanel'
import Hero from '@/components/Hero'
import Destinations from '@/components/Destinations'
import { supabase } from '@/lib/supabase'
import { useUser, signInWithGoogle } from '@/lib/auth'
import type { TripPlan, TripGuide } from '@/lib/types'

// ค่าที่ใช้สร้างแผนจริง (กันผู้ใช้แก้ฟอร์มหลังสร้างแล้ว ทำให้ปรับ/บันทึกผิดค่า)
interface Used {
  destination: string
  origin: string
  days: number
  people: number
  style: string
  startDate: string
  budget: { total: number | null; people: number; hotelMax: number | null }
  budgetText: string
}

const PENDING_KEY = 'paitiew-pending-trip'

async function postJson(url: string, body: unknown, timeoutMs = 30000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    return await res.json()
  } catch (err: any) {
    if (err.name === 'AbortError') throw new Error('การเชื่อมต่อใช้เวลานานเกินไป กรุณาลองอีกครั้ง')
    throw new Error('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้')
  } finally {
    clearTimeout(timer)
  }
}

export default function HomePage() {
  const { user } = useUser()
  const resultRef = useRef<HTMLDivElement>(null)

  const [form, setForm] = useState<FormValues>(defaultForm)
  const [formOpen, setFormOpen] = useState(true)

  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState<TripPlan | null>(null)
  const [guide, setGuide] = useState<TripGuide | null>(null)
  const [used, setUsed] = useState<Used | null>(null)

  const [liked, setLiked] = useState<string[]>([])
  const [rejected, setRejected] = useState<string[]>([])
  const [swappingKey, setSwappingKey] = useState<string | null>(null)
  const [refining, setRefining] = useState(false)

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  // กลับมาจากหน้าล็อกอิน Google: เอาแผนที่สร้างไว้คืนมา ไม่ต้องสร้างใหม่
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(PENDING_KEY)
      if (!raw) return
      sessionStorage.removeItem(PENDING_KEY)
      const s = JSON.parse(raw)
      if (!s?.plan || !s?.used) return
      setPlan(s.plan)
      setGuide(s.guide ?? null)
      setUsed(s.used)
      setLiked(Array.isArray(s.liked) ? s.liked : [])
      setRejected(Array.isArray(s.rejected) ? s.rejected : [])
      setFormOpen(false)
    } catch {
      /* ข้อมูลเสียหาย ข้ามไป */
    }
  }, [])

  const patch = (p: Partial<FormValues>) => setForm((f) => ({ ...f, ...p }))

  // ข้อมูลที่ส่งให้เซิร์ฟเวอร์ทุกครั้ง (ทั้งสร้าง สลับ ปรับ)
  const baseBody = (u: Used) => ({
    destination: u.destination,
    origin: u.origin,
    days: u.days,
    style: u.style,
    budget: u.budget,
  })

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    const snapshot: Used = {
      destination: form.destination.trim(),
      origin: form.origin.trim(),
      days: form.days,
      people: form.people,
      style: styleString(form),
      startDate: form.startDate,
      budget: {
        total: Number(form.total) > 0 ? Number(form.total) : null,
        people: form.people,
        hotelMax: Number(form.hotelMax) > 0 ? Number(form.hotelMax) : null,
      },
      budgetText: '',
    }

    setLoading(true)
    setError('')
    setPlan(null)
    setGuide(null)
    setLiked([])
    setRejected([])
    setSaved(false)

    try {
      const data = await postJson('/api/generate', baseBody(snapshot))
      if (!data.success) throw new Error(data.error || 'เกิดข้อผิดพลาดในการสร้างแผนทริป')
      setUsed({ ...snapshot, budgetText: data.budgetText })
      setPlan(data.plan)
      setGuide(data.guide ?? null)
      setFormOpen(false)
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleLike = (name: string) =>
    setLiked((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]))

  // เปลี่ยนเฉพาะจุดที่ไม่ถูกใจ จุดอื่นคงเดิม
  const handleSwap = async (kind: 'place' | 'hotel', dayIndex: number, index: number) => {
    if (!plan || !used || swappingKey) return
    const key = kind === 'hotel' ? `h-${index}` : `p-${dayIndex}-${index}`
    const oldName = kind === 'hotel' ? plan.hotels[index]?.name : plan.itinerary[dayIndex]?.places[index]?.name
    setSwappingKey(key)
    setError('')

    try {
      const data = await postJson('/api/swap', { ...baseBody(used), plan, rejected, kind, dayIndex, index })
      if (!data.success) throw new Error(data.error || 'เปลี่ยนไม่สำเร็จ')

      setPlan((p) => {
        if (!p) return p
        if (kind === 'hotel') {
          return { ...p, hotels: p.hotels.map((h, i) => (i === index ? data.hotel : h)) }
        }
        return {
          ...p,
          itinerary: p.itinerary.map((d, di) =>
            di === dayIndex ? { ...d, places: d.places.map((pl, pi) => (pi === index ? data.place : pl)) } : d
          ),
        }
      })
      if (oldName) {
        setRejected((r) => [...r, oldName])
        setLiked((l) => l.filter((n) => n !== oldName))
      }
      setSaved(false)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSwappingKey(null)
    }
  }

  // ปรับทั้งแผนตามที่ผู้ใช้บอก โดยคงสิ่งที่กดหัวใจไว้
  const handleRefine = async (instruction: string) => {
    if (!plan || !used) return
    setRefining(true)
    setError('')
    try {
      const data = await postJson('/api/refine', { ...baseBody(used), plan, liked, rejected, instruction }, 35000)
      if (!data.success) throw new Error(data.error || 'ปรับแผนไม่สำเร็จ')
      const newPlan: TripPlan = data.plan
      const present = new Set([
        ...newPlan.itinerary.flatMap((d) => d.places.map((p) => p.name)),
        ...newPlan.hotels.map((h) => h.name),
      ])
      setPlan(newPlan)
      setLiked((l) => l.filter((n) => present.has(n)))
      setSaved(false)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setRefining(false)
    }
  }

  const handleSave = async () => {
    if (!plan || !used) return
    if (!user) {
      try {
        sessionStorage.setItem(PENDING_KEY, JSON.stringify({ plan, guide, used, liked, rejected }))
      } catch {
        /* เก็บไม่ได้ก็ไม่เป็นไร */
      }
      signInWithGoogle()
      return
    }
    setSaving(true)
    // user_id ถูกเติมอัตโนมัติจากฐานข้อมูล (default auth.uid())
    const { error: dbError } = await supabase.from('trips').insert({
      title: plan.tripTitle,
      origin: used.origin || null,
      destination: used.destination,
      days: used.days,
      budget: used.budgetText,
      style: used.style,
      start_date: used.startDate || null,
      plan,
      guide,
    })
    setSaving(false)
    if (dbError) {
      console.error('Save trip failed:', dbError)
      setError('บันทึกไม่สำเร็จ: ' + dbError.message)
    } else {
      setSaved(true)
    }
  }

  // ยังไม่มีแผน หรือกำลังแก้ข้อมูลเพื่อสร้างใหม่ = หน้าแรกแบบเต็ม (ส่วนหัว + ปลายทางแนะนำ + ฟอร์ม)
  const landing = !plan || formOpen

  // แตะปลายทางแนะนำ: ใส่ชื่อลงฟอร์มแล้วเลื่อนลงไปที่ฟอร์ม
  const pickDestination = (name: string) => {
    patch({ destination: name })
    document.getElementById('plan-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <main className="min-h-dvh">
      {landing ? (
        <Hero />
      ) : (
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <AuthBar />
        </div>
      )}

      <div className="mx-auto max-w-6xl px-5 sm:px-8 pb-24">
        {landing && <Destinations onPick={pickDestination} />}

        {/* ฟอร์ม / สรุปสิ่งที่เลือก */}
        {formOpen || !used ? (
          <section id="plan-form" className="scroll-mt-6 max-w-2xl pt-14 sm:pt-24 pb-6 sm:pb-10">
            <p className="mb-2 text-sm font-medium tracking-wide text-moss">✦ เริ่มต้นการเดินทาง</p>
            <h2 className="font-display text-3xl sm:text-4xl leading-[1.35] font-medium text-ink">
              ออกแบบทริปของคุณ
            </h2>
            <p className="mt-3 mb-8 sm:mb-10 text-muted max-w-prose">
              กรอกปลายทางกับงบคร่าวๆ ไกด์ส่วนตัวจะจัดแผนให้ แล้วคุณปรับได้จนกว่าจะถูกใจ
            </p>
            <TripForm values={form} onChange={patch} onSubmit={handleGenerate} loading={loading} />
          </section>
        ) : (
          <section className="glass rounded-3xl flex flex-wrap items-center justify-between gap-3 px-5 py-4 mb-8">
            <p className="text-ink">
              <span className="font-semibold">{used.destination}</span>
              <span className="text-muted"> {used.days} วัน {used.people} คน</span>
              {used.budget.total ? <span className="text-muted"> งบ ฿{used.budget.total.toLocaleString('en-US')}</span> : null}
            </p>
            <button
              onClick={() => {
                setFormOpen(true)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className="px-4 py-2 rounded-full border border-white/80 bg-white/70 text-sm text-ink hover:bg-white cursor-pointer"
            >
              แก้ข้อมูลแล้วสร้างใหม่
            </button>
          </section>
        )}

        {error && (
          <div role="alert" className="mb-8 rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}

        {plan && used && (
          <div ref={resultRef} className="scroll-mt-4">
            <TripView
              plan={plan}
              guide={guide}
              area={used.destination}
              origin={used.origin}
              days={used.days}
              budgetTotal={used.budget.total}
              editable={{ liked, swappingKey, onToggleLike: toggleLike, onSwap: handleSwap }}
              afterHotels={
                <RefinePanel
                  onSave={handleSave}
                  saving={saving}
                  saved={saved}
                  loggedIn={!!user}
                  onRefine={handleRefine}
                  refining={refining}
                />
              }
            />
          </div>
        )}
      </div>
    </main>
  )
}
