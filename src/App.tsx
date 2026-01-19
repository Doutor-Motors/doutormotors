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
import InstallBanner from "@/components/pwa/InstallBanner";
import PWAUpdateNotification from "@/components/pwa/PWAUpdateNotification";
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
import AdminAlerts from "./pages/admin/AdminAlerts";
import NotFound from "./pages/NotFound";
import TechnicalReport from "./pages/TechnicalReport";
import StudyCarPage from "./pages/StudyCarPage";
import HowDiagnosticWorksPage from "./pages/HowDiagnosticWorksPage";
import HowSystemWorksPage from "./pages/HowSystemWorksPage";
import UseFromAnywherePage from "./pages/UseFromAnywherePage";
import TermsPage from "./pages/TermsPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import FAQPage from "./pages/FAQPage";
import SupportCenter from "./pages/dashboard/SupportCenter";
import TicketDetail from "./pages/dashboard/TicketDetail";
import AdminTickets from "./pages/admin/AdminTickets";
import NativeAppGuide from "./pages/NativeAppGuide";
import InstallAppPage from "./pages/InstallAppPage";
import UpgradePage from "./pages/dashboard/UpgradePage";
import DataRecordingPage from "./pages/dashboard/DataRecordingPage";
import OBDSettingsPage from "./pages/dashboard/OBDSettingsPage";
import CodingFunctionsPage from "./pages/dashboard/CodingFunctionsPage";
import CodingHistoryPage from "./pages/dashboard/CodingHistoryPage";
import PermissionsDiagnostic from "./pages/dashboard/PermissionsDiagnostic";
import AdminSubscriptions from "./pages/admin/AdminSubscriptions";
import AdminPermissions from "./pages/admin/AdminPermissions";
import MonetizationGuidePage from "./pages/admin/MonetizationGuidePage";
import SystemScanReportPage from "./pages/admin/SystemScanReportPage";
import ImplementationGuidePage from "./pages/admin/ImplementationGuidePage";
import AdminCarCareData from "./pages/admin/AdminCarCareData";

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
              <InstallBanner />
              <PWAUpdateNotification />
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
                <Route path="/termos" element={<TermsPage />} />
                <Route path="/privacidade" element={<PrivacyPolicyPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/app-nativo" element={<NativeAppGuide />} />
                <Route path="/como-diagnosticar" element={<HowDiagnosticWorksPage />} />
                <Route path="/como-funciona-sistema" element={<HowSystemWorksPage />} />
                <Route path="/use-de-qualquer-lugar" element={<UseFromAnywherePage />} />
                <Route path="/instalar" element={<InstallAppPage />} />
                
                {/* Protected User Routes */}
                <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
                <Route path="/dashboard/vehicles" element={<ProtectedRoute><VehicleManager /></ProtectedRoute>} />
                <Route path="/dashboard/diagnostics" element={<ProtectedRoute><DiagnosticCenter /></ProtectedRoute>} />
                <Route path="/dashboard/diagnostics/:id" element={<ProtectedRoute><DiagnosticReport /></ProtectedRoute>} />
                <Route path="/dashboard/solutions/:diagnosticItemId" element={<ProtectedRoute><SolutionGuide /></ProtectedRoute>} />
                <Route path="/dashboard/history" element={<ProtectedRoute><DiagnosticHistory /></ProtectedRoute>} />
                <Route path="/dashboard/support" element={<ProtectedRoute><SupportCenter /></ProtectedRoute>} />
                <Route path="/dashboard/support/:id" element={<ProtectedRoute><TicketDetail /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
                <Route path="/dashboard/upgrade" element={<ProtectedRoute><UpgradePage /></ProtectedRoute>} />
                <Route path="/dashboard/data-recording" element={<ProtectedRoute><DataRecordingPage /></ProtectedRoute>} />
                <Route path="/dashboard/obd-settings" element={<ProtectedRoute><OBDSettingsPage /></ProtectedRoute>} />
                <Route path="/dashboard/coding" element={<ProtectedRoute><CodingFunctionsPage /></ProtectedRoute>} />
                <Route path="/dashboard/coding/history" element={<ProtectedRoute><CodingHistoryPage /></ProtectedRoute>} />
                <Route path="/dashboard/permissions" element={<ProtectedRoute><PermissionsDiagnostic /></ProtectedRoute>} />
                <Route path="/estude-seu-carro" element={<ProtectedRoute><StudyCarPage /></ProtectedRoute>} />
                <Route path="/relatorio-tecnico" element={<ProtectedRoute><TechnicalReport /></ProtectedRoute>} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<ProtectedRoute><AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute></ProtectedRoute>} />
                <Route path="/admin/tickets" element={<ProtectedRoute><AdminProtectedRoute><AdminTickets /></AdminProtectedRoute></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute><AdminProtectedRoute><AdminUsers /></AdminProtectedRoute></ProtectedRoute>} />
                <Route path="/admin/vehicles" element={<ProtectedRoute><AdminProtectedRoute><AdminVehicles /></AdminProtectedRoute></ProtectedRoute>} />
                <Route path="/admin/diagnostics" element={<ProtectedRoute><AdminProtectedRoute><AdminDiagnostics /></AdminProtectedRoute></ProtectedRoute>} />
                <Route path="/admin/messages" element={<ProtectedRoute><AdminProtectedRoute><AdminMessages /></AdminProtectedRoute></ProtectedRoute>} />
                <Route path="/admin/reports" element={<ProtectedRoute><AdminProtectedRoute><AdminReports /></AdminProtectedRoute></ProtectedRoute>} />
                <Route path="/admin/logs" element={<ProtectedRoute><AdminProtectedRoute><AdminLogs /></AdminProtectedRoute></ProtectedRoute>} />
                <Route path="/admin/settings" element={<ProtectedRoute><AdminProtectedRoute><AdminSettings /></AdminProtectedRoute></ProtectedRoute>} />
                <Route path="/admin/alerts" element={<ProtectedRoute><AdminProtectedRoute><AdminAlerts /></AdminProtectedRoute></ProtectedRoute>} />
                <Route path="/admin/subscriptions" element={<ProtectedRoute><AdminProtectedRoute><AdminSubscriptions /></AdminProtectedRoute></ProtectedRoute>} />
                <Route path="/admin/permissions" element={<ProtectedRoute><AdminProtectedRoute><AdminPermissions /></AdminProtectedRoute></ProtectedRoute>} />
                <Route path="/admin/monetization-guide" element={<ProtectedRoute><AdminProtectedRoute><MonetizationGuidePage /></AdminProtectedRoute></ProtectedRoute>} />
                <Route path="/admin/system-scan" element={<ProtectedRoute><AdminProtectedRoute><SystemScanReportPage /></AdminProtectedRoute></ProtectedRoute>} />
                <Route path="/admin/implementation-guide" element={<ProtectedRoute><AdminProtectedRoute><ImplementationGuidePage /></AdminProtectedRoute></ProtectedRoute>} />
                <Route path="/admin/carcare-data" element={<ProtectedRoute><AdminProtectedRoute><AdminCarCareData /></AdminProtectedRoute></ProtectedRoute>} />
                
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
