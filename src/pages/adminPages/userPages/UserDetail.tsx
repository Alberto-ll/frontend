import { useEffect, useState } from "react";
import { useParams, useNavigate, Link, useOutletContext } from "react-router";
import "../../../static/css/users/userDetail.css";
import { userService } from "../../../services";
import DeleteConfirm from "../../../components/DeleteConfirm";
import { errorHandler } from "../../../utils/errorHandler";
import type { User } from "../../../types/userType";

const UserDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useOutletContext<{
    showNotification: (
      m: string,
      t: "success" | "error" | "warning" | "info",
    ) => void;
  }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    isLoading: false,
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);

        const userData = (await userService.findOne(id!)) as User;

        setUser(userData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al cargar usuario",
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUser();
    } else {
      setError("No se proporcionó ID de usuario");
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
    if (!user) return;

    try {
      setDeleteModal((prev) => ({ ...prev, isLoading: true }));
      await userService.remove(user.id);
      showNotification("Usuario eliminado con éxito", "success");
      navigate("/admin/users/getAll");
    } catch (err) {
      setDeleteModal((prev) => ({ ...prev, isLoading: false }));
      showNotification(
        "Error al eliminar usuario: " + errorHandler(err),
        "error",
      );
    }
  };

  if (loading) {
    return (
      <div className="detail-container">
        <h2 className="detail-title">Detalle del Usuario</h2>
        <p className="loading-text">Cargando información del usuario...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="detail-container">
        <h2 className="detail-title">Detalle del Usuario</h2>
        <div className="error-message">
          <p>❌ Error: {error}</p>
        </div>
        <button
          onClick={() => navigate("/admin/users/getAll")}
          className="back-button"
        >
          Volver a la lista
        </button>
      </div>
    );
  }

  // Función para obtener el nombre de la categoría
  const getCategoryDisplay = () => {
    if (user.categoryName) {
      return user.categoryName;
    }
    if (user.category?.usertype) {
      return user.category.usertype;
    }
    if (user.category?.name) {
      return user.category.name;
    }
    if (user.category?.id) {
      return `ID: ${user.category.id}`;
    }
    return "Sin categoría";
  };

  return (
    <div className="detail-container">
      <DeleteConfirm
        isOpen={deleteModal.isOpen}
        title="Confirmar Eliminación de Usuario"
        message="¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer."
        itemName={`${user.name} ${user.surname || ""}`.trim()}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="Eliminar Usuario"
        cancelText="Cancelar"
        isLoading={deleteModal.isLoading}
      />

      <div className="detail-top-bar">
        <button
          onClick={() => navigate("/admin/users/getAll")}
          className="back-nav-button"
        >
          ← Volver a la lista
        </button>
      </div>

      <h2 className="detail-title">👤 Detalle del Usuario</h2>

      <div className="detail-card">
        <div className="detail-grid">
          <div className="detail-item">
            <label>ID:</label>
            <span>{user.id || "N/A"}</span>
          </div>

          <div className="detail-item">
            <label>Nombre:</label>
            <span>{user.name || "N/A"}</span>
          </div>

          <div className="detail-item">
            <label>Apellido:</label>
            <span>{user.surname || "N/A"}</span>
          </div>

          <div className="detail-item">
            <label>Email:</label>
            <span>{user.email || "N/A"}</span>
          </div>

          <div className="detail-item">
            <label>Teléfono:</label>
            <span>{user.phoneNumber || "No especificado"}</span>
          </div>

          <div className="detail-item">
            <label>Categoría:</label>
            <span className="usertype-badge">{getCategoryDisplay()}</span>
          </div>

          <div className="detail-item">
            <label>Fecha de Registro:</label>
            <span>
              {user.createdAt
                ? new Date(user.createdAt).toLocaleString()
                : "N/A"}
            </span>
          </div>

          <div className="detail-item">
            <label>Última Actualización:</label>
            <span>
              {user.updatedAt
                ? new Date(user.updatedAt).toLocaleString()
                : "Sin actualizaciones"}
            </span>
          </div>
        </div>
      </div>

      <div className="detail-actions">
        <Link to={`/admin/users/update/${user.id}`} className="edit-button">
          ✏️ Editar Usuario
        </Link>
        <button onClick={handleDeleteClick} className="delete-button">
          🗑️ Eliminar Usuario
        </button>
      </div>
    </div>
  );
};

export default UserDetail;
