# Padrões de Projeto para Frontend Angular

Este guia documenta as boas práticas e padrões adotados no frontend do Expense Tracker, para garantir código limpo, escalável e fácil de manter.

## Estrutura de Pastas
- Organize o código em módulos: `core`, `shared`, `features`, `layout`.
- Cada feature deve ter seu próprio módulo, componente principal, serviços e rotas.
- Utilize a pasta `shared` para componentes, diretivas, pipes e utilitários reutilizáveis.

## Nomenclatura
- Use nomes descritivos e em inglês para arquivos, classes, métodos e variáveis.
- Componentes: `nome-feature.component.ts`, Serviços: `nome-feature.service.ts`, Módulos: `nome-feature.module.ts`.

## Componentes
- Componentes devem ser pequenos e focados em uma responsabilidade.
- Utilize `@Input` e `@Output` para comunicação entre componentes.
- Exemplo:

```typescript
@Component({
  selector: 'app-exemplo',
  templateUrl: './exemplo.component.html',
})
export class ExemploComponent {
  @Input() valor: string = '';
  @Output() mudou = new EventEmitter<string>();

  onChange(novoValor: string) {
    this.mudou.emit(novoValor);
  }
}
```

## Serviços
- Serviços devem ser injetáveis (`@Injectable({ providedIn: 'root' })`).
- Centralize lógica de negócio e chamadas HTTP nos serviços.
- Utilize RxJS para manipulação de dados assíncronos.

## Módulos
- Importe apenas o necessário em cada módulo.
- Utilize `SharedModule` para importar componentes e diretivas compartilhadas.
- Use lazy loading para módulos de features.

## Rotas
- Defina rotas em arquivos separados (`nome-feature-routing.module.ts`).
- Proteja rotas sensíveis com guards (`AuthGuard`, `GuestGuard`).

## Tipagem
- Sempre utilize tipagem forte (`interface`, `type`).
- Evite o uso de `any`.

## Estilos
- Use SCSS e variáveis para padronizar cores e espaçamentos.
- Componentes devem ter seus próprios arquivos de estilo.

## Internacionalização
- Configure traduções no `app.component.ts` e utilize textos em português para o usuário.

## Testes
- Crie arquivos `.spec.ts` para componentes, serviços e pipes.
- Utilize Jasmine/Karma para testes unitários.

## Boas Práticas Gerais
- Remova código morto, duplicado e imports não utilizados.
- Prefira métodos privados para lógica interna do componente/serviço.
- Documente funções e classes com comentários claros.
- Utilize Observables para manipulação de dados assíncronos.
- Evite lógica complexa em templates, prefira métodos no componente.

---

Este guia deve ser seguido em todas as novas implementações e revisões do frontend Angular do projeto Expense Tracker.