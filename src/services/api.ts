import { getStoredAuthToken } from './authSession';

// Cliente HTTP base — centraliza todas las llamadas a la API
// - URL base configurable por entorno (VITE_API_URL)
// - Auth automática (Bearer token desde localStorage)
// - Manejo de errores y 401 automático
// - Soporte para AbortSignal (cancelación de requests)

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

// Lee el token de localStorage y devuelve los headers de auth
function getAuthHeaders(includeContentType: boolean = true): Record<string, string> {
  const headers: Record<string, string> = {};
  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }
  const token = getStoredAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Serializa un objeto de parámetros a query string
function buildQueryParams(params: Record<string, string | number | boolean | undefined | null>): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  }
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

// Maneja la respuesta HTTP — parsea errores y maneja 401 automáticamente
async function handleResponse(response: Response): Promise<unknown> {
  if (!response.ok) {
    // 401: token expirado o inválido — limpiar y redirigir al login
    if (response.status === 401) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    // Parsear el body del error
    let body: Record<string, unknown>;
    try {
      body = await response.json();
    } catch {
      body = { message: await response.text() || `HTTP ${response.status}` };
    }
    // Adjuntar el status code para que los componentes puedan inspeccionarlo
    body._status = response.status;
    throw body;
  }

  // 204 No Content
  if (response.status === 204) return null;

  return response.json();
}

// Opciones comunes para los métodos HTTP
interface RequestOptions {
  signal?: AbortSignal;
}

// GET con query params opcionales
async function get<T>(
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined | null>,
  options?: RequestOptions
): Promise<T> {
  const url = `${BASE_URL}${endpoint}${params ? buildQueryParams(params) : ''}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(false), // GET no lleva Content-Type
    signal: options?.signal,
  });
  return handleResponse(response) as Promise<T>;
}

// POST con body JSON
async function post<T>(
  endpoint: string,
  body?: unknown,
  options?: RequestOptions & { auth?: boolean }
): Promise<T> {
  const headers = options?.auth === false
    ? { 'Content-Type': 'application/json' }
    : getAuthHeaders(true);

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers,
    body: body ? JSON.stringify(body) : undefined,
    signal: options?.signal,
  });
  return handleResponse(response) as Promise<T>;
}

// PUT con body JSON
async function put<T>(
  endpoint: string,
  body?: unknown,
  options?: RequestOptions
): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'PUT',
    headers: getAuthHeaders(true),
    body: body ? JSON.stringify(body) : undefined,
    signal: options?.signal,
  });
  return handleResponse(response) as Promise<T>;
}

// PATCH con body JSON
async function patch<T>(
  endpoint: string,
  body?: unknown,
  options?: RequestOptions
): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'PATCH',
    headers: getAuthHeaders(true),
    body: body ? JSON.stringify(body) : undefined,
    signal: options?.signal,
  });
  return handleResponse(response) as Promise<T>;
}

// DELETE
async function del<T>(
  endpoint: string,
  options?: RequestOptions
): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'DELETE',
    headers: getAuthHeaders(false), // DELETE no lleva Content-Type
    signal: options?.signal,
  });
  return handleResponse(response) as Promise<T>;
}

// Upload de FormData (multipart/form-data) — omite Content-Type para que el navegador ponga el boundary
async function upload<T>(
  endpoint: string,
  formData: FormData,
  method: 'POST' | 'PATCH' | 'PUT' = 'POST',
  options?: RequestOptions
): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: getAuthHeaders(false), // Sin Content-Type — el navegador lo setea
    body: formData,
    signal: options?.signal,
  });
  return handleResponse(response) as Promise<T>;
}

// API pública
export const api = {
  get,
  post,
  put,
  patch,
  del,
  upload,
};
