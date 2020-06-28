//TODO: Move to shared???
export function formatCentsAsUSD(centsUsd: number): string {
    let dollars = Math.floor(centsUsd / 100);
    let remainingCents = centsUsd % 100;
    return `$${dollars}.${remainingCents.toString().padStart(2, '0')}`;
}