import { getAdmin } from '@/lib/supabaseAdmin'
import { sendTelegram } from '@/lib/telegram'
import { remindersForUser, todayInBangkok } from '@/lib/reminders'

export const maxDuration = 60

// Vercel Cron เรียกที่นี่ทุกเช้า (ตั้งเวลาไว้ใน vercel.json) และส่งรหัส CRON_SECRET มาให้ตรวจ
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return new Response('forbidden', { status: 403 })
  }

  const admin = getAdmin()
  const today = todayInBangkok()
  const { data: links, error } = await admin.from('telegram_links').select('user_id, chat_id')
  if (error) return Response.json({ error: error.message }, { status: 500 })

  let sent = 0
  let failed = 0
  for (const l of links ?? []) {
    try {
      const msgs = await remindersForUser(admin, l.user_id, today)
      for (const m of msgs) {
        await sendTelegram(l.chat_id, m)
        sent++
      }
    } catch (e) {
      failed++
      console.error('reminder failed for', l.user_id, e)
    }
  }
  return Response.json({ today, users: links?.length ?? 0, sent, failed })
}
