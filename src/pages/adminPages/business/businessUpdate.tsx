import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import '../../../static/css/categories/categoryUpdate.css';
import { businessService, localityService, userService } from '../../../services/index.ts';

interface Business {
  id: number;
  businessName: string;
  address: string;
  averageRating: number;
  reservationDepositPercentage: number;
  active: boolean;
  activatedAt?: Date;
  openingAt: string;
  closingAt: string;
  locality: number | { id: number; name: string };
  owner: number | { id: number; name: string; email: string };
}

interface Locality {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

const BusinessUpdate = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [business, setBusiness] = useState<Business | null>(null);
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [owners, setOwners] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Cargar negocio, localidades y dueños
  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError('ID del negocio no proporcionado');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Cargar negocio, localidades y dueños en paralelo
        const [businessResponseData, localitiesResponseData, ownersResponseData] = await Promise.all([
          businessService.findOne(id),
          localityService.getAll(),
          userService.findAll()
        ]);

        const business = businessResponseData as unknown as Business;
        
        console.log('DATOS DEL NEGOCIO RECIBIDOS:', business);
        setBusiness(business);

        const localitiesArray = Array.isArray(localitiesResponseData) ? localitiesResponseData as unknown as Locality[] : [];
        setLocalities(localitiesArray);

        const ownersArray = Array.isArray(ownersResponseData) ? ownersResponseData as unknown as User[] : [];
        setOwners(ownersArray);

        // Establecer form data con los datos actuales
        const localityId = typeof business.locality === 'object' ? business.locality.id : business.locality;
        const ownerId = typeof business.owner === 'object' ? business.owner.id : business.owner;

        setFormData({
          businessName: business.businessName || '',
          address: business.address || '',
          localityId: localityId?.toString() || '',
          ownerId: ownerId?.toString() || '',
          reservationDepositPercentage: business.reservationDepositPercentage?.toString() || '0.10',
          openingAt: business.openingAt || '08:00',
          closingAt: business.closingAt || '20:00',
          active: business.active || false
        });

      } catch (err) {
        console.error('ERROR EN FETCH:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!id) {
      setError('ID del negocio no disponible');
      return;
    }

    try {
      setSaving(true);
      setError(null);

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

      // NOTA: Se removió la validación del ownerId ya que no se puede editar

      const depositPercentage = parseFloat(formData.reservationDepositPercentage);
      if (isNaN(depositPercentage) || depositPercentage < 0 || depositPercentage > 1) {
        throw new Error('El porcentaje de depósito debe ser entre 0 y 1 (0% a 100%)');
      }

      if (formData.openingAt >= formData.closingAt) {
        throw new Error('La hora de apertura debe ser anterior a la hora de cierre');
      }

      const updateData = {
        id: parseInt(id),
        businessName: formData.businessName.trim(),
        address: formData.address.trim(),
        locality: parseInt(formData.localityId),
        owner: formData.ownerId ? parseInt(formData.ownerId) : undefined,
        reservationDepositPercentage: depositPercentage,
        openingAt: formData.openingAt,
        closingAt: formData.closingAt,
        active: formData.active
      };

      console.log('Datos a enviar al backend:', updateData);

      const result = await businessService.update(id, updateData) as Record<string, unknown>;
      console.log('Respuesta del servidor:', result);

      alert('Negocio actualizado con éxito');
      navigate(`/admin/business/detail/${id}`);
      
    } catch (err) {
      console.error('ERROR COMPLETO:', err);
      setError(err instanceof Error ? err.message : 'Error al actualizar negocio');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (id) {
      navigate(`/admin/businesses/detail/${id}`);
    } else {
      navigate('/admin/businesses/getAll');
    }
  };

  // Función para obtener el nombre de la localidad
  const getLocalityName = (locality: number | { id: number; name: string }): string => {
    if (typeof locality === 'object' && locality !== null) {
      return locality.name;
    } else if (typeof locality === 'number') {
      const foundLocality = localities.find(l => l.id === locality);
      return foundLocality?.name || `ID: ${locality}`;
    }
    return 'N/A';
  };

  // Función para obtener el nombre del dueño
  const getOwnerName = (owner: number | { id: number; name: string; email: string }): string => {
    if (typeof owner === 'object' && owner !== null) {
      return owner.name || owner.email || 'N/A';
    } else if (typeof owner === 'number') {
      const foundOwner = owners.find(o => o.id === owner);
      return foundOwner?.name || foundOwner?.email || `ID: ${owner}`;
    }
    return 'N/A';
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
        <button onClick={() => navigate('/admin/businesses/getAll')} className="cancel-button">
          Volver a la lista
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="update-container">
        <h2 className="update-title">Actualizar Negocio</h2>
        <div className="loading-message">
          <p>Cargando datos del negocio...</p>
        </div>
      </div>
    );
  }

  if (error && !business) {
    return (
      <div className="update-container">
        <h2 className="update-title">Actualizar Negocio</h2>
        <div className="error-message">
          <p>❌ Error: {error}</p>
        </div>
        <button onClick={() => navigate('/admin/businesses/getAll')} className="cancel-button">
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
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

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
                {getLocalityName(business.locality)}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Dueño:</span>
              <span className="info-value category-highlight">
                {getOwnerName(business.owner)}
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
              {localities.map(locality => (
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
              value={business ? getOwnerName(business.owner) : ''}
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
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="save-button"
            disabled={saving || !formData.businessName.trim() || !formData.address.trim() || !formData.localityId}
          >
            {saving ? 'Actualizando...' : 'Actualizar Negocio'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BusinessUpdate;