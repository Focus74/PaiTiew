// ประกายดาวสี่แฉก ใช้ประดับ (ไม่มีความหมายต่อการอ่าน จึงซ่อนจากโปรแกรมอ่านหน้าจอ)
export default function Sparkle({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} style={style} fill="currentColor">
      <path d="M12 0c.9 6.6 5.4 11.1 12 12-6.6.9-11.1 5.4-12 12-.9-6.6-5.4-11.1-12-12C6.6 11.1 11.1 6.6 12 0z" />
    </svg>
  )
}
