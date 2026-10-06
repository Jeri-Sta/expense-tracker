# Baseline visual — Fase 2

Data: 2026-10-06

## Resultado

A Fase 2 consolidou a linguagem visual no runtime compartilhado. Telas novas podem consumir tokens semânticos, variantes de superfície, tipografia, estados, gráficos e scrollbars sem repetir valores locais.

## Contrato implementado

- Paleta escura Ink/Ledger com Signal Blue, Income Mint, Expense Coral e Warning Amber.
- Manrope Variable para interface e IBM Plex Mono somente para dados comparativos.
- Escalas compartilhadas de espaçamento, borda, raio, elevação e movimento.
- Estados canônicos de hover, active, `focus-visible`, disabled e busy.
- Paleta categórica de oito cores para gráficos.
- `ContentPanel` em variantes `flat`, `outlined` e `elevated`, implementadas como classes CSS para evitar um componente sem comportamento próprio.
- Adaptador global para Button, Dialog, Dropdown, Calendar, Table, Tag, Toast e Paginator do PrimeNG.
- Scrollbar global com propriedades padrão, fallback WebKit e tratamento de forced colors.
- `prefers-reduced-motion` global e remoção de `transition: all` no código da aplicação.

## Exceções deliberadas

Cores literais continuam permitidas quando são dados escolhidos pela pessoa, como cores de categorias e cartões, ou fallback do próprio dado. Essas cores não podem ser usadas como apresentação, estado ou marca da interface.

## Verificação

| Verificação                                           | Resultado                                                                                 |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `npm run lint`                                        | passou sem erros; 70 avisos legados                                                       |
| `npm test -- --watch=false --browsers=ChromeHeadless` | 1/1 teste passou                                                                          |
| `npm run build`                                       | passou; avisos legados de orçamento e entradas não usadas                                 |
| auditoria premium estrita                             | 20 achados removidos; 10 falsos positivos remanescentes para botões Angular com `(click)` |
| busca por `transition: all`                           | nenhuma ocorrência nos estilos da aplicação                                               |
| busca por scrollbars locais                           | somente a baseline global permanece                                                       |
| navegador 1366 × 768                                  | dashboard sem overflow horizontal; tokens e fontes computados conforme contrato           |
| navegador 768 px                                      | Transações sem overflow horizontal e controles principais com alvo de 44 px               |
| navegador 390 × 844                                   | Dashboard e Categorias sem overflow horizontal; dados comparativos usam IBM Plex Mono     |
| zoom 200%                                             | dashboard manteve título e reflow sem overflow horizontal                                 |

Os dez achados estáticos restantes não representam botões inertes: cada elemento possui handler Angular `(click)` e comportamento verificado no código. Converter esses botões apenas para satisfazer a limitação do analisador adicionaria complexidade e risco sem corrigir um defeito do produto.

## Próxima fase

A Fase 3 pode reorganizar a hierarquia do dashboard usando os tokens e superfícies já consolidados, sem introduzir uma segunda linguagem visual.
