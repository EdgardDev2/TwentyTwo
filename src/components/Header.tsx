import { ShoppingCart, Menu, X, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";
import { CartSidebar } from "@/components/CartSidebar";

export const Header = () => {
  const { getItemCount } = useCart();
  const itemCount = getItemCount();
  const [isCartOpen, setCartOpen] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 w-full bg-background/95 backdrop-blur-sm border-b border-border z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between relative">
        <div>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="p-2"
            aria-label="Open menu"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <Link to="/home" className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <img src={logo} alt="Twenty Two" className="h-8 md:h-10" />
        </Link>

        <div className="flex items-center gap-3">
 
          <div className="relative">
            <button
              onClick={() => setSearchOpen((v) => !v)}
              className="p-2 hover:text-primary transition-colors"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
            {isSearchOpen && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSearchOpen(false);
                  setMenuOpen(false);
                  navigate(`/catalogo?q=${encodeURIComponent(query)}`);
                }}
                className="absolute right-0 mt-2 w-64 bg-background/95 border border-border p-2 rounded"
              >
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar..."
                  className="w-full bg-transparent outline-none text-sm"
                />
              </form>
            )}
          </div>

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
      </div>

      {/* Left-side menu sidebar (appears on all sizes) */}
      <aside
        className={`fixed top-0 left-0 h-screen w-screen sm:w-[420px] bg-background shadow-2xl z-50 border-r border-border flex flex-col transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "-translate-x-0" : "-translate-x-full"
        }`}
        aria-hidden={!isMenuOpen}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold uppercase tracking-wide">Menu</h2>
          <button className="p-2" onClick={() => setMenuOpen(false)} aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <nav className="flex flex-col gap-2">
            <Link to="/" onClick={() => setMenuOpen(false)} className="py-3 px-2 uppercase tracking-wide hover:bg-muted rounded">
              Home
            </Link>
            <Link to="/catalogo" onClick={() => setMenuOpen(false)} className="py-3 px-2 uppercase tracking-wide hover:bg-muted rounded">
              Catálogo
            </Link>
            <Link to="/blog" onClick={() => setMenuOpen(false)} className="py-3 px-2 uppercase tracking-wide hover:bg-muted rounded">
              Blog
            </Link>
          </nav>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setMenuOpen(false);
              navigate(`/catalogo?q=${encodeURIComponent(query)}`);
            }}
            className="mt-4 flex gap-2"
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar..."
              className="flex-1 p-2 bg-transparent border border-border rounded"
            />
            <button type="submit" className="bg-primary text-primary-foreground px-4 rounded">
              Ir
            </button>
          </form>
        </div>
      </aside>

      <CartSidebar open={isCartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
};
