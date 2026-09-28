export function Panel({ children, style, accentBorder }) {
  return (
    <div
      style={{
        background: "var(--panel)",
        border: "1px solid var(--border)",
        borderLeft: accentBorder ? `3px solid ${accentBorder}` : "1px solid var(--border)",
        padding: 18,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Rotulo({ children }) {
  return (
    <label style={{ display: "block", fontSize: 12.5, color: "var(--muted)", marginBottom: 5 }}>
      {children}
    </label>
  );
}

export const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  background: "#FFFFFF",
  border: "1px solid var(--border)",
  padding: "9px 10px",
  fontFamily: "var(--font-body)",
  fontSize: 14,
  color: "var(--ink)",
  outlineOffset: 2,
};

export function Botao({ children, onClick, variante = "primaria", acento, type = "button", disabled, style }) {
  const base = {
    fontFamily: "var(--font-body)",
    fontSize: 13.5,
    fontWeight: 600,
    padding: "10px 16px",
    border: "1px solid var(--ink)",
    cursor: disabled ? "default" : "pointer",
    opacity: disabled ? 0.5 : 1,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  };
  const variantes = {
    primaria: { background: "var(--ink)", color: "#F5F4EE", borderColor: "var(--ink)" },
    acento: { background: acento || "var(--acento)", color: "#F5F4EE", borderColor: acento || "var(--acento)" },
    fantasma: { background: "transparent", color: "var(--ink)", borderColor: "var(--border)" },
    perigo: { background: "transparent", color: "#A23B2E", borderColor: "#A23B2E" },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{ ...base, ...variantes[variante], ...style }}>
      {children}
    </button>
  );
}

export function MetricaCard({ rotulo, valor, icon: Icon, acento }) {
  return (
    <Panel accentBorder={acento} style={{ padding: "14px 16px" }}>
      <Icon size={15} color={acento} style={{ marginBottom: 8 }} />
      <div style={{ fontFamily: "var(--font-display)", fontSize: 30, lineHeight: 1 }}>{valor}</div>
      <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{rotulo}</div>
    </Panel>
  );
}

export const iconBtnStyle = {
  background: "none",
  border: "1px solid var(--border)",
  cursor: "pointer",
  padding: 5,
  display: "flex",
};

// pequeno selo: barra da faixa com os pontinhos de grau, como a fita da ponta da faixa
export function BeltMark({ cor, graus = 0, size = 28 }) {
  const w = size * 1.6;
  const h = size * 0.36;
  return (
    <svg width={w} height={size} viewBox={`0 0 ${w} ${size}`}>
      <rect x="0" y={(size - h) / 2} width={w} height={h} fill={cor} rx="1" />
      <rect x="0" y={(size - h) / 2} width={w * 0.16} height={h} fill="#1B1F27" rx="1" />
      {Array.from({ length: 4 }).map((_, i) => (
        <circle
          key={i}
          cx={w * 0.16 + w * 0.045 + i * (w * 0.05)}
          cy={size / 2}
          r={h * 0.16}
          fill={i < graus ? "#F5F4EE" : "transparent"}
        />
      ))}
    </svg>
  );
}
