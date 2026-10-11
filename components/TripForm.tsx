'use client'

import { useEffect, useState } from 'react'
import { MAX_DAYS } from '@/lib/limits'
import { MinusIcon, PlusIcon, SpinnerIcon } from '@/components/Icons'

export interface FormValues {
  destination: string
  origin: string
  days: number
  startDate: string
  total: string // เก็บเป็นข้อความเพื่อให้ช่องว่างได้ (ว่าง = ไม่กำหนดงบ)
  people: number
  hotelMax: string
  styles: string[]
  styleText: string
}

export const defaultForm: FormValues = {
  destination: '',
  origin: '',
  days: 3,
  startDate: '',
  total: '',
  people: 2,
  hotelMax: '',
  styles: ['คาเฟ่', 'ถ่ายรูป'],
  styleText: '',
}

const STYLE_OPTIONS = ['คาเฟ่', 'ธรรมชาติ', 'วัดและวัฒนธรรม', 'สายกิน', 'ถ่ายรูป', 'ผ่อนคลาย', 'ผจญภัย', 'ช้อปปิ้ง']
const BUDGET_PRESETS = [3000, 5000, 10000, 20000]

export const styleString = (v: FormValues) =>
  [...v.styles, v.styleText.trim()].filter(Boolean).join(', ') || 'ท่องเที่ยวทั่วไป'

const field =
  'w-full px-4 py-3 rounded-2xl border border-white/80 bg-white/70 text-ink placeholder:text-muted/70 focus:border-moss focus:bg-white outline-none transition-colors shadow-[inset_0_1px_3px_rgba(106,88,214,0.08)]'
const label = 'block text-sm font-medium text-ink mb-1.5'
const hint = 'text-xs text-muted mt-1.5'

function Stepper({ value, min, max, onChange, unit }: { value: number; min: number; max: number; onChange: (n: number) => void; unit: string }) {
  const round = 'h-11 w-11 rounded-full border border-white/80 bg-white/80 text-ink flex items-center justify-center hover:border-moss hover:shadow-[0_6px_18px_-6px_rgba(106,88,214,0.5)] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed'
  // ช่องตัวเลขพิมพ์เองได้ (ทริปยาวจะได้ไม่ต้องกดบวกทีละครั้ง)
  const [text, setText] = useState(String(value))
  useEffect(() => setText(String(value)), [value])

  const commit = () => {
    const n = parseInt(text, 10)
    const v = Number.isFinite(n) ? Math.min(Math.max(n, min), max) : value
    onChange(v)
    setText(String(v))
  }

  return (
    <div className="flex items-center gap-3">
      <button type="button" className={round} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label={`ลด${unit}`}>
        <MinusIcon />
      </button>
      <span className="flex items-baseline justify-center gap-1.5 min-w-[5.5rem] text-ink">
        <input
          inputMode="numeric"
          aria-label={unit}
          value={text}
          onChange={(e) => {
            const t = e.target.value.replace(/\D/g, '').slice(0, 3)
            setText(t)
            const n = parseInt(t, 10)
            if (Number.isFinite(n) && n >= min && n <= max) onChange(n)
          }}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              commit()
            }
          }}
          className="w-11 bg-transparent border-b border-line focus:border-moss outline-none text-center text-lg font-semibold"
        />
        <span>{unit}</span>
      </span>
      <button type="button" className={round} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label={`เพิ่ม${unit}`}>
        <PlusIcon />
      </button>
    </div>
  )
}

interface Props {
  values: FormValues
  onChange: (patch: Partial<FormValues>) => void
  onSubmit: (e: React.FormEvent) => void
  loading: boolean
  submitText?: string
}

export default function TripForm({ values: v, onChange, onSubmit, loading, submitText = 'สร้างแผนทริป' }: Props) {
  const toggleStyle = (s: string) =>
    onChange({ styles: v.styles.includes(s) ? v.styles.filter((x) => x !== s) : [...v.styles, s] })

  const totalNum = Number(v.total)
  const perPerson =
    totalNum > 0 ? Math.round(totalNum / v.people / Math.max(v.days, 1)).toLocaleString('en-US') : null

  return (
    <form onSubmit={onSubmit} className="glass rounded-[2rem] p-5 sm:p-8 space-y-8">
      {/* ปลายทาง */}
      <div>
        <label htmlFor="destination" className={label}>อยากไปที่ไหน</label>
        <input
          id="destination"
          type="text"
          required
          placeholder="เช่น เชียงใหม่ ภูเก็ต กรุงเทพ หรือชื่อสถานที่"
          className={`${field} text-lg py-3.5`}
          value={v.destination}
          onChange={(e) => onChange({ destination: e.target.value })}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="origin" className={label}>ออกเดินทางจาก (ไม่บังคับ)</label>
          <input
            id="origin"
            type="text"
            placeholder="เช่น กรุงเทพ ขอนแก่น"
            className={field}
            value={v.origin}
            onChange={(e) => onChange({ origin: e.target.value })}
          />
          <p className={hint}>กรอกแล้วจะได้วิธีเดินทางและของที่ควรเตรียม</p>
        </div>
        <div>
          <label htmlFor="startDate" className={label}>วันเริ่มเดินทาง (ไม่บังคับ)</label>
          <input id="startDate" type="date" className={`${field} block`} value={v.startDate} onChange={(e) => onChange({ startDate: e.target.value })} />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <span className={label}>ไปกี่วัน</span>
          <Stepper value={v.days} min={1} max={MAX_DAYS} unit="วัน" onChange={(n) => onChange({ days: n })} />
        </div>
        <div>
          <span className={label}>ไปกี่คน</span>
          <Stepper value={v.people} min={1} max={20} unit="คน" onChange={(n) => onChange({ people: n })} />
        </div>
      </div>

      {/* งบประมาณ */}
      <div role="group" aria-labelledby="budget-heading" className="space-y-4 rounded-3xl bg-moss-soft/60 border border-white/70 p-5">
        <p id="budget-heading" className="text-sm font-semibold text-ink">งบประมาณ</p>

        <div>
          <label htmlFor="total" className={label}>งบรวมทั้งทริป (บาท)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">฿</span>
            <input
              id="total"
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="ปล่อยว่างถ้าไม่กำหนด"
              className={`${field} pl-9`}
              value={v.total}
              onChange={(e) => onChange({ total: e.target.value })}
            />
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {BUDGET_PRESETS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => onChange({ total: String(n) })}
                className={`px-4 py-2 rounded-full text-sm border cursor-pointer transition-colors ${
                  Number(v.total) === n ? 'bg-moss text-surface border-transparent' : 'bg-white/70 border-white/80 text-ink hover:border-moss'
                }`}
              >
                {n.toLocaleString('en-US')}
              </button>
            ))}
            <button
              type="button"
              onClick={() => onChange({ total: '' })}
              className={`px-4 py-2 rounded-full text-sm border cursor-pointer transition-colors ${
                v.total === '' ? 'bg-moss text-surface border-transparent' : 'bg-white/70 border-white/80 text-ink hover:border-moss'
              }`}
            >
              ไม่กำหนด
            </button>
          </div>
          {perPerson && (
            <p className={hint}>เฉลี่ยประมาณ ฿{perPerson} ต่อคนต่อวัน (รวมที่พักและการเดินทางในพื้นที่)</p>
          )}
        </div>

        <div>
          <label htmlFor="hotelMax" className={label}>ที่พักไม่เกินคืนละ (บาท ทั้งกลุ่ม)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">฿</span>
            <input
              id="hotelMax"
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="ไม่บังคับ"
              className={`${field} pl-9`}
              value={v.hotelMax}
              onChange={(e) => onChange({ hotelMax: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* สไตล์ */}
      <div>
        <span className={label}>สไตล์ที่ชอบ (เลือกได้หลายอย่าง)</span>
        <div className="flex flex-wrap gap-2">
          {STYLE_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={v.styles.includes(s)}
              onClick={() => toggleStyle(s)}
              className={`px-4 py-2.5 rounded-full text-sm border cursor-pointer transition-colors ${
                v.styles.includes(s) ? 'bg-moss text-surface border-transparent' : 'bg-white/70 border-white/80 text-ink hover:border-moss'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="อย่างอื่นที่อยากเพิ่ม เช่น ไม่เอาที่คนเยอะ มีเด็กไปด้วย"
          className={`${field} mt-3`}
          value={v.styleText}
          onChange={(e) => onChange({ styleText: e.target.value })}
        />
      </div>

      {/* มือถือ: ปุ่มติดขอบล่างจอ ไม่ต้องเลื่อนลงไปสุดฟอร์ม */}
      <div className="sticky bottom-0 z-20 -mx-5 px-5 pt-6 pb-[max(1rem,env(safe-area-inset-bottom))] bg-gradient-to-t from-white/90 from-60% to-transparent sm:static sm:mx-0 sm:p-0 sm:bg-none">
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-full bg-moss text-surface font-medium text-base transition-colors disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2 shadow-sm sm:shadow-none"
        >
          {loading ? (
            <>
              <SpinnerIcon />
              <span>กำลังวางแผน อาจใช้เวลาสักครู่</span>
            </>
          ) : (
            submitText
          )}
        </button>
      </div>
    </form>
  )
}
