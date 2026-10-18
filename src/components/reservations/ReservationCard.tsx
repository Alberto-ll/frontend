import React from 'react';
import { FaStore, FaFutbol, FaCalendarAlt, FaClock, FaTimes, FaStar } from 'react-icons/fa';
import type { Reservation } from '../../types/reservationType';
import StarRating from '../StarRating';
import '../../static/css/components/ReservationCard.css';

interface ReservationCardProps {
  reservation: Reservation;
  onCancel?: (id: number) => void;
  onRate?: (id: number) => void;
}

const STATUS_LABELS: Record<string, string> = {
  pendiente: 'Pendiente',
  'en curso': 'En curso',
  completada: 'Completada',
  ausente: 'Ausente',
  cancelada: 'Cancelada',
};

const STATUS_CLASSES: Record<string, string> = {
  pendiente: 'status-pending',
  'en curso': 'status-confirmed',
  completada: 'status-completed',
  ausente: 'status-absent',
  cancelada: 'status-cancelled',
};

const formatDate = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const formatTime = (time: string): string => time.length >= 5 ? time.slice(0, 5) : time;

const ReservationCard: React.FC<ReservationCardProps> = ({ reservation, onCancel, onRate }) => {
  const status = reservation.status ?? 'pendiente';
  const businessName =
    typeof reservation.pitch?.business === 'object' &&
    reservation.pitch.business !== null &&
    'businessName' in reservation.pitch.business
      ? reservation.pitch.business.businessName
      : 'Negocio';
  const pitchLabel = `Cancha ${reservation.pitch?.id ?? ''}`;

  const canCancel = status === 'pendiente' || status === 'en curso';
  const canRate = status === 'completada' && !reservation.pitchRating;

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

      {(canCancel || canRate) && (
        <div className="reservation-card__footer">
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
