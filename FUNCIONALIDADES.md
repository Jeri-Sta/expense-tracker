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

### 7. **Projeções Financeiras**

#### 7.1 Visão Geral
- **Objetivo**: Permitir a visualização de transações futuras estimadas baseadas em recorrências ou inserção manual.
- **Integração**: As projeções são integradas à lista de transações e aos gráficos do dashboard.

#### 7.2 Funcionalidades
- **Geração Automática**: Gera projeções futuras baseadas nas transações recorrentes cadastradas.
- **Inserção Manual**: Possibilidade de criar uma transação futura marcada como "Projeção".
- **Filtros de Projeção**:
  - Incluir projeções na lista
  - Ver apenas projeções
  - Filtrar por fonte (Recorrente, Manual, IA)
  - Filtrar por grau de confiança
- **Limpeza**: Ferramenta para limpar projeções antigas ou regenerá-las.

---

### 8. **Segurança e Privacidade**

#### 8.1 Autenticação e Autorização
- **JWT Tokens**: Autenticação segura com tokens.
- **Proteção de Rotas**: Guards no frontend e backend para impedir acesso não autorizado.

#### 8.2 Proteção de Dados
- **Isolamento**: Cada usuário vê apenas seus próprios dados (filtragem por User ID no backend).
- **Senhas**: Armazenadas com hash seguro.

---

## 🚀 Como Navegar na Aplicação

### Fluxo de Uso Típico

1. **Login**: Acesso com email/senha
2. **Dashboard**: Visão geral das finanças
3. **Nova Transação**: Registro de receita/despesa
4. **Categorização**: Organização por categorias
5. **Financiamentos**: Gestão de dívidas a longo prazo
6. **Recorrências**: Configuração de contas fixas
7. **Projeções**: Visualização do futuro financeiro

---

## 📊 Resumo das Telas Principais

| Tela | Descrição | Funcionalidades Principais |
|------|-----------|---------------------------|
| **Login/Registro** | Autenticação de usuários | Login, registro |
| **Dashboard** | Visão geral financeira | KPIs, gráficos, resumos rápidos |
| **Transações** | Gestão de movimentações | CRUD, filtros, busca, projeções |
| **Categorias** | Organização de gastos | Criação, edição, visualização |
| **Recorrências** | Automação de transações | Agendamento, execução, histórico |
| **Financiamentos** | Gestão de parcelamentos | CRUD completo, pagamentos, quitação |

---

Esta documentação representa a funcionalidade atualmente implementada do Expense Tracker.