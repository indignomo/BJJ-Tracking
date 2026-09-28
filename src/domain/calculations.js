// Regras de cálculo do domínio (datas, duração, streak, agregações).
// Nada aqui depende de React nem de como os dados são carregados —
// por isso dá pra testar com `node --test` puro, sem subir a aplicação.

export function parseData(dataStr) {
  const [y, m, d] = dataStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatDataCurta(dataStr) {
  const dt = parseData(dataStr);
  return dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(".", "");
}

export function formatDuracao(min) {
  if (!min) return "0min";
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

export function tempoDeTatame(dataInicio, hoje = new Date()) {
  if (!dataInicio) return null;
  const inicio = parseData(dataInicio);
  let meses = (hoje.getFullYear() - inicio.getFullYear()) * 12 + (hoje.getMonth() - inicio.getMonth());
  if (hoje.getDate() < inicio.getDate()) meses -= 1;
  if (meses < 1) return "menos de um mês";
  const anos = Math.floor(meses / 12);
  const restoMeses = meses % 12;
  const partes = [];
  if (anos > 0) partes.push(`${anos} ${anos === 1 ? "ano" : "anos"}`);
  if (restoMeses > 0) partes.push(`${restoMeses} ${restoMeses === 1 ? "mês" : "meses"}`);
  return partes.join(" e ");
}

/** Segunda-feira (00:00) da semana em que a data cai. */
export function inicioDaSemana(dt) {
  const d = new Date(dt);
  const dia = (d.getDay() + 6) % 7; // 0 = segunda
  d.setDate(d.getDate() - dia);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Nº de semanas seguidas (até a atual ou a anterior) com pelo menos um treino. */
export function calcularStreakSemanas(treinos, hoje = new Date()) {
  if (treinos.length === 0) return 0;
  const semanas = new Set(treinos.map((t) => inicioDaSemana(parseData(t.data)).getTime()));
  let cursor = inicioDaSemana(hoje);
  if (!semanas.has(cursor.getTime())) {
    cursor = new Date(cursor);
    cursor.setDate(cursor.getDate() - 7);
  }
  let streak = 0;
  while (semanas.has(cursor.getTime())) {
    streak += 1;
    cursor = new Date(cursor);
    cursor.setDate(cursor.getDate() - 7);
  }
  return streak;
}

/** Matriz semana x dia (segunda a domingo) para desenhar o calendário do mês. */
export function matrizMes(ano, mes) {
  const primeiroDia = new Date(ano, mes, 1);
  const ultimoDia = new Date(ano, mes + 1, 0).getDate();
  const offset = (primeiroDia.getDay() + 6) % 7;
  const celulas = [];
  for (let i = 0; i < offset; i++) celulas.push(null);
  for (let d = 1; d <= ultimoDia; d++) celulas.push(d);
  while (celulas.length % 7 !== 0) celulas.push(null);
  const semanas = [];
  for (let i = 0; i < celulas.length; i += 7) semanas.push(celulas.slice(i, i + 7));
  return semanas;
}

/** Top posições por tipo de evento ("Aplicada" | "Sofrida"), ordenado por total desc. */
export function agregarPosicoes(treinos, evento, limite = 5) {
  const mapa = {};
  treinos.forEach((t) =>
    t.rolas.forEach((r) => {
      if (r.tipoEvento === evento) mapa[r.nomePosicao] = (mapa[r.nomePosicao] || 0) + r.quantidade;
    })
  );
  return Object.entries(mapa)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limite)
    .map(([nome, total]) => ({ nome, total }));
}

export function filtrarPorPeriodo(treinos, dias, hoje = new Date()) {
  if (dias === "todos") return treinos;
  const corte = new Date(hoje);
  corte.setDate(corte.getDate() - Number(dias));
  return treinos.filter((t) => parseData(t.data) >= corte);
}

export function totalMinutos(treinos) {
  return treinos.reduce((s, t) => s + (t.duracaoMinutos || 0), 0);
}

export function totalRolasAplicadas(treinos) {
  return treinos.reduce(
    (s, t) => s + t.rolas.filter((r) => r.tipoEvento === "Aplicada").reduce((a, r) => a + r.quantidade, 0),
    0
  );
}
