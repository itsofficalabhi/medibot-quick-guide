
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Pages
import HomePage from "./pages/HomePage";
import DoctorsPage from "./pages/DoctorsPage";
import DoctorProfilePage from "./pages/DoctorProfilePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import UserDashboardPage from "./pages/UserDashboardPage";
import DoctorDashboardPage from "./pages/DoctorDashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import ChatPage from "./pages/ChatPage";
import NotFound from "./pages/NotFound";
import VideoCallPage from "./pages/VideoCallPage";

// Layout
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./hooks/useAuth";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<HomePage />} />
                <Route path="doctors" element={<DoctorsPage />} />
                <Route path="doctors/:id" element={<DoctorProfilePage />} />
                <Route path="chat" element={<ChatPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="forgot-password" element={<ForgotPasswordPage />} />
                
                {/* Protected routes with role-based redirection */}
                <Route path="dashboard" element={
                  <ProtectedRoute>
                    {/* This will automatically redirect based on user role */}
                    <Navigate to="/user-dashboard" replace />
                  </ProtectedRoute>
                } />

                <Route path="user-dashboard" element={
                  <ProtectedRoute requiredRole="user">
                    <UserDashboardPage />
                  </ProtectedRoute>
                } />

                <Route path="doctor-dashboard" element={
                  <ProtectedRoute requiredRole="doctor">
                    <DoctorDashboardPage />
                  </ProtectedRoute>
                } />
                
                <Route path="admin-dashboard" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboardPage />
                  </ProtectedRoute>
                } />
                
                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Route>

              {/* Standalone routes */}
              <Route path="video-call" element={
                <ProtectedRoute>
                  <VideoCallPage />
                </ProtectedRoute>
              } />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
