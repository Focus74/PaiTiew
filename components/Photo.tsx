'use client'

// รูปที่ไม่พังถ้าไฟล์หาย: ถ้าโหลดไม่ได้จะซ่อนรูป ให้เห็นสีพื้นหลังของกล่องแม่แทน
export default function Photo({
  src,
  className = '',
  position = 'center',
}: {
  src: string
  className?: string
  position?: string
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      loading="lazy"
      decoding="async"
      style={{ objectPosition: position }}
      onError={(e) => {
        e.currentTarget.style.display = 'none'
      }}
      className={className}
    />
  )
}
