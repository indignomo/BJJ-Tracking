import test from "node:test";
import assert from "node:assert/strict";
import { serializarEstado, desserializarEstado, nomeArquivoBackup } from "../src/data/exportImport.js";
import { novoEstado } from "../src/domain/schema.js";

test("serializar + desserializar preserva os dados (round-trip)", () => {
  const estado = novoEstado({
    treinos: [{ local: "Lethal Top Team", data: "2026-09-01", rolas: [{ tipoEvento: "Aplicada", nomePosicao: "Armlock", quantidade: 2 }] }],
    catalogo: ["Armlock"],
    perfil: { faixa: "Azul", graus: 2, dataInicio: "2022-01-01" },
  });
  const texto = serializarEstado(estado);
  const de_volta = desserializarEstado(texto);
  assert.deepEqual(de_volta, estado);
});

test("desserializarEstado rejeita texto que não é JSON", () => {
  assert.throws(() => desserializarEstado("isso não é json"), /JSON válido/);
});

test("desserializarEstado rejeita JSON válido que não é um backup do app", () => {
  assert.throws(() => desserializarEstado(JSON.stringify({ foo: "bar" })), /não parece ser um backup/);
});

test("desserializarEstado migra um backup no formato antigo (sem 'versao')", () => {
  const antigo = JSON.stringify({ treinos: [{ local: "Academia", data: "2020-01-01" }] });
  const estado = desserializarEstado(antigo);
  assert.equal(estado.versao, 1);
  assert.equal(estado.treinos[0].tipoTreino, "Livre");
});

test("nomeArquivoBackup usa a data no formato AAAA-MM-DD", () => {
  const nome = nomeArquivoBackup(new Date(2026, 8, 8));
  assert.equal(nome, "tatame-backup-2026-09-08.json");
});
