import { useCallback, useEffect, useState,} from 'react'; 
import type {ChangeEvent, FormEvent } from 'react';
import type { Pitch } from '../../types/pitchType.ts';
import { useNavigate, useOutletContext, useParams } from 'react-router';
import { errorHandler } from '../../types/apiError.ts';
import { useAuth } from '../../components/Auth.tsx';
import { pitchService } from '../../services';

interface PitchFormData {
    rating: number | string;
    price: number | string;
    size: string;
    groundType: string;
    roof: boolean;
}

export default function BusinessPitchEdit() {
    const { id } = useParams<{ id: string }>();

    const [pitch, setPitch] = useState<Pitch | null>(null);
    const [formData, setFormData] = useState<PitchFormData>({
        rating: '',
        price: '',
        size: '',
        groundType: '',
        roof: false
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true); // Inicia en true

    const { showNotification } = useOutletContext<{ showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void }>();
    const navigate = useNavigate();
    const { token, isLoading } = useAuth();


    const getOne = useCallback(async () => {
        if (!token || !id) { 
            return;
        }
        try {
            setLoading(true);
            const json = await pitchService.getOne(id);
            setPitch(json);
            setFormData({
                rating: json.rating || '',
                price: json.price || '',
                size: json.size || '',
                groundType: json.groundType || '',
                roof: json.roof || false
            });

        } catch (error) {
            console.error('Error obteniendo cancha:', error);
            showNotification(errorHandler(error), 'error');
        } finally {
            setLoading(false);
        }
    }, [showNotification, token, id]);

    useEffect(() => {
        if (!isLoading && id) {
            getOne();
        }
    }, [id, getOne, isLoading]);


    const update = async (pitchData: Partial<Pitch>, image: File | null) => {
        try {
            setLoading(true);
            
            const payload = new FormData();

            if (pitchData.rating) payload.append('rating', pitchData.rating.toString());
            if (pitchData.price !== undefined) {
                const priceNum = typeof pitchData.price === 'number' ? pitchData.price : Number(pitchData.price);
                if (!Number.isNaN(priceNum)) payload.append('price', priceNum.toFixed(2));
            }
            if (pitchData.size) payload.append('size', pitchData.size);
            if (pitchData.groundType) payload.append('groundType', pitchData.groundType);
            if (pitchData.roof !== undefined) payload.append('roof', pitchData.roof.toString());
            if (image) {
                payload.append('image', image); 
            }
            payload.append('business', (typeof pitch?.business === 'object' ? pitch?.business?.id : pitch?.business)?.toString() || '');
            
            await pitchService.update(id!, payload);
            showNotification('Cancha actualizada con éxito!', 'success');
            navigate('/myBusiness/getAll');
        } catch (error) {
            showNotification(errorHandler(error), 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({
                ...prev,
                [name]: checked
            }));
        } else {
                setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (!id) {
            showNotification('No se encontró el ID de la cancha', 'error');
            return;
        }

        const pitchUpdate: Partial<Pitch> = {};

        if (formData.rating && formData.rating.toString().trim() !== '') {
            const rating = Number(formData.rating);
            if (!isNaN(rating) && rating >= 1 && rating <= 5) {
                pitchUpdate.rating = rating;
            } else {
                showNotification('El rating debe ser un número entre 1 y 5', 'error');
                return;
            }
        }

        if (formData.price && formData.price.toString().trim() !== '') {
            const price = Number(formData.price);
            if (!isNaN(price) && price > 0) {
                pitchUpdate.price = price;
            } else {
                showNotification('El precio debe ser un número mayor a 0', 'error');
                return;
            }
        }
        
        if (formData.size && formData.size.trim() !== '') {
            pitchUpdate.size = formData.size.trim();
        }
        if (formData.groundType && formData.groundType.trim() !== '') {
            pitchUpdate.groundType = formData.groundType.trim();
        }

        pitchUpdate.roof = formData.roof;
        

        if (Object.keys(pitchUpdate).length === 0 && !imageFile) {
            showNotification('Debe modificar al menos un campo o agregar una imagen para actualizar', 'warning');
            return;
        }

        update(pitchUpdate, imageFile);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
         const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                showNotification('Por favor, selecciona un archivo de imagen válido', 'error');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                showNotification('La imagen no debe superar los 5MB', 'error');
                return;
            }
            setImageFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    };

    if (isLoading || loading && !pitch) {
        return <div>Cargando datos de la cancha...</div>
    }

    return (
        <div className='crud-form-container'>
            <h2 className='crud-form-title'>Actualizar cancha (ID: {id})</h2>
            <form onSubmit={handleSubmit} className='crud-form'>
                <div className='crud-form-item'>
                    <label>Rating (1-5)</label>
                    <input 
                        name="rating" 
                        type="number" 
                        min="1" 
                        max="5" 
                        step="0.1"
                        placeholder="Opcional - Rating de 1 a 5" 
                        value={formData.rating} 
                        onChange={handleChange} 
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
                        value={formData.price} 
                        onChange={handleChange} 
                    />
                </div>
                
                <div className='crud-form-item'>
                    <label>Tamaño</label>
                    <select 
                        name="size" 
                        value={formData.size} 
                        onChange={handleChange} 
                    >
                        {/* ... (tus options) ... */}
                        <option value="">Seleccionar tamaño (opcional)</option>
                        <option value="5v5">5v5 (Fútbol 5) - 20x40m</option>
                        <option value="7v7">7v7 (Fútbol 7) - 40x60m</option>
                        <option value="11v11">11v11 (Fútbol 11) - 90x120m</option>
                    </select>
                </div>
                
                <div className='crud-form-item'>
                    <label>Tipo de suelo</label>
                    <select 
                        name="groundType" 
                        value={formData.groundType} 
                        onChange={handleChange} 
                    >
                        {/* ... (tus options) ... */}
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
                            name="roof" 
                            checked={formData.roof} 
                            onChange={handleChange} 
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
                        onChange={handleImageChange}
                    />
                    {imagePreview && (
                        <div className='image-preview-container'>
                            <p>Vista previa:</p>
                            <div className='image-preview'>
                                <img src={imagePreview} alt="Vista previa de la cancha" />
                                <button type="button" onClick={removeImage} className='remove-image-btn'>×</button>
                            </div>
                        </div>
                    )}
                </div>
                
                <div className='crud-form-actions'>
                    <button type="submit" className='primary' disabled={loading}>
                        {loading ? 'Actualizando...' : 'Actualizar'}
                    </button>
                </div>
            </form>
        </div>
    )
}