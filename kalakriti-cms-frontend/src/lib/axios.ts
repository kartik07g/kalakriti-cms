import axios from 'axios';
import { config } from '@/config';

const api = axios.create({
  baseURL: config.backendUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;