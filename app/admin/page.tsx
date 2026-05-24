"use client";

import { useEffect, useState } from "react";

interface User {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
  created_at: string;
  predictions_count: number;
  total_points: number;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("he-IL", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function avatar(name: string) {
  return name[0]?.toUpperCase() ?? "?";
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setUsers(d);
        setLoading(false);
      });
  }, []);

  const filtered = users.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalPredictions = users.reduce((s, u) => s + u.predictions_count, 0);
  const activeUsers = users.filter((u) => u.predictions_count > 0).length;

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "50vh", color: "var(--on-surface-variant)", fontFamily: "Rubik,sans-serif" }}>
      טוען...
    </div>
  );

  if (error) return (
    <div style={{ textAlign: "center", padding: "4rem", color: "#f87171", fontFamily: "Rubik,sans-serif" }}>
      {error}
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "1.75rem" }}>
        <h1 style={{
          fontFamily: "Montserrat,sans-serif", fontWeight: 800, fontSize: "1.8rem",
          color: "#fff", textTransform: "uppercase", letterSpacing: "0.03em", marginBottom: "0.3rem",
        }}>
          משתמשים
        </h1>
        <p style={{ color: "var(--on-surface-variant)", fontSize: "0.85rem" }}>
          סקירת כל מי שנרשם לפני המונדיאל
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.75rem", marginBottom: "1.75rem" }}>
        {[
          { label: "סה״כ נרשמו", value: users.length, icon: "group", color: "var(--primary)" },
          { label: "עם ניחושים", value: activeUsers, icon: "sports_soccer", color: "#60a5fa" },
          { label: "ניחושים סה״כ", value: totalPredictions, icon: "check_circle", color: "#fbbf24" },
          { label: "מנהלים", value: users.filter(u => u.is_admin).length, icon: "shield", color: "#f87171" },
        ].map((s) => (
          <div key={s.label} className="glass-card" style={{ borderRadius: 14, padding: "1rem", textAlign: "center" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 22, color: s.color, marginBottom: "0.4rem", display: "block" }}>{s.icon}</span>
            <div style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 800, fontSize: "1.6rem", color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: "0.65rem", color: "var(--on-surface-variant)", marginTop: "0.3rem" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: "1rem" }}>
        <span className="material-symbols-outlined" style={{
          position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)",
          color: "var(--on-surface-variant)", fontSize: 18, pointerEvents: "none",
        }}>search</span>
        <input
          type="text"
          placeholder="חיפוש לפי שם או אימייל..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%", boxSizing: "border-box",
            padding: "0.65rem 2.5rem 0.65rem 0.9rem",
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(61,74,64,0.5)",
            borderRadius: 12, color: "var(--on-surface)", fontFamily: "Rubik,sans-serif",
            fontSize: "0.88rem", outline: "none", direction: "rtl",
          }}
        />
      </div>

      {/* User count */}
      <div style={{ fontSize: "0.72rem", color: "var(--on-surface-variant)", marginBottom: "0.75rem" }}>
        מציג {filtered.length} מתוך {users.length} משתמשים
      </div>

      {/* Users list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        {filtered.map((u, i) => (
          <div key={u.id} className="glass-card" style={{
            borderRadius: 14, padding: "0.85rem 1.1rem",
            display: "flex", alignItems: "center", gap: "0.9rem", flexWrap: "wrap",
            border: u.is_admin ? "1px solid rgba(248,113,113,0.2)" : "1px solid rgba(255,255,255,0.07)",
          }}>
            {/* Rank + Avatar */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexShrink: 0 }}>
              <span style={{
                fontSize: "0.7rem", fontWeight: 700, color: "var(--on-surface-variant)",
                fontFamily: "Montserrat,sans-serif", width: 20, textAlign: "center",
              }}>
                {i + 1}
              </span>
              <div style={{
                width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                background: u.is_admin
                  ? "linear-gradient(135deg, #f87171, #ef4444)"
                  : "linear-gradient(135deg, var(--primary), #22c55e)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "Rubik,sans-serif", fontWeight: 800, fontSize: "1rem",
                color: "#051a0b",
              }}>
                {avatar(u.username)}
              </div>
            </div>

            {/* Name + email */}
            <div style={{ flex: 1, minWidth: 120 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontWeight: 700, fontSize: "0.92rem", color: "#fff" }}>{u.username}</span>
                {u.is_admin && (
                  <span style={{ fontSize: "0.6rem", color: "#f87171", border: "1px solid rgba(248,113,113,0.35)", borderRadius: 5, padding: "1px 6px", fontWeight: 600 }}>
                    מנהל
                  </span>
                )}
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--on-surface-variant)", direction: "ltr", textAlign: "right" }}>
                {u.email}
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: "flex", gap: "1.25rem", flexShrink: 0 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "#60a5fa" }}>
                  {u.predictions_count}
                </div>
                <div style={{ fontSize: "0.6rem", color: "var(--on-surface-variant)" }}>ניחושים</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "var(--primary)" }}>
                  {u.total_points}
                </div>
                <div style={{ fontSize: "0.6rem", color: "var(--on-surface-variant)" }}>נקודות</div>
              </div>
            </div>

            {/* Date */}
            <div style={{ fontSize: "0.68rem", color: "var(--on-surface-variant)", flexShrink: 0, textAlign: "left", direction: "ltr" }}>
              {formatDate(u.created_at)}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="glass-card" style={{ borderRadius: 16, padding: "3rem", textAlign: "center", color: "var(--on-surface-variant)" }}>
            לא נמצאו משתמשים
          </div>
        )}
      </div>
    </div>
  );
}
