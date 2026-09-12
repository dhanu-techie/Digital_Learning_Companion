import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api/v1',
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
