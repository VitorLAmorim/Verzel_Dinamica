/**
 * Converte uma data string em range de início e fim do dia
 * Formato esperado: YYYY-MM-DD
 */
export function createDateRange(dateString: string) {
  const date = new Date(dateString);

  // Início do dia (00:00:00.000)
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  // Fim do dia (23:59:59.999)
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return {
    start: startOfDay.toISOString(),
    end: endOfDay.toISOString()
  };
}

/**
 * Verifica se uma string é uma data válida no formato YYYY-MM-DD
 */
export function isValidDateString(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;

  const date = new Date(dateString);
  return !isNaN(date.getTime());
}