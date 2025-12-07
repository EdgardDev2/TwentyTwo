import { AdminSidebar } from "@/components/AdminSidebar";
import { DollarSign, Package, AlertTriangle, Users } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useOrders } from "@/hooks/useOrders";
import { useProducts } from "@/hooks/useProducts";
import { useMemo, useState } from "react";

const Dashboard = () => {
  const { isLoading: authLoading } = useAdminAuth();
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const { data: products, isLoading: productsLoading } = useProducts();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const stats = useMemo(() => {
    if (!orders || !products) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = orders.filter(order =>
      new Date(order.created_at) >= today
    );

    const todaySales = todayOrders.reduce((sum, order) => sum + Number(order.total), 0);
    const pendingOrders = orders.filter(order => order.status === "pending").length;
    const lowStockProducts = products.filter(product => product.stock < 10).length;

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      date.setHours(0, 0, 0, 0);
      return date;
    });

    const salesByDay = last7Days.map(date => {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      const daySales = orders
        .filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate >= date && orderDate < nextDay;
        })
        .reduce((sum, order) => sum + Number(order.total), 0);

      return daySales;
    });

    return {
      todaySales,
      todayOrdersCount: todayOrders.length,
      pendingOrders,
      lowStockProducts,
      salesByDay,
    };
  }, [orders, products]);

  if (authLoading || ordersLoading || productsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#141414]">
        <p className="text-white/60">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414] flex">

      {/* MOBILE SIDEBAR BUTTON */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 bg-white/10 text-white px-4 py-2 rounded-lg border border-white/10 backdrop-blur-md"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        Menu
      </button>

      {/* SIDEBAR */}
      <div
        className={`
          fixed lg:static top-0 left-0 h-full transition-transform duration-300 z-40 
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <AdminSidebar />
      </div>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8">

        {/* Title */}
        <div className="mt-12 lg:mt-0">
          <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-wide text-white">
            Dashboard
          </h1>
          <p className="text-white/60 text-sm sm:text-base">Visão geral do sistema</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">

          {/* CARD TEMPLATE */}
          {[
            {
              label: "Vendas Hoje",
              value: `R$ ${stats?.todaySales.toFixed(2)}`,
              sub: `Pedidos Hoje: ${stats?.todayOrdersCount}`,
              icon: DollarSign,
              badge: "HOJE",
              badgeColor: "bg-blue-500",
            },
            {
              label: "Pedidos Pendentes",
              value: stats?.pendingOrders,
              sub: null,
              icon: Package,
              badge: "AÇÃO",
              badgeColor: "bg-yellow-500",
            },
            {
              label: "Produtos em Baixa",
              value: stats?.lowStockProducts,
              sub: null,
              icon: AlertTriangle,
              badge: "ALERTA",
              badgeColor: "bg-red-500",
            },
            {
              label: "Visitantes Online",
              value: 23,
              sub: null,
              icon: Users,
              badge: "LIVE",
              badgeColor: "bg-green-500",
            },
          ].map((card, i) => {
            const Icon = card.icon;
            return (
              <div
                key={i}
                className="bg-[#141414] rounded-xl p-6 border border-[#2a2a2a] relative"
              >
                <span className={`absolute top-4 right-4 ${card.badgeColor} text-white px-3 py-1 rounded-full text-[10px]`}>
                  {card.badge}
                </span>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center">
                    <Icon size={24} className="text-white" />
                  </div>

                  <div>
                    <p className="text-white/60 text-sm">{card.label}</p>
                    <p className="text-white text-2xl sm:text-3xl">{card.value}</p>
                    {card.sub && (
                      <p className="text-white/60 text-xs mt-2">{card.sub}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Chart */}
        <div className="bg-[#141414] rounded-xl p-6 border border-[#2a2a2a]">
          <h2 className="text-white text-lg sm:text-xl mb-6">
            Vendas dos Últimos 7 Dias
          </h2>

          <div className="space-y-4">
            {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((day, index) => {
              const value = stats?.salesByDay[index] || 0;
              const maxValue = Math.max(...(stats?.salesByDay || [0]));

              return (
                <div key={day} className="flex items-center gap-3 sm:gap-4">
                  <span className="w-10 sm:w-12 text-xs sm:text-sm text-white/60">
                    {day}
                  </span>

                  <div className="flex-1 bg-[#1c1c1c] border border-[#2a2a2a] rounded-full h-6 sm:h-8 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-full flex items-center justify-end pr-2 sm:pr-3 transition-all duration-500"
                      style={{ width: maxValue > 0 ? `${(value / maxValue) * 100}%` : "0%" }}
                    >
                      {value > 0 && (
                        <span className="text-[10px] sm:text-xs font-medium text-white whitespace-nowrap">
                          R$ {value.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </main>
    </div>
  );
};

export default Dashboard;
