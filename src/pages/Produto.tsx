import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import product5 from "@/assets/product-5.jpg";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// fallback local assets for products without image_url
const fallbackImages = [product1, product2, product3, product4, product5];

const Produto = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("white");
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`*, categories ( name )`)
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div className="min-h-screen">Carregando produto...</div>;

  if (error || !product) {
    return <div className="min-h-screen">Produto não encontrado</div>;
  }

  const handleAddToCart = () => {
    addItem({
      id: `${product.id}-${selectedSize}-${selectedColor}`,
      name: product.name,
      price: product.price,
      image: product.image_url ?? fallbackImages[0],
      quantity,
      size: selectedSize,
      color: selectedColor,
    });
    navigate("/carrinho");
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <div className="bg-muted aspect-square flex items-center justify-center p-12 border border-border">
              <img src={product.image_url ?? fallbackImages[0]} alt={product.name} className="w-full h-full object-contain" />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">{product.categories?.name ?? ""}</p>
              <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold">R$ {product.price.toFixed(2)}</span>
              </div>
              <Badge className="mt-2">Últimas Unidades</Badge>
            </div>

            <div>
              <label className="block text-sm font-medium mb-3 uppercase tracking-wide">Tamanho</label>
              <div className="flex gap-2">
                {["P", "M", "G", "GG"].map((size) => (
                  <Button
                    key={size}
                    variant={selectedSize === size ? "default" : "outline"}
                    onClick={() => setSelectedSize(size)}
                    className="w-16"
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-3 uppercase tracking-wide">Cor</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedColor("white")}
                  className={`w-8 h-8 rounded-full bg-white border-2 ${
                    selectedColor === "white" ? "border-primary" : "border-border"
                  }`}
                />
                <button
                  onClick={() => setSelectedColor("black")}
                  className={`w-8 h-8 rounded-full bg-black border-2 ${
                    selectedColor === "black" ? "border-primary" : "border-border"
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-3 uppercase tracking-wide">Quantidade</label>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-24"
              />
            </div>

            <Button 
              size="lg" 
              className="w-full uppercase tracking-wide" 
              disabled={!selectedSize}
              onClick={handleAddToCart}
            >
              {selectedSize ? "Adicionar ao Carrinho" : "Selecione um Tamanho"}
            </Button>

            <div className="border-t border-border pt-6">
              <h3 className="font-bold mb-4 uppercase tracking-wide">Descrição</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description ?? `${product.name} fabricado em material premium com acabamento de alta qualidade.`}
              </p>
              <div className="mt-4">
                <p className="text-sm font-medium">MATERIAIS:</p>
                <p className="text-sm text-muted-foreground">100% materiais premium selecionados</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Produto;
