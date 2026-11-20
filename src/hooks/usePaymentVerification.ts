import { useEffect, useRef, useState } from 'react';
import { paymentService } from '../services';
import type { PaymentSnapshot } from '../types/paymentType';
import { resolvePaymentError } from '../utils/paymentError';

/**
 * Verificación de pagos por polling.
 *
 * El backend no recibe webhooks ni configura `back_urls` en MercadoPago: la
 * única forma de saber si un pago se acreditó es consultar
 * GET /api/payments/check/:reservationId, que consulta la API de MP y
 * reconcilia la reserva.
 *
 * Este hook centraliza ese polling para que tanto la pantalla de retorno como
 * "Mis reservas" usen la misma lógica y se limpien al desmontar.
 */

export type PaymentVerificationState = 'verifying' | 'approved' | 'rejected' | 'pending' | 'error';

export interface PaymentVerificationResult {
  state: PaymentVerificationState;
  snapshot?: PaymentSnapshot;
  message?: string;
}

export interface UsePaymentVerificationOptions {
  /** Intervalo entre consultas (ms). */
  intervalMs?: number;
  /** Tiempo máximo de polling por reserva (ms). */
  timeoutMs?: number;
  /** Se invoca una única vez por reserva cuando el polling concluye. */
  onResolved?: (result: PaymentVerificationResult) => void;
}

const DEFAULT_INTERVAL_MS = 5_000;
const DEFAULT_TIMEOUT_MS = 30_000;

/** Estados de reserva en los que todavía se espera un pago. */
const AWAITING_PAYMENT_STATUSES = new Set(['pendiente_pago', 'listo_pagar']);

/** El cliente `api` adjunta el status HTTP al body del error como `_status`. */
function errorMessage(error: unknown): string {
  const status =
    typeof error === 'object' && error !== null && '_status' in error
      ? (error as { _status?: unknown })._status
      : undefined;

  if (status === 404) return 'No encontramos la reserva indicada.';

  // Para el resto se muestra el mensaje real del backend (normalizando solo
  // los casos de hold vencido).
  return resolvePaymentError(error, 'No pudimos comunicarnos con el servidor.').message;
}

/**
 * Hace polling de `reservationIds` hasta que cada reserva se resuelva o hasta
 * agotar `timeoutMs`.
 *
 * Una reserva se considera resuelta cuando:
 *  - aparece un `Payment` con estado `approved`;
 *  - la reserva dejó de estar en `pendiente_pago` / `listo_pagar`;
 *  - la consulta falla (estado `error`);
 *  - se alcanza el timeout (estado `pending`).
 *
 * Cada reserva se resuelve una sola vez: los ids resueltos no se vuelven a
 * consultar aunque la lista de entrada cambie.
 */
export function usePaymentVerification(
  reservationIds: number[],
  options: UsePaymentVerificationOptions = {}
): Record<number, PaymentVerificationResult> {
  const { intervalMs = DEFAULT_INTERVAL_MS, timeoutMs = DEFAULT_TIMEOUT_MS } = options;
  const [results, setResults] = useState<Record<number, PaymentVerificationResult>>({});
  const resolvedIdsRef = useRef<Set<number>>(new Set());
  const onResolvedRef = useRef(options.onResolved);

  useEffect(() => {
    onResolvedRef.current = options.onResolved;
  }, [options.onResolved]);

  // Clave estable: evita reiniciar el polling cuando el array es un literal nuevo.
  const idsKey = reservationIds.join(',');

  useEffect(() => {
    const pendingIds = idsKey
      ? idsKey
          .split(',')
          .map(Number)
          .filter((id) => Number.isInteger(id) && id > 0 && !resolvedIdsRef.current.has(id))
      : [];

    if (pendingIds.length === 0) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let deadlineTimer: ReturnType<typeof setTimeout> | undefined;
    const inFlight = new Set<number>();

    setResults((prev) => {
      const next = { ...prev };
      for (const id of pendingIds) next[id] = { state: 'verifying' };
      return next;
    });

    const finish = (id: number, result: PaymentVerificationResult): void => {
      if (resolvedIdsRef.current.has(id)) return;
      resolvedIdsRef.current.add(id);
      setResults((prev) => ({ ...prev, [id]: result }));
      onResolvedRef.current?.(result);
    };

    const pollOnce = async (id: number): Promise<void> => {
      if (inFlight.has(id)) return;
      inFlight.add(id);

      try {
        const snapshot = await paymentService.checkPayment(id);
        if (cancelled || resolvedIdsRef.current.has(id)) return;

        if (snapshot.payments.some((payment) => payment.status === 'approved')) {
          finish(id, { state: 'approved', snapshot });
          return;
        }

        // La reserva ya no espera pago: se resolvió sin aprobación (rechazo o
        // transición por otro flujo).
        if (!AWAITING_PAYMENT_STATUSES.has(snapshot.reservation.status)) {
          const rejected = snapshot.payments.some(
            (payment) => payment.status === 'rejected' || payment.status === 'cancelled'
          );
          finish(id, { state: rejected ? 'rejected' : 'pending', snapshot });
        }
      } catch (error) {
        if (cancelled || resolvedIdsRef.current.has(id)) return;
        finish(id, { state: 'error', message: errorMessage(error) });
      } finally {
        inFlight.delete(id);
      }
    };

    const allResolved = (): boolean =>
      pendingIds.every((id) => resolvedIdsRef.current.has(id));

    const stop = (): void => {
      if (timer !== undefined) {
        clearTimeout(timer);
        timer = undefined;
      }
      if (deadlineTimer !== undefined) {
        clearTimeout(deadlineTimer);
        deadlineTimer = undefined;
      }
    };

    const scheduleNext = (): void => {
      if (cancelled) return;
      timer = setTimeout(() => void tick(), intervalMs);
    };

    async function tick(): Promise<void> {
      if (cancelled) return;

      await Promise.all(
        pendingIds
          .filter((id) => !resolvedIdsRef.current.has(id))
          .map((id) => pollOnce(id))
      );

      if (cancelled) return;

      if (allResolved()) {
        stop();
        return;
      }

      scheduleNext();
    }

    // Corte duro a `timeoutMs`: no depende de que la última consulta termine.
    deadlineTimer = setTimeout(() => {
      if (cancelled) return;
      for (const id of pendingIds) {
        if (!resolvedIdsRef.current.has(id)) finish(id, { state: 'pending' });
      }
      stop();
    }, timeoutMs);

    void tick();

    return () => {
      cancelled = true;
      stop();
    };
  }, [idsKey, intervalMs, timeoutMs]);

  return results;
}
