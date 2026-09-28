import React, { useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import { Panel, Rotulo, inputStyle, Botao } from "./ui.jsx";
import { novoTreino, validarTreino } from "../domain/schema.js";

export function NovoTreino({ catalogo, acento, onSalvar }) {
  const hojeStr = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    data: hojeStr, tipoTreino: "Livre", local: "", instrutor: "",
    duracaoMinutos: 60, intensidade: 3, isCompeticao: false,
    houveLesao: false, gravidadeLesao: "", observacoes: "",
  });
  const [rolas, setRolas] = useState([]);
  const [novaRola, setNovaRola] = useState({ tipoEvento: "Aplicada", nomePosicao: catalogo[0] || "", quantidade: 1, novaPosicaoTexto: "" });
  const [usandoNovaPosicao, setUsandoNovaPosicao] = useState(false);
  const [erros, setErros] = useState([]);

  const set = (campo, valor) => setForm((f) => ({ ...f, [campo]: valor }));

  const adicionarRola = () => {
    const nome = usandoNovaPosicao ? novaRola.novaPosicaoTexto.trim() : novaRola.nomePosicao;
    if (!nome) return;
    setRolas((r) => [...r, { tipoEvento: novaRola.tipoEvento, nomePosicao: nome, quantidade: novaRola.quantidade }]);
    setNovaRola({ tipoEvento: "Aplicada", nomePosicao: catalogo[0] || "", quantidade: 1, novaPosicaoTexto: "" });
    setUsandoNovaPosicao(false);
  };

  const removerRola = (idx) => setRolas((r) => r.filter((_, i) => i !== idx));

  const handleSalvar = () => {
    const candidato = novoTreino({
      ...form,
      duracaoMinutos: Number(form.duracaoMinutos) || 0,
      intensidade: Number(form.intensidade),
      rolas,
    });
    const { valido, erros: novosErros } = validarTreino(candidato);
    if (!valido) {
      setErros(novosErros);
      return;
    }
    setErros([]);
    onSalvar(candidato);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <Panel>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <Rotulo>Data</Rotulo>
            <input type="date" value={form.data} onChange={(e) => set("data", e.target.value)} style={inputStyle} />
          </div>
          <div>
            <Rotulo>Tipo de sessão</Rotulo>
            <select value={form.tipoTreino} onChange={(e) => set("tipoTreino", e.target.value)} style={inputStyle}>
              {["Livre", "Open Mat", "Drills", "Competição"].map((op) => <option key={op} value={op}>{op}</option>)}
            </select>
          </div>
          <div>
            <Rotulo>Local / academia</Rotulo>
            <input value={form.local} onChange={(e) => set("local", e.target.value)} placeholder="Ex: Lethal Top Team" style={inputStyle} />
          </div>
          <div>
            <Rotulo>Professor</Rotulo>
            <input value={form.instrutor} onChange={(e) => set("instrutor", e.target.value)} placeholder="Ex: Alex" style={inputStyle} />
          </div>
          <div>
            <Rotulo>Duração (minutos)</Rotulo>
            <input type="number" min="0" value={form.duracaoMinutos} onChange={(e) => set("duracaoMinutos", e.target.value)} style={inputStyle} />
          </div>
          <div>
            <Rotulo>Intensidade — {form.intensidade}/5</Rotulo>
            <input type="range" min="1" max="5" value={form.intensidade} onChange={(e) => set("intensidade", e.target.value)}
              style={{ width: "100%", accentColor: acento, marginTop: 10 }} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 20, marginTop: 14 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13.5, cursor: "pointer" }}>
            <input type="checkbox" checked={form.isCompeticao} onChange={(e) => set("isCompeticao", e.target.checked)} />
            Foi uma competição
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13.5, cursor: "pointer" }}>
            <input type="checkbox" checked={form.houveLesao} onChange={(e) => set("houveLesao", e.target.checked)} />
            Houve lesão
          </label>
        </div>

        {form.houveLesao && (
          <div style={{ marginTop: 10 }}>
            <Rotulo>Gravidade da lesão</Rotulo>
            <input value={form.gravidadeLesao} onChange={(e) => set("gravidadeLesao", e.target.value)} placeholder="Leve, moderada, grave…" style={inputStyle} />
          </div>
        )}

        <div style={{ marginTop: 14 }}>
          <Rotulo>Observações</Rotulo>
          <textarea value={form.observacoes} onChange={(e) => set("observacoes", e.target.value)} rows={2}
            placeholder="Resumo do dia, o que treinar na próxima…" style={{ ...inputStyle, resize: "vertical" }} />
        </div>
      </Panel>

      <Panel>
        <div style={{ fontWeight: 600, fontSize: 14.5, marginBottom: 10 }}>Posições e finalizações</div>

        {rolas.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
            {rolas.map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#FFFFFF", border: "1px solid var(--border)", padding: "7px 10px", fontSize: 13.5 }}>
                <span>
                  <strong>{r.quantidade}x</strong> {r.nomePosicao}
                  <span style={{ color: r.tipoEvento === "Aplicada" ? "#3D7A4E" : "#A23B2E", marginLeft: 8, fontSize: 12 }}>
                    {r.tipoEvento === "Aplicada" ? "aplicada" : "sofrida"}
                  </span>
                </span>
                <button onClick={() => removerRola(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)" }}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 8, alignItems: "end" }}>
          <div>
            <Rotulo>Evento</Rotulo>
            <select value={novaRola.tipoEvento} onChange={(e) => setNovaRola((n) => ({ ...n, tipoEvento: e.target.value }))} style={{ ...inputStyle, width: 120 }}>
              <option value="Aplicada">Aplicada</option>
              <option value="Sofrida">Sofrida</option>
            </select>
          </div>
          <div>
            <Rotulo>Posição</Rotulo>
            {!usandoNovaPosicao ? (
              <select
                value={novaRola.nomePosicao}
                onChange={(e) => {
                  if (e.target.value === "__nova__") setUsandoNovaPosicao(true);
                  else setNovaRola((n) => ({ ...n, nomePosicao: e.target.value }));
                }}
                style={inputStyle}
              >
                {catalogo.map((p) => <option key={p} value={p}>{p}</option>)}
                <option value="__nova__">+ Adicionar nova posição…</option>
              </select>
            ) : (
              <input
                autoFocus
                value={novaRola.novaPosicaoTexto}
                onChange={(e) => setNovaRola((n) => ({ ...n, novaPosicaoTexto: e.target.value }))}
                placeholder="Nome da posição"
                style={inputStyle}
              />
            )}
          </div>
          <div>
            <Rotulo>Qtd</Rotulo>
            <input type="number" min="1" value={novaRola.quantidade}
              onChange={(e) => setNovaRola((n) => ({ ...n, quantidade: Number(e.target.value) || 1 }))}
              style={{ ...inputStyle, width: 70 }} />
          </div>
        </div>
        <div style={{ marginTop: 10 }}>
          <Botao variante="fantasma" onClick={adicionarRola}><Plus size={14} /> Adicionar</Botao>
        </div>
      </Panel>

      {erros.length > 0 && (
        <Panel accentBorder="#A23B2E">
          <div style={{ fontSize: 13.5, color: "#A23B2E" }}>
            {erros.map((e, i) => <div key={i}>• {e}</div>)}
          </div>
        </Panel>
      )}

      <div>
        <Botao variante="acento" acento={acento} onClick={handleSalvar}>
          <Check size={15} /> Salvar treino
        </Botao>
      </div>
    </div>
  );
}
