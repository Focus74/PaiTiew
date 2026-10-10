import { randomBytes } from 'crypto'
import { getAdmin, getUserFromRequest } from '@/lib/supabaseAdmin'

export const maxDuration = 30

// ผู้ใช้กด "เชื่อม Telegram" -> สร้างรหัสจับคู่ แล้วส่งลิงก์เปิดบอทกลับไป
export async function POST(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return Response.json({ error: 'กรุณาเข้าสู่ระบบก่อน' }, { status: 401 })

  const admin = getAdmin()
  await admin.from('telegram_link_codes').delete().eq('user_id', user.id)
  const code = randomBytes(12).toString('base64url')
  const { error } = await admin.from('telegram_link_codes').insert({ code, user_id: user.id })
  if (error) return Response.json({ error: error.message }, { status: 500 })

  const bot = process.env.TELEGRAM_BOT_USERNAME || 'PaiTiewBot'
  return Response.json({ url: `https://t.me/${bot}?start=${code}` })
}
