import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Car,
  Activity,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Shield,
  BarChart3,
  FileText,
  MessageSquare,
  Bell,
  Ticket,
  ArrowLeft,
  CreditCard,
  BookOpen,
  FileSearch,
  Map,
  KeyRound,
  Database,
  Mail,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useAdminNotification } from "@/contexts/AdminNotificationContext";
import logo from "@/assets/images/logo-new-car.png";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: Users, label: "Usuários", path: "/admin/users" },
  { icon: CreditCard, label: "Assinaturas", path: "/admin/subscriptions" },
  { icon: DollarSign, label: "Pagamentos PIX", path: "/admin/payments" },
  { icon: KeyRound, label: "Permissões", path: "/admin/permissions" },
  { icon: Car, label: "Veículos", path: "/admin/vehicles" },
  { icon: Activity, label: "Diagnósticos", path: "/admin/diagnostics" },
  { icon: Ticket, label: "Tickets", path: "/admin/tickets" },
  { icon: MessageSquare, label: "Mensagens", path: "/admin/messages" },
  { icon: Mail, label: "Analytics Contato", path: "/admin/contact-analytics" },
  { icon: Bell, label: "Alertas", path: "/admin/alerts" },
  { icon: BarChart3, label: "Relatórios", path: "/admin/reports" },
  { icon: FileText, label: "Logs", path: "/admin/logs" },
  { icon: Database, label: "CarCare Data", path: "/admin/carcare-data" },
  { icon: BookOpen, label: "Guia Monetização", path: "/admin/monetization-guide" },
  { icon: FileSearch, label: "Varredura Sistema", path: "/admin/system-scan" },
  { icon: Map, label: "Guia Implementação", path: "/admin/implementation-guide" },
  { icon: Settings, label: "Configurações", path: "/admin/settings" },
];

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { unreadCount, clearAllNotifications } = useAdminNotification();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/admin");
    }
  };

  const isAdminHome = location.pathname === "/admin";

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-gradient-to-b from-dm-space via-dm-blue-2 to-dm-space text-primary-foreground">
        <div className="p-6 border-b border-dm-cadet/20">
          <div className="flex items-center justify-between">
            {/* Logo sem link de redirecionamento */}
            <div className="flex flex-col items-center cursor-default">
              <img src={logo} alt="Doutor Motors" className="h-[80px] w-auto object-contain" />
              <div className="flex items-center gap-2 -mt-[22px]">
                <span className="font-chakra text-primary-foreground text-xs font-bold tracking-wider">DOUTOR MOTORS</span>
                <span className="font-chakra text-[8px] uppercase text-primary bg-primary/20 px-1.5 py-0.5 rounded">
                  Admin
                </span>
              </div>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={clearAllNotifications}
                className="relative p-2 rounded-full hover:bg-dm-blue-2/50 transition-colors"
                title="Limpar notificações"
              >
                <Bell className="w-5 h-5 text-dm-cadet" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              </button>
            )}
          </div>
        </div>

        <nav className="flex-1 px-4 py-4">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-chakra uppercase text-sm transition-all ${isActive
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "text-dm-cadet hover:bg-dm-blue-2/50 hover:text-primary-foreground"
                      }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-dm-cadet/20">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 px-4 py-2 text-dm-cadet hover:text-primary-foreground transition-colors font-chakra uppercase text-xs mb-2"
          >
            <Shield className="w-4 h-4" />
            <span>Painel Usuário</span>
          </Link>
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start gap-3 text-dm-cadet hover:text-primary-foreground hover:bg-dm-blue-2 font-chakra uppercase text-sm"
          >
            <LogOut className="w-5 h-5" />
            <span>Sair</span>
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-dm-space z-40 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Botão Voltar Mobile */}
          {!isAdminHome && (
            <button
              onClick={handleBack}
              className="text-primary-foreground p-2 hover:bg-dm-blue-2 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          {/* Logo sem link de redirecionamento */}
          <div className="flex flex-col items-center cursor-default">
            <img src={logo} alt="Doutor Motors" className="h-[60px] w-[90px] object-contain" />
            <div className="flex items-center gap-1 -mt-[25px]">
              <span className="font-chakra text-primary-foreground text-[8px] font-bold tracking-wider">DOUTOR MOTORS</span>
              <span className="font-chakra text-[6px] uppercase text-primary bg-primary/20 px-1 py-0.5 rounded">
                Admin
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={clearAllNotifications}
              className="relative p-2 rounded-full hover:bg-dm-blue-2/50 transition-colors"
            >
              <Bell className="w-5 h-5 text-dm-cadet" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            </button>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-primary-foreground p-2"
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-50" onClick={() => setIsSidebarOpen(false)}>
          <aside
            className="absolute left-0 top-0 bottom-0 w-64 bg-dm-space text-primary-foreground pt-32"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="flex-1 px-4 py-4">
              <ul className="space-y-1">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        onClick={() => setIsSidebarOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg font-chakra uppercase text-sm transition-colors ${isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-dm-cadet hover:bg-dm-blue-2 hover:text-primary-foreground"
                          }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="p-4 border-t border-dm-cadet/20">
              <Link
                to="/dashboard"
                onClick={() => setIsSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-dm-cadet hover:text-primary-foreground transition-colors font-chakra uppercase text-xs mb-2"
              >
                <Shield className="w-4 h-4" />
                <span>Painel Usuário</span>
              </Link>
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="w-full justify-start gap-3 text-dm-cadet hover:text-primary-foreground hover:bg-dm-blue-2 font-chakra uppercase text-sm"
              >
                <LogOut className="w-5 h-5" />
                <span>Sair</span>
              </Button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-0 pt-32 lg:pt-6">
        <div className="p-4 md:p-6 lg:p-8">
          {/* Botão Voltar Desktop - dentro do conteúdo */}
          {!isAdminHome && (
            <Button
              variant="ghost"
              onClick={handleBack}
              className="mb-4 gap-2 font-chakra uppercase text-sm text-muted-foreground hover:text-foreground hidden lg:flex"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </Button>
          )}
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
