import React, { useMemo, useState } from "react";
import {
  CalendarDays, ChevronLeft, ChevronRight, Clock, Flame,
  Plus, ShieldAlert, Swords, Trophy,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Panel, Botao, MetricaCard, iconBtnStyle } from "./ui.jsx";
import {
  parseData, formatDataCurta, formatDuracao, calcularStreakSemanas,
  matrizMes, totalMinutos, totalRolasAplicadas,
} from "../domain/calculations.js";

export function Painel({ treinos, acento, irPara }) {
  const hoje = new Date();
  const [mesRef, setMesRef] = useState(new Date(hoje.getFullYear(), hoje.getMonth(), 1));

  const treinosDoMes = useMemo(
    () =>
      treinos.filter((t) => {
        const d = parseData(t.data);
        return d.getFullYear() === mesRef.getFullYear() && d.getMonth() === mesRef.getMonth();
      }),
    [treinos, mesRef]
  );

  const diasTreinados = new Set(treinosDoMes.map((t) => parseData(t.data).getDate()));
  const semanas = matrizMes(mesRef.getFullYear(), mesRef.getMonth());
  const streak = calcularStreakSemanas(treinos);
  const lesoesRecentes = treinos.filter((t) => t.houveLesao).slice(0, 3);
  const ultimos5 = [...treinos].sort((a, b) => parseData(b.data) - parseData(a.data)).slice(0, 5).reverse();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {treinos.length === 0 ? (
        <Panel accentBorder={acento}>
          <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6 }}>
            Nenhum treino registrado ainda. Comece anotando a última sessão no tatame —
            leva menos de um minuto.
          </p>
          <div style={{ marginTop: 12 }}>
            <Botao variante="acento" acento={acento} onClick={() => irPara("novo")}>
              <Plus size={15} /> Registrar treino
            </Botao>
          </div>
        </Panel>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
          <MetricaCard rotulo="treinos este mês" valor={treinosDoMes.length} icon={Swords} acento={acento} />
          <MetricaCard rotulo="tempo de tatame no mês" valor={formatDuracao(totalMinutos(treinosDoMes))} icon={Clock} acento={acento} />
          <MetricaCard rotulo="semanas seguidas treinando" valor={streak} icon={Flame} acento={acento} />
          <MetricaCard rotulo="finalizações aplicadas (total)" valor={totalRolasAplicadas(treinos)} icon={Trophy} acento={acento} />
        </div>
      )}

      <Panel>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <CalendarDays size={16} />
            <span style={{ fontWeight: 600, fontSize: 14.5, textTransform: "capitalize" }}>
              {mesRef.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
            </span>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            <button onClick={() => setMesRef(new Date(mesRef.getFullYear(), mesRef.getMonth() - 1, 1))} style={iconBtnStyle}>
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => setMesRef(new Date(mesRef.getFullYear(), mesRef.getMonth() + 1, 1))} style={iconBtnStyle}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, fontSize: 11, color: "var(--muted)", marginBottom: 6 }}>
          {["S", "T", "Q", "Q", "S", "S", "D"].map((d, i) => (
            <div key={i} style={{ textAlign: "center" }}>{d}</div>
          ))}
        </div>
        {semanas.map((semana, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 4 }}>
            {semana.map((dia, j) => {
              const treinou = dia && diasTreinados.has(dia);
              const ehHoje = dia && dia === hoje.getDate() && mesRef.getMonth() === hoje.getMonth() && mesRef.getFullYear() === hoje.getFullYear();
              return (
                <div
                  key={j}
                  style={{
                    aspectRatio: "1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12.5,
                    background: treinou ? acento : "transparent",
                    color: treinou ? "#F5F4EE" : dia ? "var(--ink)" : "transparent",
                    fontWeight: treinou ? 700 : 400,
                    border: ehHoje && !treinou ? "1px solid var(--ink)" : "1px solid transparent",
                  }}
                >
                  {dia || ""}
                </div>
              );
            })}
          </div>
        ))}
      </Panel>

      {ultimos5.length > 0 && (
        <Panel>
          <div style={{ fontWeight: 600, fontSize: 14.5, marginBottom: 4 }}>Intensidade — últimas sessões</div>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={ultimos5.map((t) => ({ nome: formatDataCurta(t.data), intensidade: t.intensidade }))}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis dataKey="nome" tick={{ fontSize: 11, fill: "#6B6459" }} axisLine={{ stroke: "#D9D4C4" }} tickLine={false} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: "#6B6459" }} axisLine={false} tickLine={false} width={20} />
              <Tooltip contentStyle={{ fontFamily: "IBM Plex Sans", fontSize: 12, border: "1px solid #D9D4C4" }} />
              <Line type="monotone" dataKey="intensidade" stroke={acento} strokeWidth={2.5} dot={{ r: 3.5, fill: acento }} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>
      )}

      {lesoesRecentes.length > 0 && (
        <Panel accentBorder="#A23B2E">
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600, fontSize: 14, marginBottom: 8, color: "#A23B2E" }}>
            <ShieldAlert size={16} /> Lesões recentes
          </div>
          {lesoesRecentes.map((t) => (
            <div key={t.id} style={{ fontSize: 13.5, color: "var(--muted)", marginBottom: 2 }}>
              {formatDataCurta(t.data)} — {t.gravidadeLesao || "gravidade não informada"}
            </div>
          ))}
        </Panel>
      )}
    </div>
  );
}
