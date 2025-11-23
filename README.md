# Expense Tracker - Aplicação de Controle Financeiro

Uma aplicação completa de controle financeiro desenvolvida com Angular 17, PrimeNG e NestJS.

## 🚀 Funcionalidades

### ✅ Backend (NestJS)
- **Autenticação JWT** completa com registro e login
- **Gerenciamento de Usuários** com validação e segurança
- **Transações CRUD** com filtros, paginação e estatísticas
- **Categorias** com cores e ícones personalizados
- **Transações Recorrentes** com agendamento automático
- **Base de Dados PostgreSQL** com TypeORM
- **Validação** abrangente com class-validator
- **Documentação Swagger** automática
- **Docker** para desenvolvimento

### ✅ Frontend (Angular + PrimeNG)
- **Dashboard** com gráficos e análises financeiras
- **Gerenciamento de Transações** completo
- **Gerenciamento de Categorias** com seletor de cores e ícones
- **Transações Recorrentes** com controles de agendamento
- **Interface Responsiva** com tema escuro (Arya Blue)
- **Gráficos Interativos** com Chart.js
- **Navegação Mobile** com sidebar

## 📁 Estrutura do Projeto

```
expense-tracker-ia/
├── api/                    # Backend NestJS
│   ├── src/
│   │   ├── auth/          # Módulo de autenticação
│   │   ├── users/         # Gerenciamento de usuários
│   │   ├── transactions/  # CRUD de transações
│   │   ├── categories/    # Gerenciamento de categorias
│   │   ├── recurring/     # Transações recorrentes
│   │   └── database/      # Configuração do banco
│   ├── docker-compose.yml # PostgreSQL container
│   └── package.json
│
├── app/                   # Frontend Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── dashboard/           # Dashboard principal
│   │   │   │   ├── transactions/       # Lista e CRUD de transações
│   │   │   │   ├── categories/         # Gerenciamento de categorias
│   │   │   │   └── recurring-transactions/ # Transações recorrentes
│   │   │   ├── services/              # Serviços Angular
│   │   │   └── types/                 # Interfaces TypeScript
│   │   ├── styles.scss               # Estilos globais
│   │   └── index.html
│   ├── angular.json
│   └── package.json
│
└── web-app/              # Projeto Angular adicional (estrutura existente)
```

## 🛠️ Configuração e Execução

### Pré-requisitos
- Node.js (versão 18+)
- Docker e Docker Compose
- Angular CLI (`npm install -g @angular/cli`)

### 1. Backend (API NestJS)

```bash
# Navegar para a pasta da API
cd api

# Instalar dependências
npm install

# Iniciar PostgreSQL com Docker
docker-compose up -d

# Executar migrações (se necessário)
npm run migration:run

# Iniciar em modo desenvolvimento
npm run start:dev
```

A API estará disponível em: `http://localhost:3000`
Swagger UI: `http://localhost:3000/api`

### 2. Frontend (Angular)

```bash
# Navegar para a pasta do app
cd app

# Instalar dependências
npm install

# Iniciar em modo desenvolvimento
npm start
```

A aplicação estará disponível em: `http://localhost:4200`

## 📱 Como Usar

### 1. Dashboard
- Visualize KPIs financeiros (receitas, despesas, saldo, crescimento)
- Analise gráficos de tendência mensal
- Veja distribuição por categorias
- Acompanhe transações recentes e próximas recorrências

### 2. Transações
- **Criar**: Adicione receitas ou despesas com categoria, valor e descrição
- **Filtrar**: Por tipo, categoria, período ou valor
- **Editar**: Modifique transações existentes
- **Excluir**: Remova transações com confirmação
- **Exportar**: Baixe relatórios em formato específico

### 3. Categorias
- **Personalizar**: Escolha cores e ícones para cada categoria
- **Organizar**: Categorias padrão já incluídas (alimentação, transporte, etc.)
- **Estatísticas**: Veja o total gasto por categoria

### 4. Recorrências
- **Agendar**: Configure transações recorrentes (mensal, semanal, etc.)
- **Executar**: Transações são criadas automaticamente nas datas agendadas
- **Monitorar**: Acompanhe próximas execuções e histórico

## 🎨 Tema e Design

- **Framework UI**: PrimeNG 17
- **Tema**: Arya Blue (tema escuro)
- **Ícones**: PrimeIcons
- **Tipografia**: Inter (Google Fonts)
- **Layout**: Responsivo mobile-first
- **Cores**: Paleta moderna com destaque para primário (#6366f1)

## 🔧 Configuração da API

### Variáveis de Ambiente (.env)
```env
# Banco de dados
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=expense_tracker

# JWT
JWT_SECRET=seu_jwt_secret_super_seguro
JWT_EXPIRATION=24h

# Aplicação
PORT=3000
```

## 🗄️ Banco de Dados

### Entidades Principais:
- **User**: Usuários do sistema
- **Transaction**: Transações financeiras
- **Category**: Categorias das transações
- **RecurringTransaction**: Transações recorrentes

### Relacionamentos:
- User 1:N Transaction
- User 1:N Category
- User 1:N RecurringTransaction
- Category 1:N Transaction
- Category 1:N RecurringTransaction

## 🧪 Testes

```bash
# Backend
cd api
npm run test
npm run test:e2e

# Frontend
cd app
npm run test
npm run lint
```

## 📦 Build para Produção

### Backend
```bash
cd api
npm run build
npm run start:prod
```

### Frontend
```bash
cd app
npm run build
# Arquivos gerados em dist/
```

## 🐳 Docker

### Desenvolvimento com Docker Compose
```bash
# Na raiz do projeto
docker-compose up -d
```

### Produção
```bash
# Build das imagens
docker build -t expense-tracker-api ./api
docker build -t expense-tracker-app ./app

# Executar containers
docker run -d -p 3000:3000 expense-tracker-api
docker run -d -p 4200:4200 expense-tracker-app
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte, abra uma issue no GitHub ou entre em contato através do email.

---

**Desenvolvido com ❤️ usando Angular, NestJS e PrimeNG**