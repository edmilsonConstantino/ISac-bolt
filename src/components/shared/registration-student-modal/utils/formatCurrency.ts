// src/components/shared/registration-student-modal/utils/formatCurrency.ts

export function formatCurrency(value: number): string {
  const safeValue = Number.isFinite(value) ? value : 0;

  return new Intl.NumberFormat("pt-MZ", {
    style: "currency",
    currency: "MZN",
    minimumFractionDigits: 0,
  }).format(safeValue);
}
