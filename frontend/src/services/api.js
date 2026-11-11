import axios from 'axios';
import { Platform } from 'react-native';

// In Web we use localhost:5000. On Android emulator we can use 10.0.2.2:5000
const BASE_URL = Platform.OS === 'android'
  ? 'http://10.0.2.2:5000/api'
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      localStorage.setItem('uniwork_token', token);
    }
  } else {
    delete api.defaults.headers.common['Authorization'];
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      localStorage.removeItem('uniwork_token');
    }
  }
};

// Auto-load token from localStorage on web startup
if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
  const saved = localStorage.getItem('uniwork_token');
  if (saved) {
    setAuthToken(saved);
  }
}

export default api;
