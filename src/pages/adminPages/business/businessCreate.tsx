import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router";
import '../../../static/css/categories/categoryCreate.css';
import { localityService, userService, businessService } from '../../../services/index.ts';

interface Locality {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

const BusinessCreate = () => {
  const navigate = useNavigate();
  const { showNotification } = useOutletContext<{ showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void }>();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  // Estados para el formulario
  const [formData, setFormData] = useState({
    businessName: '',
    address: '',
    localityId: '',
    ownerId: '',
    reservationDepositPercentage: '0.10',
    openingAt: '08:00',
    closingAt: '20:00'
  });

  // Estados para datos de selección
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [owners, setOwners] = useState<User[]>([]);

  // Cargar localidades y dueños disponibles
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoadingData(true);

        // Cargar localidades
        const localitiesData = await localityService.getAll();
        const localitiesArray = Array.isArray(localitiesData) ? localitiesData as unknown as Locality[] : [];
        setLocalities(localitiesArray);

        const ownersData = await userService.findAll();
        const ownersArray = Array.isArray(ownersData) ? ownersData as unknown as User[] : [];
        setOwners(ownersArray);

      } catch (err) {
        setError('Error al cargar datos necesarios: ' + (err instanceof Error ? err.message : 'Error desconocido'));
      } finally {
        setLoadingData(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);

      // Validaciones básicas
      if (!formData.businessName.trim()) {
        throw new Error('El nombre del negocio es obligatorio');
      }
      
      if (!formData.address.trim()) {
        throw new Error('La dirección es obligatoria');
      }

      if (!formData.localityId) {
        throw new Error('Debe seleccionar una localidad');
      }

      if (!formData.ownerId) {
        throw new Error('Debe seleccionar un dueño');
      }

      const depositPercentage = parseFloat(formData.reservationDepositPercentage);
      if (isNaN(depositPercentage) || depositPercentage < 0 || depositPercentage > 1) {
        throw new Error('El porcentaje de depósito debe ser entre 0 y 1 (0% a 100%)');
      }

      // Validar horarios
      if (formData.openingAt >= formData.closingAt) {
        throw new Error('La hora de apertura debe ser anterior a la hora de cierre');
      }

      // Preparar datos para enviar - CORREGIDO para usar la estructura correcta
      const createData = {
        businessName: formData.businessName.trim(),
        address: formData.address.trim(),
        locality: parseInt(formData.localityId), // Enviar solo el ID como número
        owner: parseInt(formData.ownerId), // Enviar solo el ID como número
        reservationDepositPercentage: depositPercentage,
        openingAt: formData.openingAt, // Añadir segundos si es necesario
        closingAt: formData.closingAt, // Añadir segundos si es necesario
        active: false, // Por defecto inactivo hasta que un admin lo active
        averageRating: 0.0
      };

      await businessService.add(createData);
      
      showNotification('Negocio creado con éxito. Debe ser activado por un administrador.', 'success');
      navigate('/admin/business/getAll');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear negocio');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/business/getAll');
  };

  // Calcular porcentaje en formato legible
  const depositPercentageDisplay = (parseFloat(formData.reservationDepositPercentage) * 100).toFixed(1);

  if (loadingData) {
    return (
      <div className="update-container">
        <h2 className="update-title">Crear Nuevo Negocio</h2>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="update-container">
      <h2 className="update-title">Crear Nuevo Negocio</h2>
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
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
            <small className="form-help">
              {formData.businessName.length > 0 ? (
                formData.businessName.length >= 3 ? (
                  <span className="input-valid">
                    ✓ Nombre válido ({formData.businessName.length} caracteres)
                  </span>
                ) : (
                  <span className="input-invalid">
                    ⚠ Faltan {3 - formData.businessName.length} caracteres más
                  </span>
                )
              ) : (
                <span className="input-help">
                  Ingrese al menos 3 caracteres para el nombre del negocio
                </span>
              )}
            </small>
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
            <small className="form-help">
              {formData.address.length > 0 ? (
                formData.address.length >= 5 ? (
                  <span className="input-valid">
                    ✓ Dirección válida
                  </span>
                ) : (
                  <span className="input-invalid">
                    ⚠ Dirección muy corta
                  </span>
                )
              ) : (
                <span className="input-help">
                  Ingrese la dirección completa del negocio
                </span>
              )}
            </small>
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
            <small className="form-help">
              {formData.localityId ? (
                <span className="input-valid">
                  ✓ Localidad seleccionada
                </span>
              ) : (
                <span className="input-help">
                  Seleccione la localidad donde se encuentra el negocio
                </span>
              )}
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="ownerId">Dueño del Negocio</label>
            <select
              id="ownerId"
              name="ownerId"
              value={formData.ownerId}
              onChange={handleInputChange}
              required
              className="form-input"
            >
              <option value="">Seleccione un dueño</option>
              {owners.map(owner => (
                <option key={owner.id} value={owner.id}>
                  {owner.name} ({owner.email})
                </option>
              ))}
            </select>
            <small className="form-help">
              {formData.ownerId ? (
                <span className="input-valid">
                  ✓ Dueño seleccionado
                </span>
              ) : (
                <span className="input-help">
                  Seleccione el usuario que será dueño de este negocio
                </span>
              )}
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
            <small className="form-help">
              Horario de apertura del negocio
            </small>
          </div>
        </div>

        <div className="form-row">
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
            <small className="form-help">
              Horario de cierre del negocio
            </small>
          </div>

          <div className="form-group">
            <label className="info-message">
              ⓘ Estado del Negocio
            </label>
            <div className="preview-card" style={{marginTop: '0.5rem', padding: '1rem'}}>
              <p><strong>Estado inicial:</strong> <span className="input-invalid">Inactivo</span></p>
              <small>El negocio deberá ser activado por un administrador antes de poder operar.</small>
            </div>
          </div>
        </div>

        {/* Previsualización del negocio */}
        {(formData.businessName.trim() || formData.address.trim() || formData.localityId || formData.ownerId) && (
          <div className="form-preview">
            <h3>Vista previa del negocio:</h3>
            <div className="preview-card">
              <p><strong>Nombre:</strong> {formData.businessName || 'No especificado'}</p>
              <p><strong>Dirección:</strong> {formData.address || 'No especificada'}</p>
              <p><strong>Localidad:</strong> {localities.find(l => l.id === parseInt(formData.localityId))?.name || 'No seleccionada'}</p>
              <p><strong>Dueño:</strong> {owners.find(o => o.id === parseInt(formData.ownerId))?.name || 'No seleccionado'}</p>
              <p><strong>Depósito:</strong> {depositPercentageDisplay}%</p>
              <p><strong>Horario:</strong> {formData.openingAt} - {formData.closingAt}</p>
              <p><strong>Estado:</strong> <span className="input-invalid">Inactivo (requiere activación)</span></p>
            </div>
          </div>
        )}

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
            disabled={saving || !formData.businessName.trim() || !formData.address.trim() || !formData.localityId || !formData.ownerId}
          >
            {saving ? 'Creando...' : 'Crear Negocio'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BusinessCreate;