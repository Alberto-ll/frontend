import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useOutletContext } from 'react-router';
import { FaSearch, FaFutbol } from 'react-icons/fa';
import type { BusinessData } from '../../types/businessType';
import { businessService, localityService } from '../../services';
import { errorHandler } from '../../types/apiError';
import BusinessCard from '../../components/business/BusinessCard';
import '../../static/css/businessList.css';

interface Locality {
  id: number;
  name: string;
}

export const BusinessListPage: React.FC = () => {
  const [businesses, setBusinesses] = useState<BusinessData[]>([]);
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedLocality, setSelectedLocality] = useState<string>('all');

  const { showNotification } = useOutletContext<{
    showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void;
  }>();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [businessesData, localitiesData] = await Promise.all([
        businessService.findAll(),
        localityService.getAll().catch(() => [] as Locality[]),
      ]);

      // Solo mostramos negocios activos para el público
      const activeBusinesses = (businessesData || []).filter(b => b.active);
      setBusinesses(activeBusinesses);
      setLocalities(localitiesData || []);
    } catch (err) {
      const errorMsg = errorHandler(err);
      setError(errorMsg);
      showNotification('Error al cargar la lista de negocios: ' + errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtrado reactivo en el cliente
  const filteredBusinesses = useMemo(() => {
    return businesses.filter(b => {
      // Filtro por texto (nombre o dirección)
      const matchesSearch =
        searchTerm.trim() === '' ||
        b.businessName.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        b.address.toLowerCase().includes(searchTerm.toLowerCase().trim());

      // Filtro por localidad
      const matchesLocality =
        selectedLocality === 'all' ||
        (typeof b.locality === 'object' && b.locality !== null
          ? String(b.locality.id) === selectedLocality
          : String(b.locality) === selectedLocality);

      return matchesSearch && matchesLocality;
    });
  }, [businesses, searchTerm, selectedLocality]);

  return (
    <div className="business-list-container">
      <div className="business-list-page">
        <header className="business-page-header">
          <h1 className="business-page-title">Predios y Negocios Deportivos</h1>
          <p className="business-page-subtitle">
            Explora los complejos registrados, conoce sus instalaciones, horarios de atención y reserva tu cancha favorita.
          </p>
        </header>

        {/* Barra de Filtros */}
        <section className="business-filters-bar">
          <div className="business-search-input-wrapper">
            <FaSearch className="business-search-icon" />
            <input
              type="text"
              className="business-search-input"
              placeholder="Buscar por nombre de predio o dirección..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="business-locality-select-wrapper">
            <select
              className="business-locality-select"
              value={selectedLocality}
              onChange={(e) => setSelectedLocality(e.target.value)}
            >
              <option value="all">Todas las localidades</option>
              {localities.map((loc) => (
                <option key={loc.id} value={String(loc.id)}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          <div className="business-filter-counter">
            {filteredBusinesses.length} {filteredBusinesses.length === 1 ? 'predio encontrado' : 'predios encontrados'}
          </div>
        </section>

        {/* Contenido principal */}
        {loading ? (
          <div className="business-loading-container">
            <div className="business-loading-spinner" />
            <p>Cargando negocios disponibles...</p>
          </div>
        ) : error ? (
          <div className="business-empty-container">
            <p style={{ color: '#dc2626', fontWeight: 600 }}>{error}</p>
            <button
              className="business-action-btn"
              style={{ maxWidth: '200px', margin: '1rem auto 0' }}
              onClick={loadData}
            >
              Reintentar
            </button>
          </div>
        ) : filteredBusinesses.length === 0 ? (
          <div className="business-empty-container">
            <FaFutbol size={40} style={{ color: '#9ca3af', marginBottom: '1rem' }} />
            <h3>No se encontraron negocios</h3>
            <p>Prueba ajustando los términos de búsqueda o cambiando el filtro de localidad.</p>
          </div>
        ) : (
          <div className="business-cards-grid">
            {filteredBusinesses.map((b) => (
              <BusinessCard key={b.id} business={b} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessListPage;
