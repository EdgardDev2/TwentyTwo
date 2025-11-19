import { Instagram, Music, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">TWENTY TWO</h3>
            <p className="text-muted-foreground text-sm mb-4">
              As ruas vestem Twenty Two
            </p>
            <Link to="/admin/login">
              <Button variant="outline" size="sm" className="gap-2">
                <Shield className="h-4 w-4" />
                Admin
              </Button>
            </Link>
          </div>

          <div>

           
          </div>

          <div>
            <h4 className="font-bold mb-4 uppercase text-sm text-muted-foreground"></h4>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/twentytwo_imports/" className="hover:text-primary transition-all hover:scale-110">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          © 2025 Twenty Two Imports. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};
