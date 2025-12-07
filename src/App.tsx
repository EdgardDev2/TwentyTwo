import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import Home from "./pages/Home";
import LandingPage from "./pages/LandingPage";
import Catalogo from "./pages/Catalogo";
import Produto from "./pages/Produto";
import Carrinho from "./pages/Carrinho";
import Blog from "./pages/Blog";
import Categoria from "./pages/Categoria";
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import Produtos from "./pages/admin/Produtos";
import Pedidos from "./pages/admin/Pedidos";
import Estoque from "./pages/admin/Estoque";
import CarouselImages from "./pages/admin/CarouselImages";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/home" element={<Home />} />
            <Route path="/catalogo" element={<Catalogo />} />
            <Route path="/categoria/:categoryId" element={<Categoria />} />
            <Route path="/produto/:id" element={<Produto />} />
            <Route path="/carrinho" element={<Carrinho />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/sobre" element={<Blog />} />
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/produtos" element={<Produtos />} />
            <Route path="/admin/pedidos" element={<Pedidos />} />
            <Route path="/admin/estoque" element={<Estoque />} />
            <Route path="/admin/CarouselImages" element={<CarouselImages />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;
