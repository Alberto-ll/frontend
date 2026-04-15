import React from 'react';
import type { ReservePitchFilters } from '../../types/reservePitchTypes';
import '../../static/css/components/PitchFilters.css';

interface PitchFiltersProps {
  filters: ReservePitchFilters;
  onFilterChange: (filters: ReservePitchFilters) => void;
  onClearFilters: () => void;
}

const PitchFilters: React.FC<PitchFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
}) => {
  const handleRoofChange = (value: string) => {
    onFilterChange({
      ...filters,
      roof: value as 'all' | 'covered' | 'uncovered',
    });
  };

  const handleSizeChange = (value: string) => {
    onFilterChange({ ...filters, size: value });
  };

  const handleGroundTypeChange = (value: string) => {
    onFilterChange({ ...filters, groundType: value });
  };

  const handleSearchChange = (value: string) => {
    onFilterChange({ ...filters, searchTerm: value });
  };

  const handlePriceMinChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    onFilterChange({ ...filters, priceMin: numValue });
  };

  const handlePriceMaxChange = (value: string) => {
    // Treat empty or invalid as 0 (meaning "no max filter").
    const numValue = value === '' ? 0 : (parseFloat(value) || 0);
    onFilterChange({ ...filters, priceMax: numValue });
  };

  return (
    <div className="pitch-filters-container">
      <div className="pitch-filters-header">
        <h3 className="pitch-filters-title">🔍 Filtros de búsqueda</h3>
        <button onClick={onClearFilters} className="pitch-clear-filters-btn">
          🧹 Limpiar
        </button>
      </div>

      <div className="pitch-filters-grid">
        {/* Search Filter */}
        <div className="pitch-filter-group">
          <label htmlFor="search" className="pitch-filter-label">
            Buscar:
          </label>
          <input
            type="text"
            id="search"
            placeholder="Nombre del negocio..."
            value={filters.searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pitch-filter-input"
          />
        </div>

        {/* Roof Filter */}
        <div className="pitch-filter-group">
          <label htmlFor="roof" className="pitch-filter-label">
            Techo:
          </label>
          <select
            id="roof"
            value={filters.roof}
            onChange={(e) => handleRoofChange(e.target.value)}
            className="pitch-filter-select"
          >
            <option value="all">Todas</option>
            <option value="covered">Con techo</option>
            <option value="uncovered">Sin techo</option>
          </select>
        </div>

        {/* Size Filter */}
        <div className="pitch-filter-group">
          <label htmlFor="size" className="pitch-filter-label">
            Tamaño de cancha:
          </label>
          <select
            id="size"
            value={filters.size}
            onChange={(e) => handleSizeChange(e.target.value)}
            className="pitch-filter-select"
          >
            <option value="all">Todos los tamaños</option>
            <option value="5v5">Fut5</option>
            <option value="7v7">Fut7</option>
            <option value="11v11">Fut11</option>
          </select>
        </div>

        {/* Ground Type Filter */}
        <div className="pitch-filter-group">
          <label htmlFor="groundType" className="pitch-filter-label">
            Tipo de suelo:
          </label>
          <select
            id="groundType"
            value={filters.groundType}
            onChange={(e) => handleGroundTypeChange(e.target.value)}
            className="pitch-filter-select"
          >
            <option value="all">Todos los suelos</option>
            <option value="césped natural">Césped natural</option>
            <option value="césped sintético">Césped sintético</option>
            <option value="cemento">Cemento</option>
            <option value="arcilla">Arcilla</option>
          </select>
        </div>

        {/* Price Range Filter */}
        <div className="pitch-filter-group pitch-price-filter-group">
          <label className="pitch-filter-label">Rango de precio:</label>
          <div className="pitch-price-inputs">
            <input
              type="number"
              placeholder="Mín"
              value={filters.priceMin}
              onChange={(e) => handlePriceMinChange(e.target.value)}
              className="pitch-filter-input pitch-price-input"
              min="0"
              step="0.01"
            />
            <span className="pitch-price-separator">-</span>
            <input
              type="number"
              placeholder="Máx"
              value={filters.priceMax}
              onChange={(e) => handlePriceMaxChange(e.target.value)}
              className="pitch-filter-input pitch-price-input"
              min="0"
              step="0.01"
            />
          </div>
          <div className="pitch-price-display">
            {filters.priceMin === 0 && filters.priceMax === 0
              ? 'Sin filtro'
              : ` $${filters.priceMin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} - $${filters.priceMax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PitchFilters;
