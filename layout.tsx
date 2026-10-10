import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Thai_Looped, Noto_Serif_Thai } from "next/font/google";
import "./globals.css";

// ตัวอักษรไทยแบบมีหัว (Looped) ให้ความรู้สึกเป็นมิตรและทันสมัย
const plex = IBM_Plex_Sans_Thai_Looped({
  variable: "--font-plex",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "ไปเที่ยว | PaiTiew",
  description: "วางแผนเที่ยวไทยตามงบและสไตล์ของคุณ ปรับแผนได้จนกว่าจะถูกใจ",
};

// ตัวอักษรมีเชิง (Serif) สำหรับหัวข้อ ให้ความรู้สึกเป็นนิตยสารท่องเที่ยวหรูๆ
const serif = Noto_Serif_Thai({
  variable: "--font-serif-th",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600"],
});

// viewport-fit=cover ทำให้ใช้ safe-area (รอยบาก/แถบด้านล่างของ iPhone) ได้ ไม่ล็อกการซูมเพื่อการเข้าถึง
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f0efea",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className={`${plex.variable} ${serif.variable} h-full`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
