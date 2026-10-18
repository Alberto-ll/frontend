import { useEffect, useState, useCallback } from 'react';
import type { Reservation } from '../../types/reservationType';
import { useOutletContext } from 'react-router';
import { FaCalendarCheck, FaExclamationTriangle, FaPaperPlane, FaTimes } from 'react-icons/fa';
import { errorHandler } from '../../utils/errorHandler';
import '../../static/css/myReservations.css';
import { useAuth } from '../../hooks/useAuth';
import { reservationService } from '../../services';
import StarRating from '../../components/StarRating';
import ReservationCard from '../../components/reservations/ReservationCard';

export default function MyReservations() {
    const [data, setData] = useState<Reservation[] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<boolean>(false);
    const [ratingModal, setRatingModal] = useState<{id: number, rating: number} | null>(null);
    const { userData } = useAuth();

    const { showNotification } = useOutletContext<{ showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void }>();

    const findAllFromUser = useCallback(async (id:number) =>{
            try{
                setLoading(true)
                const json = await reservationService.findAllFromUser(id) as unknown as Reservation[];
                setData(json)
            }catch(error){
                showNotification(errorHandler(error), 'error');
                setError(true);
            }finally{
                setLoading(false)
            }
        }, [showNotification])

        useEffect(() => {
            if (!error && userData?.id) {
                findAllFromUser(userData.id);
            }
        }, [error, findAllFromUser, userData]);

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
