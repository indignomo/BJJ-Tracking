import React, { useState } from "react";
import { ShieldAlert, Trash2 } from "lucide-react";
import { Panel, Botao } from "./ui.jsx";
import { parseData, formatDataCurta, formatDuracao } from "../domain/calculations.js";

export function Historico({ treinos, acento, onRemover }) {
  const [filtro, setFiltro] = useState("todos");
  const [aberto, setAberto] = useState(null);
  const [confirmarRemocao, setConfirmarRemocao] = useState(null);

  const ordenados = [...treinos].sort((a, b) => parseData(b.data) - parseData(a.data));
  const filtrados = ordenados.filter((t) => {
    if (filtro === "competicao") return t.isCompeticao;
    if (filtro === "lesao") return t.houveLesao;
    return true;
  });

  if (treinos.length === 0) {
    return <Panel><p style={{ margin: 0, fontSize: 14, color: "var(--muted)" }}>Nenhum treino no histórico ainda.</p></Panel>;
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {[["todos", "Todos"], ["competicao", "Competições"], ["lesao", "Com lesão"]].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setFiltro(id)}
            style={{
              fontSize: 12.5, padding: "6px 12px", cursor: "pointer",
              border: `1px solid ${filtro === id ? "var(--ink)" : "var(--border)"}`,
              background: filtro === id ? "var(--ink)" : "transparent",
              color: filtro === id ? "#F5F4EE" : "var(--ink)",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtrados.map((t) => {
          const expandido = aberto === t.id;
          return (
            <Panel key={t.id} accentBorder={t.isCompeticao ? acento : "var(--border)"} style={{ padding: 0 }}>
              <div
                onClick={() => setAberto(expandido ? null : t.id)}
                style={{ padding: "13px 16px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>
                    {formatDataCurta(t.data)} · {t.tipoTreino}
                    {t.isCompeticao && <span style={{ color: acento, fontSize: 11.5, marginLeft: 8 }}>competição</span>}
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>
                    {t.local} · {formatDuracao(t.duracaoMinutos)} · intensidade {t.intensidade}/5
                  </div>
                </div>
                {t.houveLesao && <ShieldAlert size={16} color="#A23B2E" />}
              </div>
              {expandido && (
                <div style={{ padding: "0 16px 16px", borderTop: "1px solid var(--border)" }}>
                  {t.instrutor && <p style={{ fontSize: 13, margin: "10px 0 0" }}>Professor: {t.instrutor}</p>}
                  {t.observacoes && <p style={{ fontSize: 13, margin: "6px 0 0", color: "var(--muted)" }}>{t.observacoes}</p>}
                  {t.houveLesao && (
                    <p style={{ fontSize: 13, margin: "6px 0 0", color: "#A23B2E" }}>
                      Lesão: {t.gravidadeLesao || "gravidade não informada"}
                    </p>
                  )}
                  {t.rolas.length > 0 && (
                    <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 4 }}>
                      {t.rolas.map((r, i) => (
                        <div key={i} style={{ fontSize: 13 }}>
                          <strong>{r.quantidade}x</strong> {r.nomePosicao}{" "}
                          <span style={{ color: r.tipoEvento === "Aplicada" ? "#3D7A4E" : "#A23B2E" }}>
                            ({r.tipoEvento === "Aplicada" ? "aplicada" : "sofrida"})
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ marginTop: 12 }}>
                    {confirmarRemocao === t.id ? (
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{ fontSize: 12.5, color: "var(--muted)" }}>Remover este treino?</span>
                        <Botao variante="perigo" onClick={() => onRemover(t.id)} style={{ padding: "5px 10px", fontSize: 12.5 }}>Remover</Botao>
                        <Botao variante="fantasma" onClick={() => setConfirmarRemocao(null)} style={{ padding: "5px 10px", fontSize: 12.5 }}>Cancelar</Botao>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmarRemocao(t.id)} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 12.5, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, padding: 0 }}>
                        <Trash2 size={13} /> Remover treino
                      </button>
                    )}
                  </div>
                </div>
              )}
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
