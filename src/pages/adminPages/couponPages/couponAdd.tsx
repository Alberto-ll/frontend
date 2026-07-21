import { useState } from 'react';
import type {Coupon} from '../../../types/couponType.ts'
import { useNavigate, useOutletContext } from 'react-router';
import { errorHandler } from '../../../types/apiError.ts';
import { couponService } from '../../../services/index.ts';

export default function CouponAdd(){
    const [data, setData] = useState<Coupon | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const { showNotification } = useOutletContext<{ showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void }>();
    const navigate = useNavigate();
    
    const add = async (coupon:Coupon) =>{
        try{
            setLoading(true)
            const json = await couponService.add(coupon)
            setData(json)
            showNotification('Cupón actualizado con éxito!', 'success')
            navigate('/admin/coupons/getAll')
        }catch(error){
            showNotification(errorHandler(error), 'error');
            setLoading(false)
        }finally{
            setLoading(false)
        }
    }
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const coupon:Coupon = {
            id:0,
            discount:Number(formData.get("discount")),
            status:String(formData.get("status")),
            expiringDate:String(formData.get("expiringDate"))
        }
        if(coupon) {
            add(coupon);
        }
      };

      const cancel = () => {
        navigate('/admin/coupons')
      }

    return (
    <div className='crud-form-container'>
            <h2 className='crud-form-title'>Crear cupón</h2>
            <form onSubmit={handleSubmit} className='crud-form'>
                <div className='crud-form-item'>
                    <label>Discount</label>
                    <input name="discount" type="number" required step="0.01" max={1}/>
                </div>
                <div className='crud-form-item'>
                    <label>Status</label>
                    <input type="text" name="status" required />
                </div>
                <div className='crud-form-item'>
                    <label>Expiring Date</label>
                    <input type="date" name="expiringDate" required />
                </div>
                <div className='crud-form-actions'>
                    <button onClick={cancel} className='secondary'>Cancelar</button>
                    <button type="submit" className='primary'>Crear</button>
                </div>
            </form>
            <pre>
            {loading && <p>Loading...</p>}
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