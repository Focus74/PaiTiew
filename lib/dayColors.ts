// สีประจำวัน ใช้ทั้งในรายการและหมุดบนแผนที่ เพื่อให้รู้ว่าหมุดไหนเป็นของวันไหน
export const DAY_COLORS = ['#3e6a58', '#4a6b8f', '#8a5a7a', '#b5793a', '#4f8686', '#7a6b4f', '#9a5b52']
export const dayColor = (dayIndex: number) => DAY_COLORS[dayIndex % DAY_COLORS.length]
