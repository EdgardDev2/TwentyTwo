import { AdminSidebar } from "@/components/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Loader2 } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useOrders } from "@/hooks/useOrders";
import { useProducts } from "@/hooks/useProducts";
import { useOrderActions } from "@/hooks/useOrderActions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { OrderDetailsModal } from "@/components/OrderDetailsModal";

const Pedidos = () => {
  const { isLoading: authLoading } = useAdminAuth();
  const { data: orders, isLoading: ordersLoading, refetch } = useOrders();
  const { data: products } = useProducts();
  const { createOrder } = useOrderActions();
  const { toast } = useToast();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});
  const [isCreating, setIsCreating] = useState(false);

  const filteredOrders = orders?.filter((order) =>
    statusFilter === "all" ? true : order.status === statusFilter
  );

  if (authLoading || ordersLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary";
      case "processing":
        return "default";
      case "shipped":
        return "default";
      case "delivered":
        return "outline";
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Pendente",
      processing: "Processando",
      shipped: "Enviado",
      delivered: "Entregue",
      cancelled: "Cancelado",
    };
    return labels[status] || status;
  };

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen flex bg-[#141414]">

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

      {/* MAIN */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8">

        <div className="mt-12 lg:mt-0">
          <h1 className="text-3xl font-bold uppercase tracking-wide text-white">
            Gerenciar Pedidos
          </h1>
          <p className="text-white/60">{orders?.length || 0} pedidos no total</p>
        </div>

        {/* FILTER BUTTONS */}
        <div className="flex flex-wrap gap-2 mb-6 mt-4">
          <Button onClick={() => setIsCreateOpen(true)}>Novo Pedido</Button>

          {[
            { key: "all", label: "Todos" },
            { key: "pending", label: "Pendente" },
            { key: "processing", label: "Processando" },
            { key: "shipped", label: "Enviado" },
            { key: "delivered", label: "Entregue" },
            { key: "cancelled", label: "Cancelado" },
          ].map((b) => (
            <Button
              key={b.key}
              variant={statusFilter === b.key ? "default" : "outline"}
              onClick={() => setStatusFilter(b.key)}
            >
              {b.label}
            </Button>
          ))}
        </div>

        {/* TABLE */}
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-[#2a2a2a]">
              <tr>
                <th className="p-4 text-left text-white/60 text-xs">ID</th>
                <th className="p-4 text-left text-white/60 text-xs">Cliente</th>
                <th className="p-4 text-left text-white/60 text-xs">Data</th>
                <th className="p-4 text-left text-white/60 text-xs">Valor</th>
                <th className="p-4 text-left text-white/60 text-xs">Status</th>
                <th className="p-4 text-left text-white/60 text-xs">Ações</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders?.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-[#2a2a2a] last:border-0 text-white"
                >
                  <td className="p-4">{order.id.slice(0, 8).toUpperCase()}</td>
                  <td className="p-4">
                    <p className="font-medium">{order.customer_name}</p>
                    <p className="text-white/60 text-sm">{order.customer_email}</p>
                  </td>
                  <td className="p-4 text-white/60">
                    {new Date(order.created_at).toLocaleString("pt-BR")}
                  </td>
                  <td className="p-4 font-medium">
                    R$ {Number(order.total).toFixed(2)}
                  </td>
                  <td className="p-4">
                    <Badge variant={getStatusVariant(order.status)}>
                      {getStatusLabel(order.status)}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Button variant="ghost" size="sm" onClick={() => handleViewOrder(order)}>
                      <Eye className="h-4 w-4 text-white" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>

        {/* ORDER DETAILS MODAL */}
        <OrderDetailsModal
          order={selectedOrder}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          onStatusUpdate={refetch}
        />

        {/* CREATE ORDER MODAL */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-[#1b1b1b] text-white">
            <DialogHeader>
              <DialogTitle>Novo Pedido</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <p className="text-sm">Nome</p>
                  <input
                    className="input w-full bg-white/10 border border-white/20 rounded px-2 py-1"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>

                <div>
                  <p className="text-sm">Email</p>
                  <input
                    className="input w-full bg-white/10 border border-white/20 rounded px-2 py-1"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                  />
                </div>

                <div>
                  <p className="text-sm">Telefone</p>
                  <input
                    className="input w-full bg-white/10 border border-white/20 rounded px-2 py-1"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-white">Produtos</h3>
                <div className="space-y-2">
                  {products?.map((p: any) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-2 bg-white/5 border border-white/10 rounded"
                    >
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-sm text-white/60">
                          R$ {Number(p.price).toFixed(2)} — Estoque: {p.stock}
                        </p>
                      </div>

                      <input
                        type="number"
                        min={0}
                        className="input w-20 bg-white/10 border border-white/20 rounded px-2 py-1"
                        value={itemQuantities[p.id] || 0}
                        onChange={(e) =>
                          setItemQuantities((s) => ({
                            ...s,
                            [p.id]: Number(e.target.value),
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                className="text-white border-white/20"
              >
                Fechar
              </Button>

              <Button
                onClick={async () => {
                  const items = (products || [])
                    .map((p: any) => ({
                      product_id: p.id,
                      product_name: p.name,
                      price: p.price,
                      quantity: Number(itemQuantities[p.id] || 0),
                    }))
                    .filter((it) => it.quantity > 0);

                  if (items.length === 0) {
                    toast({
                      title: "Nenhum item",
                      description: "Adicione ao menos um produto.",
                      variant: "destructive",
                    });
                    return;
                  }

                  setIsCreating(true);

                  try {
                    await (createOrder as any).mutateAsync({
                      customer_name: customerName || "Cliente",
                      customer_email: customerEmail || null,
                      customer_phone: customerPhone || null,
                      items,
                    });

                    toast({
                      title: "Pedido criado",
                      description: "O pedido foi registrado.",
                    });

                    setIsCreateOpen(false);
                    setCustomerName("");
                    setCustomerEmail("");
                    setCustomerPhone("");
                    setItemQuantities({});
                    refetch();
                  } finally {
                    setIsCreating(false);
                  }
                }}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  "Criar Pedido"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Pedidos;
