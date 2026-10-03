import React from 'react';
import { useNavigate } from 'react-router';
import { FaMapMarkerAlt, FaClock, FaPercent, FaArrowRight } from 'react-icons/fa';
import type { BusinessData } from '../../types/businessType';
import StarRating from '../StarRating';

interface BusinessCardProps {
  business: BusinessData;
}

export const BusinessCard: React.FC<BusinessCardProps> = ({ business }) => {
  const navigate = useNavigate();

  // Obtener estado de atención de hoy
  const getTodayStatus = () => {
    if (!business.schedule || business.schedule.length === 0) {
      return null;
    }
    const jsDay = new Date().getDay(); // 0: Domingo, 1: Lunes, ..., 6: Sábado
    const scheduleDay = jsDay === 0 ? 7 : jsDay;
    const todaySchedule = business.schedule.find(s => s.day === scheduleDay);

    if (
      !todaySchedule ||
      !todaySchedule.open ||
      !todaySchedule.close ||
      todaySchedule.open === todaySchedule.close
    ) {
      return { isOpen: false, text: 'Cerrado hoy' };
    }

    return {
      isOpen: true,
      text: `Abierto hoy: ${todaySchedule.open} a ${todaySchedule.close} hs`,
    };
  };

  const todayStatus = getTodayStatus();

  // Nombre de localidad
  const localityName =
    typeof business.locality === 'object' && business.locality !== null
      ? business.locality.name
      : undefined;

  // Porcentaje de seña
  const depositPercent =
    typeof business.reservationDepositPercentage === 'number'
      ? Math.round(
          business.reservationDepositPercentage <= 1
            ? business.reservationDepositPercentage * 100
            : business.reservationDepositPercentage
        )
      : null;

  return (
    <div className="business-card">
      <div className="business-card-top">
        <div className="business-card-header-row">
          <h2 className="business-card-name">{business.businessName}</h2>
          <div className="business-card-rating">
            <span className="business-card-rating-num">
              {business.averageRating ? business.averageRating.toFixed(1) : 'Nuevo'}
            </span>
            {business.averageRating ? (
              <StarRating rating={business.averageRating} size="small" />
            ) : null}
          </div>
        </div>

        {todayStatus && (
          <span className={`business-status-badge ${todayStatus.isOpen ? 'open' : 'closed'}`}>
            <FaClock size={12} />
            {todayStatus.text}
          </span>
        )}
      </div>

      <div className="business-card-body">
        <div className="business-info-row">
          <FaMapMarkerAlt className="business-info-icon" />
          <span>
            {business.address}
            {localityName ? ` — ${localityName}` : ''}
          </span>
        </div>

        {depositPercent !== null && (
          <div className="business-info-row">
            <span className="business-deposit-badge">
              <FaPercent size={11} />
              Seña para reservar: {depositPercent}%
            </span>
          </div>
        )}
      </div>

      <div className="business-card-footer">
        <button
          className="business-action-btn"
          onClick={() => navigate(`/businesses/${business.id}`)}
        >
          Ver canchas disponibles
          <FaArrowRight size={13} />
        </button>
      </div>
    </div>
  );
};

export default BusinessCard;
