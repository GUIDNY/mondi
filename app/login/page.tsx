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
      const body = tab === "login"
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

  const inputStyle = {
    width: "100%", padding: "0.7rem 1rem", borderRadius: "8px",
    border: "1px solid #334155", background: "#0f172a", color: "#f1f5f9",
    fontSize: "1rem", outline: "none",
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh", padding: "1rem" }}>
      <div style={{
        background: "#1e293b", borderRadius: "16px", border: "1px solid #334155",
        padding: "2rem", width: "100%", maxWidth: "400px"
      }}>
        <h1 style={{ textAlign: "center", fontSize: "1.5rem", fontWeight: 800, color: "#f59e0b", marginBottom: "1.5rem" }}>
          🏆 מונדיאל 2026
        </h1>

        {/* Tabs */}
        <div style={{ display: "flex", borderRadius: "8px", overflow: "hidden", border: "1px solid #334155", marginBottom: "1.5rem" }}>
          {(["login", "register"] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(""); }}
              style={{
                flex: 1, padding: "0.6rem", border: "none", cursor: "pointer", fontWeight: 600,
                background: tab === t ? "#f59e0b" : "transparent",
                color: tab === t ? "#0f172a" : "#94a3b8",
                fontSize: "0.95rem",
              }}
            >
              {t === "login" ? "כניסה" : "הרשמה"}
            </button>
          ))}
        </div>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {tab === "register" && (
            <div>
              <label style={{ display: "block", marginBottom: "0.3rem", color: "#94a3b8", fontSize: "0.85rem" }}>
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
            <label style={{ display: "block", marginBottom: "0.3rem", color: "#94a3b8", fontSize: "0.85rem" }}>
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
            <label style={{ display: "block", marginBottom: "0.3rem", color: "#94a3b8", fontSize: "0.85rem" }}>
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
            <div style={{ background: "#450a0a", border: "1px solid #ef4444", borderRadius: "8px", padding: "0.6rem 1rem", color: "#fca5a5", fontSize: "0.9rem" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: "#f59e0b", color: "#0f172a", fontWeight: 700, fontSize: "1rem",
              border: "none", borderRadius: "8px", padding: "0.75rem", cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1, marginTop: "0.5rem"
            }}
          >
            {loading ? "טוען..." : tab === "login" ? "כניסה" : "הרשמה"}
          </button>

          {tab === "register" && (
            <p style={{ color: "#64748b", fontSize: "0.8rem", textAlign: "center", margin: 0 }}>
              המשתמש הראשון שנרשם יהיה מנהל
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
