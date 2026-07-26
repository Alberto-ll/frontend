import { useEffect, useState } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router";
import '../../../static/css/users/userUpdate.css';
import { localityService } from '../../../services/index.ts';

interface Locality {
  id?: number;
  name: string;
  postal_code: number;
  province: string;
  createdAt?: string;
  updatedAt?: string;
}

const LocalityUpdate = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useOutletContext<{ showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void }>();
  
  const [locality, setLocality] = useState<Locality | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    postal_code: '',
    province: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const locality = await localityService.getOne(id!) as Locality;
        setLocality(locality);

        setFormData({
          name: locality.name || '',
          postal_code: locality.postal_code ? String(locality.postal_code) : '',
          province: locality.province || ''
        });

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

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

      const updateData = {
        name: formData.name.trim(),
        postal_code: parseInt(formData.postal_code),
        province: formData.province.trim()
      };

      await localityService.update(id!, updateData);

      showNotification('Localidad actualizada con éxito', 'success');
      navigate(`/admin/localities/getOne/${id}`);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar localidad';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/admin/localities/getOne/${id}`);
  };

  if (loading) {
    return (
      <div className="update-container">
        <h2 className="update-title">Actualizar Localidad</h2>
        <div className="loading-message">
          <p>Cargando datos de la localidad...</p>
        </div>
      </div>
    );
  }

  if (error && !locality) {
    return (
      <div className="update-container">
        <h2 className="update-title">Actualizar Localidad</h2>
        <div className="error-message">
          <p>❌ Error: {error}</p>
        </div>
        <button onClick={() => navigate('/admin/localities/getAll')} className="cancel-button">
          Volver a la lista
        </button>
      </div>
    );
  }

  return (
    <div className="update-container">
      <h2 className="update-title">
        ✏️ Actualizar Localidad: {locality?.name}
      </h2>
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {locality && (
        <div className="current-user-info">
          <h3>📊 Información Actual de la Localidad</h3>
          <div className="info-card">
            <div className="info-item">
              <span className="info-label">Nombre:</span>
              <span className="info-value">{locality.name}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Código Postal:</span>
              <span className="info-value">{locality.postal_code}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Provincia:</span>
              <span className="info-value">{locality.province}</span>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="update-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">Nombre de la Localidad</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="form-input"
              placeholder="Ingrese el nombre de la localidad"
            />
          </div>

          <div className="form-group">
            <label htmlFor="postal_code">Código Postal</label>
            <input
              type="number"
              id="postal_code"
              name="postal_code"
              value={formData.postal_code}
              onChange={handleInputChange}
              required
              className="form-input"
              placeholder="Ej: 1642"
              min="1"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group full-width">
            <label htmlFor="province">Provincia</label>
            <input
              type="text"
              id="province"
              name="province"
              value={formData.province}
              onChange={handleInputChange}
              required
              className="form-input"
              placeholder="Ingrese la provincia"
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
            disabled={saving || !formData.name.trim() || !formData.postal_code.trim() || !formData.province.trim()}
          >
            {saving ? 'Actualizando...' : 'Actualizar Localidad'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LocalityUpdate;
