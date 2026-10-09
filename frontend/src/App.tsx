import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './store/AuthContext';
import { PointsProvider } from './store/PointsContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import RankingPage from './pages/RankingPage';
import SubmitPointsPage from './pages/SubmitPointsPage';
import RecordsPage from './pages/RecordsPage';
import AdminPage from './pages/AdminPage';
import RosterPage from './pages/RosterPage';
import ProfilePage from './pages/ProfilePage';
import type { ReactNode } from 'react';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 className="text-[32px] mb-4" style={{ fontFamily: "'Noto Serif SC', serif", fontWeight: 600 }}>誠壹</h1>
          <p style={{ color: 'var(--color-muted)', fontSize: 14 }}>加载中...</p>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/ranking" element={<RankingPage />} />
        <Route path="/submit" element={<SubmitPointsPage />} />
        <Route path="/records" element={<RecordsPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/roster" element={<RosterPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PointsProvider>
          <AppRoutes />
        </PointsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
