// src/lib/api.ts
import axios from 'axios';

// The PHP Backend URL is typically accessed via action parameters in routes.php
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/UDS/api/v1/routes.php';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Standard API Wrapper for USMS backend (routes.php action-based)
 */
export const fetchApi = async <T = any>(endpoint: string, method: 'GET' | 'POST' = 'GET', data?: any): Promise<T> => {
  try {
    const response = await api({
      method,
      params: { action: endpoint }, // USMS routes.php uses 'action' or 'endpoint'
      data,
    });

    if (response.data.status === 'error') {
      throw new Error(response.data.message || 'API Error');
    }

    return response.data;
  } catch (error: any) {
    console.error(`API Fetch Error [${endpoint}]:`, error.message);
    throw error;
  }
};

/**
 * Direct PHP endpoint fetch with cookie-based session auth.
 * Used by member pages that call specific PHP files directly.
 */
export const apiFetch = async (url: string, options: RequestInit = {}): Promise<any> => {
  const base = process.env.NEXT_PUBLIC_PHP_BASE || 'http://localhost/UDS';
  const fullUrl = url.startsWith('http') ? url : `${base}${url}`;
  
  try {
    const res = await fetch(fullUrl, {
      credentials: 'include',
      headers: { 'Accept': 'application/json', ...(options.headers || {}) },
      ...options,
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`API Fetch HTTP Error [${res.status}]:`, errorText);
      throw new Error(`Server responded with ${res.status}: ${res.statusText}`);
    }

    const json = await res.json();
    if (json.status === 'error' || json.success === false) {
      throw new Error(json.message || 'API error');
    }
    return json;
  } catch (error: any) {
    console.error(`API Fetch Exception [${fullUrl}]:`, error.message);
    if (error.message === 'Failed to fetch') {
      throw new Error(`Failed to reach the server at ${fullUrl}. Please ensure your PHP backend (XAMPP/Apache) is running and accessible.`);
    }
    throw error;
  }
};

export default api;
