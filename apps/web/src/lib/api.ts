import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      try {
        const { data } = await axios.post(
          `${apiClient.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        localStorage.setItem('accessToken', data.data.accessToken);
        error.config.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return apiClient(error.config);
      } catch {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
