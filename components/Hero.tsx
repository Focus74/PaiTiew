import AuthBar from '@/components/AuthBar'
import Sparkle from '@/components/Sparkle'

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden night-sky text-white [mask-image:linear-gradient(to_bottom,black_82%,transparent)] [-webkit-mask-image:linear-gradient(to_bottom,black_82%,transparent)]">
      {/* ดาวระยิบระยับ */}
      <div className="night-stars absolute inset-0 -z-10" aria-hidden="true" />

      {/* ลูกแก้วแสงลอยช้าๆ */}
      <div aria-hidden="true" className="drift absolute -z-10 -left-24 top-24 h-72 w-72 rounded-full bg-[#7aa8ff]/30 blur-3xl" />
      <div aria-hidden="true" className="drift absolute -z-10 right-[8%] top-[38%] h-64 w-64 rounded-full bg-[#ff9ad0]/30 blur-3xl [animation-delay:-4s]" />
      <div aria-hidden="true" className="drift absolute -z-10 left-[38%] -bottom-24 h-72 w-72 rounded-full bg-[#9fe8d4]/25 blur-3xl [animation-delay:-8s]" />

      {/* พระจันทร์เสี้ยวเรืองแสง */}
      <svg
        aria-hidden="true"
        viewBox="0 0 100 100"
        className="float-y absolute -z-10 right-[6%] top-24 sm:top-28 h-20 w-20 sm:h-32 sm:w-32 drop-shadow-[0_0_28px_rgba(255,214,165,0.75)]"
      >
        <defs>
          <linearGradient id="moon" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff6df" />
            <stop offset="1" stopColor="#ffc9a0" />
          </linearGradient>
        </defs>
        <path d="M64 8A42 42 0 1 0 92 70 34 34 0 0 1 64 8z" fill="url(#moon)" />
      </svg>

      {/* ประกายดาวกระจายรอบหัวข้อ */}
      <Sparkle className="sparkle absolute -z-10 left-[10%] top-[34%] h-4 w-4 text-[#ffe0b8]" />
      <Sparkle className="sparkle absolute -z-10 left-[56%] top-[22%] h-3 w-3 text-white [animation-delay:-1.2s]" />
      <Sparkle className="sparkle absolute -z-10 right-[22%] top-[58%] h-5 w-5 text-[#ffb3dc] [animation-delay:-2.2s]" />
      <Sparkle className="sparkle absolute -z-10 left-[24%] bottom-[18%] h-3 w-3 text-[#b8d4ff] [animation-delay:-0.6s]" />

      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <AuthBar tone="light" />

        <div className="pt-14 pb-28 sm:pt-24 sm:pb-40 max-w-3xl">
          <p className="fade-up inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm text-white/90 backdrop-blur-md">
            <Sparkle className="h-3.5 w-3.5 text-[#ffe0b8]" />
            ไกด์ส่วนตัวที่ขับเคลื่อนด้วย AI
          </p>

          <h1 className="fade-up mt-6 font-display text-[2rem] leading-[1.4] sm:text-6xl sm:leading-[1.3] font-medium tracking-tight [text-wrap:balance] [animation-delay:0.1s]">
            บอกแค่ว่าอยากไปไหน
            <br />
            <span className="text-aurora">ที่เหลือให้เวทมนตร์จัดให้</span>
          </h1>
          <p className="fade-up mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-white/85 [animation-delay:0.2s]">
            แผนรายวัน ที่พัก แผนที่ และงบประมาณ ครบในไม่กี่วินาที
            ไม่ถูกใจตรงไหนก็ปรับได้จนกว่าจะใช่ เหมือนมีไกด์ท้องถิ่นอยู่ในกระเป๋า
          </p>

          <div className="fade-up mt-10 flex flex-wrap items-center gap-3 [animation-delay:0.3s]">
            <a
              href="#plan-form"
              className="px-7 py-3.5 rounded-full bg-gradient-to-r from-[#ffd9a8] via-[#ffb8dc] to-[#c9b8ff] text-ink font-semibold shadow-[0_10px_34px_-8px_rgba(255,170,214,0.8)] hover:brightness-105 hover:-translate-y-0.5 transition"
            >
              ✦ เริ่มวางแผนทริป
            </a>
            <a
              href="#inspire"
              className="px-7 py-3.5 rounded-full border border-white/40 bg-white/10 backdrop-blur-md text-white font-medium hover:bg-white/20 transition-colors"
            >
              ดูปลายทางแนะนำ
            </a>
          </div>
          <p className="fade-up mt-5 text-sm text-white/70 [animation-delay:0.4s]">ไม่ต้องสมัครก็เริ่มได้ และปรับแผนได้ไม่จำกัด</p>
        </div>
      </div>
    </section>
  )
}
