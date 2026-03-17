import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router';
import { errorHandler } from '../../../types/apiError.ts';
import { pitchService, type PitchResponse } from '../../../services/pitchService.ts';

export default function PitchUpdate(){

    const sizeOptions = [
        { value: '5v5', label: 'Fut 5' },
        { value: '7v7', label: 'Fut 7' },
        { value: '11v11', label: 'Fut 11' }
    ];

    const groundTypeOptions = [
        { value: 'césped natural', label: 'Césped Natural' },
        { value: 'césped sintético', label: 'Césped Sintético'},
        { value: 'cemento', label: 'Cemento' },
        { value: 'arcilla', label: 'Arcilla' },
    ];

    const [data, setData] = useState<PitchResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    
    const { showNotification } = useOutletContext<{ showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void }>();
    const navigate = useNavigate();

    const update = async (pitch: FormData) => {
        try{
            setLoading(true)
            const json: PitchResponse = await pitchService.update(pitch)
            setData(json)
            showNotification('Cancha actualizada con éxito!', 'success')
            navigate('/admin/pitchs/getAll')
        }catch(error){
            showNotification(errorHandler(error),'error');
        }finally{
            setLoading(false)
        }
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        const selectedSize = formData.get("size") as string;
        if (!sizeOptions.some(option => option.value === selectedSize)) {
            showNotification('Por favor, selecciona un tamaño válido', 'error');
            return;
        }

        const selectedGroundType = formData.get("groundType") as string;
        if (!groundTypeOptions.some(option => option.value === selectedGroundType)) {
            showNotification('Por favor, selecciona un tipo de suelo válido', 'error');
            return;
        }

        const pitchData = new FormData();
        
        pitchData.append('business', formData.get("business") as string);
        pitchData.append('rating', formData.get("rating") as string);
        pitchData.append('price', formData.get("price") as string);
        pitchData.append('size', selectedSize);
        pitchData.append('groundType', selectedGroundType);
        pitchData.append('roof', formData.get("roof") ? 'true' : 'false');


        update(pitchData);
    };;

    return (
        <div className='crud-form-container'>
            <h2 className='crud-form-title'>Actualizar cancha</h2>
            <form onSubmit={handleSubmit} className='crud-form'>
                <div className='crud-form-item'>
                    <label>ID de cancha *</label>
                    <input 
                        type="number" 
                        name="id" 
                        required 
                        min="1"
                        placeholder="Ingrese el ID de la cancha"
                    />
                </div>
                
                <div className='crud-form-item'>
                    <label>Rating (1-5)</label>
                    <input 
                        name="rating" 
                        type="number" 
                        min="1" 
                        max="5" 
                        step="0.1"
                        placeholder="Opcional - Rating de 1 a 5" 
                    />
                </div>
                
                <div className='crud-form-item'>
                    <label>Precio ($)</label>
                    <input 
                        name="price" 
                        type="number" 
                        min="0" 
                        step="100"
                        placeholder="Opcional - Precio por hora" 
                    />
                </div>
                
                <div className='crud-form-item'>
                    <label>Tamaño</label>
                    <select name="size">
                        <option value="">Seleccionar tamaño (opcional)</option>
                        {/* Tamaños específicos para fútbol */}
                        <option value="5v5">5v5 (Fútbol 5) - 20x40m</option>
                        <option value="7v7">7v7 (Fútbol 7) - 40x60m</option>
                        <option value="11v11">11v11 (Fútbol 11) - 90x120m</option>
                    </select>
                    <small className="form-help">
                        🏃 5v5: 20x40m | 7v7: 40x60m | 11v11: 90x120m
                    </small>
                </div>
                
                <div className='crud-form-item'>
                    <label>Tipo de suelo</label>
                    <select name="groundType">
                        <option value="">Seleccionar tipo (opcional)</option>
                        <option value="césped natural">Césped natural</option>
                        <option value="césped sintético">Césped sintético</option>
                        <option value="cemento">Cemento</option>
                        <option value="arcilla">Arcilla</option>
                    </select>
                </div>
                
                <div className='crud-form-item'>
                    <label>
                        <input type="checkbox" name="roof" />
                        Tiene techo
                    </label>
                </div>
                
                <div className='crud-form-actions'>
                    <button type="submit" className='primary' disabled={loading}>
                        {loading ? 'Actualizando...' : 'Actualizar'}
                    </button>
                </div>
            </form>
            
            {loading && (
                <div className="loading-message">
                    <p>⏳ Actualizando cancha...</p>
                </div>
            )}
            
            {data && (
                <div className="success-result">
                    <h3>✅ Cancha actualizada exitosamente</h3>
                    <table className='crudTable'>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>ID de negocio asociado</th>
                                <th>Rating</th>
                                <th>Precio</th>
                                <th>Tamaño</th>
                                <th>Tipo de suelo</th>
                                <th>Techo</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{data.data.id}</td>
                                <td>{typeof data.data.business === 'number' ? data.data.business : data.data.business?.id ?? '-' }</td>
                                <td>{('⭐️').repeat(Math.floor(data.data.rating))} ({data.data.rating})</td>
                                <td>${data.data.price.toLocaleString()}</td>
                                <td>
                                    {data.data.size === '5v5' && '5v5 (20x40m)'}
                                    {data.data.size === '7v7' && '7v7 (40x60m)'}
                                    {data.data.size === '11v11' && '11v11 (90x120m)'}
                                    {!['5v5', '7v7', '11v11'].includes(data.data.size) && data.data.size}
                                </td>
                                <td>{data.data.groundType}</td>
                                <td>{data.data.roof ? '✅ Con techo' : '❌ Sin techo'}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}