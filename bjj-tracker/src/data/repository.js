import { migrarDados, novoEstado } from "../domain/schema.js";
import { criarStorageAdapter } from "./storageAdapter.js";

const CHAVE = "tatame-data";

// Os 3 treinos que já existiam no bjj_tracker.db original — usados só
// como estado inicial de exemplo quando ainda não há nada salvo.
const TREINOS_SEED = [
  {
    id: "seed-1", data: "2026-08-19", tipoTreino: "Livre", local: "Lethal Top Team",
    instrutor: "Alex", duracaoMinutos: 60, intensidade: 2, isCompeticao: false,
    houveLesao: false, gravidadeLesao: "",
    observacoes: "Posições básicas de armlock (da guarda, da laço e da emborcada)",
    rolas: [{ tipoEvento: "Aplicada", nomePosicao: "Armlock", quantidade: 2 }],
  },
  {
    id: "seed-2", data: "2026-08-21", tipoTreino: "Open Mat", local: "Lethal Top Team",
    instrutor: "Alex", duracaoMinutos: 60, intensidade: 4, isCompeticao: false,
    houveLesao: false, gravidadeLesao: "",
    observacoes: "Tomei um acelero brutal de todo casca grossa da academia",
    rolas: [
      { tipoEvento: "Aplicada", nomePosicao: "Triângulo", quantidade: 2 },
      { tipoEvento: "Sofrida", nomePosicao: "Armlock", quantidade: 3 },
      { tipoEvento: "Sofrida", nomePosicao: "Americana", quantidade: 2 },
    ],
  },
  {
    id: "seed-3", data: "2026-08-24", tipoTreino: "Livre", local: "Lethal Top Team",
    instrutor: "Alex", duracaoMinutos: 60, intensidade: 3, isCompeticao: false,
    houveLesao: false, gravidadeLesao: "",
    observacoes: "Treino de passagem de guarda e alguns rolas",
    rolas: [{ tipoEvento: "Sofrida", nomePosicao: "Armlock", quantidade: 4 }],
  },
];

const CATALOGO_PADRAO = [
  "Katagatame", "Darce Choke", "Armlock", "Triângulo", "Omoplata",
  "Kimura", "Guilhotina", "Raspagem", "Passagem de Guarda", "Americana",
];

/**
 * Fábrica do repositório. Recebe um adapter opcional para facilitar teste
 * (injeção de dependência) — em produção, chame sem argumentos.
 */
export function criarRepositorio(adapter = criarStorageAdapter()) {
  return {
    async carregar() {
      const resultado = await adapter.get(CHAVE);
      if (resultado && resultado.value) {
        try {
          return migrarDados(JSON.parse(resultado.value));
        } catch {
          // valor salvo corrompido — não derruba o app, começa do zero
          return novoEstado();
        }
      }
      return novoEstado({ treinos: TREINOS_SEED, catalogo: CATALOGO_PADRAO });
    },

    async salvar(estado) {
      await adapter.set(CHAVE, JSON.stringify(estado));
    },
  };
}
