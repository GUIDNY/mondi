"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function JoinPage() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();
  const [status, setStatus] = useState<"joining" | "done" | "error" | "already">("joining");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!code) return;
    fetch("/api/groups/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code.toUpperCase() }),
    })
      .then(r => r.json().then(d => ({ ok: r.ok, status: r.status, data: d })))
      .then(({ ok, status: s, data }) => {
        if (ok) {
          setStatus("done");
          setMsg(data.name ?? "");
          setTimeout(() => router.push(`/groups/${code.toUpperCase()}`), 1500);
        } else if (s === 409) {
          setStatus("already");
          setTimeout(() => router.push(`/groups/${code.toUpperCase()}`), 1200);
        } else if (s === 401) {
          router.push(`/login?redirect=/join/${code}`);
        } else {
          setStatus("error");
          setMsg(data.error || "שגיאה");
        }
      });
  }, [code]);

  const icon = status === "done" ? "✅" : status === "already" ? "👥" : status === "error" ? "❌" : "⏳";
  const title = status === "done" ? `הצטרפת ל-${msg}!` : status === "already" ? "כבר חבר בקבוצה" : status === "error" ? msg : "מצטרף לקבוצה...";
  const sub = status === "joining" ? "אנא המתן" : status === "error" ? "" : "מעביר אותך לקבוצה...";

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <div className="glass-card" style={{ borderRadius: 20, padding: "3rem 2.5rem", textAlign: "center", maxWidth: 360, width: "100%" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>{icon}</div>
        <h2 style={{ fontFamily: "Rubik,sans-serif", fontWeight: 700, fontSize: "1.2rem", color: "#fff", marginBottom: "0.5rem" }}>
          {title}
        </h2>
        {sub && <p style={{ color: "var(--on-surface-variant)", fontSize: "0.85rem" }}>{sub}</p>}
        {status === "error" && (
          <button onClick={() => router.push("/groups")} style={{
            marginTop: "1.5rem", background: "var(--primary)", color: "var(--on-primary-container)",
            fontFamily: "Rubik,sans-serif", fontWeight: 700, border: "none",
            borderRadius: 10, padding: "10px 24px", cursor: "pointer", fontSize: "0.9rem",
          }}>
            חזור לקבוצות
          </button>
        )}
      </div>
    </div>
  );
}
