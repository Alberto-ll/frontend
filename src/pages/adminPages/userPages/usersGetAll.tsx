import { useCallback, useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router";
import '../../../static/css/users/usersGetAll.css';
import { userService } from '../../../services/index.ts';
import DeleteConfirm from '../../../components/deleteConfirm';
import { errorHandler } from '../../../types/apiError';

interface User {
  id?: number;
  name: string;
  surname: string;
  email: string;
  phoneNumber?: string;
  password?: string;
  categoryName?: string;
  category?: {
    id: number;
    name: string;
    usertype?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

const UsersGetAll = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useOutletContext<{ showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void }>();
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    userId: null as number | null,
    userName: '',
    isLoading: false
  });

  const getAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userData = await userService.findAll() as User[];
      setUsers(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getAll();
  }, [getAll]);

  const handleRetry = () => {
    getAll();
  };

  const handleDeleteClick = (userId: number, userName: string) => {
    setDeleteModal({
      isOpen: true,
      userId,
      userName,
      isLoading: false,
    });
  };

  const handleCancelDelete = () => {
    setDeleteModal({
      isOpen: false,
      userId: null,
      userName: '',
      isLoading: false,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.userId) return;

    try {
      setDeleteModal((prev) => ({ ...prev, isLoading: true }));

      await userService.remove(deleteModal.userId);

      setUsers((prev) => prev.filter((user) => user.id !== deleteModal.userId));
      handleCancelDelete();
      showNotification('Usuario eliminado con éxito', 'success');
    } catch (err) {
      setDeleteModal((prev) => ({ ...prev, isLoading: false }));
      showNotification('Error al eliminar usuario: ' + errorHandler(err), 'error');
    }
  };

  if (loading) {
    return (
      <div className="users-getall-container">
        <div className="users-container">
          <h2 className="users-title">Lista de Usuarios</h2>
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Cargando usuarios...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="users-getall-container">
        <div className="users-container">
          <h2 className="users-title">Lista de Usuarios</h2>
          <div className="error-container">
            <div className="error-message">
              <p>Error: {error}</p>
            </div>
            <button onClick={handleRetry} className="retry-button">
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="users-getall-container">
      <DeleteConfirm
        isOpen={deleteModal.isOpen}
        title="Confirmar Eliminación de Usuario"
        message="¿Estás seguro de que quieres eliminar este usuario?"
        itemName={deleteModal.userName}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="Eliminar Usuario"
        cancelText="Cancelar"
        isLoading={deleteModal.isLoading}
      />
      <div className="users-container">
        <h2 className="users-title">Lista de Usuarios</h2>
        
        {!Array.isArray(users) || users.length === 0 ? (
          <p className="no-users-message">No hay usuarios disponibles.</p>
        ) : (
          <div>
            <p className="users-summary">
              Total de usuarios: <strong>{users.length}</strong>
            </p>
            
            <div className="table-container">
              <table className="users-table">
                <thead className="table-header">
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Apellido</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>Categoría</th>
                    <th>Fecha de Registro</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr key={user.id || index} className="table-row">
                      <td className="table-cell">{user.id || 'N/A'}</td>
                      <td className="table-cell">{user.name}</td>
                      <td className="table-cell">{user.surname}</td>
                      <td className="table-cell">{user.email}</td>
                      <td className="table-cell">{user.phoneNumber || 'No especificado'}</td>
                      <td className="table-cell">
                        {user.categoryName || user.category?.usertype || user.category?.name || 'Sin categoría'}
                      </td>
                      <td className="table-cell">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-ES') : 'N/A'}
                      </td>
                      <td className="table-cell">
                        <div className="action-buttons">
                          <Link 
                            to={`/admin/users/detail/${user.id}`} 
                            className="action-button view-button"
                            title="Ver detalles"
                          >
                            Ver
                          </Link>
                          <Link 
                            to={`/admin/users/update/${user.id}`} 
                            className="action-button edit-button"
                            title="Editar usuario"
                          >
                            Editar
                          </Link>
                          <button 
                            onClick={() => user.id && handleDeleteClick(user.id, `${user.name} ${user.surname}`)} 
                            className="action-button delete-button"
                            title="Eliminar usuario"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersGetAll;
