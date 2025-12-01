# Expense Tracker - Documentação de Funcionalidades

## 📱 Sobre a Aplicação

O **Expense Tracker** é uma aplicação completa de controle financeiro pessoal desenvolvida com tecnologias modernas. A aplicação permite aos usuários gerenciar suas finanças de forma intuitiva e eficiente, oferecendo recursos avançados para acompanhamento de receitas, despesas, categorização de gastos, transações recorrentes e análises financeiras detalhadas.

### Tecnologias Utilizadas
- **Backend**: NestJS com TypeScript, PostgreSQL, Redis, JWT Authentication
- **Frontend**: Angular 17 com PrimeNG, Chart.js para gráficos
- **Infraestrutura**: Docker para containerização
- **Banco de Dados**: PostgreSQL com TypeORM

---

## 🏠 Funcionalidades Principais

### 1. **Sistema de Autenticação**

#### 1.1 Tela de Login
- **Localização**: Primeira tela acessada pelos usuários
- **Campos**:
  - Email do usuário
  - Senha
- **Funcionalidades**:
  - Autenticação segura com JWT
  - Validação de formulário em tempo real
  - Mensagens de erro personalizadas
  - Redirecionamento automático após login bem-sucedido
  - Link para tela de registro

#### 1.2 Tela de Registro
- **Localização**: Acessível através do link na tela de login
- **Campos**:
  - Nome completo
  - Email
  - Senha
  - Confirmação de senha
- **Funcionalidades**:
  - Criação de nova conta de usuário
  - Validação de email único
  - Verificação de força da senha
  - Confirmação de senha obrigatória
  - Redirecionamento automático para o dashboard após registro

#### 1.3 Logout
- **Localização**: Disponível em todas as telas através do menu
- **Funcionalidades**:
  - Encerramento seguro da sessão
  - Limpeza do token JWT
  - Redirecionamento para tela de login

---

### 2. **Dashboard Principal**

#### 2.1 Visão Geral Financeira
- **Localização**: Tela principal após login
- **Componentes Principais**:

##### Cards de Resumo (KPIs)
- **Total de Receitas**: Soma de todas as receitas do período selecionado
- **Total de Despesas**: Soma de todas as despesas do período selecionado
- **Saldo Atual**: Diferença entre receitas e despesas
- **Crescimento**: Percentual de variação em relação ao período anterior

##### Filtros de Período
- **Opções disponíveis**:
  - Este mês
  - Últimos 3 meses
  - Últimos 6 meses
  - Este ano
  - Período customizado (seletor de datas)

#### 2.2 Gráficos e Análises

##### Gráfico de Tendência Mensal
- **Tipo**: Gráfico de linha
- **Dados**: Evolução de receitas e despesas ao longo dos meses
- **Funcionalidades**:
  - Visualização comparativa entre receitas e despesas
  - Hover para detalhes específicos de cada ponto
  - Legendas interativas para mostrar/ocultar séries

##### Gráfico de Distribuição por Categorias
- **Tipo**: Gráfico de pizza (donut)
- **Dados**: Percentual de gastos por categoria
- **Funcionalidades**:
  - Cores personalizadas por categoria
  - Hover para ver valores absolutos e percentuais
  - Click para filtrar transações da categoria

#### 2.3 Resumos Rápidos

##### Transações Recentes
- **Exibição**: Lista das 10 últimas transações
- **Informações mostradas**:
  - Descrição da transação
  - Categoria com ícone colorido
  - Valor (verde para receitas, vermelho para despesas)
  - Data da transação
- **Funcionalidades**:
  - Link para ver todas as transações
  - Acesso rápido para editar transação

---

### 3. **Gerenciamento de Transações**

#### 3.1 Lista de Transações
- **Localização**: Menu "Transações"
- **Layout**: Tabela responsiva com paginação

##### Colunas da Tabela
- **Data**: Data da transação (formato dd/mm/aaaa)
- **Descrição**: Descrição detalhada da transação
- **Categoria**: Nome da categoria com ícone colorido
- **Tipo**: Receita (verde) ou Despesa (vermelho)
- **Valor**: Valor monetário formatado
- **Ações**: Botões para editar e excluir

##### Sistema de Filtros
- **Filtro por Tipo**:
  - Todas as transações
  - Apenas receitas
  - Apenas despesas

- **Filtro por Categoria**:
  - Dropdown com todas as categorias disponíveis
  - Opção "Todas as categorias"

- **Filtro por Período**:
  - Data inicial e final
  - Presets rápidos (este mês, últimos 30 dias, etc.)

- **Busca Textual**:
  - Campo de busca na descrição das transações
  - Busca em tempo real (debounced)

##### Funcionalidades Adicionais
- **Ordenação**: Click nos cabeçalhos para ordenar por qualquer coluna
- **Paginação**: Navegação por páginas com seleção de itens por página
- **Resumo**: Totais de receitas, despesas e saldo dos itens filtrados

#### 3.2 Formulário de Nova Transação
- **Localização**: Botão "+" na lista de transações
- **Modal/Página**: Formulário em modal

##### Campos do Formulário
- **Tipo**: Radio buttons para Receita ou Despesa
- **Descrição**: Campo de texto obrigatório
- **Valor**: Campo numérico com formatação monetária
- **Categoria**: Dropdown com todas as categorias do usuário
- **Data**: Seletor de data (padrão: data atual)
- **Observações**: Campo de texto opcional para detalhes adicionais

##### Validações
- **Descrição**: Mínimo 3 caracteres, máximo 255
- **Valor**: Deve ser maior que zero
- **Categoria**: Seleção obrigatória

#### 3.3 Edição de Transações
- **Acesso**: Click no botão editar na lista
- **Formulário**: Mesmo layout da criação, com campos pré-preenchidos

#### 3.4 Exclusão de Transações
- **Processo**: Modal de confirmação
- **Efeitos**: Atualização automática de todos os resumos e gráficos

---

### 4. **Gerenciamento de Categorias**

#### 4.1 Lista de Categorias
- **Localização**: Menu "Categorias"
- **Layout**: Grid responsivo de cards

##### Card de Categoria
- **Elementos visuais**:
  - Ícone personalizado
  - Cor personalizada
  - Nome da categoria
  - Total gasto/recebido na categoria
  - Número de transações

#### 4.2 Criação de Nova Categoria
- **Formulário**:
  - Nome da categoria (obrigatório)
  - Seletor de ícones (biblioteca PrimeIcons)
  - Seletor de cores (palette personalizada)
  - Tipo padrão (Receita/Despesa/Ambos)

#### 4.3 Edição e Exclusão
- **Edição**: Alterar nome, ícone e cor.
- **Exclusão**: Possível apenas se não houver transações vinculadas (ou com tratamento adequado).

---

### 5. **Transações Recorrentes**

#### 5.1 Lista de Recorrências
- **Localização**: Menu "Recorrências"
- **Layout**: Lista com cards expansíveis

##### Card de Recorrência
- **Informações principais**:
  - Descrição da recorrência
  - Valor e tipo (receita/despesa)
  - Frequência (diária, semanal, mensal, anual)
  - Próxima execução
  - Status (ativa/pausada)

#### 5.2 Tipos de Recorrência
- **Diária**: Todos os dias
- **Semanal**: Em dias específicos da semana
- **Quinzenal**: A cada 15 dias
- **Mensal**: Em dias específicos do mês
- **Bimestral, Trimestral, Semestral, Anual**

#### 5.3 Criação de Nova Recorrência
- **Formulário completo**:
  - Dados básicos da transação
  - Configuração de frequência
  - Data de início
  - Data de fim (opcional)

#### 5.4 Automação e Processamento
- **Execução Automática**:
  - Rotina diária (Cron Job) que verifica e processa transações vencidas automaticamente à meia-noite.
  - Gera a transação real no histórico financeiro sem intervenção do usuário.
  - Atualiza automaticamente a data da próxima execução.
- **Gestão Inteligente de Projeções**:
  - Ao efetivar uma transação recorrente, o sistema verifica se existia uma projeção para aquela data.
  - Remove automaticamente a projeção correspondente para evitar duplicidade no fluxo de caixa.
  - Mantém o histórico limpo e consistente.

---

### 6. **Sistema de Financiamentos**

O sistema de financiamentos permite aos usuários gerenciar seus financiamentos de forma abrangente e intuitiva.

#### 6.1 Lista de Financiamentos
- **Localização**: Menu "Financiamentos" e seção dedicada no Dashboard
- **Layout**: Grid responsivo com cards informativos

##### Card de Financiamento
- **Informações exibidas**:
  - Nome/descrição personalizada
  - Valor total financiado
  - Valor individual das parcelas
  - Progresso visual: parcelas pagas vs. total
  - Data do próximo vencimento
  - Status (ativo/concluído)

#### 6.2 Criação de Novo Financiamento
- **Formulário simplificado**:
  - Valor Financiado
  - Valor da Parcela
  - Número de Parcelas
  - Nome/Descrição
  - Data de Início

- **Cálculos Automáticos**:
  - Total a Pagar
  - Total de Juros
  - Taxas efetivas

#### 6.3 Gestão de Parcelas
- **Interface**: Tabela completa com todas as parcelas
- **Status**: Paga (Verde), Pendente (Azul), Vencida (Vermelho)
- **Pagamento**: Modal para registrar pagamento de parcela, com opção de desconto.

---

### 7. **Gerenciamento de Cartões de Crédito**

O sistema de cartões de crédito permite aos usuários gerenciar seus cartões, transações parceladas e faturas de forma completa e intuitiva.

#### 7.1 Lista de Cartões de Crédito
- **Localização**: Menu "Cartões de Crédito"
- **Layout**: Grid responsivo com cards informativos

##### Card de Cartão de Crédito
- **Informações exibidas**:
  - Nome do cartão com cor personalizada
  - Limite total
  - Limite utilizado na fatura atual
  - Limite disponível
  - Barra de progresso visual de utilização
  - Dia de fechamento e vencimento da fatura
  - Percentual de uso

#### 7.2 Criação de Novo Cartão
- **Formulário**:
  - **Nome**: Identificação do cartão (ex: "Nubank", "Itaú Black")
  - **Cor**: Seletor de cores para identificação visual
  - **Dia de Fechamento**: Dia do mês em que a fatura fecha (1-28)
  - **Dia de Vencimento**: Dia do mês para pagamento da fatura (1-28)
  - **Limite Total**: Valor máximo de crédito disponível

- **Validações**:
  - Nome obrigatório (mínimo 2 caracteres)
  - Dias de fechamento e vencimento entre 1 e 28
  - Limite maior que zero

#### 7.3 Gestão de Cartões
- **Edição**: Modificar qualquer campo do cartão
- **Exclusão**: Remoção do cartão e todas as transações associadas (com confirmação)
- **Visualização de Uso**: Acompanhamento em tempo real do limite utilizado

---

### 8. **Transações de Cartão de Crédito (Faturas)**

#### 8.1 Lista de Transações
- **Localização**: Menu "Faturas de Cartão"
- **Layout**: Tabela responsiva com filtros avançados

##### Filtros Disponíveis
- **Por Cartão**: Seletor para filtrar por cartão específico
- **Por Período/Fatura**: Seletor de mês/ano da fatura
- **Busca Textual**: Pesquisa na descrição das transações

##### Colunas da Tabela
- **Data**: Data da transação
- **Descrição**: Descrição detalhada
- **Cartão**: Identificação visual do cartão (cor + nome)
- **Parcela**: X/Y para transações parceladas
- **Valor**: Valor da parcela ou transação
- **Fatura**: Período da fatura (MM/YYYY)
- **Ações**: Botões para editar e excluir

#### 8.2 Criação de Transação
- **Formulário**:
  - **Cartão**: Seletor do cartão de crédito
  - **Descrição**: Descrição da compra
  - **Valor Total**: Valor da compra (dividido automaticamente se parcelado)
  - **Data da Transação**: Data da compra
  - **Parcelamento**: Toggle para ativar parcelamento
    - Número de parcelas (quando ativado)

- **Cálculo Automático de Fatura**:
  - O sistema calcula automaticamente em qual fatura a transação será incluída
  - Se a data da compra for posterior ao dia de fechamento, vai para a próxima fatura
  - Parcelas futuras são distribuídas automaticamente nas faturas correspondentes

#### 8.3 Transações Parceladas
- **Comportamento**:
  - Ao criar uma transação parcelada, o sistema gera automaticamente todas as parcelas
  - Cada parcela é associada à fatura correspondente
  - Transação "pai" mantém referência para todas as parcelas "filhas"
  - Valor dividido igualmente entre as parcelas

- **Visualização**:
  - Exibição "X/Y" mostrando parcela atual e total
  - Filtro para ver todas as parcelas de uma compra
  - Indicador visual para transações parceladas

#### 8.4 Gestão de Faturas
- **Status da Fatura**:
  - **Aberta** (Azul): Fatura em andamento, aceita novas transações
  - **Fechada** (Laranja): Fatura fechada aguardando pagamento
  - **Paga** (Verde): Fatura quitada

- **Ações de Fatura**:
  - Alterar status (marcar como paga)
  - Visualizar total da fatura
  - Data de fechamento e vencimento
  - Sumário de transações

#### 8.5 Widgets no Dashboard
- **Card de Limites de Cartões**:
  - Resumo de todos os cartões
  - Barra de progresso por cartão
  - Total de limite disponível/utilizado

- **Card de Parcelamentos Ativos**:
  - Lista das transações parceladas em andamento
  - Progresso de cada parcelamento
  - Total mensal comprometido com parcelas

---

### 9. **Projeções Financeiras**

#### 9.1 Visão Geral
- **Objetivo**: Permitir a visualização de transações futuras estimadas baseadas em recorrências ou inserção manual.
- **Integração**: As projeções são integradas à lista de transações e aos gráficos do dashboard.

#### 9.2 Funcionalidades
- **Geração Automática**: Gera projeções futuras baseadas nas transações recorrentes cadastradas.
- **Inserção Manual**: Possibilidade de criar uma transação futura marcada como "Projeção".
- **Filtros de Projeção**:
  - Incluir projeções na lista
  - Ver apenas projeções
  - Filtrar por fonte (Recorrente, Manual, IA)
  - Filtrar por grau de confiança
- **Limpeza**: Ferramenta para limpar projeções antigas ou regenerá-las.

---

### 10. **Segurança e Privacidade**

#### 10.1 Autenticação e Autorização
- **JWT Tokens**: Autenticação segura com tokens.
- **Proteção de Rotas**: Guards no frontend e backend para impedir acesso não autorizado.

#### 10.2 Proteção de Dados
- **Isolamento**: Cada usuário vê apenas seus próprios dados (filtragem por User ID no backend).
- **Senhas**: Armazenadas com hash seguro.

---

## 🚀 Como Navegar na Aplicação

### Fluxo de Uso Típico

1. **Login**: Acesso com email/senha
2. **Dashboard**: Visão geral das finanças, limites de cartões e parcelamentos
3. **Nova Transação**: Registro de receita/despesa
4. **Categorização**: Organização por categorias
5. **Cartões de Crédito**: Cadastro e gestão de cartões
6. **Faturas**: Registro de compras no cartão e acompanhamento de faturas
7. **Financiamentos**: Gestão de dívidas a longo prazo
8. **Recorrências**: Configuração de contas fixas
9. **Projeções**: Visualização do futuro financeiro

---

## 📊 Resumo das Telas Principais

| Tela | Descrição | Funcionalidades Principais |
|------|-----------|---------------------------|
| **Login/Registro** | Autenticação de usuários | Login, registro |
| **Dashboard** | Visão geral financeira | KPIs, gráficos, resumos rápidos, widgets de cartões |
| **Transações** | Gestão de movimentações | CRUD, filtros, busca, projeções |
| **Categorias** | Organização de gastos | Criação, edição, visualização |
| **Recorrências** | Automação de transações | Agendamento, execução, histórico |
| **Financiamentos** | Gestão de parcelamentos | CRUD completo, pagamentos, quitação |
| **Cartões de Crédito** | Gestão de cartões | CRUD, limite, fechamento/vencimento |
| **Faturas de Cartão** | Transações de cartão | Transações, parcelamento, status de fatura |

---

Esta documentação representa a funcionalidade atualmente implementada do Expense Tracker.