import { Link } from "react-router-dom";
import bgImage from "@/assets/Landing.jpeg";
import logo from "@/assets/logo.png";
import Instagram_logo from "@/assets/Instagram_logo.png";

export default function LandingPage() {
  return (
    <div
      className="h-screen w-full bg-cover bg-center bg-no-repeat flex flex-col"
      style={{
        backgroundImage: `url(${bgImage})`,
      }}
    >
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

      {/* CONTENT */}
      <div className="flex flex-col items-center justify-center text-center flex-1 px-4 bg-black/40 backdrop-blur-sm">
        <img src={logo} alt="Logo" className="w-40 md:w-56 mb-6 opacity-90 drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]" />

        <p className="text-white text-xl mt-2 tracking-wide">
          AS RUAS VESTEM TWENTY TWO
        </p>

        {/* BOTÃO */}
        <div className="mt-10 w-full flex justify-center">
          <Link
            to="/home"
            className="bg-white/20 backdrop-blur-md text-white font-semibold text-lg px-8 py-3 rounded-xl shadow-lg border border-white/30 hover:bg-white/30 hover:scale-105 transition"

          >
            Visite a nossa loja
          </Link>
        </div>
      </div>
    </div>
  );
}
