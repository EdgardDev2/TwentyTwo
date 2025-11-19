import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";
import { CartSidebar } from "@/components/CartSidebar";

export const Header = () => {
  const { getItemCount } = useCart();
  const itemCount = getItemCount();
  const [isCartOpen, setCartOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full bg-background/95 backdrop-blur-sm border-b border-border z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold tracking-wider">
          TWENTY TWO
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm uppercase tracking-wide hover:text-primary transition-colors">
            Home
          </Link>
          <Link to="/catalogo" className="text-sm uppercase tracking-wide hover:text-primary transition-colors">
            Catálogo
          </Link>
          <Link to="/blog" className="text-sm uppercase tracking-wide hover:text-primary transition-colors">
            Blog
          </Link>
        </nav>

        <button
          onClick={() => setCartOpen(true)}
          className="relative hover:text-primary transition-colors"
        >
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </button>
      </div>

      <CartSidebar open={isCartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
};
