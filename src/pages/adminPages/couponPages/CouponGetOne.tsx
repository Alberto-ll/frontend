import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link, useOutletContext } from "react-router";
import '../../../static/css/users/userDetail.css';
import { couponService } from '../../../services';
import DeleteConfirm from '../../../components/DeleteConfirm';
import { errorHandler } from '../../../utils/errorHandler';
import type { Coupon } from '../../../types/couponType';

export default function CouponGetOne() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useOutletContext<{
    showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void;
  }>();

  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchId, setSearchId] = useState('');
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    isLoading: false
  });

  const formatDiscount = (discount?: number): string => {
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
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const fetchCoupon = useCallback(async (targetId: string | number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await couponService.getOne(targetId);
      setCoupon(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar cupón');
      setCoupon(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchCoupon(id);
    }
  }, [id, fetchCoupon]);

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId.trim()) {
      fetchCoupon(searchId.trim());
    }
  };

  const handleDeleteClick = () => {
    setDeleteModal({ isOpen: true, isLoading: false });
  };

  const handleCancelDelete = () => {
    setDeleteModal({ isOpen: false, isLoading: false });
  };

  const handleConfirmDelete = async () => {
    if (!coupon) return;

    try {
      setDeleteModal(prev => ({ ...prev, isLoading: true }));
      await couponService.remove(coupon.id);
      showNotification(`Cupón #${coupon.id} eliminado con éxito`, 'success');
      navigate('/admin/coupons/getAll');
    } catch (err) {
      setDeleteModal(prev => ({ ...prev, isLoading: false }));
      showNotification(errorHandler(err), 'error');
    }
  };

  if (loading) {
    return (
      <div className="detail-container">
        <h2 className="detail-title">Detalle del Cupón</h2>
        <p className="loading-text">Cargando información del cupón...</p>
      </div>
    );
  }

  if (!id && !coupon) {
    return (
      <div className="detail-container">
        <h2 className="detail-title">🎟️ Buscar Cupón por ID</h2>
        <form onSubmit={handleManualSearch} style={{ maxWidth: '400px', marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label htmlFor="searchId" style={{ fontWeight: 600 }}>ID del Cupón:</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                id="searchId"
                type="number"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Ingrese ID (ej: 1)"
                required
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #bdc3c7'
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#2ecc71',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Buscar
              </button>
            </div>
          </div>
        </form>
        {error && (
          <div className="error-message" style={{ marginTop: '1rem' }}>
            <p>❌ {error}</p>
          </div>
        )}
      </div>
    );
  }

  if (error || !coupon) {
    return (
      <div className="detail-container">
        <h2 className="detail-title">Detalle del Cupón</h2>
        <div className="error-message">
          <p>❌ Error: {error || 'Cupón no encontrado'}</p>
        </div>
        <button onClick={() => navigate('/admin/coupons/getAll')} className="back-button">
          Volver a la lista
        </button>
      </div>
    );
  }

  return (
    <div className="detail-container">
      <DeleteConfirm
        isOpen={deleteModal.isOpen}
        title="Confirmar Eliminación de Cupón"
        message="¿Estás seguro de que quieres eliminar este cupón? Esta acción no se puede deshacer."
        itemName={`Cupón #${coupon.id} (${formatDiscount(coupon.discount)})`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="Eliminar Cupón"
        cancelText="Cancelar"
        isLoading={deleteModal.isLoading}
      />

      <h2 className="detail-title">🎟️ Detalle del Cupón</h2>

      <div className="detail-card">
        <div className="detail-grid">
          <div className="detail-item">
            <label>ID:</label>
            <span>#{coupon.id}</span>
          </div>

          <div className="detail-item">
            <label>Descuento:</label>
            <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#27ae60' }}>
              {formatDiscount(coupon.discount)}
            </span>
          </div>

          <div className="detail-item">
            <label>Estado:</label>
            <span
              style={{
                display: 'inline-block',
                padding: '4px 10px',
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
              {coupon.status}
            </span>
          </div>

          <div className="detail-item">
            <label>Fecha de Vencimiento:</label>
            <span>{formatDate(coupon.expiringDate)}</span>
          </div>
        </div>
      </div>

      <div className="detail-actions">
        <button
          onClick={() => navigate('/admin/coupons/getAll')}
          className="back-button"
        >
          ← Volver a la lista
        </button>
        <Link
          to={`/admin/coupons/update/${coupon.id}`}
          className="edit-button"
        >
          ✏️ Editar Cupón
        </Link>
        <button
          onClick={handleDeleteClick}
          className="delete-button"
        >
          🗑️ Eliminar Cupón
        </button>
      </div>
    </div>
  );
}

export const CouponDetail = CouponGetOne;