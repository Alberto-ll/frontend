import type {Pitch} from '../../../types/pitchType.ts'
import { useState } from 'react';
import { useOutletContext } from 'react-router';
import { errorHandler } from '../../../types/apiError.ts';
import { pitchService } from '../../../services/pitchService.ts';

export default function PitchGetOne(){
    const [data, setData] = useState<Pitch | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const { showNotification } = useOutletContext<{ showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void }>();

    const getOne = async (id:string) =>{
        try{
            setLoading(true)
            const json:Pitch = await pitchService.getOne(id)
            setData(json)
        }catch(error){
            showNotification(errorHandler(error),'error');
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
            <pre>
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
                        <td>{typeof data.business === 'number' ? data.business : data.business?.id ?? '-' }</td>
                        <td>{('⭐️').repeat(data.rating)}</td>
                        <td>${data.price}</td>
                        <td>{data.size}</td>
                        <td>{data.groundType}</td>
                        <td>{data.roof ? 'Techado':'Sin techo'}</td>
                    </tr>
                </tbody>
                </table>)}
                </pre>
        </div>
    )
}