"use client";

import { useState } from "react";

export default function LoginPage() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const endpoint = tab === "login" ? "/api/auth/login" : "/api/auth/register";
      const body =
        tab === "login"
          ? { email: form.email, password: form.password }
          : { username: form.username, email: form.email, password: form.password };
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || `שגיאה (${res.status})`);
        setLoading(false);
      } else {
        // Full page reload so Navbar re-reads the cookie
        window.location.href = "/predictions";
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("שגיאת רשת — נסה שוב");
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.8rem 1rem", borderRadius: 10,
    border: "1px solid rgba(92,222,151,0.2)",
    background: "rgba(0,0,0,0.35)",
    color: "#fff", fontSize: "0.9rem", outline: "none",
    fontFamily: "Rubik, sans-serif", transition: "border-color 0.2s",
    boxSizing: "border-box",
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      padding: "1rem", position: "relative", overflow: "hidden",
    }}>

      {/* Stadium field background */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0,
        background: "radial-gradient(ellipse at 50% 110%, rgba(92,222,151,0.12) 0%, rgba(14,21,16,0.0) 60%), #0a1009",
      }} />

      {/* Goal net pattern */}
      <svg style={{ position: "fixed", inset: 0, width: "100%", height: "100%", opacity: 0.06, zIndex: 0 }} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="net" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#5cde97" strokeWidth="0.8"/>
          </pattern>
          {/* Perspective trapezoid for goal */}
          <linearGradient id="netFade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="1"/>
            <stop offset="100%" stopColor="white" stopOpacity="0.1"/>
          </linearGradient>
          <mask id="netMask">
            <rect width="100%" height="100%" fill="url(#netFade)"/>
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#net)" mask="url(#netMask)"/>
      </svg>

      {/* Stadium lights */}
      <div style={{ position: "fixed", top: -80, left: "15%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(92,222,151,0.09) 0%, transparent 70%)", zIndex: 0, pointerEvents: "none" }} />
      <div style={{ position: "fixed", top: -80, right: "15%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(92,222,151,0.09) 0%, transparent 70%)", zIndex: 0, pointerEvents: "none" }} />

      {/* Goalposts SVG at bottom */}
      <svg style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "min(600px, 90vw)", opacity: 0.12, zIndex: 0, pointerEvents: "none" }} viewBox="0 0 600 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="0" width="12" height="200" fill="#5cde97"/>
        <rect x="578" y="0" width="12" height="200" fill="#5cde97"/>
        <rect x="10" y="0" width="580" height="12" fill="#5cde97"/>
        {/* Net lines horizontal */}
        {[30,55,80,105,130,155,180].map(y => (
          <line key={y} x1="22" y1={y} x2="578" y2={y} stroke="#5cde97" strokeWidth="1.5"/>
        ))}
        {/* Net lines vertical */}
        {[60,110,160,210,260,310,360,410,460,510,560].map(x => (
          <line key={x} x1={x} y1="12" x2={x} y2="200" stroke="#5cde97" strokeWidth="1.5"/>
        ))}
      </svg>

      {/* Login card */}
      <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <img
            src="/mondi-logo.svg" alt="mondi"
            style={{ width: 96, height: 96, borderRadius: 20, marginBottom: "0.75rem",
              filter: "drop-shadow(0 0 20px rgba(255,200,50,0.35))",
              display: "block", margin: "0 auto 0.75rem",
            }}
          />
          <div style={{
            fontFamily: "'Arial Black', sans-serif", fontWeight: 900, fontSize: "2rem",
            background: "linear-gradient(135deg, #fff 0%, #ffe066 50%, #f0b429 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text", letterSpacing: "0.04em",
          }}>
            mondi
          </div>
          <p style={{ color: "rgba(188,202,189,0.7)", fontSize: "0.8rem", marginTop: "0.3rem", fontFamily: "Rubik, sans-serif" }}>
            ניחושי תוצאות מונדיאל 2026 🏆
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: "rgba(14,21,16,0.85)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(92,222,151,0.18)",
          borderRadius: 20,
          padding: "1.75rem",
          boxShadow: "0 0 60px rgba(0,0,0,0.5), 0 0 30px rgba(92,222,151,0.06)",
        }}>
          {/* Tab switcher */}
          <div style={{
            display: "flex", background: "rgba(0,0,0,0.3)",
            borderRadius: 12, padding: 4, marginBottom: "1.5rem",
            border: "1px solid rgba(92,222,151,0.1)",
          }}>
            {(["login", "register"] as const).map((t) => (
              <button key={t} onClick={() => { setTab(t); setError(""); }} style={{
                flex: 1, padding: "0.65rem", border: "none", cursor: "pointer",
                borderRadius: 9, fontFamily: "Rubik, sans-serif", fontWeight: 700,
                fontSize: "0.88rem",
                background: tab === t ? "var(--primary)" : "transparent",
                color: tab === t ? "#0a1009" : "rgba(188,202,189,0.6)",
                transition: "all 0.2s",
                boxShadow: tab === t ? "0 0 16px rgba(92,222,151,0.3)" : "none",
              }}>
                {t === "login" ? "⚡ כניסה" : "🆕 הרשמה"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {tab === "register" && (
              <div>
                <label style={{ display: "block", marginBottom: "0.35rem", color: "rgba(188,202,189,0.7)", fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "Rubik,sans-serif" }}>
                  שם שחקן
                </label>
                <input
                  style={inputStyle} type="text" placeholder="הכנס שם משתמש"
                  value={form.username} onChange={(e) => set("username", e.target.value)} required
                  onFocus={e => (e.target.style.borderColor = "rgba(92,222,151,0.6)")}
                  onBlur={e => (e.target.style.borderColor = "rgba(92,222,151,0.2)")}
                />
              </div>
            )}

            <div>
              <label style={{ display: "block", marginBottom: "0.35rem", color: "rgba(188,202,189,0.7)", fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "Rubik,sans-serif" }}>
                אימייל
              </label>
              <input
                style={inputStyle} type="email" placeholder="your@email.com"
                value={form.email} onChange={(e) => set("email", e.target.value)} required
                onFocus={e => (e.target.style.borderColor = "rgba(92,222,151,0.6)")}
                onBlur={e => (e.target.style.borderColor = "rgba(92,222,151,0.2)")}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "0.35rem", color: "rgba(188,202,189,0.7)", fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "Rubik,sans-serif" }}>
                סיסמה
              </label>
              <input
                style={inputStyle} type="password" placeholder="••••••••"
                value={form.password} onChange={(e) => set("password", e.target.value)} required
                onFocus={e => (e.target.style.borderColor = "rgba(92,222,151,0.6)")}
                onBlur={e => (e.target.style.borderColor = "rgba(92,222,151,0.2)")}
              />
            </div>

            {error && (
              <div style={{
                background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.35)",
                borderRadius: 10, padding: "0.7rem 1rem", color: "#f87171", fontSize: "0.85rem",
                fontFamily: "Rubik,sans-serif", textAlign: "center",
              }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              background: loading ? "rgba(92,222,151,0.4)" : "var(--primary)",
              color: "#0a1009",
              fontFamily: "Rubik, sans-serif", fontWeight: 800, fontSize: "1rem",
              border: "none", borderRadius: 12, padding: "0.9rem",
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: "0.25rem",
              boxShadow: loading ? "none" : "0 0 24px rgba(92,222,151,0.35)",
              transition: "all 0.2s",
              letterSpacing: "0.02em",
            }}>
              {loading ? "⏳ מתחבר..." : tab === "login" ? "⚡ כניסה למשחק" : "🚀 הצטרף לליגה"}
            </button>

            {tab === "register" && (
              <p style={{ color: "rgba(188,202,189,0.45)", fontSize: "0.7rem", textAlign: "center", fontFamily: "Rubik,sans-serif", lineHeight: 1.5 }}>
                המשתמש הראשון שנרשם יקבל הרשאות מנהל
              </p>
            )}
          </form>
        </div>

        {/* Bottom decoration */}
        <p style={{ textAlign: "center", marginTop: "1.25rem", color: "rgba(188,202,189,0.3)", fontSize: "0.7rem", fontFamily: "Rubik,sans-serif" }}>
          🏟️ Stadium Elite · מונדיאל 2026
        </p>
      </div>
    </div>
  );
}
