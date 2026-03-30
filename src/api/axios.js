import axios from 'axios';

const api = axios.create({
  baseURL: 'https://videotube-backend-lhdc.onrender.com/api/v1',
  withCredentials: true,
});

export default api;
