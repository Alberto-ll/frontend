import { useEffect, useState, useCallback } from 'react';
import type { Reservation } from '../../types/reservationType.ts';
import { useOutletContext } from 'react-router';
import { errorHandler } from '../../types/apiError.ts';
import '../../static/css/myReservations.css'
import { useAuth } from '../../components/Auth';
import { reservationService } from '../../services';
import StarRating from '../../components/StarRating';

export default function MyReservations() {
    const [data, setData] = useState<Reservation[] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [ error, setError ] = useState<boolean>(false);
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
                setLoading(false)
            }finally{
                setLoading(false)
            }
        }, [showNotification])

        useEffect(() => {
            if (!error && userData?.id) {
                findAllFromUser(userData.id);
            }
        }, [error, findAllFromUser, userData]);
    

    const remove = async (id:number) =>{
            try{
                setLoading(true)
                await reservationService.cancel(id)
                showNotification('Reserva cancelada con éxito!', 'success')
            }catch(error){
                 showNotification(errorHandler(error), 'error');
            }
        }
        
  const handleDeleteSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
        if(confirm("¿Estas seguro que quieres cancelar la reserva?")){
            if(e.currentTarget.value) {
                remove(Number(e.currentTarget.value));
            }
        }
      };

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
    
  return (
    <div className='crud-home-container'>
         {!loading && <pre className='content-area'>
            <h1>Mis Reservas</h1>
            <table className='crudTable'>
                <thead>
                    <tr>
                        <th>ID de reserva</th>
                        <th>Negocio</th>
                        <th>ID Cancha</th>
                        <th>Fecha y hora de reserva</th>
                        <th>Calificación</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {data?.
      filter((reservation: Reservation) => reservation.status !== 'cancelada')
      .map((reservation: Reservation) => (
        <tr key={reservation.id}>
          <td>{reservation.id}</td>
          <td>{typeof(reservation.pitch.business) === "object" && reservation.pitch.business.businessName}</td>
          <td>{reservation.pitch.id}</td>  
          <td>{reservation.ReservationTime}</td>
          <td>
            {reservation.status === 'completada' && reservation.pitchRating ? (
              <StarRating rating={reservation.pitchRating} size="small" />
            ) : reservation.status === 'completada' && !reservation.pitchRating ? (
              <button
                className='action-button custom'
                onClick={() => handleRateClick(reservation.id)}
              >
                Calificar
              </button>
            ) : null}
          </td>
          <td>
            <button
              className='action-button delete'
              value={reservation.id}
              onClick={handleDeleteSubmit}
            >
              Cancelar
            </button>
          </td>
        </tr>
      ))}
                </tbody>
            </table>
        </pre>}
        {loading && <h3>Loading...</h3>}

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
                <button className="action-button delete" onClick={() => setRatingModal(null)}>
                  Cancelar
                </button>
                <button
                  className="action-button custom"
                  onClick={submitRating}
                  disabled={ratingModal.rating === 0}
                >
                  Enviar
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
