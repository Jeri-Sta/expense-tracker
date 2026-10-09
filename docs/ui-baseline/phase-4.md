# Fase 4 — Migração das telas CRUD

**Data:** 2026-10-09  
**Status:** implementação, varredura responsiva e fluxos de gravação em API descartável concluídos; teclado virtual de dispositivo pendente.

## Migrações

- Adicionado `PageHeader` compartilhado com título, descrição e área de ações; aplicado em Transações, Categorias, Recorrências, Cartões, Faturas, Financiamentos e Configurações.
- Aplicado `ResponsiveActions` às ações de página e detalhes de financiamento. Painéis de Categorias, Recorrências, Cartões e Faturas agora usam `content-panel` e `content-panel--outlined`; Transações mantém `.card` como alias de compatibilidade junto aos tokens canônicos.
- Estados de carregamento, vazio, falha total e falha parcial agora têm mensagem e tentativa de recuperação nas rotas migradas. Faturas preservam a tabela quando somente o carregamento de faturas falha.
- Salvamentos impedem envio duplicado, mantêm valores em falha e mostram o estado ocupado no controle. A confirmação das ações destrutivas permanece no diálogo da aplicação.
- Formulários têm `novalidate`; no envio inválido, o primeiro controle recebe foco e rolagem, e o helper associa o erro visível com `aria-invalid` e `aria-describedby`, removendo os atributos quando o campo fica válido. O formulário de pagamento de parcela recebeu validação e estado ocupado.
- Textareas das telas migradas mantêm `resize: none`.
- A varredura encontrou e corrigiu overflow na lista de financiamentos: os mixins usavam nomes de breakpoint inválidos (`md`/`xl`) e a coluna mínima de 400 px permanecia ativa. Também antecipou o menu secundário de ações e o empilhamento do `PageHeader` até 1023 px para evitar overflow em tablet e em layouts estreitos.
- O helper de validação agora também aplica `aria-invalid` e `aria-describedby` ao controle focável dentro de componentes PrimeNG; a associação do erro é repetida no próximo frame, após a mensagem condicional aparecer.

## Validações

| Verificação | Resultado |
| --- | --- |
| `npm run lint` | Passou, 0 erros e 53 avisos: 52 ocorrências de `any` e um botão de ícone sem conteúdo textual detectável. |
| `npm test -- --watch=false --browsers=ChromeHeadless` | Passou, 4 testes. |
| `npm run build:prod` | Passou. Permanecem avisos de orçamento SCSS, bundle inicial de 1,71 MB (orçamento de 500 kB), arquivos TypeScript não usados e dados desatualizados de `baseline-browser-mapping`. |
| `audit_project.py . --mode strict` | 6 achados `affordance.actionless-button`. São falsos positivos da regra, que não reconhece eventos Angular `(click)`; os quatro controles de Categorias, o menu da topbar e o botão do calendário têm handlers reais. O total caiu de 10 para 6. JSON em `web-app/premium-audit.json`. |
| Chrome, matriz responsiva | As sete rotas renderizaram em 390 × 844, 768 × 1024, 960 × 428 e 1366 × 768; `scrollWidth` do documento não excedeu a largura disponível após os ajustes. 960 × 428 é uma aproximação de largura efetiva em zoom, não um teste de zoom real. |
| Chrome, formulário de Transação | Submissão inválida por teclado manteve o diálogo aberto, focou o primeiro campo e associou as mensagens visíveis com `aria-describedby`. Nenhuma gravação ocorreu. |
| Chrome, diálogo de pagamento em 390 × 430 | O diálogo permaneceu dentro do viewport e o conteúdo rolou internamente (`overflow-y: auto`); foi fechado por Cancelar sem confirmar pagamento. |
| Chrome, cópia com API em memória | Foram criados com sucesso transação, categoria, recorrência, cartão, compra no cartão e financiamento; o pagamento de uma parcela atualizou o resumo e o status no mock. Nenhum desses registros foi enviado à API com dados persistidos. |
| Chrome, edição e exclusão no mock | A edição atualizou a descrição, mostrou sucesso e fechou o diálogo. A exclusão exigiu confirmação, removeu a linha da tabela e mostrou sucesso. |
| Chrome, erros e submit duplicado | A falha simulada ao salvar categoria manteve o formulário e o valor digitado. A recorrência com resposta atrasada desabilitou Salvar enquanto aguardava e gerou uma única requisição `POST`. |
| Chrome, ações secundárias | O menu “Mais” em viewport mobile abriu “Gerenciar projeções” corretamente. |

## Verificações pendentes

- Zoom real de 200% e teclado virtual de dispositivo não foram simulados; a matriz de viewport cobre dimensões equivalentes e altura curta, sem reproduzir esses recursos do sistema operacional. Os atalhos de zoom enviados pela API da aba não alteraram o zoom do Chrome, e a capacidade disponível controla somente largura/altura.
- O ambiente não tem `adb` ou emulador Android disponível para abrir o teclado virtual sobre os diálogos. Os fluxos de gravação foram exercitados apenas na cópia conectada à API em memória, sem escrita nos dados financeiros persistidos.

Zoom real e teclado virtual continuam necessários para fechar a matriz mínima do plano; teclado real requer um dispositivo conectado.
