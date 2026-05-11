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
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "שגיאה");
      } else {
        router.push("/predictions");
        router.refresh();
      }
    } catch {
      setError("שגיאת רשת");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.7rem 1rem",
    borderRadius: 10,
    border: "1px solid var(--border)",
    background: "rgba(255,255,255,0.03)",
    color: "var(--text)",
    fontSize: "0.95rem",
    outline: "none",
    fontFamily: "inherit",
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh", padding: "1rem" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: "linear-gradient(135deg,#4ade80,#22c55e)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.7rem", margin: "0 auto 0.75rem",
          }}>⚽</div>
          <h1 style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 800, fontSize: "1.4rem", color: "var(--text)", marginBottom: "0.25rem" }}>
            מונדיאל 2026
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>ניחושי תוצאות לחברים</p>
        </div>

        {/* Card */}
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 18, padding: "1.75rem",
        }}>
          {/* Tabs */}
          <div style={{
            display: "flex", background: "rgba(255,255,255,0.04)",
            borderRadius: 10, padding: 4, marginBottom: "1.5rem",
          }}>
            {(["login", "register"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); }}
                style={{
                  flex: 1, padding: "0.55rem", border: "none", cursor: "pointer",
                  borderRadius: 8, fontWeight: 600, fontSize: "0.9rem",
                  background: tab === t ? "var(--green)" : "transparent",
                  color: tab === t ? "#0d1a10" : "var(--muted)",
                  fontFamily: "inherit", transition: "all 0.15s",
                }}
              >
                {t === "login" ? "כניסה" : "הרשמה"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {tab === "register" && (
              <div>
                <label style={{ display: "block", marginBottom: "0.4rem", color: "var(--muted)", fontSize: "0.82rem", fontWeight: 500 }}>
                  שם משתמש
                </label>
                <input
                  style={inputStyle}
                  type="text"
                  placeholder="הכנס שם משתמש"
                  value={form.username}
                  onChange={(e) => set("username", e.target.value)}
                  required
                />
              </div>
            )}
            <div>
              <label style={{ display: "block", marginBottom: "0.4rem", color: "var(--muted)", fontSize: "0.82rem", fontWeight: 500 }}>
                אימייל
              </label>
              <input
                style={inputStyle}
                type="email"
                placeholder="הכנס אימייל"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                required
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.4rem", color: "var(--muted)", fontSize: "0.82rem", fontWeight: 500 }}>
                סיסמה
              </label>
              <input
                style={inputStyle}
                type="password"
                placeholder="הכנס סיסמה"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                required
              />
            </div>

            {error && (
              <div style={{
                background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)",
                borderRadius: 10, padding: "0.65rem 1rem",
                color: "var(--red)", fontSize: "0.88rem",
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                background: "var(--green)", color: "#0d1a10", fontWeight: 700,
                fontSize: "0.95rem", border: "none", borderRadius: 10, padding: "0.75rem",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1, marginTop: "0.25rem",
                fontFamily: "inherit",
              }}
            >
              {loading ? "טוען..." : tab === "login" ? "כניסה" : "הרשמה"}
            </button>

            {tab === "register" && (
              <p style={{ color: "var(--muted)", fontSize: "0.75rem", textAlign: "center", margin: 0 }}>
                המשתמש הראשון שנרשם יהיה מנהל
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
