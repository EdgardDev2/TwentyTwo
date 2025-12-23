import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Categoria = () => {
  const { categoryId } = useParams();
  const [products, setProducts] = useState<Array<any>>([]);
  const [categoryName, setCategoryName] = useState<string>("Categoria");

  useEffect(() => {
    const fetchBySlug = async () => {
      if (!categoryId) return;

      // find category by slug
      const { data: cat } = await supabase
        .from("categories")
        .select("id,name")
        .eq("slug", categoryId)
        .maybeSingle();

      if (!cat) {
        setProducts([]);
        setCategoryName("Categoria");
        return;
      }

      setCategoryName(cat.name);

      const { data: prods } = await supabase
        .from("products")
        .select("*")
        .eq("category_id", cat.id)
        .order("created_at", { ascending: false });

      setProducts(prods || []);
    };

    fetchBySlug();
  }, [categoryId]);

  const isProductInStock = (p: any) => {
    if (typeof p.in_stock === "boolean") return p.in_stock;
    const numericFields = [p.stock, p.stock_count, p.quantity, p.inventory];
    for (const v of numericFields) {
      if (typeof v === "number") return v > 0;
    }
    return true;
  };

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 pt-24 pb-12">
        <h1 className="text-4xl font-bold mb-2 uppercase tracking-wide animate-fade-in-up">
          {categoryName}
        </h1>
        <p className="text-muted-foreground mb-8 animate-fade-in-up [animation-delay:200ms]">
          {products.length} {products.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
        </p>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...products]
              .sort((a, b) => {
                const aOut = !isProductInStock(a);
                const bOut = !isProductInStock(b);
                if (aOut === bOut) return 0;
                return aOut ? 1 : -1;
              })
              .map((product: any, index: number) => (
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
                    inStock={isProductInStock(product)}
                  />
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-20 animate-fade-in">
            <p className="text-muted-foreground text-lg">
              Nenhum produto encontrado nesta categoria.
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Categoria;
