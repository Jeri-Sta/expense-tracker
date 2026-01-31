# Expense Tracker - Agent Development Guide

This document provides coding agents with essential information about build commands, code style, and development patterns for the Expense Tracker application.

## Project Structure

- **api/** - Backend NestJS API (Node.js, TypeScript, PostgreSQL)
- **web-app/** - Frontend Angular application (Angular 17, PrimeNG)
- **scripts/** - Build and deployment scripts
- **database-setup/** - Database initialization files

---

## Build, Lint, and Test Commands

### Backend (api/)

```bash
# Development
cd api
npm install              # Install dependencies
npm run start:dev        # Start with hot-reload
npm run start:debug      # Start with debugger

# Building
npm run build            # Build production bundle

# Testing
npm test                 # Run all tests
npm test -- transactions.service.spec.ts  # Run single test file
npm run test:watch       # Run tests in watch mode
npm run test:cov         # Run with coverage report
npm run test:e2e         # Run end-to-end tests

# Code Quality
npm run lint             # Run ESLint with auto-fix
npm run format           # Format with Prettier

# Database
npm run migration:generate  # Generate migration
npm run migration:run       # Run migrations
npm run migration:revert    # Revert last migration
```

### Frontend (web-app/)

```bash
# Development
cd web-app
npm install              # Install dependencies
npm start                # Start dev server (port 4200)
npm run start:prod       # Start with production config

# Building
npm run build            # Build development
npm run build:prod       # Build for production

# Testing
npm test                 # Run Karma tests
npm run test:coverage    # Run with coverage

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format with Prettier
```

---

## Code Style Guidelines

### 1. TypeScript Configuration

**Backend (NestJS):**
- Target: ES2021
- Module: CommonJS
- Decorators enabled
- Path aliases: `@/*`, `@config/*`, `@common/*`, `@entities/*`, `@modules/*`
- Strict mode: Partial (nullChecks: false, noImplicitAny: false)

**Frontend (Angular):**
- Target: ES2022
- Module: ES2022
- Strict mode: Full (all strict options enabled)
- Path aliases: `@core/*`, `@shared/*`, `@features/*`, `@layout/*`, `@env/*`

### 2. Import Organization

**Backend Pattern:**
```typescript
// 1. NestJS core decorators
import { Injectable, NotFoundException } from '@nestjs/common';
// 2. External packages (TypeORM, etc.)
import { Repository } from 'typeorm';
// 3. Internal - Entities
import { Transaction } from './entities/transaction.entity';
// 4. Internal - DTOs
import { CreateTransactionDto } from './dto/create-transaction.dto';
// 5. Internal - Common utilities
import { parseLocalDate } from '@common/utils/date.utils';
```

**Frontend Pattern:**
```typescript
// 1. Angular core
import { Component, OnInit, inject } from '@angular/core';
// 2. Angular forms/router/etc.
import { FormBuilder, Validators } from '@angular/forms';
// 3. Third-party libraries (PrimeNG, etc.)
import { MessageService } from 'primeng/api';
// 4. Services with types
import { TransactionService, Transaction } from '@core/services/transaction.service';
// 5. Shared utilities
import { normalizeIcon } from '@shared/utils/icon.utils';
```

### 3. Formatting (Prettier)

```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "tabWidth": 2,
  "semi": true,
  "printWidth": 100,
  "endOfLine": "auto"
}
```

### 4. Naming Conventions

- **Files:** kebab-case with suffix (e.g., `transaction.service.ts`, `create-transaction.dto.ts`)
- **Classes/Interfaces:** PascalCase (e.g., `TransactionService`, `CreateTransactionDto`)
- **Variables/Methods:** camelCase (e.g., `getTransactions`, `userId`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `AUTH_TOKEN_KEY`)
- **Observables:** Suffix with `$` (e.g., `authState$`)
- **Component Selectors:** kebab-case with `app-` prefix (e.g., `app-transactions`)

### 5. Backend Patterns (NestJS)

**Service Structure:**
```typescript
@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
  ) {}

  // Public CRUD methods first
  async create(dto: CreateTransactionDto): Promise<Transaction> { }
  async findAll(): Promise<Transaction[]> { }
  
  // Public business logic methods
  async getMonthlyStats(): Promise<Stats> { }
  
  // Private helper methods last
  private async findOneWithRelations(id: string): Promise<Transaction> { }
}
```

**Error Handling:**
```typescript
// Use NestJS exceptions
if (!transaction) {
  throw new NotFoundException('Transaction not found');
}
if (transaction.userId !== userId) {
  throw new ForbiddenException('Access denied');
}
```

**Entity Structure:**
```typescript
@Entity('transactions')
export class Transaction extends BaseEntity {
  // 1. Simple columns
  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;
  
  // 2. Enum columns
  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;
  
  // 3. Relationships last
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
  
  @Column()
  userId: string;
}
```

**DTO Validation:**
```typescript
export class CreateTransactionDto {
  @ApiProperty({ description: 'Amount', example: 150.5 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @IsNotEmpty()
  amount: number;
}
```

### 6. Frontend Patterns (Angular)

**Component Structure:**
```typescript
@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss'],
})
export class TransactionsComponent implements OnInit {
  // 1. Data properties
  transactions: Transaction[] = [];
  
  // 2. State flags
  loading = false;
  
  // 3. Forms
  transactionForm!: FormGroup;
  
  // 4. Injected services (use inject() function)
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(TransactionService);
  
  ngOnInit(): void {
    this.initializeForms();
    this.loadData();
  }
}
```

**Service Structure:**
```typescript
@Injectable({ providedIn: 'root' })
export class TransactionService {
  private readonly apiUrl = `${environment.apiUrl}/transactions`;
  private readonly http = inject(HttpClient);
  
  getTransactions(filters?: Filters): Observable<PaginatedResponse<Transaction>> {
    let params = new HttpParams();
    // Build params...
    return this.http.get<PaginatedResponse<Transaction>>(this.apiUrl, { params });
  }
}
```

**Error Handling:**
```typescript
this.service.getTransactions().subscribe({
  next: (response) => {
    this.transactions = response.data || [];
    this.loading = false;
  },
  error: (error) => {
    this.loading = false;
    if (error.status === 401) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro de Autenticação',
        detail: 'Sessão expirada',
      });
    } else {
      console.error('Error:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Operação falhou',
      });
    }
  },
});
```

### 7. Type Safety

- Always specify return types for functions
- Use strict typing (avoid `any` except for `Record<string, any>`)
- Use enums for constrained values
- Use optional chaining: `response?.data`
- Use nullish coalescing: `response.total ?? 0`

### 8. Language Conventions

- **Backend:** Error messages in English
- **Frontend:** UI text and error messages in Portuguese (pt-BR)

---

## Testing Guidelines

**Test File Naming:**
- Unit tests: `*.spec.ts` (same directory as source)
- E2E tests: `test/**/*.spec.ts` (backend) or `e2e/**/*.spec.ts` (frontend)

**Backend Test Pattern:**
```typescript
describe('TransactionsService', () => {
  let service: TransactionsService;
  let repository: Repository<Transaction>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        { provide: getRepositoryToken(Transaction), useClass: Repository },
      ],
    }).compile();
    
    service = module.get<TransactionsService>(TransactionsService);
  });

  it('should create transaction', async () => {
    // Arrange, Act, Assert
  });
});
```

---

## Git Commit Guidelines

Follow the pattern found in CHANGELOG.md:
- Use semantic versioning (major.minor.patch)
- Prefix commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`
- Keep commits focused and atomic
- Reference issue numbers when applicable

---

## Common Pitfalls to Avoid

1. Don't use `any` type without justification
2. Don't skip error handling in observables/promises
3. Don't mutate HttpParams (use immutable pattern)
4. Don't use constructor injection in Angular - use `inject()` function
5. Don't skip validation decorators on DTOs
6. Always use `private readonly` for injected dependencies
7. Always implement lifecycle interfaces (OnInit, OnDestroy, etc.)
8. Don't hardcode URLs - use environment variables
