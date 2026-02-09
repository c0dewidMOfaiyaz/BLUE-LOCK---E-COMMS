import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCategories } from "../api/fakestore.js";

export default function Categories() {
  const [cats, setCats] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    getCategories().then(setCats).catch(() => alert("Category load failed"));
  }, []);

  return (
    <section className="view">
      <div className="panel">
        <div className="panelHead">
          <h2>Categories</h2>
          <div className="muted">Choose a category to view products</div>
        </div>
        <div className="categoryGrid">
          {cats.map(c => (
            <div className="cat" key={c} onClick={() => nav(`/products?category=${encodeURIComponent(c)}`)}>
              <b>{c}</b>
              <div className="muted">Browse products in this category</div>
              <div className="pill mt8">View Products →</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
