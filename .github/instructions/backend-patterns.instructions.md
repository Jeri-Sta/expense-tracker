# Backend Patterns and DDD Guidelines

## 1. Estrutura de Pastas

- Cada domínio deve ser um módulo em `api/src/modules/<domínio>`.
- Dentro de cada módulo:
  - `entities/`: entidades do domínio (herdam de `BaseEntity`)
  - `dto/`: objetos de transferência de dados
  - `controllers/`: controladores de entrada (REST, GraphQL, etc.)
  - `services/`: serviços de aplicação e domínio
  - `repositories/`: (opcional) abstrações de persistência
  - `value-objects/`: (opcional) value objects do domínio

## 2. Entidades
- Sempre herdar de `BaseEntity`.
- Relacionamentos explícitos via TypeORM.
- Não misturar lógica de negócio complexa nas entidades.

## 3. Services
- `services/` contém lógica de aplicação e domínio.
- Serviços de domínio não devem acessar diretamente frameworks externos (ex: HTTP, DB), use repositórios/abstrações.
- Serviços de aplicação podem orquestrar múltiplos domínios.

## 4. DTOs
- Usar DTOs para entrada e saída de dados em controllers.
- Validar DTOs com decorators do `class-validator`.

## 5. Controllers
- Responsáveis apenas por receber requisições, validar e delegar para services.
- Não conter lógica de negócio.

## 6. Utilitários e Enums

## 7. Padrões Gerais
 Testes automatizados para cada domínio e serviço.

## 8. Integrações Externas

## 8. Testes Automatizados
- Utilize Jest para testes unitários e de integração.
- Os arquivos de teste devem ser criados em `api/test/<domínio>/<arquivo>.spec.ts`.
- Exemplo: `api/test/modules/users/users.service.spec.ts` para testar `UsersService`.
- Importe os serviços a partir de `src` usando caminhos relativos.
- Estruture os testes com `describe`, `it` e utilize mocks para dependências externas (repositórios, serviços, etc).
- Garanta cobertura mínima para cada service e controller principal.
## 9. Exemplo de Estrutura
### Exemplo de teste unitário para service:
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../../src/modules/users/users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../../src/modules/users/entities/user.entity';
import { Repository } from 'typeorm';

describe('UsersService', () => {
  let service: UsersService;
  let repo: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call repository find', async () => {
    const findSpy = jest.spyOn(repo, 'find').mockResolvedValue([]);
    await service.findAll();
    expect(findSpy).toHaveBeenCalled();
  });
});
```
```
modules/
  transactions/
    entities/
      transaction.entity.ts
    dto/
      create-transaction.dto.ts
    transactions.controller.ts
    transactions.service.ts
```

test/
  modules/
    users/
      users.service.spec.ts
## 10. Evolução
- Sempre documentar novos padrões neste arquivo.
- Revisar periodicamente para manter a qualidade e consistência.
## 11. Evolução
- Sempre documentar novos padrões neste arquivo.
- Revisar periodicamente para manter a qualidade e consistência.
