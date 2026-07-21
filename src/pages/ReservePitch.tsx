import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router';
import type { ReservePitch, ReservePitchFilters } from '../types/reservePitchTypes';
import PitchFilters from '../components/filters/PitchFilters';
import PitchCard from '../components/pitches/PitchCard';
import '../static/css/ReservePitch.css';
import { useAuth } from '../components/Auth';
import { pitchService } from '../services';
import { errorHandler } from '../types/apiError';

const ReservePitchPage: React.FC = () => {
  const navigate = useNavigate();

  const {userData, token} = useAuth()

  const [pitches, setPitches] = useState<ReservePitch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

  const [filters, setFilters] = useState<ReservePitchFilters>({
    roof: 'all',
    size: 'all',
    groundType: 'all',
    priceMin: 0,
    priceMax: 0,
    searchTerm: '',
  });

  const abortRef = useRef<AbortController | null>(null);

  const fetchPitches = useCallback(async (appliedFilters: ReservePitchFilters) => {
    try {
      setLoading(true);
      setError(null);

      if (!token) {
        navigate('/login');
        return;
      }

      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      const f = appliedFilters;
      const params: Record<string, string | number | boolean | undefined | null> = {};
      if (f.roof && f.roof !== 'all') {
        const roofValue = f.roof === 'covered' ? 'true' : (f.roof === 'uncovered' ? 'false' : '');
        if (roofValue) params.roof = roofValue;
      }
      if (f.size && f.size !== 'all') params.size = f.size;
      if (f.groundType && f.groundType !== 'all') params.groundType = f.groundType;

      const noPriceFilter = typeof f.priceMin === 'number' && typeof f.priceMax === 'number' && f.priceMin === 0 && f.priceMax === 0;
      if (!noPriceFilter) {
        if (typeof f.priceMin === 'number') params.priceMin = f.priceMin;
        if (typeof f.priceMax === 'number' && f.priceMax > 0 && f.priceMax < 999999) params.priceMax = f.priceMax;
      }

      if (f.searchTerm && f.searchTerm.trim()) params.q = f.searchTerm.trim();

      const responseData = await pitchService.getActive(params, { signal: abortRef.current.signal }) as any;

      let pitchesData: ReservePitch[] = [];
      if (Array.isArray(responseData)) {
        pitchesData = responseData;
      } else if (responseData.data && Array.isArray(responseData.data)) {
        pitchesData = responseData.data;
      } else if (responseData.pitches && Array.isArray(responseData.pitches)) {
        pitchesData = responseData.pitches;
      } else {
        throw new Error('Formato de respuesta inesperado');
      }

      setPitches(pitchesData);

      if (pitchesData.length > 0) {
        const newPriceMax = Math.ceil(Math.max(...pitchesData.map((p) => p.price)) * 1.2);
        setFilters((prev) => {
          if (prev.priceMax === 0) return prev;
          if (prev.priceMax === newPriceMax) return prev;
          return { ...prev, priceMax: newPriceMax };
        });
      }
    } catch (err) {
      if ((err as any)?.name === 'AbortError') return;
      if ((err as any)?._status === 404) {
        const errorData = err as any;
        if (errorData.error && errorData.error.includes('No pitches from active businesses')) {
          setPitches([]);
          setLoading(false);
          return;
        }
      }
      setError(errorHandler(err));
    } finally {
      setLoading(false);
    }
  }, [navigate, token]);

  useEffect(() => {
    if (!userData) return;

    const timer = setTimeout(() => {
      fetchPitches(filters);
    }, 300);

    return () => {
      clearTimeout(timer);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [filters, fetchPitches, userData]);

  const handleFilterChange = (newFilters: ReservePitchFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      roof: 'all',
      size: 'all',
      groundType: 'all',
      priceMin: 0,
      priceMax: 0,
      searchTerm: '',
    });
  };

  const handleReserve = (pitchId: number) => {
    navigate(`/makeReservation/${pitchId}`);
  };

  if (!token) {
    return (
      <div className="reserve-pitch-container">
        <div className="reserve-pitch-loading">
          <p className="loading-text">Debes iniciar sesión para ingresar a esta página correctamente.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reserve-pitch-container">
      <div className="reserve-pitch-header">
        <h1 className="reserve-pitch-title">Reservar una Cancha</h1>
        <p className="reserve-pitch-subtitle">
          Encuentra la cancha perfecta para tu próximo partido
        </p>
          <div className="reserve-pitch-stats">
          <span className="stat-badge">
            Total: <strong>{pitches.length}</strong> canchas
          </span>
          <span className="stat-badge">
            Mostrando: <strong>{pitches.length}</strong> canchas
          </span>
        </div>
      </div>

      <div className="reserve-pitch-content">
        <aside className="reserve-pitch-sidebar">
          <PitchFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />
        </aside>

        <main className="reserve-pitch-main">
          {loading ? (
            <div className="reserve-pitch-loading">
              <div className="loading-spinner"></div>
              <p className="loading-text">Cargando canchas disponibles...</p>
            </div>
          ) : error ? (
            <div className="reserve-pitch-error">
              <div className="error-message">
                <h3>Error al cargar canchas</h3>
                <p>{error}</p>
              </div>
              <button onClick={() => fetchPitches(filters)} className="retry-button">
                Reintentar
              </button>
            </div>
          ) : renderError ? (
            <div className="no-results">
              <p className="no-results-icon">!</p>
              <h3 className="no-results-title">Error al mostrar canchas</h3>
              <p className="no-results-text">{renderError}</p>
              <button onClick={() => { setRenderError(null); fetchPitches(filters); }} className="retry-button">
                Reintentar
              </button>
            </div>
          ) : pitches.length === 0 ? (
            <div className="no-results">
              <p className="no-results-icon">!</p>
              <h3 className="no-results-title">No hay canchas disponibles</h3>
              <p className="no-results-text">
                Actualmente no hay canchas que coincidan con los filtros seleccionados.
              </p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <button onClick={() => fetchPitches(filters)} className="retry-button">
                  Actualizar
                </button>
                <button onClick={handleClearFilters} className="retry-button">
                  Limpiar filtros
                </button>
              </div>
            </div>
          ) : (
            <div className="pitch-cards-grid">
              {pitches.map((pitch) => {
                try {
                  return <PitchCard key={pitch.id} pitch={pitch} onReserve={handleReserve} />;
                } catch (err) {
                  console.error('Error rendering pitch card:', pitch, err);
                  setRenderError(`Error al mostrar cancha ID ${pitch.id}: ${err instanceof Error ? err.message : 'Error desconocido'}`);
                  return null;
                }
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ReservePitchPage;
