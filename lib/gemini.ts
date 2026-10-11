import { GoogleGenAI, ApiError } from '@google/genai'
import { MAX_DAYS } from '@/lib/limits'
import type { Place, Hotel, TripPlan, TripGuide } from '@/lib/types'

const apiKey = process.env.GEMINI_API_KEY || ''
const ai = new GoogleGenAI({ apiKey })

// ---------- Types ----------
export interface TravelPromptInput {
  destination: string
  days: number
  budget: string // ข้อความงบที่สร้างจาก lib/budget.ts
  style: string
  origin?: string
  people: number
}

// ---------- Config ----------
// ตั้งค่าได้ใน .env.local เช่น GEMINI_MODELS=gemini-3.5-flash,gemini-3.1-flash-lite
const MODELS = (process.env.GEMINI_MODELS || 'gemini-3.5-flash,gemini-3.1-flash-lite')
  .split(',')
  .map((m) => m.trim())
  .filter(Boolean)

const MAX_ATTEMPTS_PER_MODEL = 2
const TOTAL_BUDGET_MS = 55_000 // ต่อการเรียก AI 1 ครั้ง (ฟังก์ชันบน Vercel ตั้งไว้ 60 วินาที)

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

function isTransient(error: unknown): boolean {
  if (error instanceof ApiError) return [429, 500, 502, 503, 504].includes(error.status)
  return true
}

// ---------- Core caller (retry + fallback) ----------
async function callGemini(prompt: string, responseSchema: any): Promise<any> {
  if (!apiKey) throw new Error('ไม่พบ GEMINI_API_KEY ในไฟล์ .env.local')

  const started = Date.now()
  let lastError: unknown

  for (const model of MODELS) {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS_PER_MODEL; attempt++) {
      if (Date.now() - started > TOTAL_BUDGET_MS) {
        throw new Error('AI ใช้เวลานานเกินไป กรุณากดลองใหม่อีกครั้ง')
      }
      try {
        const res = await ai.models.generateContent({
          model,
          contents: prompt,
          config: { responseMimeType: 'application/json', temperature: 0.4, maxOutputTokens: 32768, responseSchema },
        })
        const text = res.text
        if (!text) throw new Error('Empty response')
        return JSON.parse(text)
      } catch (error: any) {
        lastError = error
        console.warn(`[gemini] ${model} attempt ${attempt} failed:`, error?.status ?? '', error?.message)
        if (!isTransient(error)) break
        if (attempt < MAX_ATTEMPTS_PER_MODEL) await sleep(800)
      }
    }
  }

  console.error('[gemini] all models failed:', lastError)
  throw new Error('เซิร์ฟเวอร์ AI หนาแน่นชั่วคราว กรุณากดลองใหม่อีกครั้ง')
}

// ---------- Schemas ----------
const validCoord = (lat: number, lng: number) =>
  Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180

const PLACE_SCHEMA = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    description: { type: 'string' },
    cost: { type: 'string' },
    lat: { type: 'number' },
    lng: { type: 'number' },
  },
  required: ['name', 'description', 'cost', 'lat', 'lng'],
}

const HOTEL_SCHEMA = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    description: { type: 'string' },
    priceRange: { type: 'string' },
    pricePerNight: { type: 'integer' },
    lat: { type: 'number' },
    lng: { type: 'number' },
  },
  required: ['name', 'description', 'priceRange', 'pricePerNight', 'lat', 'lng'],
}

const PLAN_SCHEMA = {
  type: 'object',
  properties: {
    tripTitle: { type: 'string' },
    summary: { type: 'string' },
    itinerary: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          day: { type: 'integer' },
          title: { type: 'string' },
          estimatedCost: { type: 'integer' },
          places: { type: 'array', items: PLACE_SCHEMA },
        },
        required: ['day', 'title', 'estimatedCost', 'places'],
      },
    },
    hotels: { type: 'array', items: HOTEL_SCHEMA },
  },
  required: ['tripTitle', 'summary', 'itinerary', 'hotels'],
}

// ---------- Normalizers (กันข้อมูลจาก AI / ลูกค้าที่รูปแบบเพี้ยน) ----------
function toPlace(p: any): Place {
  return {
    name: String(p?.name ?? '').slice(0, 120),
    description: String(p?.description ?? '').slice(0, 200),
    cost: String(p?.cost ?? '').slice(0, 60),
    lat: Number(p?.lat),
    lng: Number(p?.lng),
  }
}

function toHotel(h: any): Hotel {
  return {
    name: String(h?.name ?? '').slice(0, 120),
    description: String(h?.description ?? '').slice(0, 200),
    priceRange: String(h?.priceRange ?? '').slice(0, 60),
    pricePerNight: Math.max(Number(h?.pricePerNight) || 0, 0),
    lat: Number(h?.lat),
    lng: Number(h?.lng),
  }
}

export function normalizePlan(raw: any): TripPlan {
  if (!raw || !Array.isArray(raw.itinerary)) throw new Error('AI ตอบกลับรูปแบบไม่ถูกต้อง กรุณาลองใหม่')
  return {
    tripTitle: String(raw.tripTitle ?? '').slice(0, 200),
    summary: String(raw.summary ?? '').slice(0, 600),
    itinerary: raw.itinerary.slice(0, MAX_DAYS).map((d: any, i: number) => ({
      day: Number(d?.day) || i + 1,
      title: String(d?.title ?? '').slice(0, 160),
      estimatedCost: Math.max(Number(d?.estimatedCost) || 0, 0),
      places: (Array.isArray(d?.places) ? d.places : [])
        .slice(0, 8)
        .map(toPlace)
        .filter((p: Place) => p.name && validCoord(p.lat, p.lng)),
    })),
    hotels: (Array.isArray(raw.hotels) ? raw.hotels : [])
      .slice(0, 6)
      .map(toHotel)
      .filter((h: Hotel) => h.name && validCoord(h.lat, h.lng)),
  }
}

// ---------- Prompt helpers ----------
const basics = (i: TravelPromptInput) =>
  `ปลายทาง: "${i.destination}" จำนวน ${i.days} วัน ผู้เดินทาง ${i.people} คน
งบ: ${i.budget}
สไตล์: ${i.style}`

const describePlan = (plan: TripPlan) =>
  plan.itinerary.map((d) => `วัน ${d.day} (${d.title}): ${d.places.map((p) => p.name).join(', ')}`).join('\n') +
  `\nที่พัก: ${plan.hotels.map((h) => h.name).join(', ')}`

const allNames = (plan: TripPlan) => [
  ...plan.itinerary.flatMap((d) => d.places.map((p) => p.name)),
  ...plan.hotels.map((h) => h.name),
]

const RULES = `- lat/lng ต้องเป็นพิกัดจริงของสถานที่นั้น (ทศนิยม)
- description ไม่เกิน 10 คำ, cost สั้นๆ เช่น "ฟรี" หรือ "ประมาณ 150 บาท/คน"
- ค่าใช้จ่ายทั้งหมดต้องสมเหตุสมผลกับงบที่ให้ ตัวเลขเป็นการประมาณการ`

// ---------- 1) แผนเที่ยว + โรงแรม ----------
const CHUNK_DAYS = 7
const CHUNK_SCHEMA = {
  type: 'object',
  properties: { itinerary: PLAN_SCHEMA.properties.itinerary },
  required: ['itinerary'],
}

const PLAN_RULES = `- แต่ละวันมี 3-4 สถานที่ เรียงตามเส้นทางที่เดินทางต่อเนื่องได้
- estimatedCost = ค่ากิน เที่ยว และเดินทางในพื้นที่ต่อวัน รวมทั้งกลุ่ม (ไม่รวมที่พัก และไม่รวมการเดินทางจากต้นทาง) เป็นบาท`

const HOTEL_RULE = `- แนะนำที่พัก 3 แห่งที่มีอยู่จริง ราคาไม่เกินเพดานที่ให้ไว้ (ถ้ามี) pricePerNight เป็นบาทต่อคืน ทั้งห้อง`

export async function generateTravelPlan(input: TravelPromptInput): Promise<TripPlan> {
  // ทริปสั้น: เรียก AI ครั้งเดียว
  if (input.days <= CHUNK_DAYS) {
    const prompt = `
    คุณคือ AI วางแผนท่องเที่ยวในประเทศไทย สร้างแผนเที่ยว
    ${basics(input)}
    ${PLAN_RULES}
    ${HOTEL_RULE}
    ${RULES}
    ตอบเป็น JSON ตาม schema เท่านั้น`
    return normalizePlan(await callGemini(prompt, PLAN_SCHEMA))
  }

  // ทริปยาว: แบ่งเป็นช่วงละ 7 วัน ให้ AI สร้างพร้อมกัน แล้วนำมาต่อกัน (ไม่ให้หมดเวลา)
  const ranges: [number, number][] = []
  for (let s = 1; s <= input.days; s += CHUNK_DAYS) ranges.push([s, Math.min(s + CHUNK_DAYS - 1, input.days)])

  const results = await Promise.all(
    ranges.map(([from, to], idx) => {
      const first = idx === 0
      const prompt = `
      คุณคือ AI วางแผนท่องเที่ยวในประเทศไทย สร้างแผนเที่ยว
      ${basics(input)}
      ทริปนี้ยาว ${input.days} วัน ตอนนี้ให้สร้างเฉพาะ "วันที่ ${from} ถึงวันที่ ${to}" (${to - from + 1} วัน) ใส่ field day เป็นเลขวันจริงของทริป
      ช่วงอื่นของทริปมีการสร้างแยกกัน ให้เลือกสถานที่หลากหลาย กระจายไปตามช่วงเวลาของทริป ไม่เน้นที่เดียวซ้ำๆ
      ${PLAN_RULES}
      ${first ? HOTEL_RULE : '- ไม่ต้องแนะนำที่พักในช่วงนี้'}
      ${RULES}
      ตอบเป็น JSON ตาม schema เท่านั้น`
      return callGemini(prompt, first ? PLAN_SCHEMA : CHUNK_SCHEMA)
    })
  )

  // ต่อทุกช่วงเข้าด้วยกัน เรียงเลขวันใหม่ และตัดสถานที่ซ้ำข้ามช่วง
  const seen = new Set<string>()
  const itinerary = results
    .flatMap((r) => (Array.isArray(r?.itinerary) ? r.itinerary : []))
    .map((d: any, i: number) => ({
      ...d,
      day: i + 1,
      places: (Array.isArray(d?.places) ? d.places : []).filter((p: any) => {
        const key = String(p?.name ?? '').trim().toLowerCase()
        if (!key || seen.has(key)) return false
        seen.add(key)
        return true
      }),
    }))

  return normalizePlan({
    tripTitle: results[0]?.tripTitle,
    summary: results[0]?.summary,
    itinerary,
    hotels: results[0]?.hotels,
  })
}

// ---------- 2) ปรับแผนทั้งชุดตามที่ผู้ใช้บอก (คงสิ่งที่ชอบไว้) ----------
export async function refinePlan(
  input: TravelPromptInput,
  plan: TripPlan,
  instruction: string,
  likedNames: string[],
  rejectedNames: string[]
): Promise<TripPlan> {
  const prompt = `
คุณคือ AI วางแผนท่องเที่ยวในประเทศไทย ผู้ใช้ดูแผนนี้แล้วอยากปรับ
${basics(input)}

แผนปัจจุบัน:
${describePlan(plan)}

สิ่งที่ผู้ใช้ชอบ (ต้องคงไว้ในแผน): ${likedNames.length ? likedNames.join(', ') : 'ไม่มี'}
สิ่งที่ผู้ใช้ไม่ชอบ (ห้ามแนะนำอีก): ${rejectedNames.length ? rejectedNames.join(', ') : 'ไม่มี'}
คำขอปรับแผน: "${instruction}"

ให้ปรับแผนตามคำขอ จำนวนวันเท่าเดิม (${input.days} วัน) คงสถานที่ที่ชอบไว้ เปลี่ยนเฉพาะส่วนที่จำเป็น
แต่ละวันมี 3-4 สถานที่ เรียงตามเส้นทางที่เดินทางต่อเนื่องได้ แนะนำที่พัก 3 แห่ง
${RULES}
ตอบเป็น JSON ตาม schema เท่านั้น`

  return normalizePlan(await callGemini(prompt, PLAN_SCHEMA))
}

// ---------- 3) สลับสถานที่ 1 จุด ----------
export async function swapPlace(
  input: TravelPromptInput,
  plan: TripPlan,
  dayIdx: number,
  placeIdx: number,
  rejectedNames: string[]
): Promise<Place> {
  const day = plan.itinerary[dayIdx]
  const old = day?.places[placeIdx]
  if (!day || !old) throw new Error('ไม่พบสถานที่ที่ต้องการเปลี่ยน')

  const others = day.places.filter((_, i) => i !== placeIdx).map((p) => p.name)
  const prompt = `
คุณคือ AI วางแผนท่องเที่ยวในประเทศไทย ผู้ใช้ไม่ถูกใจ "${old.name}" ในวันที่ ${day.day} (${day.title})
${basics(input)}

แนะนำสถานที่ใหม่ 1 แห่งมาแทน โดย:
- อยู่ใกล้กับสถานที่อื่นของวันนั้น: ${others.length ? others.join(', ') : 'ไม่มี'}
- ห้ามซ้ำกับสถานที่เหล่านี้: ${[...allNames(plan), ...rejectedNames].join(', ')}
- เป็นประเภทที่ต่างออกไปเล็กน้อยจากของเดิม แต่ยังเข้ากับสไตล์และงบ
${RULES}
ตอบเป็น JSON ตาม schema เท่านั้น`

  const place = toPlace(await callGemini(prompt, PLACE_SCHEMA))
  if (!place.name || !validCoord(place.lat, place.lng)) throw new Error('AI ตอบกลับไม่ครบ กรุณาลองใหม่')
  return place
}

// ---------- 4) สลับโรงแรม 1 แห่ง ----------
export async function swapHotel(
  input: TravelPromptInput,
  plan: TripPlan,
  hotelIdx: number,
  rejectedNames: string[]
): Promise<Hotel> {
  const old = plan.hotels[hotelIdx]
  if (!old) throw new Error('ไม่พบที่พักที่ต้องการเปลี่ยน')

  const prompt = `
คุณคือ AI วางแผนท่องเที่ยวในประเทศไทย ผู้ใช้ไม่ถูกใจที่พัก "${old.name}"
${basics(input)}

แนะนำที่พักใหม่ 1 แห่งที่มีอยู่จริงมาแทน โดย:
- ราคาไม่เกินเพดานที่ให้ไว้ (ถ้ามี) pricePerNight เป็นบาทต่อคืน ทั้งห้อง
- อยู่ในพื้นที่ที่เดินทางไปสถานที่ในแผนได้สะดวก: ${plan.itinerary.flatMap((d) => d.places.map((p) => p.name)).slice(0, 8).join(', ')}
- ห้ามซ้ำกับ: ${[...allNames(plan), ...rejectedNames].join(', ')}
${RULES}
ตอบเป็น JSON ตาม schema เท่านั้น`

  const hotel = toHotel(await callGemini(prompt, HOTEL_SCHEMA))
  if (!hotel.name || !validCoord(hotel.lat, hotel.lng)) throw new Error('AI ตอบกลับไม่ครบ กรุณาลองใหม่')
  return hotel
}

// ---------- 5) เดินทางจากต้นทาง + เตรียมตัว ----------
export async function generateTravelGuide(input: TravelPromptInput): Promise<TripGuide> {
  const prompt = `
คุณคือผู้ช่วยเตรียมตัวเดินทางท่องเที่ยวในประเทศไทย
ผู้ใช้จะเดินทางจาก "${input.origin}" ไปยัง "${input.destination}" จำนวน ${input.days} วัน ผู้เดินทาง ${input.people} คน
งบ: ${input.budget}
สไตล์: ${input.style}
ให้ข้อมูล:
1) transportOptions: ตัวเลือกการเดินทางจากต้นทางไปปลายทาง 2-3 แบบ (เลือกเฉพาะที่เป็นไปได้จริงระหว่างสองที่นี้) แต่ละแบบมี mode, duration (เวลาโดยประมาณ), cost (ค่าใช้จ่ายโดยประมาณ เป็นบาทต่อคน), tip (คำแนะนำสั้นๆ)
2) packingList: ของที่ควรเตรียม 8-10 อย่าง ให้เหมาะกับสไตล์การเที่ยวและสภาพอากาศของปลายทาง
3) bookAhead: สิ่งที่ควรจองล่วงหน้า 3-5 อย่าง
ตัวเลขทั้งหมดเป็นการประมาณการ ตอบสั้นกระชับ ตอบเป็น JSON ตาม schema เท่านั้น`

  const schema = {
    type: 'object',
    properties: {
      transportOptions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            mode: { type: 'string' },
            duration: { type: 'string' },
            cost: { type: 'string' },
            tip: { type: 'string' },
          },
          required: ['mode', 'duration', 'cost', 'tip'],
        },
      },
      packingList: { type: 'array', items: { type: 'string' } },
      bookAhead: { type: 'array', items: { type: 'string' } },
    },
    required: ['transportOptions', 'packingList', 'bookAhead'],
  }

  const raw = await callGemini(prompt, schema)
  const strs = (a: any) => (Array.isArray(a) ? a.map((x) => String(x)).filter(Boolean) : [])
  return {
    transportOptions: (Array.isArray(raw?.transportOptions) ? raw.transportOptions : []).map((t: any) => ({
      mode: String(t?.mode ?? ''),
      duration: String(t?.duration ?? ''),
      cost: String(t?.cost ?? ''),
      tip: String(t?.tip ?? ''),
    })),
    packingList: strs(raw?.packingList),
    bookAhead: strs(raw?.bookAhead),
  }
}
