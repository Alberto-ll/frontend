import { useState, useCallback, useEffect } from 'react';
import type { Pitch } from '../../types/pitchType.ts';
import { useNavigate, useOutletContext } from 'react-router';

export default function PitchAdd() {
    const [data, setData] = useState<PitchResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [businessId, setBusinessId] = useState<number | null>(null);
    const [hasNoBusiness, setHasNoBusiness] = useState<boolean>(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [userData, setUserData] = useState<any>(null);
    const [authChecked, setAuthChecked] = useState<boolean>(false);
    
    const { showNotification } = useOutletContext<{ showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void }>();
    const navigate = useNavigate();

    // 🎯 TODOS LOS HOOKS/CALLBACKS DEBEN IR AQUÍ ARRIBA (antes de cualquier return condicional)
    
    // FUNCIÓN PARA DECODIFICAR EL TOKEN JWT
    const decodeToken = useCallback((token: string) => {
        try {
            const payload = token.split('.')[1];
            const decodedPayload = atob(payload);
            const userData = JSON.parse(decodedPayload);
            
            return {
                id: userData.id || userData.userId || 0,
                email: userData.email || '',
                name: userData.name || userData.username || '',
                role: userData.role || ''
            };
        } catch (error) {
            console.error('Error decodificando token:', error);
            return null;
        }
    }, []);

    // FUNCIÓN PARA OBTENER TOKEN Y DATOS DEL USUARIO DESDE LOCALSTORAGE
    const getAuthData = useCallback(() => {
        try {
            const storedUser = localStorage.getItem('user');
            
            if (!storedUser) {
                console.log('No hay usuario en localStorage');
                return null;
            }
            
            const parsed = JSON.parse(storedUser);
            if (!parsed.token) {
                console.log('No hay token en los datos del usuario');
                localStorage.removeItem('user');
                return null;
            }
            
            const decodedUser = decodeToken(parsed.token);
            if (!decodedUser) {
                console.log('Token inválido, eliminando datos');
                localStorage.removeItem('user');
                return null;
            }
            
            console.log('Datos de usuario obtenidos:', decodedUser);
            setToken(parsed.token);
            setUserData(decodedUser);
            return { token: parsed.token, userData: decodedUser };
            
        } catch (error) {
            console.error('Error obteniendo datos de autenticación:', error);
            localStorage.removeItem('user');
            return null;
        }
    }, [decodeToken]);

    // FUNCIÓN PARA OBTENER EL BUSINESSID DEL USUARIO
    const getBusinessId = useCallback(async () => {
        try {
            if (!userData?.id || !token) {
                throw new Error('No hay datos de usuario o token');
            }

            const userId = userData.id;
            console.log('Obteniendo business para usuario:', userId);

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
                navigate('/login');
                return null;
            }
            
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
    }, [showNotification, token, userData, navigate]);

    // EFECTO PARA OBTENER AUTENTICACIÓN AL CARGAR EL COMPONENTE
    useEffect(() => {
        const authData = getAuthData();
        if (!authData) {
            alert('Sesión no iniciada o inválida');
            navigate('/login');
        } else {
            setAuthChecked(true);
        }
    }, [getAuthData, navigate]);

    // EFECTO PARA OBTENER EL BUSINESSID AL CARGAR EL COMPONENTE
    useEffect(() => {
        const initializeBusiness = async () => {
            if (!token || !userData || !authChecked) {
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
    }, [getBusinessId, token, userData, authChecked]);

    // 🎯 AHORA SÍ PODEMOS HACER RETURNS CONDICIONALES (después de todos los hooks)

    // VERIFICAR SI HAY DATOS DE USUARIO ANTES DE RENDERIZAR
    if (!authChecked || !userData || !token) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Verificando autenticación...</p>
            </div>
        );
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
                        onClick={() => getAuthData()} 
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

            if (!token) {
                throw new Error('No se encontró token de autenticación');
            }

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
            navigate(-1);
            
        } catch (error) {
            console.error('Error completo:', error);
            showNotification('❌ Error: ' + error, 'error');
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