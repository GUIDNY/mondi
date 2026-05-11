import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "מונדיאל 2026 - הימורים",
  description: "אתר הימורים לתוצאות מונדיאל 2026",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body className="min-h-screen flex flex-col" style={{ backgroundColor: "#0f172a", color: "#f1f5f9" }}>
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="text-center py-4" style={{ color: "#64748b", fontSize: "0.8rem" }}>
          מונדיאל 2026 🏆 ארה&quot;ב · מקסיקו · קנדה
        </footer>
      </body>
    </html>
  );
}
