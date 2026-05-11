"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

interface Session {
  userId: number;
  username: string;
  isAdmin: boolean;
}

function Icon({ name, fill = 0, size = 24 }: { name: string; fill?: number; size?: number }) {
  return (
    <span
      className="material-symbols-outlined"
      style={{ fontSize: size, fontVariationSettings: `'FILL' ${fill}, 'wght' 400, 'GRAD' 0, 'opsz' 24` }}
    >
      {name}
    </span>
  );
}

const NAV_ITEMS = [
  { href: "/", label: "Live Lobby", labelHe: "לוח ראשי", icon: "sensors", exact: true },
  { href: "/predictions", label: "My Bets", labelHe: "הניחושים שלי", icon: "sports_soccer", exact: false },
  { href: "/leaderboard", label: "VIP Leaderboard", labelHe: "טבלת דירוג", icon: "military_tech", exact: false },
  { href: "/groups", label: "Groups", labelHe: "קבוצות", icon: "group", exact: false },
  { href: "/profile", label: "Profile", labelHe: "הפרופיל שלי", icon: "person", exact: false },
];
const ADMIN_ITEM = { href: "/admin", label: "Admin", labelHe: "ניהול", icon: "admin_panel_settings", exact: false };

export default function Navbar() {
  const [session, setSession] = useState<Session | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setSession(d?.userId ? d : null))
      .catch(() => setSession(null));
  }, [path]); // re-check on every navigation

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setSession(null);
    router.push("/");
    router.refresh();
  }

  const navItems = session?.isAdmin ? [...NAV_ITEMS, ADMIN_ITEM] : NAV_ITEMS;

  /* ── Top Header — RTL: logo on RIGHT, user on LEFT ── */
  const header = (
    <header style={{
      position: "fixed", top: 0, left: 0, right: 0, height: "var(--header-h)",
      background: "rgba(14,21,16,0.88)", backdropFilter: "blur(14px)",
      borderBottom: "1px solid rgba(61,74,64,0.22)",
      boxShadow: "0 0 20px rgba(92,222,151,0.08)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 1.25rem", zIndex: 300,
      direction: "rtl", /* RTL: first child → RIGHT, last child → LEFT */
    }}>
      {/* RIGHT side (start in RTL): logo + nav links */}
      <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <img src="/mondi-logo.svg" alt="mondi" style={{ width: 36, height: 36, borderRadius: 8 }} />
          <span style={{
            fontFamily: "'Arial Black', Montserrat, sans-serif", fontWeight: 900, fontSize: "1.4rem",
            background: "linear-gradient(135deg, #fff 0%, #ffe066 50%, #f0b429 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            direction: "ltr", display: "inline-block", letterSpacing: "0.02em",
          }}>
            mondi
          </span>
        </Link>
        <nav className="header-nav-links" style={{ display: "flex", gap: "1.5rem" }}>
          {navItems.map(item => {
            const active = item.exact ? path === item.href : path.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} style={{
                color: active ? "var(--primary)" : "var(--on-surface-variant)",
                fontSize: "0.78rem", fontWeight: active ? 600 : 400,
                textDecoration: "none",
                borderBottom: active ? "2px solid var(--primary)" : "2px solid transparent",
                paddingBottom: "2px",
                fontFamily: "Rubik,sans-serif",
              }}>
                {item.labelHe}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* LEFT side (end in RTL): user info + avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
        <span className="header-user-label"><Icon name="notifications" size={22} /></span>
        {session && (
          <div className="header-user-label" style={{ textAlign: "left" }}>
            <div style={{ fontSize: "0.58rem", color: "var(--on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.1em" }}>שחקן</div>
            <div style={{ fontFamily: "Rubik,sans-serif", fontWeight: 600, color: "var(--primary)", fontSize: "0.88rem" }}>
              {session.username}
            </div>
          </div>
        )}
        {session ? (
          <div style={{ position: "relative" }}>
            <button onClick={() => setMenuOpen(o => !o)} style={{
              width: 34, height: 34, borderRadius: "50%",
              background: "linear-gradient(135deg, var(--primary), #22c55e)",
              border: "1.5px solid rgba(92,222,151,0.35)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.9rem", fontWeight: 800, color: "var(--on-primary-container)",
              cursor: "pointer", fontFamily: "Rubik,sans-serif",
            }}>
              {session.username[0]?.toUpperCase()}
            </button>
            {menuOpen && (
              <>
                <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 399 }} />
                <div style={{
                  position: "absolute", top: "calc(100% + 8px)", left: 0,
                  background: "rgba(14,21,16,0.97)", backdropFilter: "blur(16px)",
                  border: "1px solid rgba(92,222,151,0.2)", borderRadius: 12,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.5)", zIndex: 400,
                  minWidth: 150, overflow: "hidden",
                }}>
                  <Link href="/profile" onClick={() => setMenuOpen(false)} style={{
                    display: "flex", alignItems: "center", gap: "0.6rem",
                    padding: "0.75rem 1rem", color: "var(--on-surface-variant)",
                    textDecoration: "none", fontSize: "0.85rem", fontFamily: "Rubik,sans-serif",
                    borderBottom: "1px solid rgba(92,222,151,0.1)",
                  }}>
                    <Icon name="person" size={18} /> הפרופיל שלי
                  </Link>
                  <button onClick={() => { setMenuOpen(false); logout(); }} style={{
                    display: "flex", alignItems: "center", gap: "0.6rem",
                    padding: "0.75rem 1rem", color: "#f87171",
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: "0.85rem", fontFamily: "Rubik,sans-serif", width: "100%",
                  }}>
                    <Icon name="logout" size={18} /> יציאה
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <Link href="/login" style={{
            background: "var(--primary)", color: "var(--on-primary-container)",
            fontWeight: 700, padding: "6px 16px", borderRadius: 8, textDecoration: "none",
            fontSize: "0.82rem", fontFamily: "Rubik,sans-serif",
          }}>
            כניסה
          </Link>
        )}
      </div>
    </header>
  );

  /* ── Desktop Sidebar (left, below header) ── */
  const sidebar = (
    <aside className="sidebar" style={{ direction: "ltr" }}>
      <div style={{ padding: "1.5rem 0 1.5rem" }}>
        {/* PRO BETTOR tier badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem", padding: "0 1.5rem" }}>
          <div style={{ padding: "0.5rem", borderRadius: 12, background: "rgba(92,222,151,0.1)", display: "flex" }}>
            <Icon name="military_tech" fill={1} size={22} />
          </div>
          <div>
            <div style={{
              fontFamily: "Rubik,sans-serif", fontWeight: 800, fontSize: "0.78rem",
              color: "var(--primary)", fontStyle: "italic", textTransform: "uppercase", letterSpacing: "0.05em",
            }}>PRO BETTOR</div>
            <div style={{ fontSize: "0.68rem", color: "var(--on-surface-variant)" }}>Tier: Diamond</div>
          </div>
        </div>

        {/* Nav items */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {navItems.map(item => {
            const active = item.exact ? path === item.href : path.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} style={{
                display: "flex", alignItems: "center", gap: "0.75rem",
                paddingLeft: "1.5rem", paddingRight: "1rem",
                paddingTop: "0.75rem", paddingBottom: "0.75rem",
                borderRadius: active ? "9999px 0 0 9999px" : 0,
                background: active ? "rgba(92,222,151,0.18)" : "transparent",
                color: active ? "var(--primary)" : "var(--on-surface-variant)",
                borderRight: active ? "4px solid var(--primary)" : "4px solid transparent",
                textDecoration: "none", fontWeight: active ? 700 : 400,
                fontSize: "0.9rem", letterSpacing: "0.01em",
                transition: "all 0.18s ease",
              }}>
                <Icon name={item.icon} fill={active ? 1 : 0} size={22} />
                {item.labelHe}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Quick bet CTA at the bottom */}
      <div style={{ marginTop: "auto", padding: "1.5rem" }}>
        <Link href="/predictions" style={{
          display: "block", width: "100%", padding: "1rem",
          background: "var(--primary)", color: "var(--on-primary-container)",
          fontFamily: "Rubik,sans-serif", fontWeight: 700, fontSize: "0.85rem",
          borderRadius: 12, textAlign: "center", textDecoration: "none",
          boxShadow: "0 0 20px rgba(92,222,151,0.3)",
          transition: "transform 0.2s",
        }}>
          הכנס ניחוש מהיר
        </Link>
      </div>
    </aside>
  );

  /* ── Mobile Bottom Nav ── */
  const mobileNav = (
    <nav className="bottomnav">
      {[
        { href: "/", label: "ראשי", icon: "dashboard", exact: true },
        { href: "/predictions", label: "ניחושים", icon: "calendar_month", exact: false },
        { href: "/leaderboard", label: "דירוג", icon: "leaderboard", exact: false },
        { href: "/groups", label: "קבוצות", icon: "group", exact: false },
        { href: "/profile", label: "פרופיל", icon: "person", exact: false },
        ...(session?.isAdmin
          ? [{ href: "/admin", label: "ניהול", icon: "admin_panel_settings", exact: false }]
          : [{ href: "/login", label: "כניסה", icon: "person", exact: true }]),
      ].map(item => {
        const active = item.exact ? path === item.href : path.startsWith(item.href);
        return (
          <Link key={item.href + item.label} href={item.href} style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", gap: "2px", textDecoration: "none",
            color: active ? "var(--primary)" : "var(--on-surface-variant)",
            opacity: active ? 1 : 0.65,
            fontSize: "0.62rem", fontWeight: active ? 600 : 400,
            flex: 1, padding: "6px 0",
            background: active ? "rgba(92,222,151,0.08)" : "transparent",
            borderRadius: 10,
            transition: "all 0.15s",
          }}>
            <Icon name={item.icon} fill={active ? 1 : 0} size={active ? 24 : 22} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {header}
      {sidebar}
      {mobileNav}
    </>
  );
}
