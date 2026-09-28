import React, { useState } from "react";
import { Download, Copy, Upload, Check, X } from "lucide-react";
import { Panel, Botao, Rotulo } from "./ui.jsx";
import { serializarEstado, desserializarEstado, nomeArquivoBackup } from "../data/exportImport.js";

function baixarArquivo(texto, nomeArquivo) {
  const blob = new Blob([texto], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeArquivo;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function Backup({ estado, onRestaurar }) {
  const [copiado, setCopiado] = useState(false);
  const [erroImportacao, setErroImportacao] = useState(null);
  const [pendente, setPendente] = useState(null); // estado importado aguardando confirmação

  const exportar = () => {
    baixarArquivo(serializarEstado(estado), nomeArquivoBackup());
  };

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(serializarEstado(estado));
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setErroImportacao(null); // não é erro de importação, mas evita estado sujo
      alert("Não deu pra copiar automaticamente. Tente o botão de baixar arquivo.");
    }
  };

  const handleArquivoSelecionado = async (e) => {
    const arquivo = e.target.files?.[0];
    e.target.value = ""; // permite selecionar o mesmo arquivo de novo depois
    if (!arquivo) return;
    try {
      const texto = await arquivo.text();
      const estadoImportado = desserializarEstado(texto);
      setErroImportacao(null);
      setPendente(estadoImportado);
    } catch (err) {
      setErroImportacao(err.message);
      setPendente(null);
    }
  };

  const confirmarRestauracao = () => {
    onRestaurar(pendente);
    setPendente(null);
  };

  return (
    <Panel>
      <div style={{ fontWeight: 600, fontSize: 14.5, marginBottom: 4 }}>Backup</div>
      <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 14px" }}>
        Seus dados ficam salvos neste dispositivo/conta. Exporte de vez em quando
        pra ter uma cópia de verdade, ou pra levar seu histórico pra outro lugar.
      </p>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
        <Botao variante="fantasma" onClick={exportar}>
          <Download size={14} /> Baixar arquivo (.json)
        </Botao>
        <Botao variante="fantasma" onClick={copiar}>
          {copiado ? <Check size={14} /> : <Copy size={14} />} {copiado ? "Copiado!" : "Copiar dados"}
        </Botao>
      </div>

      <Rotulo>Restaurar a partir de um backup</Rotulo>
      <label
        style={{
          display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer",
          border: "1px solid var(--border)", padding: "9px 14px", fontSize: 13.5,
        }}
      >
        <Upload size={14} /> Escolher arquivo…
        <input type="file" accept=".json,application/json" onChange={handleArquivoSelecionado} style={{ display: "none" }} />
      </label>

      {erroImportacao && (
        <p style={{ fontSize: 13, color: "#A23B2E", marginTop: 10 }}>{erroImportacao}</p>
      )}

      {pendente && (
        <div style={{ marginTop: 14, padding: 12, background: "#F3E3D9", border: "1px solid #D9B7A0" }}>
          <p style={{ fontSize: 13, color: "#7A3A1D", margin: "0 0 10px" }}>
            Esse arquivo tem <strong>{pendente.treinos.length}</strong>{" "}
            {pendente.treinos.length === 1 ? "treino" : "treinos"}. Restaurar vai{" "}
            <strong>substituir todos os dados atuais</strong> ({estado.treinos.length}{" "}
            {estado.treinos.length === 1 ? "treino" : "treinos"} salvos agora). Essa ação não pode ser desfeita.
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <Botao variante="perigo" onClick={confirmarRestauracao} style={{ padding: "6px 12px", fontSize: 12.5 }}>
              Substituir e restaurar
            </Botao>
            <Botao variante="fantasma" onClick={() => setPendente(null)} style={{ padding: "6px 12px", fontSize: 12.5 }}>
              <X size={13} /> Cancelar
            </Botao>
          </div>
        </div>
      )}
    </Panel>
  );
}
