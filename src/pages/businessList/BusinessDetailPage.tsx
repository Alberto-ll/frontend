import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import {
  FaArrowLeft,
  FaMapMarkerAlt,
  FaPercent,
  FaClock,
  FaCheckCircle,
  FaFutbol,
} from 'react-icons/fa';
import type { BusinessData } from '../../types/businessType';
import type { Pitch } from '../../types/pitchType';
import { businessService, pitchService } from '../../services';
import { errorHandler } from '../../utils/errorHandler';
import { SCHEDULE_DAYS } from '../../utils/scheduleUtils';
import StarRating from '../../components/StarRating';
import '../../static/css/businessList.css';

export const BusinessDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBusinessAndPitches = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);

      const [businessData, pitchesData] = await Promise.all([
        businessService.findOne(id),
        pitchService.getByBusiness(id),
      ]);

      setBusiness(businessData);
      setPitches(pitchesData || []);
    } catch (err) {
      setError(errorHandler(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBusinessAndPitches();
  }, [fetchBusinessAndPitches]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Determinar el día de hoy (1: Lun, ..., 7: Dom)
  const jsDay = new Date().getDay();
  const currentScheduleDay = jsDay === 0 ? 7 : jsDay;

  const localityName =
    business && typeof business.locality === 'object' && business.locality !== null
      ? business.locality.name
      : undefined;

  const depositPercent =
    business && typeof business.reservationDepositPercentage === 'number'
      ? Math.round(
          business.reservationDepositPercentage <= 1
            ? business.reservationDepositPercentage * 100
            : business.reservationDepositPercentage
        )
      : null;

  if (loading) {
    return (
      <div className="business-detail-container">
        <div className="business-detail-page">
          <div className="business-loading-container">
            <div className="business-loading-spinner" />
            <p>Cargando información del predio y sus canchas...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="business-detail-container">
        <div className="business-detail-page">
          <div className="business-detail-back-bar">
            <Link to="/businesses" className="business-back-link">
              <FaArrowLeft /> Volver a la lista de negocios
            </Link>
          </div>
          <div className="business-empty-container">
            <p style={{ color: '#dc2626', fontWeight: 600 }}>{error || 'No se encontró el negocio solicitado.'}</p>
            <button
              className="business-action-btn"
              style={{ maxWidth: '200px', margin: '1rem auto 0' }}
              onClick={fetchBusinessAndPitches}
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="business-detail-container">
      <div className="business-detail-page">
        {/* Botón Volver */}
        <div className="business-detail-back-bar">
          <Link to="/businesses" className="business-back-link">
            <FaArrowLeft /> Volver a todos los negocios
          </Link>
        </div>

      {/* Tarjeta de Información General del Negocio */}
      <header className="business-detail-header-card">
        <div className="business-detail-main-info">
          <div className="business-detail-title-group">
            <h1>{business.businessName}</h1>
            <div className="business-detail-meta">
              <span className="business-detail-meta-item">
                <FaMapMarkerAlt className="icon" />
                {business.address}
                {localityName ? ` (${localityName})` : ''}
              </span>

              {depositPercent !== null && (
                <span className="business-deposit-badge">
                  <FaPercent size={11} />
                  Seña para reservar: {depositPercent}%
                </span>
              )}
            </div>
          </div>

          <div className="business-card-rating" style={{ padding: '0.5rem 0.85rem' }}>
            <span className="business-card-rating-num" style={{ fontSize: '1.1rem' }}>
              {business.averageRating ? business.averageRating.toFixed(1) : 'Nuevo'}
            </span>
            {business.averageRating ? (
              <StarRating rating={business.averageRating} size="medium" />
            ) : null}
          </div>
        </div>

        {/* Grilla de Horarios Semanales */}
        <section className="business-schedule-section">
          <h3>
            <FaClock className="icon" style={{ color: '#16a34a' }} />
            Horarios de atención
          </h3>
          <div className="business-schedule-days-grid">
            {SCHEDULE_DAYS.map(({ day, name }) => {
              const dayItem = business.schedule?.find((s) => s.day === day);
              const isOpen =
                dayItem &&
                dayItem.open &&
                dayItem.close &&
                dayItem.open !== dayItem.close;
              const isToday = day === currentScheduleDay;

              return (
                <div
                  key={day}
                  className={`business-schedule-day-box ${isToday ? 'is-today' : ''}`}
                >
                  <div className="business-schedule-day-name">
                    {name} {isToday && '(Hoy)'}
                  </div>
                  <div
                    className={`business-schedule-day-hours ${!isOpen ? 'closed' : ''}`}
                  >
                    {isOpen ? `${dayItem.open} - ${dayItem.close}` : 'Cerrado'}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </header>

      {/* Sección de Canchas Asociadas */}
      <section className="business-pitches-section">
        <h2 className="business-pitches-title">Canchas disponibles</h2>
        <p className="business-pitches-subtitle">
          Selecciona una cancha para verificar los turnos y realizar tu reserva online.
        </p>

        {pitches.length === 0 ? (
          <div className="business-empty-container">
            <FaFutbol size={40} style={{ color: '#9ca3af', marginBottom: '1rem' }} />
            <h3>Este negocio aún no tiene canchas registradas</h3>
            <p>Vuelve más tarde o explora otros predios deportivos disponibles.</p>
          </div>
        ) : (
          <div className="business-pitches-grid">
            {pitches.map((pitch) => (
              <article key={pitch.id} className="pitch-card-item">
                <img
                  src={
                    pitch.imageUrl ||
                    'https://via.placeholder.com/350x200/4a90e2/ffffff?text=Cancha+Deportiva'
                  }
                  alt={`Cancha #${pitch.id}`}
                  className="pitch-card-item-image"
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://via.placeholder.com/350x200/4a90e2/ffffff?text=Cancha+Deportiva';
                  }}
                />

                <div className="pitch-card-item-content">
                  <div className="pitch-card-item-header">
                    <h3 className="pitch-card-item-title">Cancha #{pitch.id}</h3>
                    {pitch.rating ? (
                      <div className="business-card-rating">
                        <span className="business-card-rating-num">
                          {pitch.rating.toFixed(1)}
                        </span>
                        <StarRating rating={pitch.rating} size="small" />
                      </div>
                    ) : null}
                  </div>

                  <div className="pitch-card-item-specs">
                    <div className="pitch-spec-item">
                      <span>📏</span>
                      <span>Tamaño: {pitch.size}</span>
                    </div>
                    <div className="pitch-spec-item">
                      <span>🌿</span>
                      <span>
                        {pitch.groundType
                          ? pitch.groundType.charAt(0).toUpperCase() + pitch.groundType.slice(1)
                          : 'Césped'}
                      </span>
                    </div>
                    <div className="pitch-spec-item">
                      <span>🏠</span>
                      <span>{pitch.roof ? 'Techada' : 'Descubierta'}</span>
                    </div>
                    <div className="pitch-spec-item">
                      <FaCheckCircle style={{ color: '#16a34a' }} size={13} />
                      <span>Habilitada</span>
                    </div>
                  </div>

                  <div className="pitch-card-item-bottom">
                    <div className="pitch-price-container">
                      <span className="pitch-price-label">Precio por hora</span>
                      <span className="pitch-price-val">
                        {formatPrice(pitch.price)}
                      </span>
                    </div>

                    <button
                      className="pitch-reserve-button"
                      onClick={() => navigate(`/makeReservation/${pitch.id}`)}
                    >
                      Reservar turno
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  </div>
  );
};

export default BusinessDetailPage;
