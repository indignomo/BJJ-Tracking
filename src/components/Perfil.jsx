import React, { useState } from "react";
import { Check, CalendarDays, Swords } from "lucide-react";
import { Panel, Botao, Rotulo, inputStyle, MetricaCard, BeltMark } from "./ui.jsx";
import { parseData, tempoDeTatame } from "../domain/calculations.js";
import { novoPerfil, validarPerfil, FAIXAS_ORDEM } from "../domain/schema.js";
import { faixaInfo } from "../styles/tokens.js";
import { Backup } from "./Backup.jsx";

export function Perfil({ perfil, onSalvar, treinos, estado, onRestaurar }) {
  const [faixa, setFaixa] = useState(perfil.faixa);
  const [graus, setGraus] = useState(perfil.graus || 0);
  const [dataInicio, setDataInicio] = useState(perfil.dataInicio || "");
  const [editando, setEditando] = useState(!perfil.faixa);
  const [erros, setErros] = useState([]);

  const salvar = () => {
    const candidato = novoPerfil({ faixa, graus, dataInicio });
    const { valido, erros: novosErros } = validarPerfil(candidato);
    if (!valido || !dataInicio) {
      setErros(dataInicio ? novosErros : [...novosErros, "data de início é obrigatória"]);
      return;
    }
    const historicoAnterior = perfil.historico || [];
    const mudou = perfil.faixa !== faixa || perfil.graus !== graus;
    const novoHistorico = mudou
      ? [...historicoAnterior, { faixa, graus, data: new Date().toISOString().slice(0, 10) }]
      : historicoAnterior;
    setErros([]);
    onSalvar({ ...candidato, historico: novoHistorico });
    setEditando(false);
  };

  const info = faixa ? faixaInfo(faixa) : null;
  const tempo = tempoDeTatame(dataInicio);
  const totalTreinos = treinos.length;

  const conteudoFaixa =
    !editando && info ? (
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <Panel accentBorder={info.cor}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <BeltMark cor={info.cor} graus={graus} size={48} />
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 30, lineHeight: 1 }}>
                Faixa {info.nome}
              </div>
              <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
                {graus} {graus === 1 ? "grau" : "graus"}
                {tempo && ` · treinando há ${tempo}`}
              </div>
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <Botao variante="fantasma" onClick={() => setEditando(true)}>Atualizar graduação</Botao>
          </div>
        </Panel>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
          <MetricaCard rotulo="treinos registrados" valor={totalTreinos} icon={Swords} acento={info.cor} />
          <MetricaCard rotulo="início no jiu-jitsu" valor={dataInicio ? parseData(dataInicio).toLocaleDateString("pt-BR") : "—"} icon={CalendarDays} acento={info.cor} />
        </div>

        {perfil.historico && perfil.historico.length > 0 && (
          <Panel>
            <div style={{ fontWeight: 600, fontSize: 14.5, marginBottom: 10 }}>Linha do tempo de graduação</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[...perfil.historico].reverse().map((h, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5 }}>
                  <BeltMark cor={faixaInfo(h.faixa).cor} graus={h.graus} size={18} />
                  <span>Faixa {h.faixa}, {h.graus} {h.graus === 1 ? "grau" : "graus"}</span>
                  <span style={{ color: "var(--faint)", marginLeft: "auto" }}>{parseData(h.data).toLocaleDateString("pt-BR")}</span>
                </div>
              ))}
            </div>
          </Panel>
        )}
      </div>
    ) : (
      <Panel>
        <div style={{ fontWeight: 600, fontSize: 14.5, marginBottom: 14 }}>
          {perfil.faixa ? "Atualizar graduação" : "Configure sua faixa para começar"}
        </div>

        <Rotulo>Faixa atual</Rotulo>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {FAIXAS_ORDEM.map((nome) => {
            const f = faixaInfo(nome);
            return (
              <button
                key={nome}
                onClick={() => setFaixa(nome)}
                style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", cursor: "pointer",
                  border: `1px solid ${faixa === nome ? "var(--ink)" : "var(--border)"}`,
                  background: faixa === nome ? "#FFFFFF" : "transparent",
                  fontSize: 13, fontFamily: "var(--font-body)",
                }}
              >
                <BeltMark cor={f.cor} graus={0} size={16} />
                {nome}
              </button>
            );
          })}
        </div>

        <Rotulo>Graus — {graus}</Rotulo>
        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          {[0, 1, 2, 3, 4].map((g) => (
            <button
              key={g}
              onClick={() => setGraus(g)}
              style={{
                width: 34, height: 34, cursor: "pointer",
                border: `1px solid ${graus === g ? "var(--ink)" : "var(--border)"}`,
                background: graus === g ? "var(--ink)" : "transparent",
                color: graus === g ? "#F5F4EE" : "var(--ink)",
                fontSize: 13,
              }}
            >
              {g}
            </button>
          ))}
        </div>

        <Rotulo>Quando começou a treinar</Rotulo>
        <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} style={{ ...inputStyle, maxWidth: 200 }} />

        {erros.length > 0 && (
          <div style={{ marginTop: 12, fontSize: 13, color: "#A23B2E" }}>
            {erros.map((e, i) => <div key={i}>• {e}</div>)}
          </div>
        )}

        <div style={{ marginTop: 18, display: "flex", gap: 8 }}>
          <Botao variante="acento" acento={faixa ? faixaInfo(faixa).cor : undefined} onClick={salvar}>
            <Check size={15} /> Salvar
          </Botao>
          {perfil.faixa && (
            <Botao variante="fantasma" onClick={() => { setFaixa(perfil.faixa); setGraus(perfil.graus); setDataInicio(perfil.dataInicio); setErros([]); setEditando(false); }}>
              Cancelar
            </Botao>
          )}
        </div>
      </Panel>
    );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {conteudoFaixa}
      <Backup estado={estado} onRestaurar={onRestaurar} />
    </div>
  );
}
