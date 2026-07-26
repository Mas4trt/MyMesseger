import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { ToastContainer, type ToastItem } from '../components/ui/ToastContainer';

interface ToastContextValue { toast: { success: (message: string) => void; error: (message: string) => void; info: (message: string) => void; warning: (message: string) => void; }; }
const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const remove = useCallback((id: string) => setItems((current) => current.filter((item) => item.id !== id)), []);
  const add = useCallback((type: ToastItem['type'], title: string, message: string) => {
    const id = crypto.randomUUID();
    setItems((current) => [...current, { id, type, title, message }]);
    window.setTimeout(() => remove(id), 4_000);
  }, [remove]);
  const toast = useMemo(() => ({ success: (message: string) => add('success', 'Успешно', message), error: (message: string) => add('error', 'Ошибка', message), info: (message: string) => add('info', 'Информация', message), warning: (message: string) => add('warning', 'Внимание', message) }), [add]);
  return <ToastContext.Provider value={{ toast }}>{children}<ToastContainer items={items} remove={remove} /></ToastContext.Provider>;
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider.');
  return context;
}
