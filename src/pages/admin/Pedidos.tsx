import { AdminSidebar } from "@/components/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useOrders } from "@/hooks/useOrders";
import { useProducts } from "@/hooks/useProducts";
import { useOrderActions } from "@/hooks/useOrderActions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { OrderDetailsModal } from "@/components/OrderDetailsModal";

const Pedidos = () => {
  const { isLoading: authLoading } = useAdminAuth();
  const { data: orders, isLoading: ordersLoading, refetch } = useOrders();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { data: products } = useProducts();
  const { createOrder } = useOrderActions();
  const { toast } = useToast();

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});
  const [isCreating, setIsCreating] = useState(false);

  const filteredOrders = orders?.filter(order => 
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
      case "pending": return "secondary";
      case "processing": return "default";
      case "shipped": return "default";
      case "delivered": return "outline";
      case "cancelled": return "destructive";
      default: return "secondary";
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
    <div className="flex min-h-screen">
      <AdminSidebar />
      
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold uppercase tracking-wide text-muted-foreground">Gerenciar Pedidos</h1>
          <p className="text-muted-foreground">{orders?.length || 0} pedidos no total</p>
        </div>

        <div className="flex gap-2 mb-6">
          <Button onClick={() => setIsCreateOpen(true)}>Novo Pedido</Button>
          <Button 
            variant={statusFilter === "all" ? "default" : "outline"}
            onClick={() => setStatusFilter("all")}
          >
            Todos
          </Button>
          <Button 
            variant={statusFilter === "pending" ? "default" : "outline"}
            onClick={() => setStatusFilter("pending")}
          >
            Pendente
          </Button>
          <Button 
            variant={statusFilter === "processing" ? "default" : "outline"}
            onClick={() => setStatusFilter("processing")}
          >
            Processando
          </Button>
          <Button 
            variant={statusFilter === "shipped" ? "default" : "outline"}
            onClick={() => setStatusFilter("shipped")}
          >
            Enviado
          </Button>
          <Button 
            variant={statusFilter === "delivered" ? "default" : "outline"}
            onClick={() => setStatusFilter("delivered")}
          >
            Entregue
          </Button>
          <Button 
            variant={statusFilter === "cancelled" ? "default" : "outline"}
            onClick={() => setStatusFilter("cancelled")}
          >
            Cancelado
          </Button>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Pedido</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-sm text-black">Nome</p>
                  <input className="input w-full text-black" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                </div>
                <div>
                  <p className="text-sm text-black">Email</p>
                  <input className="input w-full text-black" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
                </div>
                <div>
                  <p className="text-sm text-black">Telefone</p>
                  <input className="input w-full text-black" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Produtos</h3>
                <div className="space-y-2">
                  {products?.map((p: any) => (
                    <div key={p.id} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div>
                        <p className="font-medium text-black">{p.name}</p>
                        <p className="text-sm text-black">R$ {Number(p.price).toFixed(2)} — Estoque: {p.stock}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          className="input w-24 text-black"
                          value={itemQuantities[p.id] || 0}
                          onChange={(e) => setItemQuantities((s) => ({ ...s, [p.id]: Number(e.target.value) }))}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Fechar</Button>
                <Button
                  onClick={async () => {
                    try {
                      const items = (products || [])
                        .map((p: any) => ({
                          product_id: p.id,
                          product_name: p.name,
                          price: p.price,
                          quantity: Number(itemQuantities[p.id] || 0),
                        }))
                        .filter((it: any) => it.quantity > 0);

                      if (items.length === 0) {
                        toast({ title: "Nenhum item", description: "Adicione ao menos um produto ao pedido.", variant: "destructive" });
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

                        toast({ title: "Pedido criado", description: "O pedido foi registrado com sucesso." });
                        setIsCreateOpen(false);
                        setCustomerName("");
                        setCustomerEmail("");
                        setCustomerPhone("");
                        setItemQuantities({});
                        refetch();
                      } finally {
                        setIsCreating(false);
                      }
                    } catch (err: any) {
                      toast({ title: "Erro", description: err?.message || "Erro ao criar pedido.", variant: "destructive" });
                    }
                  }}
                >
                  {isCreating ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Criando...</>) : "Criar Pedido"}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-border">
              <tr>
                <th className="text-left p-4 text-sm font-bold uppercase tracking-wide text-muted-foreground">ID</th>
                <th className="text-left p-4 text-sm font-bold uppercase tracking-wide text-muted-foreground">Cliente</th>
                <th className="text-left p-4 text-sm font-bold uppercase tracking-wide text-muted-foreground">Data</th>
                <th className="text-left p-4 text-sm font-bold uppercase tracking-wide text-muted-foreground">Valor</th>
                <th className="text-left p-4 text-sm font-bold uppercase tracking-wide text-muted-foreground">Status</th>
                <th className="text-left p-4 text-sm font-bold uppercase tracking-wide text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders?.map((order) => (
                <tr key={order.id} className="border-b border-border last:border-0">
                  <td className="p-4 font-medium">{order.id.slice(0, 8).toUpperCase()}</td>
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{order.customer_name}</p>
                      <p className="text-sm text-muted-foreground">{order.customer_email}</p>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {new Date(order.created_at).toLocaleString("pt-BR")}
                  </td>
                  <td className="p-4 font-medium">R$ {Number(order.total).toFixed(2)}</td>
                  <td className="p-4">
                    <Badge variant={getStatusVariant(order.status)}>
                      {getStatusLabel(order.status)}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewOrder(order)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <OrderDetailsModal
          order={selectedOrder}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          onStatusUpdate={refetch}
        />
      </main>
    </div>
  );
};

export default Pedidos;
