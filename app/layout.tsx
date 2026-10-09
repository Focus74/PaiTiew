import type { Metadata } from "next";
import { IBM_Plex_Sans_Thai_Looped } from "next/font/google";
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className={`${plex.variable} h-full`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
