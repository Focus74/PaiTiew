import { createClient } from '@supabase/supabase-js'

// ดึงค่า URL และ Anon Key จากไฟล์ .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('กรุณาตรวจสอบการใส่ SUPABASE_URL และ SUPABASE_ANON_KEY ในไฟล์ .env.local')
}

// สร้าง Instance ของ Supabase Client เพื่อเรียกใช้งานทั้งแอป
export const supabase = createClient(supabaseUrl, supabaseAnonKey)