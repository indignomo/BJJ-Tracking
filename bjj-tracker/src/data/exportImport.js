// Formato de transporte para backup manual (exportar/importar). Fica em
// data/ porque é sobre "como os dados atravessam a fronteira do app" — não
// é regra de negócio, mas também não é UI.

import { migrarDados } from "../domain/schema.js";

export function serializarEstado(estado) {
  return JSON.stringify(estado, null, 2);
}

/**
 * Lê um texto (presumivelmente vindo de um arquivo .json exportado antes)
 * e devolve um estado já validado/migrado. Lança um Error com mensagem
 * amigável em vez de deixar o JSON.parse estourar cru.
 */
export function desserializarEstado(texto) {
  let bruto;
  try {
    bruto = JSON.parse(texto);
  } catch {
    throw new Error("Esse arquivo não é um JSON válido.");
  }
  if (!bruto || typeof bruto !== "object" || !Array.isArray(bruto.treinos)) {
    throw new Error("Esse arquivo não parece ser um backup do tatame.");
  }
  return migrarDados(bruto);
}

export function nomeArquivoBackup(data = new Date()) {
  return `tatame-backup-${data.toISOString().slice(0, 10)}.json`;
}
