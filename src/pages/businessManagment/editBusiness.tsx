import { useEffect, useState, useCallback } from "react";
import { useNavigate, useOutletContext, Navigate } from "react-router";
import '../../static/css/categories/categoryUpdate.css';
import { businessService, localityService } from '../../services/index.ts';
import { ScheduleEditor } from '../../components/ScheduleEditor';
import type { ScheduleItem } from '../../components/ScheduleEditor';
import { useAuth } from '../../components/Auth.tsx';
import { errorHandler } from '../../types/apiError.ts';

interface Business {
  id: number;
  businessName: string;
  address: string;
  averageRating: number;
  reservationDepositPercentage: number;
  active: boolean;
  schedule: ScheduleItem[];
  locality: number | { id: number; name: string };
  owner: number | { id: number; name: string; email: string };
}

interface Locality {
  id: number;
  name: string;
}

const EditBusiness = () => {
  const navigate = useNavigate();
  const { showNotification } = useOutletContext<{ showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void }>();
  const { userData, isLoading: authLoading } = useAuth();

  const [business, setBusiness] = useState<Business | null>(null);
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    businessName: '',
    address: '',
    localityId: '',
    reservationDepositPercentage: '0.10',
  });

  const [schedule, setSchedule] = useState<ScheduleItem[]>([
    { day: 1, open: null, close: null },
    { day: 2, open: null, close: null },
    { day: 3, open: null, close: null },
    { day: 4, open: null, close: null },
    { day: 5, open: null, close: null },
    { day: 6, open: null, close: null },
    { day: 7, open: null, close: null },
  ]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!userData?.id) {
        throw new Error('No se pudo obtener el ID del usuario');
      }

      // Cargar negocio del dueño
      const businessData = await businessService.findByOwnerId(userData.id) as unknown as Business;
      const singleBusiness = Array.isArray(businessData) ? businessData[0] : businessData;

      if (!singleBusiness?.id) {
        throw new Error('No se encontró un negocio asociado a tu cuenta');
      }

      setBusiness(singleBusiness);

      // Cargar localidades
      const localitiesData = await localityService.getAll();
      const localitiesArray = Array.isArray(localitiesData) ? localitiesData as unknown as Locality[] : [];
      setLocalities(localitiesArray);

      // Poblar formulario
      const localityId = typeof singleBusiness.locality === 'object'
        ? singleBusiness.locality.id
        : singleBusiness.locality;

      setFormData({
        businessName: singleBusiness.businessName || '',
        address: singleBusiness.address || '',
        localityId: localityId?.toString() || '',
        reservationDepositPercentage: singleBusiness.reservationDepositPercentage?.toString() || '0.10',
      });

      // Cargar schedule existente
      if (singleBusiness.schedule && singleBusiness.schedule.length === 7) {
        setSchedule(singleBusiness.schedule);
      }

    } catch (err: any) {
      if (err?._status === 404) {
        showNotification('No tienes un negocio registrado aún', 'warning');
      } else {
        setError(err instanceof Error ? err.message : 'Error al cargar datos');
        showNotification(errorHandler(err), 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [userData, showNotification]);

  useEffect(() => {
    if (!authLoading) {
      fetchData();
    }
  }, [authLoading, fetchData]);

  if (authLoading) {
    return <div>Cargando...</div>;
  }

  if (!userData) {
    alert('Sesión no iniciada');
    return <Navigate to="/login" />;
  }

  if (userData.category !== "business_owner" && userData.category !== "admin") {
    return <Navigate to="/" />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!business?.id) {
      setError('No se encontró el negocio');
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

      const depositPercentage = parseFloat(formData.reservationDepositPercentage);
      if (isNaN(depositPercentage) || depositPercentage < 0 || depositPercentage > 1) {
        throw new Error('El porcentaje de depósito debe ser entre 0 y 1 (0% a 100%)');
      }

      if (!schedule || schedule.length !== 7) {
        throw new Error('El schedule debe tener exactamente 7 días');
      }

      const updateData = {
        businessName: formData.businessName.trim(),
        address: formData.address.trim(),
        locality: parseInt(formData.localityId),
        reservationDepositPercentage: depositPercentage,
        schedule,
      };

      await businessService.update(business.id, updateData);

      showNotification('Negocio actualizado con éxito', 'success');
      navigate('/myBusiness/getAll/');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar negocio');
      showNotification(err instanceof Error ? err.message : 'Error al actualizar negocio', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/myBusiness/getAll/');
  };

  const depositPercentageDisplay = (parseFloat(formData.reservationDepositPercentage) * 100).toFixed(1);

  if (loading) {
    return (
      <div className="update-container">
        <h2 className="update-title">Editar Mi Negocio</h2>
        <div className="loading-message">
          <p>Cargando datos del negocio...</p>
        </div>
      </div>
    );
  }

  if (error && !business) {
    return (
      <div className="update-container">
        <h2 className="update-title">Editar Mi Negocio</h2>
        <div className="error-message">
          <p>Error: {error}</p>
        </div>
        <button onClick={() => navigate('/myBusiness/getAll/')} className="cancel-button">
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="update-container">
      <h2 className="update-title">
        Editar Mi Negocio: {business?.businessName}
      </h2>

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
        </div>

        <div className="form-row">
          <div className="form-group" style={{ flex: 1 }}>
            <ScheduleEditor value={schedule} onChange={setSchedule} />
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
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditBusiness;
