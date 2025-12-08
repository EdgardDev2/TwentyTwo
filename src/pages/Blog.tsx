import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import img1 from "@/assets/carousel1.jpeg";
import img2 from "@/assets/carousel2.jpeg";
import img3 from "@/assets/carousel3.jpeg";
import img4 from "@/assets/carousel4.jpeg";

const Blog = () => {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 pt-24 pb-12">
        <section className="max-w-4xl mx-auto py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-8 uppercase tracking-wide text-muted-foreground animate-fade-in-up">
            História Twenty Two
          </h1>

          <div className="space-y-6 text-muted-foreground leading-relaxed">
            <p className="text-lg animate-fade-in-up [animation-delay:200ms] hover:text-foreground transition-colors">
              Nascida nas ruas, Twenty Two é mais do que moda — é uma expressão da cultura urbana,
              da rebeldia e da autenticidade. Desde 2022, curamos peças que contam histórias e
              conectam comunidades.
            </p>

            <p className="text-lg animate-fade-in-up [animation-delay:400ms] hover:text-foreground transition-colors">
              Cada produto é selecionado para representar o espírito das ruas, onde a moda encontra a
              identidade e a exclusividade encontra a acessibilidade. Twenty Two não segue tendências —
              nós as criamos.
            </p>
          </div>

          {/* CARROSSEL */}
          <div className="mt-16 w-full max-w-3xl mx-auto">
            <Carousel className="w-full">
              <CarouselContent>
                <CarouselItem className="basis-full">
                  <img src={img1} className="rounded-xl w-full h-[450px] md:h-[710px] object-cover shadow-lg" />
                </CarouselItem>

                <CarouselItem className="basis-full">
                  <img src={img2} className="rounded-xl w-full h-[450px] md:h-[710px] object-cover shadow-lg" />
                </CarouselItem>

                <CarouselItem className="basis-full">
                  <img src={img3} className="rounded-xl w-full h-[450px] md:h-[710px] object-cover shadow-lg" />
                </CarouselItem>

                <CarouselItem className="basis-full">
                  <img src={img4} className="rounded-xl w-full h-[450px] md:h-[710px] object-cover shadow-lg" />
                </CarouselItem>
              </CarouselContent>

              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
          {/* FIM DO CARROSSEL */}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
