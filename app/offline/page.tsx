"use client";

export default function OfflinePage() {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      minHeight: "70vh", fontFamily: "Rubik,sans-serif", textAlign: "center", padding: "2rem",
    }}>
      <div style={{ fontSize: "4rem", marginBottom: "1.5rem" }}>📡</div>
      <h1 style={{
        fontFamily: "Montserrat,sans-serif", fontWeight: 800, fontSize: "1.6rem",
        color: "#fff", marginBottom: "0.5rem",
      }}>
        אין חיבור לאינטרנט
      </h1>
      <p style={{ color: "var(--on-surface-variant)", fontSize: "0.9rem", marginBottom: "2rem", maxWidth: 280 }}>
        בדוק את החיבור שלך ונסה שוב — הניחושים מחכים לך
      </p>
      <button
        onClick={() => window.location.reload()}
        style={{
          background: "linear-gradient(135deg, #5cde97, #22c55e)",
          color: "#051a0b", border: "none", borderRadius: 12,
          padding: "12px 28px", fontFamily: "Rubik,sans-serif",
          fontWeight: 800, fontSize: "0.9rem", cursor: "pointer",
          boxShadow: "0 0 24px rgba(92,222,151,0.35)",
        }}
      >
        נסה שוב
      </button>
    </div>
  );
}
