import { apiFetch } from "./client";

export type CheckoutInput = {
  items: { productId: string; quantity: number }[];
  email?: string;
};

export type DemoOrderResponse = {
  success: boolean;
  orderId: string;
};

export function createDemoOrder(input: CheckoutInput): Promise<DemoOrderResponse> {
  return apiFetch<DemoOrderResponse>("/checkout/demo-order", {
    method: "POST",
    body: input,
  });
}
