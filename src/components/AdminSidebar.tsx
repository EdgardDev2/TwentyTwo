import { Home, Package, ShoppingCart, BarChart3, LogOut, Image } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import logo from "@/assets/logo.png";

export const AdminSidebar = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: Home },
    { path: "/admin/produtos", label: "Produtos", icon: Package },
    { path: "/admin/pedidos", label: "Pedidos", icon: ShoppingCart },
    { path: "/admin/estoque", label: "Estoque", icon: BarChart3 },
    { path: "/admin/CarouselImages", label: "Carrossel", icon: Image },
  ];

  return (
    <aside className="w-60 bg-sidebar border-r border-sidebar-border min-h-screen p-4 flex flex-col">
      <div className="mb-8 px-2">
        <img src={logo} alt="Twenty Two" className="h-12 mb-2" />
        <p className="text-xs text-muted-foreground uppercase tracking-wide">Twenty Two Admin</p>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                isActive(item.path)
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <Link
        to="/admin/login"
        className="flex items-center gap-3 px-3 py-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
      >
        <LogOut className="h-5 w-5" />
        <span className="text-sm font-medium">Sair</span>
      </Link>
    </aside>
  );
};
