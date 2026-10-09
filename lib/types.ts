// ชนิดข้อมูลที่ใช้ร่วมกันฝั่งหน้าเว็บ
export interface Place {
  name: string
  description: string
  cost: string // เช่น "ฟรี", "ประมาณ 150 บาท/คน"
  lat: number
  lng: number
}

export interface Hotel {
  name: string
  description: string
  priceRange: string
  pricePerNight: number
  lat: number
  lng: number
}

export interface DayPlan {
  day: number
  title: string
  estimatedCost: number // ค่ากิน-เที่ยวต่อวัน ทั้งกลุ่ม (ไม่รวมที่พัก)
  places: Place[]
}

export interface TripPlan {
  tripTitle: string
  summary: string
  itinerary: DayPlan[]
  hotels: Hotel[]
}

export interface TripGuide {
  transportOptions: { mode: string; duration: string; cost: string; tip: string }[]
  packingList: string[]
  bookAhead: string[]
}

// แถวในตาราง trips ของ Supabase
export interface SavedTrip {
  id: string
  title: string
  origin: string | null
  destination: string
  days: number
  budget: string | null
  style: string | null
  start_date: string | null
  plan: TripPlan
  guide: TripGuide | null
  created_at: string
}
