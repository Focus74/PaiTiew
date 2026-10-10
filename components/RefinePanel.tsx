'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SpinnerIcon } from '@/components/Icons'

const QUICK = ['เพิ่มคาเฟ่', 'ประหยัดขึ้น', 'เดินทางน้อยลง', 'เน้นธรรมชาติ', 'ที่พักดีขึ้น', 'เพิ่มร้านอาหารท้องถิ่น']

interface Props {
  onSave: () => void
  saving: boolean
  saved: boolean
  loggedIn: boolean
  onRefine: (instruction: string) => void
  refining: boolean
}

export default function RefinePanel({ onSave, saving, saved, loggedIn, onRefine, refining }: Props) {
  const [text, setText] = useState('')

  const submit = (instruction: string) => {
    const t = instruction.trim()
    if (!t || refining) return
    onRefine(t)
    setText('')
  }

  return (
    <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6 space-y-5" aria-label="ปรับแผนและบันทึก">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-ink">ชอบแผนนี้ไหม</h3>
          <p className="text-sm text-muted">ถูกใจแล้วบันทึกไว้ได้เลย ยังไม่ใช่ก็ปรับต่อได้</p>
        </div>
        {saved ? (
          <Link href="/trips" className="px-5 py-3 rounded-full bg-moss-soft text-moss-deep text-sm font-medium">
            บันทึกแล้ว ดูในทริปของฉัน
          </Link>
        ) : (
          <button
            onClick={onSave}
            disabled={saving}
            className="px-5 py-3 rounded-full bg-moss hover:bg-moss-deep text-surface text-sm font-medium disabled:opacity-60 cursor-pointer"
          >
            {saving ? 'กำลังบันทึก' : loggedIn ? 'บันทึกทริปนี้' : 'เข้าสู่ระบบเพื่อบันทึก'}
          </button>
        )}
      </div>

      <div className="border-t border-line pt-5 space-y-3">
        <p className="text-sm text-ink">
          กดหัวใจที่สถานที่ที่ชอบเพื่อเก็บไว้ กดปุ่มสลับเพื่อเปลี่ยนเฉพาะที่นั้น หรือบอกสิ่งที่อยากปรับทั้งแผน
        </p>
        <div className="flex flex-wrap gap-2">
          {QUICK.map((q) => (
            <button
              key={q}
              onClick={() => submit(q)}
              disabled={refining}
              className="px-4 py-2 rounded-full text-sm border border-line bg-paper text-ink hover:border-moss disabled:opacity-50 cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            submit(text)
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={refining}
            placeholder="เช่น อยากได้ร้านซีฟู้ดเพิ่ม วันที่ 2 ไม่อยากขับรถไกล"
            className="flex-1 min-w-0 px-4 py-3 rounded-full border border-line bg-paper text-ink placeholder:text-muted/70 focus:border-moss outline-none"
          />
          <button
            type="submit"
            disabled={refining || !text.trim()}
            className="px-5 py-3 rounded-full bg-ink text-surface text-sm font-medium hover:bg-moss-deep disabled:opacity-50 cursor-pointer flex items-center gap-2 shrink-0"
          >
            {refining ? (
              <>
                <SpinnerIcon className="h-4 w-4" />
                <span>กำลังปรับ</span>
              </>
            ) : (
              'ปรับแผน'
            )}
          </button>
        </form>
      </div>
    </section>
  )
}
