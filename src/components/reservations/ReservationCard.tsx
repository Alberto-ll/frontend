import React, { useEffect, useState } from 'react';
import { FaStore, FaFutbol, FaCalendarAlt, FaClock, FaTimes, FaStar, FaHourglassHalf, FaMoneyBillWave } from 'react-icons/fa';
import { useOutletContext } from 'react-router';
import { useNavigate } from 'react-router-dom';
import type { Reservation } from '../../types/reservationType';
import { paymentService } from '../../services';
import { parseLocalDate } from '../../utils/date';
import { paymentErrorMessage } from '../../utils/paymentError';
import StarRating from '../StarRating';
import '../../static/css/components/ReservationCard.css';

interface ReservationCardProps {
  reservation: Reservation;
  onCancel?: (id: number) => void;
  onRate?: (id: number) => void;
  /** true mientras se verifica en MercadoPago el pago de esta reserva. */
  verifyingPayment?: boolean;
}

interface LayoutContext {
  showNotification: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

const STATUS_LABELS: Record<string, string> = {
  pendiente_pago: 'Pendiente de pago',
  pendiente: 'Pendiente', // compatibilidad con datos previos a la migración
  confirmada: 'Confirmada',
  listo_pagar: 'Listo para pagar',
  'en curso': 'En curso',
  completada: 'Completada',
  ausente: 'Ausente',
  cancelada: 'Cancelada',
  expirada: 'Expirada',
  pago_rechazado: 'Pago rechazado',
};

const STATUS_CLASSES: Record<string, string> = {
  pendiente_pago: 'status-pending-payment',
  pendiente: 'status-pending',
  confirmada: 'status-confirmed',
  listo_pagar: 'status-ready-to-pay',
  'en curso': 'status-in-progress',
  completada: 'status-completed',
  ausente: 'status-absent',
  cancelada: 'status-cancelled',
  expirada: 'status-expired',
  pago_rechazado: 'status-rejected',
};

const CANCELLABLE_STATUSES = ['pendiente_pago', 'pendiente', 'confirmada', 'listo_pagar', 'en curso'];

const formatDate = (iso: string): string => {
  const date = parseLocalDate(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const formatTime = (time: string): string => time.length >= 5 ? time.slice(0, 5) : time;

const formatCountdown = (ms: number): string => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
};

const ReservationCard: React.FC<ReservationCardProps> = ({
  reservation,
  onCancel,
  onRate,
  verifyingPayment = false,
}) => {
  const context = useOutletContext<LayoutContext | null>();
  const navigate = useNavigate();
  const showNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info'): void => {
    if (context?.showNotification) {
      context.showNotification(message, type);
    } else {
      console.error(message);
    }
  };

  const status = reservation.status ?? 'pendiente_pago';
  const [now, setNow] = useState<number>(() => Date.now());
  const [paying, setPaying] = useState<'deposit' | 'balance' | null>(null);
  const [paymentWindowOpened, setPaymentWindowOpened] = useState<boolean>(false);

  useEffect(() => {
    if (status !== 'pendiente_pago') return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
    if (status === 'pendiente_pago' && typeof reservation.depositAmount !== 'number') {
      console.warn(`[ReservationCard] Reserva ${reservation.id} sin depositAmount: se oculta "Pagar seña".`);
    }
    if (
      status === 'listo_pagar' &&
      (typeof reservation.depositAmount !== 'number' || typeof reservation.totalAmount !== 'number')
    ) {
      console.warn(`[ReservationCard] Reserva ${reservation.id} sin monto de seña/total: se oculta "Pagar resto".`);
    }
  }, [status, reservation.id, reservation.depositAmount, reservation.totalAmount]);

  const businessName =
    typeof reservation.pitch?.business === 'object' &&
    reservation.pitch.business !== null &&
    'businessName' in reservation.pitch.business
      ? reservation.pitch.business.businessName
      : 'Negocio';
  const pitchLabel = `Cancha ${reservation.pitch?.id ?? ''}`;

  const expiresAtMs = reservation.paymentExpiresAt
    ? new Date(reservation.paymentExpiresAt).getTime()
    : null;
  const holdExpired = expiresAtMs !== null && expiresAtMs <= now;
  const remainingMs = expiresAtMs !== null ? expiresAtMs - now : null;

  const depositAmount = typeof reservation.depositAmount === 'number' ? reservation.depositAmount : null;
  const balanceAmount =
    typeof reservation.totalAmount === 'number' && typeof reservation.depositAmount === 'number'
      ? Math.round((reservation.totalAmount - reservation.depositAmount) * 100) / 100
      : null;

  const canPayDeposit = status === 'pendiente_pago' && !holdExpired && depositAmount !== null;
  const canPayBalance = status === 'listo_pagar' && balanceAmount !== null;
  const canCancel = CANCELLABLE_STATUSES.includes(status) && !(status === 'pendiente_pago' && holdExpired);
  const canRate = status === 'completada' && !reservation.pitchRating;

  const startPayment = async (type: 'deposit' | 'balance'): Promise<void> => {
    if (paying) return;
    setPaying(type);
    // Abrimos la pestaña de forma sincrónica (dentro del gesto del usuario) y la
    // navegamos recién cuando llega la preferencia, para que el bloqueador de
    // popups no cancele el window.open diferido.
    const paymentWindow = window.open('', '_blank');
    if (!paymentWindow) {
      console.warn(
        '[payment] window.open devolvió null (popup bloqueado por el navegador). ' +
        'Se usará la navegación en la pestaña actual como fallback.'
      );
    }
    try {
      const preference =
        type === 'deposit'
          ? await paymentService.createDepositPreference(reservation.id)
          : await paymentService.createBalancePreference(reservation.id);

      const redirectUrl = preference.sandbox_init_point ?? preference.init_point;
      if (!redirectUrl) {
        throw new Error('No se recibió URL de redirección de MercadoPago');
      }
      console.info('[payment] opening new window', {
        url: redirectUrl,
        preferenceId: preference.preference_id,
        hasSandbox: !!preference.sandbox_init_point,
        popupOpened: !!paymentWindow && !paymentWindow.closed,
      });
      if (paymentWindow && !paymentWindow.closed) {
        // `replace` evita dejar el about:blank en el historial de la pestaña nueva.
        paymentWindow.location.replace(redirectUrl);
        paymentWindow.focus();
      } else {
        // Bloqueador de popups activo (o el usuario cerró la pestaña en blanco):
        // mantenemos el flujo anterior como fallback.
        window.location.href = redirectUrl;
        return;
      }
      setPaymentWindowOpened(true);
    } catch (error) {
      paymentWindow?.close();
      showNotification(paymentErrorMessage(error), 'error');
    } finally {
      setPaying(null);
    }
  };

  return (
    <div className="reservation-card">
      <div className="reservation-card__header">
        <div className="business-info">
          <FaStore className="business-info__icon" size={16} />
          <span className="business-info__name">{businessName}</span>
        </div>
        <span className={`status-badge ${STATUS_CLASSES[status] ?? 'status-pending'}`}>
          {STATUS_LABELS[status] ?? status}
        </span>
      </div>

      <div className="reservation-card__body">
        <div className="reservation-detail-row">
          <FaFutbol className="reservation-detail-icon" size={14} />
          <span className="reservation-detail-text">{pitchLabel}</span>
        </div>
        <div className="reservation-detail-row">
          <FaCalendarAlt className="reservation-detail-icon" size={14} />
          <span className="reservation-detail-text">{formatDate(reservation.ReservationDate)}</span>
        </div>
        <div className="reservation-detail-row">
          <FaClock className="reservation-detail-icon" size={14} />
          <span className="reservation-detail-text">{formatTime(reservation.ReservationTime)}</span>
        </div>
        {status === 'pendiente_pago' && (
          <div className={`reservation-hold ${holdExpired ? 'reservation-hold--expired' : ''}`}>
            <FaHourglassHalf size={13} />
            <span>
              {holdExpired
                ? 'El tiempo para pagar se agotó'
                : remainingMs !== null
                  ? `Pagá la seña en ${formatCountdown(remainingMs)}`
                  : 'Pagá la seña para mantener el horario'}
            </span>
          </div>
        )}
        {verifyingPayment && (
          <div className="reservation-verifying" role="status">
            <span className="reservation-verifying__spinner" />
            <span>Verificando pago...</span>
          </div>
        )}
        {paymentWindowOpened && (
          <div className="reservation-hold" role="status">
            <FaMoneyBillWave size={13} />
            <span>Se abrió una nueva ventana para completar el pago. Cuando termines, volvé a esta pestaña.</span>
          </div>
        )}
        {status === 'completada' && (
          <div className="reservation-rating">
            {reservation.pitchRating ? (
              <StarRating rating={reservation.pitchRating} size="small" />
            ) : (
              <span className="reservation-rating__empty">Sin calificar</span>
            )}
          </div>
        )}
      </div>

      {(canPayDeposit || canPayBalance || canCancel || canRate || paymentWindowOpened) && (
        <div className="reservation-card__footer">
          {paymentWindowOpened && (
            <button className="btn-rate" onClick={() => navigate('/myReservations')}>
              Ir a reservas
            </button>
          )}
          {canPayDeposit && depositAmount !== null && (
            <button
              className="btn-pay"
              onClick={() => void startPayment('deposit')}
              disabled={paying !== null}
            >
              <FaMoneyBillWave size={13} />
              {paying === 'deposit' ? 'Iniciando pago...' : `Pagar seña ($${depositAmount})`}
            </button>
          )}
          {canPayBalance && balanceAmount !== null && (
            <button
              className="btn-pay"
              onClick={() => void startPayment('balance')}
              disabled={paying !== null}
            >
              <FaMoneyBillWave size={13} />
              {paying === 'balance' ? 'Iniciando pago...' : `Pagar resto ($${balanceAmount})`}
            </button>
          )}
          {canCancel && (
            <button className="btn-cancel" onClick={() => onCancel?.(reservation.id)}>
              <FaTimes size={13} /> Cancelar
            </button>
          )}
          {canRate && (
            <button className="btn-rate" onClick={() => onRate?.(reservation.id)}>
              <FaStar size={13} /> Calificar
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ReservationCard;
