"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "שגיאה");
      else { router.push("/predictions"); router.refresh(); }
    } catch { setError("שגיאת רשת"); }
    finally { setLoading(false); }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.75rem 1rem", borderRadius: 10,
    border: "1px solid rgba(61,74,64,0.5)",
    background: "rgba(255,255,255,0.03)",
    color: "var(--on-surface)", fontSize: "0.9rem", outline: "none",
    fontFamily: "inherit", transition: "border-color 0.15s",
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh", padding: "1rem" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            fontFamily: "Montserrat,sans-serif", fontWeight: 800, fontSize: "1.6rem",
            color: "var(--primary)", letterSpacing: "-0.02em", marginBottom: "0.35rem",
          }}>
            STADIUM ELITE
          </div>
          <p style={{ color: "var(--on-surface-variant)", fontSize: "0.82rem" }}>
            ניחושי תוצאות מונדיאל 2026
          </p>
        </div>

        {/* Card */}
        <div className="glass-card" style={{ borderRadius: 20, padding: "1.75rem" }}>
          {/* Tabs */}
          <div style={{
            display: "flex", background: "rgba(255,255,255,0.04)",
            borderRadius: 10, padding: 4, marginBottom: "1.5rem",
          }}>
            {(["login", "register"] as const).map((t) => (
              <button key={t} onClick={() => { setTab(t); setError(""); }} style={{
                flex: 1, padding: "0.6rem", border: "none", cursor: "pointer",
                borderRadius: 8, fontFamily: "Montserrat,sans-serif", fontWeight: 700,
                fontSize: "0.85rem", letterSpacing: "0.02em",
                background: tab === t ? "var(--primary)" : "transparent",
                color: tab === t ? "var(--on-primary-container)" : "var(--on-surface-variant)",
                transition: "all 0.15s",
              }}>
                {t === "login" ? "כניסה" : "הרשמה"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {tab === "register" && (
              <div>
                <label style={{ display: "block", marginBottom: "0.35rem", color: "var(--on-surface-variant)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  שם משתמש
                </label>
                <input style={inputStyle} type="text" placeholder="הכנס שם משתמש"
                  value={form.username} onChange={(e) => set("username", e.target.value)} required />
              </div>
            )}
            <div>
              <label style={{ display: "block", marginBottom: "0.35rem", color: "var(--on-surface-variant)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                אימייל
              </label>
              <input style={inputStyle} type="email" placeholder="your@email.com"
                value={form.email} onChange={(e) => set("email", e.target.value)} required />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.35rem", color: "var(--on-surface-variant)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                סיסמה
              </label>
              <input style={inputStyle} type="password" placeholder="••••••••"
                value={form.password} onChange={(e) => set("password", e.target.value)} required />
            </div>

            {error && (
              <div style={{
                background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)",
                borderRadius: 10, padding: "0.65rem 1rem", color: "#f87171", fontSize: "0.85rem",
              }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              background: "var(--primary)", color: "var(--on-primary-container)",
              fontFamily: "Montserrat,sans-serif", fontWeight: 800, fontSize: "0.9rem",
              letterSpacing: "0.04em", border: "none", borderRadius: 10, padding: "0.85rem",
              cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
              marginTop: "0.5rem", boxShadow: "0 0 20px rgba(92,222,151,0.25)",
              transition: "opacity 0.15s",
            }}>
              {loading ? "טוען..." : tab === "login" ? "כניסה" : "הרשמה"}
            </button>

            {tab === "register" && (
              <p style={{ color: "var(--on-surface-variant)", fontSize: "0.72rem", textAlign: "center" }}>
                המשתמש הראשון שנרשם יהיה מנהל האתר
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
