import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import '../../../static/css/categories/categoryGetAll.css';
import DeleteConfirm from '../../../components/deleteConfirm';
import { categoryService } from '../../../services/index.ts';

interface Category {
  id?: number;
  description: string;
  usertype: string;
}

const CategoryGetAll = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para el modal de confirmación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Contexto para usar la funcion del Toast
  const { showNotification } = useOutletContext<{ showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void }>();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const responseData = await categoryService.getAll();
        
        let categoryData: Category[] = [];
        
        if (Array.isArray(responseData)) {
          categoryData = responseData as unknown as Category[];
        }
        
        setCategories(categoryData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar categorías');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleRetry = () => {
    window.location.reload();
  };

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete || !categoryToDelete.id) return;

    setIsDeleting(true);
    
    try {
      await categoryService.remove(categoryToDelete.id);

      setCategories(prevCategories => 
        prevCategories.filter(category => category.id !== categoryToDelete.id)
      );
      
      setShowDeleteModal(false);
      setCategoryToDelete(null);
      
      showNotification(
        `Categoría "${categoryToDelete.description}" eliminada con éxito`, 
        'success'
      );
      
    } catch (err) {
      console.error('Error al eliminar categoría:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      
      showNotification(
        `Error al eliminar categoría: ${errorMessage}`, 
        'error'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setCategoryToDelete(null);
  };

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
        isLoading={isDeleting}
      />
    </div>
  );
};

export default CategoryGetAll;

