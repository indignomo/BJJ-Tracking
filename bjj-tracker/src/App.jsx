import React, { useEffect, useState } from "react";
import {
  Plus, X, LayoutGrid, History, BarChart3, UserRound,
} from "lucide-react";
import { criarRepositorio } from "./data/repository.js";
import { novoEstado } from "./domain/schema.js";
import { faixaInfo, ACENTO_PADRAO, GOOGLE_FONTS_URL } from "./styles/tokens.js";
import { TopBar } from "./components/TopBar.jsx";
import { Painel } from "./components/Painel.jsx";
import { NovoTreino } from "./components/NovoTreino.jsx";
import { Historico } from "./components/Historico.jsx";
import { Estatisticas } from "./components/Estatisticas.jsx";
import { Perfil } from "./components/Perfil.jsx";

const repositorio = criarRepositorio();

const ABAS = [
  { id: "painel", label: "Painel", icon: LayoutGrid },
  { id: "novo", label: "Registrar treino", icon: Plus },
  { id: "historico", label: "Histórico", icon: History },
  { id: "estatisticas", label: "Estatísticas", icon: BarChart3 },
  { id: "perfil", label: "Faixa", icon: UserRound },
];

export default function App() {
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [estado, setEstado] = useState(novoEstado());
  const [aba, setAba] = useState("painel");

  useEffect(() => {
    const idFonte = "tatame-fonts";
    if (!document.getElementById(idFonte)) {
      const link = document.createElement("link");
      link.id = idFonte;
      link.rel = "stylesheet";
      link.href = GOOGLE_FONTS_URL;
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const carregado = await repositorio.carregar();
      setEstado(carregado);
      setCarregando(false);
    })();
  }, []);

  const persistir = async (novoEstadoCompleto) => {
    setEstado(novoEstadoCompleto);
    setSalvando(true);
    try {
      await repositorio.salvar(novoEstadoCompleto);
    } catch {
      setErro("Não foi possível salvar agora. Seus dados continuam nesta tela — tente novamente em instantes.");
    } finally {
      setSalvando(false);
    }
  };

  const adicionarTreino = (treino) => {
    const novasPosicoes = treino.rolas.map((r) => r.nomePosicao).filter((n) => !estado.catalogo.includes(n));
    persistir({
      ...estado,
      treinos: [treino, ...estado.treinos],
      catalogo: novasPosicoes.length ? [...estado.catalogo, ...novasPosicoes] : estado.catalogo,
    });
    setAba("painel");
  };

  const removerTreino = (id) => {
    persistir({ ...estado, treinos: estado.treinos.filter((t) => t.id !== id) });
  };

  const atualizarPerfil = (novoPerfil) => {
    persistir({ ...estado, perfil: novoPerfil });
  };

  const restaurarDeBackup = (estadoImportado) => {
    persistir(estadoImportado);
    setAba("painel");
  };

  const acento = estado.perfil.faixa ? faixaInfo(estado.perfil.faixa).cor : ACENTO_PADRAO;

  if (carregando) {
    return (
      <Casca acento={acento}>
        <div style={{ padding: "48px 4px", color: "var(--muted)", fontFamily: "var(--font-body)" }}>
          Abrindo o tatame…
        </div>
      </Casca>
    );
  }

  return (
    <Casca acento={acento}>
      <TopBar perfil={estado.perfil} acento={acento} />
      <nav style={navStyle}>
        {ABAS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setAba(id)}
            style={{
              ...navBtnStyle,
              color: aba === id ? "var(--ink)" : "var(--muted)",
              borderBottom: aba === id ? `2px solid ${acento}` : "2px solid transparent",
              fontWeight: aba === id ? 600 : 500,
            }}
          >
            <Icon size={15} strokeWidth={2} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {erro && (
        <div style={bannerErroStyle}>
          <span>{erro}</span>
          <button onClick={() => setErro(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit" }}>
            <X size={14} />
          </button>
        </div>
      )}

      <main style={{ padding: "20px 4px 64px" }}>
        {aba === "painel" && <Painel treinos={estado.treinos} acento={acento} irPara={setAba} />}
        {aba === "novo" && <NovoTreino catalogo={estado.catalogo} acento={acento} onSalvar={adicionarTreino} />}
        {aba === "historico" && <Historico treinos={estado.treinos} acento={acento} onRemover={removerTreino} />}
        {aba === "estatisticas" && <Estatisticas treinos={estado.treinos} acento={acento} />}
        {aba === "perfil" && (
          <Perfil perfil={estado.perfil} onSalvar={atualizarPerfil} treinos={estado.treinos} estado={estado} onRestaurar={restaurarDeBackup} />
        )}
      </main>
      <footer style={{ padding: "12px 4px 32px", fontSize: 12, color: "var(--faint)", fontFamily: "var(--font-body)" }}>
        {salvando ? "salvando…" : "tudo salvo neste dispositivo"}
      </footer>
    </Casca>
  );
}

function Casca({ acento, children }) {
  return (
    <div
      style={{
        "--ink": "#1B1F27",
        "--muted": "#6B6459",
        "--faint": "#9A9384",
        "--canvas": "#EDEAE0",
        "--panel": "#F7F5EF",
        "--border": "#D9D4C4",
        "--font-display": "'Bebas Neue', sans-serif",
        "--font-body": "'IBM Plex Sans', -apple-system, sans-serif",
        "--acento": acento,
        background: "var(--canvas)",
        color: "var(--ink)",
        fontFamily: "var(--font-body)",
        minHeight: "100%",
        width: "100%",
        maxWidth: 880,
        margin: "0 auto",
        padding: "0 16px",
        boxSizing: "border-box",
      }}
    >
      {children}
    </div>
  );
}

const navStyle = {
  display: "flex",
  gap: 4,
  borderBottom: "1px solid var(--border)",
  overflowX: "auto",
  scrollbarWidth: "none",
};

const navBtnStyle = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: "10px 12px",
  fontFamily: "var(--font-body)",
  fontSize: 13.5,
  whiteSpace: "nowrap",
};

const bannerErroStyle = {
  marginTop: 14,
  padding: "10px 14px",
  background: "#F3E3D9",
  border: "1px solid #D9B7A0",
  color: "#7A3A1D",
  fontSize: 13,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
};
