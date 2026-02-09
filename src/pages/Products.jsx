import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { getCategories, getProducts } from "../api/fakestore.js";
import { useStore } from "../store/store.jsx";
import ProductCard from "../components/ProductCard.jsx";
import ProductModal from "../components/ProductModal.jsx";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function Products() {
  const q = useQuery();
  const categoryQ = q.get("category");
  const { user, addToCart } = useStore();

  const [cats, setCats] = useState([]);
  const [products, setProducts] = useState([]);
  const [active, setActive] = useState(null);

  const [category, setCategory] = useState(categoryQ || "");
  const [minP, setMinP] = useState("");
  const [maxP, setMaxP] = useState("");
  const [sort, setSort] = useState("popular");

  useEffect(() => {
    getCategories().then(setCats);
    getProducts().then(setProducts);
  }, []);

  useEffect(() => setCategory(categoryQ || ""), [categoryQ]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (category) list = list.filter(p => p.category === category);

    const minV = minP === "" ? null : Number(minP);
    const maxV = maxP === "" ? null : Number(maxP);
    if (minV !== null && !Number.isNaN(minV)) list = list.filter(p => p.price >= minV);
    if (maxV !== null && !Number.isNaN(maxV)) list = list.filter(p => p.price <= maxV);

    if (sort === "priceLow") list.sort((a,b) => a.price - b.price);
    if (sort === "priceHigh") list.sort((a,b) => b.price - a.price);
    if (sort === "name") list.sort((a,b) => a.title.localeCompare(b.title));
    return list;
  }, [products, category, minP, maxP, sort]);

  const guardedAdd = (p) => {
    if (!user) { alert("Please login to add items."); return; }
    addToCart(p);
  };

  return (
    <section className="view">
      <div className="catalog">
        <aside className="side">
          <div className="sideTitle">Category</div>
          <div className="sideList">
            <div className={`sideItem ${category === "" ? "active" : ""}`} onClick={() => setCategory("")}>All</div>
            {cats.map(c => (
              <div key={c} className={`sideItem ${category === c ? "active" : ""}`} onClick={() => setCategory(c)}>
                {c}
              </div>
            ))}
          </div>

          <div className="sideDivider" />

          <div className="sideTitle">Filter by</div>
          <div className="filterGroup">
            <div className="filterLabel">Price</div>
            <div className="priceRow">
              <input value={minP} onChange={(e) => setMinP(e.target.value)} type="number" placeholder="Min" />
              <input value={maxP} onChange={(e) => setMaxP(e.target.value)} type="number" placeholder="Max" />
            </div>
          </div>

          <button className="outline w100" onClick={() => { setMinP(""); setMaxP(""); setSort("popular"); }}>
            Clear
          </button>
        </aside>

        <section className="main">
          <div className="crumbs">
            <span className="muted">Main Page</span>
            <span className="muted">›</span>
            <span className="muted">Category</span>
            <span className="muted">›</span>
            <span>{category || "All"}</span>
          </div>

          <div className="catalogTop">
            <div>
              <h2 className="catalogTitle">{category || "Products"}</h2>
              <div className="chips">
                {category && <span className="chip">{category}</span>}
                {minP && <span className="chip">Min: {minP}</span>}
                {maxP && <span className="chip">Max: {maxP}</span>}
              </div>
            </div>

            <div className="sortRow">
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="popular">Sort by: Most Popular</option>
                <option value="priceLow">Price: Low to High</option>
                <option value="priceHigh">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>
          </div>

          <div className="gridRef">
            {filtered.map(p => (
              <ProductCard key={p.id} p={p} onOpen={setActive} onAdd={guardedAdd} />
            ))}
          </div>
        </section>
      </div>

      <ProductModal open={!!active} p={active} onClose={() => setActive(null)} onAdd={addToCart} />
    </section>
  );
}
