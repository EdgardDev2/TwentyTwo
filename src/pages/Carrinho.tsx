import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";

const Carrinho = () => {
  const { items, updateQuantity, removeItem, getTotal } = useCart();
  const [coupon, setCoupon] = useState("");
  const subtotal = getTotal();
  const shipping = 0; // Frete grátis
  const total = subtotal + shipping;

  const handleWhatsAppCheckout = () => {
    if (items.length === 0) return;

    let message = "*Pedido Twenty Two*\n\n";
    
    items.forEach((item, index) => {
      message += `*${index + 1}. ${item.name}*\n`;
      if (item.size) message += `   Tamanho: ${item.size}\n`;
      if (item.color) message += `   Cor: ${item.color}\n`;
      message += `   Quantidade: ${item.quantity}\n`;
      message += `   Preço: R$ ${item.price.toFixed(2)}\n`;
      message += `   Subtotal: R$ ${(item.price * item.quantity).toFixed(2)}\n\n`;
    });

    message += `*Resumo do Pedido:*\n`;
    message += `Subtotal: R$ ${subtotal.toFixed(2)}\n`;
    message += `Frete: GRÁTIS\n`;
    message += `*Total: R$ ${total.toFixed(2)}*\n\n`;
    message += `Gostaria de finalizar este pedido!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappNumber = "5511933358701";
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, "_blank");
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen">
        <Header />
        
        <main className="container mx-auto px-4 pt-24 pb-12">
          <div className="text-center py-20 animate-fade-in">
            <h1 className="text-4xl font-bold mb-4 uppercase tracking-wide animate-fade-in-up">Carrinho Vazio</h1>
            <p className="text-muted-foreground mb-8 animate-fade-in-up [animation-delay:200ms]">Adicione produtos para começar suas compras</p>
            <Button 
              onClick={() => window.location.href = "/catalogo"}
              className="animate-fade-in-up [animation-delay:400ms] hover:scale-105 transition-transform"
            >
              Ver Catálogo
            </Button>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <h1 className="text-4xl font-bold mb-2 uppercase tracking-wide animate-fade-in-up">Seu Carrinho</h1>
        <p className="text-muted-foreground mb-8 animate-fade-in-up [animation-delay:200ms]">Revise seus itens antes de finalizar</p>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => (
              <div 
                key={item.id} 
                className="bg-card border border-border p-6 animate-fade-in-up hover:border-primary transition-all"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex gap-6">
                  <img src={item.image} alt={item.name} className="w-24 h-24 object-contain bg-muted" />
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">{item.name}</h3>
                    <div className="flex gap-2 mb-3">
                      {item.size && (
                        <span className="text-xs px-2 py-1 bg-secondary rounded">Tamanho: {item.size}</span>
                      )}
                      {item.color && (
                        <span className="text-xs px-2 py-1 bg-secondary rounded">Cor: {item.color}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">Quantidade:</span>
                        <div className="flex items-center border border-border rounded">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Preço unitário</p>
                        <p className="font-bold">R$ {item.price.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-destructive"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="bg-card border border-border p-6 animate-fade-in-up [animation-delay:400ms]">
              <h2 className="text-xl font-bold mb-6 uppercase tracking-wide">Resumo do Pedido</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal ({items.length} {items.length === 1 ? 'item' : 'itens'})</span>
                  <span className="font-medium">R$ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Frete</span>
                  <span className="font-bold">GRÁTIS</span>
                </div>
              </div>

              <div className="mb-6">
                <label className="text-sm text-muted-foreground mb-2 block">Cupom de Desconto</label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Digite o cupom" 
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                  />
                  <Button variant="outline">Aplicar</Button>
                </div>
              </div>

              <div className="border-t border-border pt-4 mb-6">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>R$ {total.toFixed(2)}</span>
                </div>
              </div>

              <Button 
                size="lg" 
                className="w-full uppercase tracking-wide hover:scale-105 transition-transform"
                onClick={handleWhatsAppCheckout}
              >
                Finalizar no WhatsApp
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-3">
                Você será redirecionado para o WhatsApp para confirmar seu pedido
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Carrinho;
