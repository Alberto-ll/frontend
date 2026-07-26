import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router";
import '../../../static/css/users/userCreate.css';
import { localityService } from '../../../services/index.ts';

const LocalityCreate = () => {
  const navigate = useNavigate();
  const { showNotification } = useOutletContext<{ showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void }>();
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    postal_code: '',
    province: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

      if (!formData.name.trim()) {
        throw new Error('El nombre de la localidad es obligatorio');
      }
      
      if (!formData.postal_code.trim()) {
        throw new Error('El código postal es obligatorio');
      }

      const postalCode = parseInt(formData.postal_code);
      if (isNaN(postalCode) || postalCode <= 0) {
        throw new Error('El código postal debe ser un número válido');
      }
      
      if (!formData.province.trim()) {
        throw new Error('La provincia es obligatoria');
      }

      const createData = {
        name: formData.name.trim(),
        postal_code: postalCode,
        province: formData.province.trim()
      };

      await localityService.add(createData);

      showNotification('Localidad creada con éxito', 'success');
      navigate('/admin/localities/getAll');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear localidad';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/localities/getAll');
  };

  return (
    <div className="update-container">
      <h2 className="update-title">Crear Nueva Localidad</h2>
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
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
            {saving ? 'Creando...' : 'Crear Localidad'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LocalityCreate;
