import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Car,
  Activity,
  History,
  User,
  LogOut,
  Menu,
  X,
  ChevronRight,
  GraduationCap,
  Headphones,
  ArrowLeft,
  Shield,
  Database,
  Settings2,
  Crown,
  Code2,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useAdminNotification } from "@/contexts/AdminNotificationContext";
import { useUserTier } from "@/hooks/useUserTier";
import { ProBadge, AdminBadge } from "@/components/subscription/UserBadge";
import logo from "@/assets/images/logo-new-car.png";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  isPro?: boolean;
  showBadge?: boolean;
}

const baseMenuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Car, label: "Veículos", path: "/dashboard/vehicles" },
  { icon: Activity, label: "Diagnósticos", path: "/dashboard/diagnostics" },
  { icon: History, label: "Histórico", path: "/dashboard/history" },
  { icon: Database, label: "Gravação de Dados", path: "/dashboard/data-recording", isPro: true },
  { icon: Code2, label: "Funções Coding", path: "/dashboard/coding", isPro: true },
  { icon: Settings2, label: "Config. OBD", path: "/dashboard/obd-settings", isPro: true },
  { icon: GraduationCap, label: "Estude seu Carro", path: "/estude-seu-carro" },
  { icon: User, label: "Perfil", path: "/profile" },
  { icon: Headphones, label: "Suporte", path: "/dashboard/support" },
];

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const { unreadCount } = useAdminNotification();
  const { isPro, canAccess, isProFeature } = useUserTier();

  // Build menu items dynamically based on admin status
  const menuItems: MenuItem[] = isAdmin 
    ? [...baseMenuItems, { icon: Shield, label: "Admin", path: "/admin", showBadge: true }]
    : baseMenuItems;

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/dashboard");
    }
  };

  const isDashboardHome = location.pathname === "/dashboard";

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-dm-space text-primary-foreground">
        <div className="p-6 border-b border-dm-cadet/20">
          {/* Logo igual ao Footer */}
          <div className="flex flex-col items-start cursor-default">
            <img src={logo} alt="Doutor Motors" className="h-[100px] w-auto object-contain -ml-1" />
            <span className="font-chakra text-primary-foreground text-lg font-bold tracking-wider -mt-[29px] ml-1">DOUTOR MOTORS</span>
          </div>
        </div>

        <nav className="flex-1 px-4">
          <ul className="space-y-2">
          {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              const showNotificationBadge = item.showBadge && unreadCount > 0;
              const isProItem = item.isPro;
              const isLocked = isProItem && !isPro && !isAdmin;
              
              return (
                <li key={item.path}>
                  <Link
                    to={isLocked ? "/dashboard/upgrade" : item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-chakra uppercase text-sm transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : isLocked
                        ? "text-muted-foreground/60 hover:bg-muted/20 hover:text-muted-foreground"
                        : "text-dm-cadet hover:bg-dm-blue-2 hover:text-primary-foreground"
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${isLocked ? "opacity-50" : ""}`} />
                    <span className={`flex-1 ${isLocked ? "opacity-60" : ""}`}>{item.label}</span>
                    {isLocked && (
                      <ProBadge locked size="sm" />
                    )}
                    {isProItem && isPro && !isAdmin && (
                      <ProBadge locked={false} size="sm" />
                    )}
                    {showNotificationBadge && (
                      <span className="ml-auto bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 mt-auto">
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
          {!isDashboardHome && (
            <button
              onClick={handleBack}
              className="text-primary-foreground p-2 hover:bg-dm-blue-2 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          {/* Logo igual ao Footer */}
          <div className="flex flex-col items-start cursor-default">
            <img src={logo} alt="Doutor Motors" className="h-[70px] w-auto object-contain -ml-1" />
            <span className="font-chakra text-primary-foreground text-sm font-bold tracking-wider -mt-[20px] ml-1">DOUTOR MOTORS</span>
          </div>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-primary-foreground p-2"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setIsSidebarOpen(false)}>
          <aside 
            className="absolute left-0 top-0 bottom-0 w-64 bg-dm-space text-primary-foreground pt-16"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="flex-1 px-4 py-4">
              <ul className="space-y-2">
              {menuItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  const showNotificationBadge = item.showBadge && unreadCount > 0;
                  const isProItem = item.isPro;
                  const isLocked = isProItem && !isPro && !isAdmin;
                  
                  return (
                    <li key={item.path}>
                      <Link
                        to={isLocked ? "/dashboard/upgrade" : item.path}
                        onClick={() => setIsSidebarOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg font-chakra uppercase text-sm transition-colors ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : isLocked
                            ? "text-muted-foreground/60 hover:bg-muted/20 hover:text-muted-foreground"
                            : "text-dm-cadet hover:bg-dm-blue-2 hover:text-primary-foreground"
                        }`}
                      >
                        <item.icon className={`w-5 h-5 ${isLocked ? "opacity-50" : ""}`} />
                        <span className={`flex-1 ${isLocked ? "opacity-60" : ""}`}>{item.label}</span>
                        {isLocked && (
                          <ProBadge locked size="sm" />
                        )}
                        {isProItem && isPro && !isAdmin && (
                          <ProBadge locked={false} size="sm" />
                        )}
                        {showNotificationBadge ? (
                          <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold animate-pulse">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        ) : !isLocked && !isProItem && (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="p-4">
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
      <main className="flex-1 lg:ml-0 pt-16 lg:pt-0">
        <div className="p-4 md:p-6 lg:p-8">
          {/* Botão Voltar Desktop - dentro do conteúdo */}
          {!isDashboardHome && (
            <Button
              variant="ghost"
              onClick={handleBack}
              className="mb-4 gap-2 font-chakra uppercase text-sm text-foreground/80 hover:text-primary hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all duration-200 hidden lg:flex"
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

export default DashboardLayout;
