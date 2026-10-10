import { useState } from "react";
import type { Coupon } from "../../../types/couponType";
import { useNavigate, useOutletContext } from "react-router";
import "../../../static/css/users/userCreate.css";
import { errorHandler } from "../../../utils/errorHandler";
import { couponService } from "../../../services";

export default function CouponAdd() {
  const navigate = useNavigate();
  const { showNotification } = useOutletContext<{
    showNotification: (
      m: string,
      t: "success" | "error" | "warning" | "info",
    ) => void;
  }>();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    discount: "",
    status: "active",
    expiringDate: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getCalculatedDiscountDisplay = () => {
    const val = parseFloat(formData.discount);
    if (isNaN(val)) return "0%";
    if (val <= 1) return `${(val * 100).toFixed(0)}%`;
    return `${val.toFixed(0)}%`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);

      const parsedDiscount = parseFloat(formData.discount);
      if (isNaN(parsedDiscount) || parsedDiscount <= 0) {
        throw new Error("El descuento debe ser un número mayor a 0");
      }

      if (!formData.expiringDate) {
        throw new Error("La fecha de vencimiento es obligatoria");
      }

      // Normaliza si el usuario escribió un porcentaje entero (ej: 20 -> 0.2)
      const normalizedDiscount =
        parsedDiscount > 1 ? parsedDiscount / 100 : parsedDiscount;

      const payload: Partial<Coupon> = {
        discount: normalizedDiscount,
        status: formData.status.trim() || "active",
        expiringDate: formData.expiringDate,
      };

      await couponService.add(payload);
      showNotification("Cupón creado con éxito!", "success");
      navigate("/admin/coupons/getAll");
    } catch (err) {
      const msg = errorHandler(err);
      setError(msg);
      showNotification(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin/coupons/getAll");
  };

  return (
    <div className="user-create-container">
      <div className="user-create-header">
        <h2>Crear Nuevo Cupón</h2>
        <p className="user-create-subtitle">
          Complete el formulario para dar de alta un cupón de descuento
        </p>
      </div>

      {error && (
        <div className="error-message">
          <p> {error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="user-create-form">
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
                  Ingrese el valor decimal (ej: 0.15) o porcentaje entero (ej:
                  15)
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
            <small className="form-help">
              <span className="input-help">
                Estado de disponibilidad del cupón
              </span>
            </small>
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
            <small className="form-help">
              <span className="input-help">
                Fecha límite para utilizar el cupón
              </span>
            </small>
          </div>
        </div>

        {formData.discount && formData.expiringDate && (
          <div className="form-preview">
            <h3>Vista previa del cupón:</h3>
            <div className="preview-card">
              <p>
                <strong>Descuento:</strong> {getCalculatedDiscountDisplay()}
              </p>
              <p>
                <strong>Estado:</strong> {formData.status}
              </p>
              <p>
                <strong>Vencimiento:</strong> {formData.expiringDate}
              </p>
            </div>
          </div>
        )}

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
            {saving ? "Creando..." : "Crear Cupón"}
          </button>
        </div>
      </form>
    </div>
  );
}

export const CouponCreate = CouponAdd;
