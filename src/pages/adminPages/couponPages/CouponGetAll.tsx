import { useCallback, useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router";
import '../../../static/css/users/usersGetAll.css';
import DeleteConfirm from '../../../components/DeleteConfirm';
import { couponService } from '../../../services';
import { errorHandler } from '../../../utils/errorHandler';
import type { Coupon } from '../../../types/couponType';

export default function CouponGetAll() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para el modal de confirmación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Contexto para notificaciones Toast
  const { showNotification } = useOutletContext<{
    showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void;
  }>();

  const formatDiscount = (discount: number): string => {
    if (discount === undefined || discount === null) return '0%';
    if (discount <= 1) {
      return `${(discount * 100).toFixed(0)}%`;
    }
    return `${discount}%`;
  };

  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return 'Sin fecha';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const getAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await couponService.getAll();
      setCoupons(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar cupones');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getAll();
  }, [getAll]);

  const handleRetry = () => {
    getAll();
  };

  const handleDeleteClick = (coupon: Coupon) => {
    setCouponToDelete(coupon);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!couponToDelete || !couponToDelete.id) return;

    setIsDeleting(true);
    try {
      await couponService.remove(couponToDelete.id);
      setCoupons(prev => prev.filter(c => c.id !== couponToDelete.id));
      setShowDeleteModal(false);
      setCouponToDelete(null);
      showNotification(`Cupón #${couponToDelete.id} eliminado con éxito`, 'success');
    } catch (err) {
      showNotification(errorHandler(err), 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setCouponToDelete(null);
  };

  if (loading) {
    return (
      <div className="users-getall-container">
        <div className="users-container">
          <h2 className="users-title">Lista de Cupones</h2>
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Cargando cupones...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="users-getall-container">
        <div className="users-container">
          <h2 className="users-title">Lista de Cupones</h2>
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
    <div className="users-getall-container">
      <div className="users-container">
        <h2 className="users-title">Lista de Cupones</h2>

        {coupons.length === 0 ? (
          <div className="no-users-message">
            <p>No hay cupones disponibles.</p>
          </div>
        ) : (
          <>
            <div className="users-summary">
              Total de cupones: <strong>{coupons.length}</strong>
            </div>

            <div className="table-container">
              <table className="users-table">
                <thead className="table-header">
                  <tr>
                    <th>ID</th>
                    <th>Descuento</th>
                    <th>Estado</th>
                    <th>Fecha de Vencimiento</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((coupon, index) => (
                    <tr key={coupon.id || index} className="table-row">
                      <td className="table-cell">#{coupon.id}</td>
                      <td className="table-cell">
                        <strong>{formatDiscount(coupon.discount)}</strong>
                      </td>
                      <td className="table-cell">
                        <span
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            backgroundColor:
                              coupon.status?.toLowerCase() === 'active' || coupon.status?.toLowerCase() === 'activo'
                                ? '#e8f8f0'
                                : '#fdeeed',
                            color:
                              coupon.status?.toLowerCase() === 'active' || coupon.status?.toLowerCase() === 'activo'
                                ? '#27ae60'
                                : '#e74c3c'
                          }}
                        >
                          {coupon.status || 'N/A'}
                        </span>
                      </td>
                      <td className="table-cell">{formatDate(coupon.expiringDate)}</td>
                      <td className="table-cell">
                        <div className="action-buttons">
                          <Link
                            to={`/admin/coupons/detail/${coupon.id}`}
                            className="action-button view-button"
                            title="Ver detalles"
                          >
                            Ver
                          </Link>
                          <Link
                            to={`/admin/coupons/update/${coupon.id}`}
                            className="action-button edit-button"
                            title="Editar cupón"
                          >
                            Editar
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(coupon)}
                            className="action-button delete-button"
                            title={`Eliminar cupón #${coupon.id}`}
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
        title="Eliminar Cupón"
        message="¿Estás seguro de que quieres eliminar este cupón? Esta acción no se puede deshacer."
        itemName={couponToDelete ? `Cupón #${couponToDelete.id} (${formatDiscount(couponToDelete.discount)})` : undefined}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="Eliminar Cupón"
        cancelText="Cancelar"
        isLoading={isDeleting}
      />
    </div>
  );
}
