export function isSyncSource(header?: string): boolean {
  return (header || '').toLowerCase() === 'laravel';
}
