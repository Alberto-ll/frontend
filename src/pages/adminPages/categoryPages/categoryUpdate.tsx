import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import '../../../static/css/categories/categoryUpdate.css';
import type { Category } from "../../../types/categoryType";
import { categoryService } from "../../../services/categoryService";

const CategoryUpdate = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para el formulario
  const [formData, setFormData] = useState({
    description: '',
    usertype: ''
  });

  const fetchCategory = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if(id){
          const category : Category = await categoryService.getOne(id)
          setCategory(category)
          setFormData({
          description: category.description || '',
          usertype: category.usertype || ''
        });
        }

      } catch (err) {
        console.error('ERROR EN FETCH:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };

    const updateCategory = async (category : Category) => {
      try {
      setSaving(true);
      setError(null);

      categoryService.update(category)

      alert('Categoría actualizada con éxito');
      navigate(`/admin/categories/detail/${id}`);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar categoría');
    } finally {
      setSaving(false);
    }
    }

    useEffect(() => {
      fetchCategory()
    }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const updatedCategory : Category = {
        id,
        description: formData.description.trim(),
        usertype: formData.usertype.trim()
      };

    if(updatedCategory){
      updateCategory(updatedCategory)
    }
  };

  const handleCancel = () => {
    navigate(`/admin/categories/detail/${id}`);
  };

  if (loading) {
    return (
      <div className="update-container">
        <h2 className="update-title">Actualizar Categoría</h2>
        <div className="loading-message">
          <p>Cargando datos de la categoría...</p>
        </div>
      </div>
    );
  }

  if (error && !category) {
    return (
      <div className="update-container">
        <h2 className="update-title">Actualizar Categoría</h2>
        <div className="error-message">
          <p>❌ Error: {error}</p>
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
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
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