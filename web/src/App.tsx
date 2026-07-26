import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AuthPage } from './features/auth/AuthPage';
import { CONFIG } from './config/constants';

// Ленивая загрузка для оптимизации размера начального бандла
const ChatPage = React.lazy(() => import('./features/messenger/ChatPage'));

const ScreenLoader: React.FC = () => (
  <div style={{ display: 'grid', placeItems: 'center', height: '100vh', background: '#1e1f22' }}>
    <span className="auth-spinner" style={{ width: 32, height: 32 }} />
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isReady } = useAuth();

  if (!isReady) {
    return <ScreenLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to={CONFIG.ROUTES.LOGIN} replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated, isReady } = useAuth();

  if (!isReady) {
    return <ScreenLoader />;
  }

  return (
    <Suspense fallback={<ScreenLoader />}>
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
    </Suspense>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;