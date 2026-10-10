'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { navigateUrl, searchUrl } from '@/lib/mapLinks'
import { dayColor } from '@/lib/dayColors'

export interface MapPlace {
  name: string
  description: string
  lat: number
  lng: number
  dayIndex?: number // สถานที่เที่ยว: วันที่ (เริ่ม 0)
  num?: number // ลำดับในวันนั้น (เริ่ม 1)
  priceText?: string // โรงแรม
}

// สร้างไอคอนครั้งเดียวต่อสี+เลข ไม่สร้างซ้ำทุกครั้งที่ render (กันหมุดกะพริบ)
const iconCache: Record<string, L.DivIcon> = {}

function numberIcon(color: string, num: number) {
  const key = `${color}-${num}`
  if (!iconCache[key]) {
    iconCache[key] = L.divIcon({
      className: '',
      html: `<div style="width:28px;height:28px;border-radius:50%;background:${color};color:#fff;font:600 13px system-ui,sans-serif;display:flex;align-items:center;justify-content:center;border:2px solid #faf9f6;box-shadow:0 1px 5px rgba(35,43,39,.35)">${num}</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -14],
    })
  }
  return iconCache[key]
}

const hotelIcon = L.divIcon({
  className: '',
  html: `<div style="width:30px;height:30px;border-radius:9px;background:#d9a441;color:#fff;display:flex;align-items:center;justify-content:center;border:2px solid #faf9f6;box-shadow:0 1px 5px rgba(35,43,39,.35)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18V7M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5"/><circle cx="7" cy="11" r="1.6"/></svg></div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15],
})

// MapContainer ล็อก center ตอนสร้างครั้งแรก → ต้องสั่ง fitBounds เองทุกครั้งที่หมุดเปลี่ยน
function FitBounds({ points }: { points: MapPlace[] }) {
  const map = useMap()
  useEffect(() => {
    if (points.length === 0) return
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]))
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 })
  }, [points, map])
  return null
}

const btn = 'inline-block mt-2 mr-2 px-3 py-1.5 rounded-full text-xs font-medium no-underline'

interface Props {
  places: MapPlace[]
  hotels?: MapPlace[]
  area?: string
  className?: string
}

export default function TripMap({ places, hotels = [], area = '', className = 'h-[360px]' }: Props) {
  const all = [...places, ...hotels]

  // Next.js 16 (cacheComponents) ซ่อน/แสดงหน้าเดิมซ้ำตอนสลับหน้า ทำให้ effect ถูก cleanup แล้วรันใหม่
  // แผนที่ Leaflet ที่ถูกทำลายไปแล้วจะใช้ซ้ำไม่ได้ → สร้างแผนที่ใหม่ทุกครั้งที่หน้ากลับมาแสดง
  const [show, setShow] = useState(false)
  useEffect(() => {
    setShow(true)
    return () => setShow(false)
  }, [])

  return (
    <div className={`isolate w-full ${className} rounded-2xl overflow-hidden border border-line bg-paper`}>
      {show && (
        <MapContainer center={[13.7563, 100.5018]} zoom={6} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            className="soft-tiles"
            maxZoom={19}
          />
          <FitBounds points={all} />

          {places.map((p, i) => (
            <Marker
              key={`place-${p.name}-${i}`}
              position={[p.lat, p.lng]}
              icon={numberIcon(dayColor(p.dayIndex ?? 0), p.num ?? i + 1)}
            >
              <Popup>
                <div>
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-sm text-muted">{p.description}</div>
                  <a
                    href={navigateUrl(p.name, area)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={btn}
                    style={{ background: '#3e6a58', color: '#fff' }}
                  >
                    นำทาง
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}

          {hotels.map((h, i) => (
            <Marker key={`hotel-${h.name}-${i}`} position={[h.lat, h.lng]} icon={hotelIcon}>
              <Popup>
                <div>
                  <div className="text-xs font-medium" style={{ color: '#a97a1d' }}>ที่พัก</div>
                  <div className="font-semibold">{h.name}</div>
                  <div className="text-sm text-muted">{h.description}</div>
                  {h.priceText && <div className="text-sm">{h.priceText}</div>}
                  <a
                    href={navigateUrl(h.name, area)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={btn}
                    style={{ background: '#3e6a58', color: '#fff' }}
                  >
                    นำทาง
                  </a>
                  <a
                    href={searchUrl(h.name, area)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={btn}
                    style={{ background: '#e8e7e0', color: '#232b27' }}
                  >
                    ตรวจสอบ
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
    </div>
  )
}
