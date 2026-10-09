// งบประมาณแบบยืดหยุ่น: งบรวม (ไม่กำหนดก็ได้) + จำนวนคน + เพดานค่าที่พักต่อคืน (ไม่บังคับ)
export interface BudgetInput {
  total: number | null
  people: number
  hotelMax: number | null
}

const num = (v: unknown) => {
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null
}

export function normalizeBudget(raw: any): BudgetInput {
  const people = Math.min(Math.max(num(raw?.people) ?? 1, 1), 20)
  const total = num(raw?.total)
  const hotelMax = num(raw?.hotelMax)
  return {
    total: total ? Math.min(total, 10_000_000) : null,
    people,
    hotelMax: hotelMax ? Math.min(hotelMax, 1_000_000) : null,
  }
}

const fmt = (n: number) => n.toLocaleString('en-US')

export function budgetToText(b: BudgetInput, days: number): string {
  const parts: string[] = []
  if (b.total) {
    const perPersonPerDay = Math.round(b.total / b.people / Math.max(days, 1))
    parts.push(`งบรวมประมาณ ${fmt(b.total)} บาท สำหรับ ${b.people} คน (เฉลี่ยประมาณ ${fmt(perPersonPerDay)} บาท/คน/วัน)`)
  } else {
    parts.push(`ไม่กำหนดงบแน่นอน เน้นความคุ้มค่า สำหรับ ${b.people} คน`)
  }
  if (b.hotelMax) parts.push(`ที่พักไม่เกิน ${fmt(b.hotelMax)} บาท/คืน (ทั้งกลุ่ม)`)
  return parts.join(' ')
}
