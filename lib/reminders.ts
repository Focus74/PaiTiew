// สร้างข้อความเตือนจากทริปที่บันทึกไว้ (ใช้ฝั่งเซิร์ฟเวอร์)
import type { SupabaseClient } from '@supabase/supabase-js'
import type { SavedTrip } from '@/lib/types'
import { navigateUrl } from '@/lib/mapLinks'
import { esc } from '@/lib/telegram'

// วันนี้ตามเวลาไทย รูปแบบ YYYY-MM-DD
export function todayInBangkok(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(new Date())
}

const dayDiff = (today: string, start: string) =>
  Math.round((Date.parse(today + 'T00:00:00Z') - Date.parse(start.slice(0, 10) + 'T00:00:00Z')) / 86400000)

export function buildReminder(trip: SavedTrip, today: string): string | null {
  if (!trip.start_date) return null
  const diff = dayDiff(today, trip.start_date)
  const area = trip.destination

  // วันก่อนออกเดินทาง
  if (diff === -1) {
    const lines = [`🧳 <b>พรุ่งนี้ออกเดินทางแล้ว!</b>`, `${esc(trip.title)}`, '']
    if (trip.origin) lines.push(`📍 ${esc(trip.origin)} ไป ${esc(area)}`)
    const guide = trip.guide
    if (guide?.packingList?.length) {
      lines.push('', '<b>ของที่ควรเตรียม</b>')
      guide.packingList.slice(0, 12).forEach((x) => lines.push('• ' + esc(x)))
    }
    if (guide?.bookAhead?.length) {
      lines.push('', '<b>ควรจองล่วงหน้า</b>')
      guide.bookAhead.slice(0, 6).forEach((x) => lines.push('• ' + esc(x)))
    }
    return lines.join('\n')
  }

  // ระหว่างทริป
  if (diff >= 0 && diff < trip.days) {
    const day = trip.plan.itinerary?.[diff]
    if (!day) return null
    const lines = [`☀️ <b>วันที่ ${diff + 1}/${trip.days}: ${esc(day.title)}</b>`, esc(trip.title), '']
    day.places.forEach((p, i) => {
      const url = navigateUrl(p.name, area).replace(/&/g, '&amp;')
      lines.push(`${i + 1}. <b>${esc(p.name)}</b> (${esc(p.cost)})`)
      lines.push(`   <a href="${url}">นำทาง</a>`)
    })
    if (diff === 0 && trip.plan.hotels?.[0]) {
      lines.push('', `🏨 ที่พักที่แนะนำ: ${esc(trip.plan.hotels[0].name)}`)
    }
    return lines.join('\n')
  }
  return null
}

// ข้อความเตือนทั้งหมดของผู้ใช้หนึ่งคน สำหรับวันนี้
export async function remindersForUser(admin: SupabaseClient, userId: string, today: string): Promise<string[]> {
  const { data, error } = await admin
    .from('trips')
    .select('*')
    .eq('user_id', userId)
    .not('start_date', 'is', null)
  if (error) throw new Error(error.message)
  const out: string[] = []
  for (const t of (data ?? []) as SavedTrip[]) {
    const msg = buildReminder(t, today)
    if (msg) out.push(msg)
  }
  return out
}
