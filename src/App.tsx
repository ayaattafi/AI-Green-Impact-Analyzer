import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import { FullPageSkeleton } from '@/components/shared/Skeletons';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

import { AppLayout } from '@/layouts/AppLayout';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';

// Every page is route-split - none of recharts/jspdf/html2canvas/framer's
// page-specific usage ships in the initial bundle, only what a visited
// route actually needs.
const LandingPage = lazy(() => import('@/pages/LandingPage').then((m) => ({ default: m.LandingPage })));
const AboutPage = lazy(() => import('@/pages/AboutPage').then((m) => ({ default: m.AboutPage })));

const LoginPage = lazy(() => import('@/pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })));

const DashboardPage = lazy(() => import('@/pages/app/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const CalculatorPage = lazy(() => import('@/pages/app/calculators/CalculatorPage').then((m) => ({ default: m.CalculatorPage })));
const AiAnalyticsPage = lazy(() => import('@/pages/app/AiAnalyticsPage').then((m) => ({ default: m.AiAnalyticsPage })));
const BiDashboardPage = lazy(() => import('@/pages/app/BiDashboardPage').then((m) => ({ default: m.BiDashboardPage })));
const ReportsPage = lazy(() => import('@/pages/app/ReportsPage').then((m) => ({ default: m.ReportsPage })));
const HistoryPage = lazy(() => import('@/pages/app/HistoryPage').then((m) => ({ default: m.HistoryPage })));
const ProfilePage = lazy(() => import('@/pages/app/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const SettingsPage = lazy(() => import('@/pages/app/SettingsPage').then((m) => ({ default: m.SettingsPage })));

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<FullPageSkeleton />}>
              <Routes>
                {/* Public */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/about" element={<AboutPage />} />

                {/* Auth */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                {/* Protected app */}
                <Route
                  path="/app"
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="calculators/:category" element={<CalculatorPage />} />
                  <Route path="ai-analytics" element={<AiAnalyticsPage />} />
                  <Route path="bi" element={<BiDashboardPage />} />
                  <Route path="reports" element={<ReportsPage />} />
                  <Route path="history" element={<HistoryPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
            <Toaster richColors position="top-right" />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
