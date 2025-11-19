import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  categoryName?: string;
}

export const ProductCard = ({ id, name, price, image, categoryName }: ProductCardProps) => {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id: `${id}-quick`,
      name,
      price,
      image,
    });
  };

  return (
    <div className="group">
      <Link to={`/produto/${id}`}>
        <div className="bg-card border border-border overflow-hidden hover:border-primary transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
          <div className="aspect-square bg-muted flex items-center justify-center p-8 overflow-hidden">
            <img 
              src={image} 
              alt={name}
              className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
            />
          </div>
          <div className="p-4">
            <h3 className="font-medium text-sm mb-1 text-muted-foreground group-hover:text-primary transition-colors">{name}</h3>
            {categoryName ? (
              <p className="text-xs text-muted-foreground mb-2">{categoryName}</p>
            ) : null}
            <p className="text-lg font-bold mb-4">R$ {price.toFixed(2)}</p>
          </div>
        </div>
      </Link>
      <div className="px-4 pb-4 -mt-4">
        <Button 
          onClick={handleAddToCart}
          className="w-full uppercase text-xs tracking-wide transition-all hover:scale-105"
        >
          Adicionar ao Carrinho
        </Button>
      </div>
    </div>
  );
};
