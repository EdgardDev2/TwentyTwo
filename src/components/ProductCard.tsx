import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";

interface ProductCardProps {
  id: string;
  name: string;
  image: string;
  originalPrice: number;
  discountPercent?: number;
  categoryName?: string;
  inStock?: boolean;
}

export const ProductCard = ({
  id,
  name,
  image,
  originalPrice,
  discountPercent,
  categoryName,
  inStock = true,
}: ProductCardProps) => {
  const { addItem } = useCart();

  const discount = discountPercent ?? 0;
  const finalPrice = originalPrice * (1 - discount / 100);
  const pixPrice = finalPrice * 0.95; // 5% Pix
  const installment = finalPrice / 12;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!inStock) return;
    addItem({
      id,
      name,
      price: finalPrice,
      image,
    });
  };

  return (
    <div className="group bg-black text-white border border-zinc-800 hover:border-primary transition rounded-sm overflow-hidden">
      <Link to={`/produto/${id}`}>
        {/* IMAGEM */}
        <div className="relative aspect-square bg-zinc-900 flex items-center justify-center p-6">
          <img
            src={image}
            alt={name}
            className={
              "w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" +
              (inStock ? "" : " filter grayscale blur-sm opacity-60")
            }
          />

          {/* TAG DESCONTO */}
          {discount > 0 && (
            <span className="absolute top-3 right-3 bg-primary text-black text-xs font-bold px-2 py-1">
              -{discount}%
            </span>
          )}

          {/* TAG ESGOTADO */}
          {!inStock && (
            <span className="absolute top-3 left-3 bg-zinc-700 text-white text-xs font-bold px-2 py-1">
              Esgotado
            </span>
          )}
        </div>

        {/* CONTEÚDO */}
        <div className="p-4 space-y-2">
          <h3 className="text-sm uppercase tracking-wide">{name}</h3>

          {categoryName && (
            <p className="text-xs text-zinc-400">{categoryName}</p>
          )}

          {/* PREÇO */}
          <div className="space-y-1">
            <p className="text-sm line-through text-zinc-500">
              R$ {originalPrice.toFixed(2)}
            </p>

            <p className="text-lg font-bold">
              R$ {finalPrice.toFixed(2)}
              {discount > 0 && (
                <span className="text-primary text-sm ml-2">{discount}% OFF</span>
              )}
            </p>

            <p className="text-xs text-zinc-400">
              R$ {pixPrice.toFixed(2)} no Pix
            </p>

            <p className="text-xs text-zinc-400">
              12x de R$ {installment.toFixed(2)}
            </p>
          </div>
        </div>
      </Link>

      {/* BOTÃO */}
      <div className="p-4 pt-0">
        <Button
          onClick={handleAddToCart}
          disabled={!inStock}
          className="w-full uppercase text-xs tracking-widest hover:scale-105 transition"
        >
          {inStock ? "Adicionar ao Carrinho" : "Esgotado"}
        </Button>
      </div>
    </div>
  );
};
