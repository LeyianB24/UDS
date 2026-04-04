// src/lib/api.ts
import axios from 'axios';

// The API is now handled internally via Next.js App Router (/api/*)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
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
      url: `/${endpoint}`,
      method,
      data,
    });

    if (response.data.status === 'error') {
      throw new Error(response.data.message || 'API Error');
    }

    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
        return error.response.data;
    }
    throw error;
  }
};

/**
 * Direct PHP endpoint fetch with cookie-based session auth.
 * Migration: Now uses axios for consistency in CORS/Credentials.
 */
export const apiFetch = async (url: string, options: any = {}): Promise<any> => {
  // Use Next.js native /api resolution instead of PHP
  const fullUrl = url.startsWith('http') ? url : url;
  
  try {
    // We use the direct URL with the same axios configuration
    const response = await axios({
      url: fullUrl,
      method: options.method || 'GET',
      data: options.body,
      withCredentials: true,
      headers: {
        'Accept': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });

    const json = response.data;
    if (json.status === 'error' || json.success === false) {
      throw new Error(json.message || 'API error');
    }
    return json;
  } catch (error: any) {
    const msg = error.response?.data?.message || error.message;
    console.error(`API Fetch Exception [${fullUrl}]:`, msg);
    
    if (msg === 'Network Error' || msg.includes('Failed to fetch')) {
        throw new Error(`Failed to reach the server at ${fullUrl}. Please ensure your PHP backend (XAMPP/Apache) is running and accessible.`);
    }
    throw new Error(msg);
  }
};

export default api;
