/**
 * Parsea una fecha 'YYYY-MM-DD' como medianoche LOCAL.
 *
 * `new Date('YYYY-MM-DD')` (sin hora) la interpreta como UTC; al formatearla
 * con `toLocaleDateString` en un timezone con offset negativo retrocede al día
 * anterior. Forzar 'T00:00:00' hace que el parseo sea en horario local.
 */
export function parseLocalDate(dateString: string): Date {
  // Si llega un ISO completo (p. ej. '2026-11-20T03:00:00.000Z'), se usa solo
  // la parte de fecha para no generar un string de fecha inválido.
  const datePart = dateString.length > 10 ? dateString.slice(0, 10) : dateString;
  return new Date(`${datePart}T00:00:00`);
}
