"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Session {
  userId: number;
  username: string;
  isAdmin: boolean;
}

export default function Navbar() {
  const [session, setSession] = useState<Session | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => setSession(data));
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setSession(null);
    router.push("/");
    router.refresh();
  }

  return (
    <nav
      style={{
        backgroundColor: "#1e293b",
        borderBottom: "2px solid #f59e0b",
        padding: "0 1.5rem",
        height: "3.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Link href="/" style={{ fontWeight: 700, fontSize: "1.2rem", color: "#f59e0b", textDecoration: "none" }}>
        🏆 מונדיאל 2026
      </Link>

      <div style={{ display: "flex", gap: "1.25rem", alignItems: "center", fontSize: "0.95rem" }}>
        <Link href="/" style={{ color: "#cbd5e1", textDecoration: "none" }}>
          משחקים
        </Link>
        <Link href="/leaderboard" style={{ color: "#cbd5e1", textDecoration: "none" }}>
          טבלת דירוג
        </Link>
        {session ? (
          <>
            <Link href="/predictions" style={{ color: "#f59e0b", fontWeight: 600, textDecoration: "none" }}>
              הניחושים שלי
            </Link>
            {session.isAdmin && (
              <Link href="/admin" style={{ color: "#ef4444", fontWeight: 600, textDecoration: "none" }}>
                ניהול
              </Link>
            )}
            <button
              onClick={logout}
              style={{
                background: "none",
                border: "1px solid #475569",
                borderRadius: "6px",
                color: "#94a3b8",
                cursor: "pointer",
                padding: "4px 12px",
                fontSize: "0.9rem",
              }}
            >
              יציאה ({session.username})
            </button>
          </>
        ) : (
          <Link
            href="/login"
            style={{
              backgroundColor: "#f59e0b",
              color: "#0f172a",
              fontWeight: 700,
              borderRadius: "6px",
              padding: "6px 16px",
              textDecoration: "none",
            }}
          >
            כניסה / הרשמה
          </Link>
        )}
      </div>
    </nav>
  );
}
