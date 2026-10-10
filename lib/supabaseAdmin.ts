// ใช้ฝั่งเซิร์ฟเวอร์เท่านั้น! ใช้ service role key ซึ่งข้าม RLS ได้ ห้ามเอาไปใช้ในไฟล์ฝั่งหน้าเว็บ
import { createClient } from '@supabase/supabase-js'

export function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('ยังไม่ได้ตั้งค่า SUPABASE_SERVICE_ROLE_KEY')
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

// ตรวจว่า request มาจากผู้ใช้ที่ล็อกอินจริง (อ่านจาก header Authorization: Bearer <token>)
export async function getUserFromRequest(req: Request) {
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '')
  if (!token) return null
  const { data, error } = await getAdmin().auth.getUser(token)
  if (error || !data.user) return null
  return data.user
}
