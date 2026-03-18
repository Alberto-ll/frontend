import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import '../../../static/css/categories/categoryDetail.css';
import type { Category } from "../../../types/categoryType";
import { categoryService } from "../../../services/categoryService";

const CategoryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategory = async (id:string) => {
    try {
      setLoading(true);
      setError(null);
      const categoryData : Category = await categoryService.getOne(id);
      setCategory(categoryData);
    } catch (err) {
      console.error("Error in fetchCategory:", err);
      setError(
        err instanceof Error ? err.message : "Error al cargar categoría",
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if(id){
      fetchCategory(id);
    }
  }, [id]);

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
          onClick={() => {
            if (window.confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
              console.log('Eliminar categoría:', category.id);
            }
          }}
          className="delete-button"
        >
          🗑️ Eliminar Categoría
        </button>
      </div>
    </div>
  );
};

export default CategoryDetail;