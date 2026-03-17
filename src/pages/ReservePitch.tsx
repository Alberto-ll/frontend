import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import type { ReservePitch, ReservePitchFilters } from '../types/reservePitchTypes';
import PitchFilters from '../components/filters/PitchFilters';
import PitchCard from '../components/pitches/PitchCard';
import '../static/css/ReservePitch.css';
import { useAuth } from '../hooks/useAuth';

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
    priceMax: 999999,
    searchTerm: '',
  });

  // Fetch pitches from GET /api/pitchs/getAll (no authentication required)
  const fetchPitches = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://localhost:3000/api/pitchs/getAllFromActiveBusinesses', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Handle 401 Unauthorized (expired/invalid token)
      if (response.status === 401) {
        localStorage.removeItem('user');
        alert('Sesión expirada. Por favor inicia sesión nuevamente.');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log('Pitches data received:', responseData);

      // Handle different response formats (data array or direct array)
      let pitchesData: ReservePitch[] = [];
      if (Array.isArray(responseData)) {
        pitchesData = responseData;
      } else if (responseData.data && Array.isArray(responseData.data)) {
        pitchesData = responseData.data;
      } else {
        console.error('Unexpected response format:', responseData);
        throw new Error('Formato de respuesta inesperado');
      }

      console.log('Processed pitches:', pitchesData);
      console.log('First pitch structure:', pitchesData[0]);
      
      setPitches(pitchesData);

      // Auto-adjust max price filter based on available pitches
      if (pitchesData.length > 0) {
        const maxPrice = Math.max(...pitchesData.map((p) => p.price));
        setFilters((prev) => ({ ...prev, priceMax: Math.ceil(maxPrice * 1.2) }));
      }
    } catch (err) {
      console.error('Error fetching pitches:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar canchas');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Filter pitches based on current filters
  const filteredPitches = pitches.filter((pitch) => {
    try {
      // Safe access to business name with fallback
      const businessName = pitch.business?.businessName || '';
      const matchesSearch =
        businessName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (pitch.groundType || '').toLowerCase().includes(filters.searchTerm.toLowerCase());

      const matchesRoof =
        filters.roof === 'all' ||
        (filters.roof === 'covered' && pitch.roof) ||
        (filters.roof === 'uncovered' && !pitch.roof);

      const matchesSize = filters.size === 'all' || pitch.size === filters.size;

      const matchesGroundType =
        filters.groundType === 'all' || pitch.groundType === filters.groundType;

      const matchesPrice = pitch.price >= filters.priceMin && pitch.price <= filters.priceMax;

      return matchesSearch && matchesRoof && matchesSize && matchesGroundType && matchesPrice;
    } catch (error) {
      console.error('Error filtering pitch:', pitch, error);
      return false;
    }
  });

  // Handle filter changes
  const handleFilterChange = (newFilters: ReservePitchFilters) => {
    setFilters(newFilters);
  };

  // Clear all filters
  const handleClearFilters = () => {
    const maxPrice = pitches.length > 0 ? Math.max(...pitches.map((p) => p.price)) : 999999;
    setFilters({
      roof: 'all',
      size: 'all',
      groundType: 'all',
      priceMin: 0,
      priceMax: Math.ceil(maxPrice * 1.2),
      searchTerm: '',
    });
  };

  // Handle reserve button click - navigate to reservation page
  const handleReserve = (pitchId: number) => {
    navigate(`/makeReservation/${pitchId}`);
  };

  // Fetch pitches on component mount (only when authenticated)
  useEffect(() => {
    if (userData) {
      fetchPitches();
    }
  }, [userData, fetchPitches]);

  if (!token) {
    return (
      <div className="reserve-pitch-container">
        <div className="reserve-pitch-loading">
          <p className="loading-text">Debes iniciar sesión para ingresar a esta página correctamente.</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="reserve-pitch-container">
        <div className="reserve-pitch-loading">
          <div className="loading-spinner"></div>
          <p className="loading-text">Cargando canchas disponibles...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="reserve-pitch-container">
        <div className="reserve-pitch-error">
          <div className="error-message">
            <h3>❌ Error al cargar canchas</h3>
            <p>{error}</p>
          </div>
          <button onClick={fetchPitches} className="retry-button">
            🔄 Reintentar
          </button>
        </div>
      </div>
    );
  }

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
            🔍 Mostrando: <strong>{filteredPitches.length}</strong> canchas
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
          {renderError ? (
            <div className="no-results">
              <p className="no-results-icon">⚠️</p>
              <h3 className="no-results-title">Error al mostrar canchas</h3>
              <p className="no-results-text">{renderError}</p>
              <button onClick={() => { setRenderError(null); fetchPitches(); }} className="retry-button">
                🔄 Reintentar
              </button>
            </div>
          ) : filteredPitches.length === 0 ? (
            <div className="no-results">
              <p className="no-results-icon">🔍</p>
              <h3 className="no-results-title">No se encontraron canchas</h3>
              <p className="no-results-text">
                Intenta ajustar los filtros para ver más resultados
              </p>
            </div>
          ) : (
            <div className="pitch-cards-grid">
              {filteredPitches.map((pitch) => {
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
