import React from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store/store.jsx";

export default function ProductModal({ open, onClose, p, onAdd }) {
  const { user } = useStore();
  const nav = useNavigate();

  if (!open || !p) return null;

  return (
    <div className="modal" onClick={(e) => { if (e.target.classList.contains("modal")) onClose(); }}>
      <div className="modalCard">
        <button className="x" onClick={onClose}>✕</button>
        <div className="modalBody">
          <img src={p.image} alt={p.title} />
          <div>
            <h2>{p.title}</h2>
            <div className="muted">Category: {p.category}</div>
            <p className="desc">{p.description}</p>
            <div className="row">
              <div className="price">₹{Math.round(p.price * 80)}</div>
              <button
                className="primary"
                onClick={() => {
                  if (!user) return nav("/login");
                  onAdd(p);
                  onClose();
                }}
              >
                {user ? "Add to Cart" : "Login to Add"}
              </button>
            </div>
            {!user && <div className="muted small mt8">Login required to add items.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
