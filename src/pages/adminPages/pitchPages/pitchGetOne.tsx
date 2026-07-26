import type {Pitch} from '../../../types/pitchType.ts'
import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router';
import { errorHandler } from '../../../types/apiError.ts';
import { pitchService } from '../../../services';

export default function PitchGetOne(){
    const [data, setData] = useState<Pitch | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const { id } = useParams<{ id?: string }>();
    const navigate = useNavigate();

    const { showNotification } = useOutletContext<{ showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void }>();

    const getOne = async (id:string) =>{
        try{
            setLoading(true)
            setError(null)
            const json = await pitchService.getOne(id);
            setData(json)
        }catch(error){
            setError(errorHandler(error));
            showNotification(errorHandler(error),'error');
        }finally{
            setLoading(false)
        }
    }

    useEffect(() => {
        if (id) {
            getOne(id);
        }
    }, [id]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const id = formData.get("id") as string;
        if (id) {
            getOne(id);
        }
  };
    
    if (id && loading) {
        return (
            <div className='crud-form-container'>
                <h2 className='crud-form-title'>Conseguir cancha</h2>
                <div className="loading-message">
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    if (id && error && !data) {
        return (
            <div className='crud-form-container'>
                <h2 className='crud-form-title'>Conseguir cancha</h2>
                <div className="error-message">
                    <p>{error}</p>
                </div>
                <button className='primary' onClick={() => navigate('/admin/pitchs/getAll/')}>Volver al listado</button>
            </div>
        );
    }

    return (
        <div className='crud-form-container'>
            <h2 className='crud-form-title'>Conseguir cancha</h2>
            <form onSubmit={handleSubmit} className='crud-form'>
                <div className='crud-form-item'>
                    <label>ID de la cancha</label>
                    <input name="id" type="number" required />
                </div>
                    <div className='crud-form-actions'>
                    <button type="submit" className='primary'>Conseguir cancha</button>
                </div>
            </form>
            {loading && <p>Loading...</p>}
            {data && (
                <table className='crudTable'>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Business ID</th>
                        <th>Rating</th>
                        <th>Price</th>
                        <th>Size</th>
                        <th>Ground type</th>
                        <th>Roof</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{data.id}</td>
                        <td>{typeof data.business === 'object' ? data.business?.id : data.business ?? '-'}</td>
                        <td>{('⭐️').repeat(data.rating)}</td>
                        <td>${data.price}</td>
                        <td>{data.size}</td>
                        <td>{data.groundType}</td>
                        <td>{data.roof ? 'Techado':'Sin techo'}</td>
                    </tr>
                </tbody>
                </table>)}
        </div>
    )
}