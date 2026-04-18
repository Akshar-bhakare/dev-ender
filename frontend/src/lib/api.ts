import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    // Check for auth token first, fallback to signup session token
    const token = localStorage.getItem('syncup_token') || localStorage.getItem('signupSessionToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Simple response interceptor for debugging
api.interceptors.response.use(
  (response) => response.data, // Automatically unwrap the Axios Response 'data' wrapper if desired, but we'll return response for now. Actually let's return response to standard axiog usages.
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);
