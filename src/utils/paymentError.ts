import { errorHandler } from './errorHandler';

/**
 * Interpretación de errores de los endpoints de pago.
 *
 * El backend responde `{ error: string }` y el cliente `api` adjunta el status
 * HTTP al body del error como `_status`. El mensaje real del backend debe
 * mostrarse siempre; solo se normaliza cuando corresponde a un hold vencido.
 */

interface PaymentErrorBody {
  message?: unknown;
  error?: unknown;
  _status?: unknown;
}

export interface PaymentErrorInfo {
  /** Mensaje listo para mostrar al usuario. */
  message: string;
  /** true si el error corresponde a un hold de pago vencido. */
  expired: boolean;
  /** Status HTTP original, si el cliente `api` lo adjuntó. */
  status?: number;
}

const EXPIRY_PATTERN = /expir|plazo/i;

function readBody(error: unknown): PaymentErrorBody | null {
  return typeof error === 'object' && error !== null ? (error as PaymentErrorBody) : null;
}

function firstBackendMessage(body: PaymentErrorBody | null): string | undefined {
  if (!body) return undefined;
  if (typeof body.message === 'string' && body.message.trim()) return body.message;
  if (typeof body.error === 'string' && body.error.trim()) return body.error;
  return undefined;
}

/**
 * Resuelve el mensaje a mostrar para un error de pago.
 *
 * - Si el mensaje real contiene "expir", "expired" o "plazo", se normaliza a
 *   "El plazo de pago expiró" y `expired` queda en true.
 * - En cualquier otro caso se devuelve el mensaje real del backend (o de un
 *   Error local, como la falta de URL de MercadoPago).
 */
export function resolvePaymentError(
  error: unknown,
  fallback = 'Error al iniciar el pago'
): PaymentErrorInfo {
  const body = readBody(error);
  const status = typeof body?._status === 'number' ? body._status : undefined;
  const backendMessage = firstBackendMessage(body);
  const expired = backendMessage !== undefined && EXPIRY_PATTERN.test(backendMessage);

  if (expired) {
    return { message: 'El plazo de pago expiró', expired: true, status };
  }

  const message = backendMessage ?? errorHandler(error);
  if (message && message !== 'Error desconocido') {
    return { message, expired: false, status };
  }

  return { message: fallback, expired: false, status };
}

/** Atajo cuando solo se necesita el texto a mostrar. */
export function paymentErrorMessage(
  error: unknown,
  fallback = 'Error al iniciar el pago'
): string {
  return resolvePaymentError(error, fallback).message;
}
