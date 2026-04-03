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
 * Standard API Wrapper for USMS backend
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

export default api;
