import axios from 'axios';

/** Single API client. Auth header + refresh handling are added with the Identity module. */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true,
});