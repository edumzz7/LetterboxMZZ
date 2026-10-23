import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.data) {
      const data = error.response.data as { message?: string };
      const message =
        typeof data.message === 'string'
          ? data.message
          : Array.isArray(data.message)
            ? (data.message as string[]).join(', ')
            : error.message;
      return Promise.reject(new Error(message));
    }
    // No response at all (timeout, offline, server unreachable): axios only says "Network Error".
    if (axios.isAxiosError(error) && !error.response) {
      return Promise.reject(
        new Error('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.'),
      );
    }
    return Promise.reject(error);
  },
);

export default apiClient;
