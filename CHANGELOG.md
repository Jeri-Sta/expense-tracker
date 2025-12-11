## [Em Desenvolvimento]

### ✨ Novas Funcionalidades
- Adicione novas funcionalidades aqui

### 🔧 Melhorias
- Melhorado filtros na tela de transações

### 🐛 Correções
- Adicione correções de bugs aqui

### 📦 Atualizações de Dependências
- Bump @angular-devkit/build-angular from 17.3.17 to 21.0.3 in /web-app

---

## [1.1.1] - 2025-12-10

### 🐛 Correções
- Corrigido script de geração de versão

---

## [1.1.0] - 2025-12-10

### ✨ Novas Funcionalidades
- Adicionada funcionalidade de reverter o pagamento de uma transação marcada como paga

### 🔧 Melhorias
- Adicione melhorias e otimizações aqui

### 🐛 Correções
- Adicione correções de bugs aqui

### 📦 Atualizações de Dependências
- Bump eslint-plugin-prettier from 5.0.0 to 5.5.4 in /api
- Bump eslint-config-prettier from 9.0.0 to 10.1.8 in /api
- Bump @typescript-eslint/parser from 6.0.0 to 8.49.0 in /api
- Bump @typescript-eslint/eslint-plugin from 6.0.0 to 8.49.0 in /api
- Bump @nestjs/testing from 10.0.0 to 11.1.9 in /api
- Bump @nestjs/schematics from 10.0.0 to 11.0.9 in /api
- Bump @nestjs/cli from 10.0.0 to 11.0.14 in /api
- Bump @nestjs/schedule from 4.0.0 to 6.1.0 in /api
- Bump @nestjs/typeorm from 10.0.1 to 11.0.0 in /api
- Bump @nestjs/swagger from 7.1.17 to 11.2.3 in /api
- Bump @nestjs/platform-express from 10.0.0 to 11.1.9 in /api
- Bump @nestjs/jwt from 10.2.0 to 11.0.2 in /api
- Bump @nestjs/config from 3.1.1 to 4.0.2 in /api
- Bump @nestjs/common from 10.0.0 to 11.1.9 in /api
- Bump @types/bcryptjs from 2.4.6 to 3.0.0 in /api
- Bump @nestjs/core from 10.4.20 to 11.1.9 in /api
- Bump eslint from 8.57.1 to 9.39.1 in /api
- Bump @nestjs/passport from 10.0.3 to 11.0.5 in /api
- Bump @angular-eslint/eslint-plugin from 17.5.3 to 21.1.0 in /web-app

---

# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado no [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [1.0.1] - 2025-12-08

### ✨ Novas Funcionalidades
- Estrutura e instrução oficial para testes automatizados no backend (Jest)
- Adição de exemplo de teste unitário para UsersService
- Criação do guia de padrões de projeto para o frontend Angular, documentado em `.github/instructions/frontend-patterns.instructions.md` para uso em futuras implementações

### 🔧 Melhorias
- Refatoração completa do backend seguindo padrões DDD (Domain-Driven Design)
- Padronização de nomenclatura, organização de pastas e separação de responsabilidades
- Remoção de duplicidades e códigos obsoletos
- Tipagem mais forte em services (remoção de any)
- Atualização e detalhamento das instruções de backend para futuras implementações

### 🐛 Correções
- Ajuste na configuração do Jest para reconhecer testes em src e test

---

## [1.0.0] - 2025-12-06

### ✨ Novas Funcionalidades
- Sistema completo de gestão de despesas pessoais
- Módulo de autenticação com JWT
- Dashboard com gráficos e estatísticas
- Gestão de transações com categorias
- Sistema de cartões de crédito
- Gestão de parcelas e pagamentos
- Transações recorrentes
- Interface responsiva com PrimeNG
- API RESTful com NestJS
- Banco de dados PostgreSQL com TypeORM
- Cache com Redis
- Documentação Swagger
- Containerização com Docker
- CI/CD com GitHub Actions

### 🔧 Melhorias
- Interface intuitiva e moderna
- Validações robustas no frontend e backend
- Arquitetura escalável e modular
- Testes automatizados
- Linting e formatação de código

### 🐛 Correções
- Versão inicial estável

---

## Tipos de Mudanças

- **✨ Novas Funcionalidades** - para novas funcionalidades
- **🔧 Melhorias** - para mudanças em funcionalidades existentes
- **🐛 Correções** - para correções de bugs
- **🔒 Segurança** - para correções de vulnerabilidades
- **📦 Dependências** - para atualizações de dependências
- **🗑️ Removido** - para funcionalidades removidas
- **⚠️ Descontinuado** - para funcionalidades que serão removidas

## Versionamento Semântico

- **MAJOR** (X.0.0): Mudanças incompatíveis na API
- **MINOR** (0.X.0): Funcionalidades adicionadas de forma compatível
- **PATCH** (0.0.X): Correções de bugs compatíveis
