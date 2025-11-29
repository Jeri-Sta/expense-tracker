# Expense Tracker - Guia Global de Estilo

Este documento descreve os padrões globais de estilo e arquitetura para a aplicação web Expense Tracker. Ao gerar código ou refatorar componentes, por favor, siga estas diretrizes.

## 1. Arquitetura SCSS

O projeto utiliza uma estrutura SCSS modular localizada em `src/styles/`. Todos os estilos globais devem ser definidos aqui.

*   **`_variables.scss`**: A fonte da verdade para todos os tokens de design. Contém breakpoints, espaçamento, sombras, border-radius e cores semânticas.
*   **`_mixins.scss`**: Mixins reutilizáveis para media queries, layouts flexbox e padrões comuns de componentes (cards, inputs).
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