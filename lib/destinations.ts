// ปลายทางเด่นที่โชว์หน้าแรก: เพิ่ม/แก้ได้ที่นี่
export interface Destination {
  name: string // ชื่อที่จะเติมลงช่อง "อยากไปที่ไหน"
  region: string
  tagline: string
  fallback: string // สีพื้นหลังของการ์ด
}

export const DESTINATIONS: Destination[] = [
  {
    name: 'เชียงใหม่',
    region: 'ภาคเหนือ',
    tagline: 'เมืองเก่า ดอยสูง และคาเฟ่ท่ามกลางหมอกยามเช้า',
    fallback: 'from-[#2f5344] to-[#17231e]',
  },
  {
    name: 'ภูเก็ต',
    region: 'ทะเลอันดามัน',
    tagline: 'หาดทรายขาวและพระอาทิตย์ตกริมทะเล',
    fallback: 'from-[#2c6471] to-[#14262c]',
  },
  {
    name: 'กรุงเทพฯ',
    region: 'เมืองหลวง',
    tagline: 'วัดอรุณยามเย็น และอาหารริมแม่น้ำเจ้าพระยา',
    fallback: 'from-[#8a6a2a] to-[#2a2216]',
  },
  {
    name: 'กระบี่',
    region: 'ทะเลอันดามัน',
    tagline: 'หน้าผาหินปูนและน้ำทะเลสีมรกต',
    fallback: 'from-[#2f7a72] to-[#12292a]',
  },
  {
    name: 'น่าน',
    region: 'ภาคเหนือ',
    tagline: 'เมืองเล็กสงบ ล้อมด้วยภูเขาและวัดเก่าแก่',
    fallback: 'from-[#5b6b3c] to-[#1c2314]',
  },
]
