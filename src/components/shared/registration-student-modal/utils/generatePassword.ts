// src/components/shared/registration-student-modal/utils/generatePassword.ts

/**
 * Gera uma senha aleatória inicial para o estudante.
 * Regra:
 * - comprimento padrão: 10 caracteres
 * - mistura letras + números
 * - suficiente para senha temporária (primeiro login)
 */
export function generatePassword(length: number = 10): string {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZ" + // sem I e O (confusão visual)
    "abcdefghijkmnopqrstuvwxyz" +
    "23456789"; // sem 0 e 1

  let password = "";

  for (let i = 0; i < length; i++) {
    const index = Math.floor(Math.random() * chars.length);
    password += chars[index];
  }

  return password;
}
