// ฟังก์ชันส่งข้อความผ่านบอท Telegram (ใช้ฝั่งเซิร์ฟเวอร์)
export const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export async function sendTelegram(chatId: number | string, html: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) throw new Error('ยังไม่ได้ตั้งค่า TELEGRAM_BOT_TOKEN')
  const text = html.length > 4000 ? html.slice(0, 3990) + '…' : html
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      link_preview_options: { is_disabled: true },
    }),
  })
  if (!res.ok) throw new Error('Telegram ตอบกลับ ' + res.status + ' ' + (await res.text()).slice(0, 200))
}
