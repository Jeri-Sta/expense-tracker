# UX Contract

## Product context

- **Audience:** pessoa que gerencia as próprias receitas, despesas, cartões, recorrências e financiamentos.
- **Primary jobs:** entender o mês atual; registrar e corrigir lançamentos; acompanhar compromissos; recuperar-se de falhas sem perder dados.
- **Target market(s):** não formalizado. A interface e formatação atuais são pt-BR; isso não estabelece regras fiscais, bancárias ou regulatórias brasileiras.
- **Active locales:** `pt-BR`.
- **Language/content register:** português direto e operacional; ação e feedback usam o mesmo verbo. Revisão é responsabilidade da manutenção do produto.
- **Timezone/calendar policy:** calendário gregoriano e valores date-only exibidos em `dd/mm/aaaa`. Regras de timezone permanecem as definidas no backend e não podem ser alteradas por uma tarefa visual.
- **Accessibility target:** WCAG 2.2 AA.

## Business-context sources

Os documentos existentes descrevem intenção do produto, mas contêm trechos desatualizados em relação ao código atual. São usados como contexto, não como autorização para mudar segurança, retenção ou ciclo de vida.

| Domain / scope                         | Authoritative source                                               | Source type                                    | Reviewed date |
| -------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------- | ------------- |
| Funcionalidades e linguagem do produto | `FUNCIONALIDADES.md`                                               | Visão funcional; parcialmente desatualizada    | 2026-10-05    |
| Stack, rotas e tema atual              | `README.md`, `web-app/angular.json`                                | Documentação + configuração                    | 2026-10-05    |
| Contratos de dados e paginação         | Controllers/DTOs em `api/src/modules/**`                           | Contrato de API verificado no código           | 2026-10-05    |
| Contexto/permissão atual               | `api/src/common/guards/application-context.guard.ts` e controllers | Implementação; política mantida não localizada | 2026-10-05    |
| Exclusão e retenção                    | Services/controllers por domínio                                   | Implementação; política mantida não localizada | 2026-10-05    |
| Cobrança/pagamento externo             | Não aplicável ao escopo atual                                      | Nenhuma cobrança externa identificada          | 2026-10-05    |
| Texto legal/regulatório                | Não localizado                                                     | Decisão não estabelecida                       | 2026-10-05    |
| Mercado e conteúdo                     | `LOCALE_ID`, tradução PrimeNG e UI existente                       | Evidência de locale, não de mercado            | 2026-10-05    |

### High-risk boundary

- Nenhuma mudança futura pode alterar permissão, isolamento de workspace, retenção, exclusão, pagamento ou efeito financeiro com base apenas neste contrato.
- A implementação atual indica exclusões permanentes em alguns domínios e desativação condicional de categorias, mas não há política de retenção mantida. Novos fluxos destrutivos ficam bloqueados até uma fonte de negócio ser registrada.
- Confirmações devem descrever o efeito real retornado pela API. “Desfazer” ou “Restaurar” só pode existir se o backend oferecer recuperação confiável.

## Visual contract

- **Project `DESIGN.md`:** `DESIGN.md`.
- **Token ownership model:** runtime existente canônico; `DESIGN.md` espelha valores aceitos.
- **Runtime token source:** `web-app/src/styles/_theme.scss` e `_variables.scss`.
- **Mapping/adapters:** tabela “Runtime mapping” em `DESIGN.md`; Arya Blue em `web-app/angular.json`; traduções e z-index em `AppComponent`.
- **Token drift gate:** lint do `DESIGN.md`, comparação manual do mapa e busca por literais/aliases durante mudanças globais.
- **Supported themes:** dark/Arya Blue apenas na baseline.
- **Review policy:** atualizar documento, token runtime e componente consumidor na mesma alteração sistêmica.

## Canonical UI Map

| Capability      | Canonical owner                                       | Source of truth                     | Allowed variants                        | Verification                         |
| --------------- | ----------------------------------------------------- | ----------------------------------- | --------------------------------------- | ------------------------------------ |
| Table Selection | Não aplicável atualmente; não há seleção em massa     | Este contrato                       | page / all-results somente após decisão | componente + E2E                     |
| Select/Listbox  | PrimeNG Dropdown                                      | `DESIGN.md` + este contrato         | authored                                | teclado + popup em viewport estreito |
| Date            | `app-masked-calendar` sobre PrimeNG Calendar          | este contrato + utilitários de data | typed `date` / typed `month`            | locale + teclado + E2E               |
| Form            | Angular Reactive Forms + regras deste contrato        | este contrato                       | create / edit                           | validação e recuperação no navegador |
| Scrollbar       | stylesheet global `_components.scss`                  | `DESIGN.md`                         | exceção de geometria documentada        | estilo computado + forced colors     |
| Toast           | `MessageService` raiz e `<p-toast>` em `AppComponent` | este contrato                       | success / warning / info / error        | live region + deduplicação           |
| CRUD            | rota, serviço Angular e contrato REST do domínio      | API + este contrato                 | return / stay conforme ledger           | fluxo completo + falha               |

Proprietários locais duplicados são drift. Hoje existem providers locais de `MessageService`, calendários diretos, estados vazios repetidos e estilos de scrollbar por widget; a migração será feita por fatias, sem legitimar essas duplicações como variantes.

## Component behavior

| Component    | Default                                      | Hover                     | Focus                 | Active                     | Disabled                                   | Busy                               | Error                                  |
| ------------ | -------------------------------------------- | ------------------------- | --------------------- | -------------------------- | ------------------------------------------ | ---------------------------------- | -------------------------------------- |
| Button       | rótulo e intenção explícitos                 | contraste deliberado      | anel visível          | estado pressionado         | sem handler e com motivo quando necessário | tamanho estável e submit bloqueado | erro aparece na região relacionada     |
| Icon button  | nome acessível obrigatório                   | tooltip complementar      | anel visível          | feedback semântico         | não dispara                                | spinner/estado anunciado           | não usa toast como única explicação    |
| Input        | label persistente                            | borda sutil               | foco visível          | n/a                        | legível e não interativo                   | preserva valor                     | texto associado por `aria-describedby` |
| Secret input | mascarado                                    | controle revelar          | toggle acessível      | n/a                        | sem cópia acidental                        | n/a                                | segredo nunca aparece em toast/log     |
| Search       | limpar explícito + debounce remoto de 300 ms | controle limpar visível   | foco retorna ao input | Enter respeita composição  | motivo explicado                           | requisição anterior cancelada      | mantém consulta e oferece retry        |
| Textarea     | `resize: none` e altura suficiente           | borda sutil               | foco visível          | n/a                        | preserva leitura                           | preserva texto                     | erro associado                         |
| Table/list   | estado e total claros                        | somente linhas acionáveis | ordem navegável       | seleção/expansão explícita | ações indisponíveis explicadas             | geometria preservada               | erro parcial não apaga dados válidos   |

## Dataset navigation

- **Admin tables:** paginação server-side quando a API oferecer; tamanho inicial 10, com opções coerentes entre tabelas.
- **Exploratory lists:** sem infinite scroll. Usar paginação ou “Carregar mais” somente quando o volume justificar.
- **URL state:** filtros comprometidos, ordenação, página e page size devem migrar para query params. Estado atual em memória é dívida registrada.
- **Page size:** 10 por padrão; opções maiores precisam preservar a área da tabela e não criar segundo scroll vertical no shell.
- **States:** loading, vazio inicial, sem resultados, erro parcial, erro total, total/range e retry são distintos.
- **Back/scroll restoration:** retorno à lista preserva filtros, ordenação, página e posição quando a navegação sai da rota.
- **Selection:** não implementada. Qualquer seleção em massa futura deve definir page/all-results, contagem, confirmação e falhas parciais antes do código.

## Flow ledger

| Operation      | Trigger                                 | Pending                                  | Success destination                              | Success feedback            | Failure recovery                                                          | Focus outcome                         | Source ref                                           |
| -------------- | --------------------------------------- | ---------------------------------------- | ------------------------------------------------ | --------------------------- | ------------------------------------------------------------------------- | ------------------------------------- | ---------------------------------------------------- |
| Create         | “Nova …”                                | botão busy, sem duplicar                 | lista proprietária, preservando estado aplicável | toast com objeto criado     | diálogo permanece com valores e erro inline                               | foco retorna ao gatilho ou novo item  | componentes e services do domínio                    |
| Edit           | “Editar”                                | botão busy, formulário preservado        | lista proprietária                               | toast com objeto atualizado | diálogo permanece; mapear erros do servidor                               | foco retorna à ação do item           | componentes e services do domínio                    |
| Delete         | “Excluir” + confirmação                 | ação final busy                          | lista com página ajustada                        | toast de exclusão concluída | diálogo permanece/reabre com retry seguro                                 | foco vai ao próximo item ou cabeçalho | API do domínio; lifecycle ainda sem política mantida |
| Search/filter  | mudança comprometida ou Enter           | loading regional e requisição cancelável | mesma rota com URL atualizada                    | sem toast                   | manter consulta e mostrar erro inline                                     | permanecer no campo/controle          | Transactions API + contrato                          |
| Bulk action    | não disponível                          | n/a                                      | n/a                                              | n/a                         | n/a                                                                       | n/a                                   | decisão futura obrigatória                           |
| Background job | gerar projeções/recorrência             | progresso regional                       | mesma rota atualizada                            | toast breve                 | explicar efeito incerto e permitir retry idempotente somente se suportado | volta ao gatilho                      | endpoints de projeção/recorrência                    |
| Cancel/back    | “Cancelar” ou Voltar                    | nenhum                                   | origem anterior segura                           | sem toast                   | alertar se houver alterações não salvas                                   | retorna ao gatilho/origem             | este contrato                                        |
| Soft-delete    | categoria vinculada pode ser desativada | confirmação explícita                    | lista atualizada                                 | “Categoria desativada”      | manter item e explicar falha                                              | próximo item                          | categories implementation                            |
| Hard-delete    | varia por domínio                       | confirmação com objeto e consequência    | lista atualizada                                 | verbo real                  | não prometer Undo sem API                                                 | próximo item                          | política de negócio ausente; implementação atual     |

## Navigation and responsive behavior

- Cada rota navegável define `document.title` localizado no formato “Página | Expense Tracker”; o layout principal aplica os metadados já na primeira renderização e nas navegações seguintes.
- 404, 403 e erro de rota devem ser páginas distintas quando esses estados existirem no produto; nunca redirecionar silenciosamente uma falta de permissão para login/404.
- Sidebar vira drawer modal em viewport estreito, com foco inicial, trap/inert, Escape, scroll lock e restauração no botão de menu.
- Em mobile, a topbar mostra menu e marca compacta; título da rota pertence ao conteúdo da página.
- Tabelas permanecem semânticas no desktop e usam representação responsiva compacta abaixo de 640 px. A alternativa mantém ações, status, ordenação e acesso ao valor completo.
- Valores truncados possuem acesso por foco/click, não somente hover.
- Conteúdo focado não pode ficar encoberto pela topbar fixa ou teclado virtual.

## Overlays and feedback

- **Dialog primitive:** PrimeNG Dialog e ConfirmDialog.
- **Destructive confirmation:** nomear objeto e consequência; foco inicial na ação segura; botão final usa verbo real.
- **Toast:** `AppMessageService` é o provider raiz único, canto superior direito no desktop, largura `calc(100vw - 2rem)` no mobile, deduplicação por 2,5 s e no máximo uma mensagem visível em tela estreita. Toast não contém a única cópia de erro corrigível.
- **Alert/banner:** `InlineAlert` na região para falha recuperável; banner global somente para indisponibilidade que afete toda a aplicação.
- **Tooltip:** complementar a nomes acessíveis; dispensável por Escape e nunca a única fonte de instrução crítica.
- **Unsaved changes:** diálogo da aplicação para navegação interna; mecanismo do navegador apenas para unload real.
- **Layer contract:** conteúdo normal < sticky `100` < dropdown `200` < popover `300` < topbar `400` < backdrop `500` < diálogo `600` < drawer `700` < toast `900`; menus popup usam o host global do PrimeNG e não criam stacking context dentro do cabeçalho.

## Async and resilience

- Mutação é pessimista por padrão: só atualizar o estado final após confirmação do servidor.
- Desabilitar submissão duplicada e manter dimensões do botão durante busy.
- Não há auto-save/draft canônico na baseline.
- Leitura pode manter dados anteriores durante refresh; escrita offline não é enfileirada.
- Retry é explícito e limitado; não repetir automaticamente operação financeira ou não idempotente.
- Conflito/versionamento e comportamento multi-tab não estão formalizados; não fazer optimistic update em dados financeiros sem suporte do backend.
- Sessão/autenticação está em alteração no repositório; não definir fluxo de reautenticação nesta fase.
- Requisições obsoletas de busca/filtro devem ser canceladas ou ignoradas.
- Falha de mutação preserva diálogo, valores e contexto para nova tentativa.

## Validation

- Angular Reactive Forms é a camada canônica de validação client-side; DTOs/class-validator continuam responsáveis pelo servidor.
- Validar no blur e no submit; validação que depende de outro campo pode reagir à mudança sem exibir erro prematuramente.
- Formulários usam `novalidate`; primeiro erro recebe foco/scroll; cada erro possui texto e orientação de correção.
- Erros de servidor são mapeados ao campo quando possível; erro geral permanece no formulário.
- Valores sensíveis, como API keys, ficam mascarados por padrão e não aparecem em URL, analytics, logs ou toast.
- Submit duplicado é bloqueado. Cancelamento com alterações exige confirmação quando a perda for material.

## Permission and clipboard

- Política de permissão mantida não foi localizada. O frontend não pode inferir autoridade; respostas 403 devem produzir estado dedicado quando o backend as emitir.
- A chave de API usa preview truncado e ação explícita de copiar. O valor completo não aparece em toast.
- Controle desabilitado explica o motivo quando ele não for evidente.

## Migration status

- **Ledger:** `docs/ui-baseline/phase-0.md` e `FRONTEND-VISUAL-IMPROVEMENT-PLAN.md`.
- **Canonical primitives:** inventário em `DESIGN.md`; componentes planejados devem nascer em `web-app/src/app/shared/components`.
- **Prioridade atual:** hierarquia e composição do dashboard na Fase 3; shell/mobile, feedback, loading regional e tabelas responsivas já possuem baseline compartilhada.
- **Enforcement:** `premium-ui.json`, auditoria estática, lint e build.
- **Rollback:** migração por rota/componente; manter componente legado até o consumidor migrado passar nos estados e viewports definidos.
- **Removal gate:** remover CSS/componente legado somente após busca sem consumidores e comparação com rota irmã.

## Verification

- **Required static commands:** definidos em `premium-ui.json`.
- **Browser matrix:** desktop padrão, 1366 × 768, 768 px, 390 × 844 e zoom 200%.
- **Accessibility:** teclado, foco visível/restaurado, nomes acessíveis, contraste, reflow e reduced motion.
- **Locale/theme:** pt-BR e dark/Arya Blue.
- **Visual regression:** ainda não automatizada; baseline registrada em `docs/ui-baseline/phase-0.md`.
- **Canonical sibling flows:** Transações para tabela/formulário; Categorias para grid/card; Dashboard para métricas/loading.
- **Project audit:** `audit_project.py . --mode strict --config premium-ui.json`.
- **CRUD evidence:** testes automatizados completos ainda não existem; browser e testes unitários são obrigatórios até a criação de E2E.
- **Failure-path evidence:** baseline manual documentada; automatização pendente.
