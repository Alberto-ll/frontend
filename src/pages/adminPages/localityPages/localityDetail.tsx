import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import '../../../static/css/users/userDetail.css';
import type { Locality } from "../../../types/localityType";
import { localityService } from "../../../services/localityService";

const LocalityDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [locality, setLocality] = useState<Locality | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getOne = async (id: string) => {
      try {
        setLoading(true);
        setError(null);
        const localityData : Locality = await localityService.getOne(id)
        
        setLocality(localityData);
      } catch (err) {
        console.error('Error in fetchLocality:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar localidad');
      } finally {
        setLoading(false);
      }
    }

  useEffect(() => {
    if(id){
      getOne(id)
    }else {
      setError('No se proporcionó ID de localidad');
      setLoading(false);
    }
    },[id]);

    
  if (loading) {
    return (
      <div className="detail-container">
        <h2 className="detail-title">Detalle de la Localidad</h2>
        <p className="loading-text">Cargando información de la localidad...</p>
      </div>
    );
  }

  if (error || !locality) {
    return (
      <div className="detail-container">
        <h2 className="detail-title">Detalle de la Localidad</h2>
        <div className="error-message">
          <p>❌ Error: {error}</p>
        </div>
        <button onClick={() => navigate('/admin/localities/getAll')} className="back-button">
          Volver a la lista
        </button>
      </div>
    );
  }

  return (
    <div className="detail-container">
      <h2 className="detail-title">🏙️ Detalle de la Localidad</h2>
      
      <div className="detail-card">
        <div className="detail-grid">
          <div className="detail-item">
            <label>ID:</label>
            <span>{locality.id || 'N/A'}</span>
          </div>
          
          <div className="detail-item">
            <label>Nombre:</label>
            <span>{locality.name || 'N/A'}</span>
          </div>
          
          <div className="detail-item">
            <label>Código Postal:</label>
            <span>{locality.postal_code || 'N/A'}</span>
          </div>
          
          <div className="detail-item">
            <label>Provincia:</label>
            <span>{locality.province || 'N/A'}</span>
          </div>
        </div>
      </div>

      <div className="detail-actions">
        <button 
          onClick={() => navigate('/admin/localities/getAll')} 
          className="back-button"
        >
          ← Volver a la lista
        </button>
        <Link 
          to={`/admin/localities/update/${locality.id}`} 
          className="edit-button"
        >
          ✏️ Editar Localidad
        </Link>
      </div>
    </div>
  );
};

export default LocalityDetail;