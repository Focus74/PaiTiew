import { NextResponse } from 'next/server'
import { generateTravelPlan, generateTravelGuide } from '@/lib/gemini'
import { parseInput } from '@/lib/apiInput'

export async function POST(request: Request) {
  try {
    const input = parseInput(await request.json())
    if (!input) return NextResponse.json({ error: 'กรุณากรอกปลายทาง' }, { status: 400 })

    // รัน 2 งานพร้อมกัน เพื่อไม่ให้ช้าลง: แผนเที่ยว+โรงแรม | การเดินทาง+เตรียมตัว
    const [planResult, guideResult] = await Promise.allSettled([
      generateTravelPlan(input),
      input.origin ? generateTravelGuide(input) : Promise.resolve(null),
    ])

    if (planResult.status === 'rejected') throw planResult.reason

    const guide = guideResult.status === 'fulfilled' ? guideResult.value : null
    if (guideResult.status === 'rejected') console.warn('Guide failed:', guideResult.reason?.message)

    return NextResponse.json({ success: true, plan: planResult.value, guide, budgetText: input.budget })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json({ error: error.message || 'เกิดข้อผิดพลาดในการสร้างแผนทริป' }, { status: 500 })
  }
}
