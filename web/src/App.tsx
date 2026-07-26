import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AuthPage } from './features/auth/AuthPage';
import { CONFIG } from './config/constants';

// Временная заглушка для чата (создай файл src/features/messenger/ChatPage.tsx)
const ChatPage = () => <div style={{color: 'white', padding: '20px'}}>Добро пожаловать в мессенджер!</div>;

// Компонент-обертка для защиты приватных роутов (куда нельзя без логина)
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to={CONFIG.ROUTES.LOGIN} replace />;
  }
  return <>{children}</>;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route 
        path={CONFIG.ROUTES.LOGIN} 
        element={isAuthenticated ? <Navigate to={CONFIG.ROUTES.CHAT} replace /> : <AuthPage />} 
      />
      <Route 
        path={CONFIG.ROUTES.CHAT} 
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<Navigate to={CONFIG.ROUTES.LOGIN} replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider> 
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
export default App;