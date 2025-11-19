import { AdminSidebar } from "@/components/AdminSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Package, AlertTriangle, Users } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useOrders } from "@/hooks/useOrders";
import { useProducts } from "@/hooks/useProducts";
import { useMemo } from "react";

const Dashboard = () => {
  const { isLoading: authLoading } = useAdminAuth();
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const { data: products, isLoading: productsLoading } = useProducts();

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
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold uppercase tracking-wide text-muted-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do sistema</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 border-border">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="h-8 w-8 text-muted-foreground" />
              <Badge>Hoje</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Vendas Hoje</p>
            <p className="text-3xl font-bold">R$ {stats ? stats.todaySales.toFixed(2) : "0,00"}</p>
            <p className="text-sm text-muted-foreground mt-2">Pedidos Hoje: {stats?.todayOrdersCount ?? 0}</p>
          </Card>

          <Card className="p-6 border-border">
            <div className="flex items-center justify-between mb-4">
              <Package className="h-8 w-8 text-muted-foreground" />
              <Badge variant="secondary">Ação</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Pedidos Pendentes</p>
            <p className="text-3xl font-bold">{stats?.pendingOrders || 0}</p>
          </Card>

          <Card className="p-6 border-border">
            <div className="flex items-center justify-between mb-4">
              <AlertTriangle className="h-8 w-8 text-muted-foreground" />
              <Badge variant="destructive">Alerta</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Produtos em Baixa</p>
            <p className="text-3xl font-bold">{stats?.lowStockProducts || 0}</p>
          </Card>

          <Card className="p-6 border-border">
            <div className="flex items-center justify-between mb-4">
              <Users className="h-8 w-8 text-muted-foreground" />
              <Badge variant="outline">Live</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Visitantes Online</p>
            <p className="text-3xl font-bold">23</p>
          </Card>
        </div>

        <Card className="p-6 border-border">
          <h2 className="text-xl font-bold mb-6 uppercase tracking-wide text-muted-foreground">
            Vendas dos Últimos 7 Dias
          </h2>
          <div className="space-y-4">
            {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((day, index) => {
              const value = stats?.salesByDay[index] || 0;
              const maxValue = Math.max(...(stats?.salesByDay || [0]));
              return (
                <div key={day} className="flex items-center gap-4">
                  <span className="w-12 text-sm text-muted-foreground">{day}</span>
                  <div className="flex-1 bg-muted rounded-full h-8 overflow-hidden">
                    <div
                      className="bg-primary h-full flex items-center justify-end pr-3"
                      style={{ width: maxValue > 0 ? `${(value / maxValue) * 100}%` : "0%" }}
                    >
                      {value > 0 && (
                        <span className="text-xs font-medium text-primary-foreground">
                          R$ {value.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
