/**
 * Convert a hex color to rgba with the given alpha.
 * Supports 3- and 6-digit hex strings (with or without #).
 */
export const withAlpha = (hex: string, alpha: number): string => {
  if (!hex.startsWith('#')) return hex;
  const v = hex.slice(1);
  const isShort = v.length === 3;
  const r = parseInt(isShort ? v[0] + v[0] : v.slice(0, 2), 16);
  const g = parseInt(isShort ? v[1] + v[1] : v.slice(2, 4), 16);
  const b = parseInt(isShort ? v[2] + v[2] : v.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
