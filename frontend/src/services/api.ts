import axios, { AxiosResponse, AxiosError } from 'axios';
import { APIResponse, AuthTokens } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
class TokenManager {
  private static readonly ACCESS_TOKEN_KEY = 'access_token';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';

  static getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static setTokens(tokens: AuthTokens): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
  }

  static clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }
}

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = TokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = TokenManager.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(`${API_BASE_URL}/api/auth/refresh-token`, {
          refreshToken,
        });

        const tokens = response.data.data.tokens;
        TokenManager.setTokens(tokens);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        TokenManager.clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Generic API response handler
const handleResponse = <T>(response: AxiosResponse<APIResponse<T>>): T => {
  if (response.data.success) {
    return response.data.data as T;
  }
  throw new Error(response.data.error || 'API request failed');
};

// API service class
export class ApiService {
  // Auth endpoints
  static async login(email: string, password: string) {
    const response = await api.post('/auth/login', { email, password });
    const result = handleResponse(response);
    TokenManager.setTokens(result.tokens);
    return result;
  }

  static async register(email: string, password: string, name: string) {
    const response = await api.post('/auth/register', { email, password, name });
    const result = handleResponse(response);
    TokenManager.setTokens(result.tokens);
    return result;
  }

  static async logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      TokenManager.clearTokens();
    }
  }

  static async getProfile() {
    const response = await api.get('/auth/profile');
    return handleResponse(response);
  }

  static async forgotPassword(email: string) {
    const response = await api.post('/auth/forgot-password', { email });
    return handleResponse(response);
  }

  static async resetPassword(token: string, password: string) {
    const response = await api.post('/auth/reset-password', { token, password });
    return handleResponse(response);
  }

  // Chat endpoints
  static async getConversations(clientId: string, params?: { page?: number; limit?: number; search?: string }) {
    const response = await api.get(`/chat/conversations/${clientId}`, { params });
    return handleResponse(response);
  }

  static async getConversation(id: string, clientId?: string) {
    const response = await api.get(`/chat/conversations/${id}/details`, {
      params: clientId ? { clientId } : {},
    });
    return handleResponse(response);
  }

  static async createConversation(data: { type: string; subject?: string; clientId: string }) {
    const response = await api.post('/chat/conversations', data);
    return handleResponse(response);
  }

  static async sendMessage(conversationId: string, data: any) {
    const response = await api.post(`/chat/conversations/${conversationId}/messages`, data);
    return handleResponse(response);
  }

  static async getMessages(conversationId: string, params?: { page?: number; limit?: number }) {
    const response = await api.get(`/chat/conversations/${conversationId}/messages`, { params });
    return handleResponse(response);
  }

  static async updateConversationStatus(id: string, status: string, clientId?: string) {
    const response = await api.patch(`/chat/conversations/${id}/status`, 
      { status }, 
      { params: clientId ? { clientId } : {} }
    );
    return handleResponse(response);
  }

  static async getConversationStats(clientId: string) {
    const response = await api.get(`/chat/stats/${clientId}`);
    return handleResponse(response);
  }

  // AI Agent endpoints
  static async chatWithAI(data: { message: string; clientId: string; conversationHistory?: string[] }) {
    const response = await api.post('/agent/chat', data);
    return handleResponse(response);
  }

  static async addKnowledge(clientId: string, data: any) {
    const response = await api.post(`/agent/knowledge/${clientId}`, data);
    return handleResponse(response);
  }

  static async getKnowledge(clientId: string, params?: { page?: number; limit?: number }) {
    const response = await api.get(`/agent/knowledge/${clientId}`, { params });
    return handleResponse(response);
  }

  static async updateKnowledge(clientId: string, id: string, data: any) {
    const response = await api.put(`/agent/knowledge/${clientId}/${id}`, data);
    return handleResponse(response);
  }

  static async deleteKnowledge(clientId: string, id: string) {
    const response = await api.delete(`/agent/knowledge/${clientId}/${id}`);
    return handleResponse(response);
  }

  static async analyzeConversation(messages: string[]) {
    const response = await api.post('/agent/analyze', { messages });
    return handleResponse(response);
  }
}

export { TokenManager };
export default api;