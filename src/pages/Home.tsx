import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import icone from "@/assets/icone fundo preto.jpg";
import logo from "@/assets/logo.png";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import product5 from "@/assets/product-5.jpg";
import bg from "@/assets/background.jpg";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const carouselImages = [icone, logo];

const Home = () => {
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string; image?: string }>>([]);
  // top selling products (fetched from DB)
  const [topProducts, setTopProducts] = useState<Array<{ id: string; name: string; price: number; image: string }>>([]);

  useEffect(() => {
    const fetchCategoriesAndImages = async () => {
      if (!supabase) return;

      // fetch latest 4 categories
      const { data: cats, error: catError } = await supabase
        .from("categories")
        .select("id,name,slug,created_at")
        .order("created_at", { ascending: false })
        .limit(4);

      if (catError) {
        console.error("Error fetching categories:", catError);
        setCategories([]);
        return;
      }

      const categoriesData = cats || [];
      if (categoriesData.length === 0) {
        setCategories([]);
        return;
      }

      const ids = categoriesData.map((c: any) => c.id);

      // fetch latest products for these categories and pick the first product image per category
      const { data: prods } = await supabase
        .from("products")
        .select("id,image_url,category_id,created_at")
        .in("category_id", ids)
        .order("created_at", { ascending: false });

      const prodsData = prods || [];

      const mapped = categoriesData.map((c: any) => {
        const prod = prodsData.find((p: any) => p.category_id === c.id);
        return {
          id: c.id,
          name: c.name,
          slug: c.slug,
          image: prod?.image_url || logo,
        };
      });

      setCategories(mapped);
    };

    fetchCategoriesAndImages();
  }, []);

  // fetch top-selling products based on recorded sales (order_items)
  useEffect(() => {
    const fetchTopSelling = async () => {
      if (!supabase) return;

      // get order items and aggregate quantities per product_id
      const { data: items, error: itemsError } = await supabase
        .from("order_items")
        .select("product_id,quantity");

      if (itemsError) {
        console.error("Error fetching order_items:", itemsError);
        setTopProducts([]);
        return;
      }

      const itemRows = items || [];
      const counts: Record<string, number> = {};
      itemRows.forEach((it: any) => {
        const pid = it.product_id;
        const qty = Number(it.quantity) || 0;
        if (!pid) return;
        counts[pid] = (counts[pid] || 0) + qty;
      });

      const sortedIds = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
      const topIds = sortedIds.slice(0, 4);

      if (topIds.length === 0) {
        setTopProducts([]);
        return;
      }

      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("id,name,price,image_url")
        .in("id", topIds);

      if (productsError) {
        console.error("Error fetching products for top ids:", productsError);
        setTopProducts([]);
        return;
      }

      const productsList = productsData || [];

      // keep the same order as topIds
      const ordered = topIds
        .map((id) => productsList.find((p: any) => p.id === id))
        .filter(Boolean)
        .map((p: any) => ({ id: p.id, name: p.name, price: p.price, image: p.image_url || logo }));

      setTopProducts(ordered as any);
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
        backgroundRepeat: "no-repeat",
      }}
    >

      
      {/* Overlay escuro para melhorar a leitura */}
      <div className="absolute inset-0 bg-black/70"></div>
      {/* Conteúdo acima do overlay */}
      <div className="relative z-10">
        <Header />

        {/* Carrossel */}
        <section className="pt-20">
          <Carousel className="w-full animate-fade-in">
            <CarouselContent>
              {carouselImages.map((image, index) => (
                <CarouselItem key={index}>
                  <div
                    className="relative h-[70vh] flex items-center justify-center"
                    style={{
                      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    <div className="text-center space-y-6 px-4 animate-fade-in-up">
                      <h2 className="text-5xl md:text-7xl font-bold tracking-wider">
                        LIFESTYLE
                      </h2>
                      <p className="text-xl md:text-2xl text-muted-foreground tracking-wide">
                        A Vida Real está nas Ruas
                      </p>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>
        </section>

        <hr className="my-8 border-gray-700" />
        {/* === Seção Principal TWENTY TWO === */}
        <section className="pt-20 flex flex-col items-center justify-center text-center min-h-[90vh] px-6">
          <img
            src={logo}
            alt="Twenty Two Imports"
            className="w-[260px] md:w-[320px] mb-8 animate-fade-in"
          />
          <h1 className="text-4xl md:text-6xl font-Oswald, sans-serif mb-6 animate-fade-in-up">
            A Vida Real está nas Ruas
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl animate-fade-in-up">
            Peças exclusivas que refletem a autenticidade da cultura urbana.<br />
            Qualidade e estilo premium.
          </p>
          <Link to="/catalogo">
            <Button
              size="lg"
              className="bg-white text-black font-semibold px-8 py-4 rounded-full hover:scale-105 transition-transform animate-fade-in-up"
            >
              EXPLORAR COLEÇÃO →
            </Button>
          </Link>
        </section>
        
        <hr className="my-8 border-gray-700" />
        
        

        {/* Destaques */}
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
                {/* Assuming ProductCard handles link/navigation to product details */}
                <ProductCard {...product} />
              </div>
            ))}
          </div>
        </section>

        <hr className="my-8 border-gray-700" />

        {/* Categorias */}
        <section className="container mx-auto px-4 py-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 uppercase tracking-wide">
            Navegue por Categorias
          </h2>
          <p className="text-lg md:text-xl text-center text-gray-300 mb-8">
            Encontre exatamente o que define seu estilo
          </p>
          {/* Grid for md+ screens */}
          <div className="hidden md:grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Link
                key={category.id}
                to={`/categoria/${category.slug}`}
                className="group animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="bg-card border border-border overflow-hidden hover:border-primary transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
                  <div className="aspect-square bg-muted flex items-center justify-center p-8 overflow-hidden">
                    <img
                      src={category.image || logo}
                      alt={category.name}
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
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

          {/* Carousel for small screens */}
          <div className="md:hidden">
            <Carousel className="w-full">
              <CarouselContent>
                {categories.map((category, index) => (
                  <CarouselItem key={category.id}>
                    <Link to={`/categoria/${category.slug}`} className="block px-4">
                      <div className="mx-auto w-[85%] bg-card border border-border overflow-hidden rounded-lg">
                        <div className="aspect-square bg-muted flex items-center justify-center p-6 overflow-hidden">
                          <img
                            src={category.image || logo}
                            alt={category.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="p-4 text-center">
                          <h3 className="font-bold text-lg uppercase tracking-wide">
                            {category.name}
                          </h3>
                        </div>
                      </div>
                    </Link>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="flex items-center justify-between px-4 mt-4">
                <CarouselPrevious />
                <CarouselNext />
              </div>
            </Carousel>
          </div>
        </section>
        <Footer />
      </div>
    </div>
  );
};

export default Home;