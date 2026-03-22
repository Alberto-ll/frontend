import type {Coupon} from '../../../types/couponType.ts'
import { useNavigate, useOutletContext } from 'react-router';
import { couponService } from '../../../services/couponService.ts';
import { useCrud } from '../../../hooks/useCrud.ts';
import { useState } from 'react';
import { COUPON_STATUS } from '../../../helpers/constants.ts';

export default function CouponAdd(){
    const {data, loading, error, execute : addCoupon} = useCrud(() => {
        const coupon:Coupon = {
            id:0,
            discount:Number(formData.discount),
            status:String(formData.status),
            expiringDate:String(formData.expiringDate)
        }
        return couponService.add(coupon)
    }, {manual: true})

    const [formData, setFormData] = useState({
        discount: 0,
        status: '',
        expiringDate: ''
    })

    const { showNotification } = useOutletContext<{ showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void }>();
    const navigate = useNavigate();
    
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if(!Object.values(formData).includes('')){
            addCoupon();
            if(!error) {
                setTimeout(() => {
                    showNotification('Cupón creado con éxito!', 'success')
                    navigate('/admin/coupons/getAll')
                }, 500);   
            }else{
                showNotification('¡No se ha podido crear el botón!', 'error')
            }
        }else{
            showNotification('¡Todos los campos son obligatorios!', 'warning')
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
    <div className='crud-form-container'>
            <h2 className='crud-form-title'>Crear cupón</h2>
            <form onSubmit={handleSubmit} className='crud-form'>
                <div className='crud-form-item'>
                    <label>Porcentaje de descuento</label>
                    <input name="discount" type="number" step="0.01" min={0} max={1} onChange={handleInputChange} value={formData.discount} required/>
                </div>
                <div className='crud-form-item'>
                    <label>Estado del cupón</label>
                    <select name="status" onChange={handleInputChange} value={formData.status} required>
                        {COUPON_STATUS.map((couponStatus) => 
                        <option key={couponStatus} value={couponStatus}>{couponStatus}</option>)}
                    </select>
                </div>
                <div className='crud-form-item'>
                    <label>Fecha de expiración</label>
                    <input type="date" name="expiringDate" onChange={handleInputChange} value={formData.expiringDate} min={new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} required />
                </div>
                <div className='crud-form-actions'>
                    <button onClick={cancel} className='secondary'>Cancelar</button>
                    <button type="submit" className='primary'>Crear</button>
                </div>
            </form>
            <pre>
            {loading && <p>Cargando...</p>}
            {data && (
                <table className='crudTable'>
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
                </table>)}
                </pre>
        </div>)
}