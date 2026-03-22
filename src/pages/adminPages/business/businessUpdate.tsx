import { useState } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import '../../../static/css/categories/categoryUpdate.css';
import { businessService } from "../../../services/businessService";
import type { BusinessData } from "../../../types/businessType";
import { useCrud } from "../../../hooks/useCrud";
import { localityService } from "../../../services/localityService";
import { userService } from "../../../services/userService";

const BusinessUpdate = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { showNotification } = useOutletContext<{ showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void }>();

  const {loading:saving, error:bussError, execute: updateBusiness} = useCrud(() => {
    const businessData : BusinessData = {
        id: Number(id),
        businessName: formData.businessName.trim(),
        address: formData.address.trim(),
        locality: parseInt(formData.localityId), 
        owner: parseInt(formData.ownerId), 
        reservationDepositPercentage: parseFloat(formData.reservationDepositPercentage),
        openingAt: formData.openingAt,
        closingAt: formData.closingAt,
        active: false, 
        averageRating: 0.0
      }
      return businessService.update(businessData)}, {manual:true})
  
  const {data: business} = useCrud(() => businessService.getOne(id!))

  // cargar localidades y dueños
    const {loading : locLoading, error : locError, data : localities} = useCrud(() => localityService.getAll())
    const {loading : usLoading, error : usError} = useCrud(() => userService.getAll())


  // Estados para el formulario
  const [formData, setFormData] = useState({
    businessName: '',
    address: '',
    localityId: '',
    ownerId: '',
    reservationDepositPercentage: '0.10',
    openingAt: '08:00',
    closingAt: '20:00',
    active: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
      // Validaciones
      if (!formData.businessName.trim()) {
        throw new Error('El nombre del negocio es obligatorio');
      }
      
      if (!formData.address.trim()) {
        throw new Error('La dirección es obligatoria');
      }

      if (!formData.localityId) {
        throw new Error('Debe seleccionar una localidad');
      }

      const depositPercentage = parseFloat(formData.reservationDepositPercentage);
      if (isNaN(depositPercentage) || depositPercentage < 0 || depositPercentage > 1) {
        throw new Error('El porcentaje de depósito debe ser entre 0 y 1 (0% a 100%)');
      }

      if (formData.openingAt >= formData.closingAt) {
        throw new Error('La hora de apertura debe ser anterior a la hora de cierre');
      }

      updateBusiness()

      if(!bussError){
        setTimeout(() => {
            showNotification('¡Negocio creado con éxito!', 'success')
            navigate('/admin/business/detail/'+id);
          }
          ,500)
      }else{
        showNotification('¡No se ha podido actualizar el negocio!', 'error')
      }
  };

  const handleCancel = () => {
    if (id) {
      navigate(`/admin/business/detail/${id}`);
    } else {
      navigate('/admin/business/getAll');
    }
  };

  // Calcular porcentaje en formato legible
  const depositPercentageDisplay = (parseFloat(formData.reservationDepositPercentage) * 100).toFixed(1);

  if (!id) {
    return (
      <div className="update-container">
        <h2 className="update-title">Actualizar Negocio</h2>
        <div className="error-message">
          <p>❌ Error: No se proporcionó un ID válido para el negocio</p>
        </div>
        <button onClick={() => navigate('/admin/business/getAll')} className="cancel-button">
          Volver a la lista
        </button>
      </div>
    );
  }

  if (locLoading || usLoading) {
    return (
      <div className="update-container">
        <h2 className="update-title">Actualizar Negocio</h2>
        <div className="loading-message">
          <p>Cargando datos del negocio...</p>
        </div>
      </div>
    );
  }

  if (bussError && !business) {
    return (
      <div className="update-container">
        <h2 className="update-title">Actualizar Negocio</h2>
        <div className="error-message">
          <p>❌ Error: {bussError}</p>
        </div>
        <button onClick={() => navigate('/admin/business/getAll')} className="cancel-button">
          Volver a la lista
        </button>
      </div>
    );
  }

  if (locError || usError) {
    return (
      <div className="update-container">
        <h2 className="update-title">Actualizar Negocio</h2>
        <div className="error-message">
          <p>❌ Error cargando datos iniciales de dueños y localidades</p>
        </div>
        <button onClick={() => navigate('/admin/business/getAll')} className="cancel-button">
          Volver a la lista
        </button>
      </div>
    );
  }

  return (
    <div className="update-container">
      <h2 className="update-title">
        ✏️ Actualizar Negocio: {business?.businessName}
      </h2>

      {/* Información actual del negocio */}
      {business && (
        <div className="current-category-info">
          <h3>📊 Información Actual del Negocio</h3>
          <div className="info-card">
            <div className="info-item">
              <span className="info-label">ID:</span>
              <span className="info-value">#{business.id}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Nombre:</span>
              <span className="info-value">{business.businessName}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Dirección:</span>
              <span className="info-value">{business.address}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Localidad:</span>
              <span className="info-value category-highlight">
                {business.locality.name}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Dueño:</span>
              <span className="info-value category-highlight">
                {business.owner.name}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Estado:</span>
              <span className={`info-value ${business.active ? 'status-active' : 'status-inactive'}`}>
                {business.active ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="update-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="businessName">Nombre del Negocio</label>
            <input
              type="text"
              id="businessName"
              name="businessName"
              value={formData.businessName}
              onChange={handleInputChange}
              required
              className="form-input"
              placeholder="Ej: Canchas Deportivas XYZ"
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Dirección</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
              className="form-input"
              placeholder="Ej: Calle Principal 123"
              maxLength={200}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="localityId">Localidad</label>
            <select
              id="localityId"
              name="localityId"
              value={formData.localityId}
              onChange={handleInputChange}
              required
              className="form-input"
            >
              <option value="">Seleccione una localidad</option>
              {localities && localities.map(locality => (
                <option key={locality.id} value={locality.id}>
                  {locality.name}
                </option>
              ))}
            </select>
          </div>

          {/* Campo de dueño deshabilitado - solo lectura */}
          <div className="form-group">
            <label htmlFor="ownerId">Dueño del Negocio</label>
            <input
              type="text"
              id="ownerId"
              value={business ? business.owner.name : ''}
              className="form-input"
              disabled
              readOnly
              style={{backgroundColor: '#f5f5f5', cursor: 'not-allowed'}}
            />
            <small className="form-help">
              ⚠ El dueño del negocio no se puede modificar
            </small>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="reservationDepositPercentage">
              Porcentaje de Depósito de Reserva ({depositPercentageDisplay}%)
            </label>
            <input
              type="range"
              id="reservationDepositPercentage"
              name="reservationDepositPercentage"
              value={formData.reservationDepositPercentage}
              onChange={handleInputChange}
              min="0"
              max="1"
              step="0.05"
              className="form-input"
            />
            <small className="form-help">
              Porcentaje del total que se cobra como depósito al hacer una reserva (0% a 100%)
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="active">Estado del Negocio</label>
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="active"
                name="active"
                checked={formData.active}
                onChange={handleInputChange}
                className="form-checkbox"
              />
              <label htmlFor="active" className="checkbox-label">
                Negocio activo
              </label>
            </div>
            <small className="form-help">
              {formData.active ? (
                <span className="input-valid">✓ El negocio estará activo</span>
              ) : (
                <span className="input-warning">⚠ El negocio estará inactivo</span>
              )}
            </small>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="openingAt">Hora de Apertura</label>
            <input
              type="time"
              id="openingAt"
              name="openingAt"
              value={formData.openingAt}
              onChange={handleInputChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="closingAt">Hora de Cierre</label>
            <input
              type="time"
              id="closingAt"
              name="closingAt"
              value={formData.closingAt}
              onChange={handleInputChange}
              required
              className="form-input"
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={handleCancel}
            className="cancel-button"
            disabled={!saving}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="save-button"
            disabled={!saving || !formData.businessName.trim() || !formData.address.trim() || !formData.localityId}
          >
            {!saving ? 'Actualizando...' : 'Actualizar Negocio'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BusinessUpdate;