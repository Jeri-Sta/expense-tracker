export interface InstallmentInfo {
  baseTitle: string;
  installmentNumber: number;
  totalInstallments: number;
}

/**
 * Matches Nubank installment suffixes such as:
 *  - "Mercadolivre*Infinity - Parcela 2/4"
 *  - "Service Garagem - Parcela 2/4"
 *  - "Compra qualquer Parcela 3 de 6"
 */
const MAX_TITLE_LENGTH = 255;

/**
 * Linear-time matcher for the installment suffix. Avoids nested quantifiers so
 * a hostile (very repetitive) title cannot cause catastrophic backtracking.
 */
const INSTALLMENT_SUFFIX = /\bparcela\s*(\d+)\s*(?:\/|de)\s*(\d+)\s*$/i;

/**
 * Extracts the installment metadata from a Nubank title. Returns null when the
 * title does not describe an installment purchase.
 */
export function extractInstallment(title: string): InstallmentInfo | null {
  if (title.length > MAX_TITLE_LENGTH) return null;

  const match = title.match(INSTALLMENT_SUFFIX);
  if (!match || match.index === undefined) return null;

  const installmentNumber = Number.parseInt(match[1], 10);
  const totalInstallments = Number.parseInt(match[2], 10);

  if (
    !Number.isInteger(installmentNumber) ||
    !Number.isInteger(totalInstallments) ||
    totalInstallments < 2 ||
    installmentNumber < 1 ||
    installmentNumber > totalInstallments
  ) {
    return null;
  }

  const baseTitle = title
    .slice(0, match.index)
    .replace(/[\s–—-]+$/, '')
    .trim();
  if (!baseTitle) return null;

  return { baseTitle, installmentNumber, totalInstallments };
}

/**
 * Tokens that Nubank appends to the merchant name but that change between
 * imports: hex ids, "Inv <code>", order numbers like "P4931".
 */
const VOLATILE_TOKEN_PATTERNS: RegExp[] = [
  /\b[a-f0-9]{6,}\b/g,
  /\b[a-z]+[0-9]{3,}\b/g,
  /\b[0-9]+[a-z]{3,}\b/g,
];

/**
 * Builds the stable key used to link a merchant to a category.
 *
 * Examples:
 *  - "Sqcloud* Inv 1d5fe0a40"      -> "sqcloud"
 *  - "Sqcloud* Inv 1bbb3ccf6"      -> "sqcloud"
 *  - "Dl*Spotify P4931"            -> "dl spotify"
 *  - "Mercadolivre*Infinity - Parcela 2/4" -> "mercadolivre infinity"
 */
export function normalizeMerchantTitle(title: string): string {
  const baseTitle = extractInstallment(title)?.baseTitle ?? title;

  let value = baseTitle
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  value = value.replace(/[*|]/g, ' ');
  value = value.replace(/\binv\b/g, ' ');

  for (const pattern of VOLATILE_TOKEN_PATTERNS) {
    value = value.replace(pattern, ' ');
  }

  value = value.replace(/[^a-z0-9]+/g, ' ');
  return value.trim().replace(/\s+/g, ' ');
}
