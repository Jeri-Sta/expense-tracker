# Plano de melhoria visual do frontend

## 1. Objetivo

Evoluir o frontend do Expense Tracker de um tema PrimeNG funcional, porém genérico, para uma interface financeira com identidade própria, hierarquia clara, comportamento responsivo confiável e componentes consistentes.

O trabalho deve ser incremental. Cada fase precisa deixar o sistema utilizável e verificável, sem depender da conclusão das fases seguintes.

## 2. Contexto do produto

- **Produto:** aplicação pessoal de acompanhamento financeiro.
- **Público:** pessoa que precisa entender rapidamente sua situação do mês, compromissos futuros e ações pendentes.
- **Tarefa principal:** responder, em poucos segundos, “como está meu mês e o que exige atenção agora?”.
- **Idioma:** português do Brasil.
- **Meta de acessibilidade:** WCAG 2.2 AA.
- **Stack atual:** Angular 17, PrimeNG 17, PrimeFlex e SCSS.

## 3. Diagnóstico resumido

### Pontos fortes

- Tema escuro consistente entre as principais rotas.
- Cores semânticas já usadas para receitas, despesas e alertas.
- Base inicial de tokens para cores, espaçamento, raios e sombras.
- Estados vazios e ações principais geralmente presentes.
- Componentes PrimeNG fornecem uma base funcional e acessível para evolução.

### Problemas prioritários

1. O cabeçalho duplica a identidade do produto e quebra em telas estreitas.
2. Ações importantes desaparecem ou extrapolam a largura na tela de transações.
3. Toasts acumulados bloqueiam a interface, principalmente no celular.
4. Loading global com blur interrompe a leitura e esconde o conteúdo anterior.
5. O dashboard distribui o mesmo peso visual entre informações de importância diferente.
6. Há excesso de cartões, bordas e sombras, criando “card soup”.
7. Roboto, azul padrão e PrimeIcons deixam a interface sem identidade própria.
8. Estilos inline, cores literais e `::ng-deep` promovem divergência visual.
9. Tabelas dependem de rolagem horizontal pouco orientada no celular.
10. Estados de foco, movimento reduzido, formulários e scrollbars precisam de padronização.

### Baseline técnica

A auditoria estática inicial retornou 31 violações, concentradas em:

- formulários sem `novalidate`;
- textareas sem política consistente de redimensionamento;
- scrollbars baseadas apenas em seletores WebKit;
- possíveis affordances sem ação detectável;
- duplicações locais de comportamento e apresentação.

Essa contagem deve ser registrada novamente ao final de cada fase para medir a redução do débito.

## 4. Direção visual proposta

### Conceito

**Livro-caixa digital contemporâneo:** preciso, confiável e calmo, com densidade suficiente para leitura financeira sem parecer um painel administrativo genérico.

### Assinatura visual

Criar uma **faixa de fechamento mensal** no topo do dashboard. Ela deve reunir saldo disponível, entradas, saídas, compromissos a vencer e variação contra o mês anterior em uma composição contínua inspirada em extratos financeiros.

Essa será a principal expressão visual do produto. O restante da interface deve ser mais silencioso, evitando gradientes, sombras e animações decorativas concorrentes.

### Paleta inicial

| Token proposto  |     Valor | Uso                          |
| --------------- | --------: | ---------------------------- |
| `ink-950`       | `#0B1220` | Fundo principal              |
| `ledger-900`    | `#111C2E` | Superfície principal         |
| `ledger-800`    | `#19283A` | Superfície elevada           |
| `mist-300`      | `#9DADBF` | Texto secundário             |
| `paper-50`      | `#F4F7FB` | Texto principal              |
| `signal-blue`   | `#38BDF8` | Ação e foco                  |
| `income-mint`   | `#2DD4A7` | Receita e resultado positivo |
| `expense-coral` | `#FB7185` | Despesa e resultado negativo |
| `warning-amber` | `#FBBF24` | Atenção e risco recuperável  |

Os valores são uma direção inicial. Antes da implementação, devem ser verificados em contraste, gráficos, estados de interação e integração com o tema PrimeNG.

### Tipografia

- **Interface e títulos:** Instrument Sans ou Manrope.
- **Valores monetários e dados:** IBM Plex Mono.
- Aplicar `font-variant-numeric: tabular-nums` em valores, datas e percentuais.
- Evitar mais de três pesos por família.
- Usar tamanho-base de 16 px no conteúdo e não depender de cinza muito escuro para criar hierarquia.

Se fontes externas não forem aceitáveis, definir uma pilha local equivalente e documentar a decisão.

### Princípios de composição

- Uma ação primária por região.
- Elevação somente em superfícies realmente independentes ou interativas.
- Divisores e espaçamento devem substituir cartões aninhados quando possível.
- Cor não pode ser o único indicador de estado.
- Hover não deve sugerir clique em conteúdo estático.
- Dados principais devem aparecer antes de filtros e gráficos secundários.

## 5. Arquitetura desejada

```text
DESIGN.md
  -> tokens SCSS/CSS canônicos
  -> adaptador do tema PrimeNG
  -> componentes compartilhados
  -> telas e widgets

UX-CONTRACT.md
  -> navegação e estados
  -> loading, erro e recuperação
  -> formulários e confirmações
  -> tabelas e comportamento responsivo
```

O sistema existente de tokens deve continuar como fonte de runtime durante a migração. O `DESIGN.md` documentará os valores aceitos, a intenção e o caminho até os componentes, sem manter uma segunda paleta independente.

## 6. Plano de execução

### Fase 0 — Registrar contratos e baseline

**Objetivo:** impedir que novas decisões aumentem a divergência durante a reforma.

- [x] Criar `DESIGN.md` com identidade, tokens, tipografia, elevação, movimento e exemplos de uso.
- [x] Criar `UX-CONTRACT.md` para feedback, formulários, tabelas, diálogos, estados assíncronos e navegação.
- [x] Definir em `premium-ui.json`, se adotado, os comandos obrigatórios de validação.
- [x] Mapear tokens de `DESIGN.md` para `_theme.scss`, `_variables.scss` e PrimeNG.
- [x] Inventariar componentes visuais repetidos e escolher proprietários canônicos.
- [x] Registrar screenshots de referência em desktop e 390 px.
- [x] Executar e armazenar o resultado inicial da auditoria estática.

**Componentes canônicos mínimos:**

- `PageHeader`
- `SectionHeader`
- `SummaryStrip`
- `Metric`
- `ContentPanel`
- `EmptyState`
- `InlineAlert`
- `LoadingRegion`
- `ResponsiveActions`
- `ResponsiveDataView`

**Critério de aceite:** toda decisão visual global tem um proprietário documentado e um caminho único até o CSS de runtime.

---

### Fase 1 — Corrigir bloqueios responsivos e feedback

**Objetivo:** tornar as rotas atuais utilizáveis em telas estreitas antes do redesign visual.

#### Cabeçalho e navegação

- [x] Inicializar metadados de rota com a rota atual, evitando o título padrão duplicado.
- [x] Remover o título de página da topbar em telas estreitas.
- [x] Manter somente menu, marca compacta e ações globais no mobile.
- [x] Garantir alvo de toque mínimo de 44 × 44 px.
- [x] Validar sidebar por teclado, Escape, foco inicial e restauração de foco.

Arquivos principais:

- `web-app/src/app/layout/main-layout/main-layout.component.ts`
- `web-app/src/app/layout/main-layout/main-layout.component.html`
- `web-app/src/app/layout/main-layout/main-layout.component.scss`
- `web-app/src/styles/sidebar.scss`

#### Ações responsivas

- [x] Criar `ResponsiveActions` compartilhado.
- [x] Exibir a ação primária diretamente.
- [x] Mover ações secundárias para um menu “Mais” quando não houver largura.
- [x] Não ocultar ações sem fornecer alternativa equivalente.
- [x] Aplicar primeiro em Transações, Categorias e Recorrências.

#### Toasts e erros

- [x] Centralizar todas as mensagens no `MessageService` raiz.
- [x] Remover providers locais que criem filas independentes.
- [x] Deduplicar mensagens iguais dentro de uma janela curta.
- [x] Limitar o viewport a uma mensagem por vez no mobile.
- [x] Usar largura `calc(100vw - 2rem)` em telas estreitas.
- [x] Trocar erros persistentes por `InlineAlert` com ação “Tentar novamente”.
- [x] Impedir que interceptor e componente exibam a mesma falha simultaneamente.

#### Loading

- [x] Remover o overlay global com blur de operações rotineiras.
- [x] Preservar dados anteriores durante troca de período.
- [x] Usar `LoadingRegion` em cada área afetada.
- [x] Reservar geometria para evitar layout shift.
- [x] Garantir que nenhum spinner possa permanecer indefinidamente sem opção de recuperação.

#### Tabelas mobile

- [x] Manter tabela semântica no desktop.
- [x] Definir apresentação compacta por linha/cartão abaixo de 640 px.
- [x] Exibir descrição, valor, data e status como informações primárias.
- [x] Agrupar ações em menu contextual com nome acessível.
- [x] Manter paginação, total, filtros e ordenação coerentes entre layouts.

**Critério de aceite:** Dashboard, Transações, Categorias e Recorrências funcionam sem corte ou sobreposição em 390 px, 768 px e desktop.

**Status:** concluída em 2026-10-05. Evidências e gates em `docs/ui-baseline/phase-1.md`.

---

### Fase 2 — Consolidar o design system

**Objetivo:** substituir ajustes locais por uma linguagem visual compartilhada.

#### Tokens

- [x] Reestruturar cores em primitivas, semânticas e tokens de componente.
- [x] Definir escalas de espaçamento, raio, borda e elevação.
- [x] Criar tokens de foco, hover, active, disabled e busy.
- [x] Criar tokens para gráficos e dados categóricos.
- [x] Eliminar cores literais de apresentação nos componentes.
- [x] Documentar exceções que representem cores escolhidas pelo usuário, como categorias e cartões.

Arquivos principais:

- `web-app/src/styles/_variables.scss`
- `web-app/src/styles/_theme.scss`
- `web-app/src/styles/_typography.scss`
- `web-app/src/styles/_mixins.scss`
- `web-app/src/styles/_components.scss`
- `web-app/src/styles/_tables.scss`

#### Tipografia e dados

- [x] Aplicar a nova pilha tipográfica.
- [x] Criar escala clara para título de página, seção, card, corpo, legenda e dado.
- [x] Usar fonte monoespaçada somente onde melhora comparação numérica.
- [x] Aplicar numerais tabulares em moeda, percentuais e datas.
- [x] Verificar truncamento e quebra com textos longos em pt-BR.

#### Superfícies e elevação

- [x] Criar variantes explícitas de `ContentPanel`: plana, delimitada e elevada.
- [x] Remover hover com elevação de painéis não clicáveis.
- [x] Reduzir cartões aninhados no dashboard.
- [x] Substituir sombras repetidas por bordas e espaçamento quando adequado.
- [x] Evitar `transition: all`; animar somente propriedades necessárias.
- [x] Respeitar `prefers-reduced-motion`.

#### PrimeNG

- [x] Criar um adaptador global do tema em vez de sobrescritas por tela.
- [x] Reduzir gradualmente o uso de `::ng-deep`.
- [x] Padronizar Button, Dialog, Dropdown, Calendar, Table, Tag, Toast e Paginator.
- [x] Preservar dimensões de botões durante estado de loading.
- [x] Garantir foco visível sem remover `outline` sem substituição equivalente.

#### Scrollbars

- [x] Definir baseline global com `scrollbar-color` e `scrollbar-width`.
- [x] Manter fallbacks WebKit.
- [x] Tokenizar track, thumb, hover e active.
- [x] Remover implementações duplicadas dos widgets.
- [x] Preservar funcionamento em forced-colors/high contrast.

**Critério de aceite:** telas novas conseguem reproduzir a linguagem do produto sem criar cores, sombras, scrollbars ou estados locais.

---

### Fase 3 — Reestruturar o dashboard

**Objetivo:** orientar o dashboard para decisão, e não apenas para exposição de métricas.

#### Hierarquia proposta

```text
[ Outubro de 2026 ]                         [Anterior] [Hoje] [Próximo]

[ Faixa de fechamento mensal                                      ]
[ Saldo disponível | Entradas | Saídas | A vencer | Variação      ]

[ Fluxo do mês — gráfico principal                                ]

[ Próximos compromissos          ] [ Gastos por categoria          ]
[ Transações recentes            ] [ Limites e faturas              ]
```

#### Alterações

- [ ] Integrar seletor de período ao cabeçalho do dashboard.
- [ ] Criar a faixa de fechamento mensal como assinatura visual.
- [ ] Dar protagonismo ao saldo e às obrigações próximas.
- [ ] Reduzir os KPIs de quatro cartões iguais para métricas conectadas.
- [ ] Selecionar um único gráfico principal.
- [ ] Reduzir o número de gráficos simultâneos.
- [ ] Exibir módulos condicionais somente quando houver dados relevantes.
- [ ] Criar estados vazios compactos dentro dos painéis, sem grandes áreas mortas.
- [ ] Padronizar altura, cabeçalho, legenda e estado de loading dos gráficos.
- [ ] Garantir texto equivalente para informações comunicadas apenas visualmente pelos gráficos.

Arquivos principais:

- `web-app/src/app/features/dashboard/dashboard.component.html`
- `web-app/src/app/features/dashboard/dashboard.component.scss`
- `web-app/src/app/features/dashboard/components/**`

**Critério de aceite:** a situação do mês e a próxima ação importante podem ser identificadas antes de qualquer rolagem em desktop e mobile.

---

### Fase 4 — Migrar telas CRUD

**Objetivo:** aplicar os componentes e contratos compartilhados às demais rotas.

Ordem sugerida:

1. Transações.
2. Categorias.
3. Recorrências.
4. Cartões e faturas.
5. Financiamentos.
6. Configurações e chaves de API.

Para cada rota:

- [ ] Migrar para `PageHeader` e `ResponsiveActions`.
- [ ] Migrar painéis para variantes canônicas.
- [ ] Padronizar loading, vazio, sem resultados, erro parcial e erro total.
- [ ] Padronizar salvar, cancelar, excluir e sucesso.
- [ ] Preservar valores após erro.
- [ ] Bloquear submit duplicado sem mudar dimensões.
- [ ] Adicionar `novalidate` aos formulários.
- [ ] Associar erros com `aria-invalid` e `aria-describedby`.
- [ ] Focar ou rolar até o primeiro campo inválido.
- [ ] Definir `resize: none` e altura adequada para textareas.
- [ ] Confirmar ações destrutivas em diálogo da aplicação.
- [ ] Manter ações de perigo separadas das ações seguras.
- [ ] Verificar diálogos com teclado virtual e viewport curto.

**Critério de aceite:** a mesma operação usa o mesmo rótulo, aparência, feedback e destino em todas as rotas equivalentes.

---

### Fase 5 — Acessibilidade, robustez e acabamento

**Objetivo:** completar a qualidade de produção e impedir regressões.

- [ ] Navegar todas as rotas somente por teclado.
- [ ] Garantir foco visível e não encoberto pela topbar.
- [ ] Nomear controles somente com ícone e fornecer tooltip quando necessário.
- [ ] Verificar contraste normal, hover, focus, disabled e gráficos.
- [ ] Testar zoom de 200% sem perda de ação ou conteúdo.
- [ ] Testar `prefers-reduced-motion`.
- [ ] Testar forced-colors/high contrast.
- [ ] Definir títulos de documento específicos por rota.
- [ ] Validar labels e mensagens do PrimeNG em pt-BR.
- [ ] Testar textos longos, moedas grandes e dados ausentes.
- [ ] Adicionar testes de interação e acessibilidade para componentes compartilhados.
- [ ] Adicionar regressão visual para rotas e estados representativos, se a infraestrutura permitir.

**Critério de aceite:** nenhuma rota principal depende de mouse, cor isolada ou viewport amplo para ser operada.

## 7. Matriz mínima de estados

Cada tela de dados deve cobrir explicitamente:

| Estado               | Tratamento esperado                                         |
| -------------------- | ----------------------------------------------------------- |
| Carregamento inicial | Geometria reservada e indicador local                       |
| Atualização          | Dados anteriores preservados com progresso discreto         |
| Vazio inicial        | Explicação breve e ação de criação                          |
| Sem resultados       | Resumo dos filtros e ação para limpar                       |
| Erro recuperável     | Mensagem inline e “Tentar novamente”                        |
| Erro parcial         | Manter dados válidos e identificar somente a região afetada |
| Offline              | Explicar indisponibilidade e permitir nova tentativa        |
| Sucesso              | Toast breve e destino consistente                           |
| Ação em andamento    | Controle estável, ocupado e sem submit duplicado            |
| Exclusão             | Confirmação com objeto, consequência e verbo real           |

## 8. Estratégia de migração

- Não reescrever todas as telas de uma vez.
- Construir o componente compartilhado antes de migrar a segunda ocorrência.
- Usar Transações como fluxo de referência para tabelas e formulários.
- Usar Categorias como referência para cards/listas responsivas.
- Usar Dashboard como referência para métricas, gráficos e loading regional.
- Remover CSS legado somente depois de confirmar que não possui consumidores.
- Registrar toda exceção intencional com um nome de variante relacionado ao negócio.

## 9. Verificação por fase

### Comandos mínimos

```bash
cd web-app
npm run lint
npm test -- --watch=false
npm run build:prod
```

Executar também:

```bash
python /home/jeriel/.codex/plugins/cache/openai-curated-remote/frontend-design-premium/1.4.0/skills/frontend-design-premium/scripts/audit_project.py . --mode strict
```

### Matriz de navegador

- Desktop largo.
- 1366 × 768.
- Tablet com aproximadamente 768 px.
- Mobile com 390 × 844.
- Zoom de 200%.

### Fluxos mínimos de navegador

- Dashboard: sucesso, carregamento, vazio e erro.
- Transações: filtros, ordenação, paginação, criação, edição e exclusão.
- Categorias: filtros, criação e estado vazio.
- Recorrências: cards, ações, formulário e estado vazio.
- Diálogos: teclado, Escape, foco inicial e restauração de foco.
- Toasts: deduplicação, largura mobile e anúncio acessível.

## 10. Definition of Done

Uma fase só pode ser concluída quando:

- [ ] Os critérios de aceite da fase foram atendidos.
- [ ] Não há regressão visível nas rotas irmãs.
- [ ] Desktop, tablet e mobile foram inspecionados em navegador real.
- [ ] Loading, vazio, erro e sucesso foram exercitados.
- [ ] Navegação por teclado foi verificada.
- [ ] Lint, testes e build passaram.
- [ ] A auditoria estática não introduziu novas violações.
- [ ] Tokens ou componentes compartilhados alterados foram documentados.
- [ ] Screenshots de referência foram atualizados quando aplicável.

## 11. Decisões registradas para a Fase 2

- Manrope Variable local para interface e IBM Plex Mono local somente para dados comparativos.
- Tema escuro único nesta baseline; tema claro exige matriz própria.
- Nome “Expense Tracker” mantido.
- Densidade confortável, com alvos touch de 44 px no mobile.
- Faixa de fechamento mensal e composição definitiva do dashboard seguem para a Fase 3.
- Tabelas usam a baseline responsiva existente; mudanças estruturais dependem de validação por rota.
