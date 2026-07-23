import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Business as CourtBusiness } from '../../components/CourtCard';
import '../../static/css/reservationPage.css';
import { useAuth } from '../../components/Auth';
import { pitchService, reservationService } from '../../services';
import { errorHandler } from '../../types/apiError';

interface OccupiedSlot {
  ReservationDate: string;
  ReservationTime: string;
}

interface Business extends CourtBusiness {
  businessName: string;
  name?: string;
  openingAt: string;
  closingAt: string;
}

interface PitchWithReservations {
  id: number;
  rating: number;
  size: string;
  groundType: string;
  roof: boolean;
  price: number;
  business?: Business;
  imageUrl: string;
  driveFileId: string;
  createdAt: string;
  updatedAt: string;
  reservations?: OccupiedSlot[];
}

interface TimeSlot {
  time: string;
  label: string;
  available: boolean;
}

export default function ReservePitchPageMakeReservation() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userData, token } = useAuth();

  const [pitch, setPitch] = useState<PitchWithReservations | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [occupiedSlots, setOccupiedSlots] = useState<OccupiedSlot[]>([]);

  const [date, setDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  const generateTimeSlots = useCallback((openingAt: string, closingAt: string): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    
    const openTime = parseInt(openingAt.split(':')[0]);
    const closeTime = parseInt(closingAt.split(':')[0]);
    
    if (isNaN(openTime) || isNaN(closeTime) || openTime >= closeTime) {
      console.warn('Horarios de negocio inválidos, usando horarios por defecto');
      return generateDefaultTimeSlots();
    }
    
    for (let hour = openTime; hour < closeTime; hour++) {
      const startTime = `${hour.toString().padStart(2, '0')}`;
      const endTime = `${(hour + 1).toString().padStart(2, '0')}`;
      const label = `${startTime}:00 - ${endTime}:00`;
      
      slots.push({
        time: startTime,
        label: label,
        available: true
      });
    }
    
    return slots;
  }, []);

  const generateDefaultTimeSlots = (): TimeSlot[] => {
    const defaultSlots: TimeSlot[] = [];
    for (let hour = 8; hour < 22; hour++) {
      const startTime = `${hour.toString().padStart(2, '0')}`;
      const endTime = `${(hour + 1).toString().padStart(2, '0')}`;
      const label = `${startTime} - ${endTime}`;
      
      defaultSlots.push({
        time: startTime,
        label: label,
        available: true
      });
    }
    return defaultSlots;
  };

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const isTimeSlotAvailable = useCallback((selectedDate: string, time: string): boolean => {
    if (!selectedDate || !time) {
      return true;
    }

    if (occupiedSlots.length === 0) {
      return true;
    }

    const isOccupied = occupiedSlots.some(slot => {
      const slotDate = new Date(slot.ReservationDate);
      const formattedSlotDate = formatDate(slotDate);
      
      let slotTime = slot.ReservationTime;
      
      if (slotTime && slotTime.includes(':')) {
        const timeParts = slotTime.split(':');
        slotTime = `${timeParts[0].padStart(2, '0')}`;
      }
      
      const isSameDay = formattedSlotDate === selectedDate;
      const isSameTime = slotTime === time;
      
      return isSameDay && isSameTime;
    });

    return !isOccupied;
  }, [occupiedSlots]);

  const fetchOccupiedSlots = useCallback(async (pitchId: string) => {
    try {
      if (!token) {
        return [];
      }

      const slots = await reservationService.findOccupiedSlotsByPitch(pitchId) as OccupiedSlot[];
      setOccupiedSlots(slots);
      return slots;
    } catch (error) {
      console.error('Error obteniendo horarios ocupados:', error);
      return [];
    }
  }, [token]);

  const fetchPitch = useCallback(async (pitchId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!pitchId) throw new Error('ID de cancha faltante');
      
      if (!token) {
        alert('Debes iniciar sesión para reservar una cancha');
        navigate('/login');
        return;
      }

      const pitchData = await pitchService.getOne(pitchId) as PitchWithReservations;

      setPitch(pitchData);

      if (pitchData.business?.openingAt && pitchData.business?.closingAt) {
        const generatedSlots = generateTimeSlots(
          pitchData.business.openingAt,
          pitchData.business.closingAt
        );
        setTimeSlots(generatedSlots);
      } else {
        setTimeSlots(generateDefaultTimeSlots());
      }

      await fetchOccupiedSlots(pitchId);

    } catch (err) {
      console.error('Error en fetchPitch:', err);
      setError(errorHandler(err));
    } finally {
      setLoading(false);
    }
  }, [token, navigate, fetchOccupiedSlots, generateTimeSlots]);

  useEffect(() => {
    if (!token) {
      const timer = setTimeout(() => {
        if (!token) {
          navigate('/login');
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }

    if (!id) {
      setError('ID de cancha inválida');
      setLoading(false);
      return;
    }
    
    fetchPitch(id);
  }, [id, token, fetchPitch, navigate]);

  useEffect(() => {
    if (date) {
      setSelectedTime('');
    }
  }, [date]);

  useEffect(() => {
    if (date && timeSlots.length > 0) {
      const updatedSlots = timeSlots.map(slot => ({
        ...slot,
        available: isTimeSlotAvailable(date, slot.time)
      }));
      
      setTimeSlots(updatedSlots);
    }
  }, [date, occupiedSlots, isTimeSlotAvailable]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pitch) return;
    if (!date || !selectedTime) {
      setError('Selecciona fecha y horario para la reserva');
      return;
    }
    
    if (id && token) {
      await fetchOccupiedSlots(id);
    }
    
    if (!isTimeSlotAvailable(date, selectedTime)) {
      setError('Este horario ya no está disponible. Alguien más lo reservó. Por favor selecciona otro horario.');
      return;
    }

    if (!token || !userData) {
      alert('Debes iniciar sesión');
      navigate('/login');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const datetime = new Date(`${date}`);
      if (isNaN(datetime.getTime())) throw new Error('Fecha inválida');

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      datetime.setHours(0, 0, 0, 0);
      
      if (datetime < today) {
        throw new Error('No puedes reservar en fechas pasadas');
      }

      const body = {
        ReservationDate: date,
        ReservationTime: `${selectedTime}:00`,
        pitch: pitch.id,
        user: userData.id,
        status: 'pendiente'
      };

      await reservationService.add(body);

      if (id) {
        await fetchOccupiedSlots(id);
      }

      alert('Reserva creada correctamente');
      navigate('/myReservations');
    } catch (err) {
      const errObj = err as any;
      let msg = errorHandler(err);
      
      if (errObj?._status === 409 || msg.includes('already reserved') || msg.includes('conflicto') || msg.includes('ocupado')) {
        msg = 'Este horario ya fue reservado por otro usuario. Por favor selecciona otro horario.';
      }
      
      if (msg.includes('User not found')) {
        msg = 'Error en el sistema: usuario no encontrado. Por favor contacta con soporte.';
      }
      
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const getBusyTimesForSelectedDate = useCallback((): string[] => {
    if (!date || occupiedSlots.length === 0) return [];

    return occupiedSlots
      .filter(slot => {
        const slotDate = new Date(slot.ReservationDate);
        return formatDate(slotDate) === date;
      })
      .map(slot => {
        const slotTime = slot.ReservationTime;
        return `${slotTime}`;
      })
      .sort();
  }, [date, occupiedSlots]);

  const busyTimes = getBusyTimesForSelectedDate();

  const formatSpanishDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!token) {
    return (
      <div className="reserve-pitch-loading">
        <div className="loading-spinner"></div>
        <p className="loading-text">Verificando autenticación...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="reserve-pitch-loading">
        <div className="loading-spinner"></div>
        <p className="loading-text">Cargando información de la cancha...</p>
      </div>
    );
  }

  if (error && !error.includes('no está disponible')) {
    return (
      <div className="reserve-pitch-error">
        <div className="error-message">
          <h3>Error al cargar cancha</h3>
          <p>{error}</p>
        </div>
        <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center'}}>
          <button onClick={() => fetchPitch(id!)} className="retry-button">
            Reintentar
          </button>
          <button onClick={() => navigate('/login')} className="secondary-button">
            Iniciar Sesión Nuevamente
          </button>
          <button onClick={() => navigate('/reserve-pitch')} className="secondary-button">
            Volver a canchas
          </button>
        </div>
      </div>
    );
  }

  if (!pitch) {
    return (
      <div className="reserve-pitch-error">
        <div className="error-message">
          <h3>No se encontró la cancha</h3>
          <p>La cancha solicitada no existe o no está disponible.</p>
        </div>
        <button onClick={() => navigate('/reserve-pitch')} className="retry-button">
          Volver a canchas
        </button>
      </div>
    );
  }

  return (
    <div className="reserve-pitch-container">
      <div className="reserve-pitch-header">
        <button 
          onClick={() => navigate('/reserve-pitch')} 
          className="back-button"
        >
          Volver a canchas
        </button>
        <h1 className="reserve-pitch-title">Reservar Cancha</h1>
        <p className="reserve-pitch-subtitle">
          Completa los datos para realizar tu reserva
        </p>
      </div>

      {userData && (
        <div style={{
          background: '#e8f4fd',
          padding: '10px 15px',
          borderRadius: '8px',
          marginBottom: '20px',
          borderLeft: '4px solid #3498db'
        }}>
          <strong>Usuario:</strong> {userData.email || userData.name || 'Usuario'} 
          {userData.category && <span style={{marginLeft: '10px'}}>| Categoria: {userData.category}</span>}
          <span style={{marginLeft: '10px'}}>| ID: {userData.id}</span>
        </div>
      )}

      <div className="reservation-content">
        <div className="pitch-card-large">
          <div className="pitch-image-section">
            <img
              src={pitch.imageUrl || 'https://via.placeholder.com/600x400?text=Cancha+Deportiva'}
              alt={`Cancha ${pitch.id}`}
              className="pitch-image-large"
            />
            <div className="pitch-badges">
              <span className="pitch-id-badge">Cancha #{pitch.id}</span>
              {pitch.roof && <span className="feature-badge covered">Cubierta</span>}
              <span className="feature-badge size">{pitch.size}</span>
              <span className="feature-badge ground">{pitch.groundType}</span>
              {pitch.business?.openingAt && pitch.business?.closingAt && (
                <span className="feature-badge hours">{pitch.business.openingAt} - {pitch.business.closingAt}</span>
              )}
            </div>
          </div>
          
          <div className="pitch-details-section">
            <div className="pitch-header">
              <h2>{pitch.business?.businessName || pitch.business?.name || 'Negocio'}</h2>
              <div className="price-tag">
                <span className="price-label">Precio por hora</span>
                <span className="price-amount">${pitch.price}</span>
              </div>
            </div>

            <div className="detail-item">
              <span className="detail-icon">.</span>
              <div className="detail-content">
                <strong>Dirección:</strong>
                <span>{pitch.business?.address || 'Dirección no disponible'}</span>
              </div>
            </div>

            {pitch.business?.openingAt && pitch.business?.closingAt && (
              <div className="detail-item">
                <span className="detail-icon">.</span>
                <div className="detail-content">
                  <strong>Horario de atención:</strong>
                  <span>{pitch.business.openingAt} - {pitch.business.closingAt}</span>
                </div>
              </div>
            )}

            <div className="availability-info">
              <div className="availability-header">
                <span className="availability-icon">.</span>
                <strong>Disponibilidad del día</strong>
              </div>
              <div className="availability-stats">
                {date ? (
                  <span className="stat-item">
                    Horarios ocupados hoy: <strong>{busyTimes.length}</strong> de {timeSlots.length}
                  </span>
                ) : (
                  <span className="stat-item">
                    Selecciona una fecha para ver disponibilidad
                  </span>
                )}
              </div>
              {date && (
                <div className="availability-details">
                  <div className="availability-progress">
                    <div 
                      className="progress-bar"
                      style={{
                        width: `${(busyTimes.length / timeSlots.length) * 100}%`,
                        backgroundColor: busyTimes.length === 0 ? '#2ecc71' : 
                                       busyTimes.length === timeSlots.length ? '#e74c3c' : '#f39c12'
                      }}
                    ></div>
                  </div>
                  <div className="availability-status">
                    {busyTimes.length === 0 && (
                      <span className="status-available">Totalmente disponible</span>
                    )}
                    {busyTimes.length > 0 && busyTimes.length < timeSlots.length && (
                      <span className="status-partial">Parcialmente ocupada</span>
                    )}
                    {busyTimes.length === timeSlots.length && (
                      <span className="status-full">Completamente ocupada</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">.</div>
                <div className="feature-info">
                  <div className="feature-label">Cubierta</div>
                  <div className="feature-value">{pitch.roof ? 'Sí' : 'No'}</div>
                </div>
              </div>

              <div className="feature-card">
                <div className="feature-icon">.</div>
                <div className="feature-info">
                  <div className="feature-label">Tamaño</div>
                  <div className="feature-value">{pitch.size || 'No especificado'}</div>
                </div>
              </div>

              <div className="feature-card">
                <div className="feature-icon">.</div>
                <div className="feature-info">
                  <div className="feature-label">Tipo de suelo</div>
                  <div className="feature-value">{pitch.groundType || 'No especificado'}</div>
                </div>
              </div>

              <div className="feature-card">
                <div className="feature-icon">.</div>
                <div className="feature-info">
                  <div className="feature-label">Horarios disponibles</div>
                  <div className="feature-value">{timeSlots.length} turnos</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="reservation-form-container">
          <div className="form-header">
            <h3>Selecciona fecha y horario</h3>
            <p>Elige cuándo quieres reservar esta cancha (turnos de 1 hora)</p>
            {pitch.business?.openingAt && pitch.business?.closingAt && (
              <p style={{fontSize: '0.9rem', color: '#3498db', marginTop: '5px'}}>
                Horario del negocio: {pitch.business.openingAt} - {pitch.business.closingAt}
              </p>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="reservation-form">
            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">.</span>
                Fecha de reserva
              </label>
              <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                className="form-input"
                min={new Date().toISOString().split('T')[0]}
                required 
              />
            </div>

            {date && (
              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">.</span>
                  Horario disponible (1 hora)
                  {timeSlots.length > 0 && (
                    <span style={{fontSize: '0.8rem', color: '#7f8c8d', marginLeft: '8px'}}>
                      ({timeSlots.length} turnos disponibles)
                    </span>
                  )}
                </label>
                <div className="time-slots-grid">
                  {timeSlots.map((slot) => {
                    const isAvailable = isTimeSlotAvailable(date, slot.time);
                    const isSelected = selectedTime === slot.time;
                    
                    return (
                      <button
                        key={slot.time}
                        type="button"
                        className={`time-slot ${isSelected ? 'time-slot-selected' : ''} ${
                          isAvailable ? 'time-slot-available' : 'time-slot-unavailable'
                        }`}
                        onClick={() => {
                          if (isAvailable) {
                            setSelectedTime(slot.time);
                          }
                        }}
                        disabled={!isAvailable}
                        title={isAvailable ? 'Horario disponible' : 'Horario ocupado'}
                      >
                        <div className="time-slot-content">
                          <div className="time-slot-label">{slot.label}</div>
                          <div className="time-slot-status">
                            {isAvailable ? 'Disponible' : 'Ocupado'}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {selectedTime && (
                  <div className="selected-time-info">
                    <strong>Horario seleccionado:</strong> {timeSlots.find(slot => slot.time === selectedTime)?.label}
                  </div>
                )}
              </div>
            )}

            {date && busyTimes.length > 0 && (
              <div className="busy-times-warning">
                <div className="warning-header">
                  <span className="warning-icon">.</span>
                  <strong>Horarios ocupados para el {formatSpanishDate(date)}:</strong>
                </div>
                <div className="busy-times-list">
                  {busyTimes.map((busyTime, index) => (
                    <span key={index} className="busy-time-badge">
                      {busyTime} hs
                    </span>
                  ))}
                </div>
                <p className="warning-text">Estos horarios no están disponibles para reservar</p>
              </div>
            )}

            {date && busyTimes.length === 0 && occupiedSlots.length > 0 && (
              <div className="available-times-info">
                <div className="info-header">
                  <span className="info-icon">.</span>
                  <strong>Todos los horarios disponibles para el {formatSpanishDate(date)}!</strong>
                </div>
                <p className="info-text">Puedes seleccionar cualquier horario para este día.</p>
              </div>
            )}

            {error && (
              <div className={`error-message ${error.includes('no está disponible') ? 'warning-message' : ''}`}>
                <span className="error-icon">.</span>
                <div className="error-content">
                  <strong>{error.includes('no está disponible') ? 'Horario no disponible:' : 'Error:'}</strong>
                  <span>{error}</span>
                </div>
              </div>
            )}

            <div className="reservation-summary">
              <div className="summary-item">
                <span>Cancha:</span>
                <strong>#{pitch.id} - {pitch.business?.businessName || 'Negocio'}</strong>
              </div>
              <div className="summary-item">
                <span>Precio por hora:</span>
                <strong>${pitch.price}</strong>
              </div>
              {pitch.business?.openingAt && pitch.business?.closingAt && (
                <div className="summary-item">
                  <span>Horario negocio:</span>
                  <strong>{pitch.business.openingAt} - {pitch.business.closingAt}</strong>
                </div>
              )}
              {date && selectedTime && (
                <>
                  <div className="summary-item">
                    <span>Fecha seleccionada:</span>
                    <strong>{formatSpanishDate(date)}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Horario seleccionado:</span>
                    <strong>{timeSlots.find(slot => slot.time === selectedTime)?.label}</strong>
                  </div>
                  <div className="summary-item availability-status">
                    <span>Disponibilidad:</span>
                    <strong className="available">
                      Disponible
                    </strong>
                  </div>
                </>
              )}
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                onClick={() => navigate('/reserve-pitch')} 
                className="btn btn-secondary"
                disabled={submitting}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={submitting || !date || !selectedTime || !isTimeSlotAvailable(date, selectedTime)}
              >
                {submitting ? (
                  <>
                    <span className="button-spinner"></span>
                    Procesando reserva...
                  </>
                ) : (
                  <>
                    <span className="button-icon">.</span>
                    Confirmar Reserva - ${pitch.price}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
