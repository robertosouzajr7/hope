"use client";

import { useEffect } from "react";
import { useCart } from "./cart";

// Empties the cart once the customer lands on a freshly created order.
export function ClearCart() {
  const { clear } = useCart();
  useEffect(() => clear(), [clear]);
  return null;
}
