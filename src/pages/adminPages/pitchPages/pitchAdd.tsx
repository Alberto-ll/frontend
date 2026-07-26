import { useCallback, useEffect, useState } from 'react';
import type {Pitch} from '../../../types/pitchType.ts'
import { useNavigate, useOutletContext } from 'react-router';
import type { BusinessData } from '../../../types/businessType.ts';
import { errorHandler } from '../../../types/apiError.ts';
import { pitchService, businessService } from '../../../services';

export default function PitchAdd(){
    const [data, setData] = useState<Pitch | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [businesses, setBusinesses] = useState<BusinessData[]>([]);
    
    const { showNotification } = useOutletContext<{ showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void }>();
    const navigate = useNavigate();

    // Opciones válidas para el tamaño
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

    const add = async (pitchData: FormData) => {
        try {
            setLoading(true);

            const json = await pitchService.add(pitchData) as Pitch;
            setData(json);
            showNotification('Cancha creada con éxito', 'success');
            navigate('/admin/pitchs/getAll');
        } catch (error) {
            showNotification(errorHandler(error), 'error');
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        // Validar que se haya seleccionado un tamaño válido
        const selectedSize = formData.get("size") as string;
        if (!sizeOptions.some(option => option.value === selectedSize)) {
            showNotification('Por favor, selecciona un tamaño válido', 'error');
            return;
        }

        // Validar que se haya seleccionado un tipo de suelo válido
        const selectedGroundType = formData.get("groundType") as string;
        if (!groundTypeOptions.some(option => option.value === selectedGroundType)) {
            showNotification('Por favor, selecciona un tipo de suelo válido', 'error');
            return;
        }

        // Crear FormData
        const pitchData = new FormData();

        // Agregar campos individualmente
        pitchData.append('business', formData.get("business") as string);
        pitchData.append('rating', formData.get("rating") as string);
        // Normalizar price a float con 2 decimales para backend
        const rawPrice = formData.get("price");
        const parsedPrice = parseFloat(String(rawPrice));
        if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
            showNotification('Precio inválido', 'error');
            setLoading(false);
            return;
        }
        pitchData.append('price', parsedPrice.toFixed(2));
        pitchData.append('size', selectedSize);
        pitchData.append('groundType', selectedGroundType);
        pitchData.append('roof', formData.get("roof") ? 'true' : 'false');
        
        // Agregar la imagen si existe
        if (imageFile) {
            pitchData.append('image', imageFile);
        }

        add(pitchData);
    };

    const fetchBusinesses = useCallback(async () => {
        try {
            const json = await businessService.findAll();
            setBusinesses(json);
        } catch (error) {
            showNotification(errorHandler(error), 'error');
            return [];
        }
    },[showNotification]);
    useEffect(() => {
        fetchBusinesses();
    }, [fetchBusinesses]);
    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    };

    return (
        <div className='crud-form-container'>
            <h2 className='crud-form-title'>Crear cancha</h2>
            <form onSubmit={handleSubmit} className='crud-form' encType="multipart/form-data">
                <div className='crud-form-item'>
                    <label>ID de negocio asociado</label>
                    <select name="business" required>
                        <option value="">Selecciona un negocio</option>
                        {businesses.map(business => (
                            <option key={business.id} value={business.id}>
                                {business.businessName} (ID: {business.id})
                            </option>
                        ))}
                    </select>
                </div>
                <div className='crud-form-item'>
                    <label>Rating</label>
                    <input name="rating" type="number" min="1" max="5" required />
                </div>
                <div className='crud-form-item'>
                    <label>Precio</label>
                    <input name="price" type="number" step="0.01" required />
                </div>
                <div className='crud-form-item'>
                    <label>Tamaño de cancha</label>
                    <select name="size" required>
                        <option value="">Selecciona un tamaño</option>
                        {sizeOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className='crud-form-item'>
                    <label>Tipo de suelo</label>
                    <select name="groundType" required>
                        <option value="">Selecciona un tipo de suelo</option>
                        {groundTypeOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className='crud-form-item'>
                    <label className='checkbox-label'>
                        <input type="checkbox" name="roof" />
                        <span>Techo</span>
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
                    <small>Formatos aceptados: JPG, PNG, WEBP. Máximo 5MB</small>
                    
                    {imagePreview && (
                        <div className='image-preview-container'>
                            <p>Vista previa:</p>
                            <div className='image-preview'>
                                <img src={imagePreview} alt="Vista previa de la cancha" />
                                <button 
                                    type="button" 
                                    onClick={removeImage}
                                    className='remove-image-btn'
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className='crud-form-actions'>
                    <button type="submit" className='primary' disabled={loading}>
                        {loading ? 'Creando...' : 'Crear'}
                    </button>
                </div>
            </form>

            {(loading || data) && (
                <div>
                    {loading && <p>Cargando...</p>}
                    {data && (
                        <table className='crudTable'>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Business</th>
                                    <th>Rating</th>
                                    <th>Price</th>
                                    <th>Size</th>
                                    <th>Ground type</th>
                                    <th>Roof</th>
                                    <th>Imagen</th>
                                    <th>Creado</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>{data.id}</td>
                                    <td>{typeof data.business === 'object' ? data.business?.id : data.business}</td>
                                    <td>{('⭐️').repeat(data.rating)}</td>
                                    <td>${data.price}</td>
                                    <td>{data.size}</td>
                                    <td>{data.groundType}</td>
                                    <td>{data.roof ? 'Techado' : 'Sin techo'}</td>
                                    <td>
                                        {data.imageUrl ? (
                                            <img 
                                                src={data.imageUrl} 
                                                alt="Cancha"
                                                style={{width: '50px', height: '50px', objectFit: 'cover'}}
                                            />
                                        ) : 'Sin imagen'}
                                    </td>
                                    <td>{new Date(data.createdAt).toLocaleDateString()}</td>
                                </tr>
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
}