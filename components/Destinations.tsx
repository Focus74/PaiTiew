'use client'

import { DESTINATIONS } from '@/lib/destinations'

export default function Destinations({ onPick }: { onPick: (name: string) => void }) {
  return (
    <section id="inspire" aria-labelledby="inspire-heading" className="scroll-mt-6 pt-14 sm:pt-24">
      <div className="max-w-2xl">
        <h2 id="inspire-heading" className="font-display text-3xl sm:text-4xl leading-[1.35] font-medium text-ink">
          ปลายทางที่ใครๆ ก็อยากไปสักครั้ง
        </h2>
        <p className="mt-3 text-muted">แตะที่ไหนก็ได้ เราจะใส่ชื่อให้ในแบบฟอร์ม แล้วคุณแค่บอกงบกับสไตล์ที่ชอบ</p>
      </div>

      {/* มือถือ: เลื่อนแนวนอน / จอใหญ่: โมเสกการ์ดใหญ่หนึ่ง เล็กสี่ */}
      <div className="mt-8 flex gap-4 overflow-x-auto snap-x snap-mandatory -mx-5 px-5 scroll-pl-5 pb-3 [scrollbar-width:none] md:mx-0 md:px-0 md:pb-0 md:grid md:grid-cols-4 md:auto-rows-[minmax(190px,auto)] md:overflow-visible md:snap-none">
        {DESTINATIONS.map((d, i) => (
          <button
            key={d.name}
            type="button"
            onClick={() => onPick(d.name)}
            className={`group relative isolate shrink-0 w-[78%] sm:w-[52%] snap-center aspect-[5/4] md:w-auto md:aspect-auto overflow-hidden rounded-2xl text-left text-surface bg-gradient-to-br ${d.fallback} cursor-pointer ${
              i === 0 ? 'md:col-span-2 md:row-span-2' : ''
            }`}
          >
            <span className="absolute inset-0 -z-10 bg-[radial-gradient(80%_60%_at_85%_0%,rgba(255,255,255,0.18),transparent)] transition-opacity duration-500 group-hover:opacity-60" />
            <span className="absolute inset-x-0 bottom-0 block p-5 sm:p-6">
              <span className="block text-sm text-honey">{d.region}</span>
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
