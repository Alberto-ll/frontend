import { useEffect, useState, useCallback } from 'react';
import type {Coupon} from '../../../types/couponType.ts'
import { useOutletContext } from 'react-router';
import { errorHandler } from '../../../types/apiError.ts';
import { couponService } from '../../../services/index.ts';

export default function CouponGetAll() {
    const [data, setData] = useState<Coupon[] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [ error, setError ] = useState<boolean>(false);

    const { showNotification } = useOutletContext<{ showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void }>();

    const getAll = useCallback(async () =>{
            try{
                setLoading(true)
                const json = await couponService.getAll()
                setData(json)
            }catch(error){
                showNotification(errorHandler(error), 'error');
                setError(true);
                setLoading(false)
            }finally{
                setLoading(false)
            }
        }, [showNotification])

        useEffect(()=>{
            if(!error){
                getAll();
            }
        }, [error, getAll])
    
    const remove = async (id:number) =>{
            try{
                setLoading(true)
                await couponService.remove(id)
                showNotification('Cupón eliminado con éxito!', 'success')
                getAll();
            }catch(error){
                 showNotification(errorHandler(error), 'error');
            }
        }

  const handleDeleteSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
        if(confirm("¿Estas seguro que quieres eliminar el cupón seleccionado?")){
            if(e.currentTarget.value) {
                remove(Number(e.currentTarget.value));
            }
        }
      };
     if (loading) return 'Loading...';
  return (
    <div>
        <pre>
            <table className='crudTable'>
                <thead>
                    <th>ID</th>
                    <th>Discount</th>
                    <th>Status</th>
                    <th>Expiring Date</th>
                    <th></th>
                </thead>
                <tbody>
                    {data?.map((coupon) => (
            <tr key={coupon.id}>
              <td>{coupon.id}</td>
              <td>{coupon.discount}</td>
              <td>{coupon.status}</td>
              <td>{coupon.expiringDate}</td>
              <td><button className='action-button delete' onClick={handleDeleteSubmit} value={coupon.id}>Eliminar</button></td>
            </tr>
          ))}
                </tbody>
            </table>
        </pre>
    </div>
  );
}