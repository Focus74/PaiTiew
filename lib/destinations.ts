// ปลายทางเด่นที่โชว์หน้าแรก: เพิ่ม/แก้ได้ที่นี่ รูปอยู่ที่ public/images/destinations/
export interface Destination {
  name: string // ชื่อที่จะเติมลงช่อง "อยากไปที่ไหน"
  region: string
  tagline: string
  image: string
  position?: string // จุดที่อยากให้อยู่กลางรูปตอนถูกครอป เช่น '68% center'
  fallback: string // สีพื้นหลังของการ์ด
}

export const DESTINATIONS: Destination[] = [
  {
    name: 'เชียงใหม่',
    region: 'ภาคเหนือ',
    tagline: 'เมืองเก่า ดอยสูง และคาเฟ่ท่ามกลางหมอกยามเช้า',
    image: '/images/destinations/chiangmai.webp',
    position: '68% center',
    fallback: 'from-[#2f5344] to-[#17231e]',
  },
  {
    name: 'ภูเก็ต',
    region: 'ทะเลอันดามัน',
    tagline: 'หาดทรายขาวและพระอาทิตย์ตกริมทะเล',
    image: '/images/destinations/phuket.webp',
    position: 'center',
    fallback: 'from-[#2c6471] to-[#14262c]',
  },
  {
    name: 'กรุงเทพฯ',
    region: 'เมืองหลวง',
    tagline: 'วัดอรุณยามเย็น และอาหารริมแม่น้ำเจ้าพระยา',
    image: '/images/destinations/bangkok.webp',
    position: 'center',
    fallback: 'from-[#8a6a2a] to-[#2a2216]',
  },
  {
    name: 'กระบี่',
    region: 'ทะเลอันดามัน',
    tagline: 'หน้าผาหินปูนและน้ำทะเลสีมรกต',
    image: '/images/destinations/krabi.webp',
    position: 'center',
    fallback: 'from-[#2f7a72] to-[#12292a]',
  },
  {
    name: 'น่าน',
    region: 'ภาคเหนือ',
    tagline: 'เมืองเล็กสงบ ล้อมด้วยภูเขาและวัดเก่าแก่',
    image: '/images/destinations/nan.webp',
    position: 'center',
    fallback: 'from-[#5b6b3c] to-[#1c2314]',
  },
]
