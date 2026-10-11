'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser, signInWithGoogle, signOut } from '@/lib/auth'

// tone="light" ใช้ซ้อนบนรูปพื้นเข้ม (หน้าแรก) / tone="dark" ใช้บนพื้นอ่อน (หน้าอื่น)
export default function AuthBar({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  const { user, loading } = useUser()
  const pathname = usePathname()
  const light = tone === 'light'

  const navClass = (href: string) => {
    const active = pathname === href
    const color = light
      ? active ? 'border-honey text-white' : 'border-transparent text-white/70 hover:text-white'
      : active ? 'border-moss text-ink' : 'border-transparent text-muted hover:text-ink'
    return `py-2 border-b-2 transition-colors ${color}`
  }

  // มือถือ: แถวบน = โลโก้ + ปุ่มล็อกอิน, แถวล่าง = เมนู (ไม่ให้แน่นจนล้นจอ)
  return (
    <header className="flex flex-wrap items-center gap-x-6 gap-y-1 py-4 sm:py-5">
      <Link href="/" className={`font-display text-2xl font-medium tracking-tight py-1 ${light ? 'text-white' : 'text-ink'}`}>
        <span aria-hidden="true" className="mr-1.5 text-[#ffb36b]">✦</span>ไปเที่ยว
      </Link>

      <nav className="order-last w-full sm:order-none sm:w-auto flex gap-6 text-sm font-medium">
        <Link href="/" className={navClass('/')}>สร้างทริป</Link>
        <Link href="/trips" className={navClass('/trips')}>ทริปของฉัน</Link>
      </nav>

      <div className="ml-auto flex items-center gap-3 text-sm">
        {loading ? null : user ? (
          <>
            <span className={`hidden sm:inline max-w-[220px] truncate ${light ? 'text-surface/70' : 'text-muted'}`}>{user.email}</span>
            <button
              onClick={signOut}
              className={`px-4 py-2 rounded-full border cursor-pointer ${
                light ? 'border-white/40 bg-white/10 backdrop-blur-md text-white hover:bg-white/20' : 'glass text-ink hover:bg-white'
              }`}
            >
              ออกจากระบบ
            </button>
          </>
        ) : (
          <button
            onClick={signInWithGoogle}
            className={`px-4 py-2 rounded-full font-medium cursor-pointer ${
              light ? 'bg-white/90 text-ink hover:bg-white shadow-[0_8px_24px_-8px_rgba(255,255,255,0.5)]' : 'glass text-ink hover:bg-white'
            }`}
          >
            <span className="sm:hidden">เข้าสู่ระบบ</span>
            <span className="hidden sm:inline">เข้าสู่ระบบด้วย Google</span>
          </button>
        )}
      </div>
    </header>
  )
}
