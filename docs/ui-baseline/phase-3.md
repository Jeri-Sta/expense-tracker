# Baseline visual — Fase 3

Data: 2026-10-09

## Resultado

A visão geral do dashboard foi reorganizada para priorizar o fechamento do período e os compromissos que vencem em breve. A faixa de fechamento substitui os quatro cards de mesmo peso; abaixo dela, o fluxo financeiro e a próxima ação dividem a área principal no desktop e ficam empilhados com os compromissos primeiro em telas menores.

## Contrato implementado

- Seletor de mês/ano e controle de projeções agrupados no cabeçalho.
- Faixa contínua com saldo do mês, entradas, saídas, valor a vencer e variação contra o mês anterior.
- Um único gráfico de fluxo financeiro, com resumo textual acessível e vazio compacto.
- Painel de compromissos com recorrências de despesa e parcelas nos próximos 30 dias, com acesso aos módulos de origem.
- Categorias, transações recentes e composição das despesas aparecem apenas quando há dados; as categorias foram reduzidas a uma lista compacta.
- Datas de compromisso são interpretadas como datas locais para evitar deslocamento de dia por fuso horário.
- Após revisão visual, o painel de compromissos passou a informar o total e o limite de três itens por tipo; a faixa de fechamento foi compactada verticalmente.
- O anel de foco da aba selecionada desaparece quando o foco de teclado segue para outro controle; foi mantido para preservar a navegação acessível.

## Verificação

| Verificação | Resultado |
| --- | --- |
| `npm run build:prod` | passou; avisos de budgets CSS legados e budget excedido nos estilos do dashboard/KPI |
| `npm run lint` | passou sem erros; 57 avisos no projeto |
| Navegador desktop, dashboard com dados | conferidos faixa de fechamento, gráfico, compromissos e resumo acessível |
| Auditoria premium estrita | 10 violações de affordance em Categorias, API Keys, layout e calendário; nenhuma nos arquivos do dashboard alterados |
| Tablet/mobile em navegador | não conferidos visualmente nesta execução; layout responsivo foi implementado por breakpoint e ordem de conteúdo |
| Testes automatizados | não executados |
| Auditoria estática premium | não executada |

O painel lista até três itens de cada tipo, mas o total e a contagem representam todos os compromissos no intervalo de 30 dias. Valores são informativos e não criam novos cálculos de saldo. “Saldo do mês” é usado em vez de “saldo disponível”, pois o período selecionado pode ser histórico.

## Próxima fase

A Fase 4 pode migrar Transações, Categorias e Recorrências para os padrões compartilhados de cabeçalho, ações responsivas e estados assíncronos.
