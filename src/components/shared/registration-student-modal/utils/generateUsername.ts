// src/components/shared/registration-student-modal/utils/generateUsername.ts

export interface GenerateUsernameOptions {
  /**
   * Quantos dígitos usar no sufixo (default 4)
   * Ex.: 4 => "mario.silva4821"
   */
  suffixLength?: number;

  /**
   * Separador entre first e last name (default ".")
   */
  separator?: string;
}

/**
 * Gera username a partir do nome do estudante.
 * Formato: primeiro.ultimo + sufixo numérico (para evitar duplicados)
 *
 * Ex.: "Mário António da Silva" -> "mario.silva4821"
 */
export function generateUsername(
  fullName: string,
  options: GenerateUsernameOptions = {}
): string {
  const { suffixLength = 4, separator = "." } = options;

  const normalized = normalizeName(fullName);
  const parts = normalized.split(" ").filter(Boolean);

  if (parts.length === 0) {
    // fallback: se não houver nome válido
    return `student${generateNumericSuffix(suffixLength)}`;
  }

  const firstName = parts[0];
  const lastName = parts.length > 1 ? parts[parts.length - 1] : parts[0];

  const base = `${firstName}${separator}${lastName}`.replace(/[^a-z0-9.]/g, "");
  return `${base}${generateNumericSuffix(suffixLength)}`;
}

/** Remove acentos e padroniza espaços */
function normalizeName(name: string): string {
  return (name || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/\s+/g, " "); // normaliza espaços
}

function generateNumericSuffix(length: number): string {
  const safeLength = Math.max(2, Math.min(length, 8));
  const raw = Date.now().toString(); // milissegundos
  return raw.slice(-safeLength);
}
