import { useEffect, useState, useCallback } from 'react';
import type { Coupon } from '../../../types/couponType';
import { useParams, useNavigate, useOutletContext } from 'react-router';
import '../../../static/css/users/userUpdate.css';
import { errorHandler } from '../../../utils/errorHandler';
import { couponService } from '../../../services';

export default function CouponUpdate() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useOutletContext<{
    showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void;
  }>();

  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchId, setSearchId] = useState('');

  const [formData, setFormData] = useState({
    discount: '',
    status: 'active',
    expiringDate: ''
  });

  const formatDateForInput = (dateStr?: string): string => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr.slice(0, 10);
      return d.toISOString().split('T')[0];
    } catch {
      return dateStr.slice(0, 10);
    }
  };

  const fetchCoupon = useCallback(async (targetId: string | number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await couponService.getOne(targetId);
      setCoupon(data);
      setFormData({
        discount: data.discount !== undefined ? data.discount.toString() : '',
        status: data.status || 'active',
        expiringDate: formatDateForInput(data.expiringDate)
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos del cupón');
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getCalculatedDiscountDisplay = () => {
    const val = parseFloat(formData.discount);
    if (isNaN(val)) return '0%';
    if (val <= 1) return `${(val * 100).toFixed(0)}%`;
    return `${val.toFixed(0)}%`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const couponId = coupon?.id || (id ? parseInt(id, 10) : null);
    if (!couponId) {
      setError('ID del cupón no válido');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const parsedDiscount = parseFloat(formData.discount);
      if (isNaN(parsedDiscount) || parsedDiscount <= 0) {
        throw new Error('El descuento debe ser un número mayor a 0');
      }

      if (!formData.expiringDate) {
        throw new Error('La fecha de vencimiento es obligatoria');
      }

      const normalizedDiscount = parsedDiscount > 1 ? parsedDiscount / 100 : parsedDiscount;

      const payload: Partial<Coupon> = {
        discount: normalizedDiscount,
        status: formData.status.trim(),
        expiringDate: formData.expiringDate
      };

      await couponService.update(couponId, payload);
      showNotification('Cupón actualizado con éxito', 'success');
      navigate('/admin/coupons/getAll');
    } catch (err) {
      const msg = errorHandler(err);
      setError(msg);
      showNotification(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/coupons/getAll');
  };

  if (loading) {
    return (
      <div className="user-update-container">
        <h2>Actualizar Cupón</h2>
        <p className="loading-text">Cargando datos del cupón...</p>
      </div>
    );
  }

  if (!id && !coupon) {
    return (
      <div className="user-update-container">
        <div className="user-update-header">
          <h2>Actualizar Cupón</h2>
          <p className="user-update-subtitle">Ingrese el ID del cupón que desea modificar</p>
        </div>

        <form onSubmit={handleManualSearch} style={{ maxWidth: '400px', marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label htmlFor="searchId" style={{ fontWeight: 600 }}>ID del Cupón:</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                id="searchId"
                type="number"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Ej: 1, 2, 3..."
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
                Cargar
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

  return (
    <div className="user-update-container">
      <div className="user-update-header">
        <h2>Actualizar Cupón #{coupon?.id}</h2>
        <p className="user-update-subtitle">Modifique los datos del cupón y guarde los cambios</p>
      </div>

      {error && (
        <div className="error-message">
          <p>❌ {error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="user-update-form">
        <div className="form-section">
          <div className="form-group">
            <label htmlFor="discount">Descuento *</label>
            <input
              type="number"
              id="discount"
              name="discount"
              value={formData.discount}
              onChange={handleInputChange}
              step="0.01"
              min="0.01"
              max="100"
              placeholder="Ej: 0.15 o 15 para 15%"
              required
              className="form-input"
            />
            <small className="form-help">
              {formData.discount ? (
                <span className="input-valid">
                  ✓ Descuento resultante: {getCalculatedDiscountDisplay()}
                </span>
              ) : (
                <span className="input-help">
                  Ingrese el valor decimal o porcentaje
                </span>
              )}
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="status">Estado *</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              required
              className="form-input"
            >
              <option value="active">Activo (active)</option>
              <option value="inactive">Inactivo (inactive)</option>
              <option value="expired">Expirado (expired)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="expiringDate">Fecha de Vencimiento *</label>
            <input
              type="date"
              id="expiringDate"
              name="expiringDate"
              value={formData.expiringDate}
              onChange={handleInputChange}
              required
              className="form-input"
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={handleCancel}
            className="cancel-button"
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="save-button"
            disabled={saving || !formData.discount || !formData.expiringDate}
          >
            {saving ? 'Guardando...' : 'Actualizar Cupón'}
          </button>
        </div>
      </form>
    </div>
  );
}