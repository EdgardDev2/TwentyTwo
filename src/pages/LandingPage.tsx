import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import landing from "@/assets/Landing.jpeg";
import carousel1 from "@/assets/carousel1.jpeg";
import carousel2 from "@/assets/carousel2.jpeg";
import carousel3 from "@/assets/carousel3.jpeg";
import carousel4 from "@/assets/carousel4.jpeg";
import logo from "@/assets/logo.png";
import Instagram_logo from "@/assets/Instagram_logo.png";

export default function LandingPage() {
  const images = [landing,carousel1, carousel2, carousel3, carousel4];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % images.length), 5000);
    return () => clearInterval(id);
  }, [images.length]);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* slides */}
      {images.map((img, i) => (
        <div
          key={i}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
          style={{ backgroundImage: `url(${img})` }}
        />
      ))}

      {/* optional dim overlay for readability */}
      <div className="absolute inset-0 bg-black/30 z-10" />

      <div className="relative z-20 flex flex-col h-full">
        {/* TOP BAR */}
        <header className="w-full h-20 flex items-center justify-between px-6 bg-black/30 backdrop-blur-md shadow-lg">
          <img src={logo} alt="Logo" className="w-20 opacity-90" />

          <a
            href="https://www.instagram.com/twentytwo_imports/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-12 h-12 rounded-full bg-black/40 hover:bg-black/60 transition shadow-lg"
            aria-label="Instagram"
          >
            <img src={Instagram_logo} alt="Instagram Logo" className="w-8 h-8" />
            <i className="fa-brands fa-instagram text-white text-2xl"></i>
          </a>
        </header>

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
