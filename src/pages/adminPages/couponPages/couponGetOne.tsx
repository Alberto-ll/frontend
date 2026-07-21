import type {Coupon} from '../../../types/couponType.ts'
import { useState } from 'react';
import { useOutletContext } from 'react-router';
import { errorHandler } from '../../../types/apiError.ts';
import { couponService } from '../../../services/index.ts';

export default function CouponGetOne(){
    const [data, setData] = useState<Coupon | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const { showNotification } = useOutletContext<{ showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void }>();

    const getOne = async (id:string) =>{
        try{
            setLoading(true)
            const json = await couponService.getOne(id)
            setData(json)
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
        const id = formData.get("id") as string;
        if (id) {
            getOne(id);
        }
  };
    
    return (
        <div className='crud-form-container'>
            <h2 className='crud-form-title'>Conseguir cupón</h2>
            <form onSubmit={handleSubmit} className='crud-form'>
                <div className='crud-form-item'>
                <label>ID del cupón</label>
                <input name="id" type="number" required />
                </div>
                <div className='crud-form-actions'>
                <button type="submit" className='primary'>Conseguir cupón</button>
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
        </div>
    )
}