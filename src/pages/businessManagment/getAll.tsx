import { useEffect, useState, useCallback } from 'react';
import type {Pitch} from '../../types/pitchType.ts'
import { useOutletContext, Navigate, useNavigate } from 'react-router';
import { errorHandler } from '../../types/apiError.ts';
import { useAuth } from '../../components/Auth.tsx';
import { businessService, pitchService } from '../../services';
import '../../static/css/MybusinessGetAll.css';

export default function BusinessPitchGetAll() {
    const [data, setData] = useState<Pitch[] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<boolean>(false);
    const [businessId, setBusinessId] = useState<number | null>(null);
    const [hasNoBusiness, setHasNoBusiness] = useState<boolean>(false);

    const { showNotification } = useOutletContext<{ showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void }>();
    const navigate = useNavigate();
    const { userData, isLoading } = useAuth();

    const getBusinessId = useCallback(async () => {
        try {
            if (!userData?.id) {
                throw new Error('No se pudo obtener el ID del usuario');
            }

            const businessData = await businessService.findByOwnerId(userData.id) as any;
            const extractedBusinessId = Array.isArray(businessData) ? businessData[0]?.id : businessData?.id;
            
            if (!extractedBusinessId) {
                setHasNoBusiness(true);
                setLoading(false);
                showNotification('No se encontró información válida del negocio', 'warning');
                return null;
            }
            
            setBusinessId(extractedBusinessId);
            setHasNoBusiness(false);
            return extractedBusinessId;
            
        } catch (error: any) {
            if (error?._status === 404) {
                setHasNoBusiness(true);
                setLoading(false);
                showNotification('No tienes un negocio registrado aún', 'warning');
                return null;
            }
            console.error('Error getting business ID:', error);
            showNotification(errorHandler(error), 'error');
            setError(true);
            throw error;
        }
    }, [userData, showNotification]);

    const getAll = useCallback(async (currentBusinessId?: number) => {
        try {
            setLoading(true);
            setError(false);
            
            let targetBusinessId = currentBusinessId || businessId;
            if (!targetBusinessId) {
                targetBusinessId = await getBusinessId();
                if (!targetBusinessId) {
                    return;
                }
            }

            const json = await pitchService.getByBusiness(targetBusinessId);
            setData(json);
            
        } catch (error: any) {
            if (error?._status === 404 || (error?.error && error.error.includes('No pitches found'))) {
                setData([]);
                showNotification('No tienes canchas registradas aún', 'info');
                return;
            }
            console.error('Error getting pitches:', error);
            showNotification(errorHandler(error), 'error');
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [businessId, getBusinessId, showNotification]);

    const initializeData = useCallback(async () => {
        try {
            setError(false);
            setHasNoBusiness(false);

            const currentBusinessId = await getBusinessId();
            if (currentBusinessId) {
                await getAll(currentBusinessId);
            }
        } catch (error) {
            console.error('Error inicializando datos:', error);
            setError(true);
            setLoading(false);
        }
    }, [getBusinessId, getAll]);

    useEffect(() => {
        if (!isLoading) {
            initializeData();
        }
    }, [isLoading, initializeData]);

    if (isLoading) {
        return <div>Cargando...</div>;
    }
    if (!userData) {
        alert('sesion no iniciada');
        return <Navigate to="/login" />;
    }
    if (userData.category !== "business_owner" && userData.category !== "admin") {
        return <Navigate to="/" />;
    }

    const remove = async (id: number) => {
        try {
            setLoading(true);
            
            await pitchService.remove(id);
            
            showNotification('Cancha eliminada con éxito!', 'success');
            await getAll(businessId || undefined);
            
        } catch (error) {
            console.error('Error eliminando cancha:', error);
            showNotification(errorHandler(error), 'error');
            setLoading(false);
        }
    };

    const handleDeleteSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (confirm("¿Estás seguro que quieres eliminar la cancha seleccionada?")) {
            if (e.currentTarget.value) {
                remove(Number(e.currentTarget.value));
            }
        }
    };

    // FUNCIÓN PARA NAVEGAR AL DETALLE
    const handleViewDetail = (pitchId: number) => {
        navigate(`/myBusiness/detail/${pitchId}`);
    };

    // FUNCIÓN PARA NAVEGAR A EDITAR
    const handleEdit = (pitchId: number) => {
        navigate(`/myBusiness/edit/${pitchId}`);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Cargando canchas del negocio...</p>
            </div>
        );
    }

    // Manejo específico para usuarios sin negocio
    if (hasNoBusiness) {
        return (
            <div className="no-business-container">
                <h3>🏢 No tienes un negocio registrado</h3>
                <p>Para gestionar canchas, primero debes registrar tu negocio.</p>
                <div className="action-buttons">
                    <button 
                        onClick={() => window.location.href = '/registerBusiness'} 
                        className="primary-button"
                    >
                        📝 Registrar mi negocio
                    </button>
                    <button onClick={initializeData} className="secondary-button">
                        🔄 Verificar nuevamente
                    </button>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <p>Error al cargar las canchas del negocio</p>
                <button onClick={initializeData} className="retry-button">
                    🔄 Reintentar
                </button>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="no-data-container">
                <h3>📭 No hay canchas registradas</h3>
                <p>Aún no tienes canchas asociadas a tu negocio.</p>
                <p>Negocio ID: {businessId}</p>
                <div className="action-buttons">
                    <button 
                        onClick={() => window.location.href = '/admin/pitch/create'} 
                        className="primary-button"
                    >
                        ➕ Registrar primera cancha
                    </button>
                    <button onClick={initializeData} className="secondary-button">
                        🔄 Actualizar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="table-header">
            </div>
            
            <table className='crudTable'>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Rating</th>
                        <th>Precio</th>
                        <th>Tamaño</th>
                        <th>Tipo de suelo</th>
                        <th>Techo</th>
                        <th>Imagen</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((pitch) => (
                        <tr key={pitch.id}>
                            <td>{pitch.id}</td>
                            <td>
                                {('⭐️').repeat(Math.floor(pitch.rating))} 
                                <span className="rating-number">({pitch.rating})</span>
                            </td>
                            <td>${pitch.price?.toLocaleString()}</td>
                            <td>{pitch.size}</td>
                            <td>{pitch.groundType}</td>
                            <td>
                                {pitch.roof ? '✅ Con techo' : '❌ Sin techo'}
                            </td>
                            <td>
                                {pitch.imageUrl ? (
                                    <img 
                                        src={pitch.imageUrl} 
                                        alt={`Cancha ${pitch.id}`}
                                        className="table-image"
                                        style={{ width: '50px', height: '30px', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <span>Sin imagen</span>
                                )}
                            </td>
                            <td>
                                <div className="action-buttons-container">
                                    <button 
                                        className='action-button detail' 
                                        onClick={() => handleViewDetail(pitch.id!)}
                                        title="Ver detalle de la cancha"
                                    >
                                        👁️ Ver
                                    </button>
                                    <button 
                                        className='action-button edit' 
                                        onClick={() => handleEdit(pitch.id!)}
                                        title="Editar cancha"
                                    >
                                        ✏️ Editar
                                    </button>
                                    <button 
                                        className='action-button delete' 
                                        onClick={handleDeleteSubmit} 
                                        value={pitch.id}
                                        title="Eliminar cancha"
                                    >
                                        🗑️ Eliminar
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}