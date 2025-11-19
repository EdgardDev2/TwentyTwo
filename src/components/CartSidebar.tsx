import { useCart } from "@/contexts/CartContext";
import { X, Trash2, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

interface CartSidebarProps {
  open: boolean;
  onClose: () => void;
}

export const CartSidebar = ({ open, onClose }: CartSidebarProps) => {
  const { items, updateQuantity, removeItem, getTotal } = useCart();
  const subtotal = getTotal();
  const shipping = 0;
  const total = subtotal + shipping;

  // Fechar com tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleWhatsAppCheckout = () => {
    if (items.length === 0) return;

    let message = "*Pedido Twenty Two*\n\n";
    items.forEach((item, index) => {
      message += `*${index + 1}. ${item.name}*\n`;
      if (item.size) message += `   Tamanho: ${item.size}\n`;
      if (item.color) message += `   Cor: ${item.color}\n`;
      message += `   Quantidade: ${item.quantity}\n`;
      message += `   Preço: R$ ${item.price.toFixed(2)}\n\n`;
    });
    message += `*Total: R$ ${total.toFixed(2)}*\n\nGostaria de finalizar este pedido!`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/5511933358701?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <>
      {/* Fundo semitransparente */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 h-screen w-screen sm:w-[480px] bg-background shadow-2xl z-50 border-l border-border flex flex-col transform transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-bold uppercase tracking-wide">
            Seu Carrinho
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Conteúdo principal */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <p className="text-muted-foreground text-center mt-20">
              Seu carrinho está vazio.
            </p>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 border border-border rounded-lg p-3 bg-card"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-contain bg-muted rounded"
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      R$ {item.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm w-6 text-center">
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
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
              </div>
            ))
          )}
        </div>

        {/* Rodapé fixo */}
        {items.length > 0 && (
          <div className="border-t border-border p-4 space-y-2 bg-background">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span className="font-medium">R$ {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Frete:</span>
              <span className="font-bold">GRÁTIS</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
              <span>Total:</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>

            <Button
              size="lg"
              className="w-full uppercase tracking-wide hover:scale-105 transition-transform mt-2"
              onClick={handleWhatsAppCheckout}
            >
              Finalizar no WhatsApp
            </Button>
          </div>
        )}
      </aside>
    </>
  );
};
