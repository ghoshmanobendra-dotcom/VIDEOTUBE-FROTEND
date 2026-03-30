import axios from 'axios';

const api = axios.create({
  baseURL: 'https://videotube-backend-lhdc.onrender.com',
  withCredentials: true,
});

export default api;
