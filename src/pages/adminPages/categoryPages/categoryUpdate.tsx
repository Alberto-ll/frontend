import { useState } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import '../../../static/css/categories/categoryUpdate.css';
import type { Category } from "../../../types/categoryType";
import { categoryService } from "../../../services/categoryService";
import { useCrud } from "../../../hooks/useCrud";

const CategoryUpdate = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { showNotification } = useOutletContext<{ showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void }>();

  const {error : fetchError, loading : fetchLoading, data : category} = useCrud(() => categoryService.getOne(id!))

  const {error : savingError, loading: saving, execute : updateCategory} = useCrud(() => 
    {const updatedCategory : Category = {
          id,
          description: formData.description.trim(),
          usertype: formData.usertype.trim()
        }
      return categoryService.update(updatedCategory)
    }
      , {manual:true}
  )

  // Estados para el formulario
  const [formData, setFormData] = useState({
    description: '',
    usertype: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if(!Object.values(formData).includes('')){
      updateCategory()

      if(!savingError){
        setTimeout(() => {
          showNotification('Categoría actualizada con éxito', 'success');
          navigate(`/admin/categories/detail/${id}`);
        }, 500);
      }else{
        showNotification('¡No se ha podido actualizar la categoría!', 'error')
      }
    }else{
      showNotification('¡Todos los campos son obligatorios!', 'warning')
    }
  };

  const handleCancel = () => {
    navigate(`/admin/categories/detail/${id}`);
  };

  if (fetchLoading) {
    return (
      <div className="update-container">
        <h2 className="update-title">Actualizar Categoría</h2>
        <div className="loading-message">
          <p>Cargando datos de la categoría...</p>
        </div>
      </div>
    );
  }

  if (fetchError && !category) {
    return (
      <div className="update-container">
        <h2 className="update-title">Actualizar Categoría</h2>
        <div className="error-message">
          <p>❌ Error: {fetchError}</p>
        </div>
        <button onClick={() => navigate('/admin/categories/getAll')} className="cancel-button">
          Volver a la lista
        </button>
      </div>
    );
  }

  return (
    <div className="update-container">
      <h2 className="update-title">
        ✏️ Actualizar Categoría: {category?.description}
      </h2>
      
      {/* Mostrar información actual */}
      {category && (
        <div className="category-subtitle">
          <span className="current-category-subtitle">
            📋 Tipo actual: <strong>{category.usertype}</strong>
          </span>
        </div>
      )}
      
      {savingError && (
        <div className="error-message">
          <p>{savingError}</p>
        </div>
      )}

      {/* Información actual de la categoría */}
      {category && (
        <div className="current-category-info">
          <h3>📊 Información Actual de la Categoría</h3>
          <div className="info-card">
            <div className="info-item">
              <span className="info-label">ID:</span>
              <span className="info-value">#{category.id}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Descripción:</span>
              <span className="info-value">{category.description}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Tipo de Usuario:</span>
              <span className="info-value category-highlight">
                {category.usertype}
              </span>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="update-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="description">Descripción</label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              className="form-input"
              placeholder="Ingrese la descripción de la categoría"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="usertype">Tipo de Usuario</label>
            
            {/* Mostrar tipo actual si existe */}
            {category?.usertype && (
              <div className="current-category">
                <span>📋 Tipo actual: <strong>{category.usertype}</strong></span>
              </div>
            )}
            
            <input
              type="text"
              id="usertype"
              name="usertype"
              value={formData.usertype}
              onChange={handleInputChange}
              required
              className="form-input"
              placeholder="Ej: admin, user, manager, employee, etc."
            />
            
            <small className="form-help">
              {formData.usertype ? (
                <span className="input-valid">
                  ✓ Tipo ingresado: <strong>{formData.usertype}</strong>
                </span>
              ) : (
                <span className="input-help">
                  Ingrese el tipo de usuario para esta categoría (texto libre)
                </span>
              )}
            </small>
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
            disabled={saving || !formData.description.trim() || !formData.usertype.trim()}
          >
            {saving ? 'Actualizando...' : 'Actualizar Categoría'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CategoryUpdate;