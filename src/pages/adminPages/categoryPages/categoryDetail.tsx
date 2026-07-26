import { useEffect, useState } from "react";
import { useParams, useNavigate, Link, useOutletContext } from "react-router";
import '../../../static/css/categories/categoryDetail.css';
import { categoryService } from '../../../services/index.ts';
import DeleteConfirm from '../../../components/deleteConfirm';
import { errorHandler } from '../../../types/apiError';

interface Category {
  id: number;
  description: string;
  usertype: string;
}

const CategoryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useOutletContext<{ showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    isLoading: false
  });

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const responseData = await categoryService.getOne(id!);
        const categoryData = responseData as unknown as Category;
        setCategory(categoryData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar categoría');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCategory();
    } else {
      setError('No se proporcionó ID de categoría');
      setLoading(false);
    }
  }, [id]);

  const handleDeleteClick = () => {
    setDeleteModal({ isOpen: true, isLoading: false });
  };

  const handleCancelDelete = () => {
    setDeleteModal({ isOpen: false, isLoading: false });
  };

  const handleConfirmDelete = async () => {
    if (!category) return;

    try {
      setDeleteModal(prev => ({ ...prev, isLoading: true }));
      await categoryService.remove(category.id);
      showNotification('Categoría eliminada con éxito', 'success');
      navigate('/admin/categories/getAll');
    } catch (err) {
      setDeleteModal(prev => ({ ...prev, isLoading: false }));
      const errorMsg = err instanceof Error ? err.message : '';
      if (errorMsg.includes('foreign key') || errorMsg.includes('constraint') || errorMsg.includes('FK')) {
        showNotification('No se puede eliminar la categoría porque tiene usuarios asociados. Reasigne los usuarios a otra categoría primero.', 'error');
      } else {
        showNotification('Error al eliminar categoría: ' + errorHandler(err), 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className="detail-container">
        <h2 className="detail-title">Detalle de la Categoría</h2>
        <p className="loading-text">Cargando información de la categoría...</p>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="detail-container">
        <h2 className="detail-title">Detalle de la Categoría</h2>
        <div className="error-message">
          <p>❌ Error: {error}</p>
        </div>
        <button onClick={() => navigate('/admin/categories/getAll')} className="back-button">
          Volver a la lista
        </button>
      </div>
    );
  }

  return (
    <div className="detail-container">
      <DeleteConfirm
        isOpen={deleteModal.isOpen}
        title="Confirmar Eliminación de Categoría"
        message="¿Estás seguro de que quieres eliminar esta categoría? Los usuarios asignados a esta categoría deben ser reasignados primero."
        itemName={category.description}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="Eliminar Categoría"
        cancelText="Cancelar"
        isLoading={deleteModal.isLoading}
      />

      <h2 className="detail-title">📋 Detalle de la Categoría</h2>
      
      <div className="detail-card">
        <div className="detail-grid">
          <div className="detail-item">
            <label>ID:</label>
            <span>#{category.id}</span>
          </div>
          
          <div className="detail-item">
            <label>Descripción:</label>
            <span className="description-text">{category.description}</span>
          </div>
          
          <div className="detail-item">
            <label>Tipo de Usuario:</label>
            <span className="usertype-badge">{category.usertype}</span>
          </div>
        </div>
      </div>

      <div className="detail-actions">
        <button 
          onClick={() => navigate('/admin/categories/getAll')}
          className="back-button"
        >
          ← Volver a la lista
        </button>
        <Link 
          to={`/admin/categories/update/${category.id}`}
          className="edit-button"
        >
          ✏️ Editar Categoría
        </Link>
        <button 
          onClick={handleDeleteClick}
          className="delete-button"
        >
          🗑️ Eliminar Categoría
        </button>
      </div>
    </div>
  );
};

export default CategoryDetail;
