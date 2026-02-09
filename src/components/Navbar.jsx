import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useStore } from "../store/store.jsx";

export default function Navbar() {
  const { cartCount, user, logout } = useStore();
  const loc = useLocation();
  const nav = useNavigate();

  const active = (path) => (loc.pathname === path ? "navBtn active" : "navBtn");

  return (
    <header className="topbar">
      <div className="brand" onClick={() => nav("/")}>
        <img className="logoImg" src="/logo.jpg" alt="BLUE LOCK" />
        <div className="brandText">
          <div className="name">BLUE LOCK</div>
        </div>
      </div>

      <nav className="nav">
        <Link className={active("/")} to="/">Home</Link>
        <Link className={active("/categories")} to="/categories">Categories</Link>
        <Link className={active("/products")} to="/products">Products</Link>
        <Link className={active("/cart")} to="/cart">
          Cart <span className="badge">{cartCount}</span>
        </Link>

        {user ? (
          <button className="navBtn" onClick={() => { logout(); nav("/"); }}>
            Logout
          </button>
        ) : (
          <Link className={active("/login")} to="/login">Login</Link>
        )}
      </nav>
    </header>
  );
}
