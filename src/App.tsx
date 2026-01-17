import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";
import { AuthProvider } from "@/hooks/useAuth";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { AdminNotificationProvider } from "@/contexts/AdminNotificationContext";
import NotificationContainer from "@/components/notifications/NotificationContainer";
import AdminNotificationContainer from "@/components/notifications/AdminNotificationContainer";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminProtectedRoute from "@/components/admin/AdminProtectedRoute";
import LandingPage from "./pages/LandingPage";
import AboutPage from "./pages/AboutPage";
import ServicesPage from "./pages/ServicesPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import ContactPage from "./pages/ContactPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import UserDashboard from "./pages/dashboard/UserDashboard";
import VehicleManager from "./pages/dashboard/VehicleManager";
import DiagnosticCenter from "./pages/dashboard/DiagnosticCenter";
import DiagnosticReport from "./pages/dashboard/DiagnosticReport";
import DiagnosticHistory from "./pages/dashboard/DiagnosticHistory";
import SolutionGuide from "./pages/dashboard/SolutionGuide";
import UserProfile from "./pages/dashboard/UserProfile";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminVehicles from "./pages/admin/AdminVehicles";
import AdminDiagnostics from "./pages/admin/AdminDiagnostics";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminReports from "./pages/admin/AdminReports";
import AdminLogs from "./pages/admin/AdminLogs";
import AdminSettings from "./pages/admin/AdminSettings";
import NotFound from "./pages/NotFound";
import TechnicalReport from "./pages/TechnicalReport";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
          <NotificationProvider>
            <AdminNotificationProvider>
              <NotificationContainer />
              <AdminNotificationContainer />
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/sobre" element={<AboutPage />} />
                <Route path="/servicos" element={<ServicesPage />} />
                <Route path="/como-funciona" element={<HowItWorksPage />} />
                <Route path="/contato" element={<ContactPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                
                {/* Protected User Routes */}
                <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
                <Route path="/dashboard/vehicles" element={<ProtectedRoute><VehicleManager /></ProtectedRoute>} />
                <Route path="/dashboard/diagnostics" element={<ProtectedRoute><DiagnosticCenter /></ProtectedRoute>} />
                <Route path="/dashboard/diagnostics/:id" element={<ProtectedRoute><DiagnosticReport /></ProtectedRoute>} />
                <Route path="/dashboard/solutions/:diagnosticItemId" element={<ProtectedRoute><SolutionGuide /></ProtectedRoute>} />
                <Route path="/dashboard/history" element={<ProtectedRoute><DiagnosticHistory /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<ProtectedRoute><AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute><AdminProtectedRoute><AdminUsers /></AdminProtectedRoute></ProtectedRoute>} />
                <Route path="/admin/vehicles" element={<ProtectedRoute><AdminProtectedRoute><AdminVehicles /></AdminProtectedRoute></ProtectedRoute>} />
                <Route path="/admin/diagnostics" element={<ProtectedRoute><AdminProtectedRoute><AdminDiagnostics /></AdminProtectedRoute></ProtectedRoute>} />
                <Route path="/admin/messages" element={<ProtectedRoute><AdminProtectedRoute><AdminMessages /></AdminProtectedRoute></ProtectedRoute>} />
                <Route path="/admin/reports" element={<ProtectedRoute><AdminProtectedRoute><AdminReports /></AdminProtectedRoute></ProtectedRoute>} />
                <Route path="/admin/logs" element={<ProtectedRoute><AdminProtectedRoute><AdminLogs /></AdminProtectedRoute></ProtectedRoute>} />
                <Route path="/admin/settings" element={<ProtectedRoute><AdminProtectedRoute><AdminSettings /></AdminProtectedRoute></ProtectedRoute>} />
                
                {/* Public Report Page */}
                <Route path="/relatorio-tecnico" element={<TechnicalReport />} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AdminNotificationProvider>
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
