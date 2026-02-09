import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const StoreCtx = createContext(null);

const CART_KEY = "bluelock_cart_v1";
const SAVED_KEY = "bluelock_saved_v1";
const USER_KEY = "bluelock_user";

const read = (k, fallback) => {
  try { return JSON.parse(localStorage.getItem(k)) ?? fallback; }
  catch { return fallback; }
};
const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));

export function StoreProvider({ children }) {
  const [user, setUser] = useState(() => read(USER_KEY, null));
  const [cart, setCart] = useState(() => read(CART_KEY, []));
  const [saved, setSaved] = useState(() => read(SAVED_KEY, []));

  useEffect(() => write(USER_KEY, user), [user]);
  useEffect(() => write(CART_KEY, cart), [cart]);
  useEffect(() => write(SAVED_KEY, saved), [saved]);

  const cartCount = useMemo(() => cart.reduce((s, i) => s + i.qty, 0), [cart]);
  const subtotal = useMemo(() => cart.reduce((s, i) => s + i.qty * i.price, 0), [cart]);

  const login = (email) => setUser({ email });
  const logout = () => setUser(null);

  const addToCart = (p) => {
    setCart(prev => {
      const found = prev.find(x => x.id === p.id);
      if (found) return prev.map(x => x.id === p.id ? { ...x, qty: x.qty + 1 } : x);
      return [...prev, { id: p.id, title: p.title, price: p.price, image: p.image, qty: 1 }];
    });
  };

  const changeQty = (id, delta) => {
    setCart(prev => {
      const next = prev.map(x => x.id === id ? { ...x, qty: x.qty + delta } : x);
      return next.filter(x => x.qty > 0);
    });
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(x => x.id !== id));
  const clearCart = () => setCart([]);

  const toggleSave = (id, from) => {
    if (from === "cart") {
      const item = cart.find(x => x.id === id);
      if (!item) return;
      setCart(prev => prev.filter(x => x.id !== id));
      setSaved(prev => [...prev, item]);
    } else {
      const item = saved.find(x => x.id === id);
      if (!item) return;
      setSaved(prev => prev.filter(x => x.id !== id));
      setCart(prev => [...prev, item]);
    }
  };

  const removeSaved = (id) => setSaved(prev => prev.filter(x => x.id !== id));

  const value = {
    user, cart, saved, cartCount, subtotal,
    login, logout,
    addToCart, changeQty, removeFromCart, clearCart,
    toggleSave, removeSaved
  };

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export const useStore = () => useContext(StoreCtx);
