import axios from 'axios';
import { baseUrl } from '../../apis/sharedApi';

// Create axios instance
export const apiClient = axios.create({
  baseURL: baseUrl,
  timeout: 30000,
  withCredentials: true, // Send cookies with requests
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor - cookies are sent automatically with withCredentials: true
apiClient.interceptors.request.use(
  (config) => {
    const fullUrl = `${config.baseURL}${config.url}`;
    return config;
  },
  (error) => {
    console.error('[apiClient] REQUEST ERROR:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Don't redirect if we're already on login page or if it's a quote API call
      // Let the component handle the 401 error gracefully
      const isLoginPage = window.location.pathname === '/login';
      const isQuoteApi = error.config?.url?.includes('/quote/');
      
      if (!isLoginPage && !isQuoteApi) {
        // Redirect to login for non-quote APIs
        window.location.href = '/login';
      }
    }

    // Handle quote limit exceeded
    if (error.response?.status === 400 || error.response?.status === 500) {
      const data = error.response.data;
      if (data?.code === 'MAX_SESSIONS_REACHED' || data?.errorCode === 'MAX_SESSIONS_REACHED') {
        console.warn('[apiClient] Quote limit reached, redirecting...');
        window.location.href = '/quote-limit-exceeded';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
