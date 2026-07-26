import React, { createContext, useContext, useState, useCallback,type ReactNode } from 'react';
import { ToastContainer, type ToastItem } from '../components/ui/ToastContainer';

interface ToastContextType {
  toast: {
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
    warning: (message: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<ToastItem[]>([]);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const add = useCallback((type: ToastItem['type'], title: string, message: string) => {
    const id = crypto.randomUUID();
    
    setItems((prev) => [...prev, { id, type, title, message }]);

    setTimeout(() => {
      remove(id);
    }, 4000);
  }, [remove]);

  const toast = {
    success: (message: string) => add('success', 'Успешно', message),
    error: (message: string) => add('error', 'Ошибка', message),
    info: (message: string) => add('info', 'Информация', message),
    warning: (message: string) => add('warning', 'Внимание', message),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Контейнер рендерится ОДИН раз поверх всего приложения */}
      <ToastContainer items={items} remove={remove} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast должен использоваться внутри ToastProvider');
  }
  return context;
};