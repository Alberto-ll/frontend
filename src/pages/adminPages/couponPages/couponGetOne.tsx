import { useOutletContext } from 'react-router';
import { couponService } from '../../../services/couponService.ts';
import { useCrud } from '../../../hooks/useCrud.ts';

export default function CouponGetOne(){
    const {data, loading, execute : getCoupon } = useCrud((id:string) => couponService.getOne(id))

    const { showNotification } = useOutletContext<{ showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void }>();


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const id = formData.get("id") as string;
        if (id) {
            try{
                await getCoupon(id)
            } catch(err){
                showNotification('¡No se ha podido obtener el cupón!', 'error')
                console.log(err)
            }
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
        </div>
    )
}