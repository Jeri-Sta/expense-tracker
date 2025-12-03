# Expense Tracker - Guia Global de Estilo

Este documento descreve os padrões globais de estilo e arquitetura para a aplicação web Expense Tracker. Ao gerar código ou refatorar componentes, por favor, siga estas diretrizes.

## 1. Arquitetura SCSS

O projeto utiliza uma estrutura SCSS modular localizada em `src/styles/`. Todos os estilos globais devem ser definidos aqui.

*   **`_variables.scss`**: A fonte da verdade para todos os tokens de design. Contém breakpoints, espaçamento, sombras, border-radius e cores semânticas.
*   **`_mixins.scss`**: Mixins reutilizáveis para media queries, layouts flexbox e padrões comuns de componentes (cards, inputs).
*   **`_tables.scss`**: Estilos padronizados para tabelas p-table (PrimeNG). Contém classes `.table-actions` e `.table-empty-state`.
*   **`_auth.scss`**: Estilos compartilhados especificamente para páginas de Autenticação (Login, Registro) para garantir consistência.
*   **`sidebar.scss`**: Estilos dedicados para a navegação lateral da aplicação.
*   **`required-fields.scss`**: Utilitário para marcar campos de formulário obrigatórios.
*   **`_theme.scss`**: Variáveis CSS (`:root`) para a paleta de cores, suportando Modo Escuro.
*   **`_typography.scss`**: Configurações globais de fonte e estilos de cabeçalho.
*   **`_reset.scss`**: Reset CSS e estilos base.
*   **`_utils.scss`**: Classes utilitárias (alinhamento de texto, cores, espaçamento).
*   **`_components.scss`**: Estilos globais de componentes (ex: barras de rolagem, cards genéricos).

## 2. Tokens de Design (Variáveis)

### Cores (Variáveis CSS)
Use estas para temas e elementos gerais da UI. Elas se adaptam ao tema ativo (Claro/Escuro).
*   `--primary-color`: Cor principal da marca (Azul)
*   `--surface-0` a `--surface-900`: Cores de superfície em escala de cinza.
*   `--text-color`: Cor primária do texto.
*   `--text-color-secondary`: Cor secundária do texto.
*   `--surface-card`: Cor de fundo para cards.
*   `--surface-border`: Cor da borda para divisores e inputs.
*   `--surface-hover`: Cor de fundo para estados de hover.

### Cores Semânticas (Variáveis SCSS)
Use estas para indicadores de status, alertas e feedback.
*   `$color-success`: Verde (#10B981) - *Ativo, Concluído, Sucesso*
*   `$color-danger`: Vermelho (#EF4444) - *Atrasado, Erro, Excluir*
*   `$color-warning`: Âmbar (#F59E0B) - *Pendente, Aviso*
*   `$color-info`: Azul (#3B82F6) - *Info, Processando*

### Espaçamento
**SEMPRE** use estas variáveis em vez de pixels hardcoded para `margin`, `padding` e `gap`.
*   `$spacing-xs`: 0.25rem (4px)
*   `$spacing-sm`: 0.5rem (8px)
*   `$spacing-md`: 1rem (16px)
*   `$spacing-lg`: 1.5rem (24px)
*   `$spacing-xl`: 2rem (32px)
*   `$spacing-2xl`: 3rem (48px)

### Breakpoints
Use estes com o mixin `respond-to`.
*   `$breakpoint-sm`: 576px (Mobile)
*   `$breakpoint-md`: 768px (Tablet)
*   `$breakpoint-lg`: 992px (Desktop)
*   `$breakpoint-xl`: 1200px (Desktop Grande)

### Sombras & Bordas
*   `$shadow-sm`, `$shadow-md`, `$shadow-lg`
*   `$border-radius-sm` (4px), `$border-radius-md` (8px), `$border-radius-lg` (12px)

## 3. Mixins & Uso

### Design Responsivo
Use o mixin `respond-to` para todas as media queries.
```scss
@import 'src/styles/mixins';

.my-component {
  padding: $spacing-xl;

  @include respond-to($breakpoint-md) {
    padding: $spacing-md;
    flex-direction: column;
  }
}
```

### Auxiliares de Layout
*   `@include flex-center`: `display: flex; align-items: center; justify-content: center;`
*   `@include flex-between`: `display: flex; align-items: center; justify-content: space-between;`
*   `@include flex-column`: `display: flex; flex-direction: column;`

### Padrões de Componentes
*   **Cards**: `@include card-base`
    *   Aplica fundo padrão, borda, raio, preenchimento e elevação no hover.
*   **Inputs**: `@include input-base`
    *   Padroniza altura do input, preenchimento, borda e estados de foco.

## 4. Diretrizes Específicas por Módulo

### Autenticação (Login/Registro)
*   **Não** escreva estilos personalizados para containers ou cards de autenticação.
*   **Importe** `src/styles/_auth.scss` no seu componente.
*   Use as classes: `.auth-container`, `.auth-card`, `.auth-header`, `.form-field`.

### Sidebar
*   Estilos da sidebar estão centralizados em `src/styles/sidebar.scss`.
*   Use `.sidebar-navigation`, `.sidebar-header`, `.sidebar-nav`, `.nav-link`.

## 5. Checklist de Refatoração

Ao trabalhar em um componente, garanta:
1.  [ ] **Sem Cores Hardcoded**: Substitua códigos hex por `$color-*` ou `var(--*)`.
2.  [ ] **Sem Espaçamento Hardcoded**: Substitua margens/paddings em `px` por `$spacing-*`.
3.  [ ] **Breakpoints Padrão**: Substitua `@media (max-width: 768px)` por `@include respond-to($breakpoint-md)`.
4.  [ ] **Cards Padrão**: Use `@include card-base` para qualquer container de conteúdo.
5.  [ ] **Imports Limpos**: Importe variáveis e mixins no topo:
    ```scss
    @import 'src/styles/variables';
    @import 'src/styles/mixins';
    ```

## 6. Classes Utilitárias

Prefira usar estas classes utilitárias no HTML em vez de escrever novo CSS para ajustes simples.
*   **Texto:** `.text-center`, `.text-left`, `.text-right`
*   **Cores:** `.text-success`, `.text-danger`, `.text-warning`, `.text-muted`
*   **Layout:** `.w-full`, `.h-full`, `.m-0`, `.p-0`
*   **Espaçamento:** `.mt-1` a `.mt-4`, `.mb-1` a `.mb-4`
*   **Interação:** `.cursor-pointer`

## 7. Tabelas (p-table)

O projeto utiliza o componente `p-table` do PrimeNG para tabelas CRUD. Todos os estilos estão centralizados em `src/styles/_tables.scss`.

### Template HTML Padrão
```html
<p-table
  [value]="items"
  [lazy]="true"
  [paginator]="true"
  [rows]="10"
  [rowsPerPageOptions]="[10, 25, 50]"
  [totalRecords]="totalRecords"
  [sortField]="sortField"
  [sortOrder]="sortOrder"
  (onLazyLoad)="onLazyLoad($event)"
  responsiveLayout="scroll"
  styleClass="p-datatable-striped"
>
  <ng-template pTemplate="header">
    <tr>
      <th pSortableColumn="date">Data <p-sortIcon field="date"></p-sortIcon></th>
      <th pSortableColumn="description">Descrição <p-sortIcon field="description"></p-sortIcon></th>
      <th pSortableColumn="amount">Valor <p-sortIcon field="amount"></p-sortIcon></th>
      <th>Status</th>
      <th class="table-actions">Ações</th>
    </tr>
  </ng-template>
  
  <ng-template pTemplate="body" let-item>
    <tr>
      <td>{{ item.date | date:'dd/MM/yyyy' }}</td>
      <td>{{ item.description }}</td>
      <td>{{ item.amount | currency:'BRL' }}</td>
      <td><p-tag [value]="item.status"></p-tag></td>
      <td class="table-actions">
        <p-button icon="pi pi-pencil" [text]="true" size="small"></p-button>
        <p-button icon="pi pi-trash" [text]="true" size="small" severity="danger"></p-button>
      </td>
    </tr>
  </ng-template>
  
  <ng-template pTemplate="emptymessage">
    <tr>
      <td colspan="5" class="table-empty-state">
        <i class="pi pi-inbox"></i>
        <p>Nenhum registro encontrado</p>
      </td>
    </tr>
  </ng-template>
</p-table>
```

### Propriedades Obrigatórias
| Propriedade | Valor | Descrição |
|-------------|-------|-----------|
| `[lazy]` | `true` | Habilita carregamento lazy (server-side) |
| `[paginator]` | `true` | Habilita paginação |
| `[rows]` | `10` | Número de linhas por página |
| `[rowsPerPageOptions]` | `[10, 25, 50]` | Opções de linhas por página |
| `[totalRecords]` | `totalRecords` | Total de registros (do backend) |
| `[sortField]` | `'date'` | Campo de ordenação padrão |
| `[sortOrder]` | `-1` | Ordem padrão (-1 = DESC, 1 = ASC) |
| `responsiveLayout` | `"scroll"` | Layout responsivo (NÃO usar `[responsive]`) |
| `styleClass` | `"p-datatable-striped"` | Estilo zebrado |

### Colunas Ordenáveis
Use `pSortableColumn` e `p-sortIcon` **apenas** nas colunas principais:
*   **Data** (transactionDate, dueDate, etc.)
*   **Descrição** (description)
*   **Valor** (amount, originalAmount, etc.)
*   **Número/Parcela** (installmentNumber)

**NÃO** adicione ordenação em:
*   Colunas de Ações
*   Colunas de Status (geralmente poucos valores distintos)
*   Colunas de Categoria (melhor usar filtro)

### Classes Padronizadas
*   **`.table-actions`**: Aplicar no `<th>` e `<td>` da coluna de ações
    *   Centraliza botões, define largura mínima, remove ordenação
*   **`.table-empty-state`**: Aplicar no `<td colspan>` do template `emptymessage`
    *   Centraliza conteúdo com ícone e mensagem estilizados

### Componente TypeScript
```typescript
// Propriedades necessárias
totalRecords: number = 0;
first: number = 0;
rows: number = 10;
sortField: string = 'date';
sortOrder: number = -1;

// Método para lazy loading
onLazyLoad(event: TableLazyLoadEvent): void {
  const page = (event.first ?? 0) / (event.rows ?? 10) + 1;
  const limit = event.rows ?? 10;
  const sortField = event.sortField as string ?? this.sortField;
  const sortOrder = event.sortOrder ?? this.sortOrder;

  this.loadData(page, limit, sortField, sortOrder);
}
```

### Checklist de Tabelas
1.  [ ] **Usar `responsiveLayout="scroll"`**: Substituir `[responsive]="true"` (deprecated)
2.  [ ] **Lazy Loading**: Implementar `[lazy]="true"` e `(onLazyLoad)`
3.  [ ] **Ordenação nas principais**: Apenas Data, Descrição, Valor com `pSortableColumn`
4.  [ ] **Ordenação padrão**: `[sortField]="'date'"` e `[sortOrder]="-1"` (mais recentes primeiro)
5.  [ ] **Classe .table-actions**: No header e body da coluna de ações
6.  [ ] **Empty State**: Template `emptymessage` com classe `.table-empty-state`
7.  [ ] **rowsPerPageOptions**: Sempre `[10, 25, 50]`