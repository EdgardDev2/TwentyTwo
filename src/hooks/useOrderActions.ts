import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type OrderItemInput = {
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
};

export const useOrderActions = () => {
  const qc = useQueryClient();

  const createOrderFn = async (payload: {
    customer_name: string;
    customer_email?: string | null;
    customer_phone?: string | null;
    items: OrderItemInput[];
  }) => {
    const { customer_name, customer_email, customer_phone, items } = payload;
    if (!items || items.length === 0) throw new Error("Nenhum item no pedido");

    const productIds = items.map((i) => i.product_id);

    const { data: dbProducts, error: prodErr } = await supabase
      .from("products")
      .select("id,stock")
      .in("id", productIds as string[]);

    if (prodErr) throw prodErr;

    const prodMap: Record<string, any> = {};
    (dbProducts || []).forEach((p: any) => (prodMap[p.id] = p));

    for (const it of items) {
      const p = prodMap[it.product_id];
      if (!p || p.stock < it.quantity) {
        throw new Error(`Estoque insuficiente para ${it.product_name}`);
      }
    }

    const total = items.reduce((s, i) => s + Number(i.price) * Number(i.quantity), 0);

    const { data: orderData, error: orderErr } = await supabase
      .from("orders")
      .insert({
        customer_name,
        customer_email: customer_email ?? null,
        customer_phone: customer_phone ?? null,
        total,
        status: "pending",
      })
      .select()
      .single();

    if (orderErr) throw orderErr;

    const orderId = orderData.id;

    const itemsToInsert = items.map((i) => ({
      order_id: orderId,
      product_id: i.product_id,
      product_name: i.product_name,
      quantity: i.quantity,
      price: i.price,
    }));

    const { error: itemsErr } = await supabase.from("order_items").insert(itemsToInsert);
    if (itemsErr) throw itemsErr;

    await Promise.all(
      items.map(async (it) => {
        const current = prodMap[it.product_id];
        const newStock = (current?.stock || 0) - it.quantity;
        await supabase.from("products").update({ stock: newStock }).eq("id", it.product_id);
      })
    );

    return orderData;
  };

  const createOrder = useMutation({
    mutationFn: createOrderFn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const cancelOrder = async (orderId: string) => {
    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select("product_id,quantity")
      .eq("order_id", orderId);

    if (itemsError) throw itemsError;

    for (const it of orderItems || []) {
      if (!it.product_id) continue;
      const { data: prodData } = await supabase
        .from("products")
        .select("stock")
        .eq("id", it.product_id)
        .single();
      const newStock = (prodData?.stock || 0) + it.quantity;
      await supabase.from("products").update({ stock: newStock }).eq("id", it.product_id);
    }

    const { error: orderErr } = await supabase.from("orders").update({ status: "cancelled" }).eq("id", orderId);
    if (orderErr) throw orderErr;

    qc.invalidateQueries({ queryKey: ["orders"] });
    qc.invalidateQueries({ queryKey: ["products"] });

    return true;
  };

  return { createOrder, cancelOrder };
};
