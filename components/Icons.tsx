// ไอคอนเส้นบางแบบเรียบ (ไม่ต้องติดตั้งไลบรารีเพิ่ม)
type P = { className?: string }
const base = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

export const HeartIcon = ({ filled, className }: P & { filled?: boolean }) => (
  <svg {...base} className={className} fill={filled ? 'currentColor' : 'none'}>
    <path d="M12 20.5s-7.5-4.6-9.2-9.3C1.6 7.9 3.6 4.8 6.9 4.8c2 0 3.5 1.1 5.1 3 1.6-1.9 3.1-3 5.1-3 3.3 0 5.3 3.1 4.1 6.4-1.7 4.7-9.2 9.3-9.2 9.3z" />
  </svg>
)

export const SwapIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M4 8h13l-3-3" />
    <path d="M20 16H7l3 3" />
  </svg>
)

export const NavIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M20 4 4 11l7 2 2 7 7-16z" />
  </svg>
)

export const SearchIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4-4" />
  </svg>
)

export const BedIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M3 18V7M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5" />
    <circle cx="7" cy="11" r="1.6" />
  </svg>
)

export const PlusIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

export const MinusIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M5 12h14" />
  </svg>
)

export const SpinnerIcon = ({ className }: P) => (
  <svg {...base} className={`animate-spin ${className ?? ''}`}>
    <path d="M12 3a9 9 0 1 0 9 9" />
  </svg>
)
