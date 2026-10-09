'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser, signInWithGoogle, signOut } from '@/lib/auth'

export default function AuthBar() {
  const { user, loading } = useUser()
  const pathname = usePathname()

  const navClass = (href: string) =>
    `pb-0.5 border-b-2 transition-colors ${
      pathname === href ? 'border-moss text-ink' : 'border-transparent text-muted hover:text-ink'
    }`

  return (
    <header className="flex items-center justify-between gap-4 py-5">
      <div className="flex items-baseline gap-6">
        <Link href="/" className="text-xl font-semibold tracking-tight text-ink">
          ไปเที่ยว
        </Link>
        <nav className="flex gap-5 text-sm font-medium">
          <Link href="/" className={navClass('/')}>สร้างทริป</Link>
          <Link href="/trips" className={navClass('/trips')}>ทริปของฉัน</Link>
        </nav>
      </div>

      <div className="flex items-center gap-3 text-sm">
        {loading ? null : user ? (
          <>
            <span className="hidden sm:inline text-muted max-w-[220px] truncate">{user.email}</span>
            <button
              onClick={signOut}
              className="px-4 py-1.5 rounded-full border border-line text-ink hover:bg-surface cursor-pointer"
            >
              ออกจากระบบ
            </button>
          </>
        ) : (
          <button
            onClick={signInWithGoogle}
            className="px-4 py-1.5 rounded-full bg-ink text-surface font-medium hover:bg-moss-deep cursor-pointer"
          >
            เข้าสู่ระบบด้วย Google
          </button>
        )}
      </div>
    </header>
  )
}
