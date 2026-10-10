import AuthBar from '@/components/AuthBar'

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-moss-deep via-[#1c3329] to-ink text-surface">
      {/* แสงทองจางๆ มุมขวาบน ให้พื้นเข้มดูมีมิติ */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_55%_at_88%_12%,rgba(217,164,65,0.22),transparent)]" />

      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <AuthBar tone="light" />

        <div className="pt-16 pb-20 sm:pt-28 sm:pb-32 max-w-3xl">
          <h1 className="font-display text-[2.1rem] leading-[1.35] sm:text-6xl sm:leading-[1.3] font-medium tracking-tight">
            บอกแค่ว่าอยากไปไหน
            <br />
            ที่เหลือไกด์ส่วนตัวจัดให้
          </h1>
          <p className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-surface/85">
            แผนรายวัน ที่พัก แผนที่ และงบประมาณ ครบในไม่กี่วินาที
            ไม่ถูกใจตรงไหนก็ปรับได้จนกว่าจะใช่ เหมือนมีไกด์ท้องถิ่นอยู่ในกระเป๋า
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <a
              href="#plan-form"
              className="px-7 py-3.5 rounded-full bg-honey text-ink font-semibold hover:bg-honey-soft transition-colors"
            >
              เริ่มวางแผนทริป
            </a>
            <a
              href="#inspire"
              className="px-7 py-3.5 rounded-full border border-surface/50 text-surface font-medium hover:bg-surface/10 transition-colors"
            >
              ดูปลายทางแนะนำ
            </a>
          </div>
          <p className="mt-5 text-sm text-surface/70">ไม่ต้องสมัครก็เริ่มได้ และปรับแผนได้ไม่จำกัด</p>
        </div>
      </div>
    </section>
  )
}
