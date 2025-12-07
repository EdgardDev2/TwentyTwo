import { AdminSidebar } from "@/components/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useProducts } from "@/hooks/useProducts";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const Produtos: React.FC = () => {
  const { isLoading: authLoading } = useAdminAuth();
  const { data: products, isLoading: productsLoading } = useProducts();

  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);

  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  const [form, setForm] = useState({
    name: "",
    price: "0.00",
    stock: "0",
    image_url: "",
    description: "",
    category_id: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categorySubmitting, setCategorySubmitting] = useState(false);

  // MOBILE SIDEBAR
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from("categories").select("id,name").order("name");
      setCategories(data || []);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }

    if (editingProduct && editingProduct.image_url) {
      setPreviewUrl(editingProduct.image_url);
    } else if (!editingProduct) {
      setPreviewUrl(null);
    }
  }, [selectedFile, editingProduct]);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    setCategorySubmitting(true);

    const slug = newCategoryName.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");

    const { data, error } = await supabase
      .from("categories")
      .insert({ name: newCategoryName.trim(), slug })
      .select()
      .single();

    setCategorySubmitting(false);

    if (error) {
      toast({ title: "Erro", description: error.message });
      return;
    }

    if (data) {
      setCategories((prev) => [...(prev || []), { id: data.id, name: data.name }]);
      setForm((f) => ({ ...f, category_id: data.id }));
    }

    setNewCategoryName("");
    setCategoryModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ["categories"] });

    toast({ title: "Categoria criada", description: `Categoria "${data?.name}" adicionada.` });
  };

  const filteredProducts = products?.filter((product: any) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading || productsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">

      {/* MOBILE SIDEBAR BUTTON */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 bg-white/10 text-white px-4 py-2 rounded-lg border border-white/10 backdrop-blur-md"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Abrir menu"
      >
        Menu
      </button>

      {/* OVERLAY quando sidebar aberta (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      {/* SIDEBAR */}
      <div
        className={`
          fixed lg:static top-0 left-0 h-full transition-transform duration-300 z-40
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <AdminSidebar />
      </div>

      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-wide text-muted-foreground">Gerenciar Produtos</h1>
            <p className="text-muted-foreground">{products?.length || 0} produtos cadastrados</p>
          </div>

          <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) { setEditingProduct(null); setSelectedFile(null); setPreviewUrl(null); } }}>
            <DialogTrigger asChild>
              <Button className="uppercase">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Produto
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingProduct ? "Editar Produto" : "Adicionar Produto"}</DialogTitle>
                <DialogDescription>
                  Preencha as informações do novo produto.
                </DialogDescription>
              </DialogHeader>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setSubmitting(true);
                  let imageUrl = form.image_url || null;

                  let progressInterval: any = null;
                  if (selectedFile) {
                    setUploadProgress(0);
                    progressInterval = setInterval(() => {
                      setUploadProgress((p) => {
                        if (p === null) return 5;
                        const next = Math.min(90, p + Math.floor(Math.random() * 10) + 5);
                        return next;
                      });
                    }, 300);

                    const fileExt = selectedFile.name.split(".").pop();
                    const fileName = `products/${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
                    const { data: uploadData, error: uploadError } = await supabase.storage
                      .from("product-images")
                      .upload(fileName, selectedFile, { cacheControl: "3600", upsert: false });

                    if (uploadError) {
                      if (progressInterval) clearInterval(progressInterval);
                      setUploadProgress(null);
                      setSubmitting(false);
                      toast({ title: "Erro no upload", description: uploadError.message });
                      return;
                    }

                    const { data: publicData } = await supabase.storage.from("product-images").getPublicUrl(uploadData.path || fileName);
                    imageUrl = publicData?.publicUrl || null;

                    if (progressInterval) clearInterval(progressInterval);
                    setUploadProgress(100);
                  }

                  const payload = {
                    name: form.name,
                    price: Number(form.price),
                    stock: Number(form.stock || 0),
                    image_url: imageUrl,
                    description: form.description || null,
                    category_id: form.category_id || null,
                  } as any;

                  let res;
                  if (editingProduct) {
                    res = await supabase.from("products").update(payload).eq("id", editingProduct.id).select();
                  } else {
                    res = await supabase.from("products").insert(payload).select();
                  }

                  setSubmitting(false);
                  setUploadProgress(null);
                  if (res.error) {
                    toast({ title: "Erro", description: res.error.message });
                    return;
                  }

                  toast({
                    title: editingProduct ? "Produto atualizado" : "Produto adicionado",
                    description: editingProduct ? "Alterações salvas." : "Produto criado com sucesso.",
                  });
                  queryClient.invalidateQueries({ queryKey: ["products"] });
                  setOpen(false);
                  setSelectedFile(null);
                  setEditingProduct(null);
                  setForm({ name: "", price: "0.00", stock: "0", image_url: "", description: "", category_id: "" });
                }}
              >
                <div className="grid gap-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Nome</Label>
                      <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                    </div>
                    <div>
                      <Label>Preço</Label>
                      <Input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Estoque</Label>
                      <Input value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                    </div>
                    <div>
                      <Label>Categoria</Label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <Select onValueChange={(val) => setForm({ ...form, category_id: val })} value={form.category_id}>
                            <SelectTrigger>
                              <SelectValue>{categories.find((c) => c.id === form.category_id)?.name || "Selecione"}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                  {cat.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Button size="sm" variant="outline" onClick={() => setCategoryModalOpen(true)} title="Adicionar categoria">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Imagem (URL)</Label>
                    <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
                  </div>

                  <div>
                    <Label>Ou faça upload da imagem</Label>
                    <Input type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                    {selectedFile ? (
                      <p className="text-sm text-muted-foreground mt-1">Arquivo selecionado: {selectedFile.name}</p>
                    ) : null}
                  </div>

                  {previewUrl ? (
                    <div className="mt-2">
                      <Label>Pré-visualização</Label>
                      <img src={previewUrl} alt="preview" className="w-48 h-48 object-contain rounded bg-muted p-2 mt-2" />
                    </div>
                  ) : null}

                  {uploadProgress !== null ? (
                    <div className="w-full bg-muted rounded mt-2">
                      <div className="h-2 bg-primary rounded" style={{ width: `${uploadProgress}%` }} />
                      <p className="text-sm text-muted-foreground mt-1">Enviando imagem: {uploadProgress}%</p>
                    </div>
                  ) : null}

                  <div>
                    <Label>Descrição</Label>
                    <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                  </div>

                  <DialogFooter>
                    <Button type="submit" disabled={submitting}>
                      Salvar
                    </Button>
                    <Button variant="outline" onClick={() => { setOpen(false); setSelectedFile(null); setEditingProduct(null); }} type="button">
                      Cancelar
                    </Button>
                  </DialogFooter>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Modal de categoria */}
          <Dialog open={categoryModalOpen} onOpenChange={setCategoryModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Categoria</DialogTitle>
                <DialogDescription>Crie uma nova categoria para poder selecioná-la no produto.</DialogDescription>
              </DialogHeader>
              <form onSubmit={async (e) => { e.preventDefault(); await handleAddCategory(); }}>
                <div className="grid gap-2">
                  <div>
                    <Label>Nome da categoria</Label>
                    <Input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} required />
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={categorySubmitting}>
                      Salvar
                    </Button>
                    <Button variant="outline" onClick={() => setCategoryModalOpen(false)} type="button">
                      Cancelar
                    </Button>
                  </DialogFooter>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produtos..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-border">
              <tr>
                <th className="text-left p-4 text-sm font-bold uppercase tracking-wide text-muted-foreground">ID</th>
                <th className="text-left p-4 text-sm font-bold uppercase tracking-wide text-muted-foreground">Imagem</th>
                <th className="text-left p-4 text-sm font-bold uppercase tracking-wide text-muted-foreground">Nome</th>
                <th className="text-left p-4 text-sm font-bold uppercase tracking-wide text-muted-foreground">Categoria</th>
                <th className="text-left p-4 text-sm font-bold uppercase tracking-wide text-muted-foreground">Preço</th>
                <th className="text-left p-4 text-sm font-bold uppercase tracking-wide text-muted-foreground">Estoque</th>
                <th className="text-left p-4 text-sm font-bold uppercase tracking-wide text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts?.map((product: any) => (
                <tr key={product.id} className="border-b border-border last:border-0">
                  <td className="p-4 text-muted-foreground">#{String(product.id).slice(0, 8).toUpperCase()}</td>
                  <td className="p-4">
                    <img
                      src={product.image_url || "/placeholder.svg"}
                      alt={product.name}
                      className="w-12 h-12 object-contain bg-muted rounded"
                    />
                  </td>
                  <td className="p-4 font-medium">{product.name}</td>
                  <td className="p-4 text-muted-foreground">
                    {product.categories?.name || "Sem categoria"}
                  </td>
                  <td className="p-4 font-medium">R$ {Number(product.price).toFixed(2)}</td>
                  <td className="p-4">{product.stock}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingProduct(product);
                          setForm({
                            name: product.name || "",
                            price: (Number(product.price) || 0).toFixed(2),
                            stock: String(product.stock || 0),
                            image_url: product.image_url || "",
                            description: product.description || "",
                            category_id: product.category_id || "",
                          });
                          setSelectedFile(null);
                          setOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={async () => {
                          const ok = window.confirm(`Remover o produto "${product.name}"?`);
                          if (!ok) return;
                          const { error } = await supabase.from("products").delete().eq("id", product.id);
                          if (error) {
                            toast({ title: "Erro", description: error.message });
                            return;
                          }
                          toast({ title: "Produto removido", description: "Produto excluído com sucesso." });
                          queryClient.invalidateQueries({ queryKey: ["products"] });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default Produtos;
