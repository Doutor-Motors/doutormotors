import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import UserDashboard from "./pages/dashboard/UserDashboard";
import VehicleManager from "./pages/dashboard/VehicleManager";
import DiagnosticCenter from "./pages/dashboard/DiagnosticCenter";
import DiagnosticHistory from "./pages/dashboard/DiagnosticHistory";
import UserProfile from "./pages/dashboard/UserProfile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/dashboard/vehicles" element={<VehicleManager />} />
          <Route path="/dashboard/diagnostics" element={<DiagnosticCenter />} />
          <Route path="/dashboard/diagnostics/:id" element={<DiagnosticCenter />} />
          <Route path="/dashboard/history" element={<DiagnosticHistory />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
