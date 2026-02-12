import registrationService from "@/services/registrationService";

/**
 * Gera código de matrícula único
 *
 * Formato: {INICIAIS_NOME_CURSO}{ANO}{NUMERO_SEQUENCIAL}
 * Exemplos:
 *   - INF202601 (Informática, 2026, estudante 01)
 *   - ING202601 (Inglês, 2026, estudante 01)
 *   - MUS202601 (Música, 2026, estudante 01)
 *
 * O código é gerado pelo backend baseado no maior número existente
 * para aquele curso+ano, garantindo unicidade.
 */
export async function generateStudentCode(
  courseCode: string,
  courseName: string
): Promise<string> {
  try {
    // Buscar código sugerido do backend
    const response = await registrationService.getCountByCourse(courseCode);

    // Se o backend retornou um código sugerido, usar ele
    if (response.suggested_code) {
      console.log("✅ Código de matrícula gerado:", response.suggested_code);
      return response.suggested_code;
    }

    // Fallback: gerar localmente se API não retornar suggested_code
    const year = new Date().getFullYear();
    // Remover acentos e pegar primeiras 3 letras do NOME do curso
    const cleanName = courseName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove acentos
      .replace(/[^A-Za-z]/g, ""); // Remove não-letras
    const prefix = cleanName.substring(0, 3).toUpperCase();
    const sequentialNumber = String(response.next_number).padStart(2, "0");

    return `${prefix}${year}${sequentialNumber}`;
  } catch (error) {
    console.error("Erro ao gerar código do estudante:", error);

    // Fallback com timestamp para garantir unicidade
    const year = new Date().getFullYear();
    const cleanName = courseName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^A-Za-z]/g, "");
    const prefix = cleanName.substring(0, 3).toUpperCase() || "MAT";
    const timestamp = Date.now().toString().slice(-4);

    return `${prefix}${year}${timestamp}`;
  }
}
