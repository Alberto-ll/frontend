import { useCallback, useEffect, useRef, useState } from 'react';
import type {Pitch} from '../../../types/pitchType.ts'
import { useNavigate, useOutletContext, useParams } from 'react-router';
import { errorHandler } from '../../../types/apiError.ts';
import { pitchService } from '../../../services';

export default function PitchUpdate(){
    const [data, setData] = useState<Pitch | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [currentPitch, setCurrentPitch] = useState<Pitch | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        id: '',
        rating: '',
        price: '',
        size: '',
        groundType: '',
        roof: false,
    });
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const { id: routeId } = useParams<{ id?: string }>();
    
    const { showNotification } = useOutletContext<{ showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void }>();
    const showNotificationRef = useRef(showNotification);
    showNotificationRef.current = showNotification;
    const navigate = useNavigate();

    const applyPitch = useCallback((json: Pitch, fallbackId?: string) => {
        setCurrentPitch(json);
        setFormData({
            id: String(json.id ?? fallbackId ?? ''),
            rating: json.rating !== undefined && json.rating !== null ? String(json.rating) : '',
            price: json.price !== undefined && json.price !== null ? String(json.price) : '',
            size: json.size ?? '',
            groundType: json.groundType ?? '',
            roof: Boolean(json.roof),
        });
        setImagePreview(json.imageUrl ?? null);
    }, []);

    const loadPitchById = useCallback(async (pitchId: string) => {
        if (!pitchId) {
            setError('Debes indicar un ID de cancha');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const json = await pitchService.getOne(pitchId);
            applyPitch(json, pitchId);
        } catch (error) {
            setCurrentPitch(null);
            setError(errorHandler(error));
            showNotificationRef.current(errorHandler(error), 'error');
        } finally {
            setLoading(false);
        }
    }, [applyPitch]);

    useEffect(() => {
        if (routeId) {
            loadPitchById(routeId);
            return;
        }

        setLoading(false);
    }, [routeId, loadPitchById]);

    const update = async (pitch: Partial<Pitch> & { id: number }, selectedImage?: File | null) => {
        try{
            setLoading(true)
            
            const payload = new FormData();
            
            if (pitch.rating !== undefined && pitch.rating > 0) {
                payload.append('rating', String(pitch.rating));
            }
            if (pitch.price !== undefined && pitch.price > 0) {
                payload.append('price', String(pitch.price));
            }
            if (pitch.size !== undefined && pitch.size.trim() !== '') {
                payload.append('size', pitch.size.trim());
            }
            if (pitch.groundType !== undefined && pitch.groundType.trim() !== '') {
                payload.append('groundType', pitch.groundType.trim());
            }
            if (pitch.roof !== undefined) {
                payload.append('roof', String(pitch.roof));
            }
            if (selectedImage) {
                payload.append('image', selectedImage);
            }

            const json = await pitchService.update(pitch.id, payload);
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
        const pitchId = Number(routeId ?? formData.id);
        if (!pitchId || isNaN(pitchId)) {
            showNotification('El ID de cancha debe ser un número válido', 'error');
            return;
        }
        const pitch: Partial<Pitch> & { id: number } = {
            id: pitchId
        };
        const ratingValue = formData.rating;
        if (ratingValue && ratingValue.trim() !== '') {
            const rating = Number(ratingValue);
            if (!isNaN(rating) && rating >= 1 && rating <= 5) {
                pitch.rating = rating;
            } else {
                showNotification('El rating debe ser un número entre 1 y 5', 'error');
                return;
            }
        }

        const priceValue = formData.price;
        if (priceValue && priceValue.trim() !== '') {
            const price = Number(priceValue);
            if (!isNaN(price) && price > 0) {
                pitch.price = price;
            } else {
                showNotification('El precio debe ser un número mayor a 0', 'error');
                return;
            }
        }

        const sizeValue = formData.size;
        if (sizeValue && sizeValue.trim() !== '') {
            pitch.size = sizeValue.trim();
        }

        const groundTypeValue = formData.groundType;
        if (groundTypeValue && groundTypeValue.trim() !== '') {
            pitch.groundType = groundTypeValue.trim();
        }

        pitch.roof = formData.roof;

        const imageValue = (e.currentTarget.elements.namedItem('image') as HTMLInputElement | null)?.files?.[0] ?? null;
        const selectedImage = imageValue instanceof File && imageValue.size > 0 ? imageValue : null;

        // Verificar que al menos un campo se va a actualizar
        const { id, ...fieldsToUpdate } = pitch;
        if (Object.keys(fieldsToUpdate).length === 0) {
            showNotification('Debe completar al menos un campo para actualizar', 'warning');
            return;
        }

        update(pitch, selectedImage);
    };

    const handleLoadById = async () => {
        const pitchId = formData.id.trim();
        await loadPitchById(pitchId);
    };

    return (
        <div className='crud-form-container' style={{ maxWidth: '1200px', width: '100%' }}>
            <h2 className='crud-form-title'>Actualizar cancha</h2>

            {!routeId && (
                <div className='crud-form-item' style={{ marginBottom: '1rem' }}>
                    <label>ID de cancha para cargar</label>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <input
                            type="number"
                            value={formData.id}
                            onChange={(event) => setFormData((prev) => ({ ...prev, id: event.target.value }))}
                            min="1"
                            placeholder="Ingrese el ID de la cancha"
                            style={{ flex: 1 }}
                        />
                        <button type="button" className="primary" onClick={handleLoadById} disabled={loading}>
                            Cargar cancha
                        </button>
                    </div>
                </div>
            )}

            {routeId && loading && !currentPitch && (
                <div className="loading-message" style={{ marginBottom: '1rem' }}>
                    <p>Cargando datos de la cancha...</p>
                </div>
            )}

            {error && !currentPitch && (
                <div className="error-message" style={{ marginBottom: '1rem' }}>
                    <p>{error}</p>
                </div>
            )}

            {currentPitch && (
                <div className="success-result" style={{ marginBottom: '1.5rem' }}>
                    <h3>📋 Datos actuales</h3>
                    <div style={{ width: '100%' }}>
                        <table className='crudTable' style={{ width: '100%', tableLayout: 'fixed' }}>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Business</th>
                                    <th>Rating</th>
                                    <th>Precio</th>
                                    <th>Tamaño</th>
                                    <th>Tipo de suelo</th>
                                    <th>Techo</th>
                                    <th>Imagen</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>{currentPitch.id}</td>
                                    <td>{typeof currentPitch.business === 'object' ? currentPitch.business?.id : currentPitch.business ?? '-'}</td>
                                    <td>{('⭐️').repeat(Math.floor(currentPitch.rating))} ({currentPitch.rating})</td>
                                    <td>${currentPitch.price?.toLocaleString?.() ?? currentPitch.price}</td>
                                    <td style={{ wordBreak: 'break-word' }}>
                                        {currentPitch.size === '5v5' && '5v5 (20x40m)'}
                                        {currentPitch.size === '7v7' && '7v7 (40x60m)'}
                                        {currentPitch.size === '11v11' && '11v11 (90x120m)'}
                                        {!['5v5', '7v7', '11v11'].includes(currentPitch.size) && currentPitch.size}
                                    </td>
                                    <td style={{ wordBreak: 'break-word' }}>{currentPitch.groundType}</td>
                                    <td>{currentPitch.roof ? '✅ Con techo' : '❌ Sin techo'}</td>
                                    <td>
                                        {currentPitch.imageUrl ? (
                                            <img
                                                src={currentPitch.imageUrl}
                                                alt={`Cancha ${currentPitch.id}`}
                                                style={{ width: '50px', height: '34px', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            'Sin imagen'
                                        )}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className='crud-form'>
                <input type="hidden" name="id" value={formData.id} />

                {currentPitch && (
                    <div className="loading-message" style={{ marginBottom: '1rem' }}>
                        <p>Editando cancha ID {currentPitch.id}</p>
                    </div>
                )}
                
                <div className='crud-form-item'>
                    <label>Rating (1-5)</label>
                    <input 
                        type="number" 
                        min="1" 
                        max="5" 
                        step="0.1"
                        placeholder="Opcional - Rating de 1 a 5"
                        value={formData.rating}
                        onChange={(event) => setFormData((prev) => ({ ...prev, rating: event.target.value }))}
                    />
                </div>
                
                <div className='crud-form-item'>
                    <label>Precio ($)</label>
                    <input 
                        type="number" 
                        min="0" 
                        step="0.01"
                        placeholder="Opcional - Precio por hora"
                        value={formData.price}
                        onChange={(event) => setFormData((prev) => ({ ...prev, price: event.target.value }))}
                    />
                </div>
                
                <div className='crud-form-item'>
                    <label>Tamaño</label>
                    <select
                        value={formData.size}
                        onChange={(event) => setFormData((prev) => ({ ...prev, size: event.target.value }))}
                    >
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
                    <select
                        value={formData.groundType}
                        onChange={(event) => setFormData((prev) => ({ ...prev, groundType: event.target.value }))}
                    >
                        <option value="">Seleccionar tipo (opcional)</option>
                        <option value="césped natural">Césped natural</option>
                        <option value="césped sintético">Césped sintético</option>
                        <option value="cemento">Cemento</option>
                        <option value="arcilla">Arcilla</option>
                    </select>
                </div>
                
                <div className='crud-form-item'>
                    <label>
                        <input
                            type="checkbox"
                            checked={formData.roof}
                            onChange={(event) => setFormData((prev) => ({ ...prev, roof: event.target.checked }))}
                        />
                        Tiene techo
                    </label>
                </div>

                <div className='crud-form-item'>
                    <label>Imagen de la cancha</label>
                    <input
                        type="file"
                        name="image"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0] ?? null;
                            if (!file) {
                                setImagePreview(currentPitch?.imageUrl ?? null);
                                return;
                            }

                            if (!file.type.startsWith('image/')) {
                                showNotification('Por favor, selecciona un archivo de imagen válido', 'error');
                                return;
                            }

                            const reader = new FileReader();
                            reader.onload = (event) => {
                                setImagePreview(event.target?.result as string);
                            };
                            reader.readAsDataURL(file);
                        }}
                    />
                    <small>Formatos aceptados: JPG, PNG, WEBP. Máximo 5MB</small>

                    {imagePreview || currentPitch?.imageUrl ? (
                        <div className="image-preview-container" style={{ marginTop: '1rem' }}>
                            <p>Vista previa:</p>
                            <div className="image-preview">
                                <img
                                    src={imagePreview ?? currentPitch?.imageUrl}
                                    alt="Vista previa de la cancha"
                                    style={{ width: '160px', height: '100px', objectFit: 'cover' }}
                                />
                            </div>
                        </div>
                    ) : null}
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
                    <div style={{ width: '100%' }}>
                        <table className='crudTable' style={{ width: '100%', tableLayout: 'fixed' }}>
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
                                    <td>{data.id}</td>
                                    <td>{typeof data.business === 'object' ? data.business?.id : data.business ?? '-'}</td>
                                    <td>{('⭐️').repeat(Math.floor(data.rating))} ({data.rating})</td>
                                    <td>${data.price.toLocaleString()}</td>
                                    <td style={{ wordBreak: 'break-word' }}>
                                        {data.size === '5v5' && '5v5 (20x40m)'}
                                        {data.size === '7v7' && '7v7 (40x60m)'}
                                        {data.size === '11v11' && '11v11 (90x120m)'}
                                        {!['5v5', '7v7', '11v11'].includes(data.size) && data.size}
                                    </td>
                                    <td style={{ wordBreak: 'break-word' }}>{data.groundType}</td>
                                    <td>{data.roof ? '✅ Con techo' : '❌ Sin techo'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}