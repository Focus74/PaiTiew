// ลิงก์ Google Maps (ไม่ต้องใช้ API key) — แยกไฟล์เพื่อไม่ให้ page.tsx ไปโหลด Leaflet ฝั่งเซิร์ฟเวอร์
// นำทางด้วย "ชื่อสถานที่ + จังหวัด" เพราะพิกัดที่ AI ให้มามักคลาดเคลื่อน แต่ Google ค้นชื่อได้แม่นกว่า
export const navigateUrl = (name: string, area: string) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${name} ${area}`.trim())}&travelmode=driving`

export const searchUrl = (name: string, area = '') =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${area}`.trim())}`
