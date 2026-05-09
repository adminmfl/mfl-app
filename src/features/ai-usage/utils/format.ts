export function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function formatCost(n: number): string {
  return `$${n.toFixed(4)}`;
}

export const KEY_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  platform: { bg: '#f1f5f9', text: '#475569' },
  league: { bg: '#eef2ff', text: '#4f46e5' },
  byok: { bg: '#ecfdf5', text: '#059669' },
};
