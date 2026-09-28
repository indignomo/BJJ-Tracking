// Modelo de dados do domínio (independente de UI e de onde os dados são
// guardados). Qualquer regra sobre "o que é um treino válido" mora aqui.

export const SCHEMA_VERSION = 1;

export const FAIXAS_ORDEM = ["Branca", "Azul", "Roxa", "Marrom", "Preta"];

export function gerarId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/** Cria um treino aplicando valores padrão para campos ausentes. */
export function novoTreino(dados = {}) {
  return {
    id: dados.id ?? gerarId(),
    data: dados.data ?? new Date().toISOString().slice(0, 10),
    tipoTreino: dados.tipoTreino ?? "Livre",
    local: dados.local ?? "",
    instrutor: dados.instrutor ?? "",
    duracaoMinutos: dados.duracaoMinutos ?? 60,
    intensidade: dados.intensidade ?? 3,
    isCompeticao: dados.isCompeticao ?? false,
    houveLesao: dados.houveLesao ?? false,
    gravidadeLesao: dados.gravidadeLesao ?? "",
    observacoes: dados.observacoes ?? "",
    rolas: Array.isArray(dados.rolas) ? dados.rolas : [],
  };
}

/** Valida um treino. Retorna { valido, erros }. Nunca lança exceção. */
export function validarTreino(treino) {
  const erros = [];
  if (!treino || typeof treino !== "object") {
    return { valido: false, erros: ["treino ausente ou inválido"] };
  }
  if (!treino.data || Number.isNaN(Date.parse(treino.data))) {
    erros.push("data inválida");
  }
  if (!treino.local || !String(treino.local).trim()) {
    erros.push("local é obrigatório");
  }
  if (typeof treino.duracaoMinutos !== "number" || treino.duracaoMinutos < 0) {
    erros.push("duração deve ser um número maior ou igual a zero");
  }
  if (
    typeof treino.intensidade !== "number" ||
    treino.intensidade < 1 ||
    treino.intensidade > 5
  ) {
    erros.push("intensidade deve estar entre 1 e 5");
  }
  if (!Array.isArray(treino.rolas)) {
    erros.push("rolas deve ser uma lista");
  } else {
    treino.rolas.forEach((r, i) => {
      if (!r.nomePosicao || !["Aplicada", "Sofrida"].includes(r.tipoEvento) || !(r.quantidade > 0)) {
        erros.push(`rola #${i + 1} está incompleta`);
      }
    });
  }
  return { valido: erros.length === 0, erros };
}

/** Cria um perfil de faixa aplicando valores padrão. */
export function novoPerfil(dados = {}) {
  return {
    faixa: dados.faixa ?? null,
    graus: dados.graus ?? 0,
    dataInicio: dados.dataInicio ?? "",
    historico: Array.isArray(dados.historico) ? dados.historico : [],
  };
}

export function validarPerfil(perfil) {
  const erros = [];
  if (!perfil || typeof perfil !== "object") return { valido: false, erros: ["perfil ausente"] };
  if (perfil.faixa && !FAIXAS_ORDEM.includes(perfil.faixa)) erros.push("faixa desconhecida");
  if (typeof perfil.graus !== "number" || perfil.graus < 0 || perfil.graus > 4) {
    erros.push("graus deve estar entre 0 e 4");
  }
  return { valido: erros.length === 0, erros };
}

/**
 * Estado completo salvo. Junta treinos + catálogo de posições + perfil,
 * sempre com um número de versão — é o que permite migrar dados antigos
 * sem quebrar quem já estava usando o app.
 */
export function novoEstado(dados = {}) {
  return {
    versao: SCHEMA_VERSION,
    treinos: (dados.treinos ?? []).map(novoTreino),
    catalogo: dados.catalogo ?? [],
    perfil: novoPerfil(dados.perfil ?? {}),
  };
}

/**
 * Recebe o que quer que esteja salvo (inclusive o formato antigo, salvo
 * pela primeira versão do app, sem campo "versao") e devolve sempre um
 * estado no formato atual. É o único lugar que precisa mudar quando o
 * schema evoluir.
 */
export function migrarDados(bruto) {
  if (!bruto || typeof bruto !== "object") return novoEstado();
  if (bruto.versao === SCHEMA_VERSION) return novoEstado(bruto);
  // v0 (formato salvo antes de existir número de versão) -> v1:
  // os dados têm o mesmo shape, só precisam passar pelos defaults.
  return novoEstado(bruto);
}
