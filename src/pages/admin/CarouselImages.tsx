import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import logo from "@/assets/logo.png";

const CarouselImages = () => {
  const [images, setImages] = useState<Array<{ id: string; url: string }>>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const initial = [
      { id: "1", url: logo },
    ];
    setImages(initial);
  }, []);

  const handleAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected) return;
    const arr = Array.from(selected);
    setFiles((prev) => [...prev, ...arr].slice(0, 8));
    const previews = arr.map((f, idx) => ({ id: `${Date.now()}-${idx}`, url: URL.createObjectURL(f) }));
    setImages((prev) => [...prev, ...previews]);
  };

  const handleRemoveImage = (id: string) => {
    setImages((prev) => prev.filter((i) => i.id !== id));
  };

  const handleSave = async () => {
    setMessage("Salvando...");
    try {
      // TODO: Integrate with Supabase storage or your API to persist carousel images
      await new Promise((r) => setTimeout(r, 700));
      setMessage("Imagens do carrossel atualizadas com sucesso.");
      setFiles([]);
    } catch (err) {
      setMessage("Erro ao salvar. Verifique o console.");
      console.error(err);
    }
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Gerenciar Carrossel</h1>
          <Link to="/admin/dashboard" className="text-sm text-muted-foreground">
            Voltar ao dashboard
          </Link>
        </div>

        <p className="text-sm text-gray-300 mb-6">Faça upload e organize as imagens que aparecem no carrossel da página inicial.</p>

        <div className="mb-6">
          <input id="carousel-files" type="file" multiple accept="image/*" onChange={handleAddFiles} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {images.map((img) => (
            <div key={img.id} className="bg-card border border-border p-2 flex flex-col items-center">
              <div className="w-full aspect-video bg-muted flex items-center justify-center overflow-hidden">
                <img src={img.url} alt="preview" className="w-full h-full object-cover" />
              </div>
              <div className="w-full flex items-center justify-between mt-2">
                <span className="text-sm font-medium">{img.id}</span>
                <button className="text-sm text-red-400" onClick={() => handleRemoveImage(img.id)}>Remover</button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Button onClick={handleSave}>Salvar alterações</Button>
          {message && <span className="text-sm text-gray-300">{message}</span>}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CarouselImages;
