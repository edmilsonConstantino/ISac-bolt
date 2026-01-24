// src/components/shared/registration/utils/generateCurrentPeriod.ts

/**
 * Gera o período letivo atual no formato: YYYY/1 ou YYYY/2
 * Regra: Jan-Jun => 1 | Jul-Dez => 2
 */
export function generateCurrentPeriod(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 1-12
  const semester = month <= 6 ? "1" : "2";
  return `${year}/${semester}`;
}
