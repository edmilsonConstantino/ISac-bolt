// src/components/shared/registration-student-modal/utils/formatCurrency.ts

export function formatCurrency(value: number): string {
  const safeValue = Number.isFinite(value) ? value : 0;

  return 'MT ' + new Intl.NumberFormat("pt-MZ", {
    minimumFractionDigits: 0,
  }).format(safeValue);
}
