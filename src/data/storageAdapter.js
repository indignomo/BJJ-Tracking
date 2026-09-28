// Ponto único de acesso a "onde os dados moram". A regra de negócio e a UI
// nunca falam com window.storage ou localStorage diretamente — só falam com
// este adapter. Isso significa que, no dia em que existir um backend de
// verdade, só este arquivo precisa mudar (para um adapter que faz fetch()
// numa API), sem tocar em domain/ nem em components/.

function temStorageDeArtifact() {
  return typeof window !== "undefined" && window.storage && typeof window.storage.get === "function";
}

function criarAdapterDeArtifact() {
  return {
    async get(chave) {
      try {
        return await window.storage.get(chave);
      } catch {
        return null; // chave ainda não existe
      }
    },
    async set(chave, valor) {
      return window.storage.set(chave, valor);
    },
  };
}

// Fallback para quando o app roda fora do ambiente de artifacts do Claude
// (ex: um build normal servido como site). Mesma interface, guardando no
// navegador do usuário em vez de na conta do Claude.
function criarAdapterDeLocalStorage() {
  return {
    async get(chave) {
      const bruto = localStorage.getItem(chave);
      return bruto ? { key: chave, value: bruto } : null;
    },
    async set(chave, valor) {
      localStorage.setItem(chave, valor);
      return { key: chave, value: valor };
    },
  };
}

export function criarStorageAdapter() {
  return temStorageDeArtifact() ? criarAdapterDeArtifact() : criarAdapterDeLocalStorage();
}
