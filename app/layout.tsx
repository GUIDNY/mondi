import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export const metadata: Metadata = {
  title: "mondi | ניחושי תוצאות כדורגל 2026",
  description: "ניחשו תוצאות משחקי כדורגל 2026, צברו נקודות, נצחו את החברים!",
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Mondi",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        {/* iOS safe area + viewport */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#061209" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&family=Rubik:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Navbar />
        <div className="page-shell">
          <div className="page-inner">{children}</div>
          <footer style={{
            textAlign: "center", padding: "1.5rem 1rem",
            borderTop: "1px solid rgba(255,255,255,0.05)",
            display: "flex", gap: "1.5rem", justifyContent: "center", flexWrap: "wrap",
          }}>
            <Link href="/privacy" style={{ color: "var(--on-surface-variant)", fontSize: "0.72rem", textDecoration: "none" }}>
              מדיניות פרטיות
            </Link>
            <Link href="/terms" style={{ color: "var(--on-surface-variant)", fontSize: "0.72rem", textDecoration: "none" }}>
              תנאי שימוש
            </Link>
            <span style={{ color: "var(--on-surface-variant)", fontSize: "0.72rem" }}>
              © 2026 Mondi
            </span>
          </footer>
        </div>
      </body>
    </html>
  );
}
