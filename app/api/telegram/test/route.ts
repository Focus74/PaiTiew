import { getAdmin, getUserFromRequest } from '@/lib/supabaseAdmin'
import { sendTelegram } from '@/lib/telegram'
import { remindersForUser, todayInBangkok } from '@/lib/reminders'

export const maxDuration = 30

// ปุ่ม "ส่งข้อความทดสอบ": ส่งแจ้งเตือนของวันนี้ให้ตัวเอง (ถ้าไม่มีทริปวันนี้ จะส่งข้อความทักทายแทน)
export async function POST(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return Response.json({ error: 'กรุณาเข้าสู่ระบบก่อน' }, { status: 401 })

  const admin = getAdmin()
  const { data: link } = await admin.from('telegram_links').select('chat_id').eq('user_id', user.id).maybeSingle()
  if (!link) return Response.json({ error: 'ยังไม่ได้เชื่อม Telegram' }, { status: 400 })

  try {
    const msgs = await remindersForUser(admin, user.id, todayInBangkok())
    if (msgs.length === 0) {
      await sendTelegram(link.chat_id, '👋 ทดสอบสำเร็จ! วันนี้ยังไม่มีทริปที่ต้องเตือน (ต้องบันทึกทริปพร้อมวันเริ่มเดินทาง แล้วผมจะเตือนตั้งแต่วันก่อนออกเดินทาง)')
    } else {
      for (const m of msgs) await sendTelegram(link.chat_id, m)
    }
    return Response.json({ ok: true, sent: Math.max(msgs.length, 1) })
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : 'ส่งไม่สำเร็จ' }, { status: 500 })
  }
}
