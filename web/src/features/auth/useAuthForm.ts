import { useCallback, useMemo, useState } from 'react';
import { ApiError, AuthAPI, type RegisterRequest } from '../../api/auth.api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export type AuthMode = 'login' | 'register';
export interface AuthFormData { email: string; displayName: string; username: string; password: string; birthDay: string; birthMonth: string; birthYear: string; }
export type FormErrors = Partial<Record<keyof AuthFormData, string>>;

const MODE_STORAGE_KEY = 'mymessenger.auth-mode';
const emptyForm: AuthFormData = { email: '', displayName: '', username: '', password: '', birthDay: '', birthMonth: '', birthYear: '' };
const usernamePattern = /^[a-zA-Z0-9_.-]{3,32}$/;

function getSavedMode(): AuthMode {
  return window.localStorage.getItem(MODE_STORAGE_KEY) === 'register' ? 'register' : 'login';
}

function isAtLeastThirteen(year: string, month: string, day: string): boolean {
  const birthday = new Date(Number(year), Number(month) - 1, Number(day));
  if (birthday.getFullYear() !== Number(year) || birthday.getMonth() !== Number(month) - 1 || birthday.getDate() !== Number(day)) return false;
  const threshold = new Date();
  threshold.setFullYear(threshold.getFullYear() - 13);
  return birthday <= threshold;
}

function validate(data: AuthFormData, mode: AuthMode): FormErrors {
  const errors: FormErrors = {};
  if (!data.username.trim()) errors.username = 'Укажите имя пользователя или email.';
  else if (mode === 'register' && !usernamePattern.test(data.username.trim())) errors.username = 'От 3 до 32 символов: буквы, цифры, _, - или .';
  if (!data.password) errors.password = 'Укажите пароль.';
  else if (data.password.length < 8) errors.password = 'Пароль должен содержать не менее 8 символов.';
  if (mode === 'register') {
    if (!data.email.trim()) errors.email = 'Укажите email.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) errors.email = 'Введите корректный email.';
    if (data.displayName.trim().length > 32) errors.displayName = 'Отображаемое имя не длиннее 32 символов.';
    if (!data.birthDay || !data.birthMonth || !data.birthYear) errors.birthDay = 'Укажите полную дату рождения.';
    else if (!isAtLeastThirteen(data.birthYear, data.birthMonth, data.birthDay)) errors.birthDay = 'Регистрация доступна с 13 лет.';
  }
  return errors;
}

export function useAuthForm(onSuccess: () => void) {
  const [mode, setMode] = useState<AuthMode>(getSavedMode);
  const [formData, setFormData] = useState<AuthFormData>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const switchMode = useCallback((nextMode: AuthMode) => {
    window.localStorage.setItem(MODE_STORAGE_KEY, nextMode);
    setMode(nextMode);
    setErrors({});
    setFormData((current) => ({ ...emptyForm, username: current.username, email: nextMode === 'register' ? current.email : '' }));
  }, []);

  const handleChange = useCallback((field: keyof AuthFormData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }, []);

  const handleSubmit = useCallback(async (captchaToken?: string) => {
    if (isLoading) return;
    const nextErrors = validate(formData, mode);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) { toast.warning('Проверьте заполнение полей.'); return; }
    setIsLoading(true);
    try {
      const credentials = { username: formData.username.trim(), password: formData.password };
      const response = mode === 'login'
        ? await AuthAPI.login({ ...credentials, captchaToken })
        : await AuthAPI.register({ ...credentials, email: formData.email.trim(), displayName: formData.displayName.trim() || undefined, birthDate: `${formData.birthYear}-${formData.birthMonth.padStart(2, '0')}-${formData.birthDay.padStart(2, '0')}`, captchaToken } satisfies RegisterRequest);
      login(response.accessToken, response.refreshToken);
      window.localStorage.removeItem(MODE_STORAGE_KEY);
      toast.success(mode === 'login' ? 'С возвращением!' : 'Учётная запись создана.');
      onSuccess();
    } catch (error) {
      const message = error instanceof ApiError && error.status === 409 ? 'Пользователь с такими данными уже существует.' : error instanceof Error ? error.message : 'Не удалось выполнить запрос. Попробуйте ещё раз.';
      toast.error(message);
    } finally { setIsLoading(false); }
  }, [formData, isLoading, login, mode, onSuccess, toast]);

  const isFormValid = useMemo(() => Object.keys(validate(formData, mode)).length === 0, [formData, mode]);
  return { isRegister: mode === 'register', formData, errors, isLoading, isFormValid, switchMode, handleChange, handleSubmit };
}
