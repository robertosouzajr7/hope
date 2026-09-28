"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

// Snapshot of the product at the time it was added. Prices are re-checked
// against the database when the order is created.
export type CartItem = {
  productId: number;
  slug: string;
  name: string;
  price: number;
  image: string | null;
  size?: string;
  color?: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
};

const STORAGE_KEY = "vocal-hope:cart:v2";

const CartContext = createContext<CartContextValue | null>(null);

export function itemKey(item: Pick<CartItem, "productId" | "size" | "color">) {
  return [item.productId, item.size ?? "", item.color ?? ""].join("|");
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: CartItem[] = JSON.parse(saved);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- restoring persisted state after hydration
        setItems(parsed.filter((i) => typeof i.productId === "number" && i.quantity > 0));
      }
    } catch {
      // Storage unavailable or corrupted: start with an empty cart.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage failures (private mode, quota).
    }
  }, [items, hydrated]);

  const add = useCallback<CartContextValue["add"]>((item, quantity = 1) => {
    setItems((current) => {
      const key = itemKey(item);
      const existing = current.find((i) => itemKey(i) === key);
      if (existing) {
        return current.map((i) =>
          itemKey(i) === key ? { ...i, quantity: i.quantity + quantity } : i,
        );
      }
      return [...current, { ...item, quantity }];
    });
    setIsOpen(true);
  }, []);

  const setQuantity = useCallback((key: string, quantity: number) => {
    setItems((current) =>
      quantity <= 0
        ? current.filter((i) => itemKey(i) !== key)
        : current.map((i) => (itemKey(i) === key ? { ...i, quantity } : i)),
    );
  }, []);

  const remove = useCallback((key: string) => {
    setItems((current) => current.filter((i) => itemKey(i) !== key));
  }, []);

  // Also wipes storage directly: a child's effect can run before the restore effect above.
  const clear = useCallback(() => {
    setItems([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, i) => sum + i.quantity, 0);
    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    return {
      items,
      count,
      total,
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      add,
      setQuantity,
      remove,
      clear,
    };
  }, [items, isOpen, add, setQuantity, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
