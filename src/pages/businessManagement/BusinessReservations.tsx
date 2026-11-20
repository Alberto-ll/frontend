import { useEffect, useState, useCallback, useRef, type ChangeEvent } from 'react';
import { useOutletContext, Navigate } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { parseLocalDate } from '../../utils/date';
import { errorHandler } from '../../utils/errorHandler';
import { useAuth } from '../../hooks/useAuth'; 
import { businessService, reservationService } from '../../services';
import type { BusinessData } from '../../types/businessType';
import '../../static/css/MyBusinessReservations.css';

interface Reservation {
  id: number;
  ReservationDate: string;
  ReservationTime: string;
  status: string;
  totalPrice?: number;
  pitchId?: number;
  userId?: number;
  pitch?: {
    id: number;
    name: string;
    size: string;
    groundType: string;
    price?: number;
  };
  user?: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
}

/**
 * Estados del dominio, espejo de `RESERVATION_STATUS` en
 * backend/src/reservation/reservationStateMachine.ts.
 *
 * La UI usa directamente estos valores (sin token interno intermedio) para
 * evitar el doble mapeo backend → token → backend que generaba transiciones
 * rechazadas con 400 por el backend.
 */
const RESERVATION_STATUS = {
  PENDING_PAYMENT: 'pendiente_pago',
  CONFIRMED: 'confirmada',
  READY_TO_PAY: 'listo_pagar',
  IN_PROGRESS: 'en curso',
  COMPLETED: 'completada',
  CANCELLED: 'cancelada',
  ABSENT: 'ausente',
  EXPIRED: 'expirada',
  PAYMENT_REJECTED: 'pago_rechazado',
} as const;

type ReservationStatus = (typeof RESERVATION_STATUS)[keyof typeof RESERVATION_STATUS];

const STATUS_VALUES: readonly string[] = Object.values(RESERVATION_STATUS);

const STATUS_LABELS: Record<ReservationStatus, string> = {
  [RESERVATION_STATUS.PENDING_PAYMENT]: 'Pendiente de pago',
  [RESERVATION_STATUS.CONFIRMED]: 'Confirmada',
  [RESERVATION_STATUS.READY_TO_PAY]: 'Lista para pagar',
  [RESERVATION_STATUS.IN_PROGRESS]: 'En Curso',
  [RESERVATION_STATUS.COMPLETED]: 'Completada',
  [RESERVATION_STATUS.CANCELLED]: 'Cancelada',
  [RESERVATION_STATUS.ABSENT]: 'Ausente',
  [RESERVATION_STATUS.EXPIRED]: 'Expirada',
  [RESERVATION_STATUS.PAYMENT_REJECTED]: 'Pago rechazado',
};

const STATUS_COLOR_CLASS: Record<ReservationStatus, string> = {
  [RESERVATION_STATUS.PENDING_PAYMENT]: 'status-pending-payment',
  [RESERVATION_STATUS.CONFIRMED]: 'status-confirmed',
  [RESERVATION_STATUS.READY_TO_PAY]: 'status-ready-to-pay',
  [RESERVATION_STATUS.IN_PROGRESS]: 'status-in-progress',
  [RESERVATION_STATUS.COMPLETED]: 'status-completed',
  [RESERVATION_STATUS.CANCELLED]: 'status-cancelled',
  [RESERVATION_STATUS.ABSENT]: 'status-absent',
  [RESERVATION_STATUS.EXPIRED]: 'status-expired',
  [RESERVATION_STATUS.PAYMENT_REJECTED]: 'status-rejected',
};

interface StatusAction {
  value: ReservationStatus;
  label: string;
  successMessage: string;
}

/**
 * Transiciones manuales aceptadas por `PUT /reservations/update/:id` para
 * OWNER/ADMIN. El resto de cambios de estado no se ofrece en esta pantalla:
 * - Los estados de pago (`pendiente_pago`, `confirmada`, `listo_pagar`,
 *   `en curso`) los define el webhook de Mercado Pago (400 desde /update).
 * - La cancelación tiene su propio endpoint (`PUT /reservations/cancel/:id`),
 *   que además invalida los pagos pendientes en Mercado Pago.
 */
const STATUS_ACTIONS: Partial<Record<ReservationStatus, StatusAction[]>> = {
  [RESERVATION_STATUS.READY_TO_PAY]: [
    {
      value: RESERVATION_STATUS.ABSENT,
      label: 'Marcar ausente',
      successMessage: 'Reservación marcada como ausente',
    },
  ],
  [RESERVATION_STATUS.IN_PROGRESS]: [
    {
      value: RESERVATION_STATUS.COMPLETED,
      label: 'Marcar completada',
      successMessage: 'Reservación completada',
    },
  ],
};

/** Normaliza datos previos a la migración ('pendiente' → 'pendiente_pago'). */
function normalizeStatus(status: string): string {
  return status === 'pendiente' ? RESERVATION_STATUS.PENDING_PAYMENT : status;
}

function isReservationStatus(value: string): value is ReservationStatus {
  return STATUS_VALUES.includes(value);
}

function getStatusActions(status: string): StatusAction[] {
  const normalized = normalizeStatus(status);
  return isReservationStatus(normalized) ? (STATUS_ACTIONS[normalized] ?? []) : [];
}

function getStatusText(status: string): string {
  const normalized = normalizeStatus(status);
  return isReservationStatus(normalized) ? STATUS_LABELS[normalized] : status;
}

function getStatusColor(status: string): string {
  const normalized = normalizeStatus(status);
  return isReservationStatus(normalized)
    ? STATUS_COLOR_CLASS[normalized]
    : 'status-pending-payment';
}

type FilterType = 'all' | 'today' | ReservationStatus;

const FILTER_BUTTONS: { filter: FilterType; label: string }[] = [
  { filter: 'all', label: 'Todas' },
  { filter: 'today', label: 'Hoy' },
  { filter: RESERVATION_STATUS.PENDING_PAYMENT, label: 'Pendientes de pago' },
  { filter: RESERVATION_STATUS.CONFIRMED, label: 'Confirmadas' },
  { filter: RESERVATION_STATUS.READY_TO_PAY, label: 'Listas para pagar' },
  { filter: RESERVATION_STATUS.IN_PROGRESS, label: 'En Curso' },
  { filter: RESERVATION_STATUS.COMPLETED, label: 'Completadas' },
  { filter: RESERVATION_STATUS.ABSENT, label: 'Ausentes' },
  { filter: RESERVATION_STATUS.CANCELLED, label: 'Canceladas' },
];

export default function BusinessReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [businessId, setBusinessId] = useState<number | null>(null);
  const [hasNoBusiness, setHasNoBusiness] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [updatingReservation, setUpdatingReservation] = useState<number | null>(null);
  const isFetchingRef = useRef(false);
  const noReservationsNotifiedRef = useRef(false);
  const [listLoading, setListLoading] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [startDateInput, setStartDateInput] = useState<string>(searchParams.get('startDate') || '');
  const [endDateInput, setEndDateInput] = useState<string>(searchParams.get('endDate') || '');

  const { userData, token, isLoading } = useAuth();
  
  const { showNotification } = useOutletContext<{ showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void }>();

  const getBusinessId = useCallback(async () => {
    try {
      if (!userData?.id) {
        throw new Error('No se pudo obtener el ID del usuario');
      }

      const businessData = (await businessService.findByOwnerId(userData.id)) as BusinessData | BusinessData[] | null;
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
      
    } catch (error) {
      const errObj = error as { _status?: number };
      if (errObj?._status === 404) {
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
  }, [userData?.id, showNotification]);

  const formatDateForBackend = (dateString: string): string => {
    try {
      if (dateString.includes('T')) {
        const datePart = dateString.split('T')[0];
        return datePart;
      }
      
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateString;
      }
      
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        throw new Error('Fecha inválida');
      }
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      
      return formattedDate;
      
    } catch {
      const dateMatch = dateString.match(/\d{4}-\d{2}-\d{2}/);
      return dateMatch ? dateMatch[0] : dateString;
    }
  };

  const formatTimeForBackend = (timeString: string): string => {
    try {
      if (timeString.includes(':')) {
        const timeParts = timeString.split(':');
        if (timeParts.length >= 2) {
          const hours = timeParts[0].padStart(2, '0');
          const minutes = timeParts[1].padStart(2, '0');
          const formattedTime = `${hours}:${minutes}`;
          return formattedTime;
        }
      }
      
      const date = new Date(timeString);
      if (!isNaN(date.getTime())) {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const formattedTime = `${hours}:${minutes}`;
        return formattedTime;
      }
      
      return timeString;
      
    } catch {
      return timeString;
    }
  };

  const updateReservationStatus = async (reservationId: number, newStatus: ReservationStatus) => {
    const currentReservation = reservations.find(r => r.id === reservationId);
    if (!currentReservation) {
      showNotification('No se encontró la reservación', 'error');
      return;
    }

    const currentStatus = currentReservation.status;
    const allowedActions = getStatusActions(currentStatus);
    const action = allowedActions.find(a => a.value === newStatus);

    // Guarda defensiva: nunca enviar al backend una transición que rechazaría.
    if (!action) {
      showNotification(
        `No se puede cambiar una reservación de "${getStatusText(currentStatus)}" a "${getStatusText(newStatus)}" desde esta pantalla.`,
        'error'
      );
      return;
    }

    try {
      setUpdatingReservation(reservationId);

      const updateBody = {
        ReservationDate: formatDateForBackend(currentReservation.ReservationDate),
        ReservationTime: formatTimeForBackend(currentReservation.ReservationTime),
        status: newStatus,
        pitch: currentReservation.pitchId || (currentReservation.pitch?.id),
        user: currentReservation.userId || (currentReservation.user?.id),
        ...(currentReservation.totalPrice && { totalPrice: currentReservation.totalPrice })
      };

      if (!updateBody.pitch) {
        throw new Error('No se encontró el ID de la cancha');
      }
      if (!updateBody.user) {
        throw new Error('No se encontró el ID del usuario');
      }
      if (!updateBody.ReservationDate || updateBody.ReservationDate === 'Invalid Date') {
        throw new Error('Fecha de reservación inválida');
      }
      if (!updateBody.ReservationTime) {
        throw new Error('Hora de reservación inválida');
      }

      await reservationService.update(reservationId, updateBody);
      
      showNotification(action.successMessage, 'success');
      
      setReservations(prev => prev.map(res => 
        res.id === reservationId ? { ...res, status: newStatus } : res
      ));
      
    } catch (error) {
      console.error(`Error completo actualizando estado:`, error);
      
      let errorMessage = 'Error al actualizar la reservación';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else {
        const errObj = error as { error?: string; message?: string };
        errorMessage = errObj?.error || errObj?.message || errorMessage;
      }
      
      showNotification(errorMessage, 'error');
      
      setTimeout(() => {
        initializeData();
      }, 2000);
      
    } finally {
      setUpdatingReservation(null);
    }
  };

  const getReservations = useCallback(async (currentBusinessId?: number, filters?: { status?: string; startDate?: string; endDate?: string }, options?: { showGlobalLoading?: boolean }) => {
    try {
      if (isFetchingRef.current) {
        return;
      }
      isFetchingRef.current = true;

      const showGlobalLoading = options?.showGlobalLoading !== false;
      if (showGlobalLoading) {
        setLoading(true);
      } else {
        setListLoading(true);
      }
      setError(false);
      
      let targetBusinessId = currentBusinessId || businessId;
      if (!targetBusinessId) {
        targetBusinessId = await getBusinessId();
        if (!targetBusinessId) {
          return;
        }
      }

      const params: Record<string, string | number | boolean | undefined | null> = {};
      if (filters?.status) params.status = filters.status;
      if (filters?.startDate) params.startDate = filters.startDate;
      if (filters?.endDate) params.endDate = filters.endDate;

      let json: Reservation[];
      try {
        json = await reservationService.findByBusiness(targetBusinessId, params) as unknown as Reservation[];
      } catch (err) {
        const errObj = err as { _status?: number; error?: string };
        if (errObj?._status === 404) {
          setReservations([]);
          if (!noReservationsNotifiedRef.current) {
            showNotification('No tienes reservaciones registradas aún', 'info');
            noReservationsNotifiedRef.current = true;
          }
          return;
        }
        
        if (errObj?.error && errObj.error.includes('No reservations found')) {
          setReservations([]);
          if (!noReservationsNotifiedRef.current) {
            showNotification('No tienes reservaciones registradas aún', 'info');
            noReservationsNotifiedRef.current = true;
          }
          return;
        }
        
        throw err;
      }
    
      const reservationsWithMappedStatus = json?.map(reservation => ({
        ...reservation,
        status: normalizeStatus(reservation.status)
      })) || [];

      noReservationsNotifiedRef.current = false;
      setReservations(reservationsWithMappedStatus);

    } catch (error) {
      console.error('Error getting reservations:', error);
      showNotification(errorHandler(error), 'error');
      setError(true);
    } finally {
      isFetchingRef.current = false;
      if (options?.showGlobalLoading === false) {
        setListLoading(false);
      } else {
        setLoading(false);
      }
    }
  }, [businessId, getBusinessId, showNotification]);

  useEffect(() => {
    setFilteredReservations(reservations);
  }, [reservations]);

  const applyFilter = (filter: FilterType) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('startDate');
    params.delete('endDate');
    params.delete('status');
    if (filter === 'all') {
      params.delete('filter');
    } else {
      params.set('filter', filter);
    }
    setSearchParams(params);
  };

  const applyDateFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('filter');
    params.delete('status');
    if (startDateInput) params.set('startDate', startDateInput); else params.delete('startDate');
    if (endDateInput) params.set('endDate', endDateInput); else params.delete('endDate');
    setSearchParams(params);
  };

  const clearDateFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('startDate');
    params.delete('endDate');
    setSearchParams(params);
    setStartDateInput('');
    setEndDateInput('');
  };

  const updateDateParam = (key: 'startDate' | 'endDate', value?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('filter');
    params.delete('status');
    if (value) params.set(key, value); else params.delete(key);
    setSearchParams(params);
  };

  const handleStartDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setStartDateInput(value);
    updateDateParam('startDate', value || undefined);
  };

  const handleEndDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEndDateInput(value);
    updateDateParam('endDate', value || undefined);
  };

  useEffect(() => {
    if (isLoading || !token) return;

    const statusParam = normalizeStatus(searchParams.get('status') ?? '');
    const filterParam = searchParams.get('filter');

    const startParamInput = searchParams.get('startDate') || '';
    const endParamInput = searchParams.get('endDate') || '';
    setStartDateInput(startParamInput);
    setEndDateInput(endParamInput);

    const start = searchParams.get('startDate') || undefined;
    const end = searchParams.get('endDate') || undefined;

    if (isReservationStatus(statusParam)) {
      setActiveFilter(statusParam);
    } else if (filterParam === 'today') {
      setActiveFilter('today');
    } else if (filterParam && isReservationStatus(normalizeStatus(filterParam))) {
      setActiveFilter(normalizeStatus(filterParam) as ReservationStatus);
    } else {
      setActiveFilter('all');
    }

    let backendStatus: string | undefined = isReservationStatus(statusParam) ? statusParam : undefined;
    let s = start;
    let e = end;

    if (!backendStatus && filterParam) {
      if (filterParam === 'today') {
        const today = new Date().toLocaleDateString('en-CA');
        s = s || today;
        e = e || today;
      } else if (isReservationStatus(normalizeStatus(filterParam))) {
        backendStatus = normalizeStatus(filterParam);
      }
    }

    getReservations(undefined, { status: backendStatus, startDate: s, endDate: e }, { showGlobalLoading: false });
  }, [searchParams, getReservations, isLoading, token]);

  const initializeData = useCallback(async () => {
    try {
      setError(false);
      setHasNoBusiness(false);
      
      if (!token) {
        showNotification('Usuario no autenticado', 'error');
        setError(true);
        setLoading(false);
        return;
      }

      const currentBusinessId = await getBusinessId();
      if (currentBusinessId) {
        const statusParam = normalizeStatus(searchParams.get('status') ?? '');
        const filterParam = searchParams.get('filter');
        let backendStatus: string | undefined = isReservationStatus(statusParam) ? statusParam : undefined;
        let s = searchParams.get('startDate') || undefined;
        let e = searchParams.get('endDate') || undefined;

        if (!backendStatus && filterParam) {
          if (filterParam === 'today') {
            const today = new Date().toLocaleDateString('en-CA');
            s = s || today;
            e = e || today;
          } else if (isReservationStatus(normalizeStatus(filterParam))) {
            backendStatus = normalizeStatus(filterParam);
          }
        }

        await getReservations(currentBusinessId, { status: backendStatus, startDate: s, endDate: e });
      }
    } catch (error) {
      console.error('Error inicializando datos:', error);
      setError(true);
      setLoading(false);
    }
  }, [token, getBusinessId, getReservations, showNotification, searchParams]);

  if (isLoading) {
    return <div>Cargando...</div>;
  }
  if (!token) {
    return <Navigate to="/login" />;
  }
  if (userData && userData.category !== "business_owner" && userData.category !== "admin") {
    return <Navigate to="/" />;
  }

  const extractDate = (dateTimeString: string) => {
    try {
      if (dateTimeString.includes('T')) {
        const datePart = dateTimeString.split('T')[0];
        const [year, month, day] = datePart.split('-');
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString('es-ES', {
          weekday: 'short',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
      }
      
      if (dateTimeString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateTimeString.split('-');
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString('es-ES', {
          weekday: 'short',
          year: 'numeric', 
          month: '2-digit',
          day: '2-digit'
        });
      }
      
      const date = new Date(dateTimeString);
      
      const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
      
      return utcDate.toLocaleDateString('es-ES', {
        weekday: 'short',
        year: 'numeric',
        month: '2-digit', 
        day: '2-digit'
      });
      
    } catch {
      return dateTimeString || 'Fecha inválida';
    }
  };

  const extractTime = (timeString: string) => {
    if (timeString && timeString.includes(':')) {
      const timeParts = timeString.split(':');
      if (timeParts.length >= 2) {
        return `${timeParts[0]}:${timeParts[1]}`;
      }
    }
    
    const date = new Date(timeString);
    if (!isNaN(date.getTime())) {
      return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    return timeString || 'Hora no disponible';
  };

  const getStats = () => {
    const today = new Date().toDateString();
    const countByStatus = (status: ReservationStatus) =>
      reservations.filter(res => res.status === status).length;
    return {
      total: reservations.length,
      today: reservations.filter(res => 
        parseLocalDate(res.ReservationDate).toDateString() === today
      ).length,
      pending: countByStatus(RESERVATION_STATUS.PENDING_PAYMENT),
      confirmed: countByStatus(RESERVATION_STATUS.CONFIRMED),
      readyToPay: countByStatus(RESERVATION_STATUS.READY_TO_PAY),
      inProgress: countByStatus(RESERVATION_STATUS.IN_PROGRESS),
      cancelled: countByStatus(RESERVATION_STATUS.CANCELLED),
      completed: countByStatus(RESERVATION_STATUS.COMPLETED),
      absent: countByStatus(RESERVATION_STATUS.ABSENT),
    };
  };

  const stats = getStats();

  if (isLoading || (loading && reservations.length === 0)) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>
          {isLoading ? 'Verificando autenticación...' : 'Cargando reservaciones del negocio...'}
        </p>
      </div>
    );
  }

  if (hasNoBusiness) {
    return (
      <div className="no-business-container">
        <h3>No tienes un negocio registrado</h3>
        <p>Para ver las reservaciones, primero debes registrar tu negocio.</p>
        <div className="action-buttons">
          <button 
            onClick={() => window.location.href = '/registerBusiness'} 
            className="primary-button"
          >
            Registrar mi negocio
          </button>
          <button onClick={initializeData} className="secondary-button">
            Verificar nuevamente
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>Error al cargar las reservaciones del negocio</p>
        <button onClick={initializeData} className="retry-button">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="reservations-container">
      <div className="reservations-header">
        <h2>Reservaciones del Negocio</h2>
        <div className="reservations-summary">
          <strong>Total: {stats.total} reservaciones</strong>
          <span> | Negocio ID: {businessId}</span>
          {userData?.name && <span> | Usuario: {userData.name}</span>}
        </div>
      </div>

      <div className="filters-section">
        <div className="filters-header">
          <h3>Filtros</h3>
          <div className="active-filter-info">
            Mostrando: {filteredReservations.length} de {reservations.length}
          </div>
        </div>
        <div className="filters-grid">
          <div className="date-range-filters" style={{display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px'}}>
            <input type="date" value={startDateInput} onChange={handleStartDateChange} />
            <span>—</span>
            <input type="date" value={endDateInput} onChange={handleEndDateChange} />
            <button onClick={applyDateFilter} className="secondary-button">Aplicar</button>
            <button onClick={clearDateFilter} className="secondary-button">Limpiar</button>
          </div>
          {FILTER_BUTTONS.map(({ filter, label }) => (
            <button
              key={filter}
              className={`filter-button ${activeFilter === filter ? 'active' : ''}`}
              onClick={() => applyFilter(filter)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="table-container">
            {listLoading && (
              <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'}}>
                <div className="loading-spinner" style={{width: 20, height: 20}}></div>
                <span>Cargando reservaciones...</span>
              </div>
            )}

            {filteredReservations.length === 0 ? (
          <div className="no-reservations-message">
            <p>No hay reservaciones que coincidan con el filtro seleccionado</p>
            <button 
              onClick={() => setSearchParams(new URLSearchParams())}
              className="secondary-button"
            >
              Ver todas las reservaciones
            </button>
          </div>
        ) : (
          <table className='reservations-table'>
            <thead>
              <tr>
                <th>ID</th>
                <th>Cancha</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Usuario</th>
                <th>Precio</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredReservations.map((reservation) => {
                const statusActions = getStatusActions(reservation.status);
                return (
                <tr key={reservation.id}>
                  <td className="reservation-id">#{reservation.id}</td>
                  <td>
                    <div className="pitch-info">
                      <strong>{reservation.pitch?.name || `Cancha ${reservation.pitchId || 'N/A'}`}</strong>
                      {reservation.pitch?.size && (
                        <small>{reservation.pitch.size} - {reservation.pitch.groundType}</small>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="date-info">
                      {extractDate(reservation.ReservationDate)}
                    </div>
                  </td>
                  <td>
                    <div className="time-info">
                      {extractTime(reservation.ReservationTime)}
                    </div>
                  </td>
                  <td>
                    <div className="user-info">
                      <strong>{reservation.user?.name || 'Cliente'}</strong>
                      {reservation.user?.phone && (
                        <small>{reservation.user.phone}</small>
                      )}
                      {reservation.user?.email && (
                        <small>{reservation.user.email}</small>
                      )}
                    </div>
                  </td>
                  <td className="price">
                    ${reservation.totalPrice || reservation.pitch?.price || '0'}
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusColor(reservation.status)}`}>
                      {getStatusText(reservation.status)}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons-container">
                      {statusActions.length > 0 ? (
                        <select
                          value=""
                          onChange={(e) => {
                            const next = e.target.value;
                            if (next && isReservationStatus(next) && next !== reservation.status) {
                              updateReservationStatus(reservation.id, next);
                            }
                          }}
                          disabled={updatingReservation === reservation.id}
                          className="status-select"
                          aria-label={`Cambiar estado de la reservación ${reservation.id}`}
                        >
                          <option value="">Cambiar estado…</option>
                          {statusActions.map(action => (
                            <option key={action.value} value={action.value}>
                              {action.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="no-status-actions">
                          Sin cambios manuales de estado
                        </span>
                      )}
                      
                      {updatingReservation === reservation.id && (
                        <span style={{marginLeft: '8px', color: '#666'}}>Actualizando...</span>
                      )}
                      
                      <div style={{marginTop: '4px', fontSize: '11px', color: '#666'}}>
                        Estado actual: <span style={{fontWeight: 'bold', color: '#333'}}>{getStatusText(reservation.status)}</span>
                      </div>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="reservations-footer">
        <div className="reservations-stats">
          <span>Reservaciones hoy: {stats.today}</span>
          <span> | Pendientes de pago: {stats.pending}</span>
          <span> | Confirmadas: {stats.confirmed}</span>
          <span> | Listas para pagar: {stats.readyToPay}</span>
          <span> | En Curso: {stats.inProgress}</span>
          <span> | Completadas: {stats.completed}</span>
          <span> | Ausentes: {stats.absent}</span>
          <span> | Canceladas: {stats.cancelled}</span>
        </div>
        <button onClick={initializeData} className="refresh-button">
          Actualizar lista
        </button>
      </div>
    </div>
  );
}
