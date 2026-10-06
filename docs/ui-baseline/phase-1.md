# Validação visual — Fase 1

## Escopo concluído

- Cabeçalho mobile compacto, metadados de rota imediatos e títulos de documento localizados.
- Sidebar modal com Escape, foco inicial, bloqueio de scroll e restauração de foco.
- `ResponsiveActions`, `InlineAlert`, `LoadingRegion` e `ResponsiveDataView` compartilhados.
- Mensagens centralizadas em `AppMessageService`, com deduplicação e apenas um toast no mobile.
- Dashboard sem overlay global com blur e com recuperação regional.
- Transações com tabela semântica no desktop e cartões abaixo de 640 px.
- Categorias e Recorrências com ações responsivas, loading regional e erro recuperável.

## Evidência em navegador real

Validação executada em Chrome contra `http://127.0.0.1:4200`, com a API local indisponível para exercitar loading, erro e retry.

| Viewport | Rotas | Resultado |
|---:|---|---|
| 390 × 844 | Dashboard, Transações, Categorias e Recorrências | sem overflow horizontal; cabeçalho compacto; ações e retry acessíveis |
| 768 × 900 | Dashboard, Transações, Categorias e Recorrências | sem corte ou sobreposição; títulos e feedback corretos |
| 1440 × 900 | Transações | tabela semântica visível; representação mobile oculta; título de rota correto |

Verificações de interação:

- O menu “Mais ações” expôs Filtros de projeção, Gerenciar projeções e Nova Projeção em 390 px.
- A sidebar recebeu foco inicial, fechou com Escape e devolveu o foco ao botão “Abrir menu principal”.
- A visualização de Transações alternou de tabela para lista em 639 px, sem duplicar conteúdo visível.
- O dashboard exibiu somente o `InlineAlert` recuperável; carregamentos auxiliares não duplicaram a falha em toast.
- A recorrência não voltou a registrar `NG01203` no controle `isActive`.

## Gates

| Verificação | Resultado |
|---|---|
| `npm --prefix web-app run lint` | aprovado com 0 erros e 70 avisos preexistentes |
| `npm --prefix web-app test -- --watch=false --browsers=ChromeHeadless` | 1 teste aprovado |
| `npm --prefix web-app run build:prod` | aprovado; permanecem avisos de budget e arquivos não usados |
| `designmd lint DESIGN.md` | 0 erros; 3 avisos de contraste já registrados para a Fase 2 |
| auditoria premium em modo report | 31 violações, igual à baseline da Fase 0; nenhuma nova violação líquida |
| auditoria premium em modo strict | falha esperada nas 31 violações de baseline |

As violações remanescentes continuam concentradas em affordances legadas que o auditor não reconhece como handlers Angular, formulários sem `novalidate`, textareas sem regra canônica de resize e scrollbars somente WebKit. Elas permanecem fora do objetivo responsivo da Fase 1 e seguem rastreadas no relatório `premium-audit.json`.
