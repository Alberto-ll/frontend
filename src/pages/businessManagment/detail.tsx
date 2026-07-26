import type { Pitch } from '../../types/pitchType.ts';
import { useState, useEffect, useCallback } from 'react';
import { useOutletContext, useParams, Navigate } from 'react-router';

import '../../static/css/MybusinessDetail.css'
import { useAuth } from '../../components/Auth.tsx';
import { errorHandler } from '../../types/apiError.ts';
import { pitchService } from '../../services';

export default function businessPitchDetail() {
    const [data, setData] = useState<Pitch | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<boolean>(false);
    
    const { showNotification } = useOutletContext<{ showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void }>();
    const { id } = useParams<{ id: string }>();

    const { userData, isLoading } = useAuth();

    const getOne = useCallback(async (pitchId: string) => {
        try {
            setLoading(true);
            setError(false);
            
            const json = await pitchService.getOne(pitchId);
            setData(json);
            
        } catch (error) {
            console.error('Error obteniendo cancha:', error);
            showNotification(errorHandler(error), 'error');
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        if (!isLoading && id) {
            getOne(id);
        }
    }, [id, isLoading, getOne]);

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

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Cargando información de la cancha...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <h3>❌ Error al cargar la cancha</h3>
                <p>No se pudo obtener la información de la cancha con ID: {id}</p>
                <button 
                    onClick={() => id && getOne(id)} 
                    className="retry-button"
                >
                    🔄 Reintentar
                </button>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="no-data-container">
                <h3>📭 No se encontró la cancha</h3>
                <p>No existe una cancha con el ID: {id}</p>
            </div>
        );
    }

    return (
        <div className='crud-form-container'>
            <div className="detail-header">
                <h2 className='crud-form-title'>Detalle de Cancha</h2>
                <p className="detail-id">ID: {id}</p>
            </div>

            <div className="detail-content">
                <div className="detail-section">
                    <h3>📊 Información General</h3>
                    <div className="detail-grid">
                        <div className="detail-item">
                            <label>ID</label>
                            <span>{data.id}</span>
                        </div>
                        <div className="detail-item">
                            <label>Negocio ID</label>
                            <span>{typeof data.business === 'object' ? data.business?.id : data.business || '-'}</span>
                        </div>
                        <div className="detail-item">
                            <label>Rating</label>
                            <span>
                                {('⭐️').repeat(Math.floor(data.rating))} 
                                <span className="rating-number">({data.rating})</span>
                            </span>
                        </div>
                        <div className="detail-item">
                            <label>Precio</label>
                            <span>${data.price?.toLocaleString()}</span>
                        </div>
                        <div className="detail-item">
                            <label>Tamaño</label>
                            <span>{data.size}</span>
                        </div>
                        <div className="detail-item">
                            <label>Tipo de suelo</label>
                            <span>{data.groundType}</span>
                        </div>
                        <div className="detail-item">
                            <label>Techo</label>
                            <span>{data.roof ? '✅ Con techo' : '❌ Sin techo'}</span>
                        </div>
                    </div>
                </div>

                {data.imageUrl && (
                    <div className="detail-section">
                        <h3>🖼️ Imagen</h3>
                        <div className="image-container">
                            <img 
                                src={data.imageUrl} 
                                alt={`Cancha ${data.id}`}
                                className="detail-image"
                            />
                        </div>
                    </div>
                )}

                <div className="detail-section">
                    <h3>📅 Información Adicional</h3>
                    <div className="detail-grid">
                        {data.createdAt && (
                            <div className="detail-item">
                                <label>Creado</label>
                                <span>{new Date(data.createdAt).toLocaleDateString()}</span>
                            </div>
                        )}
                        {data.updatedAt && (
                            <div className="detail-item">
                                <label>Actualizado</label>
                                <span>{new Date(data.updatedAt).toLocaleDateString()}</span>
                            </div>
                        )}
                        {data.driveFileId && (
                            <div className="detail-item">
                                <label>Drive File ID</label>
                                <span className="file-id">{data.driveFileId}</span>
                            </div>
                        )}
                    </div>
                </div>

                {data.reservations && data.reservations.length > 0 && (
                    <div className="detail-section">
                        <h3>📅 Reservaciones</h3>
                        <p>{data.reservations.length} reservación(es)</p>
                    </div>
                )}
            </div>

            <div className="detail-actions">
                <button 
                    onClick={() => window.history.back()} 
                    className="secondary-button"
                >
                    ↩️ Volver
                </button>
            </div>
        </div>
    );
}