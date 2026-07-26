import { CONFIG } from '../config/constants';

// Типы для TypeScript (обычно генерируются из .proto файлов)
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest extends LoginRequest {
  email: string;
  captchaToken: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export const AuthAPI = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${CONFIG.API_GATEWAY_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Ошибка авторизации');
    }
    return response.json();
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await fetch(`${CONFIG.API_GATEWAY_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Ошибка регистрации');
    }
    return response.json();
  }
};