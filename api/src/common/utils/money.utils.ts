export function splitAmount(amount: number, parts: number): number[] {
  const totalCents = Math.round(amount * 100);
  const baseCents = Math.floor(totalCents / parts);
  const amounts = Array(parts).fill(baseCents);
  amounts[parts - 1] += totalCents - baseCents * parts;
  return amounts.map((value) => value / 100);
}
