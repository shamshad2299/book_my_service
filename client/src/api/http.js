import axios from 'axios';
import { sessionStore } from '../utils/session.js';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000
});

api.interceptors.request.use((config) => {
  const token = sessionStore.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStore.clear();
    }
    return Promise.reject(error);
  }
);
