import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import '../../../static/css/categories/categoryDetail.css';
import type { BusinessData } from "../../../types/businessType";
import { businessService } from "../../../services/businessService";

const BusinessDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        await fetchBusiness()
        
      } catch (err) {
        console.error('Error in fetchAllData:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar negocio');
      } finally {
        setLoading(false);
      }
    };

    const fetchBusiness = async () => {
      if(id){
        const businessData = await businessService.getOne(id)
        setBusiness(businessData);
      }
    };

  useEffect(() => {
      fetchAllData()
  }, [id]);

  // Función para formatear el porcentaje de depósito
  const formatDepositPercentage = (percentage: number) => {
    return `${(percentage * 100).toFixed(1)}%`;
  };

  // Función para formatear la fecha
  const formatDate = (dateString?: Date) => {
    if (!dateString) return 'No activado';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="detail-container">
        <h2 className="detail-title">Detalle del Negocio</h2>
        <p className="loading-text">Cargando información del negocio...</p>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="detail-container">
        <h2 className="detail-title">Detalle del Negocio</h2>
        <div className="error-message">
          <p>❌ Error: {error}</p>
        </div>
        <button onClick={() => navigate('/admin/business/getAll')} className="back-button">
          Volver a la lista
        </button>
      </div>
    );
  }

  return (
    <div className="detail-container">
      <h2 className="detail-title">🏢 Detalle del Negocio</h2>
      
      <div className="detail-card">
        <div className="business-header">
          <h3 className="business-name">{business.businessName}</h3>
          <span className={`status-badge ${business.active ? 'status-active' : 'status-inactive'}`}>
            {business.active ? '🟢 Activo' : '🔴 Inactivo'}
          </span>
        </div>

        <div className="detail-grid">
          <div className="detail-item">
            <label>ID:</label>
            <span>#{business.id}</span>
          </div>
          
          <div className="detail-item">
            <label>Nombre del Negocio:</label>
            <span className="business-name-text">{business.businessName}</span>
          </div>
          
          <div className="detail-item">
            <label>Dirección:</label>
            <span className="address-text">{business.address}</span>
          </div>
          
          <div className="detail-item">
            <label>Localidad:</label>
            <span className="locality-badge">{typeof business.locality === 'object' ? business.locality.name : business.locality}</span>
          </div>
          
          <div className="detail-item">
            <label>Dueño:</label>
            <span className="owner-badge">{typeof business.owner === 'object' ? business.owner.name : business.owner}</span>
          </div>
          
          <div className="detail-item">
            <label>Rating Promedio:</label>
            <span className="rating-text">{business.averageRating?.toFixed(1) || '0.0'} ⭐</span>
          </div>
          
          <div className="detail-item">
            <label>Depósito de Reserva:</label>
            <span className="deposit-text">{formatDepositPercentage(business.reservationDepositPercentage)}</span>
          </div>
          
          <div className="detail-item">
            <label>Horario de Atención:</label>
            <span className="schedule-text">{business.openingAt} - {business.closingAt}</span>
          </div>
          
          <div className="detail-item">
            <label>Estado:</label>
            <span className={`status-text ${business.active ? 'status-active' : 'status-inactive'}`}>
              {business.active ? 'Activo' : 'Inactivo'}
            </span>
          </div>
          
          <div className="detail-item">
            <label>Fecha de Activación:</label>
            <span className="date-text">{formatDate(business.activatedAt)}</span>
          </div>
        </div>

        {/* Información adicional */}
        <div className="additional-info">
          <h4>📊 Información Adicional</h4>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Horario Comercial:</span>
              <span className="info-value">{business.openingAt} a {business.closingAt}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Política de Depósito:</span>
              <span className="info-value">{formatDepositPercentage(business.reservationDepositPercentage)} por reserva</span>
            </div>
            <div className="info-item">
              <span className="info-label">Satisfacción de Clientes:</span>
              <span className="info-value">{business.averageRating?.toFixed(1) || '0.0'} / 5.0 ⭐</span>
            </div>
          </div>
        </div>
      </div>

      <div className="detail-actions">
        <button 
          onClick={() => navigate('/admin/business/getAll')}
          className="back-button"
        >
          ← Volver a la lista
        </button>
        <Link 
          to={`/admin/business/update/${business.id}`}
          className="edit-button"
        >
          ✏️ Editar Negocio
        </Link>
        <button 
          onClick={() => {
            if (window.confirm('¿Estás seguro de que deseas eliminar este negocio? Esta acción no se puede deshacer.')) {
              console.log('Eliminar negocio:', business.id);
              // Aquí iría la lógica para eliminar el negocio
            }
          }}
          className="delete-button"
        >
          🗑️ Eliminar Negocio
        </button>
      </div>
    </div>
  );
};

export default BusinessDetail;