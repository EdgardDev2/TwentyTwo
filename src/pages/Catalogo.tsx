import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Search } from "lucide-react";

const Catalogo = () => {
  const { data: products, isLoading } = useProducts();
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const isProductInStock = (p: any) => {
    if (typeof p.in_stock === "boolean") return p.in_stock;
    const numericFields = [p.stock, p.stock_count, p.quantity, p.inventory];
    for (const v of numericFields) {
      if (typeof v === "number") return v > 0;
    }
    return true;
  };

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from("categories")
        .select("id,name")
        .order("name");

      setCategories(data || []);
    };

    fetchCategories();
  }, []);

  const filtered = (products || []).filter((p) => {
    const matchesSearch = p.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || p.category_id === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const sorted = [...filtered].sort((a, b) => {
    const aOut = !isProductInStock(a);
    const bOut = !isProductInStock(b);
    if (aOut === bOut) return 0;
    return aOut ? 1 : -1;
  });

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 pt-24 pb-12">
        <h1 className="text-4xl font-bold mb-6 uppercase tracking-wide animate-fade-in-up">
          Catálogo
        </h1>

        {/* FILTROS */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar produtos..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select
              value={selectedCategory}
              onValueChange={(val) => setSelectedCategory(val)}
            >
              <SelectTrigger>
                <SelectValue>
                  {selectedCategory === "all"
                    ? "Todas as categorias"
                    : categories.find((c) => c.id === selectedCategory)?.name}
                </SelectValue>
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* LISTAGEM */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Carregando produtos...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sorted.map((product, index) => (
              <div
                key={product.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ProductCard
                  id={product.id}
                  name={product.name}
                  image={product.image_url || "/placeholder.svg"}
                  originalPrice={Number(product.price)}
                  discountPercent={Number(product.discount_percent) || 0}
                  categoryName={
                    product.categories?.name ||
                    categories.find((c) => c.id === product.category_id)?.name ||
                    "Sem categoria"
                  }
                  inStock={isProductInStock(product)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">
              Nenhum produto disponível no momento.
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Catalogo;
