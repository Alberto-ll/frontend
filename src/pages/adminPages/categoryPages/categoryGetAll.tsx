import { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import '../../../static/css/categories/categoryGetAll.css';
import DeleteConfirm from '../../../components/deleteConfirm';
import { categoryService } from "../../../services/categoryService";
import type { Category } from "../../../types/categoryType";
import { useCrud } from "../../../hooks/useCrud";

const CategoryGetAll = () => {
  const {error, loading, data : categories, execute : refetchCategories} = useCrud(() => categoryService.getAll())
  
  const {error : delError, loading : delLoading, execute : removeCategory} = useCrud(() =>  
    {if (categoryToDelete?.id) {
            return categoryService.remove(categoryToDelete.id);
        }
      return Promise.reject("No hay ID para eliminar");}
    )

  // Estados para el modal de confirmación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  // Contexto para usar la funcion del Toast
  const { showNotification } = useOutletContext<{ showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void }>();

  const deleteCategory = async () => {
    if(categoryToDelete){
      removeCategory()

      if(!delError){
        setTimeout(() => refetchCategories(), 500)
        showNotification(
          `Categoría "${categoryToDelete.description}" eliminada con éxito`,
          "success",
        )
        setShowDeleteModal(false);
        setCategoryToDelete(null);
      }else{
        showNotification('¡No se ha podido eliminar la categoría!', 'error')
      }
    }
  }

  const handleRetry = () => {
    window.location.reload();
  };

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete || !categoryToDelete.id) return;
    
    deleteCategory()
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setCategoryToDelete(null);
  };

  if(delError){ showNotification('No se ha podido eliminar la categoría.', 'error')}

  if (loading) {
    return (
      <div className="categories-getall-container">
        <div className="categories-container">
          <h2 className="categories-title">Lista de Categorías</h2>
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Cargando categorías...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="categories-getall-container">
        <div className="categories-container">
          <h2 className="categories-title">Lista de Categorías</h2>
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
        <h2 className="categories-title">Lista de Categorías</h2>
        
        {!Array.isArray(categories) || categories.length === 0 ? (
          <div className="no-categories-message">
            <p>No hay categorías disponibles.</p>
          </div>
        ) : (
          <>
            <div className="categories-summary">
              Total de categorías: <strong>{categories.length}</strong>
            </div>
            
            <div className="table-container">
              <table className="categories-table">
                <thead className="table-header">
                  <tr>
                    <th>ID</th>
                    <th>Descripción</th>
                    <th>Tipo de Usuario</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category, index) => (
                    <tr key={category.id || index} className="table-row">
                      <td className="table-cell">{category.id || 'N/A'}</td>
                      <td className="table-cell">{category.description}</td>
                      <td className="table-cell">{category.usertype}</td>
                      <td className="table-cell">
                        <div className="action-buttons">
                          <Link 
                            to={`/admin/categories/detail/${category.id}`} 
                            className="action-button view-button"
                            title="Ver detalles"
                          >
                            Ver
                          </Link>
                          <Link 
                            to={`/admin/categories/update/${category.id}`} 
                            className="action-button edit-button"
                            title="Editar categoría"
                          >
                            Editar
                          </Link>
                          <button 
                            onClick={() => handleDeleteClick(category)}
                            className="action-button delete-button"
                            title={`Eliminar categoría: ${category.description}`}
                            disabled={!category.id}
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
        title="Eliminar Categoría"
        message="¿Estás seguro de que quieres eliminar esta categoría? Esta acción afectará a todos los usuarios asociados."
        itemName={categoryToDelete ? `${categoryToDelete.description} (${categoryToDelete.usertype})` : undefined}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="Eliminar Categoría"
        cancelText="Cancelar"
        isLoading={delLoading}
      />
    </div>
  );
};

export default CategoryGetAll;

