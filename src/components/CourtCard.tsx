// CourtCard.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Pitch } from '../types/pitchType';

interface CourtCardProps {
  court: Pitch;
}

const CourtCard: React.FC<CourtCardProps> = ({ court }) => {
  const navigate = useNavigate();

  const businessName = typeof court.business === 'object' && court.business !== null
    ? court.business.businessName
    : 'Negocio desconocido';
  
  const businessAddress = typeof court.business === 'object' && court.business !== null
    ? court.business.address
    : '';

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);

    for (let i = 0; i < fullStars; i++) {
      stars.push('★');
    }
    
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push('☆');
    }
    
    return stars.join('');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleReserveClick = () => {
    if (court.id) {
      navigate(`/makeReservation/${court.id}`);
    }
  };

  return (
    <div className="court-card-item">
      <img 
        src={court.imageUrl || 'https://via.placeholder.com/350x200/4a90e2/ffffff?text=Cancha+Deportiva'} 
        alt={`Cancha ${court.id ?? ''}`}
        className="court-card-image"
        onError={(e) => {
          e.currentTarget.src = 'https://via.placeholder.com/350x200/4a90e2/ffffff?text=Cancha+Deportiva';
        }}
      />
      
      <div className="court-card-content">
        <div className="court-card-header">
          <div>
            <h2 className="court-card-name">Cancha #{court.id ?? '?'}</h2>
            <p className="court-card-business">{businessName}</p>
          </div>
          <div className="court-card-rating">
            <span className="court-rating-value">{court.rating.toFixed(1)}</span>
            <span className="court-rating-stars">{renderStars(court.rating)}</span>
          </div>
        </div>
        
        <div className="court-card-details">
          <div className="court-detail-item">
            <span className="court-detail-icon">📏</span>
            <span>Tamaño: {court.size}</span>
          </div>
          <div className="court-detail-item">
            <span className="court-detail-icon">🌿</span>
            <span>{court.groundType}</span>
          </div>
          <div className="court-detail-item">
            <span className="court-detail-icon">🏠</span>
            <span>{court.roof ? 'Con techo' : 'Sin techo'}</span>
          </div>
          {businessAddress && (
            <div className="court-detail-item">
              <span className="court-detail-icon">📍</span>
              <span>{businessAddress}</span>
            </div>
          )}
        </div>
        
        <div className="court-card-price-section">
          <div>
            <span className="court-price-label">Precio por hora:</span>
            <div className="court-price-value">
              {formatPrice(court.price)}
            </div>
          </div>
          <button 
            className="court-reserve-btn"
            onClick={handleReserveClick}
          >
            Reservar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourtCard;