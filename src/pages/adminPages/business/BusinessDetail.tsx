import { useEffect, useState } from "react";
import { useParams, useNavigate, Link, useOutletContext } from "react-router";
import "../../../static/css/categories/categoryDetail.css";
import {
  businessService,
  localityService,
  userService,
} from "../../../services";
import DeleteConfirm from "../../../components/DeleteConfirm";
import { errorHandler } from "../../../utils/errorHandler";
import StarRating from "../../../components/StarRating";
import type { Locality } from "../../../types/localityType";
import type { User } from "../../../types/userType";
import type { Business } from "../../../types/businessType";

const BusinessDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useOutletContext<{
    showNotification: (
      m: string,
      t: "success" | "error" | "warning" | "info",
    ) => void;
  }>();
  const [business, setBusiness] = useState<Business | null>(null);
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [owners, setOwners] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    isLoading: false,
  });

  const fetchLocalities = async () => {
    try {
      const localitiesData = await localityService.getAll();
      const localitiesArray = Array.isArray(localitiesData)
        ? (localitiesData as unknown as Locality[])
        : [];
      setLocalities(localitiesArray);
    } catch (err) {
      console.error("Error cargando localidades:", err);
    }
  };

  const fetchOwners = async () => {
    try {
      const ownersData = await userService.findAll();
      const ownersArray = Array.isArray(ownersData)
        ? (ownersData as unknown as User[])
        : [];
      setOwners(ownersArray);
    } catch (err) {
      console.error("Error cargando usuarios:", err);
    }
  };

  const getLocalityName = (locality: Business["locality"]): string => {
    if (typeof locality === "object" && locality !== null) {
      return locality.name || `ID: ${locality.id}`;
    } else if (typeof locality === "number") {
      const foundLocality = localities.find((l) => l.id === locality);
      return foundLocality?.name || `ID: ${locality}`;
    }
    return "N/A";
  };

  const getOwnerName = (owner?: Business["owner"]): string => {
    if (typeof owner === "object" && owner !== null) {
      return (
        owner.name ||
        ("email" in owner ? owner.email : undefined) ||
        `ID: ${owner.id}`
      );
    } else if (typeof owner === "number") {
      const foundOwner = owners.find((o) => o.id === owner);
      return foundOwner?.name || foundOwner?.email || `ID: ${owner}`;
    }
    return "N/A";
  };

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        setLoading(true);
        setError(null);

        const fetchBusinessData = async () => {
          const responseData = await businessService.findOne(id!);
          const businessData = responseData as unknown as Business;
          setBusiness(businessData);
        };

        await Promise.all([
          fetchBusinessData(),
          fetchLocalities(),
          fetchOwners(),
        ]);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al cargar negocio",
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBusiness();
    } else {
      setError("No se proporcionó ID de negocio");
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
    if (!business) return;

    try {
      setDeleteModal((prev) => ({ ...prev, isLoading: true }));
      await businessService.remove(business.id);
      showNotification("Negocio eliminado con éxito", "success");
      navigate("/admin/business/getAll");
    } catch (err) {
      setDeleteModal((prev) => ({ ...prev, isLoading: false }));
      const errorMsg = err instanceof Error ? err.message : "";
      if (
        errorMsg.includes("foreign key") ||
        errorMsg.includes("constraint") ||
        errorMsg.includes("FK")
      ) {
        showNotification(
          "No se puede eliminar el negocio porque tiene canchas asociadas. Elimine las canchas primero.",
          "error",
        );
      } else {
        showNotification(
          "Error al eliminar negocio: " + errorHandler(err),
          "error",
        );
      }
    }
  };

  const formatDepositPercentage = (percentage: number) => {
    return `${(percentage * 100).toFixed(1)}%`;
  };

  const formatDate = (dateString?: Date | string) => {
    if (!dateString) return "No activado";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="detail-container">
        <h2 className="detail-title">Detalle del Negocio</h2>
        <p className="loading-text">Cargando información del negocio...</p>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="detail-container">
        <h2 className="detail-title">Detalle del Negocio</h2>
        <div className="error-message">
          <p>❌ Error: {error}</p>
        </div>
        <button
          onClick={() => navigate("/admin/business/getAll")}
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
        title="Confirmar Eliminación de Negocio"
        message="¿Estás seguro de que quieres eliminar este negocio? Esta acción no se puede deshacer. Las canchas asociadas deben eliminarse primero."
        itemName={business.businessName}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="Eliminar Negocio"
        cancelText="Cancelar"
        isLoading={deleteModal.isLoading}
      />

      <div className="detail-top-bar">
        <button
          onClick={() => navigate("/admin/business/getAll")}
          className="back-nav-button"
        >
          ← Volver a la lista
        </button>
      </div>

      <h2 className="detail-title">🏢 Detalle del Negocio</h2>

      <div className="detail-card">
        <div className="business-header">
          <h3 className="business-name">{business.businessName}</h3>
          <span
            className={`status-badge ${business.active ? "status-active" : "status-inactive"}`}
          >
            {business.active ? "🟢 Activo" : "🔴 Inactivo"}
          </span>
        </div>

        <div className="detail-grid">
          <div className="detail-item">
            <label>ID:</label>
            <span>#{business.id}</span>
          </div>

          <div className="detail-item">
            <label>Nombre del Negocio:</label>
            <span className="business-name-text">{business.businessName}</span>
          </div>

          <div className="detail-item">
            <label>Dirección:</label>
            <span className="address-text">{business.address}</span>
          </div>

          <div className="detail-item">
            <label>Localidad:</label>
            <span className="locality-badge">
              {getLocalityName(business.locality)}
            </span>
          </div>

          <div className="detail-item">
            <label>Dueño:</label>
            <span className="owner-badge">{getOwnerName(business.owner)}</span>
          </div>

          <div className="detail-item">
            <label>Rating Promedio:</label>
            <div className="business-rating">
              <StarRating rating={business.averageRating} size="medium" />
              <span className="rating-text">
                {business.averageRating?.toFixed(1) || "0.0"}
              </span>
            </div>
          </div>

          <div className="detail-item">
            <label>Depósito de Reserva:</label>
            <span className="deposit-text">
              {formatDepositPercentage(business.reservationDepositPercentage)}
            </span>
          </div>

          <div className="detail-item">
            <label>Horarios de Atención:</label>
            <div className="schedule-text">
              {(() => {
                const DAYS = [
                  { day: 1, name: "Lunes" },
                  { day: 2, name: "Martes" },
                  { day: 3, name: "Miércoles" },
                  { day: 4, name: "Jueves" },
                  { day: 5, name: "Viernes" },
                  { day: 6, name: "Sábado" },
                  { day: 7, name: "Domingo" },
                ];
                if (!business.schedule || business.schedule.length === 0) {
                  return (
                    <span className="schedule-closed">
                      Sin horarios configurados
                    </span>
                  );
                }
                return DAYS.map(({ day, name }) => {
                  const item = business.schedule.find((s) => s.day === day);
                  const isOpen = item?.open !== null && item?.close !== null;
                  return (
                    <div key={day} className="schedule-row">
                      <span className="schedule-day">{name}</span>
                      {isOpen ? (
                        <span className="schedule-hours">
                          {item?.open} - {item?.close}
                        </span>
                      ) : (
                        <span className="schedule-closed">Cerrado</span>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          <div className="detail-item">
            <label>Estado:</label>
            <span
              className={`status-text ${business.active ? "status-active" : "status-inactive"}`}
            >
              {business.active ? "Activo" : "Inactivo"}
            </span>
          </div>

          <div className="detail-item">
            <label>Fecha de Activación:</label>
            <span className="date-text">
              {formatDate(business.activatedAt)}
            </span>
          </div>
        </div>

        <div className="additional-info">
          <h4>📊 Información Adicional</h4>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Días abiertos:</span>
              <span className="info-value">
                {business.schedule?.filter((s) => s.open !== null).length || 0}{" "}
                de 7 días
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Política de Depósito:</span>
              <span className="info-value">
                {formatDepositPercentage(business.reservationDepositPercentage)}{" "}
                por reserva
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Satisfacción de Clientes:</span>
              <span className="info-value">
                {business.averageRating?.toFixed(1) || "0.0"} / 5.0 ⭐
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="detail-actions">
        <Link
          to={`/admin/business/update/${business.id}`}
          className="edit-button"
        >
          ✏️ Editar Negocio
        </Link>
        <button onClick={handleDeleteClick} className="delete-button">
          🗑️ Eliminar Negocio
        </button>
      </div>
    </div>
  );
};

export default BusinessDetail;
