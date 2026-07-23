import { useCallback, useEffect, useState } from 'react';
import type {Pitch} from '../../../types/pitchType.ts'
import { Link } from 'react-router-dom';
import DeleteConfirm from '../../../components/deleteConfirm';
import Toast from '../../../components/Toast';
import { pitchService } from '../../../services';
import '../../../static/css/users/usersGetAll.css';

export default function PitchGetAll() {
    const [data, setData] = useState<Pitch[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [toast, setToast] = useState({
        isVisible: false,
        message: '',
        type: 'success' as 'success' | 'error' | 'warning' | 'info'
    });
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        pitchId: null as number | null,
        pitchName: '',
        isLoading: false
    });

    const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
        setToast({ isVisible: true, message, type });
    };

    const hideToast = () => {
        setToast((prev) => ({ ...prev, isVisible: false }));
    };
    const getAll = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const pitchesData = await pitchService.getAll();
            setData(pitchesData);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Error al cargar canchas');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        getAll();
    }, [getAll]);

    const handleRetry = () => {
        getAll();
    };

    const handleDeleteClick = (pitchId: number, pitchName: string) => {
        setDeleteModal({
            isOpen: true,
            pitchId,
            pitchName,
            isLoading: false,
        });
    };

    const handleCancelDelete = () => {
        setDeleteModal({
            isOpen: false,
            pitchId: null,
            pitchName: '',
            isLoading: false,
        });
    };

    const handleConfirmDelete = async () => {
        if (!deleteModal.pitchId) return;

        try {
            setDeleteModal((prev) => ({ ...prev, isLoading: true }));

            await pitchService.remove(deleteModal.pitchId);

            setData((prev) => prev.filter((pitch) => pitch.id !== deleteModal.pitchId));
            handleCancelDelete();
            showToast('Cancha eliminada con éxito', 'success');
        } catch (err) {
            setDeleteModal((prev) => ({ ...prev, isLoading: false }));
            showToast('Error al eliminar cancha: ' + (err instanceof Error ? err.message : 'Error desconocido'), 'error');
        }
    };

    if (loading) {
        return (
            <div className="users-getall-container">
                <div className="users-container">
                    <h2 className="users-title">Lista de Canchas</h2>
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p className="loading-text">Cargando canchas...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="users-getall-container">
                <div className="users-container">
                    <h2 className="users-title">Lista de Canchas</h2>
                    <div className="error-container">
                        <div className="error-message">
                            <p>Error: {error}</p>
                        </div>
                        <button onClick={handleRetry} className="retry-button">
                            Reintentar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="users-getall-container">
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={hideToast}
                duration={4000}
            />
            <DeleteConfirm
                isOpen={deleteModal.isOpen}
                title="Confirmar Eliminación de Cancha"
                message="¿Estás seguro de que quieres eliminar esta cancha?"
                itemName={deleteModal.pitchName}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
                confirmText="Eliminar Cancha"
                cancelText="Cancelar"
                isLoading={deleteModal.isLoading}
            />

            <div className="users-container">
                <h2 className="users-title">Lista de Canchas</h2>

                {!Array.isArray(data) || data.length === 0 ? (
                    <p className="no-users-message">No hay canchas disponibles.</p>
                ) : (
                    <div>
                        <p className="users-summary">
                            Total de canchas: <strong>{data.length}</strong>
                        </p>

                        <div className="table-container">
                            <table className="users-table">
                                <thead className="table-header">
                                    <tr>
                                        <th>ID</th>
                                        <th>Business</th>
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
                                    {data.map((pitch, index) => (
                                        <tr key={pitch.id || index} className="table-row">
                                            <td className="table-cell">{pitch.id || 'N/A'}</td>
                                            <td className="table-cell">{typeof pitch.business === 'object' ? pitch.business?.id : pitch.business ?? 'N/A'}</td>
                                            <td className="table-cell">{('⭐️').repeat(Math.floor(pitch.rating || 0))} ({pitch.rating ?? 0})</td>
                                            <td className="table-cell">${pitch.price?.toLocaleString?.() ?? pitch.price ?? 'N/A'}</td>
                                            <td className="table-cell">{pitch.size}</td>
                                            <td className="table-cell">{pitch.groundType}</td>
                                            <td className="table-cell">{pitch.roof ? 'Con techo' : 'Sin techo'}</td>
                                            <td className="table-cell">
                                                {pitch.imageUrl ? (
                                                    <img
                                                        src={pitch.imageUrl}
                                                        alt={`Cancha ${pitch.id}`}
                                                        style={{ width: '50px', height: '30px', objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    'Sin imagen'
                                                )}
                                            </td>
                                            <td className="table-cell">
                                                <div className="action-buttons">
                                                    <Link
                                                        to={`/admin/pitchs/getOne/${pitch.id}`}
                                                        className="action-button view-button"
                                                        title="Ver detalles"
                                                    >
                                                        Ver
                                                    </Link>
                                                    <Link
                                                        to={`/admin/pitchs/update/${pitch.id}`}
                                                        className="action-button edit-button"
                                                        title="Editar cancha"
                                                    >
                                                        Editar
                                                    </Link>
                                                    <button
                                                        onClick={() => pitch.id && handleDeleteClick(pitch.id, `Cancha ${pitch.id}`)}
                                                        className="action-button delete-button"
                                                        title="Eliminar cancha"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}