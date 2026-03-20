import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import '../../../static/css/users/userUpdate.css';
import type { UserData } from "../../../types/userData";
import type { Category } from "../../../types/categoryType";
import { categoryService } from "../../../services/categoryService";
import { userService } from "../../../services/userService";

const UserUpdate = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [user, setUser] = useState<UserData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para el formulario
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    phoneNumber: '',
    category: ''
  });

  const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = JSON.parse(localStorage.getItem('user') || '{}').token;
        
        if (!token) {
          throw new Error('No se encontró token de autenticación');
        }

        // Cargar en paralelo usando Promise.all
        const [categoryResponse, userResponse] = await Promise.all([categoryService.getAll(),
          userService.getOne(id!)]);

        setCategories(categoryResponse);
        
        setUser(userResponse);

        setFormData({
          name: user!.name || '',
          surname: user!.surname || '',
          email: user!.email || '',
          phoneNumber: user!.phoneNumber || '',
          category: typeof user?.category === 'object' ? user?.category.description : user?.category ?? ''
        });

      } catch (err) {
        console.error('ERROR EN FETCH:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar datos');
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
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

  const update = async () => 
  {
    try {
      setSaving(true);
      setError(null);


      const updateData : UserData = {
        id: typeof id === 'number' ? id : Number(id),
        name: formData.name.trim(),
        surname: formData.surname.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim() || undefined,
        category: formData.category.trim()
      };

      await userService.update(updateData)

      alert('Usuario actualizado con éxito');
      navigate(`/admin/users/detail/${id}`);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar usuario');
    } finally {
      setSaving(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    update()
  };

  const handleCancel = () => {
    navigate(`/admin/users/detail/${id}`);
  };


  if (loading) {
    return (
      <div className="update-container">
        <h2 className="update-title">Actualizar Usuario</h2>
        <div className="loading-message">
          <p>Cargando datos del usuario...</p>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="update-container">
        <h2 className="update-title">Actualizar Usuario</h2>
        <div className="error-message">
          <p>❌ Error: {error}</p>
        </div>
        <button onClick={() => navigate('/admin/users/getAll')} className="cancel-button">
          Volver a la lista
        </button>
      </div>
    );
  }

  return (
    <div className="update-container">
      <h2 className="update-title">
        ✏️ Actualizar Usuario: {user?.name} {user?.surname}
      </h2>
      
      {user?.category && (
        <div className="user-subtitle">
          <span className="current-category-subtitle">
            📋 Categoría actual: {typeof user.category === 'object' ? user.category.description + user.category.usertype : (<strong>user.category</strong>)}
          </span>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {user?.category && (
        <div className="current-user-info">
          <h3>📊 Información Actual del Usuario</h3>
          <div className="info-card">
            <div className="info-item">
              <span className="info-label">Nombre Completo:</span>
              <span className="info-value">{user.name} {user.surname}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Email:</span>
              <span className="info-value">{user.email}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Categoría Actual:</span>
              <span className="info-value category-highlight">
               {typeof user.category === 'object' ? user.category.description + user.category.usertype : (<strong>user.category</strong>)}
              </span>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="update-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">Nombre</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="form-input"
              placeholder="Ingrese el nombre"
            />
          </div>

          <div className="form-group">
            <label htmlFor="surname">Apellido</label>
            <input
              type="text"
              id="surname"
              name="surname"
              value={formData.surname}
              onChange={handleInputChange}
              required
              className="form-input"
              placeholder="Ingrese el apellido"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="form-input"
              placeholder="ejemplo@correo.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber">Teléfono (opcional)</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              className="form-input"
              placeholder="+54 11 1234-5678"
            />
          </div>
        </div>

        {/* Campo de categoría */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="categoryId">Categoría del Usuario</label>
            
            <select
              id="categoryId"
              name="categoryId"
              value={formData.category}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="">Cambiar a: Sin categoría</option>
              {Array.isArray(categories) && categories.length > 0 ? (
                categories.map(category => (
                  <option key={category.id} value={category.id}>
                    Cambiar a: {category.description} ({category.usertype})
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  {categories.length === 0 ? 'No hay categorías disponibles' : 'Cargando categorías...'}
                </option>
              )}
            </select>
            
            <small className="form-help">
              <span className="input-help">
                Seleccione una nueva categoría si desea cambiarla
              </span>
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
            disabled={saving || !formData.name.trim() || !formData.surname.trim() || !formData.email.trim()}
          >
            {saving ? 'Actualizando...' : 'Actualizar Usuario'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserUpdate;