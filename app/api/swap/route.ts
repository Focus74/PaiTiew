import { NextResponse } from 'next/server'
import { swapPlace, swapHotel, normalizePlan } from '@/lib/gemini'
import { parseInput, names } from '@/lib/apiInput'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const input = parseInput(body)
    if (!input) return NextResponse.json({ error: 'ข้อมูลไม่ครบ' }, { status: 400 })

    const plan = normalizePlan(body.plan)
    const rejected = names(body.rejected)

    if (body.kind === 'hotel') {
      const hotel = await swapHotel(input, plan, Number(body.index), rejected)
      return NextResponse.json({ success: true, hotel })
    }
    const place = await swapPlace(input, plan, Number(body.dayIndex), Number(body.index), rejected)
    return NextResponse.json({ success: true, place })
  } catch (error: any) {
    console.error('Swap error:', error)
    return NextResponse.json({ error: error.message || 'เปลี่ยนไม่สำเร็จ' }, { status: 500 })
  }
}
