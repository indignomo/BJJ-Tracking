import test from "node:test";
import assert from "node:assert/strict";
import {
  formatDuracao,
  tempoDeTatame,
  calcularStreakSemanas,
  matrizMes,
  agregarPosicoes,
  filtrarPorPeriodo,
  totalMinutos,
  totalRolasAplicadas,
  inicioDaSemana,
  parseData,
} from "../src/domain/calculations.js";

test("formatDuracao", () => {
  assert.equal(formatDuracao(0), "0min");
  assert.equal(formatDuracao(45), "45min");
  assert.equal(formatDuracao(60), "1h");
  assert.equal(formatDuracao(90), "1h 30min");
  assert.equal(formatDuracao(125), "2h 5min");
});

test("tempoDeTatame - menos de um mês", () => {
  const hoje = new Date(2026, 8, 10); // 10/set/2026
  assert.equal(tempoDeTatame("2026-09-01", hoje), "menos de um mês");
});

test("tempoDeTatame - meses e anos", () => {
  const hoje = new Date(2026, 8, 10);
  assert.equal(tempoDeTatame("2026-06-15", hoje), "2 meses"); // ainda não fez 3 meses (dia 15 > 10)
  assert.equal(tempoDeTatame("2024-03-10", hoje), "2 anos e 6 meses");
  assert.equal(tempoDeTatame("2020-09-10", hoje), "6 anos");
});

test("tempoDeTatame - sem data", () => {
  assert.equal(tempoDeTatame(""), null);
  assert.equal(tempoDeTatame(null), null);
});

test("inicioDaSemana sempre cai numa segunda-feira", () => {
  // quarta-feira 09/set/2026
  const inicio = inicioDaSemana(new Date(2026, 8, 9));
  assert.equal(inicio.getDay(), 1);
  assert.equal(inicio.getDate(), 7);
});

test("calcularStreakSemanas - semanas consecutivas contando a atual", () => {
  const hoje = new Date(2026, 8, 10); // quinta, semana de 07/set
  const treinos = [
    { data: "2026-09-08" }, // semana de 07/set (atual)
    { data: "2026-08-31" }, // semana de 31/ago
    { data: "2026-08-20" }, // semana de 17/ago (quebra o streak - pula uma semana)
  ];
  assert.equal(calcularStreakSemanas(treinos, hoje), 2);
});

test("calcularStreakSemanas - conta a partir da semana passada se ainda não treinou essa semana", () => {
  const hoje = new Date(2026, 8, 10);
  // 25/ago (semana de 24/ago) e 31/ago (semana de 31/ago) são semanas consecutivas
  const treinos = [{ data: "2026-08-31" }, { data: "2026-08-25" }];
  assert.equal(calcularStreakSemanas(treinos, hoje), 2);
});

test("calcularStreakSemanas - semana isolada no passado não estende a sequência atual", () => {
  const hoje = new Date(2026, 8, 10);
  // semana de 31/ago tem treino (âncora), mas a de 24/ago não -> streak para em 1,
  // mesmo havendo um treino isolado na semana de 17/ago.
  const treinos = [{ data: "2026-08-31" }, { data: "2026-08-18" }];
  assert.equal(calcularStreakSemanas(treinos, hoje), 1);
});

test("calcularStreakSemanas - vazio", () => {
  assert.equal(calcularStreakSemanas([]), 0);
});

test("matrizMes - semanas somam 7 dias e cobrem o mês inteiro", () => {
  const semanas = matrizMes(2026, 8); // setembro/2026 (30 dias)
  const dias = semanas.flat().filter((d) => d !== null);
  assert.equal(dias.length, 30);
  semanas.forEach((s) => assert.equal(s.length, 7));
});

test("matrizMes - início na coluna certa (segunda = coluna 0)", () => {
  // 01/set/2026 é uma terça-feira -> deve haver 1 célula vazia antes
  const semanas = matrizMes(2026, 8);
  assert.equal(semanas[0][0], null);
  assert.equal(semanas[0][1], 1);
});

test("agregarPosicoes - soma quantidades e ordena por total", () => {
  const treinos = [
    { rolas: [{ tipoEvento: "Aplicada", nomePosicao: "Triângulo", quantidade: 2 }] },
    { rolas: [{ tipoEvento: "Aplicada", nomePosicao: "Armlock", quantidade: 5 }] },
    { rolas: [{ tipoEvento: "Sofrida", nomePosicao: "Armlock", quantidade: 9 }] },
  ];
  const aplicadas = agregarPosicoes(treinos, "Aplicada");
  assert.deepEqual(aplicadas, [
    { nome: "Armlock", total: 5 },
    { nome: "Triângulo", total: 2 },
  ]);
  const sofridas = agregarPosicoes(treinos, "Sofrida");
  assert.deepEqual(sofridas, [{ nome: "Armlock", total: 9 }]);
});

test("filtrarPorPeriodo", () => {
  const hoje = new Date(2026, 8, 10);
  const treinos = [{ data: "2026-09-09" }, { data: "2026-07-01" }];
  assert.equal(filtrarPorPeriodo(treinos, "7", hoje).length, 1);
  assert.equal(filtrarPorPeriodo(treinos, "todos", hoje).length, 2);
});

test("totalMinutos e totalRolasAplicadas", () => {
  const treinos = [
    { duracaoMinutos: 60, rolas: [{ tipoEvento: "Aplicada", quantidade: 2 }] },
    { duracaoMinutos: 45, rolas: [{ tipoEvento: "Sofrida", quantidade: 3 }] },
  ];
  assert.equal(totalMinutos(treinos), 105);
  assert.equal(totalRolasAplicadas(treinos), 2);
});

test("parseData não sofre com fuso horário (compara ano/mês/dia locais)", () => {
  const d = parseData("2026-01-31");
  assert.equal(d.getFullYear(), 2026);
  assert.equal(d.getMonth(), 0);
  assert.equal(d.getDate(), 31);
});
