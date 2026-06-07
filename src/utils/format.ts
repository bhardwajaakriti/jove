export function formatNumber(value: number, maximumFractionDigits = 0): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits }).format(value);
}

export function formatPercent(value: number, maximumFractionDigits = 1): string {
  return `${formatNumber(value, maximumFractionDigits)}%`;
}

export function formatSignedPercent(value: number, maximumFractionDigits = 1): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${formatNumber(value, maximumFractionDigits)}%`;
}

export function formatMetric(
  value: number,
  unit: 'number' | 'percent' | 'hours' | 'score' | 'assets' | 'submissions',
): string {
  if (unit === 'percent') return formatPercent(value);
  if (unit === 'hours') return `${formatNumber(value)}h`;
  if (unit === 'score') return `${formatNumber(value, 1)}/100`;
  return formatNumber(value);
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`));
}

export function sentenceCase(value: string): string {
  return value
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
