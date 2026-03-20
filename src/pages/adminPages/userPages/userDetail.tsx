import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import '../../../static/css/users/userDetail.css';
import type { UserData } from "../../../types/userData";
import { userService } from "../../../services/userService";

const UserDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const userData : UserData = await userService.getOne(id!)
        
        setUser(userData);
      } catch (err) {
        console.error('Error en fetchUser:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar usuario');
      } finally {
        setLoading(false);
      }
    }

  useEffect(() => {
    if (id) {
      fetchUser();
    } else {
      setError('No se proporcionó ID de usuario');
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="detail-container">
        <h2 className="detail-title">Detalle del Usuario</h2>
        <p className="loading-text">Cargando información del usuario...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="detail-container">
        <h2 className="detail-title">Detalle del Usuario</h2>
        <div className="error-message">
          <p>❌ Error: {error}</p>
        </div>
        <button onClick={() => navigate('/admin/users/getAll')} className="back-button">
          Volver a la lista
        </button>
      </div>
    );
  }

  // Función para obtener el nombre de la categoría
  const getCategoryDisplay = () => {
    if (typeof user.category === 'object') {
      return user.category.description;
    }else{
      return user.category
    }
  };

  return (
    <div className="detail-container">
      <h2 className="detail-title">👤 Detalle del Usuario</h2>
      
      <div className="detail-card">
        <div className="detail-grid">
          <div className="detail-item">
            <label>ID:</label>
            <span>{user.id || 'N/A'}</span>
          </div>
          
          <div className="detail-item">
            <label>Nombre:</label>
            <span>{user.name || 'N/A'}</span>
          </div>
          
          <div className="detail-item">
            <label>Apellido:</label>
            <span>{user.surname || 'N/A'}</span>
          </div>
          
          <div className="detail-item">
            <label>Email:</label>
            <span>{user.email || 'N/A'}</span>
          </div>
          
          <div className="detail-item">
            <label>Teléfono:</label>
            <span>{user.phoneNumber || 'No especificado'}</span>
          </div>
          
          <div className="detail-item">
            <label>Categoría:</label>
            <span>{getCategoryDisplay()}</span>
          </div>
          
          <div className="detail-item">
            <label>Fecha de Registro:</label>
            <span>{user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}</span>
          </div>
          
          <div className="detail-item">
            <label>Última Actualización:</label>
            <span>{user.updatedAt ? new Date(user.updatedAt).toLocaleString() : 'Sin actualizaciones'}</span>
          </div>
        </div>
      </div>

      <div className="detail-actions">
        <button 
          onClick={() => navigate('/admin/users/getAll')} 
          className="back-button"
        >
          ← Volver a la lista
        </button>
        <Link 
          to={`/admin/users/update/${user.id}`} 
          className="edit-button"
        >
          ✏️ Editar Usuario
        </Link>
      </div>
    </div>
  );
};

export default UserDetail;