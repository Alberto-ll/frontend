import { useEffect, useState, useCallback, useRef, ChangeEvent } from 'react';
import { useOutletContext, Navigate } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { errorHandler } from '../../types/apiError.ts';
import { useAuth } from '../../components/Auth.tsx'; 
import '../../static/css/MyBusinessReservations.css';

// Interfaces TypeScript - SOLO 4 ESTADOS
interface Reservation {
  id: number;
  ReservationDate: string;
  ReservationTime: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
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

interface ReservationResponse {
  data: Reservation[];
}

type FilterType = 'all' | 'today' | 'pending' | 'confirmed' | 'cancelled' | 'completed';

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

  // USAR useAuth EN LUGAR DE OBTENER TOKEN MANUALMENTE
  const { userData, token, isLoading } = useAuth();
  
  const { showNotification } = useOutletContext<{ showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void }>();

  // VERIFICACIÓN DE SESIÓN SIMPLIFICADA
  if (!isLoading && !token) {
    return <Navigate to="/login" />;
  }

  // FUNCIÓN para obtener el businessId del usuario
  const getBusinessId = useCallback(async () => {
    try {
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      if (!userData?.id) {
        throw new Error('No se pudo obtener el ID del usuario');
      }

      const response = await fetch(`http://localhost:3000/api/business/findByOwnerId/${userData.id}`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 401 || response.status === 403) {
        showNotification('Sesión expirada o inválida', 'error');
        return null;
      }
      
      if (response.status === 404) {
        setHasNoBusiness(true);
        setLoading(false);
        showNotification('No tienes un negocio registrado aún', 'warning');
        return null;
      }
      
      if (!response.ok) {
        const errors = await response.json();
        throw new Error(`Error ${response.status}: ${errors.message || 'Error al obtener el negocio'}`);
      }
      
      const businessData = await response.json();
      
      let extractedBusinessId;
      if (businessData.id) {
        extractedBusinessId = businessData.id;
      } else if (businessData.data && businessData.data.id) {
        extractedBusinessId = businessData.data.id;
      } else if (Array.isArray(businessData) && businessData.length > 0) {
        extractedBusinessId = businessData[0].id;
      } else if (Array.isArray(businessData.data) && businessData.data.length > 0) {
        extractedBusinessId = businessData.data[0].id;
      }
      
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
      console.error('Error getting business ID:', error);
      showNotification(errorHandler(error), 'error');
      setError(true);
      throw error;
    }
  }, [token, userData?.id, showNotification]);

  // MAPEO DE ESTADOS FRONTEND → BACKEND (SOLO 4 ESTADOS)
  const mapStatusToBackend = (frontendStatus: string): string => {
    const statusMap: Record<string, string> = {
      'pending': 'pendiente',
      'confirmed': 'en curso',
      'completed': 'completada',
      'cancelled': 'cancelada'
    };
    
    console.log('Mapeando estado frontend->backend:', frontendStatus, '->', statusMap[frontendStatus]);
    return statusMap[frontendStatus] || frontendStatus;
  };

  // MAPEO DE ESTADOS BACKEND → FRONTEND (SOLO 4 ESTADOS)
  const mapStatusFromBackend = (backendStatus: string): string => {
    const statusMap: Record<string, string> = {
      'pendiente': 'pending',
      'en curso': 'confirmed', 
      'completada': 'completed',
      'cancelada': 'cancelled' // <-- CORREGIDO
    };
    
    console.log('Mapeando estado backend->frontend:', backendStatus, '->', statusMap[backendStatus]);
    return statusMap[backendStatus] || backendStatus;
  };

  // FUNCIÓN PARA FORMATEAR FECHA PARA EL BACKEND
  const formatDateForBackend = (dateString: string): string => {
    try {
      console.log('Formateando fecha original:', dateString);
      
      // Si la fecha viene con 'T', extraer solo la parte de fecha
      if (dateString.includes('T')) {
        const datePart = dateString.split('T')[0];
        console.log('Fecha extraída (con T):', datePart);
        return datePart;
      }
      
      // Si la fecha ya está en formato YYYY-MM-DD, usarla directamente
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        console.log('🎯 Fecha ya en formato correcto:', dateString);
        return dateString;
      }
      
      // Si la fecha viene en otro formato, convertirla
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        throw new Error('Fecha inválida');
      }
      
      // Formatear como YYYY-MM-DD
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      
      console.log('Fecha formateada:', formattedDate);
      return formattedDate;
      
    } catch (error) {
      console.error('Error formateando fecha:', error);
      // Fallback: intentar extraer fecha de cualquier formato
      const dateMatch = dateString.match(/\d{4}-\d{2}-\d{2}/);
      return dateMatch ? dateMatch[0] : dateString;
    }
  };

  // FUNCIÓN PARA FORMATEAR HORA PARA EL BACKEND
  const formatTimeForBackend = (timeString: string): string => {
    try {
      console.log('Formateando hora original:', timeString);
      
      // Si ya está en formato HH:MM o HH:MM:SS, verificar y ajustar
      if (timeString.includes(':')) {
        const timeParts = timeString.split(':');
        if (timeParts.length >= 2) {
          // Asegurar formato HH:MM (sin segundos para el backend)
          const hours = timeParts[0].padStart(2, '0');
          const minutes = timeParts[1].padStart(2, '0');
          const formattedTime = `${hours}:${minutes}`;
          console.log('Hora formateada:', formattedTime);
          return formattedTime;
        }
      }
      
      // Si es una fecha completa, extraer la hora
      const date = new Date(timeString);
      if (!isNaN(date.getTime())) {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const formattedTime = `${hours}:${minutes}`;
        console.log('Hora extraída de fecha:', formattedTime);
        return formattedTime;
      }
      
      console.log('Hora sin cambios:', timeString);
      return timeString;
      
    } catch (error) {
      console.error('Error formateando hora:', error);
      return timeString;
    }
  };

  // FUNCIÓN PARA ACTUALIZAR ESTADO DE RESERVACIÓN
  const updateReservationStatus = async (reservationId: number, newStatus: string) => {
    try {
      setUpdatingReservation(reservationId);
      
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      // ENCONTRAR LA RESERVACIÓN ACTUAL para obtener todos sus datos
      const currentReservation = reservations.find(r => r.id === reservationId);
      if (!currentReservation) {
        throw new Error('No se encontró la reservación');
      }

      console.log('Reservación actual encontrada:', currentReservation);

      // PREPARAR EL BODY COMPLETO con todos los campos requeridos Y FORMATEADOS
      const updateBody = {
        ReservationDate: formatDateForBackend(currentReservation.ReservationDate),
        ReservationTime: formatTimeForBackend(currentReservation.ReservationTime),
        status: mapStatusToBackend(newStatus),
        pitch: currentReservation.pitchId || (currentReservation.pitch?.id),
        user: currentReservation.userId || (currentReservation.user?.id),
        // AGREGAR PRECIO SI EXISTE
        ...(currentReservation.totalPrice && { totalPrice: currentReservation.totalPrice })
      };

      console.log('Body final para enviar:', updateBody);

      // 🎯 VALIDAR QUE TENEMOS TODOS LOS CAMPOS REQUERIDOS
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

      console.log('Enviando actualización completa:', { 
        reservationId, 
        frontendStatus: newStatus,
        backendStatus: mapStatusToBackend(newStatus),
        fullBody: updateBody
      });

      // 🎯 USAR EL ENDPOINT DE UPDATE CON PUT
      const response = await fetch(`http://localhost:3000/api/reservations/update/${reservationId}`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateBody)
      });

      console.log('Response status:', response.status);

      if (response.status === 401 || response.status === 403) {
        showNotification('Sesión expirada o inválida', 'error');
        return;
      }

      // 🎯 OBTENER EL TEXTO CRUDO PRIMERO
      const responseText = await response.text();
      console.log('🎯 Response raw text:', responseText);
      
      if (!response.ok) {
        let errorMessage = `Error ${response.status}`;
        
        if (responseText.trim().startsWith('{')) {
          try {
            const errorJson = JSON.parse(responseText);
            console.log('Error JSON:', errorJson);
            
            // 🎯 MANEJO ESPECÍFICO DE ERRORES DE VALIDACIÓN
            if (errorJson.errors && Array.isArray(errorJson.errors)) {
              const errorMessages = errorJson.errors.map((err: any) => `${err.path}: ${err.msg}`).join(', ');
              errorMessage = `Errores de validación: ${errorMessages}`;
              
              // MOSTRAR DETALLES ESPECÍFICOS EN CONSOLA
              console.error('Errores de validación detallados:', errorJson.errors);
            } else {
              errorMessage = errorJson.error || errorJson.message || errorMessage;
            }
          } catch {
            errorMessage = responseText || errorMessage;
          }
        } else {
          errorMessage = responseText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }
      
      // PARSEAR RESPUESTA EXITOSA
      let result = null;
      if (responseText.trim() && responseText.trim().startsWith('{')) {
        try {
          result = JSON.parse(responseText);
          console.log('Parsed result:', result);
        } catch {
          console.log('Response no es JSON válido, pero operación exitosa');
        }
      }
      
      const statusMessages: Record<string, string> = {
        'pending': 'Reservación marcada como pendiente!',
        'confirmed': 'Reservación en curso!',
        'completed': 'Reservación completada!',
        'cancelled': 'Reservación cancelada!'
      };
      
      showNotification(statusMessages[newStatus] || 'Estado actualizado!', 'success');
      
      // ACTUALIZAR ESTADO LOCAL CON EL ESTADO DEL FRONTEND
      setReservations(prev => prev.map(res => 
        res.id === reservationId ? { ...res, status: newStatus as any } : res
      ));
      
    } catch (error) {
      console.error(`Error completo actualizando estado:`, error);
      
      let errorMessage = 'Error al actualizar la reservación';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      showNotification(errorMessage, 'error');
      
      // RECARGAR DATOS PARA VERIFICAR ESTADO ACTUAL
      setTimeout(() => {
        initializeData();
      }, 2000);
      
    } finally {
      setUpdatingReservation(null);
    }
  };

  // FUNCIÓN para obtener todas las reservaciones del negocio
  const getReservations = useCallback(async (currentBusinessId?: number, filters?: { status?: string; startDate?: string; endDate?: string }, options?: { showGlobalLoading?: boolean }) => {
    try {
      // Guard para evitar fetchs concurrentes/replicados
      if (isFetchingRef.current) {
        console.log('getReservations: skipped because a fetch is already in progress');
        return;
      }
      isFetchingRef.current = true;

      console.log('getReservations: start', new Date().toISOString());
      console.trace('getReservations called trace');

      const showGlobalLoading = options?.showGlobalLoading !== false; // default true
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

      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      // Construir query params para delegar filtrado al backend
      const qp = new URLSearchParams();
      if (filters?.status) qp.set('status', filters.status);
      if (filters?.startDate) qp.set('startDate', filters.startDate);
      if (filters?.endDate) qp.set('endDate', filters.endDate);

      const url = `http://localhost:3000/api/reservations/findByBusiness/${targetBusinessId}${qp.toString() ? `?${qp.toString()}` : ''}`;
      console.log('getReservations fetching URL:', url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401 || response.status === 403) {
        showNotification('Sesión expirada o inválida', 'error');
        return;
      }

      if (response.status === 404) {
        setReservations([]);
        if (!noReservationsNotifiedRef.current) {
          showNotification('No tienes reservaciones registradas aún', 'info');
          noReservationsNotifiedRef.current = true;
        }
        return;
      }
      
      if (!response.ok) {
        const errors = await response.json();
        
        if (errors.error && errors.error.includes('No reservations found')) {
          setReservations([]);
          if (!noReservationsNotifiedRef.current) {
            showNotification('No tienes reservaciones registradas aún', 'info');
            noReservationsNotifiedRef.current = true;
          }
          return;
        }
        
        throw new Error(`Error ${response.status}: ${errors.message || errors.error || 'Error al obtener las reservaciones'}`);
      }
      
      const json: ReservationResponse = await response.json();
    
      // DEBUG: Ver qué datos llegan exactamente
      console.log('Reservaciones recibidas:', json.data?.length || 0);
      if (json.data && json.data.length > 0) {
        console.log('Primera reservación:', json.data[0]);
        console.log('Estados encontrados:', json.data.map(r => r.status));
        console.log('Formato de hora ejemplo:', json.data[0].ReservationTime);
        console.log('Formato de fecha ejemplo (RAW):', json.data[0].ReservationDate);
        console.log('Fecha procesada:', extractDate(json.data[0].ReservationDate));
      }
  
      // MAPEAR ESTADOS DEL BACKEND AL FRONTEND
      const reservationsWithMappedStatus = json.data?.map(reservation => ({
        ...reservation,
        status: mapStatusFromBackend(reservation.status) as any
      })) || [];

      console.log('Estados originales del backend:', json.data?.map(r => r.status));
      console.log('Estados mapeados para frontend:', reservationsWithMappedStatus.map(r => r.status));

      // Al recibir datos válidos, resetear la bandera de notificación
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
  }, [businessId, getBusinessId, token, showNotification]);

  

  // Al delegar filtrado al backend, mostrar directamente lo que llega
  useEffect(() => {
    setFilteredReservations(reservations);
  }, [reservations]);

  // Helpers para actualizar query params desde la UI
  const applyFilter = (filter: FilterType) => {
    const params = new URLSearchParams(searchParams.toString());
    // Al aplicar un filtro por estado, limpiamos el rango de fechas
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
    // Al aplicar fecha, limpiamos filtros por estado
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

  // Actualizar query params en vivo mientras el usuario selecciona fechas
  const updateDateParam = (key: 'startDate' | 'endDate', value?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    // Al aplicar fecha, limpiamos filtros por estado para delegar al backend
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

  // Efecto: cuando cambian los query params, pedir datos al backend con esos filtros
  useEffect(() => {
    if (isLoading || !token) return;

    const statusParam = searchParams.get('status');
    const filterParam = searchParams.get('filter');

    // Sincronizar los inputs de fecha con los query params (útil cuando se cambian desde otros controles)
    const startParamInput = searchParams.get('startDate') || '';
    const endParamInput = searchParams.get('endDate') || '';
    setStartDateInput(startParamInput);
    setEndDateInput(endParamInput);

    const start = searchParams.get('startDate') || undefined;
    const end = searchParams.get('endDate') || undefined;

    // Actualizar UI para reflejar params
    if (statusParam) {
      setActiveFilter(mapStatusFromBackend(statusParam) as FilterType);
    } else if (filterParam) {
      setActiveFilter(filterParam as FilterType);
    } else {
      setActiveFilter('all');
    }

    // Preparar status para el backend
    let backendStatus = statusParam || undefined;
    let s = start;
    let e = end;

    if (!backendStatus && filterParam) {
      if (filterParam === 'today') {
        const today = new Date().toISOString().split('T')[0];
        s = s || today;
        e = e || today;
      } else {
        backendStatus = mapStatusToBackend(filterParam);
      }
    }

    // Llamar al backend con los filtros construidos (no mostrar carga global)
    getReservations(undefined, { status: backendStatus, startDate: s, endDate: e }, { showGlobalLoading: false });
  }, [searchParams, getReservations, isLoading, token]);

  //FUNCIÓN PARA REINICIALIZAR
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
        // Respetar filtros actuales en query params al hacer refresh
        const statusParam = searchParams.get('status');
        const filterParam = searchParams.get('filter');
        let backendStatus = statusParam || undefined;
        let s = searchParams.get('startDate') || undefined;
        let e = searchParams.get('endDate') || undefined;

        if (!backendStatus && filterParam) {
          if (filterParam === 'today') {
            const today = new Date().toISOString().split('T')[0];
            s = s || today;
            e = e || today;
          } else {
            backendStatus = mapStatusToBackend(filterParam);
          }
        }

        await getReservations(currentBusinessId, { status: backendStatus, startDate: s, endDate: e });
      }
    } catch (error) {
      console.error('Error inicializando datos:', error);
      setError(true);
      setLoading(false);
    }
  }, [token, getBusinessId, getReservations, showNotification]);



  //FUNCIÓN PARA EXTRAER LA FECHA - ARREGLAR EL PROBLEMA DE ZONA HORARIA
  const extractDate = (dateTimeString: string) => {
    try {
      // Si la fecha viene en formato YYYY-MM-DD, usarla directamente
      if (dateTimeString.includes('T')) {
        // Si tiene formato ISO, extraer solo la parte de fecha
        const datePart = dateTimeString.split('T')[0];
        const [year, month, day] = datePart.split('-');
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString('es-ES', {
          weekday: 'short',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
      }
      
      // Si la fecha viene en formato YYYY-MM-DD
      if (dateTimeString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateTimeString.split('-');
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString('es-ES', {
          weekday: 'short',
          year: 'numeric', 
          month: '2-digit',
          day: '2-digit'
        });
      }
      
      // Fallback para otros formatos
      const date = new Date(dateTimeString);
      
      //AGREGAR UN DÍA para compensar zona horaria si es necesario
      //Solo si parece que perdió un día
      const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
      
      return utcDate.toLocaleDateString('es-ES', {
        weekday: 'short',
        year: 'numeric',
        month: '2-digit', 
        day: '2-digit'
      });
      
    } catch (error) {
      console.error('Error procesando fecha:', dateTimeString, error);
      return dateTimeString || 'Fecha inválida';
    }
  };

  // FUNCIÓN PARA EXTRAER LA HORA
  const extractTime = (timeString: string) => {
    // Si ReservationTime es solo hora (ej: "14:30" o "14:30:00")
    if (timeString && timeString.includes(':')) {
      // Si ya es formato de hora, devolverlo directamente
      const timeParts = timeString.split(':');
      if (timeParts.length >= 2) {
        return `${timeParts[0]}:${timeParts[1]}`;
      }
    }
    
    // Si es una fecha completa, extraer la hora
    const date = new Date(timeString);
    if (!isNaN(date.getTime())) {
      return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    // Si nada funciona, devolver el string original o un placeholder
    return timeString || 'Hora no disponible';
  };

  // FUNCIÓN PARA OBTENER COLOR DEL ESTADO (SOLO 4 ESTADOS)
  const getStatusColor = (status: string = 'pending') => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'status-confirmed';
      case 'pending':
        return 'status-pending';
      case 'cancelled':
        return 'status-cancelled';
      case 'completed':
        return 'status-completed';
      default:
        return 'status-pending';
    }
  };

  // FUNCIÓN PARA OBTENER TEXTO DEL ESTADO (SOLO 4 ESTADOS)
  const getStatusText = (status: string = 'pending') => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'En Curso';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelada';
      case 'completed':
        return 'Completada';
      default:
        return 'Pendiente';
    }
  };

  // FUNCIÓN PARA CALCULAR ESTADÍSTICAS (SOLO 4 ESTADOS)
  const getStats = () => {
    const today = new Date().toDateString();
    return {
      total: reservations.length,
      today: reservations.filter(res => 
        new Date(res.ReservationDate).toDateString() === today
      ).length,
      pending: reservations.filter(res => res.status === 'pending').length,
      confirmed: reservations.filter(res => res.status === 'confirmed').length,
      cancelled: reservations.filter(res => res.status === 'cancelled').length,
      completed: reservations.filter(res => res.status === 'completed').length,
    };
  };

  const stats = getStats();

  // MOSTRAR LOADING MIENTRAS SE CARGA LA AUTENTICACIÓN O LOS DATOS INICIALES
  // Evitar mostrar la pantalla completa de carga cuando solo se están aplicando filtros (usar `listLoading`)
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
        <h3>🏢 No tienes un negocio registrado</h3>
        <p>Para ver las reservaciones, primero debes registrar tu negocio.</p>
        <div className="action-buttons">
          <button 
            onClick={() => window.location.href = '/registerBusiness'} 
            className="primary-button"
          >
            📝 Registrar mi negocio
          </button>
          <button onClick={initializeData} className="secondary-button">
            🔄 Verificar nuevamente
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
          🔄 Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="reservations-container">
      <div className="reservations-header">
        <h2>📋 Reservaciones del Negocio</h2>
        <div className="reservations-summary">
          <strong>Total: {stats.total} reservaciones</strong>
          <span> | Negocio ID: {businessId}</span>
          {/* MOSTRAR INFORMACIÓN DEL USUARIO AUTENTICADO */}
          {userData?.name && <span> | Usuario: {userData.name}</span>}
        </div>
      </div>

      {/* FILTROS ACTUALIZADOS - SOLO 4 ESTADOS */}
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
          <button 
            className={`filter-button ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => applyFilter('all')}
          >
            📋 Todas
          </button>
          <button 
            className={`filter-button ${activeFilter === 'today' ? 'active' : ''}`}
            onClick={() => applyFilter('today')}
          >
            📅 Hoy
          </button>
          <button 
            className={`filter-button ${activeFilter === 'pending' ? 'active' : ''}`}
            onClick={() => applyFilter('pending')}
          >
            ⏳ Pendientes
          </button>
          <button 
            className={`filter-button ${activeFilter === 'confirmed' ? 'active' : ''}`}
            onClick={() => applyFilter('confirmed')}
          >
            🔄 En Curso
          </button>
          <button 
            className={`filter-button ${activeFilter === 'completed' ? 'active' : ''}`}
            onClick={() => applyFilter('completed')}
          >
            🏁 Completadas
          </button>
          <button 
            className={`filter-button ${activeFilter === 'cancelled' ? 'active' : ''}`}
            onClick={() => applyFilter('cancelled')}
          >
            ❌ Canceladas
          </button>
        </div>
      </div>
      
      {/* TABLA CON ACCIONES ACTUALIZADAS - SOLO 4 ESTADOS */}
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
              {filteredReservations.map((reservation) => (
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
                        <small>📞 {reservation.user.phone}</small>
                      )}
                      {reservation.user?.email && (
                        <small>✉️ {reservation.user.email}</small>
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
                      {/* MENÚ DESPLEGABLE CON SOLO LOS 4 ESTADOS PERMITIDOS */}
                      <select 
                        value={reservation.status}
                        onChange={(e) => {
                          if (e.target.value !== reservation.status) {
                            console.log('Cambio de estado solicitado:', {
                              from: reservation.status,
                              to: e.target.value,
                              reservationId: reservation.id
                            });
                            updateReservationStatus(reservation.id, e.target.value);
                          }
                        }}
                        disabled={updatingReservation === reservation.id}
                        className="status-select"
                      >
                        <option value="pending">⏳ Pendiente</option>
                        <option value="confirmed">🔄 En Curso</option>
                        <option value="completed">🏁 Completada</option>
                        <option value="cancelled">❌ Cancelada</option>
                      </select>
                      
                      {/* INDICADOR DE LOADING */}
                      {updatingReservation === reservation.id && (
                        <span style={{marginLeft: '8px', color: '#666'}}>⏳ Actualizando...</span>
                      )}
                      
                      {/*  INFORMACIÓN ADICIONAL DEL ESTADO ACTUAL */}
                      <div style={{marginTop: '4px', fontSize: '11px', color: '#666'}}>
                        Estado actual: <span style={{fontWeight: 'bold', color: '#333'}}>{getStatusText(reservation.status)}</span>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="reservations-footer">
        <div className="reservations-stats">
          <span>Reservaciones hoy: {stats.today}</span>
          <span> | Pendientes: {stats.pending}</span>
          <span> | En Curso: {stats.confirmed}</span>
          <span> | Completadas: {stats.completed}</span>
          <span> | Canceladas: {stats.cancelled}</span>
        </div>
        <button onClick={initializeData} className="refresh-button">
          🔄 Actualizar lista
        </button>
      </div>
    </div>
  );
}