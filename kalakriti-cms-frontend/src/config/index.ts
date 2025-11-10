export const config = {
  backendUrl: import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
};

// Log the backend URL for debugging
console.log('Backend URL:', config.backendUrl);