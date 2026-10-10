import { useEffect, useState } from "react";
import { useParams, useNavigate, Link, useOutletContext } from "react-router";
import "../../../static/css/users/userDetail.css";
import { localityService } from "../../../services";
import DeleteConfirm from "../../../components/DeleteConfirm";
import { errorHandler } from "../../../utils/errorHandler";
import type { Locality } from "../../../types/localityType";

const LocalityDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useOutletContext<{
    showNotification: (
      m: string,
      t: "success" | "error" | "warning" | "info",
    ) => void;
  }>();
  const [locality, setLocality] = useState<Locality | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    isLoading: false,
  });

  useEffect(() => {
    const fetchLocality = async () => {
      try {
        setLoading(true);
        setError(null);

        const localityData = await localityService.getOne(id!);

        setLocality(localityData as Locality);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al cargar localidad",
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchLocality();
    } else {
      setError("No se proporcionó ID de localidad");
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
    if (!locality) return;

    try {
      setDeleteModal((prev) => ({ ...prev, isLoading: true }));
      await localityService.remove(locality.id);
      showNotification("Localidad eliminada con éxito", "success");
      navigate("/admin/localities/getAll");
    } catch (err) {
      setDeleteModal((prev) => ({ ...prev, isLoading: false }));
      showNotification(
        "Error al eliminar localidad: " + errorHandler(err),
        "error",
      );
    }
  };

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
        <button
          onClick={() => navigate("/admin/localities/getAll")}
          className="back-button"
        >
          Volver a la lista
        </button>
      </div>
    );
  }

  return (
    <div className="detail-container">
      <DeleteConfirm
        isOpen={deleteModal.isOpen}
        title="Confirmar Eliminación de Localidad"
        message="¿Estás seguro de que quieres eliminar esta localidad? Esta acción no se puede deshacer."
        itemName={locality.name}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="Eliminar Localidad"
        cancelText="Cancelar"
        isLoading={deleteModal.isLoading}
      />

      <div className="detail-top-bar">
        <button
          onClick={() => navigate("/admin/localities/getAll")}
          className="back-nav-button"
        >
          ← Volver a la lista
        </button>
      </div>

      <h2 className="detail-title">🏙️ Detalle de la Localidad</h2>

      <div className="detail-card">
        <div className="detail-grid">
          <div className="detail-item">
            <label>ID:</label>
            <span>{locality.id || "N/A"}</span>
          </div>

          <div className="detail-item">
            <label>Nombre:</label>
            <span>{locality.name || "N/A"}</span>
          </div>

          <div className="detail-item">
            <label>Código Postal:</label>
            <span>{locality.postal_code || "N/A"}</span>
          </div>

          <div className="detail-item">
            <label>Provincia:</label>
            <span>{locality.province || "N/A"}</span>
          </div>

          <div className="detail-item">
            <label>Fecha de Creación:</label>
            <span>
              {locality.createdAt
                ? new Date(locality.createdAt).toLocaleString()
                : "N/A"}
            </span>
          </div>

          <div className="detail-item">
            <label>Última Actualización:</label>
            <span>
              {locality.updatedAt
                ? new Date(locality.updatedAt).toLocaleString()
                : "Sin actualizaciones"}
            </span>
          </div>
        </div>
      </div>

      <div className="detail-actions">
        <Link
          to={`/admin/localities/update/${locality.id}`}
          className="edit-button"
        >
          ✏️ Editar Localidad
        </Link>
        <button onClick={handleDeleteClick} className="delete-button">
          🗑️ Eliminar Localidad
        </button>
      </div>
    </div>
  );
};

export default LocalityDetail;
