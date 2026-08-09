import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
});

// Read token from Zustand in-memory state instead of localStorage on every request.
// localStorage.getItem is a synchronous read; the store is a plain JS object access.
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// GET request deduplication: if the same URL is in-flight, return the same promise.
// Prevents duplicate API calls when the 4-second poller fires while a manual action
// is already awaiting a response to the same endpoint.
const inFlightRequests = new Map<string, Promise<any>>();

const originalGet = api.get.bind(api);
api.get = function dedupedGet(url: string, config?: any) {
  // Include signal in the cache key so AbortController-cancelled requests don't block new ones
  const cacheKey = url;

  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey)!;
  }

  const promise = originalGet(url, config).finally(() => {
    inFlightRequests.delete(cacheKey);
  });

  inFlightRequests.set(cacheKey, promise);
  return promise;
} as typeof api.get;

export default api;
