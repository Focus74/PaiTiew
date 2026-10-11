import { NextResponse } from 'next/server'
import { refinePlan, normalizePlan } from '@/lib/gemini'
import { parseInput, names } from '@/lib/apiInput'

// ทริปยาวใช้เวลานานขึ้น จึงขยายเวลาสูงสุดของฟังก์ชันเป็น 60 วินาที
export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const input = parseInput(body)
    const instruction = String(body?.instruction ?? '').trim().slice(0, 300)
    if (!input || !instruction) return NextResponse.json({ error: 'กรุณาบอกสิ่งที่อยากปรับ' }, { status: 400 })

    const plan = await refinePlan(
      input,
      normalizePlan(body.plan),
      instruction,
      names(body.liked),
      names(body.rejected)
    )
    return NextResponse.json({ success: true, plan })
  } catch (error: any) {
    console.error('Refine error:', error)
    return NextResponse.json({ error: error.message || 'ปรับแผนไม่สำเร็จ' }, { status: 500 })
  }
}
