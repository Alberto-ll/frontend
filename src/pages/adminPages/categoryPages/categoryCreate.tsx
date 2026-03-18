import { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../../../static/css/categories/categoryCreate.css';
import type { Category } from "../../../types/categoryType";
import { categoryService } from "../../../services/categoryService";

const CategoryCreate = () => {
  const navigate = useNavigate();
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para el formulario - con valores iniciales vacíos
  const [formData, setFormData] = useState({
    description: '',
    usertype: ''
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

      // Validaciones básicas
      if (!formData.description.trim()) {
        throw new Error('La descripción es obligatoria');
      }
      
      if (!formData.usertype.trim()) {
        throw new Error('El tipo de usuario es obligatorio');
      }

      // Preparar datos para enviar
      const createData : Category = {
        description: formData.description.trim(),
        usertype: formData.usertype.trim()
      };

      categoryService.add(createData)

      alert('Categoría creada con éxito');
      navigate('/admin/categories/getAll');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear categoría');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/categories/getAll');
  };

  return (
    <div className="update-container">
      <h2 className="update-title">Crear Nueva Categoría</h2>
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="update-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="description">Descripción de la Categoría</label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              className="form-input"
              placeholder="Ej: Categoría de administrador del sistema"
              maxLength={150}
            />
            <small className="form-help">
              {formData.description.length > 0 ? (
                formData.description.length >= 5 ? (
                  <span className="input-valid">
                    ✓ Descripción válida ({formData.description.length} caracteres)
                  </span>
                ) : (
                  <span className="input-invalid">
                    ⚠ Faltan {5 - formData.description.length} caracteres más
                  </span>
                )
              ) : (
                <span className="input-help">
                  Ingrese al menos 5 caracteres para la descripción
                </span>
              )}
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="usertype">Tipo de Usuario</label>
            <input
              type="text"
              id="usertype"
              name="usertype"
              value={formData.usertype}
              onChange={handleInputChange}
              required
              className="form-input"
              placeholder="Ej: admin, cliente, moderador, invitado"
              maxLength={50}
            />
            <small className="form-help">
              {formData.usertype.length > 0 ? (
                formData.usertype.length >= 2 ? (
                  <span className="input-valid">
                    ✓ Tipo de usuario: "{formData.usertype}"
                  </span>
                ) : (
                  <span className="input-invalid">
                    ⚠ Faltan {2 - formData.usertype.length} caracteres más
                  </span>
                )
              ) : (
                <span className="input-help">
                  Ingrese el nombre del tipo de usuario (mínimo 2 caracteres)
                </span>
              )}
            </small>
          </div>
        </div>

        {/* Previsualización de la categoría */}
        {formData.description.trim() && formData.usertype.trim() && (
          <div className="form-preview">
            <h3>Vista previa de la categoría:</h3>
            <div className="preview-card">
              <p><strong>Descripción:</strong> {formData.description}</p>
              <p><strong>Tipo de Usuario:</strong> {formData.usertype}</p>
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
            disabled={saving || !formData.description.trim() || !formData.usertype.trim()}
          >
            {saving ? 'Creando...' : 'Crear Categoría'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CategoryCreate;