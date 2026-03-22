import { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import '../../../static/css/categories/categoryGetAll.css';
import DeleteConfirm from '../../../components/deleteConfirm';
import { businessService } from "../../../services/businessService";
import type { BusinessData } from "../../../types/businessType";
import { useCrud } from "../../../hooks/useCrud";

const BusinessGetAll = () => {
  // Estados para el modal de confirmación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [businessToDelete, setBusinessToDelete] = useState<BusinessData | null>(null);

  // Contexto para usar la funcion del Toast
  const { showNotification } = useOutletContext<{ showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void }>();

  const {error : bussError, loading : bussLoading, data : businesses, execute : fetchBusinesses} = useCrud(businessService.getAll)

  const {error : delError, loading : delLoading, execute : deleteBusiness} = useCrud(() => 
      {if (businessToDelete?.id) {
          return businessService.remove(businessToDelete.id);
      }
      return Promise.reject("No hay ID para eliminar");}
  )

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
    if (businessToDelete){
      deleteBusiness()
      if(delError) {
          setShowDeleteModal(false);
          setBusinessToDelete(null);
          showNotification(
              `Negocio "${businessToDelete.businessName}" eliminado con éxito`, 
              'success'
          );
          setTimeout(() => fetchBusinesses(), 500)
        }else{
          showNotification(`¡No se ha podido eliminar el negocio!`, 'error')
        }
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

  if (bussLoading) {
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

  if (bussError) {
    return (
      <div className="categories-getall-container">
        <div className="categories-container">
          <h2 className="categories-title">Lista de Negocios</h2>
          <div className="error-container">
            <div className="error-message">
              <p>Error: {bussError}</p>
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
                      <td className="table-cell">{typeof business.locality === 'object' ? business.locality.name : business.locality}</td>
                      <td className="table-cell">{typeof business.owner === 'object' ? business.owner.name : business.owner}</td>
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
        itemName={businessToDelete ? `${businessToDelete.businessName} (${(typeof businessToDelete.locality === 'object' ? businessToDelete.locality.name : businessToDelete.locality)})` : undefined}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="Eliminar Negocio"
        cancelText="Cancelar"
        isLoading={delLoading}
      />
    </div>
  );
};

export default BusinessGetAll;