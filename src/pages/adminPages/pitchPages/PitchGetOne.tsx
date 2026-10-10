import type { Pitch } from "../../../types/pitchType";
import { useEffect, useState, useCallback } from "react";
import { useNavigate, useOutletContext, useParams, Link } from "react-router";
import "../../../static/css/categories/categoryDetail.css";
import DeleteConfirm from "../../../components/DeleteConfirm";
import { errorHandler } from "../../../utils/errorHandler";
import { pitchService } from "../../../services";

export default function PitchGetOne() {
  const [data, setData] = useState<Pitch | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchId, setSearchId] = useState<string>("");
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    isLoading: false,
  });
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const { showNotification } = useOutletContext<{
    showNotification: (
      m: string,
      t: "success" | "error" | "warning" | "info",
    ) => void;
  }>();

  const getOne = useCallback(
    async (pitchId: string) => {
      try {
        setLoading(true);
        setError(null);
        const json = await pitchService.getOne(pitchId);
        setData(json);
      } catch (err) {
        setError(errorHandler(err));
        showNotification(errorHandler(err), "error");
      } finally {
        setLoading(false);
      }
    },
    [showNotification],
  );

  useEffect(() => {
    if (id) {
      getOne(id);
    }
  }, [id, getOne]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchId.trim()) {
      getOne(searchId.trim());
    }
  };

  const handleDeleteClick = () => {
    setDeleteModal({ isOpen: true, isLoading: false });
  };

  const handleCancelDelete = () => {
    setDeleteModal({ isOpen: false, isLoading: false });
  };

  const handleConfirmDelete = async () => {
    if (!data) return;

    try {
      setDeleteModal((prev) => ({ ...prev, isLoading: true }));
      await pitchService.remove(data.id);
      showNotification("Cancha eliminada con éxito", "success");
      navigate("/admin/pitches/getAll");
    } catch (err) {
      setDeleteModal((prev) => ({ ...prev, isLoading: false }));
      showNotification(
        "Error al eliminar cancha: " + errorHandler(err),
        "error",
      );
    }
  };

  if (id && loading) {
    return (
      <div className="detail-container">
        <h2 className="detail-title">Detalle de la Cancha</h2>
        <p className="loading-text">Cargando información de la cancha...</p>
      </div>
    );
  }

  if (id && error && !data) {
    return (
      <div className="detail-container">
        <h2 className="detail-title">Detalle de la Cancha</h2>
        <div className="error-message">
          <p>❌ Error: {error}</p>
        </div>
        <button
          onClick={() => navigate("/admin/pitches/getAll")}
          className="back-button"
        >
          Volver a la lista
        </button>
      </div>
    );
  }

  // Vista de búsqueda si no viene ID en la URL y no se ha cargado data
  if (!id && !data) {
    return (
      <div className="detail-container">
        <h2 className="detail-title">🔍 Buscar Cancha por ID</h2>
        <form
          onSubmit={handleSubmit}
          style={{ maxWidth: "400px", marginTop: "1.5rem" }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label htmlFor="searchPitchId" style={{ fontWeight: 600 }}>
              ID de la Cancha:
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                id="searchPitchId"
                type="number"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Ingrese ID (ej: 1)"
                required
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                }}
              />
              <button
                type="submit"
                className="edit-button"
                style={{ padding: "8px 16px" }}
              >
                Buscar
              </button>
            </div>
          </div>
        </form>
        {loading && <p className="loading-text">Buscando cancha...</p>}
      </div>
    );
  }

  if (!data) return null;

  const businessDisplay =
    typeof data.business === "object" && data.business !== null
      ? "name" in data.business
        ? (data.business as { name: string }).name
        : `ID: ${data.business.id}`
      : data.business
        ? `ID: ${data.business}`
        : "N/A";

  return (
    <div className="detail-container">
      <DeleteConfirm
        isOpen={deleteModal.isOpen}
        title="Confirmar Eliminación de Cancha"
        message="¿Estás seguro de que quieres eliminar esta cancha? Esta acción no se puede deshacer."
        itemName={`Cancha #${data.id}`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="Eliminar Cancha"
        cancelText="Cancelar"
        isLoading={deleteModal.isLoading}
      />

      <div className="detail-top-bar">
        <button
          onClick={() => navigate("/admin/pitches/getAll")}
          className="back-nav-button"
        >
          ← Volver a la lista
        </button>
      </div>

      <h2 className="detail-title">⚽ Detalle de la Cancha</h2>

      <div className="detail-card">
        <div className="detail-grid">
          <div className="detail-item">
            <label>ID:</label>
            <span>#{data.id}</span>
          </div>

          <div className="detail-item">
            <label>Negocio:</label>
            <span className="locality-badge">{businessDisplay}</span>
          </div>

          <div className="detail-item">
            <label>Rating:</label>
            <div className="business-rating">
              <span className="rating-text">
                {"⭐️".repeat(Math.floor(data.rating || 0))} ({data.rating ?? 0})
              </span>
            </div>
          </div>

          <div className="detail-item">
            <label>Precio:</label>
            <span
              style={{
                fontSize: "1.25rem",
                fontWeight: "bold",
                color: "#38bdf8",
              }}
            >
              ${data.price?.toLocaleString?.() ?? data.price}
            </span>
          </div>

          <div className="detail-item">
            <label>Tamaño:</label>
            <span>{data.size || "N/A"}</span>
          </div>

          <div className="detail-item">
            <label>Tipo de Suelo:</label>
            <span>{data.groundType || "N/A"}</span>
          </div>

          <div className="detail-item">
            <label>Techo:</label>
            <div>
              <span
                className={`status-badge ${data.roof ? "status-active" : "status-inactive"}`}
              >
                {data.roof ? "✅ Techado" : "❌ Sin techo"}
              </span>
            </div>
          </div>

          {data.imageUrl && (
            <div className="detail-item" style={{ gridColumn: "1 / -1" }}>
              <label>Imagen:</label>
              <img
                src={data.imageUrl}
                alt={`Cancha ${data.id}`}
                className="detail-entity-image"
              />
            </div>
          )}
        </div>
      </div>

      <div className="detail-actions">
        <Link to={`/admin/pitches/update/${data.id}`} className="edit-button">
          ✏️ Editar Cancha
        </Link>
        <button onClick={handleDeleteClick} className="delete-button">
          🗑️ Eliminar Cancha
        </button>
      </div>
    </div>
  );
}
