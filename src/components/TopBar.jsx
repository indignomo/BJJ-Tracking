import React from "react";
import { BeltMark } from "./ui.jsx";

export function TopBar({ perfil, acento }) {
  return (
    <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 0 16px", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <BeltMark cor={acento} graus={perfil.graus} size={30} />
        <span style={{ fontFamily: "var(--font-display)", fontSize: 28, letterSpacing: 1, lineHeight: 1 }}>tatame</span>
      </div>
      {perfil.faixa && (
        <div style={{ textAlign: "right", fontSize: 13, color: "var(--muted)", lineHeight: 1.3 }}>
          <div style={{ color: "var(--ink)", fontWeight: 600 }}>Faixa {perfil.faixa}</div>
          <div>{perfil.graus} {perfil.graus === 1 ? "grau" : "graus"}</div>
        </div>
      )}
    </header>
  );
}
