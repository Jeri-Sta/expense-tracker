# Fase 5 — Acessibilidade, robustez e acabamento

**Data:** 2026-10-09  
**Status:** concluída em 2026-10-09. O reflow foi conferido na largura CSS equivalente a 200%; modos de sistema foram emulados pelo Chromium.

## Ajustes e validações

- A navegação por teclado percorreu Dashboard, Transações, Categorias, Recorrências, Parcelas, Cartões, Faturas e Configurações. O menu lateral abre com Enter, posiciona o foco no primeiro link, fecha com Escape e devolve foco ao acionador.
- O foco visível usa `:focus-visible`; `scroll-padding-top` reserva espaço para a topbar fixa. Controles de ícone nas telas CRUD, no calendário e no seletor de cor de Categorias receberam nomes acessíveis, conferidos na árvore de acessibilidade. Ações no cabeçalho de Transações agora mantêm referências estáveis entre ciclos de detecção de mudanças; Filtros de projeção, Gerenciar projeções e Nova Projeção foram exercitados no Chrome.
- Títulos de documento foram conferidos nas rotas principais. Labels do paginador PrimeNG aparecem em pt-BR no navegador e têm teste unitário.
- Foi acrescentado nome acessível ao botão do calendário e aos botões somente com ícone; testes de unidade cobrem o calendário, as ações secundárias compartilhadas e os rótulos do paginador.
- O contraste foi calculado para texto normal, texto secundário, hover, foco, controles desabilitados e séries dos gráficos. O estado desabilitado inicial tinha contraste insuficiente no botão primário; o token global subiu de 0,48 para 0,8 de opacidade.
- `prefers-reduced-motion: reduce` e `forced-colors: active` foram emulados via DevTools Protocol do Chromium headless. As media queries foram verdadeiras nas oito rotas; duração de transição do botão ficou em `0.00001s`, e bordas dos painéis resolveram para a cor de sistema `CanvasText`.
- O reflow de 200% foi validado em viewport de 960 CSS px, equivalente a uma janela de 1920 px com zoom de 200%. As oito rotas não tiveram `scrollWidth` superior à largura do viewport; os títulos específicos permaneceram presentes.
- No formulário de Transações, um texto de descrição longo e o valor `R$ 99.999.999.999.999,00` foram digitados em viewport de 960 px; não houve overflow do documento. O formulário foi descartado sem salvar. Um teste de componente verifica saldo de `R$ 999.999.999.999,99` e a ausência de crescimento mensal, que exibe `—` e “comparação indisponível”.

## Validações

| Verificação | Resultado |
| --- | --- |
| `npm run lint` | Passou: 0 erros, 52 avisos preexistentes de `any`. |
| `npm test -- --watch=false` | Passou: 8 testes no Chrome headless. |
| `npm run build:prod` | Passou. Permanecem o orçamento do bundle inicial (1,71 MB frente a 500 kB), avisos de orçamento SCSS e entradas TypeScript não usadas, além do aviso de dados `baseline-browser-mapping` desatualizados. |
| `audit_project.py web-app --mode strict` | 6 achados `affordance.actionless-button` em controles com eventos Angular `(click)`/`onClick`, que o analisador não reconhece. O relatório atualizado está em `web-app/premium-audit.json`. |
| Contraste medido em tokens | Texto normal 15,9:1; secundário 7,45:1; texto sobre hover 13,8:1 (secundário 6,47:1); outline de foco 7,97:1. Séries dos gráficos: mínimo 4,03:1. |
| Contraste em desabilitados | Após ajustar o token para 0,8: botão primário 6,02:1; paginação 4,85:1; botão secundário 5,24:1, sobre a superfície principal. |
| Chromium headless, 960 px e modos de sistema | As oito rotas carregaram sem overflow horizontal com `prefers-reduced-motion` e forced-colors ativos. Bordas de painéis usaram a cor de sistema em forced-colors; transições foram reduzidas. |
| Conteúdo extremo no formulário | Descrição longa e moeda de 14 dígitos renderizadas em viewport de 960 px sem overflow da página; diálogo descartado sem gravação. |
| Fluxos das projeções em Chrome | Filtros e gerenciamento abriram e fecharam; Nova Projeção abriu o diálogo. Nenhuma gravação foi confirmada. |

## Pendente

- A emulação de 960 CSS px cobre o mesmo reflow do zoom de 200% em uma janela de 1920 px; o Chrome visual do desktop não foi ampliado pelo atalho de zoom.
- Forced-colors foi emulado no motor Chromium, não pelo modo de alto contraste do sistema operacional.
- Não há runner nem baseline de regressão visual no projeto; a dependência de teste instalada é Karma/Jasmine.
- Teclado virtual de dispositivo não foi verificado; requer um dispositivo conectado.
