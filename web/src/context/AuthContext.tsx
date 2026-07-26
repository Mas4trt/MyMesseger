import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

interface AuthContextValue { isAuthenticated: boolean; isReady: boolean; login: (accessToken: string, refreshToken?: string) => void; logout: () => void; }
const ACCESS_TOKEN_KEY = 'mymessenger.access-token';
const REFRESH_TOKEN_KEY = 'mymessenger.refresh-token';
const AuthContext = createContext<AuthContextValue | null>(null);

const readAccessToken = () => window.localStorage.getItem(ACCESS_TOKEN_KEY)?.trim() ?? '';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState(readAccessToken);
  const login = useCallback((nextAccessToken: string, refreshToken?: string) => {
    const token = nextAccessToken.trim();
    if (!token) throw new Error('Сервер не вернул токен авторизации.');
    window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
    if (refreshToken?.trim()) window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken.trim());
    setAccessToken(token);
  }, []);
  const logout = useCallback(() => {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    setAccessToken('');
  }, []);
  const value = useMemo<AuthContextValue>(() => ({ isAuthenticated: Boolean(accessToken), isReady: true, login, logout }), [accessToken, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider.');
  return context;
}
