import { useEffect, useState, useCallback } from 'react';
import type {Pitch} from '../../../types/pitchType.ts'
import { useOutletContext } from 'react-router';
import { errorHandler } from '../../../types/apiError.ts';
import { pitchService } from '../../../services/pitchService.ts';

export default function PitchGetAll() {
    const [data, setData] = useState<PitchResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<boolean>(false);

    const { showNotification } = useOutletContext<{ showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void }>();

    const getAll = useCallback(async () => {
        try {
            setLoading(true);
            setError(false)
            const json: PitchResponse = await pitchService.getAll();
            setData(json);
        } catch (error) {
            showNotification(errorHandler(error), 'error');
            setError(true);
            setLoading(false);
        } finally {
            setLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        if (!error) {
            getAll();
        }
    }, [error, getAll]);

    const remove = async (id: number) => {
        try {
            setLoading(true);
            setError(false)
            pitchService.remove(id)
            showNotification('Cancha eliminada con éxito!', 'success');
            getAll();
        } catch (error) {
            showNotification(errorHandler(error), 'error');
        }
    };

    const handleDeleteSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (confirm("¿Estas seguro que quieres eliminar la cancha seleccionada?")) {
            if (e.currentTarget.value) {
                remove(Number(e.currentTarget.value));
            }
        }
    };

    if (loading) return 'Loading...';

    return (
        <div>
            <pre>
                <table className='crudTable'>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Business ID</th>
                            <th>Rating</th>
                            <th>Price</th>
                            <th>Size</th>
                            <th>Ground type</th>
                            <th>Roof</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.data.map((pitch) => (
                            <tr key={pitch.id}>
                                <td>{pitch.id}</td>
                                <td>{typeof pitch.business === 'number' ? pitch.business : pitch.business?.id ?? '-' }</td> {/* evitar error de tipado de ts*/}
                                <td>{('⭐️').repeat(pitch.rating)}</td>
                                <td>${pitch.price}</td>
                                <td>{pitch.size}</td>
                                <td>{pitch.groundType}</td>
                                <td>{pitch.roof ? 'Techado' : 'Sin techo'}</td>
                                <td><button className='action-button delete' onClick={handleDeleteSubmit} value={pitch.id}>Eliminar</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </pre>
        </div>
    );
}

type PitchResponse = {
    data: Pitch[];
};