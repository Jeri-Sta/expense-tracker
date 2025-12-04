export function normalizeIcon(icon: string): string {
  if (!icon) return 'pi pi-tag';

  // Se já está no formato correto, retorna como está
  if (icon.startsWith('pi pi-')) {
    return icon;
  }

  // Se está no formato antigo (pi-nome), converte para o novo formato
  if (icon.startsWith('pi-')) {
    return `pi ${icon}`;
  }

  // Se não tem prefixo, adiciona
  if (!icon.startsWith('pi')) {
    return `pi pi-${icon}`;
  }

  return icon;
}
