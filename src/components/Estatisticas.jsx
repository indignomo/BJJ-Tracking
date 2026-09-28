import React, { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Clock, ShieldAlert, Swords } from "lucide-react";
import { Panel, MetricaCard } from "./ui.jsx";
import { formatDataCurta, formatDuracao, agregarPosicoes, filtrarPorPeriodo, totalMinutos } from "../domain/calculations.js";

export function Estatisticas({ treinos, acento }) {
  const [periodo, setPeriodo] = useState("30");

  const treinosFiltrados = useMemo(() => filtrarPorPeriodo(treinos, periodo), [treinos, periodo]);
  const aplicadas = useMemo(() => agregarPosicoes(treinosFiltrados, "Aplicada"), [treinosFiltrados]);
  const sofridas = useMemo(() => agregarPosicoes(treinosFiltrados, "Sofrida"), [treinosFiltrados]);
  const lesoes = treinosFiltrados.filter((t) => t.houveLesao);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", gap: 6 }}>
        {[["7", "7 dias"], ["30", "30 dias"], ["90", "90 dias"], ["todos", "Sempre"]].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setPeriodo(id)}
            style={{
              fontSize: 12.5, padding: "6px 12px", cursor: "pointer",
              border: `1px solid ${periodo === id ? "var(--ink)" : "var(--border)"}`,
              background: periodo === id ? "var(--ink)" : "transparent",
              color: periodo === id ? "#F5F4EE" : "var(--ink)",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
        <MetricaCard rotulo="treinos no período" valor={treinosFiltrados.length} icon={Swords} acento={acento} />
        <MetricaCard rotulo="tempo de tatame" valor={formatDuracao(totalMinutos(treinosFiltrados))} icon={Clock} acento={acento} />
        <MetricaCard rotulo="lesões registradas" valor={lesoes.length} icon={ShieldAlert} acento="#A23B2E" />
      </div>

      {treinosFiltrados.length === 0 ? (
        <Panel><p style={{ margin: 0, fontSize: 14, color: "var(--muted)" }}>Nenhum treino neste período.</p></Panel>
      ) : (
        <>
          <Panel>
            <div style={{ fontWeight: 600, fontSize: 14.5, marginBottom: 4 }}>Mais aplicadas</div>
            {aplicadas.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--muted)" }}>Nenhum registro no período.</p>
            ) : (
              <ResponsiveContainer width="100%" height={Math.max(120, aplicadas.length * 34)}>
                <BarChart data={aplicadas} layout="vertical" margin={{ left: 8, right: 16 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="nome" width={110} tick={{ fontSize: 12.5, fill: "#1B1F27" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontFamily: "IBM Plex Sans", fontSize: 12, border: "1px solid #D9D4C4" }} />
                  <Bar dataKey="total" fill="#3D7A4E" radius={[0, 2, 2, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Panel>

          <Panel>
            <div style={{ fontWeight: 600, fontSize: 14.5, marginBottom: 4 }}>Mais sofridas — atenção na defesa</div>
            {sofridas.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--muted)" }}>Nenhum registro no período.</p>
            ) : (
              <ResponsiveContainer width="100%" height={Math.max(120, sofridas.length * 34)}>
                <BarChart data={sofridas} layout="vertical" margin={{ left: 8, right: 16 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="nome" width={110} tick={{ fontSize: 12.5, fill: "#1B1F27" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontFamily: "IBM Plex Sans", fontSize: 12, border: "1px solid #D9D4C4" }} />
                  <Bar dataKey="total" fill="#A23B2E" radius={[0, 2, 2, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Panel>

          {lesoes.length > 0 && (
            <Panel accentBorder="#A23B2E">
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8, color: "#A23B2E" }}>Lesões no período</div>
              {lesoes.map((t) => (
                <div key={t.id} style={{ fontSize: 13, marginBottom: 3 }}>
                  {formatDataCurta(t.data)} — {t.gravidadeLesao || "gravidade não informada"}
                </div>
              ))}
            </Panel>
          )}
        </>
      )}
    </div>
  );
}
