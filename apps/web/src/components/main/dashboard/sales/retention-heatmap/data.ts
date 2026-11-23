export const COLS = 12;
export const ROWS = 12;

export const BASE = [84, 61, 52, 45, 40, 37, 34, 31, 29, 27, 25, 23];
export const OFFSETS = [0, 4, -3, 6, -2, 3, -5, 7, -1, 5, -3, 2];

export const columnLabels = Array.from({ length: COLS }, (_, i) => i + 1);

export function buildMatrix(): number[][] {
  const matrix: number[][] = [];
  for (let s = 0; s < ROWS; s++) {
    const numPeriods = s + 1;
    const row: number[] = [];
    for (let col = 0; col < COLS; col++) {
      row.push(
        col < numPeriods
          ? Math.min(100, Math.max(1, BASE[col] + OFFSETS[s]))
          : 0,
      );
    }
    matrix.push(row);
  }
  // Reverse so the fullest row (12 active cells) is at the top
  return matrix.slice().reverse();
}

export function getCellColorClass(value: number): string {
  if (value === 0) return "bg-transparent";
  if (value <= 25) return "bg-brand-100 dark:bg-brand-500/20";
  if (value <= 50) return "bg-brand-300 dark:bg-brand-500/40";
  if (value <= 75) return "bg-brand-400 dark:bg-brand-500/70";
  return "bg-brand-500";
}
