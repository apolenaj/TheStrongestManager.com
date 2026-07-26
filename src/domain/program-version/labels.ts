/**
 * Version labels: v1, v2, v3, …
 */

export function formatProgramVersionLabel(versionNumber: number): string {
  if (!Number.isInteger(versionNumber) || versionNumber < 1) {
    return `v${Math.max(1, Math.floor(versionNumber) || 1)}`;
  }
  return `v${versionNumber}`;
}

export function parseProgramVersionLabel(
  label: string,
): number | null {
  const match = /^v(\d+)$/i.exec(label.trim());
  if (!match) return null;
  const n = Number(match[1]);
  return Number.isInteger(n) && n >= 1 ? n : null;
}
