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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/images/logo-new.png";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Car, label: "Veículos", path: "/dashboard/vehicles" },
  { icon: Activity, label: "Diagnósticos", path: "/dashboard/diagnostics" },
  { icon: History, label: "Histórico", path: "/dashboard/history" },
  { icon: User, label: "Perfil", path: "/profile" },
];

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
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
      <aside className="hidden lg:flex flex-col w-64 bg-dm-space text-primary-foreground">
        <div className="p-6 border-b border-dm-cadet/20">
          <Link to="/" className="flex flex-col items-center">
            <img src={logo} alt="Doutor Motors" className="h-[100px] w-[150px] object-contain" />
            <span className="font-chakra text-primary-foreground text-xs font-bold tracking-wider -mt-[45px]">DOUTOR MOTORS</span>
          </Link>
        </div>

        <nav className="flex-1 px-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-chakra uppercase text-sm transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-dm-cadet hover:bg-dm-blue-2 hover:text-primary-foreground"
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
        <Link to="/" className="flex flex-col items-center">
          <img src={logo} alt="Doutor Motors" className="h-[70px] w-[100px] object-contain" />
          <span className="font-chakra text-primary-foreground text-[10px] font-bold tracking-wider -mt-[30px]">DOUTOR MOTORS</span>
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
              <ul className="space-y-2">
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
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
