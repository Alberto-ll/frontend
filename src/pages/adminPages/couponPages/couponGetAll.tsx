import { useEffect, useState, useCallback } from 'react';
import type {Coupon} from '../../../types/couponType.ts'
import { useOutletContext } from 'react-router';
import { errorHandler } from '../../../types/apiError.ts';
import { couponService } from '../../../services/index.ts';
import DeleteConfirm from '../../../components/deleteConfirm';

export default function CouponGetAll() {
    const [data, setData] = useState<Coupon[] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [ error, setError ] = useState<boolean>(false);
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        couponId: null as number | null,
        couponName: '',
        isLoading: false
    });

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
    
    const handleDeleteClick = (couponId: number, couponName: string) => {
        setDeleteModal({
            isOpen: true,
            couponId,
            couponName,
            isLoading: false,
        });
    };

    const handleCancelDelete = () => {
        setDeleteModal({
            isOpen: false,
            couponId: null,
            couponName: '',
            isLoading: false,
        });
    };

    const handleConfirmDelete = async () => {
        if (!deleteModal.couponId) return;

        try {
            setDeleteModal((prev) => ({ ...prev, isLoading: true }));
            await couponService.remove(deleteModal.couponId);
            handleCancelDelete();
            showNotification('Cupón eliminado con éxito', 'success');
            getAll();
        } catch (error) {
            setDeleteModal((prev) => ({ ...prev, isLoading: false }));
            showNotification(errorHandler(error), 'error');
        }
    };

     if (loading) return 'Loading...';
  return (
    <div>
        <DeleteConfirm
            isOpen={deleteModal.isOpen}
            title="Confirmar Eliminación de Cupón"
            message="¿Estás seguro de que quieres eliminar este cupón?"
            itemName={deleteModal.couponName}
            onConfirm={handleConfirmDelete}
            onCancel={handleCancelDelete}
            confirmText="Eliminar Cupón"
            cancelText="Cancelar"
            isLoading={deleteModal.isLoading}
        />
        <table className='crudTable'>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Discount</th>
                    <th>Status</th>
                    <th>Expiring Date</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {data?.map((coupon) => (
                    <tr key={coupon.id}>
                        <td>{coupon.id}</td>
                        <td>{coupon.discount}</td>
                        <td>{coupon.status}</td>
                        <td>{coupon.expiringDate}</td>
                        <td>
                            <button
                                className='action-button delete'
                                onClick={() => handleDeleteClick(coupon.id, `Cupón ${coupon.id}`)}
                            >
                                Eliminar
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
  );
}
