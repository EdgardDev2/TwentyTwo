import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";

import { Button } from "@/components/ui/button";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import { supabase } from "@/integrations/supabase/client";

import icone from "@/assets/icone fundo preto.jpg";
import logo from "@/assets/logo.png";
import bg from "@/assets/background.jpg";

// Carrossel inicial
const carouselImages = [icone, logo];

const Home = () => {
  const [categories, setCategories] = useState<
    Array<{ id: string; name: string; slug: string; image?: string }>
  >([]);

  const [topProducts, setTopProducts] = useState<
    Array<{
      id: string;
      name: string;
      price: number;
      originalPrice: number;
      image: string;
    }>
  >([]);

  /* =======================
      Fetch Categories
  ======================= */
  useEffect(() => {
    const fetchCategoriesAndImages = async () => {
      if (!supabase) return;

      const { data: cats, error } = await supabase
        .from("categories")
        .select("id,name,slug,created_at")
        .order("created_at", { ascending: false })
        .limit(4);

      if (error || !cats) {
        console.error("Error fetching categories:", error);
        setCategories([]);
        return;
      }

      const ids = cats.map((c: any) => c.id);

      const { data: prods } = await supabase
        .from("products")
        .select("id,image_url,category_id,created_at")
        .in("category_id", ids)
        .order("created_at", { ascending: false });

      const mapped = cats.map((c: any) => {
        const prodImage = prods?.find((p: any) => p.category_id === c.id);
        return {
          ...c,
          image: prodImage?.image_url || logo,
        };
      });

      setCategories(mapped);
    };

    fetchCategoriesAndImages();
  }, []);

  /* =======================
      Fetch Top Selling
  ======================= */
  useEffect(() => {
    const fetchTopSelling = async () => {
      if (!supabase) return;

      const { data: items, error } = await supabase
        .from("order_items")
        .select("product_id,quantity");

      if (error || !items) {
        console.error("Error fetching order_items:", error);
        setTopProducts([]);
        return;
      }

      const counts: Record<string, number> = {};

      items.forEach((it: any) => {
        const qty = Number(it.quantity) || 0;
        if (!it.product_id) return;
        counts[it.product_id] = (counts[it.product_id] || 0) + qty;
      });

      const topIds = Object.keys(counts)
        .sort((a, b) => counts[b] - counts[a])
        .slice(0, 4);

      if (topIds.length === 0) return;

      const { data: products, error: prodErr } = await supabase
        .from("products")
        .select("id,name,price,image_url")
        .in("id", topIds);

      if (prodErr || !products) {
        console.error("Error fetching products:", prodErr);
        return;
      }

      const ordered = topIds
        .map((id) => {
          const p = products.find((prod: any) => prod.id === id);
          return p
            ? {
                id: p.id,
                name: p.name,
                price: p.price,
                originalPrice: p.price,
                image: p.image_url || logo,
              }
            : null;
        })
        .filter(Boolean) as any;

      setTopProducts(ordered);
    };

    fetchTopSelling();
  }, []);

  return (
    <div
      className="min-h-screen text-white relative"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/70" />

      <div className="relative z-10">
        <Header />

        {/* ===========================
            HERO - CARROSSEL PRINCIPAL
        ============================ */}
        <section className="pt-20">
          <Carousel className="w-full animate-fade-in">
            <CarouselContent>
              {carouselImages.map((image, index) => (
                <CarouselItem key={index}>
                  <div
                    className="relative h-[70vh] flex items-center justify-center"
                    style={{
                      backgroundImage: `linear-gradient(rgba(0,0,0,.3), rgba(0,0,0,.3)), url(${image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>
        </section>

        <hr className="my-8 border-gray-700" />

        
        {/* DESTAQUES  */}
        <section className="container mx-auto px-4 py-20">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-wide">
                Destaques
              </h2>
              <p className="text-lg md:text-xl text-gray-300 mt-2">
                Peças selecionadas que definem o streetwear contemporâneo
              </p>
            </div>

            <Link to="/catalogo">
              <Button
                variant="outline"
                className="uppercase tracking-wide hover:scale-105 transition-transform mt-4 md:mt-0"
              >
                Ver Catálogo Completo
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {topProducts.map((product, index) => (
              <div
                key={product.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ProductCard {...product} />
              </div>
            ))}
          </div>
        </section>

        <hr className="my-8 border-gray-700" />

        {/* Categorias */}
<section className="container mx-auto px-4 py-20 overflow-hidden">
  <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 uppercase tracking-wide">
    Navegue por Categorias
  </h2>

  <p className="text-lg md:text-xl text-center text-gray-300 mb-8">
    Encontre exatamente o que define seu estilo
  </p>

  {/* GRID - DESKTOP */}
  <div className="hidden md:grid grid-cols-2 md:grid-cols-4 gap-6">
    {categories.map((category, index) => (
      <Link
        key={category.id}
        to={`/categoria/${category.slug}`}
        className="group animate-fade-in-up"
        style={{ animationDelay: `${index * 100}ms` }}
      >
        <div className="bg-card border border-border overflow-hidden rounded-lg 
                        hover:border-primary transition-all duration-300 
                        hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
          <div className="aspect-square bg-muted flex items-center justify-center p-8 overflow-hidden">
            <img
              src={category.image || logo}
              alt={category.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          </div>
          <div className="p-4 text-center">
            <h3 className="font-bold text-lg uppercase tracking-wide group-hover:text-primary transition-colors">
              {category.name}
            </h3>
          </div>
        </div>
      </Link>
    ))}
  </div>

  {/* MOBILE - lista ou carrossel automaticamente */}
<div className="md:hidden px-2">
  {categories.length <= 4 ? (
    /* ======== MODO LISTA (igual ao exemplo) ======== */
    <div className="overflow-x-auto overflow-y-hidden">
      <div className="flex gap-4 py-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/categoria/${category.slug}`}
            className="flex-shrink-0 w-[130px]"
          >
            <div className="bg-card border border-border overflow-hidden rounded-lg">
              
              {/* Imagem menor */}
              <div className="w-full h-[100px] bg-muted flex items-center justify-center overflow-hidden rounded-md">
                <img
                  src={category.image || logo}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Nome */}
              <div className="p-2 text-center">
                <h3 className="font-semibold text-sm uppercase tracking-wide">
                  {category.name}
                </h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  ) : (
    /* ======== MODO CARROSSEL AUTOMÁTICO ======== */
    <Carousel className="w-full">
      <CarouselContent>
        {categories.map((category) => (
          <CarouselItem
            key={category.id}
            className="flex justify-center px-2"
          >
            <Link
              to={`/categoria/${category.slug}`}
              className="block w-[88%] max-w-[240px]"
            >
              <div className="bg-card border border-border overflow-hidden rounded-lg">
                <div className="w-full h-[120px] bg-muted flex items-center justify-center overflow-hidden rounded-md">
                  <img
                    src={category.image || logo}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3 text-center">
                  <h3 className="font-semibold text-sm uppercase tracking-wide">
                    {category.name}
                  </h3>
                </div>
              </div>
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>

      <div className="flex items-center justify-between px-6 mt-6">
        <CarouselPrevious />
        <CarouselNext />
      </div>
    </Carousel>
  )}
</div>


{/* SESSÃO PRINCIPAL */}
        <section className="pt-20 flex flex-col items-center text-center min-h-[90vh] px-6">
          <img
            src={logo}
            alt="Twenty Two Imports"
            className="w-[260px] md:w-[320px] mb-8 animate-fade-in"
          />

          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in-up">
            A Vida Real está nas Ruas
          </h1>

          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl animate-fade-in-up">
            Peças exclusivas que refletem a autenticidade da cultura urbana.
            <br /> Qualidade e estilo premium.
          </p>

          <Link to="/catalogo">
            <Button className="bg-white text-black font-semibold px-8 py-4 rounded-full hover:scale-105 transition-transform">
              EXPLORAR COLEÇÃO →
            </Button>
          </Link>
        </section>

        <hr className="my-8 border-gray-700" />

</section>


        <Footer />
      </div>
    </div>
  );
};

export default Home;
