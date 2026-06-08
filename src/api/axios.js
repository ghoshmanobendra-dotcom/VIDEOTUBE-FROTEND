import axios from 'axios';

const api = axios.create({
  baseURL: 'https://videotube-backend-lhdc.onrender.com/api/v1',
  withCredentials: true,
});

// Suppress 401 console noise — unauthenticated requests are expected for guest users.
// All other errors are re-thrown so individual callers can handle them.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status !== 401) {
      // Only log genuinely unexpected errors
      return Promise.reject(error);
    }
    // For 401s, reject silently (callers that care can check error.response.status)
    return Promise.reject(error);
  }
);

export default api;
