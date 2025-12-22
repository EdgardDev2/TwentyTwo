import { AdminSidebar } from "@/components/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Package } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useProducts } from "@/hooks/useProducts";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const Estoque = () => {
  const { isLoading: authLoading } = useAdminAuth();
  const { data: products, isLoading: productsLoading } = useProducts();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [quantity, setQuantity] = useState<string>("10");
  const [mode, setMode] = useState<"add" | "set">("add");

  // 🔥 MOBILE SIDEBAR
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const mutation = useMutation<boolean, any, { id: string; newStock: number }>({
    mutationFn: async ({ id, newStock }) => {
      const { error } = await supabase.from("products").update({ stock: newStock }).eq("id", id);
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      if (selectedProduct) {
        toast({
          title: "Estoque atualizado",
          description: `${selectedProduct.name} atualizado com sucesso.`,
        });
      }
      setDialogOpen(false);
      setSelectedProduct(null);
    },
    onError: (err) => {
      toast({ title: "Erro ao repor", description: err?.message || "Tente novamente." });
    },
  });

  const lowStockProducts = products?.filter((p) => p.stock < 10);

  if (authLoading || productsLoading) {
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

      <main className="flex-1 p-8 text-white">

        <div className="mb-8 mt-12 lg:mt-0">
          <h1 className="text-3xl font-bold uppercase tracking-wide text-white">
            Gerenciar Estoque
          </h1>
          <p className="text-white/60">
            {lowStockProducts?.length || 0} produtos com estoque baixo
          </p>
        </div>

        {lowStockProducts?.length > 0 && (
          <div className="bg-[#141414] border border-red-500/40 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-red-500 mt-1" />
              <div>
                <h3 className="font-bold mb-2 uppercase tracking-wide">Alerta de Estoque Baixo</h3>
                <p className="text-sm text-white/60">
                  {lowStockProducts.length} produto(s) com menos de 10 unidades
                </p>
              </div>
            </div>
          </div>
        )}

        {/* LIST (mobile) + TABLE (desktop) */}
        <div className="mb-4">
          {/* Mobile: stacked cards */}
          <div className="space-y-4 md:hidden">
            {products?.map((product) => (
              <div
                key={product.id}
                className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={product.image_url || "/placeholder.svg"}
                    alt={product.name}
                    className="w-14 h-14 object-contain bg-[#1c1c1c] rounded"
                  />

                  <div className="min-w-0">
                    <p className="font-medium truncate">{product.name}</p>
                    <p className="text-xs text-white/60 truncate">#{product.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-xs text-white/60 truncate">{product.categories?.name || "Sem categoria"}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{product.stock}</span>
                    {product.stock < 10 && (
                      <Badge variant="destructive" className="text-xs">Baixo</Badge>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedProduct(product);
                      setQuantity("10");
                      setDialogOpen(true);
                    }}
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Repor
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table view */}
          <div className="hidden md:block overflow-x-auto bg-[#141414] border border-[#2a2a2a] rounded-lg">
            <table className="w-full">
              <thead className="border-b border-[#2a2a2a]">
                <tr>
                  <th className="text-left p-4 text-sm font-bold uppercase tracking-wide text-white/60">Produto</th>
                  <th className="text-left p-4 text-sm font-bold uppercase tracking-wide text-white/60">SKU</th>
                  <th className="text-left p-4 text-sm font-bold uppercase tracking-wide text-white/60">Categoria</th>
                  <th className="text-left p-4 text-sm font-bold uppercase tracking-wide text-white/60">Estoque Atual</th>
                  <th className="text-left p-4 text-sm font-bold uppercase tracking-wide text-white/60">Ações</th>
                </tr>
              </thead>
              <tbody>
                {products?.map((product) => (
                  <tr key={product.id} className="border-b border-[#2a2a2a] last:border-0">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image_url || "/placeholder.svg"}
                          alt={product.name}
                          className="w-12 h-12 object-contain bg-[#1c1c1c] rounded"
                        />
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-white/60">#{product.id.slice(0, 8).toUpperCase()}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-white/60">{product.id.slice(0, 8).toUpperCase()}</td>

                    <td className="p-4 text-white/60">
                      {product.categories?.name || "Sem categoria"}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{product.stock}</span>
                        {product.stock < 10 && (
                          <Badge variant="destructive" className="text-xs">Baixo Estoque</Badge>
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedProduct(product);
                          setQuantity("10");
                          setDialogOpen(true);
                        }}
                      >
                        <Package className="h-4 w-4 mr-2" />
                        Repor
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* DIALOG */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-lg w-[95%]">
            <DialogHeader>
              <DialogTitle>Repor estoque</DialogTitle>
              <DialogDescription>Informe a quantidade desejada.</DialogDescription>
            </DialogHeader>

            <div className="grid gap-2 py-4">
              <div>
                <Label>Produto</Label>
                <p className="text-sm text-white/60">{selectedProduct?.name}</p>
              </div>

              <div>
                <Label>Modo</Label>
                <RadioGroup value={mode} onValueChange={(v) => setMode(v as "add" | "set")}>
                  <div className="flex gap-4 items-center">
                    <label className="flex items-center gap-2">
                      <RadioGroupItem value="add" />
                      <span className="text-sm">Adicionar</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <RadioGroupItem value="set" />
                      <span className="text-sm">Definir</span>
                    </label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label>Quantidade</Label>
                <Input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>

              <Button
                onClick={() => {
                  if (!selectedProduct) return;
                  const qty = parseInt(quantity, 10);
                  if (qty <= 0 || Number.isNaN(qty)) {
                    toast({
                      title: "Quantidade inválida",
                      description: "Insira um número maior que zero.",
                    });
                    return;
                  }
                  const newStock = mode === "add"
                    ? (selectedProduct.stock || 0) + qty
                    : qty;

                  mutation.mutate({ id: selectedProduct.id, newStock });
                }}
              >
                {(mutation as any).isLoading ? "Repondo..." : "Confirmar"}
              </Button>
            </DialogFooter>
            <DialogClose />
          </DialogContent>
        </Dialog>

      </main>
    </div>
  );
};

export default Estoque;
