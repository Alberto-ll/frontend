import { useCallback, useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router";
import '../../../static/css/users/usersGetAll.css';
import DeleteConfirm from '../../../components/deleteConfirm';
import { localityService } from '../../../services/index.ts';
import { errorHandler } from '../../../types/apiError';

interface Locality {
  id?: number;
  name: string;
  postal_code: number;
  province: string;
}

const LocalitiesGetAll = () => {
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useOutletContext<{ showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void }>();

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    localityId: null as number | null,
    localityName: '',
    isLoading: false
  });

  const getAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const localityData = await localityService.getAll();
      setLocalities(localityData as Locality[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar localidades');
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

  const handleDeleteClick = (localityId: number, localityName: string) => {
    setDeleteModal({
      isOpen: true,
      localityId,
      localityName,
      isLoading: false
    });
  };

  const handleCancelDelete = () => {
    setDeleteModal({
      isOpen: false,
      localityId: null,
      localityName: '',
      isLoading: false
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.localityId) return;

    try {
      setDeleteModal(prev => ({ ...prev, isLoading: true }));

      await localityService.remove(deleteModal.localityId);

      setLocalities(prev => prev.filter(locality => locality.id !== deleteModal.localityId));
      handleCancelDelete();
      showNotification('Localidad eliminada con éxito', 'success');
    } catch (err) {
      setDeleteModal(prev => ({ ...prev, isLoading: false }));
      showNotification('Error al eliminar localidad: ' + errorHandler(err), 'error');
    }
  };

  if (loading) {
    return (
      <div className="users-getall-container">
        <div className="users-container">
          <h2 className="users-title">Lista de Localidades</h2>
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Cargando localidades...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="users-getall-container">
        <div className="users-container">
          <h2 className="users-title">Lista de Localidades</h2>
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
        title="Confirmar Eliminación de Localidad"
        message="¿Estás seguro de que quieres eliminar esta localidad?"
        itemName={deleteModal.localityName}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="Eliminar Localidad"
        cancelText="Cancelar"
        isLoading={deleteModal.isLoading}
      />

      <div className="users-container">
        <h2 className="users-title">Lista de Localidades</h2>
        
        {!Array.isArray(localities) || localities.length === 0 ? (
          <p className="no-users-message">No hay localidades disponibles.</p>
        ) : (
          <div>
            <p className="users-summary">
              Total de localidades: <strong>{localities.length}</strong>
            </p>
            
            <div className="table-container">
              <table className="users-table">
                <thead className="table-header">
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Código Postal</th>
                    <th>Provincia</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {localities.map((locality, index) => (
                    <tr key={locality.id || index} className="table-row">
                      <td className="table-cell">{locality.id || 'N/A'}</td>
                      <td className="table-cell">{locality.name}</td>
                      <td className="table-cell">{locality.postal_code}</td>
                      <td className="table-cell">{locality.province}</td>
                      <td className="table-cell">
                        <div className="action-buttons">
                          <Link 
                            to={`/admin/localities/getOne/${locality.id}`} 
                            className="action-button view-button"
                            title="Ver detalles"
                          >
                            Ver
                          </Link>
                          <Link 
                            to={`/admin/localities/update/${locality.id}`} 
                            className="action-button edit-button"
                            title="Editar localidad"
                          >
                            Editar
                          </Link>
                          <button 
                            onClick={() => locality.id && handleDeleteClick(locality.id, locality.name)} 
                            className="action-button delete-button"
                            title="Eliminar localidad"
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

export default LocalitiesGetAll;
