import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ShoppingCart, Menu, X, Search } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { CartSidebar } from "@/components/CartSidebar";
import landing from "@/assets/Landing.jpeg";
import carousel1 from "@/assets/carousel-desktop1.jpeg";
import carousel2 from "@/assets/carousel-desktop2.jpeg";
import carousel3 from "@/assets/carousel-desktop3.jpeg";
import carousel4 from "@/assets/Landing.jpeg";

// Add your mobile-specific images
import mobileCarousel1 from "@/assets/carousel1.jpeg";
import mobileCarousel2 from "@/assets/carousel2.jpeg";
import mobileCarousel3 from "@/assets/carousel3.jpeg";
import mobileCarousel4 from "@/assets/carousel4.jpeg";

import logo from "@/assets/logo.png";
import Instagram_logo from "@/assets/Instagram_logo.png";

// Helper function to check if mobile
const isMobile = () => window.innerWidth <= 768;

export default function LandingPage() {
  // Define desktop and mobile image arrays
  const desktopImages = [landing, carousel1, carousel2, carousel3, carousel4];
  const mobileImages = [landing, mobileCarousel1, mobileCarousel2, mobileCarousel3, mobileCarousel4];
  
  // State to hold the current images based on screen size
  const [currentImages, setCurrentImages] = useState(
    isMobile() ? mobileImages : desktopImages
  );
  const [index, setIndex] = useState(0);
  const { getItemCount } = useCart();
  const itemCount = getItemCount();

  const [isCartOpen, setCartOpen] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const navigate = useNavigate();

  // Handle window resize and update images accordingly
  useEffect(() => {
    const handleResize = () => {
      setCurrentImages(isMobile() ? mobileImages : desktopImages);
      // Reset index when images change to prevent out-of-bounds
      setIndex(0);
    };

    // Initial check
    handleResize();

    // Add resize listener
    window.addEventListener("resize", handleResize);
    
    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Carousel auto-slide effect
  useEffect(() => {
    const id = setInterval(
      () => setIndex((i) => (i + 1) % currentImages.length),
      5000
    );
    return () => clearInterval(id);
  }, [currentImages.length]); // Add dependency on currentImages.length

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Slides */}
      {currentImages.map((img, i) => (
        <div
          key={i}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
          style={{ backgroundImage: `url(${img})` }}
        />
      ))}

      {/* Optional dim overlay for readability */}
      <div className="absolute inset-0 bg-black/30 z-10" />

      <div className="relative z-20 flex flex-col h-full">
        {/* TOP BAR - landing-styled copy of Header.tsx (keeps landing page visual) */}
        <header className="w-full h-20 flex items-center justify-between px-6 bg-black/30 backdrop-blur-md shadow-lg z-20">
          {/* LEFT - MOBILE MENU */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="p-2 md:hidden hover:text-primary transition-colors"
              aria-label="Abrir menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-white" />
              ) : (
                <Menu className="h-6 w-6 text-white" />
              )}
            </button>

            {/* DESKTOP NAV */}
            <nav className="hidden md:flex gap-6 items-center">
              <Link to="/home" className="hover:text-primary transition text-white">
                Home
              </Link>
              <Link to="/catalogo" className="hover:text-primary transition text-white">
                Catálogo
              </Link>
              <Link to="/blog" className="hover:text-primary transition text-white">
                Blog
              </Link>
            </nav>
          </div>

          {/* CENTER - LOGO */}
          <Link
            to="/home"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <img src={logo} alt="Twenty Two" className="h-8 sm:h-9 md:h-10 lg:h-12" />
          </Link>

          {/* RIGHT CONTROLS */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            {/* Instagram quick link (keeps original landing behavior) */}
            <a
              href="https://www.instagram.com/twentytwo_imports/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 transition text-white"
              aria-label="Instagram"
            >
              <img src={Instagram_logo} alt="Instagram Logo" className="w-6 h-6" />
            </a>

            {/* SEARCH ICON */}
            <div className="relative">
              <button
                onClick={() => setSearchOpen((v) => !v)}
                className="p-2 md:p-3 hover:text-primary transition-colors text-white"
              >
                <Search className="h-5 w-5 md:h-6 md:w-6" />
              </button>

              {isSearchOpen && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSearchOpen(false);
                    navigate(`/catalogo?q=${encodeURIComponent(query)}`);
                  }}
                  className="absolute right-0 mt-2 w-48 sm:w-60 bg-black/70 border border-white/10 p-2 rounded shadow-md md:-bottom-14 md:mt-0 md:right-auto md:left-0 md:w-64"
                >
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar..."
                    className="w-full bg-transparent outline-none text-sm p-1 text-white"
                  />
                </form>
              )}
            </div>

            {/* CART BUTTON */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 md:p-3 hover:text-primary transition-colors text-white"
            >
              <ShoppingCart className="h-5 w-5 md:h-6 md:w-6" />

              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* MOBILE SIDEBAR MENU */}
        <aside
          className={`fixed top-0 left-0 h-screen w-screen sm:w-[420px] bg-black/80 shadow-2xl z-[999] border-r border-white/10 flex flex-col transition-transform duration-300 md:hidden ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h2 className="text-lg font-bold uppercase tracking-wide text-white">
              Menu
            </h2>
            <button onClick={() => setMenuOpen(false)}>
              <X className="h-6 w-6 text-white" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <nav className="flex flex-col gap-2">
              <Link
                to="/home"
                onClick={() => setMenuOpen(false)}
                className="py-3 px-2 uppercase tracking-wide hover:bg-muted rounded text-white"
              >
                Home
              </Link>
              <Link
                to="/catalogo"
                onClick={() => setMenuOpen(false)}
                className="py-3 px-2 uppercase tracking-wide hover:bg-muted rounded text-white"
              >
                Catálogo
              </Link>
              <Link
                to="/blog"
                onClick={() => setMenuOpen(false)}
                className="py-3 px-2 uppercase tracking-wide hover:bg-muted rounded text-white"
              >
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
                className="flex-1 p-2 bg-transparent border border-white/10 rounded text-white"
              />
              <button type="submit" className="bg-primary text-primary-foreground px-4 rounded">
                Ir
              </button>
            </form>
          </div>
        </aside>

        {/* CART SIDEBAR */}
        <CartSidebar open={isCartOpen} onClose={() => setCartOpen(false)} />

        {/* CENTERED BUTTON */}
        <main className="flex-1 flex items-center justify-center">
          <Link
            to="/home"
            aria-label="Visite a nossa loja"
            className="bg-transparent backdrop-blur-md text-white font-semibold text-lg px-8 py-3 rounded-xl shadow-lg border border-white/30 hover:bg-white/10 hover:scale-105 transition"
          >
            Visite a nossa loja 
          </Link>
        </main>
      </div>
    </div>
  );
}