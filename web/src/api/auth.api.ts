import { CONFIG } from '../config/constants';

export interface LoginRequest { username: string; password: string; captchaToken?: string; }
export interface RegisterRequest extends LoginRequest { email: string; displayName?: string; birthDate: string; captchaToken?: string; }
export interface AuthResponse { accessToken: string; refreshToken?: string; }

export class ApiError extends Error {
  public readonly status: number;
  public readonly code?: string;

  constructor(message: string, status = 500, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

const REQUEST_TIMEOUT_MS = 10_000;

async function getErrorMessage(response: Response): Promise<string> {
  try {
    const body: unknown = response.headers.get('content-type')?.includes('application/json') ? await response.json() : await response.text();
    if (typeof body === 'string' && body.trim()) return body;
    if (body && typeof body === 'object') {
      const data = body as Record<string, unknown>;
      const message = data.message ?? data.error ?? data.detail;
      if (typeof message === 'string' && message.trim()) return message;
    }
  } catch { /* Fall back to a safe status message. */ }
  return `Ошибка сервера (${response.status}).`;
}

function normalizeAuthResponse(data: unknown): AuthResponse {
  if (!data || typeof data !== 'object') throw new ApiError('Сервер вернул некорректный ответ.', 502);
  const response = data as Record<string, unknown>;
  const accessToken = response.accessToken ?? response.access_token;
  const refreshToken = response.refreshToken ?? response.refresh_token;
  if (typeof accessToken !== 'string' || !accessToken.trim()) throw new ApiError('Сервер не вернул токен авторизации.', 502);
  return { accessToken, refreshToken: typeof refreshToken === 'string' ? refreshToken : undefined };
}

async function post<T>(endpoint: string, payload: unknown): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`${CONFIG.API_GATEWAY_URL}${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload), signal: controller.signal });
    if (!response.ok) throw new ApiError(await getErrorMessage(response), response.status);
    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof DOMException && error.name === 'AbortError') throw new ApiError('Сервер не ответил вовремя. Попробуйте ещё раз.', 408, 'TIMEOUT');
    throw new ApiError('Не удалось подключиться к серверу. Проверьте соединение.', 0, 'NETWORK_ERROR');
  } finally { window.clearTimeout(timeout); }
}

export const AuthAPI = {
  async login(data: LoginRequest) { return normalizeAuthResponse(await post<unknown>('/api/v1/auth/login', data)); },
  async register(data: RegisterRequest) { return normalizeAuthResponse(await post<unknown>('/api/v1/auth/register', data)); },
};
