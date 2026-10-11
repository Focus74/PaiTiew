import { MAX_DAYS } from '@/lib/limits'
import { normalizeBudget, budgetToText } from '@/lib/budget'
import type { TravelPromptInput } from '@/lib/gemini'

// แปลง body ที่ได้จากหน้าเว็บ (ไม่น่าเชื่อถือ) ให้เป็น input ที่ปลอดภัยสำหรับ AI
export function parseInput(body: any): TravelPromptInput | null {
  const destination = String(body?.destination ?? '').trim().slice(0, 100)
  if (!destination) return null
  const days = Math.min(Math.max(Number(body?.days) || 1, 1), MAX_DAYS)
  const budget = normalizeBudget(body?.budget)
  return {
    destination,
    days,
    budget: budgetToText(budget, days),
    people: budget.people,
    style: String(body?.style || 'ท่องเที่ยวทั่วไป').slice(0, 200),
    origin: body?.origin ? String(body.origin).trim().slice(0, 100) : undefined,
  }
}

export const names = (v: unknown): string[] =>
  Array.isArray(v) ? v.slice(0, 60).map((x) => String(x).slice(0, 120)) : []
