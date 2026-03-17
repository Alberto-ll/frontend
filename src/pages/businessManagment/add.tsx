import { useState, useCallback, useEffect } from 'react';
import type { Pitch } from '../../types/pitchType.ts';
import { useNavigate, useOutletContext, Navigate } from 'react-router';
import { useAuth } from '../../hooks/useAuth.tsx';

export default function PitchAdd() {
    const [data, setData] = useState<PitchResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [businessId, setBusinessId] = useState<number | null>(null);
    const [hasNoBusiness, setHasNoBusiness] = useState<boolean>(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    
    const { showNotification } = useOutletContext<{ showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void }>();
    const navigate = useNavigate();

    const { userData, token } = useAuth();

    if (!userData) {
        alert('sesion no iniciada');
        return <Navigate to="/login" />;
    }


    // FUNCIÓN PARA OBTENER EL BUSINESSID DEL USUARIO
    const getBusinessId = useCallback(async () => {
        try {
            const userId = userData.id;
            
            if (!token) {
                throw new Error('No se encontró token de autenticación');
            }

            if (!userId) {
                throw new Error('No se pudo obtener el ID del usuario');
            }

            console.log('Obteniendo business para usuario:', userId);
            console.log('URL completa:', `http://localhost:3000/api/business/findByOwnerId/${userId}`);

            const response = await fetch(`http://localhost:3000/api/business/findByOwnerId/${userId}`, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('Response status:', response.status);
            
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('user');
                alert('Sesión expirada o inválida');
                window.location.href = '/login';
                return null;
            }
            
            // MANEJO ESPECÍFICO DEL 404
            if (response.status === 404) {
                console.log('No se encontró negocio para este usuario');
                setHasNoBusiness(true);
                showNotification('No tienes un negocio registrado aún', 'warning');
                return null;
            }
            
            if (!response.ok) {
                const errors = await response.json();
                console.error('Error response:', errors);
                throw new Error(`Error ${response.status}: ${errors.message || 'Error al obtener el negocio'}`);
            }
            
            const businessData = await response.json();
            console.log('Business data recibida:', businessData);
            
            let extractedBusinessId;
            if (businessData.id) {
                extractedBusinessId = businessData.id;
            } else if (businessData.data && businessData.data.id) {
                extractedBusinessId = businessData.data.id;
            } else if (Array.isArray(businessData) && businessData.length > 0) {
                extractedBusinessId = businessData[0].id;
            } else if (Array.isArray(businessData.data) && businessData.data.length > 0) {
                extractedBusinessId = businessData.data[0].id;
            }
            
            if (!extractedBusinessId) {
                console.log('Respuesta del negocio no contiene ID válido');
                setHasNoBusiness(true);
                showNotification('No se encontró información válida del negocio', 'warning');
                return null;
            }
            
            console.log('Business ID encontrado:', extractedBusinessId);
            setBusinessId(extractedBusinessId);
            setHasNoBusiness(false);
            return extractedBusinessId;
            
        } catch (error) {
            console.error('Error getting business ID:', error);
            showNotification('Error al obtener el negocio: ' + error, 'error');
            setHasNoBusiness(true);
            throw error;
        }
    }, [showNotification, token, userData]);

    // EFECTO PARA OBTENER EL BUSINESSID AL CARGAR EL COMPONENTE
    useEffect(() => {
        const initializeBusiness = async () => {
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
    }, [getBusinessId]);

    // Opciones válidas para el tamaño
    const sizeOptions = [
        { value: '5v5', label: 'Fut 5' },
        { value: '7v7', label: 'Fut 7' },
        { value: '11v11', label: 'Fut 11' }
    ];

    //TIPOS DE SUELO ACTUALIZADOS SEGÚN TU ESPECIFICACIÓN
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

            if (!token) {
                throw new Error('No se encontró token de autenticación');
            }

            // Para debugging: mostrar los datos que se envían
            console.log('Enviando datos de cancha:');
            for (let [key, value] of pitchData.entries()) {
                if (key === 'image') {
                    console.log(`${key}:`, (value as File).name, (value as File).size);
                } else {
                    console.log(`${key}:`, value);
                }
            }

            const response = await fetch('http://localhost:3000/api/pitchs/add', {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: pitchData
            });

            console.log('Status:', response.status);
            console.log('Headers:', Object.fromEntries(response.headers.entries()));

            const responseText = await response.text();
            console.log('Response body:', responseText);

            if (!response.ok) {
                let errorMessage = `HTTP Error! status: ${response.status}`;
                try {
                    const errorData = JSON.parse(responseText);
                    errorMessage = errorData.error || errorData.message || errorMessage;
                } catch (e) {
                    errorMessage = responseText || errorMessage;
                }
                throw new Error(errorMessage);
            }

            const json: PitchResponse = JSON.parse(responseText);
            setData(json);
            showNotification('✅ Cancha creada con éxito', 'success');
            
            // Regresar a la página anterior en lugar de navegar a una ruta específica
            navigate(-1); // Esto regresa a la página anterior en el historial
            
        } catch (error) {
            console.error('Error completo:', error);
            showNotification('❌ Error: ' + error, 'error');
            setLoading(false);
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
        pitchData.append('business', businessId.toString());
        pitchData.append('rating', '1'); //    RATING FIJO EN 1
        pitchData.append('price', formData.get("price") as string);
        pitchData.append('size', selectedSize);
        pitchData.append('groundType', selectedGroundType);
        pitchData.append('roof', formData.get("roof") ? 'true' : 'false');
        
        // Agregar la imagen si existe
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
                        onClick={() => window.location.href = '/registerBusiness'} 
                        className="primary-button"
                    >
                        📝 Registrar mi negocio
                    </button>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="secondary-button"
                    >
                        🔄 Verificar nuevamente
                    </button>
                </div>
            </div>
        );
    }

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
                        onClick={() => navigate(-1)} // Regresar a la página anterior
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
                                    <td>{data.data.id}</td>
                                    <td>{data.data.business?.id || data.data.business}</td>
                                    <td>
                                        {('⭐️').repeat(Math.floor(data.data.rating))} 
                                        <span className="rating-number">({data.data.rating})</span>
                                    </td>
                                    <td>${data.data.price?.toLocaleString()}</td>
                                    <td>{data.data.size}</td>
                                    <td>{data.data.groundType}</td>
                                    <td>{data.data.roof ? '✅ Techado' : '❌ Sin techo'}</td>
                                    <td>
                                        {data.data.imageUrl ? (
                                            <img 
                                                src={data.data.imageUrl} 
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

type PitchResponse = {
    data: Pitch;
}