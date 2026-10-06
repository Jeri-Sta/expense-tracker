# Baseline visual — Fase 0

## Contexto da captura

- Data: 2026-10-05.
- Frontend: `http://127.0.0.1:4200`.
- Backend observado: `http://127.0.0.1:3000`.
- Tema: Arya Blue/dark.
- Locale: pt-BR.
- Navegador: Chrome.
- Dados: ambiente local com respostas de erro em parte das chamadas; estados vazio, loading e erro foram observados.
- Limitação funcional observada: a rota de recorrências registra `NG01203` para o controle `isActive`; a tela ainda renderiza o estado vazio, mas o formulário precisa ser corrigido em uma fase de implementação.

As capturas foram realizadas em navegador real durante a Fase 0 e permanecem como evidência da execução da tarefa. O repositório ainda não possui infraestrutura de visual regression capaz de versionar automaticamente os binários. Este registro descreve cada captura e deve ser substituído por snapshots persistentes quando essa infraestrutura for introduzida.

## Registro de capturas

| ID | Rota | Viewport | Estado | Evidência observada |
|---|---|---:|---|---|
| `dashboard-desktop` | `/dashboard` | desktop largo | vazio + erro | quatro KPIs equivalentes, gráficos com grandes áreas vazias e toasts sobre o topo direito |
| `transactions-desktop` | `/transactions` | desktop largo | vazio/loading | header com quatro ações, filtros em bloco separado e tabela com loading central |
| `categories-desktop` | `/categories` | desktop largo | vazio + erro | filtros em card e empty state amplo com ação duplicada |
| `recurring-desktop` | `/recurring-transactions` | desktop largo | loading/vazio | loading ocupa painel amplo; empty state centralizado após a falha |
| `dashboard-mobile` | `/dashboard` | 390 × 844 | loading + erro | overlay com blur, topbar duplicada e toast cobrindo conteúdo |
| `transactions-mobile` | `/transactions` | 390 × 844 | vazio + erro | ações primárias fora da área visível, filtros empilhados, tabela com corte horizontal e pilha de toasts |
| `categories-mobile` | `/categories` | 390 × 844 | vazio | ações e filtros quebram em duas linhas, mas permanecem acessíveis; marca duplicada na topbar |

## Baseline de problemas por prioridade

### P0 — bloqueia uso

- Toasts duplicados cobrem o conteúdo mobile.
- Ações “Nova Projeção” e “Nova Transação” desaparecem em 390 px.
- Loading global do dashboard bloqueia e embaça toda a tela.

### P1 — reduz compreensão

- Logo e título padrão aparecem duplicados na topbar.
- KPIs e gráficos possuem pesos visuais muito semelhantes.
- Estados vazios ocupam áreas grandes sem informação adicional.
- Tabela mobile depende de rolagem horizontal pouco evidente.

### P2 — dívida sistêmica

- Estilos e scrollbars repetidos por widget.
- Variações locais de card, sombra, raio e header.
- Estilos inline e `::ng-deep` dificultam rastrear o resultado visual.

## Rotas canônicas para comparação

- **Tabela + formulário:** Transações.
- **Grid/cards + empty state:** Categorias.
- **Métricas + gráficos + loading:** Dashboard.
- **Card operacional + ações:** Recorrências.

## Auditoria e gates da baseline

| Verificação | Resultado da Fase 0 | Próxima ação |
|---|---|---|
| `designmd lint DESIGN.md` | 0 erros; 3 avisos de contraste do runtime atual | tratar junto da migração de cores da Fase 2 |
| auditoria premium em modo report | relatório persistido com 31 violações | usar `premium-audit.json` como ponto zero mensurável |
| auditoria premium em modo strict | falha esperada pelas mesmas 31 violações | reduzir sem introduzir novas violações |
| `npm --prefix web-app run lint` | 1 erro e 71 avisos preexistentes | corrigir o argumento `error` não utilizado e a dívida tipada em tarefa própria |
| `npm --prefix web-app test -- --watch=false --browsers=ChromeHeadless` | 1 teste aprovado | manter como gate mínimo |
| `npm --prefix web-app run build:prod` | aprovado com avisos de budget e arquivos não usados | acompanhar budgets durante a consolidação de estilos |

Distribuição das 31 violações estáticas: 10 affordances potencialmente sem ação detectável, 6 formulários sem `novalidate`, 4 textareas sem regra canônica de resize e 11 implementações de scrollbar apenas WebKit. O relatório é deliberadamente uma baseline, não uma lista de exceções aceitas.

## Procedimento de recaptura

1. Iniciar API e frontend locais.
2. Capturar cada rota no estado indicado.
3. Usar desktop padrão e 390 × 844.
4. Registrar também loading, vazio, erro e sucesso quando fixtures/E2E existirem.
5. Não aceitar comparação apenas de happy path.
6. Atualizar esta tabela e a evidência automatizada na mesma alteração visual.
