// สีประจำวัน ใช้ทั้งในรายการและหมุดบนแผนที่ เพื่อให้รู้ว่าหมุดไหนเป็นของวันไหน
export const DAY_COLORS = ['#6a58d6', '#3f8fd6', '#d8579a', '#c9761f', '#2fa58f', '#8a62d9', '#c0576a']
export const dayColor = (dayIndex: number) => DAY_COLORS[dayIndex % DAY_COLORS.length]
