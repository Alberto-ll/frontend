import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router';
import type { ReservePitch, ReservePitchFilters } from '../types/reservePitchTypes';
import PitchFilters from '../components/filters/PitchFilters';
import PitchCard from '../components/pitches/PitchCard';
import '../static/css/ReservePitch.css';
import { useAuth } from '../components/Auth';

const ReservePitchPage: React.FC = () => {
  const navigate = useNavigate();

  const {userData, token} = useAuth()

  const [pitches, setPitches] = useState<ReservePitch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

  // Initialize filters
  const [filters, setFilters] = useState<ReservePitchFilters>({
    roof: 'all',
    size: 'all',
    groundType: 'all',
    priceMin: 0,
    priceMax: 0,
    searchTerm: '',
  });

  // Fetch pitches from server by sending filters as query params
  const abortRef = useRef<AbortController | null>(null);

  const fetchPitches = useCallback(async (appliedFilters: ReservePitchFilters) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🎯 Token disponible en ReservePitch:', !!token);
      if (!token) {
        navigate('/login');
        return;
      }

      // Cancel previous in-flight request
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      const f = appliedFilters;
      const params = new URLSearchParams();
      if (f.roof && f.roof !== 'all') {
        const roofValue = f.roof === 'covered' ? 'true' : (f.roof === 'uncovered' ? 'false' : '');
        if (roofValue) params.set('roof', roofValue);
      }
      if (f.size && f.size !== 'all') params.set('size', f.size);
      if (f.groundType && f.groundType !== 'all') params.set('groundType', f.groundType);

      // Treat 0/0 as "no price filter". If the user sets a max but leaves min at 0,
      // send priceMin=0 explicitly because some backends expect both bounds.
      const noPriceFilter = typeof f.priceMin === 'number' && typeof f.priceMax === 'number' && f.priceMin === 0 && f.priceMax === 0;
      if (!noPriceFilter) {
        if (typeof f.priceMin === 'number') params.set('priceMin', f.priceMin.toFixed(2));
        if (typeof f.priceMax === 'number' && f.priceMax > 0 && f.priceMax < 999999) params.set('priceMax', f.priceMax.toFixed(2));
      }

      if (f.searchTerm && f.searchTerm.trim()) params.set('q', f.searchTerm.trim());

      const url = `http://localhost:3000/api/pitchs/getAllFromActiveBusinesses${params.toString() ? `?${params.toString()}` : ''}`;

      console.log('🎯 ReservePitch request URL:', url, 'params:', params.toString(), 'filters:', f);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        signal: abortRef.current.signal,
      });

      console.log('🎯 ReservePitch Response status:', response.status);

      if (response.status === 401) {
        localStorage.removeItem('user');
        alert('Sesión expirada. Por favor inicia sesión nuevamente.');
        navigate('/login');
        return;
      }

      if (response.status === 404) {
        const errorText = await response.text();
        console.log('🎯 ReservePitch 404 Response body:', errorText);
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error && errorData.error.includes('No pitches from active businesses')) {
            console.log('🎯 ReservePitch: Backend dice no hay canchas de negocios activos');
            setPitches([]);
            return;
          }
        } catch (parseError) {
          console.log('🎯 ReservePitch: No se pudo parsear el error 404');
        }
        throw new Error('El endpoint de canchas no está disponible');
      }

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      let responseData: any = null;
      try {
        responseData = await response.json();
        console.log('🎯 ReservePitch datos recibidos:', responseData);
      } catch (jsonErr) {
        const text = await response.text();
        console.warn('🎯 ReservePitch response not JSON, raw text:', text);
        throw new Error('Respuesta inesperada del servidor (no JSON)');
      }

      let pitchesData: ReservePitch[] = [];
      if (Array.isArray(responseData)) {
        pitchesData = responseData;
      } else if (responseData.data && Array.isArray(responseData.data)) {
        pitchesData = responseData.data;
      } else if (responseData.pitches && Array.isArray(responseData.pitches)) {
        pitchesData = responseData.pitches;
      } else {
        console.error('🎯 ReservePitch estructura inesperada:', responseData);
        throw new Error('Formato de respuesta inesperado');
      }

      console.log(`🎯 ReservePitch canchas procesadas: ${pitchesData.length}`);
      setPitches(pitchesData);

      // Auto-adjust max price filter based on available pitches.
      // Do NOT override when user explicitly set priceMax to 0 (meaning "no filter").
      if (pitchesData.length > 0) {
        const newPriceMax = Math.ceil(Math.max(...pitchesData.map((p) => p.price)) * 1.2);
        setFilters((prev) => {
          if (prev.priceMax === 0) return prev; // user chose 0 => no filter
          if (prev.priceMax === newPriceMax) return prev; // no change
          return { ...prev, priceMax: newPriceMax };
        });
      }
    } catch (err) {
      if ((err as any)?.name === 'AbortError') return; // cancelled
      console.error('🎯 ReservePitch Error fetching pitches:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar canchas');
    } finally {
      setLoading(false);
    }
  }, [navigate, token]);

  // Server-side filtering: when filters change, request backend with query params (debounced)
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

  // Handle filter changes
  const handleFilterChange = (newFilters: ReservePitchFilters) => {
    setFilters(newFilters);
  };

  // Clear all filters
  const handleClearFilters = () => {
    // Clearing filters => set price range to 0/0 meaning "no price filter"
    setFilters({
      roof: 'all',
      size: 'all',
      groundType: 'all',
      priceMin: 0,
      priceMax: 0,
      searchTerm: '',
    });
  };

  // Handle reserve button click - navigate to reservation page
  const handleReserve = (pitchId: number) => {
    navigate(`/makeReservation/${pitchId}`);
  };

  // Initial fetch handled by debounced effect above when `userData` becomes available

  if (!token) {
    return (
      <div className="reserve-pitch-container">
        <div className="reserve-pitch-loading">
          <p className="loading-text">Debes iniciar sesión para ingresar a esta página correctamente.</p>
        </div>
      </div>
    );
  }

  // Note: loading and fetch `error` are rendered inside the main content

  return (
    <div className="reserve-pitch-container">
      {/* Header Section */}
      <div className="reserve-pitch-header">
        <h1 className="reserve-pitch-title">🏟️ Reservar una Cancha</h1>
        <p className="reserve-pitch-subtitle">
          Encuentra la cancha perfecta para tu próximo partido
        </p>
          <div className="reserve-pitch-stats">
          <span className="stat-badge">
            📊 Total: <strong>{pitches.length}</strong> canchas
          </span>
          <span className="stat-badge">
            🔍 Mostrando: <strong>{pitches.length}</strong> canchas
          </span>
        </div>
      </div>

      {/* Main Content: Filters + Pitch Grid */}
      <div className="reserve-pitch-content">
        {/* Filters Sidebar */}
        <aside className="reserve-pitch-sidebar">
          <PitchFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />
        </aside>

        {/* Pitch Cards Grid */}
        <main className="reserve-pitch-main">
          {loading ? (
            <div className="reserve-pitch-loading">
              <div className="loading-spinner"></div>
              <p className="loading-text">Cargando canchas disponibles...</p>
            </div>
          ) : error ? (
            <div className="reserve-pitch-error">
              <div className="error-message">
                <h3>❌ Error al cargar canchas</h3>
                <p>{error}</p>
              </div>
              <button onClick={() => fetchPitches(filters)} className="retry-button">
                🔄 Reintentar
              </button>
            </div>
          ) : renderError ? (
            <div className="no-results">
              <p className="no-results-icon">⚠️</p>
              <h3 className="no-results-title">Error al mostrar canchas</h3>
              <p className="no-results-text">{renderError}</p>
              <button onClick={() => { setRenderError(null); fetchPitches(filters); }} className="retry-button">
                🔄 Reintentar
              </button>
            </div>
          ) : pitches.length === 0 ? (
            <div className="no-results">
              <p className="no-results-icon">📭</p>
              <h3 className="no-results-title">No hay canchas disponibles</h3>
              <p className="no-results-text">
                Actualmente no hay canchas que coincidan con los filtros seleccionados.
              </p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <button onClick={() => fetchPitches(filters)} className="retry-button">
                  🔄 Actualizar
                </button>
                <button onClick={handleClearFilters} className="retry-button">
                  🗑️ Limpiar filtros
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

      {/* No ReservationModal: navigation to /makeReservation/:id is used instead */}
    </div>
  );
};

export default ReservePitchPage;
