// Tokens de apresentação. A ORDEM das faixas é uma regra de domínio (está
// em domain/schema.js); a COR de cada uma é só estilo, por isso mora aqui.

export const CORES_FAIXA = {
  Branca: { cor: "#EDE9DD", texto: "#1B1F27" },
  Azul: { cor: "#2F63B0", texto: "#F5F4EE" },
  Roxa: { cor: "#6B3FA0", texto: "#F5F4EE" },
  Marrom: { cor: "#6E4324", texto: "#F5F4EE" },
  Preta: { cor: "#C42A2E", texto: "#F5F4EE" }, // barra vermelha do grau
};

export const ACENTO_PADRAO = "#B5583C";

export function faixaInfo(nome) {
  return CORES_FAIXA[nome] ? { nome, ...CORES_FAIXA[nome] } : { nome: "—", cor: ACENTO_PADRAO, texto: "#F5F4EE" };
}

export const FONTE_DISPLAY = "'Bebas Neue', sans-serif";
export const FONTE_CORPO = "'IBM Plex Sans', -apple-system, sans-serif";

export const GOOGLE_FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap";
