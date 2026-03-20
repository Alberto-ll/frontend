import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import '../../../static/css/users/userCreate.css'; // Cambiar import
import type { Category } from "../../../types/categoryType";
import { categoryService } from "../../../services/categoryService";
import type { UserData } from "../../../types/userData";
import { userService } from "../../../services/userService";

export const UserCreate = () => {
  const navigate = useNavigate();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para el formulario - con valores iniciales vacíos
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    phoneNumber: '',
    categoryId: '',
    password: ''
  });

  const add = async () => {
    try {
      setSaving(true);
      setError(null);

      if (!formData.name.trim()) {
        throw new Error('El nombre es obligatorio');
      }
      
      if (!formData.surname.trim()) {
        throw new Error('El apellido es obligatorio');
      }
      
      if (!formData.email.trim()) {
        throw new Error('El email es obligatorio');
      }

      if (!formData.password.trim()) {
        throw new Error('La contraseña es obligatoria');
      }

      if (formData.password.trim().length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }
      const createData: UserData = {
        name: formData.name.trim(),
        surname: formData.surname.trim(),
        email: formData.email.trim(),
        password: formData.password.trim(),
        phoneNumber: formData.phoneNumber.trim() || null,
      };

      if(createData.phoneNumber === null) {
        delete createData.phoneNumber;
      }
      if (formData.categoryId && !isNaN(parseInt(formData.categoryId))) {
        createData.category = formData.categoryId;
      }
      
      await userService.add(createData)

      alert('Usuario creado con éxito');
      navigate('/admin/users/getAll');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear usuario');
    } finally {
      setSaving(false);
    }
  }

  const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const categoriesResponse : Category[] = await categoryService.getAll()

        setCategories(categoriesResponse)

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar categorías');
        setCategories([]);
      } finally {
        setLoading(false);
      }
    }
  useEffect(() => {
    fetchCategories();
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
    
    add()
  };

  const handleCancel = () => {
    navigate('/admin/users/getAll');
  };

  if (loading) {
    return (
      <div className="update-container">
        <h2 className="update-title">Crear Nuevo Usuario</h2>
        <div className="loading-message">
          <p>Cargando categorías...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="update-container">
      <h2 className="update-title">Crear Nuevo Usuario</h2>
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
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
              placeholder="usuario@ejemplo.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber">Teléfono</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Ingrese el teléfono (opcional)"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="categoryId">Categoría</label>
            <select
              id="categoryId"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="">Seleccione una categoría (opcional)</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.usertype}
                </option>
              ))}
            </select>
            {categories.length === 0 && (
              <small className="form-help">
                Las categorías no están disponibles, se puede crear el usuario sin categoría
              </small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="form-input"
              placeholder="Ingrese la contraseña"
              minLength={6}
            />
            <small className="form-help">Mínimo 6 caracteres</small>
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
            disabled={saving}
          >
            {saving ? 'Creando...' : 'Crear Usuario'}
          </button>
        </div>
      </form>
    </div>
  );
};