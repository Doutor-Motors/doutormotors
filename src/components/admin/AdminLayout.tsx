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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/images/logo.png";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: Users, label: "Usuários", path: "/admin/users" },
  { icon: Car, label: "Veículos", path: "/admin/vehicles" },
  { icon: Activity, label: "Diagnósticos", path: "/admin/diagnostics" },
  { icon: MessageSquare, label: "Mensagens", path: "/admin/messages" },
  { icon: BarChart3, label: "Relatórios", path: "/admin/reports" },
  { icon: FileText, label: "Logs", path: "/admin/logs" },
  { icon: Settings, label: "Configurações", path: "/admin/settings" },
];

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-gradient-to-b from-dm-space via-dm-blue-2 to-dm-space text-primary-foreground">
        <div className="p-6 border-b border-dm-cadet/20">
          <Link to="/admin" className="flex items-center gap-2">
            <img src={logo} alt="Doutor Motors" className="w-24" />
            <span className="font-chakra text-xs uppercase text-primary bg-primary/20 px-2 py-1 rounded">
              Admin
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-4">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-chakra uppercase text-sm transition-all ${
                      isActive
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
        <Link to="/admin" className="flex items-center gap-2">
          <img src={logo} alt="Doutor Motors" className="w-20" />
          <span className="font-chakra text-xs uppercase text-primary bg-primary/20 px-2 py-1 rounded">
            Admin
          </span>
        </Link>
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
              <ul className="space-y-1">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        onClick={() => setIsSidebarOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg font-chakra uppercase text-sm transition-colors ${
                          isActive
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
      <main className="flex-1 lg:ml-0 pt-16 lg:pt-0">
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
