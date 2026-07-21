import { useState, useCallback, useEffect } from 'react';
import type { Pitch } from '../../types/pitchType.ts';
import { useNavigate, useOutletContext } from 'react-router';
import { useAuth } from '../../components/Auth.tsx';
import { businessService, pitchService } from '../../services';
import { errorHandler } from '../../types/apiError.ts';

export default function PitchAdd() {
    const [data, setData] = useState<Pitch | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [businessId, setBusinessId] = useState<number | null>(null);
    const [hasNoBusiness, setHasNoBusiness] = useState<boolean>(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    
    const { showNotification } = useOutletContext<{ showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void }>();
    const navigate = useNavigate();
    const { userData, isLoading: authLoading } = useAuth();

    const getBusinessId = useCallback(async () => {
        try {
            if (!userData?.id) {
                throw new Error('No hay datos de usuario');
            }

            const businessData = await businessService.findByOwnerId(userData.id);
            
            let extractedBusinessId;
            if ((businessData as any).id) {
                extractedBusinessId = (businessData as any).id;
            } else if ((businessData as any).data && (businessData as any).data.id) {
                extractedBusinessId = (businessData as any).data.id;
            } else if (Array.isArray(businessData) && (businessData as any[]).length > 0) {
                extractedBusinessId = (businessData as any[])[0].id;
            } else if ((businessData as any).data && Array.isArray((businessData as any).data) && (businessData as any).data.length > 0) {
                extractedBusinessId = (businessData as any).data[0].id;
            }
            
            if (!extractedBusinessId) {
                setHasNoBusiness(true);
                showNotification('No se encontró información válida del negocio', 'warning');
                return null;
            }
            
            setBusinessId(extractedBusinessId);
            setHasNoBusiness(false);
            return extractedBusinessId;
            
        } catch (error: any) {
            if (error?._status === 404) {
                setHasNoBusiness(true);
                showNotification('No tienes un negocio registrado aún', 'warning');
                return null;
            }
            console.error('Error getting business ID:', error);
            showNotification('Error al obtener el negocio: ' + errorHandler(error), 'error');
            setHasNoBusiness(true);
            throw error;
        }
    }, [userData, showNotification]);

    useEffect(() => {
        const initializeBusiness = async () => {
            if (!userData || authLoading) {
                return;
            }
            
            try {
                setLoading(true);
                await getBusinessId();
            } catch (error) {
                console.error('Error inicializando negocio:', error);
            } finally {
                setLoading(false);
            }
        };

        initializeBusiness();
    }, [getBusinessId, userData, authLoading]);

    if (authLoading || (!userData && !authLoading)) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Verificando autenticación...</p>
            </div>
        );
    }

    if (!userData) {
        alert('Sesión no iniciada o inválida');
        navigate('/login');
        return null;
    }

    // MANEJO DE ESTADOS DE CARGA Y ERROR
    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Cargando información del negocio...</p>
            </div>
        );
    }

    // MANEJO ESPECÍFICO PARA USUARIOS SIN NEGOCIO
    if (hasNoBusiness) {
        return (
            <div className="no-business-container">
                <h3>🏢 No tienes un negocio registrado</h3>
                <p>Para crear canchas, primero debes registrar tu negocio.</p>
                <div className="action-buttons">
                    <button 
                        onClick={() => navigate('/registerBusiness')} 
                        className="primary-button"
                    >
                        📝 Registrar mi negocio
                    </button>
                    <button 
                        onClick={() => getBusinessId()} 
                        className="secondary-button"
                    >
                        🔄 Verificar nuevamente
                    </button>
                </div>
            </div>
        );
    }

    // 🎯 RESTO DE LA LÓGICA DEL COMPONENTE (opciones, handlers, etc.)
    
    const sizeOptions = [
        { value: '5v5', label: 'Fut 5' },
        { value: '7v7', label: 'Fut 7' },
        { value: '11v11', label: 'Fut 11' }
    ];

    const groundTypeOptions = [
        { value: 'césped natural', label: 'Césped Natural' },
        { value: 'césped sintético', label: 'Césped Sintético' },
        { value: 'cemento', label: 'Cemento' },
        { value: 'arcilla', label: 'Arcilla' }
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

            const json = await pitchService.add(pitchData);
            setData(json);
            showNotification('Cancha creada con éxito', 'success');
            navigate(-1);
            
        } catch (error) {
            console.error('Error completo:', error);
            showNotification('Error: ' + errorHandler(error), 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (!businessId) {
            showNotification('No se pudo obtener el ID del negocio', 'error');
            return;
        }

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
        pitchData.append('business', businessId.toString());
        pitchData.append('rating', '1');
        // Normalizar price a float con 2 decimales
        const rawPrice = formData.get("price");
        const parsedPrice = parseFloat(String(rawPrice));
        if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
            showNotification('Precio inválido', 'error');
            return;
        }
        pitchData.append('price', parsedPrice.toFixed(2));
        pitchData.append('size', selectedSize);
        pitchData.append('groundType', selectedGroundType);
        pitchData.append('roof', formData.get("roof") ? 'true' : 'false');
        
        if (imageFile) {
            pitchData.append('image', imageFile);
        }

        add(pitchData);
    };

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
            <div className="form-header">
                <h2 className='crud-form-title'>Crear Nueva Cancha</h2>
                <div className="business-info">
                    <p><strong>Negocio ID:</strong> {businessId}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className='crud-form' encType="multipart/form-data">
                <div className='crud-form-item info-field'>
                    <label>Negocio asociado</label>
                    <div className="readonly-field">
                        <strong>ID: {businessId}</strong>
                        <span className="info-text">(Obtenido automáticamente de tu negocio)</span>
                    </div>
                </div>

                <div className='crud-form-item'>
                    <label>Precio por hora 💰</label>
                    <input 
                        name="price" 
                        type="number" 
                        step="0.01" 
                        required 
                        placeholder="Ej: 25000"
                        min="0"
                    />
                    <small>Precio en pesos colombianos</small>
                </div>

                <div className='crud-form-item'>
                    <label>Tamaño de cancha 📏</label>
                    <select name="size" required defaultValue="">
                        <option value="">Selecciona un tamaño</option>
                        {sizeOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <small>Selecciona el formato de la cancha</small>
                </div>

                <div className='crud-form-item'>
                    <label>Tipo de suelo 🌱</label>
                    <select name="groundType" required defaultValue="">
                        <option value="">Selecciona un tipo de suelo</option>
                        {groundTypeOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <small>Tipos disponibles: Césped Natural, Césped Sintético, Cemento, Arcilla</small>
                </div>

                <div className='crud-form-item'>
                    <label className='checkbox-label'>
                        <input type="checkbox" name="roof" />
                        <span>🏠 Cancha techada</span>
                    </label>
                    <small>Marca si la cancha tiene techo o cubierta</small>
                </div>
                
                <div className='crud-form-item'>
                    <label>Imagen de la cancha 🖼️</label>
                    <input 
                        type="file" 
                        name="image"
                        accept="image/*" 
                        onChange={handleImageChange}
                    />
                    <small>Formatos: JPG, PNG, WEBP. Máximo 5MB</small>
                    
                    {imagePreview && (
                        <div className='image-preview-container'>
                            <p><strong>Vista previa:</strong></p>
                            <div className='image-preview'>
                                <img src={imagePreview} alt="Vista previa de la cancha" />
                                <button 
                                    type="button" 
                                    onClick={removeImage}
                                    className='remove-image-btn'
                                >
                                    × Eliminar imagen
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className='crud-form-actions'>
                    <button 
                        type="button" 
                        onClick={() => navigate(-1)}
                        className="secondary-button"
                    >
                        ↩️ Cancelar
                    </button>
                    <button 
                        type="submit" 
                        className='primary-button' 
                        disabled={loading || !businessId}
                    >
                        {loading ? '⏳ Creando...' : '✅ Crear Cancha'}
                    </button>
                </div>
            </form>
            
            {data && (
                <div className="success-preview">
                    <h3>🎉 ¡Cancha creada exitosamente!</h3>
                    <div className="preview-table">
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
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>{data.id}</td>
                                    <td>{typeof data.business === 'object' ? data.business?.id : data.business}</td>
                                    <td>
                                        {('⭐️').repeat(Math.floor(data.rating))} 
                                        <span className="rating-number">({data.rating})</span>
                                    </td>
                                    <td>${data.price?.toLocaleString()}</td>
                                    <td>{data.size}</td>
                                    <td>{data.groundType}</td>
                                    <td>{data.roof ? '✅ Techado' : '❌ Sin techo'}</td>
                                    <td>
                                        {data.imageUrl ? (
                                            <img 
                                                src={data.imageUrl} 
                                                alt="Cancha" 
                                                style={{width: '50px', height: '50px', objectFit: 'cover'}}
                                            />
                                        ) : 'Sin imagen'}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}