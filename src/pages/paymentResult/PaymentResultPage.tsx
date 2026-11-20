import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaCheckCircle, FaExclamationTriangle, FaHourglassHalf, FaTimesCircle } from 'react-icons/fa';
import { usePaymentVerification } from '../../hooks/usePaymentVerification';
import type { PaymentVerificationState } from '../../hooks/usePaymentVerification';
import '../../static/css/paymentResult.css';

/**
 * Pantalla de retorno de Checkout Pro.
 *
 * MercadoPago devuelve al navegador con `external_reference` (id de reserva) y
 * `status` en la query string. Como el backend no confía en esos parámetros
 * (son informativos), el resultado se confirma con polling a
 * GET /api/payments/check/:reservationId.
 */

const RESULT_POLL_INTERVAL_MS = 2_000;
const RESULT_POLL_TIMEOUT_MS = 30_000;

/** Estados de pago de MP que no van a cambiar a `approved`. */
const MP_NON_APPROVABLE_STATUSES = new Set(['rejected', 'cancelled']);

type ViewState = PaymentVerificationState | 'invalid';

function parseReservationId(raw: string | null): number | null {
  if (!raw) return null;
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

const VIEW_COPY: Record<
  Exclude<ViewState, 'verifying'>,
  { title: string; message: string; tone: string }
> = {
  approved: {
    title: 'Pago confirmado',
    message: 'Acreditamos tu pago y actualizamos el estado de tu reserva.',
    tone: 'success',
  },
  pending: {
    title: 'Tu pago está siendo procesado',
    message: 'Verificá el estado en Mis reservas.',
    tone: 'pending',
  },
  rejected: {
    title: 'El pago no se completó',
    message: 'MercadoPago rechazó el pago. Podés intentarlo de nuevo desde Mis reservas.',
    tone: 'rejected',
  },
  error: {
    title: 'No pudimos verificar el estado del pago',
    message: 'Verificá en Mis reservas.',
    tone: 'error',
  },
  invalid: {
    title: 'No pudimos identificar tu reserva',
    message: 'Faltan datos del pago en la URL. Verificá el estado en Mis reservas.',
    tone: 'error',
  },
};

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const reservationId = useMemo(
    () => parseReservationId(searchParams.get('external_reference')),
    [searchParams]
  );
  const mpStatus = searchParams.get('status');

  const ids = useMemo(() => (reservationId === null ? [] : [reservationId]), [reservationId]);
  const verification = usePaymentVerification(ids, {
    intervalMs: RESULT_POLL_INTERVAL_MS,
    timeoutMs: RESULT_POLL_TIMEOUT_MS,
  });

  const rawState: ViewState =
    reservationId === null ? 'invalid' : verification[reservationId]?.state ?? 'verifying';

  // Si el backend todavía no ve el pago pero MP ya informó un rechazo, se
  // muestra el rechazo en lugar de "siendo procesado".
  const state: ViewState =
    rawState === 'pending' && mpStatus !== null && MP_NON_APPROVABLE_STATUSES.has(mpStatus)
      ? 'rejected'
      : rawState;

  const goToReservations = (): void => {
    navigate('/myReservations');
  };

  return (
    <div className="payment-result-page">
      <div
        className={`payment-result-card payment-result-card--${
          state === 'verifying' ? 'verifying' : VIEW_COPY[state].tone
        }`}
      >
        {state === 'verifying' ? (
          <>
            <div className="payment-result-spinner" />
            <h1 className="payment-result-title">Verificando pago...</h1>
            <p className="payment-result-message">
              Estamos confirmando el resultado con MercadoPago. No cierres esta ventana.
            </p>
          </>
        ) : (
          <>
            <div className="payment-result-icon">
              {state === 'approved' && <FaCheckCircle size={44} />}
              {state === 'pending' && <FaHourglassHalf size={44} />}
              {state === 'rejected' && <FaTimesCircle size={44} />}
              {(state === 'error' || state === 'invalid') && <FaExclamationTriangle size={44} />}
            </div>
            <h1 className="payment-result-title">{VIEW_COPY[state].title}</h1>
            <p className="payment-result-message">{VIEW_COPY[state].message}</p>
          </>
        )}

        {reservationId !== null && (
          <p className="payment-result-reference">Reserva #{reservationId}</p>
        )}

        {state !== 'verifying' && (
          <button className="payment-result-btn" onClick={goToReservations}>
            Ver mis reservas
          </button>
        )}
      </div>
    </div>
  );
}
