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
    <header className="fixed top-0 w-full bg-background/95 backdrop-blur-md border-b border-border z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between relative">

        {/* LEFT - MOBILE MENU */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="p-2 md:hidden hover:text-primary transition-colors"
          aria-label="Abrir menu"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* LEFT DESKTOP NAV */}
        <nav className="hidden md:flex gap-6 items-center">
          <Link to="/home" className="hover:text-primary transition">Home</Link>
          <Link to="/catalogo" className="hover:text-primary transition">Catálogo</Link>
          <Link to="/blog" className="hover:text-primary transition">Blog</Link>
        </nav>

        {/* CENTER - LOGO */}
        <Link
          to="/home"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <img
            src={logo}
            alt="Twenty Two"
            className="h-8 sm:h-9 md:h-10 lg:h-12"
          />
        </Link>

        {/* RIGHT CONTROLS */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">

          {/* SEARCH ICON */}
          <div className="relative">
            <button
              onClick={() => setSearchOpen((v) => !v)}
              className="p-2 md:p-3 hover:text-primary transition-colors"
            >
              <Search className="h-5 w-5 md:h-6 md:w-6" />
            </button>

            {/* SEARCH BOX (RESPONSIVE) */}
            {isSearchOpen && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSearchOpen(false);
                  navigate(`/catalogo?q=${encodeURIComponent(query)}`);
                }}
                className="
                  absolute right-0 mt-2 
                  w-48 sm:w-60 
                  bg-background border border-border p-2 rounded shadow-md
                  md:-bottom-14 md:mt-0 md:right-auto md:left-0 md:w-64
                "
              >
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar..."
                  className="w-full bg-transparent outline-none text-sm p-1"
                />
              </form>
            )}
          </div>

          {/* CART BUTTON */}
          <button
            onClick={() => setCartOpen(true)}
            className="relative p-2 md:p-3 hover:text-primary transition-colors"
          >
            <ShoppingCart className="h-5 w-5 md:h-6 md:w-6" />

            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* MOBILE SIDEBAR MENU */}
      <aside
        className={`fixed top-0 left-0 h-screen w-screen sm:w-[420px] 
          bg-background shadow-2xl z-[999] border-r border-border flex flex-col 
          transition-transform duration-300 md:hidden 
          ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold uppercase tracking-wide">Menu</h2>
          <button onClick={() => setMenuOpen(false)}>
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <nav className="flex flex-col gap-2">
            <Link
              to="/home"
              onClick={() => setMenuOpen(false)}
              className="py-3 px-2 uppercase tracking-wide hover:bg-muted rounded"
            >
              Home
            </Link>

            <Link
              to="/catalogo"
              onClick={() => setMenuOpen(false)}
              className="py-3 px-2 uppercase tracking-wide hover:bg-muted rounded"
            >
              Catálogo
            </Link>

            <Link
              to="/blog"
              onClick={() => setMenuOpen(false)}
              className="py-3 px-2 uppercase tracking-wide hover:bg-muted rounded"
            >
              Blog
            </Link>
          </nav>

          {/* SEARCH INSIDE MENU */}
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
            <button
              type="submit"
              className="bg-primary text-primary-foreground px-4 rounded"
            >
              Ir
            </button>
          </form>
        </div>
      </aside>

      {/* CART SIDEBAR */}
      <CartSidebar open={isCartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
};
