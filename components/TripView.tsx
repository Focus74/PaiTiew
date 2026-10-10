'use client'

import dynamic from 'next/dynamic'
import { useState, type ReactNode } from 'react'
import { navigateUrl, searchUrl } from '@/lib/mapLinks'
import { dayColor } from '@/lib/dayColors'
import { useMediaQuery } from '@/lib/useMediaQuery'
import { BedIcon, HeartIcon, MapIcon, NavIcon, SearchIcon, SpinnerIcon, SwapIcon } from '@/components/Icons'
import type { TripPlan, TripGuide } from '@/lib/types'

const TripMap = dynamic(() => import('@/components/Map'), { ssr: false })

// ถ้าส่ง editable มา จะมีปุ่มหัวใจ (เก็บไว้) และปุ่มสลับ (เปลี่ยนจุดนั้น) ถ้าไม่ส่ง = ดูอย่างเดียว
export interface Editable {
  liked: string[]
  swappingKey: string | null
  onToggleLike: (name: string) => void
  onSwap: (kind: 'place' | 'hotel', dayIndex: number, index: number) => void
}

interface Props {
  plan: TripPlan
  guide: TripGuide | null
  area: string // จุดหมาย (ใช้ต่อท้ายชื่อสถานที่เวลานำทาง/ค้นหา)
  origin?: string | null
  days: number
  budgetTotal?: number | null
  editable?: Editable
  afterHotels?: ReactNode // เช่น แผงถามว่าชอบแผนไหม
}

const baht = (n: number) => `฿${Math.round(n).toLocaleString('en-US')}`

function IconBtn({
  label,
  onClick,
  href,
  active,
  busy,
  children,
}: {
  label: string
  onClick?: () => void
  href?: string
  active?: boolean
  busy?: boolean
  children: ReactNode
}) {
  const cls = `h-11 w-11 sm:h-9 sm:w-9 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
    active ? 'bg-moss-soft text-moss-deep' : 'text-muted hover:bg-moss-soft hover:text-moss-deep'
  }`
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls} aria-label={label} title={label}>
        {children}
      </a>
    )
  }
  return (
    <button type="button" onClick={onClick} disabled={busy} className={cls} aria-label={label} title={label} aria-pressed={active}>
      {busy ? <SpinnerIcon /> : children}
    </button>
  )
}

export default function TripView({ plan, guide, area, origin, days, budgetTotal, editable, afterHotels }: Props) {
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const liked = editable?.liked ?? []
  const [mapOpen, setMapOpen] = useState(false)

  // ---------- ประมาณการค่าใช้จ่าย ----------
  const nights = Math.max(days - 1, 0)
  const activities = plan.itinerary.reduce((s, d) => s + (d.estimatedCost || 0), 0)
  const hotelBasis = plan.hotels.find((h) => liked.includes(h.name)) ?? plan.hotels[0]
  const hotelTotal = (hotelBasis?.pricePerNight || 0) * nights
  const estimate = activities + hotelTotal
  const ratio = budgetTotal ? estimate / budgetTotal : 0

  // ---------- ข้อมูลแผนที่ ----------
  const mapPlaces = plan.itinerary.flatMap((d, di) =>
    d.places.map((p, pi) => ({ ...p, dayIndex: di, num: pi + 1 }))
  )
  const mapHotels = plan.hotels.map((h) => ({
    name: h.name,
    description: h.description,
    lat: h.lat,
    lng: h.lng,
    priceText: h.priceRange,
  }))

  const map = (className: string) => (
    <TripMap places={mapPlaces} hotels={mapHotels} area={area} className={className} />
  )

  return (
    <div className="grid gap-8 sm:gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] items-start">
      <div className="min-w-0 space-y-10 sm:space-y-12">
        {/* ชื่อทริป + งบ */}
        <section className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-semibold leading-tight tracking-tight text-ink">{plan.tripTitle}</h2>
          <p className="text-muted max-w-prose">{plan.summary}</p>

          {estimate > 0 && (
            <div className="rounded-2xl bg-moss-soft/60 p-4 space-y-2.5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                <p className="text-ink">
                  ค่าใช้จ่ายโดยประมาณ <span className="text-xl font-semibold">{baht(estimate)}</span>
                  {budgetTotal ? <span className="text-muted"> จากงบ {baht(budgetTotal)}</span> : null}
                </p>
                <p className="text-xs text-muted">
                  กิน-เที่ยว {baht(activities)}
                  {hotelTotal > 0 ? ` และที่พัก ${baht(hotelTotal)} (${nights} คืน)` : ''}
                </p>
              </div>
              {budgetTotal ? (
                <>
                  <div className="h-2 rounded-full bg-surface overflow-hidden" role="img" aria-label={`ใช้ไปประมาณ ${Math.round(ratio * 100)}% ของงบ`}>
                    <div
                      className={`h-full rounded-full ${ratio > 1 ? 'bg-danger' : 'bg-moss'}`}
                      style={{ width: `${Math.min(ratio, 1) * 100}%` }}
                    />
                  </div>
                  {ratio > 1 && (
                    <p className="text-xs text-danger">เกินงบประมาณ ลองกด &quot;ประหยัดขึ้น&quot; ด้านล่างเพื่อให้ปรับแผน</p>
                  )}
                </>
              ) : null}
              <p className="text-xs text-muted">เป็นตัวเลขประมาณการจาก AI ไม่รวมการเดินทางจากต้นทาง ควรเช็กราคาจริงก่อนจอง</p>
            </div>
          )}
        </section>

        {/* แผนที่ (มือถือ): ซ่อนไว้ก่อน กดเปิดเมื่ออยากดู จะได้เลื่อนอ่านแผนได้ไม่ติดแผนที่ */}
        {!isDesktop && (
          <section aria-label="แผนที่" className="space-y-3">
            <button
              type="button"
              onClick={() => setMapOpen((o) => !o)}
              aria-expanded={mapOpen}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-full border border-line bg-surface text-ink text-sm font-medium cursor-pointer hover:border-moss"
            >
              <MapIcon />
              {mapOpen ? 'ซ่อนแผนที่' : 'ดูแผนที่ทริป'}
            </button>
            {mapOpen && map('h-[60dvh] min-h-[320px]')}
          </section>
        )}

        {/* ตารางเที่ยว */}
        <section className="space-y-8" aria-label="แผนรายวัน">
          {plan.itinerary.map((day, di) => (
            <div key={day.day}>
              <div className="sticky top-0 z-10 -mx-5 px-5 sm:mx-0 sm:px-0 pt-2 flex flex-wrap items-baseline justify-between gap-2 pb-2 border-b border-line bg-paper/95 backdrop-blur-sm">
                <h3 className="flex items-baseline gap-3 min-w-0">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0 translate-y-[-1px]" style={{ background: dayColor(di) }} />
                  <span className="text-lg font-semibold text-ink">วันที่ {day.day}</span>
                  <span className="text-muted truncate">{day.title}</span>
                </h3>
                {day.estimatedCost > 0 && <span className="text-sm text-muted">ประมาณ {baht(day.estimatedCost)}</span>}
              </div>

              <ul className="divide-y divide-line/70">
                {day.places.map((place, pi) => {
                  const key = `p-${di}-${pi}`
                  const swapping = editable?.swappingKey === key
                  return (
                    <li
                      key={place.name}
                      className={`swap-in grid grid-cols-[1.5rem_minmax(0,1fr)] sm:grid-cols-[1.5rem_minmax(0,1fr)_auto] gap-x-3 py-3.5 ${swapping ? 'opacity-50' : ''}`}
                    >
                      <span
                        className="mt-0.5 h-6 w-6 rounded-full shrink-0 flex items-center justify-center text-xs font-semibold text-surface"
                        style={{ background: dayColor(di) }}
                      >
                        {pi + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-ink">{place.name}</p>
                        <p className="text-sm text-muted">{place.description}</p>
                        {place.cost && <p className="text-xs text-muted/90 mt-0.5">{place.cost}</p>}
                      </div>
                      <div className="col-start-2 sm:col-start-3 sm:row-start-1 flex -ml-2.5 mt-1 sm:ml-0 sm:mt-0 sm:-mr-1.5">
                        {editable && (
                          <>
                            <IconBtn
                              label={liked.includes(place.name) ? 'เลิกเก็บไว้' : 'ชอบ เก็บไว้ตอนปรับแผน'}
                              active={liked.includes(place.name)}
                              onClick={() => editable.onToggleLike(place.name)}
                            >
                              <HeartIcon filled={liked.includes(place.name)} />
                            </IconBtn>
                            <IconBtn label="ไม่ถูกใจ เปลี่ยนที่อื่น" busy={swapping} onClick={() => editable.onSwap('place', di, pi)}>
                              <SwapIcon />
                            </IconBtn>
                          </>
                        )}
                        <IconBtn label="นำทางด้วย Google Maps" href={navigateUrl(place.name, area)}>
                          <NavIcon />
                        </IconBtn>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </section>

        {/* ที่พัก */}
        {plan.hotels.length > 0 && (
          <section className="space-y-3" aria-label="ที่พัก">
            <div className="pb-2 border-b border-line">
              <h3 className="text-lg font-semibold text-ink">ที่พักแนะนำ</h3>
              <p className="text-xs text-muted">ราคาเป็นการประมาณการจาก AI กด &quot;ตรวจสอบ&quot; เพื่อดูข้อมูลจริงก่อนจอง</p>
            </div>
            <ul className="divide-y divide-line/70">
              {plan.hotels.map((h, hi) => {
                const key = `h-${hi}`
                const swapping = editable?.swappingKey === key
                return (
                  <li key={h.name} className={`swap-in grid grid-cols-[1.5rem_minmax(0,1fr)] sm:grid-cols-[1.5rem_minmax(0,1fr)_auto] gap-x-3 py-3.5 ${swapping ? 'opacity-50' : ''}`}>
                    <span className="mt-0.5 h-6 w-6 rounded-lg shrink-0 flex items-center justify-center bg-honey text-surface">
                      <BedIcon className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-ink">{h.name}</p>
                      <p className="text-sm text-muted">{h.description}</p>
                      <p className="text-sm text-ink mt-0.5">ประมาณ {h.priceRange}</p>
                    </div>
                    <div className="col-start-2 sm:col-start-3 sm:row-start-1 flex -ml-2.5 mt-1 sm:ml-0 sm:mt-0 sm:-mr-1.5">
                      {editable && (
                        <>
                          <IconBtn
                            label={liked.includes(h.name) ? 'เลิกเก็บไว้' : 'ชอบ เก็บไว้ตอนปรับแผน'}
                            active={liked.includes(h.name)}
                            onClick={() => editable.onToggleLike(h.name)}
                          >
                            <HeartIcon filled={liked.includes(h.name)} />
                          </IconBtn>
                          <IconBtn label="ไม่ถูกใจ เปลี่ยนที่พัก" busy={swapping} onClick={() => editable.onSwap('hotel', 0, hi)}>
                            <SwapIcon />
                          </IconBtn>
                        </>
                      )}
                      <IconBtn label="นำทางด้วย Google Maps" href={navigateUrl(h.name, area)}>
                        <NavIcon />
                      </IconBtn>
                      <IconBtn label="ตรวจสอบใน Google Maps" href={searchUrl(h.name, area)}>
                        <SearchIcon />
                      </IconBtn>
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        {afterHotels}

        {/* เตรียมตัว */}
        {guide && (
          <section className="space-y-5" aria-label="เตรียมตัวก่อนเดินทาง">
            <div className="pb-2 border-b border-line">
              <h3 className="text-lg font-semibold text-ink">เตรียมตัวก่อนออกเดินทาง</h3>
              <p className="text-xs text-muted">เวลาและค่าใช้จ่ายเป็นการประมาณการ ควรเช็กราคาจริงก่อนเดินทาง</p>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-ink">เดินทางจาก {origin}</p>
              <ul className="space-y-3">
                {guide.transportOptions.map((t, i) => (
                  <li key={i} className="text-sm">
                    <p className="text-ink">
                      <span className="font-medium">{t.mode}</span>
                      <span className="text-muted"> ใช้เวลา {t.duration} ค่าใช้จ่าย {t.cost}</span>
                    </p>
                    <p className="text-muted">{t.tip}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid gap-8 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-ink mb-2">ของที่ควรเตรียม</p>
                <ul className="list-disc pl-5 text-sm text-muted space-y-1 marker:text-moss">
                  {guide.packingList.map((x, i) => <li key={i}>{x}</li>)}
                </ul>
              </div>
              <div>
                <p className="text-sm font-medium text-ink mb-2">ควรจองล่วงหน้า</p>
                <ul className="list-disc pl-5 text-sm text-muted space-y-1 marker:text-moss">
                  {guide.bookAhead.map((x, i) => <li key={i}>{x}</li>)}
                </ul>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* แผนที่ (จอใหญ่ ติดอยู่ด้านขวาตอนเลื่อน) */}
      {isDesktop && (
        <aside className="sticky top-6" aria-label="แผนที่">
          {map('h-[calc(100vh-3rem)]')}
        </aside>
      )}
    </div>
  )
}
