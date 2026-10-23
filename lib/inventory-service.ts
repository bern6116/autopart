import { supabase } from "@/lib/supabase";

export function createIdempotencyKey(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

export async function checkoutOrder(input: {
  idempotencyKey: string;
  items: { product_id: string; sku: string; quantity: number }[];
  paymentMethod: "cod" | "card" | "online";
  deliveryMethod: "standard" | "express" | "pickup";
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: Record<string, string>;
}) {
  const { data, error } = await supabase.rpc("checkout_order", {
    p_idempotency_key: input.idempotencyKey,
    p_request: {
      items: input.items,
      payment_method: input.paymentMethod,
      delivery_method: input.deliveryMethod,
      customer_name: input.customerName,
      customer_email: input.customerEmail,
      customer_phone: input.customerPhone,
      shipping_address: input.shippingAddress,
    },
  });
  if (error) throw new Error(error.message);
  return data as { order_id: string; order_number: string; total: number; payment_status: string };
}

export async function adjustStock(input: { productId: string; quantityDelta: number; reason: string; idempotencyKey: string }) {
  const { data, error } = await supabase.rpc("adjust_stock", {
    p_product_id: input.productId,
    p_quantity_delta: input.quantityDelta,
    p_reason: input.reason,
    p_idempotency_key: input.idempotencyKey,
  });
  if (error) throw new Error(error.message);
  return data as { product_id: string; stock_before: number; stock_after: number };
}

export async function receivePurchase(input: { purchaseId: string; lines: { item_id: string; quantity: number }[]; idempotencyKey: string }) {
  const { data, error } = await supabase.rpc("receive_purchase", {
    p_purchase_id: input.purchaseId,
    p_idempotency_key: input.idempotencyKey,
    p_lines: input.lines,
  });
  if (error) throw new Error(error.message);
  return data as { purchase_id: string; status: string };
}

export async function cancelOrder(input: { orderId: string; reason: string; idempotencyKey: string }) {
  const { data, error } = await supabase.rpc("cancel_order", {
    p_order_id: input.orderId,
    p_idempotency_key: input.idempotencyKey,
    p_reason: input.reason,
  });
  if (error) throw new Error(error.message);
  return data as { order_id: string; status: "cancelled" };
}
