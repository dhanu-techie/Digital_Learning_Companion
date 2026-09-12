import axios from 'axios';

function resolveApiBaseUrl() {
  const configured = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/$/, '');
  if (!configured) return '/api/v1';
  return configured.endsWith('/api/v1') ? configured : `${configured}/api/v1`;
}

const apiClient = axios.create({
  baseURL: resolveApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Inject JWT bearer token if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor handling offline states gracefully
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!navigator.onLine || error.code === 'ERR_NETWORK') {
      console.warn('[API CLIENT] Network unavailable. Serving from offline store.');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
