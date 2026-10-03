import { useState } from 'react';
import type {Coupon} from '../../../types/couponType.ts'
import { useNavigate, useOutletContext } from 'react-router';
import { couponService } from '../../../services/couponService.ts';
import { useCrud } from '../../../hooks/useCrud.ts';
import { COUPON_STATUS } from '../../../helpers/constants.ts';


export default function CouponUpdate(){
    const {data, loading, execute : updateCoupon} = useCrud((coupon:Coupon) => couponService.update(coupon), {manual: true})

    const [formData, setFormData] = useState({
        id: 0,
        discount: 0,
        status: COUPON_STATUS[0],
        expiringDate: ''
    })
    
    const { showNotification } = useOutletContext<{ showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void }>();
    const navigate = useNavigate()

    const discountPercentageDisplay = (formData.discount * 100).toFixed(1);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if(!Object.values(formData).includes('')) {
                try{
                    const couponToUpdate: Coupon = {
                        id: Number(formData.id),
                        discount: Number(formData.discount),
                        status: String(formData.status),
                        expiringDate: String(formData.expiringDate)
                    }
                    await updateCoupon(couponToUpdate);
                    showNotification('¡Cupón actualizado con éxito!', 'success')
                    navigate('/admin/coupons/getAll/')
                }catch(err){
                    showNotification('¡No se ha podido actualizar el cupón! error: '+err, 'error');
                }
        }else{
            showNotification('Todos los campos son obligatorios.', 'warning')
        }
      };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
        ...prev,
        [name]: value
        }));
    };

    const cancel = () => {
        navigate('/admin/coupons')
      }



    return (
      <div className="crud-form-container">
        <h2 className="crud-form-title">Actualizar cupón</h2>
        <form onSubmit={handleSubmit} className="crud-form">
          <div className="crud-form-item">
            <label>ID del cupón</label>
            <input type="number" name="id" onChange={handleInputChange} value={formData.id} required />
          </div>
          <div className='crud-form-item'>
                    <label htmlFor="discount">
                    Porcentaje de descuento ({discountPercentageDisplay}%)
                    </label>
                    <input
                    type="range"
                    id="discount"
                    name="discount"
                    value={formData.discount}
                    onChange={handleInputChange}
                    min="0"
                    max="1"
                    step="0.05"
                    className="form-input"
                    />
                    <small className="form-help">
                    Porcentaje del total de descuento (0% a 100%)
                    </small>
            </div>
          <div className="crud-form-item">
            <label>Estado del cupón</label>
            <select
              name="status"
              onChange={handleInputChange}
              value={formData.status}
              required
            >
              {COUPON_STATUS.map((couponStatus) => (
                <option key={couponStatus} value={couponStatus}>
                  {couponStatus}
                </option>
              ))}
            </select>
          </div>
          <div className="crud-form-item">
            <label>Fecha de expiración</label>
            <input
              type="date"
              name="expiringDate"
              onChange={handleInputChange}
              value={formData.expiringDate}
              min={
                new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
                  .toISOString()
                  .split("T")[0]
              }
              required
            />
          </div>
          <div className="crud-form-actions">
            <button type="button" onClick={cancel} className="secondary">
              Cancelar
            </button>
            <button type="submit" className="primary">
              Actualizar
            </button>
          </div>
        </form>
        <pre>
          {loading && <p>Loading...</p>}
          {data && (
            <table className="couponTable">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Discount</th>
                  <th>Status</th>
                  <th>Expiring Date</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{data.id}</td>
                  <td>{data.discount}</td>
                  <td>{data.status}</td>
                  <td>{data.expiringDate}</td>
                </tr>
              </tbody>
            </table>
          )}
        </pre>
      </div>
    );
}