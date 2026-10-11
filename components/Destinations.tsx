'use client'

import Photo from '@/components/Photo'
import { DESTINATIONS } from '@/lib/destinations'

export default function Destinations({ onPick }: { onPick: (name: string) => void }) {
  return (
    <section id="inspire" aria-labelledby="inspire-heading" className="scroll-mt-6 pt-14 sm:pt-24">
      <div className="max-w-2xl">
        <p className="mb-2 text-sm font-medium tracking-wide text-moss">✦ ปลายทางแนะนำ</p>
        <h2 id="inspire-heading" className="font-display text-3xl sm:text-4xl leading-[1.35] font-medium text-ink">
          ปลายทางที่ใครๆ ก็อยากไปสักครั้ง
        </h2>
        <p className="mt-3 text-muted">แตะที่ไหนก็ได้ เราจะใส่ชื่อให้ในแบบฟอร์ม แล้วคุณแค่บอกงบกับสไตล์ที่ชอบ</p>
      </div>

      {/* มือถือ: เลื่อนแนวนอน / จอใหญ่: โมเสกรูปใหญ่หนึ่ง เล็กสี่ */}
      <div className="mt-8 flex gap-4 overflow-x-auto snap-x snap-mandatory -mx-5 px-5 scroll-pl-5 pb-3 [scrollbar-width:none] md:mx-0 md:px-0 md:pb-0 md:grid md:grid-cols-4 md:auto-rows-[minmax(190px,auto)] md:overflow-visible md:snap-none">
        {DESTINATIONS.map((d, i) => (
          <button
            key={d.name}
            type="button"
            onClick={() => onPick(d.name)}
            className={`group relative isolate shrink-0 w-[78%] sm:w-[52%] snap-center aspect-[5/4] md:w-auto md:aspect-auto overflow-hidden rounded-3xl text-left text-surface ring-1 ring-white/70 shadow-[0_18px_50px_-18px_rgba(79,63,184,0.55)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_60px_-16px_rgba(138,91,224,0.75)] bg-gradient-to-br ${d.fallback} cursor-pointer ${
              i === 0 ? 'md:col-span-2 md:row-span-2' : ''
            }`}
          >
            <Photo
              src={d.image}
              position={d.position}
              className="absolute inset-0 -z-10 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* เฉดดำด้านล่าง ให้ตัวหนังสือสีขาวอ่านชัดบนรูปสว่าง */}
            <span className="absolute inset-0 -z-10 bg-gradient-to-t from-[#1a1450]/90 via-[#35278a]/35 via-45% to-transparent" />
            <span className="absolute inset-x-0 bottom-0 block p-5 sm:p-6">
              <span className="block text-sm text-[#ffd9a8]">{d.region}</span>
              <span className={`block font-display font-medium leading-tight ${i === 0 ? 'text-3xl md:text-4xl' : 'text-2xl'}`}>
                {d.name}
              </span>
              <span className="mt-1 block text-sm text-surface/85 max-w-xs">{d.tagline}</span>
              <span className="mt-3 inline-block text-sm font-medium border-b border-honey pb-0.5">วางแผนทริปที่นี่</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
