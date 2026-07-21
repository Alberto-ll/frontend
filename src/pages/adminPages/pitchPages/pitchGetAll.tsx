import { useEffect, useState, useCallback } from 'react';
import type {Pitch} from '../../../types/pitchType.ts'
import { useOutletContext } from 'react-router';
import { errorHandler } from '../../../types/apiError.ts';
import { pitchService } from '../../../services';

export default function PitchGetAll() {
    const [data, setData] = useState<Pitch[] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<boolean>(false);

    const { showNotification } = useOutletContext<{ showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void }>();

    const normalizePitches = (response: unknown): Pitch[] => {
        if (Array.isArray(response)) return response as Pitch[];

        const typedResponse = response as { data?: unknown; pitches?: unknown };
        if (Array.isArray(typedResponse?.data)) return typedResponse.data as Pitch[];
        if (Array.isArray(typedResponse?.pitches)) return typedResponse.pitches as Pitch[];

        return [];
    };

    const getAll = useCallback(async () => {
        try {
            setLoading(true);
            const json = await pitchService.getAll();
            setData(normalizePitches(json));
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
            await pitchService.remove(id);
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
                        {data?.map((pitch) => (
                            <tr key={pitch.id}>
                                <td>{pitch.id}</td>
                                <td>{typeof pitch.business === 'object' ? pitch.business?.id : pitch.business ?? '-'}</td>
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