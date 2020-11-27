//TODO: Move to shared???
export function formatCentsAsUSD(centsUsd: number): string {
    const dollars = Math.floor(centsUsd / 100);
    const remainingCents = centsUsd % 100;
    return `$${dollars}.${remainingCents.toString().padStart(2, '0')}`;
}
