import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import UserDashboard from "./pages/dashboard/UserDashboard";
import VehicleManager from "./pages/dashboard/VehicleManager";
import DiagnosticCenter from "./pages/dashboard/DiagnosticCenter";
import DiagnosticReport from "./pages/dashboard/DiagnosticReport";
import DiagnosticHistory from "./pages/dashboard/DiagnosticHistory";
import SolutionGuide from "./pages/dashboard/SolutionGuide";
import UserProfile from "./pages/dashboard/UserProfile";
import NotFound from "./pages/NotFound";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/vehicles" element={
              <ProtectedRoute>
                <VehicleManager />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/diagnostics" element={
              <ProtectedRoute>
                <DiagnosticCenter />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/diagnostics/:id" element={
              <ProtectedRoute>
                <DiagnosticReport />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/solutions/:diagnosticItemId" element={
              <ProtectedRoute>
                <SolutionGuide />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/history" element={
              <ProtectedRoute>
                <DiagnosticHistory />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
