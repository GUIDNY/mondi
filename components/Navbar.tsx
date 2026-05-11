"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

interface Session {
  userId: number;
  username: string;
  isAdmin: boolean;
}

const NAV = [
  { href: "/", label: "לוח ראשי", icon: "home" },
  { href: "/predictions", label: "הניחושים שלי", icon: "sports_soccer" },
  { href: "/leaderboard", label: "טבלת דירוג", icon: "leaderboard" },
];

const ADMIN_NAV = { href: "/admin", label: "ניהול", icon: "admin_panel_settings" };

function Icon({ name, size = 22 }: { name: string; size?: number }) {
  return (
    <span
      className="material-symbols-outlined"
      style={{ fontSize: size, lineHeight: 1, userSelect: "none" }}
    >
      {name}
    </span>
  );
}

export default function Navbar() {
  const [session, setSession] = useState<Session | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setSession(d?.userId ? d : null));
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setSession(null);
    router.push("/");
    router.refresh();
  }

  const navItems = session?.isAdmin ? [...NAV, ADMIN_NAV] : NAV;
  const mobileItems = [
    { href: "/", label: "ראשי", icon: "home" },
    { href: "/predictions", label: "ניחושים", icon: "sports_soccer" },
    { href: "/leaderboard", label: "דירוג", icon: "leaderboard" },
    ...(session?.isAdmin
      ? [{ href: "/admin", label: "ניהול", icon: "admin_panel_settings" }]
      : [{ href: "/login", label: session ? "חשבון" : "כניסה", icon: "person" }]),
  ];

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside className="sidebar">
        {/* Logo */}
        <div style={{ padding: "1.5rem 1.25rem 1.75rem" }}>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.65rem" }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: "linear-gradient(135deg,#4ade80,#22c55e)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.25rem", flexShrink: 0,
            }}>⚽</div>
            <div>
              <div style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 800, fontSize: "1.05rem", color: "var(--text)", letterSpacing: "-0.02em" }}>
                מונדיאל
              </div>
              <div style={{ fontSize: "0.68rem", color: "var(--green)", fontWeight: 700, letterSpacing: "0.08em" }}>
                2026
              </div>
            </div>
          </Link>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: "0 0.75rem", display: "flex", flexDirection: "column", gap: "0.2rem" }}>
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} style={{
                display: "flex", alignItems: "center", gap: "0.7rem",
                padding: "0.65rem 0.9rem", borderRadius: 10, textDecoration: "none",
                background: active ? "var(--green-dim)" : "transparent",
                color: active ? "var(--green)" : "var(--muted)",
                fontWeight: active ? 600 : 400, fontSize: "0.88rem",
                borderRight: active ? "2px solid var(--green)" : "2px solid transparent",
                transition: "all 0.15s",
              }}>
                <Icon name={item.icon} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div style={{ padding: "1rem 0.75rem", borderTop: "1px solid var(--border)" }}>
          {session ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", padding: "0.5rem 0.75rem", marginBottom: "0.25rem" }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: "linear-gradient(135deg,#4ade80,#22c55e)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.85rem", fontWeight: 800, color: "#0d1a10", flexShrink: 0,
                }}>
                  {session.username[0]?.toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.85rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {session.username}
                  </div>
                  {session.isAdmin && (
                    <div style={{ fontSize: "0.68rem", color: "var(--green)", fontWeight: 600 }}>מנהל</div>
                  )}
                </div>
              </div>
              <button onClick={logout} style={{
                display: "flex", alignItems: "center", gap: "0.5rem",
                width: "100%", padding: "0.55rem 0.75rem", borderRadius: 8,
                border: "none", background: "transparent", color: "var(--muted)",
                cursor: "pointer", fontSize: "0.83rem", fontFamily: "inherit",
              }}>
                <Icon name="logout" size={18} />
                יציאה
              </button>
            </>
          ) : (
            <Link href="/login" style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
              padding: "0.65rem", borderRadius: 10, textDecoration: "none",
              background: "var(--green)", color: "#0d1a10", fontWeight: 700, fontSize: "0.88rem",
            }}>
              <Icon name="login" size={18} />
              כניסה / הרשמה
            </Link>
          )}
        </div>
      </aside>

      {/* ── Mobile Top Bar ── */}
      <header className="topbar">
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "1.2rem" }}>⚽</span>
          <span style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 800, fontSize: "0.95rem", color: "var(--green)" }}>
            מונדיאל 2026
          </span>
        </Link>
        {session ? (
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "linear-gradient(135deg,#4ade80,#22c55e)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.85rem", fontWeight: 800, color: "#0d1a10",
          }}>
            {session.username[0]?.toUpperCase()}
          </div>
        ) : (
          <Link href="/login" style={{
            background: "var(--green)", color: "#0d1a10", fontWeight: 700,
            padding: "6px 14px", borderRadius: 8, textDecoration: "none", fontSize: "0.82rem",
          }}>כניסה</Link>
        )}
      </header>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="bottomnav">
        {mobileItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: "2px",
              textDecoration: "none", color: active ? "var(--green)" : "var(--muted)",
              fontSize: "0.62rem", fontWeight: active ? 600 : 400,
              flex: 1, padding: "8px 0",
            }}>
              <Icon name={item.icon} size={active ? 24 : 22} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
