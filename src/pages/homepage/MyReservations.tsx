import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import type { Reservation } from '../../types/reservationType';
import { useOutletContext } from 'react-router';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCalendarCheck, FaExclamationTriangle, FaPaperPlane, FaTimes } from 'react-icons/fa';
import { errorHandler } from '../../utils/errorHandler';
import '../../static/css/myReservations.css';
import { useAuth } from '../../hooks/useAuth';
import { reservationService } from '../../services';
import StarRating from '../../components/StarRating';
import ReservationCard from '../../components/reservations/ReservationCard';
import { usePaymentVerification } from '../../hooks/usePaymentVerification';
import type { PaymentVerificationResult } from '../../hooks/usePaymentVerification';

const PAYMENT_POLL_INTERVAL_MS = 5_000;
const PAYMENT_POLL_TIMEOUT_MS = 30_000;

/** Estados de reserva en los que todavía se espera un pago de MercadoPago. */
const AWAITING_PAYMENT_STATUSES = ['pendiente_pago', 'listo_pagar'];

export default function MyReservations() {
    const [data, setData] = useState<Reservation[] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<boolean>(false);
    const [ratingModal, setRatingModal] = useState<{id: number, rating: number} | null>(null);
    const { userData } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const messageShownRef = useRef(false);

    const { showNotification } = useOutletContext<{ showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void }>();

    // Mensaje proveniente de ReservationPage (confirmación exitosa o hold expirado)
    useEffect(() => {
        const state = location.state as { reservationMessage?: string } | null;
        const message = state?.reservationMessage;
        if (!message || messageShownRef.current) return;

        messageShownRef.current = true;
        showNotification(message, 'info');
        navigate(location.pathname, { replace: true, state: null });
    }, [location.state, location.pathname, navigate, showNotification]);

    const findAllFromUser = useCallback(async (id:number, silent = false) =>{
            try{
                if (!silent) setLoading(true)
                const json = await reservationService.findAllFromUser(id) as unknown as Reservation[];
                setData(json)
            }catch(error){
                showNotification(errorHandler(error), 'error');
                setError(true);
            }finally{
                if (!silent) setLoading(false)
            }
        }, [showNotification])

        useEffect(() => {
            if (!error && userData?.id) {
                findAllFromUser(userData.id);
            }
        }, [error, findAllFromUser, userData]);

    // MercadoPago no redirige de vuelta (no hay back_urls en la preferencia), así
    // que el pago se confirma consultando el backend mientras el usuario está en
    // esta pantalla. Solo se verifican reservas que todavía esperan un pago.
    const pendingPaymentIds = useMemo(
        () => (data ?? [])
            .filter((reservation) => AWAITING_PAYMENT_STATUSES.includes(reservation.status ?? 'pendiente_pago'))
            .map((reservation) => reservation.id),
        [data]
    );

    const handlePaymentResolved = useCallback((result: PaymentVerificationResult) => {
        if (result.state === 'approved') {
            showNotification('¡Pago confirmado! Actualizamos tu reserva.', 'success');
            if (userData?.id) void findAllFromUser(userData.id, true);
            return;
        }
        // Rechazo o reserva que ya transicionó: refrescar para mostrar el estado real.
        if (result.state === 'rejected' && userData?.id) {
            void findAllFromUser(userData.id, true);
        }
    }, [findAllFromUser, showNotification, userData]);

    const paymentVerifications = usePaymentVerification(pendingPaymentIds, {
        intervalMs: PAYMENT_POLL_INTERVAL_MS,
        timeoutMs: PAYMENT_POLL_TIMEOUT_MS,
        onResolved: handlePaymentResolved,
    });

    const handleCancel = useCallback(async (id: number) => {
        if (!confirm("¿Estas seguro que quieres cancelar la reserva?")) return;
        try {
            setLoading(true);
            await reservationService.cancel(id);
            showNotification('Reserva cancelada con éxito!', 'success');
            if (userData?.id) {
                await findAllFromUser(userData.id);
            }
        } catch (error) {
            showNotification(errorHandler(error), 'error');
        } finally {
            setLoading(false);
        }
    }, [findAllFromUser, showNotification, userData]);

  const handleRateClick = (id: number) => {
    setRatingModal({ id, rating: 0 });
  };

  const submitRating = async () => {
    if (!ratingModal || ratingModal.rating === 0) return;
    try {
      await reservationService.rate(ratingModal.id, ratingModal.rating);
      showNotification('Calificación enviada con éxito!', 'success');
      setRatingModal(null);
      if (userData?.id) {
        await findAllFromUser(userData.id);
      }
    } catch (error) {
      showNotification(errorHandler(error), 'error');
    }
  };

  const handleRetry = () => {
    setError(false);
  };

  const visibleReservations = (data ?? []).filter(r => r.status !== 'cancelada');

  return (
    <div className='my-reservations-page'>
        <div className='my-reservations-container'>
            <header className='my-reservations-header'>
                <h1>Mis reservas</h1>
                <p>Gestioná tus reservas de canchas</p>
            </header>

            {loading && (
                <div className='my-reservations-state'>
                    <div className='my-reservations-spinner' />
                    <p>Cargando tus reservas...</p>
                </div>
            )}

            {!loading && error && (
                <div className='my-reservations-state my-reservations-state--error'>
                    <div className='my-reservations-state-icon'>
                        <FaExclamationTriangle size={36} />
                    </div>
                    <h3>Error al cargar tus reservas</h3>
                    <p>Ocurrió un problema al obtener tus reservas. Intentá nuevamente.</p>
                    <button className='my-reservations-retry-btn' onClick={handleRetry}>
                        Reintentar
                    </button>
                </div>
            )}

            {!loading && !error && data && visibleReservations.length === 0 && (
                <div className='my-reservations-state'>
                    <div className='my-reservations-state-icon'>
                        <FaCalendarCheck size={36} />
                    </div>
                    <h3>No tenés reservas todavía</h3>
                    <p>Explorá negocios y reservá una cancha para que aparezca acá.</p>
                </div>
            )}

            {!loading && !error && visibleReservations.length > 0 && (
                <div className='reservations-grid'>
                    {visibleReservations.map(r => (
                        <ReservationCard
                            key={r.id}
                            reservation={r}
                            onCancel={handleCancel}
                            onRate={handleRateClick}
                            verifyingPayment={paymentVerifications[r.id]?.state === 'verifying'}
                        />
                    ))}
                </div>
            )}

            {ratingModal && (
              <div className="rating-modal-overlay" onClick={() => setRatingModal(null)}>
                <div className="rating-modal" onClick={(e) => e.stopPropagation()}>
                  <h3>Calificar cancha</h3>
                  <div className="rating-modal-stars">
                    <StarRating
                      rating={ratingModal.rating}
                      interactive={true}
                      size="large"
                      onRate={(r) => setRatingModal(prev => prev ? { ...prev, rating: r } : null)}
                    />
                  </div>
                  <div className="rating-modal-actions">
                    <button className="rating-modal-cancel" onClick={() => setRatingModal(null)}>
                      <FaTimes size={13} /> Cancelar
                    </button>
                    <button
                      className="rating-modal-submit"
                      onClick={submitRating}
                      disabled={ratingModal.rating === 0}
                    >
                      <FaPaperPlane size={13} /> Enviar
                    </button>
                  </div>
                </div>
              </div>
            )}
        </div>
    </div>
  );
}
