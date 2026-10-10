import { getAdmin } from '@/lib/supabaseAdmin'
import { sendTelegram } from '@/lib/telegram'

export const maxDuration = 30

// Telegram เรียกมาที่นี่ทุกครั้งที่มีคนพิมพ์หาบอท
export async function POST(req: Request) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET
  if (!secret || req.headers.get('x-telegram-bot-api-secret-token') !== secret) {
    return new Response('forbidden', { status: 403 })
  }

  try {
    const update = await req.json()
    const msg = update?.message
    const chatId: number | undefined = msg?.chat?.id
    const text: string = (msg?.text || '').trim()
    if (!chatId || !text) return Response.json({ ok: true })

    const admin = getAdmin()

    if (text.startsWith('/start')) {
      const code = text.split(/\s+/)[1]
      if (!code) {
        await sendTelegram(chatId, 'สวัสดีครับ ผม <b>PaiTiew</b> 🧭\nเปิดเว็บไปเที่ยว ไปที่หน้า "ทริปของฉัน" แล้วกดปุ่ม "เชื่อม Telegram" เพื่อให้ผมเตือนทริปของคุณทุกเช้า')
        return Response.json({ ok: true })
      }
      const since = new Date(Date.now() - 15 * 60 * 1000).toISOString()
      const { data } = await admin
        .from('telegram_link_codes')
        .select('user_id')
        .eq('code', code)
        .gte('created_at', since)
        .maybeSingle()
      if (!data) {
        await sendTelegram(chatId, 'รหัสนี้หมดอายุแล้ว กลับไปกด "เชื่อม Telegram" ที่เว็บอีกครั้งนะครับ')
        return Response.json({ ok: true })
      }
      await admin.from('telegram_links').upsert({ user_id: data.user_id, chat_id: chatId })
      await admin.from('telegram_link_codes').delete().eq('code', code)
      await sendTelegram(chatId, '✅ เชื่อมต่อสำเร็จ! ผมจะส่งแผนเที่ยวให้ทุกเช้า (เวลาประมาณ 07:00) ตั้งแต่วันก่อนออกเดินทางจนจบทริป\n\nพิมพ์ /stop เมื่อต้องการยกเลิก')
    } else if (text.startsWith('/stop')) {
      await admin.from('telegram_links').delete().eq('chat_id', chatId)
      await sendTelegram(chatId, 'ยกเลิกการแจ้งเตือนแล้วครับ เชื่อมใหม่ได้ทุกเมื่อที่เว็บ')
    }
  } catch (e) {
    console.error('telegram webhook error', e)
  }
  // ตอบ 200 เสมอ เพื่อไม่ให้ Telegram ส่งซ้ำ
  return Response.json({ ok: true })
}
