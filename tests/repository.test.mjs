import test from "node:test";
import assert from "node:assert/strict";
import { criarRepositorio } from "../src/data/repository.js";
import { novoEstado } from "../src/domain/schema.js";

function criarAdapterFalso(inicial = {}) {
  const memoria = new Map(Object.entries(inicial));
  return {
    async get(chave) {
      return memoria.has(chave) ? { key: chave, value: memoria.get(chave) } : null;
    },
    async set(chave, valor) {
      memoria.set(chave, valor);
      return { key: chave, value: valor };
    },
    _memoria: memoria,
  };
}

test("carregar() sem nada salvo devolve os treinos de exemplo (seed)", async () => {
  const repo = criarRepositorio(criarAdapterFalso());
  const estado = await repo.carregar();
  assert.equal(estado.treinos.length, 3);
  assert.equal(estado.versao, 1);
});

test("salvar() e depois carregar() devolve exatamente o que foi salvo", async () => {
  const adapter = criarAdapterFalso();
  const repo = criarRepositorio(adapter);
  const estado = novoEstado({ treinos: [{ local: "Academia X", data: "2026-09-01" }] });
  await repo.salvar(estado);

  const carregado = await repo.carregar();
  assert.equal(carregado.treinos.length, 1);
  assert.equal(carregado.treinos[0].local, "Academia X");
});

test("carregar() com JSON corrompido não quebra — volta pro estado vazio", async () => {
  const adapter = criarAdapterFalso({ "tatame-data": "{ isso não é json válido" });
  const repo = criarRepositorio(adapter);
  const estado = await repo.carregar();
  assert.deepEqual(estado.treinos, []);
});

test("carregar() migra dados salvos no formato antigo (sem 'versao')", async () => {
  const dadosAntigos = JSON.stringify({ treinos: [{ local: "Academia Antiga", data: "2020-01-01" }] });
  const adapter = criarAdapterFalso({ "tatame-data": dadosAntigos });
  const repo = criarRepositorio(adapter);
  const estado = await repo.carregar();
  assert.equal(estado.versao, 1);
  assert.equal(estado.treinos[0].tipoTreino, "Livre"); // recebeu o default
});
