import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts } from "../api/fakestore.js";
import { useStore } from "../store/store.jsx";
import ProductCard from "../components/ProductCard.jsx";
import ProductModal from "../components/ProductModal.jsx";

export default function Home() {
  const nav = useNavigate();
  const { user, addToCart } = useStore();

  const [products, setProducts] = useState([]);
  const [active, setActive] = useState(null);

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(() => alert("API load failed. Check internet."));
  }, []);

  const offers = useMemo(() => products.slice(0, 6), [products]);
  const recommended = useMemo(() => products.slice(6, 14), [products]);

  const guardedAdd = (p) => {
    if (!user) {
      alert("Please login to add items to cart.");
      nav("/login");
      return;
    }
    addToCart(p);
  };

  return (
    <section className="view">
      {/* Centered hero */}
      <div className="hero heroCenter">
        <h1>SHOP SMARTER WITH BLUE LOCK</h1>

        <div className="ctaRow">
          <button className="primary" onClick={() => nav("/categories")}>
            Browse Categories
          </button>
          {!user && (
            <button className="outline" onClick={() => nav("/login")}>
              Pease Login to Shop
            </button>
          )}
        </div>

        {/* Small promo cards (optional, looks nice and fills space) */}
        <div className="adStrip heroAds">
          <div className="adCard">
            <div className="adTitle">⚡ Flash Deals</div>
            <div className="muted">Top Picks For You</div>
          </div>
          <div className="adCard">
            <div className="adTitle">🚚 Free Delivery </div>
            <div className="muted">On Checkout</div>
          </div>
          <div className="adCard">
            <div className="adTitle">🎁 Offer Bundles</div>
            <div className="muted">Modern Catalog </div>
          </div>
        </div>

        {/* Offers centered */}
        <div className="panel mt heroOffers">
          <div className="panelHead center">
            <h2>🔥 Offers</h2>
            <div className="muted">Products on Sale</div>
          </div>

          <div className="gridRef">
            {offers.map((p) => (
              <ProductCard key={p.id} p={p} onOpen={setActive} onAdd={guardedAdd} />
            ))}
          </div>
        </div>
      </div>

      {/* Recommended */}
      <div className="panel mt">
        <div className="panelHead">
          <h2>Recommended For You</h2>
          <div className="muted">Click any product to view details</div>
        </div>

        <div className="gridRef">
          {recommended.map((p) => (
            <ProductCard key={p.id} p={p} onOpen={setActive} onAdd={guardedAdd} />
          ))}
        </div>
      </div>

      {/* Modal */}
      <ProductModal
        open={!!active}
        p={active}
        onClose={() => setActive(null)}
        onAdd={addToCart}
      />
    </section>
  );
}
