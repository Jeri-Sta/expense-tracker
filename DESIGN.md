---
version: alpha
name: "Expense Tracker"
description: "Livro-caixa digital contemporâneo para leitura rápida, confiável e calma das finanças pessoais."
colors:
  primary: "#38BDF8"
  onPrimary: "#0B1220"
  success: "#2DD4A7"
  danger: "#FB7185"
  warning: "#FBBF24"
  info: "#38BDF8"
  background: "#0B1220"
  surfaceSection: "#19283A"
  surfaceCard: "#111C2E"
  surfaceOverlay: "#19283A"
  border: "#2A3D52"
  text: "#F4F7FB"
  textSecondary: "#9DADBF"
typography:
  interface:
    fontFamily: "Manrope Variable, Manrope, system-ui, sans-serif"
    fontSize: "1rem"
    lineHeight: "1.5"
  heading:
    fontFamily: "Manrope Variable, Manrope, system-ui, sans-serif"
    fontSize: "1.5rem"
    lineHeight: "1.25"
  data:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "1rem"
    lineHeight: "1.25"
rounded:
  DEFAULT: "0.5rem"
  sm: "0.25rem"
  md: "0.5rem"
  lg: "0.75rem"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
  xxl: "3rem"
components:
  button:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.onPrimary}"
    rounded: "{rounded.sm}"
    padding: "{spacing.sm} {spacing.md}"
    height: "2.5rem"
  contentPanel:
    backgroundColor: "{colors.surfaceCard}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    padding: "{spacing.lg}"
  sectionHeader:
    backgroundColor: "{colors.surfaceSection}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
  dialog:
    backgroundColor: "{colors.surfaceOverlay}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    padding: "{spacing.lg}"
  table:
    backgroundColor: "{colors.surfaceCard}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
  toast:
    backgroundColor: "{colors.surfaceSection}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
  successState:
    backgroundColor: "{colors.success}"
    textColor: "{colors.background}"
    rounded: "{rounded.sm}"
  dangerState:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.onPrimary}"
    rounded: "{rounded.sm}"
  warningState:
    backgroundColor: "{colors.warning}"
    textColor: "{colors.background}"
    rounded: "{rounded.sm}"
  infoState:
    backgroundColor: "{colors.info}"
    textColor: "{colors.onPrimary}"
    rounded: "{rounded.sm}"
  divider:
    backgroundColor: "{colors.border}"
    height: "1px"
  helperText:
    textColor: "{colors.textSecondary}"
    typography: "{typography.interface}"
---

# Expense Tracker Design System

## Overview

### Creative North Star

O produto deve se comportar como um **livro-caixa digital contemporâneo**: números alinhados, estados explícitos e uma leitura que transmite controle sem parecer bancária, corporativa ou promocional. A interface é um instrumento de acompanhamento frequente; a clareza operacional tem precedência sobre ornamentação.

### Product context and register

- **Público e tarefa principal:** pessoa que acompanha as próprias finanças e precisa responder rapidamente “como está meu mês e o que exige atenção agora?”.
- **Mercado e evidência:** produto pessoal em português do Brasil, conforme `README.md`, `FUNCIONALIDADES.md`, `LOCALE_ID` e traduções do PrimeNG. Locale não é evidência de política financeira, fiscal ou regulatória brasileira.
- **Locale e linguagem:** `pt-BR`; texto direto, em voz ativa, com o mesmo verbo entre ação e feedback.
- **Cena de uso:** consultas recorrentes em desktop e celular, com densidade moderada e comparação frequente de valores.
- **Registro:** produto/aplicação. Familiaridade, previsibilidade e recuperação de erro vencem expressão de marca.
- **Assinatura memorável:** faixa de fechamento mensal que conecta saldo, entradas, saídas, compromissos e variação em uma única composição inspirada em extratos.
- **Restrição:** formulários, tabelas, confirmações e estados de erro devem permanecer silenciosos e convencionais.
- **Anti-referências:** painel administrativo genérico com cartões idênticos; aplicativo bancário com excesso de brilho; dashboard que usa gradientes, sombras e movimento para compensar falta de hierarquia.
- **Modelo de propriedade:** **Model B — runtime existente é canônico**. `_theme.scss`, `_variables.scss`, o tema PrimeNG Arya Blue e os componentes compartilhados produzem os valores renderizados. Este documento espelha os valores aceitos e registra intenção; não gera CSS.

### Runtime mapping

| Token em `DESIGN.md`    | Runtime canônico                                                                              | Adaptador/consumidor                      | Proprietário                       |
| ----------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------- | ---------------------------------- |
| `colors.primary`        | `--primary-color`, `$color-primary`                                                           | Arya Blue, PrimeNG Button, links, foco    | `_theme.scss` e `_variables.scss`  |
| `colors.onPrimary`      | `--primary-color-text`                                                                        | controles primários                       | `_theme.scss`                      |
| `colors.success`        | `$color-success`                                                                              | valores positivos, tags e botões          | `_variables.scss`                  |
| `colors.danger`         | `$color-danger`                                                                               | valores negativos, erros e exclusão       | `_variables.scss`                  |
| `colors.warning`        | `$color-warning`                                                                              | cautela e vencimento                      | `_variables.scss`                  |
| `colors.background`     | `--surface-ground`, `--surface-0`                                                             | shell e páginas                           | `_theme.scss`                      |
| `colors.surfaceSection` | `--surface-section`, `--surface-50`                                                           | cabeçalhos e painéis                      | `_theme.scss`                      |
| `colors.surfaceCard`    | `--surface-card`                                                                              | `.card`, widgets e diálogos               | `_theme.scss` + `_mixins.scss`     |
| `colors.border`         | `--surface-border`, `--border-color`                                                          | tabelas, cards e inputs                   | `_theme.scss`                      |
| `colors.text`           | `--text-color`                                                                                | corpo e títulos                           | `_theme.scss`                      |
| `colors.textSecondary`  | `--text-color-secondary`                                                                      | legendas e metadados                      | `_theme.scss`                      |
| `typography.*`          | regras globais de body/headings                                                               | PrimeNG herda do documento                | `_typography.scss`                 |
| `rounded.*`             | `$border-radius-*`                                                                            | mixins e componentes PrimeNG sobrescritos | `_variables.scss`                  |
| `spacing.*`             | `$spacing-*`                                                                                  | layout, mixins e componentes              | `_variables.scss`                  |
| estados de interação    | `--surface-hover`, `--surface-active`, `--focus-ring`, `--disabled-opacity`, `--busy-opacity` | controles nativos e PrimeNG               | `_theme.scss` + `_components.scss` |
| paleta de dados         | `--chart-1` a `--chart-8`                                                                     | gráficos e indicadores categóricos        | `_theme.scss`                      |
| scrollbar               | `--scrollbar-*`                                                                               | baseline padrão + fallback WebKit         | `_theme.scss` + `_components.scss` |
| camadas                 | `--z-sticky` a `--z-toast`                                                                    | shell, menus, diálogos e feedback         | `_theme.scss`                      |

O carregamento do tema PrimeNG está em `web-app/angular.json`. A aplicação carrega Arya Blue antes de `src/styles.scss`, portanto os tokens e overrides do projeto são a camada final. A localização do PrimeNG é configurada em `AppComponent`.

### Phase 2 baseline

A paleta runtime adotada é Ink `#0B1220`, Ledger `#111C2E`/`#19283A`, Mist `#9DADBF`, Paper `#F4F7FB`, Signal Blue `#38BDF8`, Income Mint `#2DD4A7`, Expense Coral `#FB7185` e Warning Amber `#FBBF24`. Manrope Variable é a família de interface; IBM Plex Mono fica restrita a valores comparativos.

Cores escolhidas pela pessoa para categorias e cartões, e seus fallbacks quando o dado não possui cor, são exceções deliberadas: pertencem ao dado e podem ser literais nos serviços/componentes que oferecem essa escolha. Não devem ser reutilizadas como cor de apresentação ou estado do produto.

## Colors

- Azul é reservado a ação principal, seleção, link e foco; não deve colorir grandes superfícies apenas como decoração.
- Verde comunica entrada, conclusão ou resultado positivo. Vermelho comunica despesa, erro ou ação destrutiva. Cada estado também precisa de texto ou ícone.
- Amarelo/âmbar comunica cautela recuperável, nunca sucesso ou ação primária.
- Superfícies usam diferença tonal e borda. Sombras não devem ser necessárias para separar todos os níveis.
- Cores escolhidas pelo usuário para categorias e cartões são dados, não tokens da marca; precisam de fallback e contraste calculado.
- Gráficos devem reutilizar uma paleta categórica documentada e oferecer equivalente textual.
- O produto suporta apenas tema escuro nesta baseline. Tema claro ou múltiplos temas exigem decisão explícita e matriz visual própria.

## Typography

- Corpo e controles usam a família `interface`; títulos usam `heading` com peso 500–700, sem caixa alta decorativa.
- Valores monetários, percentuais, datas e contagens devem usar numerais tabulares quando a família suportar. A futura família `data` monoespaçada deve ser aplicada somente onde melhora comparação.
- Texto-base é 16 px; legendas não devem ficar abaixo de 12 px e precisam preservar contraste AA.
- Títulos de página usam sentença normal em pt-BR. Rótulos de ação usam verbos específicos: “Salvar”, “Excluir”, “Gerar projeções”, não “OK” ou “Enviar”.
- Mensagens de erro explicam o que falhou e a próxima ação possível; não culpam a pessoa e não usam linguagem promocional.

## Layout

- Breakpoints canônicos atuais: 576, 768, 992 e 1200 px, definidos em `_variables.scss`.
- O shell possui topbar de 60 px e conteúdo com padding responsivo. Novas superfícies não devem adicionar `100vh` a shells compartilhados.
- Desktop usa leitura em colunas; tablet reduz densidade; mobile preserva ação primária e move ações secundárias para uma affordance acessível.
- A página é a proprietária padrão do scroll. Tabelas ou listas podem ter scroll interno somente quando sua altura é deliberadamente limitada sem afetar formulários irmãos.
- Loading, ajuda, erro e conteúdo assíncrono reservam geometria compatível para evitar deslocamento de controles.
- Ações importantes não podem desaparecer em breakpoints; toda transformação responsiva mantém acesso equivalente.

## Elevation & Depth

- Hierarquia padrão: diferença tonal, borda de 1 px e espaçamento.
- `$shadow-sm` é permitido em menus, popovers e controles flutuantes.
- `$shadow-md` é permitido em superfícies elevadas ou interativas, não em todo card estático.
- `$shadow-lg` é reservado a overlays e diálogos.
- Hover não eleva painéis sem ação. Um movimento vertical só é permitido quando o elemento inteiro é clicável e possui foco equivalente.
- Blur de tela inteira não é tratamento padrão de loading; overlays modais são a exceção.

## Shapes

- Controles pequenos usam 4 px; painéis e tabelas usam 8 px; superfícies de destaque podem usar 12 px.
- Pílulas são reservadas a tags, badges e estados compactos.
- Ícones circulares devem representar ação ou categoria real, não decoração repetitiva.
- Divisores de 1 px e espaço em branco substituem cards aninhados quando o conteúdo pertence ao mesmo contexto.

## Components

### Foundational visual states

- Todo controle habilitado possui default, hover, `focus-visible`, active, disabled e busy quando aplicável.
- O foco usa anel de 2 px em azul primário com offset suficiente; remover `outline` exige substituição visível equivalente.
- Disabled reduz ênfase, remove comportamento e explica indisponibilidade quando o motivo não é óbvio.
- Busy preserva dimensões do controle e impede submissão duplicada.
- Success, warning e error combinam cor, ícone e texto.
- Loading padrão é regional e mantém o conteúdo anterior em atualizações. Skeleton só é usado quando reproduz a geometria final.

### Buttons and actions

- Eixos: ênfase `solid`, `outline` ou `ghost`; intenção `brand`, `neutral`, `success`, `warning`, `info` ou `danger`.
- Cada região possui uma ação primária. Ações destrutivas ficam visualmente separadas e só usam alta ênfase no diálogo final.
- Botão somente com ícone exige nome acessível; tooltip complementa, mas não substitui o nome.
- Alvos touch têm no mínimo 44 × 44 px nas superfícies móveis.

### Navigation and data display

- Topbar, sidebar e metadados de rota pertencem ao `MainLayoutComponent` até a extração de um shell compartilhado.
- Tabelas PrimeNG são canônicas no desktop para dados tabulares. A transformação mobile deve ser definida por `ResponsiveDataView`, sem perder ordenação, status ou ações.
- Cards informativos são estáticos; cards navegáveis usam semântica de link/botão e estados completos.
- Tags e badges servem a estado curto, não substituem explicações ou mensagens de erro.

### Forms and overlays

- PrimeNG Dropdown é o select/listbox authored canônico.
- `app-masked-calendar`, baseado em PrimeNG Calendar, é o proprietário desejado para datas digitáveis em formatos `date` e `month`; usos diretos de `p-calendar` são dívida de migração.
- Angular Reactive Forms é a camada de estado e validação. Formulários devem usar `novalidate`, erro textual, `aria-invalid`, `aria-describedby` e foco no primeiro erro.
- PrimeNG Dialog e ConfirmDialog são os overlays canônicos. Devem preservar foco, Escape, scroll lock e ações em viewport curto.
- Toast global reconhece sucesso ou falha breve. Erro persistente ou corrigível pertence à região afetada.

### Iconography

- PrimeIcons é a família canônica atual.
- Tamanhos padrão: 16 px em controles, 20–24 px em navegação e até 32 px em estados vazios.
- Ícones não substituem rótulos em ações críticas ou incomuns.
- Ícones de receita/despesa não dependem somente de orientação ou cor para comunicar significado.

### Motion

- Movimento comunica mudança de estado, abertura, fechamento ou navegação.
- Feedback de controle: aproximadamente 150–200 ms. Superfícies: até 300 ms.
- Não usar `transition: all`; declarar propriedades específicas.
- `prefers-reduced-motion: reduce` remove deslocamentos e animações não essenciais.
- Pulsação contínua é permitida somente para condição urgente e deve parar quando a condição deixa de existir.

### Content and data visualization

- Moeda usa BRL e locale `pt-BR`; datas usam `dd/mm/aaaa` na interface.
- Valores negativos não dependem apenas do sinal ou da cor; rótulo/contexto precisa indicar receita, despesa ou saldo.
- Gráficos incluem título, período, unidade, legenda e alternativa textual.
- Empty state explica por que não há dados e oferece somente a ação útil para aquele contexto.
- Termos iguais mantêm o mesmo nome em navegação, botão, diálogo e toast.

### Canonical component inventory

| Componente           | Proprietário canônico                                 | Estado na Fase 0                                                          |
| -------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------- |
| `PageHeader`         | `shared/components/page-header`                       | Planejado; criar antes da segunda migração                                |
| `SectionHeader`      | `shared/components/section-header`                    | Planejado                                                                 |
| `SummaryStrip`       | `dashboard/components/summary-strip`                  | Planejado para o dashboard                                                |
| `Metric`             | `shared/components/metric`                            | Planejado                                                                 |
| `ContentPanel`       | estilo global + wrapper compartilhado                 | `.card` é legado; wrapper planejado                                       |
| `EmptyState`         | `shared/components/empty-state`                       | Planejado; padrões atuais são duplicados                                  |
| `InlineAlert`        | `shared/components/inline-alert`                      | Implementado na Fase 1                                                    |
| `LoadingRegion`      | `shared/components/loading-region`                    | Implementado na Fase 1                                                    |
| `ResponsiveActions`  | `shared/components/responsive-actions`                | Implementado na Fase 1; aplicado em Transações, Categorias e Recorrências |
| `ResponsiveDataView` | `shared/components/responsive-data-view`              | Implementado na Fase 1; primeiro consumidor em Transações                 |
| Select/Listbox       | PrimeNG Dropdown                                      | Existente e canônico                                                      |
| Date                 | `app-masked-calendar` + PrimeNG Calendar              | Existente; migração parcial                                               |
| Dialog               | PrimeNG Dialog/ConfirmDialog                          | Existente e canônico                                                      |
| Toast                | `AppComponent` + `AppMessageService` raiz             | Consolidado na Fase 1; deduplicação e fila mobile única                   |
| Table                | PrimeNG Table + `_tables.scss` + `ResponsiveDataView` | Desktop canônico; Transações migrou para cards abaixo de 640 px           |

Componentes planejados não autorizam duplicatas locais. A primeira implementação define o proprietário compartilhado; a segunda ocorrência deve reutilizá-lo.

## Do's and Don'ts

- **Do:** fazer a situação do mês e a próxima ação relevante aparecerem antes dos gráficos secundários.
- **Do:** usar tokens semânticos e componentes compartilhados para estados repetidos.
- **Do:** manter o produto utilizável em 390 px, teclado e zoom de 200%.
- **Don't:** criar outro card com sombra para resolver hierarquia que espaço, tipo ou divisor poderiam resolver.
- **Don't:** ocultar ação, valor completo ou recuperação de erro apenas para fazer o layout caber.
- **Don't:** adotar a paleta futura ou novas fontes em uma única tela; mudanças globais migram runtime, adaptador e documentação juntos.
