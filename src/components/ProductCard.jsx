import React from "react";

export default function ProductCard({ p, onOpen, onAdd }) {
  return (
    <div className="pCard" onClick={() => onOpen(p)}>
      <div className="pTopRow">
        <span className="pBadge">NEW</span>
        <span className="muted">♡</span>
      </div>
      <img className="pImg" src={p.image} alt={p.title} />
      <div className="pTitle">{p.title}</div>
      <div className="pBottom">
        <div className="price">₹{Math.round(p.price * 80)}</div>
        <button
          className="pCartBtn"
          title="Add to cart"
          onClick={(e) => { e.stopPropagation(); onAdd(p); }}
        >
          🛒
        </button>
      </div>
    </div>
  );
}
