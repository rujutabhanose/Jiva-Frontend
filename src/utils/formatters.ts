// mobile/src/utils/formatters.ts

/**
 * Convert model plant name → plants.js lookup key
 * Example:
 * "Quercus rotundifolia" → "quercus_rotundifolia"
 */
export function normalizePlantKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}