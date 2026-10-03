import { useOutletContext } from 'react-router';
import { couponService } from '../../../services/couponService.ts';
import { useCrud } from '../../../hooks/useCrud.ts';

export default function CouponGetAll() {
    const { error : fetchError, loading : fetchLoading, data, execute : refetch} = useCrud(() => couponService.getAll())

    const { execute : removeCoupon} = useCrud((id:number) => couponService.remove(id))

    const { showNotification } = useOutletContext<{ showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void }>();

  const handleDeleteSubmit = async (id:number) => {
        if(confirm("¿Estas seguro que quieres eliminar el cupón seleccionado?")){
            if(id) {
                try {
                    await removeCoupon(id);
                    showNotification('Cupón eliminado con éxito', 'success');
                    refetch(); 
                } catch (err) {
                    showNotification('¡No se ha podido eliminar el cupón! error: ', 'error');
                    console.log(err)
                }
            }
        }
      };
     if (fetchLoading) return 'Loading...';

     if(fetchError) return 'Error obteniendo los cupones';
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
              <td><button className='action-button delete' onClick={() => handleDeleteSubmit(coupon.id)} value={coupon.id}>Eliminar</button></td>
            </tr>
          ))}
                </tbody>
            </table>
        </pre>
    </div>
  );
}