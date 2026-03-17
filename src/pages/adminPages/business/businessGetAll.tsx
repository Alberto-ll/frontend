import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import '../../../static/css/categories/categoryGetAll.css';
import DeleteConfirm from '../../../components/deleteConfirm';
import { businessService } from "../../../services/businessService";
import type { BusinessData } from "../../../types/businessType";

interface Locality {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

const BusinessGetAll = () => {
  const [businesses, setBusinesses] = useState<BusinessData[]>([]);
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [owners, setOwners] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para el modal de confirmación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [businessToDelete, setBusinessToDelete] = useState<BusinessData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Contexto para usar la funcion del Toast
  const { showNotification } = useOutletContext<{ showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void }>();

  // Función para obtener el nombre de la localidad
  const getLocalityName = (locality: number | Locality): string => {
    if (typeof locality === 'object' && locality !== null) {
      return locality.name;
    } else if (typeof locality === 'number') {
      const foundLocality = localities.find(l => l.id === locality);
      return foundLocality?.name || 'N/A';
    }
    return 'N/A';
  };

  // Función para obtener el nombre del dueño
  const getOwnerName = (owner: number | User): string => {
    if (typeof owner === 'object' && owner !== null) {
      return owner.name || owner.email || 'N/A';
    } else if (typeof owner === 'number') {
      const foundOwner = owners.find(o => o.id === owner);
      return foundOwner?.name || foundOwner?.email || 'N/A';
    }
    return 'N/A';
  };

  // Cargar localidades
  const fetchLocalities = async (token: string) => {
    try {
      const response = await fetch('http://localhost:3000/api/localities/getAll', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const localitiesData = await response.json();
        const localitiesArray = Array.isArray(localitiesData) ? localitiesData : 
                              localitiesData.data || localitiesData.localities || [];
        setLocalities(localitiesArray);
      }
    } catch (err) {
      console.error('Error cargando localidades:', err);
    }
  };

  // Cargar usuarios
  const fetchOwners = async (token: string) => {
    try {
      const response = await fetch('http://localhost:3000/api/users/findAll', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const ownersData = await response.json();
        const ownersArray = Array.isArray(ownersData) ? ownersData : 
                          ownersData.data || ownersData.users || [];
        setOwners(ownersArray);
      }
    } catch (err) {
      console.error('Error cargando usuarios:', err);
    }
  };

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = JSON.parse(localStorage.getItem("user") || "{}").token;
      if (!token) {
        throw new Error("No se encontró token de autenticación");
      }
      fetchLocalities(token);
      fetchOwners(token);

      const response = await businessService.getAll();

      setBusinesses(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar negocios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const handleRetry = () => {
    window.location.reload();
  };

  // FUNCIÓN PARA MOSTRAR EL MODAL (reemplaza la confirmación antigua)
  const handleDeleteClick = (business: BusinessData) => {
    setBusinessToDelete(business);
    setShowDeleteModal(true);
  };

  // FUNCIÓN PARA CONFIRMAR LA ELIMINACIÓN - MODIFICADA
  const handleConfirmDelete = async () => {
    if (!businessToDelete || !businessToDelete.id) return;

    setIsDeleting(true);
    
    try {
      const token = JSON.parse(localStorage.getItem('user') || '{}').token;
      
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      const response = await fetch(`http://localhost:3000/api/business/remove/${businessToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const responseText = await response.text();
        
        if (response.status === 404) {
          throw new Error('Negocio no encontrado');
        } else if (response.status === 403) {
          throw new Error('No tienes permisos para eliminar este negocio');
        } else if (response.status === 409) {
          throw new Error('No se puede eliminar el negocio porque tiene canchas asociadas');
        } else {
          let errorMessage = `Error: ${response.status}`;
          try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.message || errorMessage;
          } catch {
            errorMessage = responseText || errorMessage;
          }
          throw new Error(errorMessage);
        }
      }

      // Actualizar la lista local removiendo el negocio eliminado
      setBusinesses(prevBusinesses => 
        prevBusinesses.filter(business => business.id !== businessToDelete.id)
      );
      
      // Cerrar modal y limpiar estado
      setShowDeleteModal(false);
      setBusinessToDelete(null);
      
      showNotification(
        `Negocio "${businessToDelete.businessName}" eliminado con éxito`, 
        'success'
      );
      
    } catch (err) {
      console.error('Error al eliminar negocio:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      
      // MOSTRAR TOAST DE ERROR EN LUGAR DE ALERT
      showNotification(
        `Error al eliminar negocio: ${errorMessage}`, 
        'error'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // FUNCIÓN PARA CANCELAR LA ELIMINACIÓN
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setBusinessToDelete(null);
  };

  // Función para formatear el estado activo/inactivo
  const formatActiveStatus = (active: boolean) => {
    return active ? (
      <span className="status-active">Activo</span>
    ) : (
      <span className="status-inactive">Inactivo</span>
    );
  };

  // Función para formatear porcentaje
  const formatPercentage = (percentage: number) => {
    return `${(percentage * 100).toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="categories-getall-container">
        <div className="categories-container">
          <h2 className="categories-title">Lista de Negocios</h2>
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Cargando negocios...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="categories-getall-container">
        <div className="categories-container">
          <h2 className="categories-title">Lista de Negocios</h2>
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
    <div className="categories-getall-container">
      <div className="categories-container">
        <h2 className="categories-title">Lista de Negocios</h2>
        
        {!Array.isArray(businesses) || businesses.length === 0 ? (
          <div className="no-categories-message">
            <p>No hay negocios disponibles.</p>
          </div>
        ) : (
          <>
            <div className="categories-summary">
              Total de negocios: <strong>{businesses.length}</strong>
            </div>
            
            <div className="table-container">
              <table className="categories-table">
                <thead className="table-header">
                  <tr>
                    <th>ID</th>
                    <th>Nombre del Negocio</th>
                    <th>Dirección</th>
                    <th>Localidad</th>
                    <th>Dueño</th>
                    <th>Rating</th>
                    <th>Depósito</th>
                    <th>Horario</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {businesses.map((business, index) => (
                    <tr key={business.id || index} className="table-row">
                      <td className="table-cell">{business.id || 'N/A'}</td>
                      <td className="table-cell">{business.businessName}</td>
                      <td className="table-cell">{business.address}</td>
                      <td className="table-cell">{getLocalityName(business.locality)}</td>
                      <td className="table-cell">{getOwnerName(typeof business.owner === 'number' ? business.owner : 0)}</td>
                      <td className="table-cell">{business.averageRating?.toFixed(1) || '0.0'}</td>
                      <td className="table-cell">{formatPercentage(business.reservationDepositPercentage)}</td>
                      <td className="table-cell">{business.openingAt} - {business.closingAt}</td>
                      <td className="table-cell">{formatActiveStatus(business.active)}</td>
                      <td className="table-cell">
                        <div className="action-buttons">
                          <Link 
                            to={`/admin/business/detail/${business.id}`} 
                            className="action-button view-button"
                            title="Ver detalles"
                          >
                            Ver
                          </Link>
                          <Link 
                            to={`/admin/business/update/${business.id}`} 
                            className="action-button edit-button"
                            title="Editar negocio"
                          >
                            Editar
                          </Link>
                          <button 
                            onClick={() => handleDeleteClick(business)}
                            className="action-button delete-button"
                            title={`Eliminar negocio: ${business.businessName}`}
                            disabled={!business.id}
                          >
                            🗑️ Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
      <DeleteConfirm
        isOpen={showDeleteModal}
        title="Eliminar Negocio"
        message="¿Estás seguro de que quieres eliminar este negocio? Esta acción afectará a todas las canchas asociadas y no se puede deshacer."
        itemName={businessToDelete ? `${businessToDelete.businessName} (${getLocalityName(businessToDelete.locality)})` : undefined}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="Eliminar Negocio"
        cancelText="Cancelar"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default BusinessGetAll;