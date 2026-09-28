# tatame

Tracking de treinos de Brazilian Jiu-Jitsu — faixa, treinos, posições aplicadas
e sofridas, estatísticas de evolução.

## Como rodar

```bash
npm install
npm run dev        # sobe o app em modo desenvolvimento
npm test           # roda os testes de domínio (rápidos, sem browser)
npm run typecheck  # checa erros de sintaxe/tipo sem precisar migrar pra TS
npm run build      # gera a versão de produção em dist/
```

## Por que essa estrutura

O projeto é dividido em camadas com responsabilidades bem separadas,
propositalmente para que cada uma possa evoluir sem arrastar as outras:

```
src/
  domain/          # regras de negócio puras — sem React, sem storage
    schema.js        → formato dos dados, valores padrão, validação, versionamento
    calculations.js  → streak, duração, agregações, calendário
  data/            # onde e como os dados são guardados
    storageAdapter.js → fala com window.storage (Claude) OU localStorage (fora do Claude)
    repository.js     → sabe a chave de armazenamento, os dados de exemplo (seed) e
                         como ir do "storage bruto" pro estado validado
  components/      # UI pura — recebe dados prontos, dispara eventos, não decide regra
  styles/          # tokens de apresentação (cor por faixa, fontes)
  App.jsx          # orquestra: carrega, guarda estado, decide qual tela mostrar
tests/             # testes de domain/ e data/ (26 casos), rodam com `node --test`
```

**A ideia central:** `domain/` não sabe que existe React nem que existe
armazenamento algum — só recebe dados e devolve dados. Isso é o que permite
testar `calcularStreakSemanas` ou `validarTreino` sem precisar renderizar
nada, e é o motivo dos testes rodarem em ~100ms.

**O seam mais importante para o futuro é `data/storageAdapter.js`.** Hoje ele
escolhe entre a memória do Claude (`window.storage`) e o `localStorage` do
navegador. Se um dia isso virar um backend de verdade (Postgres + API), só
esse arquivo muda — ganha um terceiro adapter que faz `fetch()` numa API — e
nada em `domain/`, `components/` ou `App.jsx` precisa ser tocado.

## Versionamento de dados

Todo estado salvo carrega um campo `versao` (`domain/schema.js`). Dados
salvos pela versão anterior do app (o artifact de página única, sem esse
campo) são migrados automaticamente por `migrarDados()` na primeira leitura.
Se o formato mudar de novo no futuro, a migração entra ali, num lugar só.

## O que ficou de fora por enquanto

- Sem TypeScript de verdade (só um `tsconfig.json` com `checkJs: false` que
  serve pra pegar erro de sintaxe — dá pra evoluir pra tipos completos depois).
- Sem backend / sincronização entre dispositivos — os dados vivem no
  armazenamento do Claude ou no navegador, conforme onde o app rodar.
- Exportar/importar (`src/data/exportImport.js` + aba **Faixa → Backup**) já
  existe: baixa um `.json`, copia pra área de transferência como alternativa,
  e restaura com uma tela de confirmação antes de sobrescrever os dados atuais.
