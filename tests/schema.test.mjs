import test from "node:test";
import assert from "node:assert/strict";
import {
  novoTreino,
  validarTreino,
  novoPerfil,
  validarPerfil,
  migrarDados,
  SCHEMA_VERSION,
} from "../src/domain/schema.js";

test("novoTreino aplica defaults sensatos", () => {
  const t = novoTreino({ local: "Lethal Top Team" });
  assert.equal(t.tipoTreino, "Livre");
  assert.equal(t.duracaoMinutos, 60);
  assert.equal(t.intensidade, 3);
  assert.deepEqual(t.rolas, []);
  assert.ok(t.id);
});

test("validarTreino rejeita local vazio, data inválida e intensidade fora do range", () => {
  const { valido, erros } = validarTreino(
    novoTreino({ local: "", data: "não-é-data", intensidade: 9 })
  );
  assert.equal(valido, false);
  assert.ok(erros.some((e) => e.includes("local")));
  assert.ok(erros.some((e) => e.includes("data")));
  assert.ok(erros.some((e) => e.includes("intensidade")));
});

test("validarTreino aceita um treino bem formado", () => {
  const t = novoTreino({
    local: "Lethal Top Team",
    data: "2026-09-01",
    rolas: [{ tipoEvento: "Aplicada", nomePosicao: "Armlock", quantidade: 2 }],
  });
  assert.deepEqual(validarTreino(t), { valido: true, erros: [] });
});

test("validarTreino rejeita rola incompleta", () => {
  const t = novoTreino({
    local: "Academia",
    rolas: [{ tipoEvento: "Aplicada", nomePosicao: "", quantidade: 1 }],
  });
  assert.equal(validarTreino(t).valido, false);
});

test("validarPerfil rejeita faixa desconhecida e graus fora do range", () => {
  assert.equal(validarPerfil(novoPerfil({ faixa: "Verde" })).valido, false);
  assert.equal(validarPerfil(novoPerfil({ graus: 7 })).valido, false);
  assert.equal(validarPerfil(novoPerfil({ faixa: "Azul", graus: 2 })).valido, true);
});

test("migrarDados aceita estado vazio/ausente sem quebrar", () => {
  const estado = migrarDados(undefined);
  assert.equal(estado.versao, SCHEMA_VERSION);
  assert.deepEqual(estado.treinos, []);
});

test("migrarDados traz dados do formato antigo (sem campo 'versao') pro formato atual", () => {
  const dadosAntigos = {
    treinos: [{ data: "2026-08-19", local: "Lethal Top Team", rolas: [] }],
    catalogo: ["Armlock"],
    perfil: { faixa: "Azul" },
  };
  const migrado = migrarDados(dadosAntigos);
  assert.equal(migrado.versao, SCHEMA_VERSION);
  assert.equal(migrado.treinos[0].tipoTreino, "Livre"); // ganhou o default
  assert.equal(migrado.perfil.graus, 0); // ganhou o default
});
