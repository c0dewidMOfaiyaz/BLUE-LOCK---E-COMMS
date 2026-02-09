import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import { StoreProvider } from "./store/store.jsx";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Categories from "./pages/Categories.jsx";
import Products from "./pages/Products.jsx";
import Cart from "./pages/Cart.jsx";

export default function App() {
  return (
    <StoreProvider>
      <Navbar />
      <main className="wrap">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/products" element={<Products />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </StoreProvider>
  );
}
