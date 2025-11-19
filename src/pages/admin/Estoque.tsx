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

  const mutation = useMutation<boolean, any, { id: string; newStock: number }>(
    {
      mutationFn: async ({ id, newStock }: { id: string; newStock: number }) => {
        const { error } = await supabase.from("products").update({ stock: newStock }).eq("id", id);
        if (error) throw error;
        return true;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["products"] });
        if (selectedProduct) {
          toast({ title: "Estoque atualizado", description: `${selectedProduct.name} atualizado com sucesso.` });
        }
        setDialogOpen(false);
        setSelectedProduct(null);
      },
      onError: (err: any) => {
        toast({ title: "Erro ao repor", description: err?.message || "Tente novamente." });
      },
    }
  );

  const lowStockProducts = products?.filter(product => product.stock < 10);

  if (authLoading || productsLoading) {
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
          <h1 className="text-3xl font-bold uppercase tracking-wide text-muted-foreground">Gerenciar Estoque</h1>
          <p className="text-muted-foreground">{lowStockProducts?.length || 0} produtos com estoque baixo</p>
        </div>

        {lowStockProducts && lowStockProducts.length > 0 && (
          <div className="bg-card border border-destructive rounded-lg p-6 mb-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold mb-2 uppercase tracking-wide">Alerta de Estoque Baixo</h3>
                <p className="text-sm text-muted-foreground">
                  {lowStockProducts.length} produto(s) com menos de 10 unidades em estoque
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-border">
              <tr>
                <th className="text-left p-4 text-sm font-bold uppercase tracking-wide text-muted-foreground">Produto</th>
                <th className="text-left p-4 text-sm font-bold uppercase tracking-wide text-muted-foreground">SKU</th>
                <th className="text-left p-4 text-sm font-bold uppercase tracking-wide text-muted-foreground">Categoria</th>
                <th className="text-left p-4 text-sm font-bold uppercase tracking-wide text-muted-foreground">Estoque Atual</th>
                <th className="text-left p-4 text-sm font-bold uppercase tracking-wide text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {products?.map((product) => (
                <tr key={product.id} className="border-b border-border last:border-0">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={product.image_url || "/placeholder.svg"} 
                        alt={product.name} 
                        className="w-12 h-12 object-contain bg-muted rounded" 
                      />
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          #{product.id.slice(0, 8).toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {product.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td className="p-4 text-muted-foreground">
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
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Repor estoque</DialogTitle>
              <DialogDescription>Informe a quantidade que deseja adicionar ao estoque.</DialogDescription>
            </DialogHeader>

            <div className="grid gap-2 py-4">
              <div>
                <Label>Produto</Label>
                <p className="text-sm text-muted-foreground">{selectedProduct?.name}</p>
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
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button
                onClick={() => {
                  if (!selectedProduct) return;
                  const qty = parseInt(quantity, 10);
                  if (Number.isNaN(qty) || qty <= 0) {
                    toast({ title: "Quantidade inválida", description: "Insira um número maior que zero." });
                    return;
                  }
                  const newStock = mode === "add" ? (selectedProduct.stock || 0) + qty : qty;
                  mutation.mutate({ id: selectedProduct.id, newStock });
                }}
                disabled={(mutation as any).isLoading || (mutation as any).isRunning}
              >
                {( (mutation as any).isLoading || (mutation as any).isRunning) ? "Repondo..." : "Confirmar"}
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
